var WsState = (function () {
  function buildDefaultStats() {
    var stats = {};
    [].concat(WS_STATS.meta, WS_STATS.state, WS_STATS.attack, WS_STATS.defense)
      .forEach(function (def) {
        stats[def.id] = def.default != null ? def.default : 0;
      });
    return stats;
  }

  // 15 полей сетки вкладки "Основная" (см. data/damage-grid.js). value — фиксированный
  // ДД, percentValue — % ДД (используется только у "dual"-ячеек, где оба поля активны
  // одновременно). mode для "fixed"-ячеек неизменяем, для "choice"-ячеек по умолчанию
  // "fixed" (переключает, какое из полей — value или percentValue — считается активным).
  // magicOnly-слоты (Доспех/Перчатки/Пояс) всегда жёстко на типе "magic".
  function buildDefaultDamageGrid() {
    var grid = {};
    WS_DAMAGE_GRID.forEach(function (cell) {
      grid[cell.id] = { value: 0, percentValue: 0, mode: "fixed", type: cell.magicOnly ? "magic" : "physical" };
    });
    return grid;
  }

  function buildDefaultState() {
    return {
      envMode: "prod", // "prod" | "dev" — dev открывает незавершённый функционал (напр. защиту)
      classId: null,
      stats: buildDefaultStats(),
      damageGrid: buildDefaultDamageGrid(), // { [cellId]: { value, mode, type } } — см. data/damage-grid.js
      equipmentMode: "advanced", // "basic" | "advanced" — режим ввода ДД экипировки
      equipmentAggregate: {  // используется только в "basic"-режиме экипировки
        physical: { fixed: 0, percent: 0 },
        magic: { fixed: 0, percent: 0 }
      },
      talents: {},   // { [talentId]: level } — level 0/отсутствие ключа = не выбран
      talentInputs: {}, // { [talentId]: number } — доп. ручной ввод для талантов вроде "% потерянного HP"
      talentAffiliation: {}, // { [classId]: { branch: branchId|null, guild: guildId|null } } —
                              // выбранная ветка И гильдия (независимо друг от друга) для
                              // фильтра вкладок Таланты->Основные/Малые (см. js/ui-talents.js)
      buffInputs: {  // ручной ввод по бафам (см. data/buffs.js)
        potion: { optionId: "none" },  // id из WS_POTION_OPTIONS — один эффект одновременно
        scroll: { mode: "percent", value: 0, type: "physical" }, // привязан к 1 типу; mode: "fixed" | "percent"
        guild: { percent: 0 },   // 0 | 3 | 6 | 10 — на физ. И маг. ДД одновременно
        castle: { stacks: 0 },   // 0-5 стаков по 1.5% — на физ. И маг. ДД одновременно
        battle: { active: false }, // вкл/выкл, +10% — на физ. И маг. ДД одновременно
        groupBuffs: {}  // { [buffId]: boolean } — независимые вкл/выкл бафы от группы (WS_GROUP_BUFFS)
      },
      targetId: "normal",
      targetStats: {
        physDef: 0,        // Physical Defense цели
        magicDef: 0,        // Magic Defense цели
        resilience: 0,       // Устойчивость, %
        flatReduction: 0     // Прямой срез урона (резист)
      },
      targetDebuffs: {}, // { [skillId]: { active: boolean, level: number } } — дебаффы на
                          // цели, повышающие входящий урон (напр. Яростное пламя у Мага),
                          // выбираются в панели "Цель" (см. js/ui-target.js)
      skillsConfig: {}   // { [skillId]: { level: number, relics: [{ id: relicId, stacks: number }, ...] } }
    };
  }

  var state = buildDefaultState();

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
      var relicRef = { id: relicId, stacks: 1 };
      // Реликвии с бонусом "по числу членов группы" — доп. поле groupSize (1-4), по умолчанию 1.
      if (relicDef && relicDef.variableByGroupSize) relicRef.groupSize = 1;
      cfg.relics.push(relicRef);
    }
    notify();
  }

  function setSkillRelicGroupSize(skillId, relicId, groupSize) {
    var cfg = getSkillConfig(skillId);
    var relicRef = cfg.relics.find(function (r) { return r.id === relicId; });
    if (!relicRef) return;
    relicRef.groupSize = groupSize;
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

  var TALENT_BRANCH_IDS = ["pyromancy", "geomancy", "arcane_magic"];
  var TALENT_GUILD_IDS = ["guild_adventurers", "guild_assassins", "guild_mages"];

  // Выбор "текущей ветки" ИЛИ "текущей гильдии Альмахада" для фильтра вкладок
  // Таланты->Основные/Малые (см. js/ui-talents.js) — ДВА НЕЗАВИСИМЫХ слота, слот
  // "branch" (Пиромантия/Геомантия/Тайная магия) не влияет на слот "guild" (Гильдия
  // Авантюристов/Ассасинов/Магов) и наоборот. slot: "branch" | "guild".
  //
  // При смене СБРАСЫВАЕТ уровни уже выбранных талантов ИЗ ТОГО ЖЕ СЛОТА (т.е. только
  // других веток при смене ветки, только других гильдий при смене гильдии), чей branch
  // задан и НЕ совпадает с новым значением (в т.ч. если branch — массив, талант
  // остаётся, если новое значение входит в этот массив) — иначе скрытый, но всё ещё
  // активный талант другой ветки/гильдии продолжал бы незаметно влиять на расчёт.
  function setTalentAffiliation(classId, slot, value) {
    var current = Object.assign({}, state.talentAffiliation[classId]);
    current[slot] = value || null;
    state.talentAffiliation[classId] = current;

    var relevantIds = slot === "branch" ? TALENT_BRANCH_IDS : TALENT_GUILD_IDS;
    var classTalents = WS_TALENTS[classId] || [];
    classTalents.forEach(function (t) {
      if (!t.branch) return;
      var branches = Array.isArray(t.branch) ? t.branch : [t.branch];
      var inThisSlot = branches.some(function (b) { return relevantIds.indexOf(b) !== -1; });
      if (!inThisSlot) return; // талант из ДРУГОГО слота (напр. гильдия при смене ветки) — не трогаем
      var matches = branches.indexOf(value) !== -1;
      if (!matches) delete state.talents[t.id];
    });

    notify();
  }

  function setBuffInput(buffId, patch) {
    state.buffInputs[buffId] = Object.assign({}, state.buffInputs[buffId], patch);
    notify();
  }

  // Дебафф на цели (напр. Яростное пламя у Мага) — вкл/выкл + уровень (1-4), см.
  // js/ui-target.js и js/formulas.js:getTargetDebuffDamageBonusPercent.
  function setTargetDebuff(skillId, patch) {
    state.targetDebuffs[skillId] = Object.assign({ active: false, level: 1 }, state.targetDebuffs[skillId], patch);
    notify();
  }

  function setDamageGridCell(cellId, patch) {
    state.damageGrid[cellId] = Object.assign({}, state.damageGrid[cellId], patch);
    notify();
  }

  function setEquipmentMode(mode) {
    state.equipmentMode = mode;
    notify();
  }

  function setEquipmentAggregate(type, patch) {
    state.equipmentAggregate[type] = Object.assign({}, state.equipmentAggregate[type], patch);
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

  // Сливает загруженную сборку с дефолтной структурой состояния (а не заменяет её
  // целиком) — старые сборки, сохранённые до появления новых полей (сетка ДД, бафы
  // и т.п.), догружают недостающее из дефолтов вместо поломки интерфейса.
  function restore(snap) {
    var fresh = buildDefaultState();
    var loaded = JSON.parse(JSON.stringify(snap || {}));

    state = {
      envMode: loaded.envMode || fresh.envMode,
      classId: loaded.classId != null ? loaded.classId : fresh.classId,
      stats: Object.assign({}, fresh.stats, loaded.stats),
      damageGrid: Object.assign({}, fresh.damageGrid, loaded.damageGrid),
      equipmentMode: loaded.equipmentMode || fresh.equipmentMode,
      equipmentAggregate: {
        physical: Object.assign({}, fresh.equipmentAggregate.physical, loaded.equipmentAggregate && loaded.equipmentAggregate.physical),
        magic: Object.assign({}, fresh.equipmentAggregate.magic, loaded.equipmentAggregate && loaded.equipmentAggregate.magic)
      },
      talents: loaded.talents || {},
      talentInputs: loaded.talentInputs || {},
      talentAffiliation: Object.assign({}, fresh.talentAffiliation, loaded.talentAffiliation),
      buffInputs: {
        potion: Object.assign({}, fresh.buffInputs.potion, loaded.buffInputs && loaded.buffInputs.potion),
        scroll: Object.assign({}, fresh.buffInputs.scroll, loaded.buffInputs && loaded.buffInputs.scroll),
        guild: Object.assign({}, fresh.buffInputs.guild, loaded.buffInputs && loaded.buffInputs.guild),
        castle: Object.assign({}, fresh.buffInputs.castle, loaded.buffInputs && loaded.buffInputs.castle),
        battle: Object.assign({}, fresh.buffInputs.battle, loaded.buffInputs && loaded.buffInputs.battle),
        groupBuffs: Object.assign({}, fresh.buffInputs.groupBuffs, loaded.buffInputs && loaded.buffInputs.groupBuffs)
      },
      targetId: loaded.targetId || fresh.targetId,
      targetStats: Object.assign({}, fresh.targetStats, loaded.targetStats),
      targetDebuffs: loaded.targetDebuffs || {},
      skillsConfig: loaded.skillsConfig || {}
    };
    notify();
  }

  return {
    get: get, set: set, setStat: setStat, setTargetStat: setTargetStat,
    getSkillConfig: getSkillConfig, setSkillLevel: setSkillLevel,
    addSkillRelic: addSkillRelic, removeSkillRelic: removeSkillRelic,
    setSkillRelicGroupSize: setSkillRelicGroupSize,
    setTalentLevel: setTalentLevel, setTalentInput: setTalentInput,
    setTalentAffiliation: setTalentAffiliation,
    setBuffInput: setBuffInput, setTargetDebuff: setTargetDebuff, setDamageGridCell: setDamageGridCell,
    setEquipmentMode: setEquipmentMode, setEquipmentAggregate: setEquipmentAggregate,
    subscribe: subscribe, notify: notify,
    snapshot: snapshot, restore: restore
  };
})();
