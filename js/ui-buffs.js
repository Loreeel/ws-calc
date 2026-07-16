(function () {
  var lastClassId;

  function getDamageTypes(classId) {
    var cls = WS_CLASSES.find(function (c) { return c.id === classId; });
    return (cls && cls.damageTypes) || ["physical", "magic"];
  }

  var TYPE_LABELS = { physical: "Физический", magic: "Магический" };

  var GROUP_BUFF_KIND_LABELS = {
    bothPower: "физ. + маг. ДД",
    critDamage: "крит. урона",
    skillPower: "силы навыков",
    penetrationPower: "пробивной способности",
    autoAttackPower: "силы автоатаки"
  };

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

  function buildCard(title) {
    var card = document.createElement("div");
    card.className = "buff-card";

    var heading = document.createElement("h3");
    heading.className = "buff-card__title";
    heading.textContent = title;
    card.appendChild(heading);

    return card;
  }

  function buildRows(root, damageTypes, state) {
    root.innerHTML = "";

    var mainCard = buildCard("Основные");

    var container = document.createElement("div");
    container.className = "option-list";

    // --- Зелье: выбор ОДНОГО эффекта из WS_POTION_OPTIONS ---
    var potionRow = document.createElement("div");
    potionRow.className = "option-row";

    var potionName = document.createElement("span");
    potionName.className = "option-row__name";
    potionName.textContent = "Зелье";
    potionRow.appendChild(potionName);

    var potionSelect = document.createElement("select");
    potionSelect.id = "buff_potion_option";
    potionSelect.className = "buff-mode-select";
    WS_POTION_OPTIONS.filter(function (o) {
      return o.kind !== "power" || damageTypes.indexOf(o.damageType) !== -1;
    }).forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.name;
      potionSelect.appendChild(opt);
    });
    potionSelect.addEventListener("change", function () {
      WsState.setBuffInput("potion", { optionId: potionSelect.value });
    });
    potionRow.appendChild(potionSelect);

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

    // --- Гильдия: уровень 3/6/10%, сразу на физ. и маг. ДД ---
    var guildRow = document.createElement("div");
    guildRow.className = "option-row";

    var guildName = document.createElement("span");
    guildName.className = "option-row__name";
    guildName.textContent = "Гильдия";
    guildRow.appendChild(guildName);

    var guildSelect = document.createElement("select");
    guildSelect.id = "buff_guild_percent";
    guildSelect.className = "buff-mode-select";
    [[0, "Нет"], [3, "3%"], [6, "6%"], [10, "10%"]].forEach(function (pair) {
      var opt = document.createElement("option");
      opt.value = pair[0];
      opt.textContent = pair[1];
      guildSelect.appendChild(opt);
    });
    guildSelect.addEventListener("change", function () {
      WsState.setBuffInput("guild", { percent: Number(guildSelect.value) || 0 });
    });
    guildRow.appendChild(guildSelect);

    var guildSuffix = document.createElement("span");
    guildSuffix.className = "buff-suffix";
    guildSuffix.textContent = "физ. + маг. ДД";
    guildRow.appendChild(guildSuffix);

    container.appendChild(guildRow);

    // --- Замок: до 5 стаков по 1.5%, сразу на физ. и маг. ДД ---
    var castleRow = document.createElement("div");
    castleRow.className = "option-row";

    var castleName = document.createElement("span");
    castleName.className = "option-row__name";
    castleName.textContent = "Замок";
    castleRow.appendChild(castleName);

    var castleStepper = document.createElement("div");
    castleStepper.className = "talent-stepper";

    var castleMinus = document.createElement("button");
    castleMinus.type = "button";
    castleMinus.className = "secondary";
    castleMinus.textContent = "−";
    castleMinus.addEventListener("click", function () {
      var cur = WsState.get().buffInputs.castle.stacks || 0;
      WsState.setBuffInput("castle", { stacks: Math.max(0, cur - 1) });
    });

    var castleLevel = document.createElement("span");
    castleLevel.id = "buff_castle_level";
    castleLevel.className = "talent-stepper__level";

    var castlePlus = document.createElement("button");
    castlePlus.type = "button";
    castlePlus.className = "secondary";
    castlePlus.textContent = "+";
    castlePlus.addEventListener("click", function () {
      var cur = WsState.get().buffInputs.castle.stacks || 0;
      WsState.setBuffInput("castle", { stacks: Math.min(5, cur + 1) });
    });

    castleStepper.appendChild(castleMinus);
    castleStepper.appendChild(castleLevel);
    castleStepper.appendChild(castlePlus);
    castleRow.appendChild(castleStepper);

    var castleSuffix = document.createElement("span");
    castleSuffix.className = "buff-suffix";
    castleSuffix.textContent = "x 1.5% физ. + маг. ДД";
    castleRow.appendChild(castleSuffix);

    container.appendChild(castleRow);

    // --- Битва: вкл/выкл +10%, сразу на физ. и маг. ДД ---
    var battleRow = document.createElement("label");
    battleRow.className = "option-row";

    var battleCheckbox = document.createElement("input");
    battleCheckbox.type = "checkbox";
    battleCheckbox.id = "buff_battle_active";
    battleCheckbox.addEventListener("change", function () {
      WsState.setBuffInput("battle", { active: battleCheckbox.checked });
    });
    battleRow.appendChild(battleCheckbox);

    var battleName = document.createElement("span");
    battleName.className = "option-row__name";
    battleName.textContent = "Битва";
    battleRow.appendChild(battleName);

    var battleSuffix = document.createElement("span");
    battleSuffix.className = "buff-suffix";
    battleSuffix.textContent = "+10% физ. + маг. ДД";
    battleRow.appendChild(battleSuffix);

    container.appendChild(battleRow);

    mainCard.appendChild(container);
    root.appendChild(mainCard);

    // --- Группа: независимые вкл/выкл бафы (WS_GROUP_BUFFS) ---
    var groupCard = buildCard("Группа");
    var groupContainer = document.createElement("div");
    groupContainer.className = "option-list";

    WS_GROUP_BUFFS.forEach(function (buff) {
      var row = document.createElement("label");
      row.className = "option-row";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "group-buff-checkbox";
      checkbox.dataset.buffId = buff.id;
      checkbox.addEventListener("change", function () {
        var patch = {};
        patch[buff.id] = checkbox.checked;
        WsState.setBuffInput("groupBuffs", patch);
      });
      row.appendChild(checkbox);

      var name = document.createElement("span");
      name.className = "option-row__name";
      name.textContent = buff.name;
      row.appendChild(name);

      var suffix = document.createElement("span");
      suffix.className = "buff-suffix";
      if (buff.kind === "unmodeled") {
        suffix.textContent = buff.note || "эффект пока не учитывается в расчёте";
        suffix.title = suffix.textContent;
      } else {
        suffix.textContent = "+" + buff.percent + "% " + (GROUP_BUFF_KIND_LABELS[buff.kind] || buff.kind);
        if (buff.note) suffix.title = buff.note;
      }
      row.appendChild(suffix);

      groupContainer.appendChild(row);
    });

    groupCard.appendChild(groupContainer);
    root.appendChild(groupCard);
  }

  function sync(state) {
    var potionSelect = document.getElementById("buff_potion_option");
    if (potionSelect) potionSelect.value = state.buffInputs.potion.optionId || "none";

    WS_GROUP_BUFFS.forEach(function (buff) {
      var checkbox = document.querySelector('.group-buff-checkbox[data-buff-id="' + buff.id + '"]');
      if (checkbox) checkbox.checked = !!(state.buffInputs.groupBuffs && state.buffInputs.groupBuffs[buff.id]);
    });

    var scrollModeSelect = document.getElementById("buff_scroll_mode");
    if (scrollModeSelect) scrollModeSelect.value = state.buffInputs.scroll.mode;

    var scrollInput = document.getElementById("buff_scroll_value");
    if (scrollInput && document.activeElement !== scrollInput) {
      scrollInput.value = state.buffInputs.scroll.value;
    }

    var guildSelect = document.getElementById("buff_guild_percent");
    if (guildSelect) guildSelect.value = state.buffInputs.guild.percent;

    var castleLevel = document.getElementById("buff_castle_level");
    if (castleLevel) {
      var castleStacks = state.buffInputs.castle.stacks || 0;
      castleLevel.textContent = castleStacks + " / 5";
      var castleStepperEl = castleLevel.parentElement;
      if (castleStepperEl) {
        var minusBtn = castleStepperEl.children[0];
        var plusBtn = castleStepperEl.children[2];
        if (minusBtn) minusBtn.disabled = castleStacks === 0;
        if (plusBtn) plusBtn.disabled = castleStacks === 5;
      }
    }

    var battleCheckbox = document.getElementById("buff_battle_active");
    if (battleCheckbox) battleCheckbox.checked = state.buffInputs.battle.active;
  }

  function render() {
    var root = document.getElementById("buffsPanel");
    var state = WsState.get();
    var damageTypes = getDamageTypes(state.classId);

    // Если класс использует только 1 тип урона — бафы должны быть жёстко привязаны
    // к нему, даже если раньше (на другом классе) стоял другой тип.
    if (damageTypes.length === 1) {
      if (state.buffInputs.scroll.type !== damageTypes[0]) {
        state.buffInputs.scroll.type = damageTypes[0];
      }
    }

    // Если выбранный вариант Зелья привязан к типу урона, которого у класса больше нет
    // (напр. переключились с дуального класса на моно-магический) — сбрасываем на "Нет".
    var curPotionOpt = WS_POTION_OPTIONS.find(function (o) { return o.id === state.buffInputs.potion.optionId; });
    if (curPotionOpt && curPotionOpt.kind === "power" && damageTypes.indexOf(curPotionOpt.damageType) === -1) {
      state.buffInputs.potion.optionId = "none";
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
