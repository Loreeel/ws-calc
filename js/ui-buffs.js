(function () {
  var CATEGORY_LABELS = {
    consumable: "Расходники",
    guild: "Гильдия",
    pet: "Питомцы",
    external: "Сторонние баффы"
  };

  function render() {
    var root = document.getElementById("buffsPanel");
    var state = WsState.get();
    root.innerHTML = "";

    Object.keys(WS_BUFFS).forEach(function (category) {
      var heading = document.createElement("h3");
      heading.style.fontSize = "12px";
      heading.style.color = "var(--text-muted)";
      heading.style.margin = "10px 0 6px";
      heading.textContent = CATEGORY_LABELS[category] || category;
      root.appendChild(heading);

      var container = document.createElement("div");
      container.className = "option-list";

      WS_BUFFS[category].forEach(function (b) {
        var row = document.createElement("label");
        row.className = "option-row";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = state.buffs.indexOf(b.id) !== -1;
        checkbox.addEventListener("change", function () {
          WsState.toggleInList("buffs", b.id);
        });

        var name = document.createElement("span");
        name.className = "option-row__name";
        name.textContent = b.name;

        row.appendChild(checkbox);
        row.appendChild(name);
        container.appendChild(row);
      });

      root.appendChild(container);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    WsState.subscribe(render);
  });
})();
