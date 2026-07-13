(function () {
  var lastCacheKey = null;

  var GROUP_LABELS = {
    meta: null,
    attack: "Атака",
    defense: "Защита"
  };

  // Ряд 2 группы "Атака" — не зависит от типа урона класса.
  var ATTACK_ROW2 = ["penetrationPower", "skillPower", "critDamagePower", "autoAttackPower"];

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

  // Физ./маг. атака всегда делится на "fix" (число) + "%" (неотключаемые % бонусы) —
  // для корректного расчёта их всё равно нужно вводить отдельно (см. getPowerBreakdown).
  // Показываются только типы урона, которые использует выбранный класс (damageTypes).
  function getAttackRow1(damageTypes) {
    var ids = [];
    var labelOverrides = {};

    if (damageTypes.indexOf("physical") !== -1) {
      ids.push("physPower");
      labelOverrides.physPower = "Physical Power, fix";
      ids.push("physPowerPercent");
    }
    if (damageTypes.indexOf("magic") !== -1) {
      ids.push("magicPower");
      labelOverrides.magicPower = "Magic Power, fix";
      ids.push("magicPowerPercent");
    }

    return { ids: ids, labelOverrides: labelOverrides };
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
    // только когда меняется prod/dev или класс (влияет на видимость полей физ./маг.
    // урона через damageTypes).
    var cacheKey = envMode + "|" + state.classId;
    if (cacheKey === lastCacheKey) return;
    lastCacheKey = cacheKey;

    root.innerHTML = "";

    renderGroup(root, "meta", WS_STATS.meta, state);

    renderHeading(root, "attack");
    var row1 = getAttackRow1(getDamageTypes(state.classId));
    renderFieldsRow(root, row1.ids, state, row1.labelOverrides);
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
