(function () {
  var lastClassId;

  function getDamageTypes(classId) {
    var cls = WS_CLASSES.find(function (c) { return c.id === classId; });
    return (cls && cls.damageTypes) || ["physical", "magic"];
  }

  var TYPE_LABELS = { physical: "Физический", magic: "Магический" };

  // Если класс использует только один тип урона — бафы к нему привязаны неявно и
  // выбор скрыт. Если класс использует оба типа — добавляем select "Тип урона".
  function buildTypeSelect(id, damageTypes, currentType, onChange) {
    if (damageTypes.length < 2) return null;
    var select = document.createElement("select");
    select.id = id;
    select.className = "buff-mode-select";
    damageTypes.forEach(function (type) {
      var opt = document.createElement("option");
      opt.value = type;
      opt.textContent = TYPE_LABELS[type];
      select.appendChild(opt);
    });
    select.value = currentType;
    select.addEventListener("change", function () { onChange(select.value); });
    return select;
  }

  function buildRows(root, damageTypes, state) {
    root.innerHTML = "";
    var container = document.createElement("div");
    container.className = "option-list";

    // --- Зелье: всегда % ДД ---
    var potionRow = document.createElement("div");
    potionRow.className = "option-row";

    var potionName = document.createElement("span");
    potionName.className = "option-row__name";
    potionName.textContent = "Зелье";
    potionRow.appendChild(potionName);

    var potionTypeSelect = buildTypeSelect("buff_potion_type", damageTypes, state.buffInputs.potion.type, function (type) {
      WsState.setBuffInput("potion", { type: type });
    });
    if (potionTypeSelect) potionRow.appendChild(potionTypeSelect);

    var potionInput = document.createElement("input");
    potionInput.type = "number";
    potionInput.id = "buff_potion_percent";
    potionInput.className = "buff-value-input";
    potionInput.title = "% ДД";
    potionInput.addEventListener("input", function () {
      WsState.setBuffInput("potion", { percent: Number(potionInput.value) || 0 });
    });
    potionRow.appendChild(potionInput);

    var potionSuffix = document.createElement("span");
    potionSuffix.className = "buff-suffix";
    potionSuffix.textContent = "% ДД";
    potionRow.appendChild(potionSuffix);

    container.appendChild(potionRow);

    // --- Свиток: фиксированный ДД или % ДД, выбор через список ---
    var scrollRow = document.createElement("div");
    scrollRow.className = "option-row";

    var scrollName = document.createElement("span");
    scrollName.className = "option-row__name";
    scrollName.textContent = "Свиток";
    scrollRow.appendChild(scrollName);

    var scrollTypeSelect = buildTypeSelect("buff_scroll_type", damageTypes, state.buffInputs.scroll.type, function (type) {
      WsState.setBuffInput("scroll", { type: type });
    });
    if (scrollTypeSelect) scrollRow.appendChild(scrollTypeSelect);

    var scrollModeSelect = document.createElement("select");
    scrollModeSelect.id = "buff_scroll_mode";
    scrollModeSelect.className = "buff-mode-select";
    [["percent", "% ДД"], ["fixed", "Фиксированный ДД"]].forEach(function (pair) {
      var opt = document.createElement("option");
      opt.value = pair[0];
      opt.textContent = pair[1];
      scrollModeSelect.appendChild(opt);
    });
    scrollModeSelect.addEventListener("change", function () {
      WsState.setBuffInput("scroll", { mode: scrollModeSelect.value });
    });
    scrollRow.appendChild(scrollModeSelect);

    var scrollInput = document.createElement("input");
    scrollInput.type = "number";
    scrollInput.id = "buff_scroll_value";
    scrollInput.className = "buff-value-input";
    scrollInput.addEventListener("input", function () {
      WsState.setBuffInput("scroll", { value: Number(scrollInput.value) || 0 });
    });
    scrollRow.appendChild(scrollInput);

    container.appendChild(scrollRow);

    root.appendChild(container);
  }

  function sync(state) {
    var potionInput = document.getElementById("buff_potion_percent");
    if (potionInput && document.activeElement !== potionInput) {
      potionInput.value = state.buffInputs.potion.percent;
    }

    var scrollModeSelect = document.getElementById("buff_scroll_mode");
    if (scrollModeSelect) scrollModeSelect.value = state.buffInputs.scroll.mode;

    var scrollInput = document.getElementById("buff_scroll_value");
    if (scrollInput && document.activeElement !== scrollInput) {
      scrollInput.value = state.buffInputs.scroll.value;
    }
  }

  function render() {
    var root = document.getElementById("buffsPanel");
    var state = WsState.get();
    var damageTypes = getDamageTypes(state.classId);

    // Если класс использует только 1 тип урона — бафы должны быть жёстко привязаны
    // к нему, даже если раньше (на другом классе) стоял другой тип.
    if (damageTypes.length === 1) {
      if (state.buffInputs.potion.type !== damageTypes[0]) {
        state.buffInputs.potion.type = damageTypes[0];
      }
      if (state.buffInputs.scroll.type !== damageTypes[0]) {
        state.buffInputs.scroll.type = damageTypes[0];
      }
    }

    if (lastClassId !== state.classId) {
      lastClassId = state.classId;
      buildRows(root, damageTypes, state);
    }

    sync(state);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
