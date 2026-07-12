(function () {
  var FIELDS = [
    { id: "physPower", label: "Physical Power атакующего", def: 100 },
    { id: "physPenetration", label: "Physical Penetration, %", def: 0 },
    { id: "magicPower", label: "Magic Power атакующего", def: 100 },
    { id: "magicPenetration", label: "Magic Penetration, %", def: 0 },
    { id: "targetDefMod", label: "Модификатор типа цели (defMod, заглушка)", def: 1 },
    { id: "targetResMod", label: "Модификатор типа цели (resMod, заглушка)", def: 1 },
    { id: "observedPhys", label: "Реальный физ. урон из игры", def: "" },
    { id: "observedMagic", label: "Реальный маг. урон из игры", def: "" }
  ];

  function render() {
    var root = document.getElementById("debugContent");
    root.innerHTML = "";

    var grid = document.createElement("div");
    grid.className = "field-grid";

    var inputs = {};
    FIELDS.forEach(function (f) {
      var wrap = document.createElement("div");
      wrap.className = "field";
      var label = document.createElement("label");
      label.textContent = f.label;
      var input = document.createElement("input");
      input.type = "number";
      input.id = "dbg_" + f.id;
      input.value = f.def;
      wrap.appendChild(label);
      wrap.appendChild(input);
      grid.appendChild(wrap);
      inputs[f.id] = input;
    });

    root.appendChild(grid);

    var runBtn = document.createElement("button");
    runBtn.textContent = "Сравнить с формулой";
    runBtn.style.marginTop = "10px";
    root.appendChild(runBtn);

    var resultBox = document.createElement("div");
    resultBox.className = "debug-result";
    root.appendChild(resultBox);

    runBtn.addEventListener("click", function () {
      var v = {};
      FIELDS.forEach(function (f) { v[f.id] = Number(inputs[f.id].value) || 0; });

      var attackerStats = {
        physPower: v.physPower, physPenetration: v.physPenetration,
        magicPower: v.magicPower, magicPenetration: v.magicPenetration
      };
      var target = { defMod: v.targetDefMod, resMod: v.targetResMod };

      var calcPhys = WsFormulas.physicalDamage(attackerStats, target);
      var calcMagic = WsFormulas.magicDamage(attackerStats, target);

      var lines = [];
      lines.push("Расчёт (физ.): " + calcPhys);
      if (inputs.observedPhys.value !== "") {
        var diffPhys = calcPhys - v.observedPhys;
        lines.push("Реальный (физ.): " + v.observedPhys + "  |  разница: " + diffPhys);
      }
      lines.push("");
      lines.push("Расчёт (маг.): " + calcMagic);
      if (inputs.observedMagic.value !== "") {
        var diffMagic = calcMagic - v.observedMagic;
        lines.push("Реальный (маг.): " + v.observedMagic + "  |  разница: " + diffMagic);
      }

      resultBox.textContent = lines.join("\n");
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
