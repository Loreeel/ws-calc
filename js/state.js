var WsState = (function () {
  function buildDefaultStats() {
    var stats = {};
    [].concat(WS_STATS.meta, WS_STATS.state, WS_STATS.attack, WS_STATS.defense)
      .forEach(function (def) {
        stats[def.id] = def.default != null ? def.default : 0;
      });
    return stats;
  }

  var state = {
    envMode: "prod", // "prod" | "dev" — dev открывает незавершённый функционал (напр. защиту)
    classId: null,
    stats: buildDefaultStats(),
    talents: {},   // { [talentId]: level } — level 0/отсутствие ключа = не выбран
    talentInputs: {}, // { [talentId]: number } — доп. ручной ввод для талантов вроде "% потерянного HP"
    buffInputs: {  // ручной ввод по бафам (см. data/buffs.js) — каждый привязан к 1 типу урона
      potion: { percent: 0, type: "physical" },              // type: "physical" | "magic"
      scroll: { mode: "percent", value: 0, type: "physical" } // mode: "fixed" | "percent"
    },
    targetId: "normal",
    targetStats: {
      physDef: 0,        // Physical Defense цели
      magicDef: 0,        // Magic Defense цели
      resilience: 0,       // Устойчивость, %
      flatReduction: 0     // Прямой срез урона (резист)
    },
    skillsConfig: {}   // { [skillId]: { level: number, relics: [{ id: relicId, stacks: number }, ...] } }
  };

  var listeners = [];

  function get() {
    return state;
  }

  function set(patch) {
    Object.assign(state, patch);
    notify();
  }

  function setStat(key, value) {
    state.stats[key] = value;
    notify();
  }

  function setTargetStat(key, value) {
    state.targetStats[key] = value;
    notify();
  }

  function getSkillConfig(skillId) {
    if (!state.skillsConfig[skillId]) {
      state.skillsConfig[skillId] = { level: 1, relics: [] };
    }
    return state.skillsConfig[skillId];
  }

  function setSkillLevel(skillId, level) {
    getSkillConfig(skillId).level = level;
    notify();
  }

  // Добавляет реликвию на навык; если она уже есть и стакается — увеличивает stacks (до maxStacks).
  function addSkillRelic(skillId, relicId) {
    var cfg = getSkillConfig(skillId);
    var relicDef = WS_RELICS.find(function (r) { return r.id === relicId; });
    var existing = cfg.relics.find(function (r) { return r.id === relicId; });

    if (existing) {
      var maxStacks = (relicDef && relicDef.stackable) ? relicDef.maxStacks : 1;
      if (existing.stacks < maxStacks) existing.stacks++;
    } else {
      cfg.relics.push({ id: relicId, stacks: 1 });
    }
    notify();
  }

  // Снимает один стак реликвии с навыка; при stacks=1 убирает реликвию целиком.
  function removeSkillRelic(skillId, relicId) {
    var cfg = getSkillConfig(skillId);
    var idx = cfg.relics.findIndex(function (r) { return r.id === relicId; });
    if (idx === -1) return;

    if (cfg.relics[idx].stacks > 1) cfg.relics[idx].stacks--;
    else cfg.relics.splice(idx, 1);
    notify();
  }

  function setTalentLevel(talentId, level) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var talent = classTalents.find(function (t) { return t.id === talentId; });

    if (level > 0) {
      state.talents[talentId] = level;

      // Взаимоисключающие ветки: включение таланта одной ветки снимает выбранные
      // таланты другой ветки той же exclusiveGroup (напр. Пиромантия / Тайная магия / Геомантия).
      if (talent && talent.exclusiveGroup) {
        classTalents.forEach(function (other) {
          if (other.id === talentId) return;
          if (other.exclusiveGroup === talent.exclusiveGroup && other.branch !== talent.branch) {
            delete state.talents[other.id];
          }
        });
      }
    } else {
      delete state.talents[talentId];
    }
    notify();
  }

  function setTalentInput(talentId, value) {
    state.talentInputs[talentId] = value;
    notify();
  }

  function setBuffInput(buffId, patch) {
    state.buffInputs[buffId] = Object.assign({}, state.buffInputs[buffId], patch);
    notify();
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notify() {
    listeners.forEach(function (fn) { fn(state); });
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(state));
  }

  function restore(snap) {
    state = JSON.parse(JSON.stringify(snap));
    notify();
  }

  return {
    get: get, set: set, setStat: setStat, setTargetStat: setTargetStat,
    getSkillConfig: getSkillConfig, setSkillLevel: setSkillLevel,
    addSkillRelic: addSkillRelic, removeSkillRelic: removeSkillRelic,
    setTalentLevel: setTalentLevel, setTalentInput: setTalentInput,
    setBuffInput: setBuffInput,
    subscribe: subscribe, notify: notify,
    snapshot: snapshot, restore: restore
  };
})();
