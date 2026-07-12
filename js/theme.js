(function () {
  var STORAGE_KEY = "ws_calc_theme";

  function apply(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function current() {
    return localStorage.getItem(STORAGE_KEY) || "auto";
  }

  function cycle() {
    var order = ["auto", "light", "dark"];
    var idx = order.indexOf(current());
    var next = order[(idx + 1) % order.length];
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
    return next;
  }

  apply(current());

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = cycle();
      btn.title = "Тема: " + next;
    });
  });
})();
