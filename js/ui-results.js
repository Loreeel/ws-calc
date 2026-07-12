(function () {
  var lastSkillsClassId = undefined;

  function renderSummary(effStats) {
    var summaryRoot = document.getElementById("resultsSummary");
    summaryRoot.innerHTML = "";

    [
      ["physPower", "Physical Power"],
      ["magicPower", "Magic Power"],
      ["physPenetration", "Physical Penetration, %"],
      ["magicPenetration", "Magic Penetration, %"],
      ["physResistance", "Physical Resistance"],
      ["magicResistance", "Magic Resistance"],
      ["hp", "Health"]
    ].forEach(function (pair) {
      var row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML =
        '<span class="stat-row__label">' + pair[1] + '</span>' +
        '<span class="stat-row__value">' + Math.round(effStats[pair[0]] * 100) / 100 + '</span>';
      summaryRoot.appendChild(row);
    });
  }

  function relicOptionsFor(cfg) {
    // Реликвии, которые ещё можно добавить: либо их ещё нет на навыке, либо они
    // стакаются и не достигли maxStacks.
    return WS_RELICS.filter(function (relic) {
      var existing = cfg.relics.find(function (r) { return r.id === relic.id; });
      if (!existing) return true;
      return relic.stackable && existing.stacks < relic.maxStacks;
    });
  }

  function buildRelicsCell(skill, cfg) {
    var cell = document.createElement("div");
    cell.className = "skill-card__relics";
    cell.id = "skill_relics_" + skill.id;
    // содержимое (иконки + кнопка добавления) строится в syncRelicsCell
    return cell;
  }

  function syncRelicsCell(skill, cfg) {
    var cell = document.getElementById("skill_relics_" + skill.id);
    if (!cell) return;
    cell.innerHTML = "";

    cfg.relics.forEach(function (relicRef) {
      var relic = WS_RELICS.find(function (r) { return r.id === relicRef.id; });
      if (!relic) return;

      var wrap = document.createElement("span");
      wrap.className = "relic-icon-wrap";
      wrap.title = relic.name + " (+" + relic.damageBonusPercent + "% x" + relicRef.stacks + ")";

      var icon = document.createElement("span");
      icon.className = "relic-icon";
      icon.textContent = relic.icon;
      wrap.appendChild(icon);

      if (relicRef.stacks > 1) {
        var stacks = document.createElement("span");
        stacks.className = "relic-icon__stacks";
        stacks.textContent = relicRef.stacks;
        wrap.appendChild(stacks);
      }

      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "relic-icon__remove";
      removeBtn.textContent = "×";
      removeBtn.title = "Убрать реликвию";
      removeBtn.addEventListener("click", function () {
        WsState.removeSkillRelic(skill.id, relic.id);
      });
      wrap.appendChild(removeBtn);

      cell.appendChild(wrap);
    });

    var addWrap = document.createElement("span");
    addWrap.className = "relic-add-wrap";

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "relic-add-btn";
    addBtn.textContent = "+";
    addBtn.title = "Добавить реликвию";

    var select = document.createElement("select");
    select.className = "relic-add-select";
    select.hidden = true;

    var options = relicOptionsFor(cfg);
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Выбрать реликвию…";
    select.appendChild(placeholder);
    options.forEach(function (relic) {
      var opt = document.createElement("option");
      opt.value = relic.id;
      opt.textContent = relic.icon + " " + relic.name;
      select.appendChild(opt);
    });

    if (options.length === 0) {
      addBtn.disabled = true;
      addBtn.title = "Все доступные реликвии уже добавлены";
    }

    addBtn.addEventListener("click", function () {
      select.hidden = !select.hidden;
      if (!select.hidden) select.focus();
    });

    select.addEventListener("change", function () {
      if (select.value) {
        WsState.addSkillRelic(skill.id, select.value);
      }
      select.hidden = true;
      select.value = "";
    });

    addWrap.appendChild(addBtn);
    addWrap.appendChild(select);
    cell.appendChild(addWrap);
  }

  function buildSkillCards(root, cls) {
    root.innerHTML = "";

    if (!cls.skills || cls.skills.length === 0) {
      root.innerHTML = '<p class="panel__hint">Для этого класса навыки ещё не добавлены.</p>';
      return;
    }

    var grid = document.createElement("div");
    grid.className = "skill-cards-grid";

    cls.skills.forEach(function (skill) {
      var cfg = WsState.getSkillConfig(skill.id);

      var card = document.createElement("div");
      card.className = "skill-card";

      var header = document.createElement("div");
      header.className = "skill-card__header";
      var nameEl = document.createElement("span");
      nameEl.className = "skill-card__name";
      nameEl.textContent = skill.name;
      var dmgEl = document.createElement("span");
      dmgEl.className = "skill-card__damage";
      dmgEl.id = "skill_dmg_" + skill.id;
      header.appendChild(nameEl);
      header.appendChild(dmgEl);

      var controls = document.createElement("div");
      controls.className = "skill-card__controls";

      var levelInput = document.createElement("input");
      levelInput.type = "number";
      levelInput.id = "skill_level_" + skill.id;
      levelInput.className = "skill-card__level-input";
      levelInput.title = "Уровень прокачки навыка";
      levelInput.min = 1;
      levelInput.max = skill.maxLevel || 1;
      levelInput.value = cfg.level;
      levelInput.addEventListener("input", function () {
        WsState.setSkillLevel(skill.id, Number(levelInput.value) || 1);
      });
      controls.appendChild(levelInput);

      controls.appendChild(buildRelicsCell(skill, cfg));

      card.appendChild(header);
      card.appendChild(controls);
      grid.appendChild(card);
    });

    root.appendChild(grid);
  }

  function syncSkillCards(cls, effStats, target, state) {
    cls.skills.forEach(function (skill) {
      var cfg = WsState.getSkillConfig(skill.id);
      var dmg = WsFormulas.calcSkillTotalDamage(skill, effStats, target, cfg, state);

      var dmgEl = document.getElementById("skill_dmg_" + skill.id);
      if (dmgEl) dmgEl.textContent = dmg;

      var levelInput = document.getElementById("skill_level_" + skill.id);
      if (levelInput && document.activeElement !== levelInput) {
        levelInput.value = cfg.level;
      }

      syncRelicsCell(skill, cfg);
    });
  }

  function renderSkillsPanel(state, effStats, target) {
    var root = document.getElementById("resultsSkills");

    if (!state.classId) {
      root.innerHTML = '<p class="panel__hint">Выберите класс, чтобы увидеть урон по навыкам.</p>';
      lastSkillsClassId = null;
      return;
    }

    var cls = WS_CLASSES.find(function (c) { return c.id === state.classId; });

    if (lastSkillsClassId !== state.classId) {
      lastSkillsClassId = state.classId;
      buildSkillCards(root, cls);
    }

    if (cls.skills && cls.skills.length > 0) {
      syncSkillCards(cls, effStats, target, state);
    }
  }

  function render() {
    var state = WsState.get();
    var effStats = WsFormulas.getEffectiveStats(state);
    var target = WsFormulas.getTarget(state.targetId);

    renderSummary(effStats);
    renderSkillsPanel(state, effStats, target);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);

    // Клик вне выпадающего списка добавления реликвии закрывает его.
    document.addEventListener("click", function (e) {
      if (e.target.closest(".relic-add-wrap")) return;
      document.querySelectorAll(".relic-add-select:not([hidden])").forEach(function (select) {
        select.hidden = true;
      });
    });
  });
})();
