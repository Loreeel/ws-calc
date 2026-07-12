(function () {
  function render() {
    var root = document.getElementById("savesList");
    root.innerHTML = "";

    var builds = WsStorage.loadAll();
    if (builds.length === 0) {
      root.innerHTML = '<p class="panel__hint">Пока нет сохранённых сборок.</p>';
      return;
    }

    builds.forEach(function (b) {
      var row = document.createElement("div");
      row.className = "save-row";

      var name = document.createElement("span");
      name.className = "save-row__name";
      name.textContent = b.name;

      var actions = document.createElement("div");
      actions.className = "save-row__actions";

      var loadBtn = document.createElement("button");
      loadBtn.className = "secondary";
      loadBtn.textContent = "Загрузить";
      loadBtn.addEventListener("click", function () {
        WsState.restore(b.data);
      });

      var delBtn = document.createElement("button");
      delBtn.className = "secondary";
      delBtn.textContent = "Удалить";
      delBtn.addEventListener("click", function () {
        WsStorage.removeBuild(b.id);
        render();
      });

      actions.appendChild(loadBtn);
      actions.appendChild(delBtn);
      row.appendChild(name);
      row.appendChild(actions);
      root.appendChild(row);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();

    var saveBtn = document.getElementById("saveBuildBtn");
    var nameInput = document.getElementById("saveName");

    saveBtn.addEventListener("click", function () {
      var name = nameInput.value.trim() || ("Сборка " + new Date().toLocaleString());
      WsStorage.addBuild(name, WsState.snapshot());
      nameInput.value = "";
      render();
    });
  });
})();
