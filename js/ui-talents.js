(function () {
  var lastClassId;

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

    var list = WS_TALENTS[state.classId] || [];

    if (lastClassId !== state.classId) {
      lastClassId = state.classId;
      buildRows(root, list);
    }

    syncRows(list, state);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
