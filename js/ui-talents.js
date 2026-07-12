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

    list.forEach(function (t) {
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
        WsState.setTalentLevel(t.id, checkbox.checked ? 1 : 0);
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
        desc.textContent = t.description;
        main.appendChild(desc);
      }

      if (t.note) {
        var note = document.createElement("div");
        note.className = "option-row__desc talent-row__note";
        note.textContent = t.note;
        main.appendChild(note);
      }

      container.appendChild(row);
    });

    root.appendChild(container);
  }

  function syncRows(list, state) {
    list.forEach(function (t) {
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
