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

  function render() {
    var state = WsState.get();
    renderChips(state);

    if (!fieldsBuilt) buildStatsFields(state);
    else syncStatsFields(state);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
