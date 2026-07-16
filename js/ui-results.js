(function () {
  var lastSkillsClassId = undefined;

  function formatPercent(value) {
    return (value >= 0 ? "+" : "") + (Math.round(value * 100) / 100) + "%";
  }

  // Текст тултипа: "фиксированный ДД" (уровень + ячейки сетки/бафы в режиме "фикс.")
  // и "% ДД" (ячейки сетки/бафы в режиме "%" + фракция + таланты) — см. getPowerBreakdown.
  function buildPowerTooltip(state, type) {
    var b = WsFormulas.getPowerBreakdown(state, type);
    var lines = [];

    lines.push("Фиксированный ДД:");
    lines.push("  Уровень: " + b.levelBonus);
    b.fixEntries.forEach(function (e) {
      lines.push("  " + e.label + ": " + e.value);
    });
    lines.push("  Итого: " + b.fixTotal);

    lines.push("");

    if (b.percentEntries.length === 0) {
      lines.push("% ДД: 0%");
    } else {
      lines.push("% ДД:");
      b.percentEntries.forEach(function (e) {
        lines.push("  " + e.label + ": " + formatPercent(e.value));
      });
      lines.push("  Итого: " + formatPercent(b.percentTotal));
    }

    lines.push("");
    lines.push("Точное значение (дробное): " + (Math.round(b.finalValue * 100) / 100));

    return lines.join("\n");
  }

  function getDamageTypes(classId) {
    var cls = WS_CLASSES.find(function (c) { return c.id === classId; });
    return (cls && cls.damageTypes) || ["physical", "magic"];
  }

  // Тултип для "Множитель крит. урона": 2 + (стат + бонусы малых талантов) / 100.
  // skillId (необязательный) — добавляет адресные skillCritDamagePercent-бонусы
  // (напр. Пироманьяк) для конкретного навыка.
  function buildCritMultiplierTooltip(state, skillId) {
    var statPercent = state.stats.critDamagePower || 0;
    var talentPercent = WsFormulas.getTalentCritDamageBonusPercent(state, state.targetId, skillId);
    var buffPercent = WsFormulas.getBuffCritDamageBonusPercent(state);
    var totalPercent = statPercent + talentPercent + buffPercent;
    var multiplier = WsFormulas.getCritDamageMultiplier(state, skillId);

    var lines = [];
    lines.push("Критический урон (стат): " + formatPercent(statPercent));
    lines.push("Бонусы малых талантов" + (skillId ? " (в т.ч. адресные — напр. Пироманьяк)" : "") + ": " + formatPercent(talentPercent));
    lines.push("Бонусы бафов (Зелье/Группа): " + formatPercent(buffPercent));
    lines.push("Итого %: " + formatPercent(totalPercent));
    lines.push("");
    lines.push("2 + " + Math.round(totalPercent * 100) / 100 + "/100 = " + (Math.round(multiplier * 100) / 100));

    return lines.join("\n");
  }

  // Тултип для числа "крит" рядом с уроном навыка: обычный урон × множитель крит. урона
  // × ЕЩЁ ОДИН множитель "Гнева глубин" (обычный урон уже включает его один раз, крит —
  // дважды, подтверждено формулой игрока).
  function buildCritSkillDamageTooltip(dmg, state, skillId) {
    var multiplier = WsFormulas.getCritDamageMultiplier(state, skillId);
    var wrathMultiplier = WsFormulas.getDepthsWrathMultiplier(state);
    var critDmg = dmg * multiplier * wrathMultiplier;
    var lines = [];
    lines.push("Обычный урон: " + (Math.round(dmg * 100) / 100));
    lines.push("Множитель крит. урона: × " + (Math.round(multiplier * 100) / 100));
    if (wrathMultiplier !== 1) {
      lines.push("Доп. множитель «Гнев глубин» (только для крита): × " + (Math.round(wrathMultiplier * 100) / 100));
    }
    lines.push("Крит. урон: " + (Math.round(dmg * 100) / 100) + " × " + (Math.round(multiplier * 100) / 100) + (wrathMultiplier !== 1 ? " × " + (Math.round(wrathMultiplier * 100) / 100) : "") + " = " + (Math.round(critDmg * 100) / 100));
    lines.push("");
    lines.push("Из чего состоит множитель:");
    lines.push(buildCritMultiplierTooltip(state, skillId));
    return lines.join("\n");
  }

  function renderSummary(effStats, state) {
    var summaryRoot = document.getElementById("resultsSummary");
    summaryRoot.innerHTML = "";
    var damageTypes = getDamageTypes(state.classId);

    [
      ["physPower", "Physical Power", "physical"],
      ["magicPower", "Magic Power", "magic"],
      ["penetrationPower", "Пробивная способность", null],
      ["critDamagePower", "Критический урон", null],
      ["skillPower", "Сила навыков", null],
      ["autoAttackPower", "Сила автоатаки", null]
    ].forEach(function (triple) {
      // Power-поле неиспользуемого классом типа урона скрываем (напр. Physical Power у мага).
      if (triple[2] && damageTypes.indexOf(triple[2]) === -1) return;

      // Physical/Magic Power округляются до целого в UI (расчёт внутри — дробный,
      // точное значение смотри в тултипе). Остальные статы в этом списке — все "(%)"
      // (Пробивная способность, Критический урон, Сила навыков, Сила автоатаки).
      var displayValue = triple[2]
        ? Math.round(effStats[triple[0]])
        : (Math.round(effStats[triple[0]] * 100) / 100) + "%";

      var row = document.createElement("div");
      row.className = "stat-row";
      if (triple[2]) row.title = buildPowerTooltip(state, triple[2]);
      row.innerHTML =
        '<span class="stat-row__label">' + triple[1] + '</span>' +
        '<span class="stat-row__value">' + displayValue + '</span>';
      summaryRoot.appendChild(row);
    });
  }

  function relicOptionsFor(skill, cfg) {
    // Реликвии, которые ещё можно добавить: подходят этому навыку (allowedSkills пусто
    // ИЛИ включает skill.id), и либо их ещё нет на навыке, либо они стакаются и не
    // достигли maxStacks.
    return WS_RELICS.filter(function (relic) {
      if (relic.allowedSkills && relic.allowedSkills.indexOf(skill.id) === -1) return false;
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
      wrap.className = "relic-icon-wrap" + (relic.variableByGroupSize ? " relic-icon-wrap--group" : "");

      if (relic.variableByGroupSize) {
        var currentBonus = relic.variableByGroupSize[relicRef.groupSize || 1] || 0;
        wrap.title = relic.name + " (+" + currentBonus + "% при " + (relicRef.groupSize || 1) + " чел. рядом)";
      } else {
        wrap.title = relic.name + " (+" + relic.damageBonusPercent + "% x" + relicRef.stacks + ")";
      }

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

      if (relic.variableByGroupSize) {
        var groupSelect = document.createElement("select");
        groupSelect.className = "relic-group-select";
        Object.keys(relic.variableByGroupSize).forEach(function (size) {
          var opt = document.createElement("option");
          opt.value = size;
          opt.textContent = size + " чел.";
          groupSelect.appendChild(opt);
        });
        groupSelect.value = relicRef.groupSize || 1;
        groupSelect.addEventListener("change", function () {
          WsState.setSkillRelicGroupSize(skill.id, relic.id, Number(groupSelect.value));
        });
        wrap.appendChild(groupSelect);
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

    var options = relicOptionsFor(skill, cfg);
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
      header.appendChild(nameEl);

      // Навыки-"зеркала" (напр. Магический фантом у Мага — по шансу повторяет один из
      // нескольких навыков-источников) не имеют своего единого числа урона — вместо
      // dmgWrap в шапке у них только список mirror-строк (см. ниже).
      var isMirror = !!skill.mirrorsSkills;

      if (!isMirror) {
        var dmgEl = document.createElement("span");
        dmgEl.className = "skill-card__damage";
        dmgEl.id = "skill_dmg_" + skill.id;

        var critDmgEl = document.createElement("span");
        critDmgEl.className = "skill-card__crit-damage";
        critDmgEl.id = "skill_crit_dmg_" + skill.id;

        var dmgWrap = document.createElement("span");
        dmgWrap.className = "skill-card__damage-wrap";
        dmgWrap.appendChild(dmgEl);
        dmgWrap.appendChild(critDmgEl);
        header.appendChild(dmgWrap);
      }

      // Навыки с ДВУМЯ источниками урона (напр. мгновенный удар + доп. периодический
      // эффект — см. damageFormula.secondary) получают отдельную строку под шапкой.
      var hasSecondary = skill.damageFormula && skill.damageFormula.secondary;

      card.appendChild(header);

      if (hasSecondary) {
        var secRow = document.createElement("div");
        secRow.className = "skill-card__secondary-row";

        var secLabel = document.createElement("span");
        secLabel.className = "skill-card__secondary-label";
        secLabel.textContent = (skill.damageFormula.secondary.label || "Доп. источник урона") + ":";
        secRow.appendChild(secLabel);

        var secDmgEl = document.createElement("span");
        secDmgEl.className = "skill-card__damage skill-card__damage--secondary";
        secDmgEl.id = "skill_dmg2_" + skill.id;
        secRow.appendChild(secDmgEl);

        card.appendChild(secRow);
      }

      if (isMirror) {
        var mirrorRows = document.createElement("div");
        mirrorRows.className = "skill-card__mirror-rows";
        mirrorRows.id = "skill_mirrors_" + skill.id;
        card.appendChild(mirrorRows);
      }

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

      if (!skill.noRelics) controls.appendChild(buildRelicsCell(skill, cfg));

      card.appendChild(controls);
      grid.appendChild(card);
    });

    root.appendChild(grid);
  }

  function buildSkillDamageTooltip(skill, effStats, target, cfg, state) {
    var b = WsFormulas.getSkillDamageBreakdown(skill, effStats, target, cfg, state);
    var lines = b.lines.map(function (l) { return l.label + ": " + l.value; });
    lines.push("");
    lines.push("Итого (неокруглённо): " + (Math.round(b.final * 100) / 100));
    lines.push("Итого (округлённо): " + Math.round(b.final));
    return lines.join("\n");
  }

  function syncSkillCards(cls, effStats, target, state) {
    cls.skills.forEach(function (skill) {
      var cfg = WsState.getSkillConfig(skill.id);
      // Расчёт ведётся в неокруглённых числах — округляем только для отображения.
      var breakdown = WsFormulas.getSkillDamageBreakdown(skill, effStats, target, cfg, state);
      var dmg = breakdown.final;

      var dmgEl = document.getElementById("skill_dmg_" + skill.id);
      if (dmgEl) {
        dmgEl.textContent = Math.round(dmg);
        dmgEl.title = buildSkillDamageTooltip(skill, effStats, target, cfg, state);
      }

      var critMultiplier = WsFormulas.getCritDamageMultiplier(state, skill.id);
      // "Гнев глубин" уже включён в dmg один раз — для крита нужен ЕЩЁ ОДИН множитель.
      var critDmg = dmg * critMultiplier * WsFormulas.getDepthsWrathMultiplier(state);

      var critDmgEl = document.getElementById("skill_crit_dmg_" + skill.id);
      if (critDmgEl) {
        critDmgEl.textContent = "крит: " + Math.round(critDmg);
        critDmgEl.title = buildCritSkillDamageTooltip(dmg, state, skill.id);
      }

      if (breakdown.secondary) {
        var secDmgEl = document.getElementById("skill_dmg2_" + skill.id);
        if (secDmgEl) {
          secDmgEl.textContent = Math.round(breakdown.secondary.final);
          var secLines = breakdown.secondary.lines.map(function (l) { return l.label + ": " + l.value; });
          secLines.push("");
          secLines.push("Итого (неокруглённо): " + (Math.round(breakdown.secondary.final * 100) / 100));
          secLines.push("Итого (округлённо): " + Math.round(breakdown.secondary.final));
          secDmgEl.title = secLines.join("\n");
        }
      }

      // Навыки-"зеркала" (напр. Магический фантом) — своё число урона отсутствует,
      // вместо него по одной строке (обычный + крит) на каждый навык-источник.
      if (breakdown.mirrors) {
        var mirrorContainer = document.getElementById("skill_mirrors_" + skill.id);
        if (mirrorContainer) {
          mirrorContainer.innerHTML = "";
          breakdown.mirrors.forEach(function (m) {
            // Скилл-специфичные бонусы крит. урона (напр. Пироманьяк) фантому НЕ передаются
            // (подтверждено тестом) — считаем ОБЩИЙ множитель без skillId.
            var mirrorCritMultiplier = WsFormulas.getCritDamageMultiplier(state);
            var mirrorCritDmg = m.final * mirrorCritMultiplier * WsFormulas.getDepthsWrathMultiplier(state);

            var row = document.createElement("div");
            row.className = "skill-card__secondary-row";

            var label = document.createElement("span");
            label.className = "skill-card__secondary-label";
            label.textContent = m.name + ":";
            row.appendChild(label);

            var val = document.createElement("span");
            val.className = "skill-card__damage skill-card__damage--secondary";
            val.textContent = Math.round(m.final) + " / крит: " + Math.round(mirrorCritDmg);
            val.title = "Копия «" + m.name + "».\nОбычный: " + (Math.round(m.final * 100) / 100) + "\nКрит: " + (Math.round(mirrorCritDmg * 100) / 100) + "\n\nНаследует Power, Силу навыков, бонус по цели/типу урона — БЕЗ скилл-специфичных талантов на % от ДД, реликвий, скилл-специфичного крита и бонуса по HP цели (подтверждено 3 тестами, разброс ~1.9%).";
            row.appendChild(val);

            mirrorContainer.appendChild(row);
          });
        }
      }

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

    renderSummary(effStats, state);
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
