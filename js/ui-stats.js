(function () {
  var lastMode = null;

  var GROUP_LABELS = {
    meta: null,
    attack: "Атака",
    defense: "Защита"
  };

  // Ряды группы "Атака". Базовый режим: физ./маг. атака одним полем.
  // Продвинутый режим: физ./маг. атака делится на числовое + процентное (4 поля в 1-м ряду).
  // Остальные "продвинутые" поля (Attack Strength, Ferocity, Penetration, Accuracy, Rage,
  // Attack Speed, Life Steal, Expertise, Energy/Regen) пока убраны из интерфейса — статы
  // сохранены в data/stats.js и в состоянии, просто временно не редактируются через UI.
  var ATTACK_ROW1_BASIC = ["physPower", "magicPower"];
  var ATTACK_ROW1_ADVANCED = ["physPower", "physPowerPercent", "magicPower", "magicPowerPercent"];
  var ATTACK_ROW2 = ["penetrationPower", "skillPower", "critDamagePower", "autoAttackPower"];

  function allDefsFlat() {
    return [].concat(WS_STATS.meta, WS_STATS.attack, WS_STATS.defense);
  }

  function findDef(id) {
    return allDefsFlat().find(function (d) { return d.id === id; });
  }

  function buildField(def, state) {
    var wrap = document.createElement("div");
    wrap.className = "field";

    var label = document.createElement("label");
    label.textContent = def.name + (def.cap != null ? " (макс. " + def.cap + ")" : "");
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

  function renderFieldsRow(root, ids, state) {
    var grid = document.createElement("div");
    grid.className = "field-grid";
    ids.forEach(function (id) {
      var def = findDef(id);
      if (!def) return;
      grid.appendChild(buildField(def, state));
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

  function renderGroup(root, groupKey, defs, state, mode) {
    var visibleDefs = defs.filter(function (def) { return mode === "advanced" || def.basic === true; });
    if (visibleDefs.length === 0) return;

    renderHeading(root, groupKey);

    var grid = document.createElement("div");
    grid.className = "field-grid";
    visibleDefs.forEach(function (def) { grid.appendChild(buildField(def, state)); });
    root.appendChild(grid);
  }

  function render() {
    var root = document.getElementById("statsPanel");
    var state = WsState.get();
    var mode = state.mode;
    var envMode = state.envMode;

    // Не перестраиваем DOM на каждое изменение стата (иначе теряется фокус ввода),
    // только когда меняется режим базовый/продвинутый или prod/dev.
    var cacheKey = mode + "|" + envMode;
    if (cacheKey === lastMode) return;
    lastMode = cacheKey;

    root.innerHTML = "";

    renderGroup(root, "meta", WS_STATS.meta, state, mode);

    renderHeading(root, "attack");
    renderFieldsRow(root, mode === "advanced" ? ATTACK_ROW1_ADVANCED : ATTACK_ROW1_BASIC, state);
    renderFieldsRow(root, ATTACK_ROW2, state);

    if (envMode === "dev") {
      var devNote = document.createElement("p");
      devNote.className = "panel__hint";
      devNote.style.marginTop = "14px";
      devNote.textContent = "Защита: функционал не откалиброван, значения ориентировочные (dev-режим).";
      root.appendChild(devNote);
      renderGroup(root, "defense", WS_STATS.defense, state, mode);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
