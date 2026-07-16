/*
 * Модальное окно "Сравнение сборок" — две колонки, в каждой независимый выбор одной из
 * сохранённых сборок (WsStorage). Считает статы/урон навыков ДЛЯ ЧУЖОЙ сборки БЕЗ
 * изменения текущей живой сессии (WsState) — использует WsState.mergeWithDefaults(snapshot)
 * (чистая функция) и передаёт результат напрямую в WsFormulas, который принимает
 * произвольный state-объект, а не только глобальный синглтон.
 */
(function () {
  var SUMMARY_ROWS = [
    ["physPower", "Physical Power", "physical"],
    ["magicPower", "Magic Power", "magic"],
    ["penetrationPower", "Пробивная способность", null],
    ["critDamagePower", "Критический урон", null],
    ["skillPower", "Сила навыков", null],
    ["autoAttackPower", "Сила автоатаки", null]
  ];

  function getDamageTypes(classId) {
    var cls = WS_CLASSES.find(function (c) { return c.id === classId; });
    return (cls && cls.damageTypes) || ["physical", "magic"];
  }

  function getSavedBuilds() {
    return WsStorage.loadAll().slice().sort(function (a, b) { return (b.savedAt || 0) - (a.savedAt || 0); });
  }

  function populateSelect(selectEl, builds, currentValue) {
    selectEl.innerHTML = "";
    var noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "— выберите сборку —";
    selectEl.appendChild(noneOpt);
    builds.forEach(function (b) {
      var opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = b.name;
      selectEl.appendChild(opt);
    });
    selectEl.value = currentValue || "";
  }

  function renderStatsBlock(container, state, effStats) {
    var damageTypes = getDamageTypes(state.classId);
    var wrap = document.createElement("div");
    wrap.className = "compare-stats";

    SUMMARY_ROWS.forEach(function (triple) {
      if (triple[2] && damageTypes.indexOf(triple[2]) === -1) return;
      var raw = effStats[triple[0]] || 0;
      var value = triple[2] ? Math.round(raw) : (Math.round(raw * 100) / 100) + "%";

      var row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML =
        '<span class="stat-row__label">' + triple[1] + '</span>' +
        '<span class="stat-row__value">' + value + '</span>';
      wrap.appendChild(row);
    });

    container.appendChild(wrap);
  }

  function renderSkillsBlock(container, state, effStats) {
    var cls = WS_CLASSES.find(function (c) { return c.id === state.classId; });
    var skills = (cls && cls.skills) || [];
    if (skills.length === 0) return;

    var target = WsFormulas.getTarget(state.targetId);
    var wrathMultiplier = WsFormulas.getDepthsWrathMultiplier(state);

    var wrap = document.createElement("div");
    wrap.className = "compare-skills";

    function addRow(name, dmg, critDmg, isSub) {
      var row = document.createElement("div");
      row.className = "compare-skill-row" + (isSub ? " compare-skill-row--sub" : "");
      row.innerHTML =
        '<span class="compare-skill-row__name">' + (isSub ? "↳ " : "") + name + '</span>' +
        '<span class="compare-skill-row__dmg">' + Math.round(dmg) + '</span>' +
        (critDmg != null ? '<span class="compare-skill-row__crit">крит: ' + Math.round(critDmg) + '</span>' : '');
      wrap.appendChild(row);
    }

    skills.forEach(function (skill) {
      var cfg = (state.skillsConfig && state.skillsConfig[skill.id]) || { level: 1, relics: [] };
      var breakdown = WsFormulas.getSkillDamageBreakdown(skill, effStats, target, cfg, state);

      if (breakdown.mirrors) {
        // Навыки-"зеркала" (напр. Магический фантом) не имеют своего числа — только mirrors.
        addRow(skill.name, 0, null, false);
        breakdown.mirrors.forEach(function (m) {
          var mCritMultiplier = WsFormulas.getCritDamageMultiplier(state);
          var mCritDmg = m.final * mCritMultiplier * wrathMultiplier;
          addRow(m.name, m.final, mCritDmg, true);
        });
        return;
      }

      var dmg = breakdown.final;
      var critMultiplier = WsFormulas.getCritDamageMultiplier(state, skill.id);
      var critDmg = dmg * critMultiplier * wrathMultiplier;
      addRow(skill.name, dmg, critDmg, false);

      if (breakdown.secondary) {
        addRow(breakdown.secondary.label || "Доп. источник урона", breakdown.secondary.final, null, true);
      }
    });

    container.appendChild(wrap);
  }

  function renderBuildContent(container, buildSnapshot) {
    container.innerHTML = "";
    if (!buildSnapshot) {
      container.innerHTML = '<p class="panel__hint">Выберите сборку выше.</p>';
      return;
    }

    var state = WsState.mergeWithDefaults(buildSnapshot);
    if (!state.classId) {
      container.innerHTML = '<p class="panel__hint">В этой сборке не выбран класс.</p>';
      return;
    }

    var effStats = WsFormulas.getEffectiveStats(state);
    renderStatsBlock(container, state, effStats);
    renderSkillsBlock(container, state, effStats);
  }

  function findBuild(builds, id) {
    return builds.find(function (b) { return b.id === id; });
  }

  function openModal() {
    var overlay = document.getElementById("compareModalOverlay");
    overlay.hidden = false;

    var builds = getSavedBuilds();
    var selectA = document.getElementById("compareSelectA");
    var selectB = document.getElementById("compareSelectB");
    populateSelect(selectA, builds, selectA.value);
    populateSelect(selectB, builds, selectB.value);

    renderBuildContent(document.getElementById("compareContentA"), (findBuild(builds, selectA.value) || {}).data);
    renderBuildContent(document.getElementById("compareContentB"), (findBuild(builds, selectB.value) || {}).data);
  }

  function closeModal() {
    document.getElementById("compareModalOverlay").hidden = true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var openBtn = document.getElementById("openCompareBtn");
    if (openBtn) openBtn.addEventListener("click", openModal);

    var closeBtn = document.getElementById("compareModalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    var overlay = document.getElementById("compareModalOverlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !overlay.hidden) closeModal();
      });
    }

    var selectA = document.getElementById("compareSelectA");
    var selectB = document.getElementById("compareSelectB");
    if (selectA) {
      selectA.addEventListener("change", function () {
        var builds = getSavedBuilds();
        renderBuildContent(document.getElementById("compareContentA"), (findBuild(builds, selectA.value) || {}).data);
      });
    }
    if (selectB) {
      selectB.addEventListener("change", function () {
        var builds = getSavedBuilds();
        renderBuildContent(document.getElementById("compareContentB"), (findBuild(builds, selectB.value) || {}).data);
      });
    }
  });
})();
