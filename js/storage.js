var WsStorage = (function () {
  var KEY = "ws_calc_builds";

  function loadAll() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(builds) {
    localStorage.setItem(KEY, JSON.stringify(builds));
  }

  function addBuild(name, snapshot) {
    var builds = loadAll();
    builds.push({ id: "b_" + Date.now(), name: name, data: snapshot, savedAt: Date.now() });
    saveAll(builds);
    return builds;
  }

  function removeBuild(id) {
    var builds = loadAll().filter(function (b) { return b.id !== id; });
    saveAll(builds);
    return builds;
  }

  // Перезаписывает данные существующей сборки текущим состоянием (имя и id не меняются).
  function updateBuild(id, snapshot) {
    var builds = loadAll();
    var build = builds.find(function (b) { return b.id === id; });
    if (build) {
      build.data = snapshot;
      build.savedAt = Date.now();
      saveAll(builds);
    }
    return builds;
  }

  return { loadAll: loadAll, addBuild: addBuild, removeBuild: removeBuild, updateBuild: updateBuild };
})();
