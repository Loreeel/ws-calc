(function () {
  var uiUnion = null;
  var uiFaction = null;

  function factionsOf(unionId) {
    return WS_FACTIONS.filter(function (f) { return f.union === unionId; });
  }

  function classesOf(factionId) {
    return WS_CLASSES.filter(function (c) { return c.faction === factionId; });
  }

  function init() {
    var state = WsState.get();

    if (state.classId) {
      var cls = WS_CLASSES.find(function (c) { return c.id === state.classId; });
      if (cls) {
        uiFaction = cls.faction;
        var faction = WS_FACTIONS.find(function (f) { return f.id === uiFaction; });
        uiUnion = faction ? faction.union : WS_UNIONS[0].id;
        return;
      }
    }

    // Ничего не выбрано - по умолчанию выбираем первый пункт на каждом уровне.
    uiUnion = WS_UNIONS[0].id;
    uiFaction = factionsOf(uiUnion)[0].id;
    WsState.set({ classId: classesOf(uiFaction)[0].id, talents: {} });
  }

  function selectUnion(unionId) {
    uiUnion = unionId;
    uiFaction = factionsOf(uiUnion)[0].id;
    WsState.set({ classId: classesOf(uiFaction)[0].id, talents: {} });
  }

  function selectFaction(factionId) {
    uiFaction = factionId;
    WsState.set({ classId: classesOf(uiFaction)[0].id, talents: {} });
  }

  function selectClass(classId) {
    WsState.set({ classId: classId, talents: {} });
  }

  function renderRow(root, className, items, selectedId, onClick) {
    var row = document.createElement("div");
    row.className = "class-select " + className;
    items.forEach(function (item) {
      var chip = document.createElement("button");
      chip.className = "class-chip" + (selectedId === item.id ? " is-selected" : "");
      chip.textContent = item.label;
      if (item.title) chip.title = item.title;
      chip.addEventListener("click", function () { onClick(item.id); });
      row.appendChild(chip);
    });
    root.appendChild(row);
  }

  function render() {
    var root = document.getElementById("classSelect");
    var state = WsState.get();
    root.innerHTML = "";

    renderRow(
      root, "class-select--unions",
      WS_UNIONS.map(function (u) { return { id: u.id, label: u.name }; }),
      uiUnion,
      selectUnion
    );

    renderRow(
      root, "class-select--factions",
      factionsOf(uiUnion).map(function (f) { return { id: f.id, label: f.name }; }),
      uiFaction,
      selectFaction
    );

    renderRow(
      root, "class-select--classes",
      classesOf(uiFaction).map(function (c) { return { id: c.id, label: c.name, title: c.role }; }),
      state.classId,
      selectClass
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();
    render();
    WsState.subscribe(render);
  });
})();
