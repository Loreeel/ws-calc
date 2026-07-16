(function () {
  var lastCacheKey = null;

  var GROUP_LABELS = {
    meta: null,
    attack: "Экипировка",
    defense: "Защита"
  };

  // Ряд 2 группы "Атака" — не зависит от типа урона класса.
  var ATTACK_ROW2 = ["penetrationPower", "skillPower", "critDamagePower", "autoAttackPower", "depthsWrath"];

  function allDefsFlat() {
    return [].concat(WS_STATS.meta, WS_STATS.attack, WS_STATS.defense);
  }

  function findDef(id) {
    return allDefsFlat().find(function (d) { return d.id === id; });
  }

  function getDamageTypes(classId) {
    var cls = WS_CLASSES.find(function (c) { return c.id === classId; });
    return (cls && cls.damageTypes) || ["physical", "magic"];
  }

  var TYPE_LABELS = { physical: "Физ.", magic: "Маг." };

  // Ячейка сетки "ДД" (см. data/damage-grid.js), привязана к слоту экипировки.
  // locked — слот структурно не даёт ДД (напр. Шлем): поле неактивно всегда.
  // magicOnly — слот даёт ДД только классам с магическим уроном (Доспех/Перчатки/Пояс):
  //   жёстко типа "magic" (без выбора типа), недоступен классам без магии.
  // Иначе: для классов с двумя типами урона — свой выбор типа на ячейку (как у баффов).
  // mode "choice" даёт ещё выбор фикс./% ДД, mode "fixed" — только число.
  function buildGridCell(cell, damageTypes, state) {
    var cfg = state.damageGrid[cell.id];
    var unavailable = cell.locked || (cell.magicOnly && damageTypes.indexOf("magic") === -1);

    var wrap = document.createElement("div");
    wrap.className = "field dd-cell" + (unavailable ? " dd-cell--unavailable" : "");

    var label = document.createElement("label");
    label.textContent = cell.name || "—";
    if (cell.locked) label.title = "В этом слоте не бывает ДД";
    else if (unavailable) label.title = "Доступно только классам с магическим уроном";
    wrap.appendChild(label);

    var controls = document.createElement("div");
    controls.className = "dd-cell__controls";

    if (unavailable) {
      var lockedInput = document.createElement("input");
      lockedInput.type = "number";
      lockedInput.className = "dd-cell__value";
      lockedInput.disabled = true;
      controls.appendChild(lockedInput);
      wrap.appendChild(controls);
      return wrap;
    }

    if (!cell.magicOnly && damageTypes.length > 1) {
      var typeSelect = document.createElement("select");
      typeSelect.className = "dd-cell__select";
      damageTypes.forEach(function (type) {
        var opt = document.createElement("option");
        opt.value = type;
        opt.textContent = TYPE_LABELS[type];
        typeSelect.appendChild(opt);
      });
      typeSelect.value = cfg.type;
      typeSelect.addEventListener("change", function () {
        WsState.setDamageGridCell(cell.id, { type: typeSelect.value });
      });
      controls.appendChild(typeSelect);
    }

    if (cell.mode === "dual") {
      // Фиксированный ДД и % ДД одновременно — два отдельных поля, без выбора режима.
      var fixWrap = document.createElement("span");
      fixWrap.className = "dd-cell__dual-field";
      var fixTag = document.createElement("span");
      fixTag.className = "dd-cell__dual-tag";
      fixTag.textContent = "Фикс.";
      var fixInput = document.createElement("input");
      fixInput.type = "number";
      fixInput.className = "dd-cell__value";
      fixInput.value = cfg.value;
      fixInput.addEventListener("input", function () {
        WsState.setDamageGridCell(cell.id, { value: Number(fixInput.value) || 0 });
      });
      fixWrap.appendChild(fixTag);
      fixWrap.appendChild(fixInput);
      controls.appendChild(fixWrap);

      var pctWrap = document.createElement("span");
      pctWrap.className = "dd-cell__dual-field";
      var pctTag = document.createElement("span");
      pctTag.className = "dd-cell__dual-tag";
      pctTag.textContent = "%";
      var pctInput = document.createElement("input");
      pctInput.type = "number";
      pctInput.className = "dd-cell__value";
      pctInput.value = cfg.percentValue;
      pctInput.addEventListener("input", function () {
        WsState.setDamageGridCell(cell.id, { percentValue: Number(pctInput.value) || 0 });
      });
      pctWrap.appendChild(pctTag);
      pctWrap.appendChild(pctInput);
      controls.appendChild(pctWrap);

      wrap.appendChild(controls);
      return wrap;
    }

    if (cell.mode === "choice") {
      var modeSelect = document.createElement("select");
      modeSelect.className = "dd-cell__select";
      [["fixed", "Фикс."], ["percent", "%"]].forEach(function (pair) {
        var opt = document.createElement("option");
        opt.value = pair[0];
        opt.textContent = pair[1];
        modeSelect.appendChild(opt);
      });
      modeSelect.value = cfg.mode;
      modeSelect.addEventListener("change", function () {
        WsState.setDamageGridCell(cell.id, { mode: modeSelect.value });
      });
      controls.appendChild(modeSelect);
    }

    var input = document.createElement("input");
    input.type = "number";
    input.className = "dd-cell__value";
    input.value = cfg.value;
    input.addEventListener("input", function () {
      WsState.setDamageGridCell(cell.id, { value: Number(input.value) || 0 });
    });
    controls.appendChild(input);

    wrap.appendChild(controls);
    return wrap;
  }

  var TYPE_NAMES = { physical: "физ.", magic: "маг." };

  // Обычный режим экипировки: один агрегированный фикс. + % ДД на тип урона класса
  // (вместо ввода по каждому предмету). Продвинутый режим — детальная сетка (15 полей).
  function renderEquipmentModeToggle(root, state) {
    var toggleRow = document.createElement("div");
    toggleRow.className = "subtabs";

    [["basic", "Обычный"], ["advanced", "Продвинутый"]].forEach(function (pair) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "subtab" + (state.equipmentMode === pair[0] ? " is-active" : "");
      btn.textContent = pair[1];
      btn.addEventListener("click", function () {
        if (state.equipmentMode === pair[0]) return;
        WsState.setEquipmentMode(pair[0]);
      });
      toggleRow.appendChild(btn);
    });

    root.appendChild(toggleRow);
  }

  function buildAggregateField(labelText, value, onChange) {
    var wrap = document.createElement("div");
    wrap.className = "field";

    var label = document.createElement("label");
    label.textContent = labelText;
    wrap.appendChild(label);

    var input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.addEventListener("input", function () {
      onChange(Number(input.value) || 0);
    });
    wrap.appendChild(input);

    return wrap;
  }

  function renderEquipmentAggregate(root, damageTypes, state) {
    var grid = document.createElement("div");
    grid.className = "field-grid";

    damageTypes.forEach(function (type) {
      var typeSuffix = damageTypes.length > 1 ? " (" + TYPE_NAMES[type] + ")" : "";
      var agg = state.equipmentAggregate[type];

      grid.appendChild(buildAggregateField("Фиксированный урон экипировки" + typeSuffix, agg.fixed, function (value) {
        WsState.setEquipmentAggregate(type, { fixed: value });
      }));
      grid.appendChild(buildAggregateField("% ДД экипировки" + typeSuffix, agg.percent, function (value) {
        WsState.setEquipmentAggregate(type, { percent: value });
      }));
    });

    root.appendChild(grid);
  }

  function renderDamageGrid(root, damageTypes, state) {
    // Для классов с одним типом урона незаблокированные не-magicOnly ячейки жёстко
    // фиксируются на нём (magicOnly уже жёстко на "magic" по умолчанию, locked не важен).
    if (damageTypes.length === 1) {
      WS_DAMAGE_GRID.forEach(function (cell) {
        if (cell.locked || cell.magicOnly) return;
        if (state.damageGrid[cell.id].type !== damageTypes[0]) {
          state.damageGrid[cell.id].type = damageTypes[0];
        }
      });
    }

    var grid = document.createElement("div");
    grid.className = "dd-grid";
    WS_DAMAGE_GRID.forEach(function (cell) {
      grid.appendChild(buildGridCell(cell, damageTypes, state));
    });
    root.appendChild(grid);
  }

  function buildField(def, state, labelText) {
    var wrap = document.createElement("div");
    wrap.className = "field";

    var label = document.createElement("label");
    label.textContent = (labelText || def.name) + (def.cap != null ? " (макс. " + def.cap + ")" : "");
    label.setAttribute("for", "stat_" + def.id);
    if (def.note) label.title = def.note;

    var input = document.createElement("input");
    input.type = "number";
    input.id = "stat_" + def.id;
    input.value = state.stats[def.id] != null ? state.stats[def.id] : (def.default || 0);
    if (def.min != null) input.min = def.min;
    if (def.max != null) input.max = def.max;
    if (def.cap != null) input.max = def.cap;
    if (def.note) input.title = def.note;

    input.addEventListener("input", function () {
      WsState.setStat(def.id, Number(input.value) || 0);
    });

    wrap.appendChild(label);
    wrap.appendChild(input);
    return wrap;
  }

  function renderFieldsRow(root, ids, state, labelOverrides) {
    var grid = document.createElement("div");
    grid.className = "field-grid";
    ids.forEach(function (id) {
      var def = findDef(id);
      if (!def) return;
      grid.appendChild(buildField(def, state, labelOverrides && labelOverrides[id]));
    });
    root.appendChild(grid);
  }

  function renderHeading(root, groupKey) {
    var label = GROUP_LABELS[groupKey];
    if (!label) return;
    var heading = document.createElement("h3");
    heading.style.fontSize = "12px";
    heading.style.color = "var(--text-muted)";
    heading.style.margin = "14px 0 6px";
    heading.textContent = label;
    root.appendChild(heading);
  }

  function renderGroup(root, groupKey, defs, state) {
    if (defs.length === 0) return;

    renderHeading(root, groupKey);

    var grid = document.createElement("div");
    grid.className = "field-grid";
    defs.forEach(function (def) { grid.appendChild(buildField(def, state)); });
    root.appendChild(grid);
  }

  function render() {
    var root = document.getElementById("statsPanel");
    var state = WsState.get();
    var envMode = state.envMode;

    // Не перестраиваем DOM на каждое изменение стата (иначе теряется фокус ввода),
    // только когда меняется prod/dev, класс (влияет на видимость полей физ./маг. урона
    // через damageTypes) или режим ввода экипировки (обычный/продвинутый).
    var cacheKey = envMode + "|" + state.classId + "|" + state.equipmentMode;
    if (cacheKey === lastCacheKey) return;
    lastCacheKey = cacheKey;

    root.innerHTML = "";

    renderGroup(root, "meta", WS_STATS.meta, state);

    renderHeading(root, "attack");
    renderEquipmentModeToggle(root, state);

    var damageTypes = getDamageTypes(state.classId);
    if (state.equipmentMode === "basic") {
      renderEquipmentAggregate(root, damageTypes, state);
    } else {
      renderDamageGrid(root, damageTypes, state);
    }

    var extraHeading = document.createElement("h3");
    extraHeading.className = "dd-extra-heading";
    extraHeading.textContent = "Дополнительные ДД характеристики";

    var extraHint = document.createElement("span");
    extraHint.className = "info-hint";
    extraHint.textContent = "?";
    extraHint.title = "На данный момент подсчёт параметров из талантов и экипировки не реализован, поэтому вводите реальные параметры своего персонажа из игры.";
    extraHeading.appendChild(extraHint);

    root.appendChild(extraHeading);
    renderFieldsRow(root, ATTACK_ROW2, state);

    if (envMode === "dev") {
      var devNote = document.createElement("p");
      devNote.className = "panel__hint";
      devNote.style.marginTop = "14px";
      devNote.textContent = "Защита: функционал не откалиброван, значения ориентировочные (dev-режим).";
      root.appendChild(devNote);
      renderGroup(root, "defense", WS_STATS.defense, state);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
