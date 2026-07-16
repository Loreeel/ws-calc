(function () {
  var TARGET_STAT_FIELDS = [
    { id: "physDef", label: "Physical Defense (ДФ физ.)" },
    { id: "magicDef", label: "Magic Defense (ДФ маг.)" },
    { id: "resilience", label: "Устойчивость, %" },
    { id: "flatReduction", label: "Прямой срез урона (резист)" }
  ];

  var fieldsBuilt = false;

  function renderChips(state) {
    var root = document.getElementById("targetSelect");
    root.innerHTML = "";

    WS_TARGETS.forEach(function (t) {
      var chip = document.createElement("button");
      chip.className = "class-chip" + (state.targetId === t.id ? " is-selected" : "");
      chip.textContent = t.name;
      chip.addEventListener("click", function () {
        WsState.set({ targetId: t.id });
      });
      root.appendChild(chip);
    });
  }

  function buildStatsFields(state) {
    var root = document.getElementById("targetStatsFields");
    root.innerHTML = "";

    var grid = document.createElement("div");
    grid.className = "field-grid";

    TARGET_STAT_FIELDS.forEach(function (f) {
      var wrap = document.createElement("div");
      wrap.className = "field";

      var label = document.createElement("label");
      label.textContent = f.label;
      label.setAttribute("for", "target_" + f.id);

      var input = document.createElement("input");
      input.type = "number";
      input.id = "target_" + f.id;
      input.value = state.targetStats[f.id] || 0;

      input.addEventListener("input", function () {
        WsState.setTargetStat(f.id, Number(input.value) || 0);
      });

      wrap.appendChild(label);
      wrap.appendChild(input);
      grid.appendChild(wrap);
    });

    root.appendChild(grid);
    fieldsBuilt = true;
  }

  function syncStatsFields(state) {
    TARGET_STAT_FIELDS.forEach(function (f) {
      var input = document.getElementById("target_" + f.id);
      if (input && document.activeElement !== input) {
        input.value = state.targetStats[f.id] || 0;
      }
    });
  }

  // Дебаффы на цели (напр. Яростное пламя у Мага) — увеличивают входящий урон ОТ ЛЮБОГО
  // навыка, выбираются здесь (не в карточке навыка), со своим уровнем 1-4. См.
  // skill.debuffDamageTakenByLevel в data/classes/*/skills.js и js/formulas.js
  // getTargetDebuffDamageBonusPercent.
  function getAvailableDebuffSkills(classId) {
    var classDef = WS_CLASSES.find(function (c) { return c.id === classId; });
    var skills = (classDef && classDef.skills) || [];
    return skills.filter(function (s) { return s.debuffDamageTakenByLevel; });
  }

  function buildDebuffsSection(state) {
    var root = document.getElementById("targetDebuffsFields");
    if (!root) return;
    root.innerHTML = "";

    var debuffSkills = getAvailableDebuffSkills(state.classId);
    if (debuffSkills.length === 0) return;

    var heading = document.createElement("h3");
    heading.className = "panel__subtitle";
    heading.textContent = "Дебаффы на цели (доп. урон)";
    root.appendChild(heading);

    var list = document.createElement("div");
    list.className = "option-list";

    debuffSkills.forEach(function (skill) {
      var cfg = state.targetDebuffs[skill.id] || { active: false, level: 1 };
      var levels = Object.keys(skill.debuffDamageTakenByLevel).map(Number).sort(function (a, b) { return a - b; });
      var maxLevel = levels[levels.length - 1];

      var row = document.createElement("label");
      row.className = "option-row";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "target_debuff_" + skill.id;
      checkbox.checked = !!cfg.active;
      checkbox.addEventListener("change", function () {
        WsState.setTargetDebuff(skill.id, { active: checkbox.checked });
      });
      row.appendChild(checkbox);

      var name = document.createElement("span");
      name.className = "option-row__name";
      name.textContent = skill.name;
      row.appendChild(name);

      var stepper = document.createElement("div");
      stepper.className = "talent-stepper";

      var minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "secondary";
      minusBtn.textContent = "−";
      minusBtn.addEventListener("click", function () {
        var cur = (state.targetDebuffs[skill.id] || {}).level || 1;
        WsState.setTargetDebuff(skill.id, { level: Math.max(1, cur - 1) });
      });

      var levelLabel = document.createElement("span");
      levelLabel.id = "target_debuff_level_" + skill.id;
      levelLabel.className = "talent-stepper__level";

      var plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "secondary";
      plusBtn.textContent = "+";
      plusBtn.addEventListener("click", function () {
        var cur = (state.targetDebuffs[skill.id] || {}).level || 1;
        WsState.setTargetDebuff(skill.id, { level: Math.min(maxLevel, cur + 1) });
      });

      stepper.appendChild(minusBtn);
      stepper.appendChild(levelLabel);
      stepper.appendChild(plusBtn);
      row.appendChild(stepper);

      var suffix = document.createElement("span");
      suffix.className = "buff-suffix";
      suffix.id = "target_debuff_percent_" + skill.id;
      row.appendChild(suffix);

      list.appendChild(row);
    });

    root.appendChild(list);
  }

  function syncDebuffsSection(state) {
    var debuffSkills = getAvailableDebuffSkills(state.classId);
    debuffSkills.forEach(function (skill) {
      var cfg = state.targetDebuffs[skill.id] || { active: false, level: 1 };

      var checkbox = document.getElementById("target_debuff_" + skill.id);
      if (checkbox) checkbox.checked = !!cfg.active;

      var levelLabel = document.getElementById("target_debuff_level_" + skill.id);
      var levels = Object.keys(skill.debuffDamageTakenByLevel).map(Number).sort(function (a, b) { return a - b; });
      var maxLevel = levels[levels.length - 1];
      if (levelLabel) {
        levelLabel.textContent = (cfg.level || 1) + " / " + maxLevel;
        var stepperEl = levelLabel.parentElement;
        if (stepperEl) {
          stepperEl.querySelectorAll("button").forEach(function (btn, i) {
            btn.disabled = i === 0 ? (cfg.level || 1) <= 1 : (cfg.level || 1) >= maxLevel;
          });
        }
      }

      var suffix = document.getElementById("target_debuff_percent_" + skill.id);
      if (suffix) {
        var percent = WsFormulas.getTargetDebuffDamageBonusPercent(Object.assign({}, state, {
          targetDebuffs: (function () {
            var only = {};
            only[skill.id] = cfg;
            return only;
          })()
        }));
        suffix.textContent = cfg.active ? "+" + (Math.round(percent * 100) / 100) + "% урона по цели" : "неактивен";
      }
    });
  }

  function render() {
    var state = WsState.get();
    renderChips(state);

    if (!fieldsBuilt) buildStatsFields(state);
    else syncStatsFields(state);

    buildDebuffsSection(state);
    syncDebuffsSection(state);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
