(function () {
  var lastClassId;
  var lastCacheKey = null;
  // Верхний уровень: "skills" | "talents" | "ship_graveyard" | "golden_sands".
  // Внутри "talents" — ещё один уровень: "talents_main" | "talents_minor".
  var activeTopTab = "skills";
  var activeTalentsSubTab = "talents_main";

  var TOP_TABS = [
    ["skills", "Навыки"],
    ["talents", "Таланты"],
    ["ship_graveyard", "Кладбище Кораблей"],
    ["golden_sands", "Золотые пески"]
  ];

  var TALENTS_SUB_TABS = [
    ["talents_main", "Основные"],
    ["talents_minor", "Малые"]
  ];

  // Ветки/гильдии для фильтра вкладок Таланты->Основные/Малые (см. data/classes/mage/talents.js:
  // поле branch на талантах). Классы без записи тут показывают все таланты без фильтра.
  // Пока заведено только для Мага. Ветка и гильдия — ДВА НЕЗАВИСИМЫХ выпадающих списка
  // (выбор ветки не влияет на выбор гильдии и наоборот), см. buildAffiliationRow.
  var CLASS_BRANCH_OPTIONS = {
    mage: [
      ["pyromancy", "Пиромантия"],
      ["geomancy", "Геомантия"],
      ["arcane_magic", "Тайная магия"]
    ]
  };
  var CLASS_GUILD_OPTIONS = {
    mage: [
      ["guild_adventurers", "Гильдия Авантюристов"],
      ["guild_assassins", "Гильдия Ассасинов"],
      ["guild_mages", "Гильдия Магов"]
    ]
  };

  // Таланты без явного category считаются "talents_main" (старые заглушки без разбора).
  function categoryOf(t) {
    return t.category || "talents_main";
  }

  function getActiveCategory() {
    return activeTopTab === "talents" ? activeTalentsSubTab : activeTopTab;
  }

  function buildNav(root) {
    var topNav = document.createElement("div");
    topNav.className = "subtabs";
    topNav.id = "talentsTopNav";

    TOP_TABS.forEach(function (pair) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "subtab";
      btn.dataset.subtab = pair[0];
      btn.textContent = pair[1];
      btn.addEventListener("click", function () {
        if (activeTopTab === pair[0]) return;
        activeTopTab = pair[0];
        lastCacheKey = null; // форсируем перестройку контента под новую вкладку
        render();
      });
      topNav.appendChild(btn);
    });

    root.appendChild(topNav);

    var innerNav = document.createElement("div");
    innerNav.className = "subtabs subtabs--nested";
    innerNav.id = "talentsInnerNav";
    root.appendChild(innerNav);

    var affiliationNav = document.createElement("div");
    affiliationNav.className = "subtabs subtabs--affiliation";
    affiliationNav.id = "talentsAffiliationNav";
    root.appendChild(affiliationNav);

    var content = document.createElement("div");
    content.id = "talentsContent";
    root.appendChild(content);

    return content;
  }

  function syncNav(root, classId) {
    var topNav = document.getElementById("talentsTopNav");
    if (topNav) {
      topNav.querySelectorAll(".subtab").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.dataset.subtab === activeTopTab);
      });
    }

    var innerNav = document.getElementById("talentsInnerNav");
    if (innerNav) {
      innerNav.innerHTML = "";
      if (activeTopTab === "talents") {
        TALENTS_SUB_TABS.forEach(function (pair) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "subtab" + (activeTalentsSubTab === pair[0] ? " is-active" : "");
          btn.textContent = pair[1];
          btn.addEventListener("click", function () {
            if (activeTalentsSubTab === pair[0]) return;
            activeTalentsSubTab = pair[0];
            lastCacheKey = null;
            render();
          });
          innerNav.appendChild(btn);
        });
      }
    }

    // Две НЕЗАВИСИМЫЕ выпадашки "Ветка" / "Гильдия Альмахада" — видны ТОЛЬКО на вкладке
    // "Основные" (сам фильтр применяется на обеих, Основные и Малые — см. render()).
    // Общие таланты (без branch) видны всегда независимо от выбора.
    var affiliationNav = document.getElementById("talentsAffiliationNav");
    if (affiliationNav) {
      affiliationNav.innerHTML = "";
      var branchOptions = CLASS_BRANCH_OPTIONS[classId];
      var guildOptions = CLASS_GUILD_OPTIONS[classId];
      if (activeTopTab === "talents" && activeTalentsSubTab === "talents_main" && (branchOptions || guildOptions)) {
        var current = (WsState.get().talentAffiliation || {})[classId] || {};

        if (branchOptions) {
          affiliationNav.appendChild(buildAffiliationSelect("Ветка", branchOptions, current.branch, function (value) {
            WsState.setTalentAffiliation(classId, "branch", value);
            lastCacheKey = null;
            render();
          }));
        }

        if (guildOptions) {
          affiliationNav.appendChild(buildAffiliationSelect("Гильдия Альмахада", guildOptions, current.guild, function (value) {
            WsState.setTalentAffiliation(classId, "guild", value);
            lastCacheKey = null;
            render();
          }));
        }
      }
    }
  }

  function buildAffiliationSelect(labelText, options, currentValue, onChange) {
    var wrap = document.createElement("label");
    wrap.className = "affiliation-select";

    var labelEl = document.createElement("span");
    labelEl.className = "affiliation-select__label";
    labelEl.textContent = labelText;
    wrap.appendChild(labelEl);

    var select = document.createElement("select");
    select.className = "affiliation-select__input";

    var noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "— не выбрано —";
    select.appendChild(noneOpt);

    options.forEach(function (pair) {
      var opt = document.createElement("option");
      opt.value = pair[0];
      opt.textContent = pair[1];
      select.appendChild(opt);
    });

    select.value = currentValue || "";
    select.addEventListener("change", function () {
      onChange(select.value || null);
    });

    wrap.appendChild(select);
    return wrap;
  }

  function buildRows(root, list) {
    root.innerHTML = "";

    if (list.length === 0) {
      root.innerHTML = '<p class="panel__hint">Для этого класса пока нет данных по талантам.</p>';
      return;
    }

    var container = document.createElement("div");
    container.className = "option-list";

    // Саб-таланты (subTalentOf) не рендерятся отдельной строкой — они встраиваются
    // вложенной галочкой внутрь строки "родительского" таланта (см. ниже).
    list.filter(function (t) { return !t.subTalentOf; }).forEach(function (t) {
      var maxLevel = t.maxLevel || 1;
      var row = document.createElement("div");
      row.className = "option-row talent-row";

      var main = document.createElement("div");
      main.className = "talent-row__main";

      var name = document.createElement("span");
      name.className = "option-row__name";
      name.textContent = t.name;
      main.appendChild(name);

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "talent_" + t.id;
      checkbox.addEventListener("change", function () {
        WsState.setTalentLevel(t.id, checkbox.checked ? (t.defaultLevel || 1) : 0);
      });
      row.appendChild(checkbox);
      row.appendChild(main);

      if (maxLevel > 1) {
        // Стакающийся талант: галочка включает/выключает ветку (уровень 1),
        // степпер отдельно регулирует число стаков (1..maxLevel) пока ветка включена.
        var stepper = document.createElement("div");
        stepper.className = "talent-stepper";

        var minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.className = "secondary";
        minusBtn.textContent = "−";
        minusBtn.addEventListener("click", function () {
          var cur = WsState.get().talents[t.id] || 0;
          if (cur <= 0) return;
          WsState.setTalentLevel(t.id, Math.max(1, cur - 1));
        });

        var levelLabel = document.createElement("span");
        levelLabel.id = "talent_level_" + t.id;
        levelLabel.className = "talent-stepper__level";

        var plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.className = "secondary";
        plusBtn.textContent = "+";
        plusBtn.addEventListener("click", function () {
          var cur = WsState.get().talents[t.id] || 0;
          if (cur <= 0) return;
          WsState.setTalentLevel(t.id, Math.min(maxLevel, cur + 1));
        });

        stepper.appendChild(minusBtn);
        stepper.appendChild(levelLabel);
        stepper.appendChild(plusBtn);
        row.appendChild(stepper);
      }

      if (t.description) {
        var desc = document.createElement("div");
        desc.className = "option-row__desc";
        // Описания с "{percent}" пересчитываются в syncRows (зависят от саб-талантов вроде "+").
        if (t.description.indexOf("{percent}") !== -1) desc.id = "talent_desc_" + t.id;
        desc.textContent = t.description.replace("{percent}", t.effect ? t.effect.percentPerStack : "");
        main.appendChild(desc);
      }

      if (t.note) {
        var note = document.createElement("div");
        note.className = "option-row__desc talent-row__note";
        note.textContent = t.note;
        main.appendChild(note);
      }

      if (t.effect && t.effect.type === "missingHpStackStatPercent") {
        var hpRow = document.createElement("div");
        hpRow.className = "talent-hp-input";

        var hpLabel = document.createElement("label");
        hpLabel.textContent = "Потеряно HP, %";
        hpLabel.setAttribute("for", "talent_hp_" + t.id);

        var hpInput = document.createElement("input");
        hpInput.type = "number";
        hpInput.id = "talent_hp_" + t.id;
        hpInput.min = 0;
        hpInput.max = 100;
        hpInput.addEventListener("input", function () {
          WsState.setTalentInput(t.id, Number(hpInput.value) || 0);
        });

        var hpStacks = document.createElement("span");
        hpStacks.id = "talent_hp_stacks_" + t.id;
        hpStacks.className = "talent-hp-input__stacks";

        hpRow.appendChild(hpLabel);
        hpRow.appendChild(hpInput);
        hpRow.appendChild(hpStacks);
        main.appendChild(hpRow);
      }

      if (t.effect && t.effect.type === "targetHpBelowDamagePercent") {
        var thRow = document.createElement("div");
        thRow.className = "talent-hp-input";

        var thLabel = document.createElement("label");
        thLabel.textContent = "HP цели, %";
        thLabel.setAttribute("for", "talent_targethp_" + t.id);

        var thInput = document.createElement("input");
        thInput.type = "number";
        thInput.id = "talent_targethp_" + t.id;
        thInput.min = 0;
        thInput.max = 100;
        thInput.addEventListener("input", function () {
          WsState.setTalentInput(t.id, Number(thInput.value) || 0);
        });

        var thResult = document.createElement("span");
        thResult.id = "talent_targethp_result_" + t.id;
        thResult.className = "talent-hp-input__stacks";

        thRow.appendChild(thLabel);
        thRow.appendChild(thInput);
        thRow.appendChild(thResult);
        main.appendChild(thRow);
      }

      if (t.effect && t.effect.type === "playerCountBothPowerPercent") {
        var pcRow = document.createElement("div");
        pcRow.className = "talent-hp-input";

        var pcLabel = document.createElement("label");
        pcLabel.textContent = "Игроков на локации";
        pcLabel.setAttribute("for", "talent_playercount_" + t.id);

        var pcInput = document.createElement("input");
        pcInput.type = "number";
        pcInput.id = "talent_playercount_" + t.id;
        pcInput.min = 0;
        pcInput.addEventListener("input", function () {
          WsState.setTalentInput(t.id, Number(pcInput.value) || 0);
        });

        var pcResult = document.createElement("span");
        pcResult.id = "talent_playercount_result_" + t.id;
        pcResult.className = "talent-hp-input__stacks";

        pcRow.appendChild(pcLabel);
        pcRow.appendChild(pcInput);
        pcRow.appendChild(pcResult);
        main.appendChild(pcRow);
      }

      var subTalent = list.find(function (other) { return other.subTalentOf === t.id; });
      if (subTalent) {
        var subRow = document.createElement("label");
        subRow.className = "talent-subrow";
        subRow.title = subTalent.description || "";

        var subCheckbox = document.createElement("input");
        subCheckbox.type = "checkbox";
        subCheckbox.id = "talent_" + subTalent.id;
        subCheckbox.addEventListener("change", function () {
          WsState.setTalentLevel(subTalent.id, subCheckbox.checked ? 1 : 0);
        });

        var subName = document.createElement("span");
        subName.textContent = subTalent.name;

        subRow.appendChild(subCheckbox);
        subRow.appendChild(subName);
        main.appendChild(subRow);
      }

      container.appendChild(row);
    });

    root.appendChild(container);
  }

  function syncRows(list, state) {
    list.filter(function (t) { return !t.subTalentOf; }).forEach(function (t) {
      var level = state.talents[t.id] || 0;
      var maxLevel = t.maxLevel || 1;

      var checkbox = document.getElementById("talent_" + t.id);
      if (checkbox) checkbox.checked = level > 0;

      if (maxLevel > 1) {
        var levelLabel = document.getElementById("talent_level_" + t.id);
        if (levelLabel) levelLabel.textContent = level + " / " + maxLevel;

        var stepperEl = levelLabel ? levelLabel.parentElement : null;
        if (stepperEl) {
          stepperEl.querySelectorAll("button").forEach(function (btn) {
            btn.disabled = level === 0;
          });
        }
      }

      if (t.effect && t.effect.type === "missingHpStackStatPercent") {
        var hpInput = document.getElementById("talent_hp_" + t.id);
        var hpStacksEl = document.getElementById("talent_hp_stacks_" + t.id);
        if (hpInput) {
          var forcer = list.find(function (other) {
            return other.forcesMissingHpFor === t.id && (state.talents[other.id] || 0) > 0;
          });
          var missingHp = WsFormulas.getMissingHpForTalent(t.id, list, state);

          hpInput.disabled = !!forcer;
          if (document.activeElement !== hpInput) hpInput.value = missingHp;

          if (hpStacksEl) {
            var stackHpStep = (t.effect.stackHpStepByLevel && t.effect.stackHpStepByLevel[level]) || t.effect.stackHpStep || 1;
            var stacks = WsFormulas.getMissingHpStacks(missingHp, stackHpStep);
            var totalPercent = WsFormulas.getMissingHpStackPercent(t, level, list, state);

            var percentPerStack = t.effect.percentPerStack || 0;
            var subTalent = list.find(function (other) { return other.subTalentOf === t.id; });
            if (subTalent && (state.talents[subTalent.id] || 0) > 0) {
              percentPerStack += subTalent.effect.bonusPerStack;
            }

            hpStacksEl.textContent = "≈" + stacks + " стак. (+" + Math.round(totalPercent * 100) / 100 + "%)" +
              (forcer ? " · зафиксировано «" + forcer.name + "»" : "");

            var descEl = document.getElementById("talent_desc_" + t.id);
            if (descEl) descEl.textContent = t.description.replace("{percent}", percentPerStack);
          }
        }
      }

      if (t.effect && t.effect.type === "playerCountBothPowerPercent") {
        var pcInput = document.getElementById("talent_playercount_" + t.id);
        var pcResultEl = document.getElementById("talent_playercount_result_" + t.id);
        if (pcInput) {
          if (document.activeElement !== pcInput) {
            pcInput.value = (state.talentInputs && state.talentInputs[t.id]) || 0;
          }
          if (pcResultEl) {
            var pcPercent = WsFormulas.getPlayerCountPercent(t, state);
            var capped = pcPercent >= t.effect.cap;
            pcResultEl.textContent = "+" + Math.round(pcPercent * 100) / 100 + "%" + (capped ? " (потолок)" : "");
          }
        }
      }

      if (t.effect && t.effect.type === "targetHpBelowDamagePercent") {
        var thInput = document.getElementById("talent_targethp_" + t.id);
        var thResultEl = document.getElementById("talent_targethp_result_" + t.id);
        if (thInput) {
          if (document.activeElement !== thInput) {
            thInput.value = (state.talentInputs && state.talentInputs[t.id]) || 0;
          }
          if (thResultEl) {
            var targetHp = (state.talentInputs && state.talentInputs[t.id]) || 0;
            var isAbove = t.effect.direction === "above";
            var isActive = isAbove ? targetHp > t.effect.threshold : (targetHp > 0 && targetHp < t.effect.threshold);
            var thPercent = isActive ? WsFormulas.getTalentPercentValue(t.effect, level) : 0;
            var cmp = isAbove ? "> " : "< ";
            thResultEl.textContent = isActive
              ? "+" + Math.round(thPercent * 100) / 100 + "% (" + cmp + t.effect.threshold + "%)"
              : "неактивен (нужно " + cmp + t.effect.threshold + "%)";
          }
        }
      }

      var subTalentSync = list.find(function (other) { return other.subTalentOf === t.id; });
      if (subTalentSync) {
        var subCheckbox = document.getElementById("talent_" + subTalentSync.id);
        if (subCheckbox) subCheckbox.checked = (state.talents[subTalentSync.id] || 0) > 0;
      }
    });
  }

  function render() {
    var root = document.getElementById("talentsPanel");
    var state = WsState.get();

    if (!state.classId) {
      root.innerHTML = '<p class="panel__hint">Сначала выберите класс.</p>';
      lastClassId = null;
      return;
    }

    var allList = WS_TALENTS[state.classId] || [];
    var activeCategory = getActiveCategory();
    var visibleList = allList.filter(function (t) { return categoryOf(t) === activeCategory; });

    // Фильтр по "текущей ветке" И "текущей гильдии" — НЕЗАВИСИМО друг от друга, только
    // на вкладках Основные/Малые, только для классов с заведёнными CLASS_BRANCH_OPTIONS/
    // CLASS_GUILD_OPTIONS (пока только Маг). Талант виден, если у него НЕТ branch
    // ("Общие" — всегда), ИЛИ его branch совпадает с выбранной веткой, ИЛИ с выбранной
    // гильдией (одно из двух достаточно).
    var selectedBranch = null;
    var selectedGuild = null;
    var hasBranchOptions = !!CLASS_BRANCH_OPTIONS[state.classId];
    var hasGuildOptions = !!CLASS_GUILD_OPTIONS[state.classId];
    if (activeTopTab === "talents" && (hasBranchOptions || hasGuildOptions)) {
      var currentAffiliation = (state.talentAffiliation || {})[state.classId] || {};
      selectedBranch = currentAffiliation.branch || null;
      selectedGuild = currentAffiliation.guild || null;
      visibleList = visibleList.filter(function (t) {
        if (!t.branch) return true;
        var branches = Array.isArray(t.branch) ? t.branch : [t.branch];
        return branches.indexOf(selectedBranch) !== -1 || branches.indexOf(selectedGuild) !== -1;
      });
    }

    var contentRoot;
    if (lastClassId !== state.classId || !document.getElementById("talentsContent")) {
      root.innerHTML = "";
      contentRoot = buildNav(root);
      lastClassId = state.classId;
      lastCacheKey = null;
    } else {
      contentRoot = document.getElementById("talentsContent");
    }

    syncNav(root, state.classId);

    var cacheKey = state.classId + "|" + activeCategory + "|" + selectedBranch + "|" + selectedGuild;
    if (cacheKey !== lastCacheKey) {
      lastCacheKey = cacheKey;
      buildRows(contentRoot, visibleList);
    }

    syncRows(visibleList, state);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
