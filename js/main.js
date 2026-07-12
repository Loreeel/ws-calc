(function () {
  document.addEventListener("DOMContentLoaded", function () {

    var modeToggle = document.getElementById("modeToggle");
    modeToggle.addEventListener("change", function () {
      WsState.set({ mode: modeToggle.checked ? "advanced" : "basic" });
    });

    var envToggle = document.getElementById("envToggle");
    envToggle.addEventListener("change", function () {
      WsState.set({ envMode: envToggle.checked ? "dev" : "prod" });
    });

    var tabs = document.querySelectorAll("#characterTabs .tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        if (tab.disabled) return;
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");

        var target = tab.getAttribute("data-tab");
        document.querySelectorAll(".tab-panel").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      });
    });

  });
})();
