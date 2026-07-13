/*
 * ЗАГЛУШКА формул урона Warspear Online.
 *
 * Официальных формул разработчик не публиковал; комьюнити-версии противоречат друг другу
 * (особенно взаимодействие Defense/Resilience и формула крита — не найдена вообще).
 * Тела physicalDamage/magicDamage ниже — временная примитивная модель ТОЛЬКО для того,
 * чтобы интерфейс не падал на пустых расчётах. Использовать debug-вкладку, чтобы
 * подобрать/откалибровать реальную формулу по боевым логам, и заменить эти функции.
 */

var WsFormulas = (function () {

  var POWER_RELATED_STATS = ["physPower", "magicPower", "physPowerPercent", "magicPowerPercent"];

  // "% потерянного HP" для talentId: либо принудительно зафиксирован другим талантом
  // (forcesMissingHpFor), либо взят из ручного ввода на вкладке "Таланты".
  function getMissingHpForTalent(talentId, classTalents, state) {
    var forcer = classTalents.find(function (t) {
      return t.forcesMissingHpFor === talentId && (state.talents[t.id] || 0) > 0;
    });
    if (forcer) return forcer.forcedMissingHpValue;
    return (state.talentInputs && state.talentInputs[talentId]) || 0;
  }

  // Стак засчитывается только за ПОЛНЫЙ пройденный порог (строго больше stackHpStep*n,
  // не "или равно") — 3.49% при шаге 3.5% даёт 0 стаков, а ровно 70% при шаге 3.5% даёт
  // 19 стаков, а не 20 (эмпирика: ровно на границе стак ещё не засчитан).
  // ceil(x/step) - 1 даёт то же самое без спецразбора "ровно на границе":
  //   3.49/3.5 -> ceil(0.997)-1 = 1-1 = 0
  //   70/3.5   -> ceil(20)-1   = 20-1 = 19
  //   73.5/3.5 -> ceil(21)-1  = 21-1 = 20
  function getMissingHpStacks(missingHp, stackHpStep) {
    if (missingHp <= 0) return 0;
    return Math.max(0, Math.ceil(missingHp / stackHpStep) - 1);
  }

  // % от одного стакающегося по HP таланта (Внутренняя ярость и т.п.), с учётом
  // вложенных саб-талантов вроде "Внутренняя ярость +", повышающих силу стака.
  function getMissingHpStackPercent(talent, level, classTalents, state) {
    var effect = talent.effect;
    var missingHp = getMissingHpForTalent(talent.id, classTalents, state);
    var stackHpStep = (effect.stackHpStepByLevel && effect.stackHpStepByLevel[level]) || effect.stackHpStep || 1;
    var stacks = getMissingHpStacks(missingHp, stackHpStep);

    var percentPerStack = effect.percentPerStack || 0;
    var bonusTalent = classTalents.find(function (t) {
      return t.subTalentOf === talent.id && t.effect && t.effect.type === "missingHpStackBonusPercent";
    });
    if (bonusTalent && (state.talents[bonusTalent.id] || 0) > 0) {
      percentPerStack += bonusTalent.effect.bonusPerStack;
    }

    return percentPerStack * stacks;
  }

  // Единая сборка Physical/Magic Power: "фиксированный ДД" (введено вручную + уровень +
  // плоские баффы) и "% ДД" (введённый вручную "..., %", фракция, ЛЮБЫЕ таланты/баффы,
  // дающие % урона этому типу — независимо от того, бьют они формально по полю
  // "..., %" или напрямую по Physical/Magic Power: игра считает это одним и тем же
  // процентом, а не отдельными перемножаемыми слоями). Используется и для самого
  // расчёта (getEffectiveStats), и для тултипа в блоке "Итог" — один источник правды.
  function getPowerBreakdown(state, type) {
    var powerField = type === "magic" ? "magicPower" : "physPower";
    var percentField = type === "magic" ? "magicPowerPercent" : "physPowerPercent";
    var classTalents = WS_TALENTS[state.classId] || [];

    var fixInput = state.stats[powerField] || 0;
    var levelBonus = state.stats.level || 0;
    var fixTotal = fixInput + levelBonus;

    var percentEntries = [];
    var manualPercent = state.stats[percentField] || 0;
    if (manualPercent) percentEntries.push({ label: "Введено вручную", value: manualPercent });

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "statPercent" && (eff.stat === powerField || eff.stat === percentField)) {
        percentEntries.push({ label: t.name, value: eff.valuePerLevel * level });
      } else if (eff.type === "missingHpStackStatPercent" && eff.stat === powerField) {
        var value = getMissingHpStackPercent(t, level, classTalents, state);
        if (value) percentEntries.push({ label: t.name, value: value });
      }
    });

    // Бафы (Зелье/Свиток) — каждый привязан к ОДНОМУ типу урона (см. data/buffs.js),
    // учитываются только когда buffInputs.<id>.type совпадает с текущим type.
    var potionCfg = state.buffInputs && state.buffInputs.potion;
    if (potionCfg && potionCfg.percent && potionCfg.type === type) {
      percentEntries.push({ label: "Зелье", value: potionCfg.percent });
    }

    var scrollCfg = state.buffInputs && state.buffInputs.scroll;
    if (scrollCfg && scrollCfg.value && scrollCfg.type === type) {
      if (scrollCfg.mode === "percent") {
        percentEntries.push({ label: "Свиток", value: scrollCfg.value });
      } else {
        fixTotal += scrollCfg.value;
      }
    }

    var cls = WS_CLASSES.find(function (c) { return c.id === state.classId; });
    if (cls && cls.faction === "chosen") {
      percentEntries.push({ label: "Фракция Chosen (Избранные)", value: 2 });
    }

    var percentTotal = percentEntries.reduce(function (sum, e) { return sum + e.value; }, 0);

    // Округление в меньшую сторону (floor), как в эталонном расчёте игрока.
    var finalValue = Math.floor(fixTotal * (1 + percentTotal / 100));

    return {
      fixInput: fixInput,
      levelBonus: levelBonus,
      fixTotal: fixTotal,
      percentEntries: percentEntries,
      percentTotal: percentTotal,
      finalValue: finalValue
    };
  }

  // Применяет статовые эффекты талантов/баффов к копии state.stats — КРОМЕ
  // Physical/Magic Power и их "..., %" полей, те считаются отдельно в getPowerBreakdown
  // (не трогает урон конкретных навыков — для этого см. getSkillTalentDamageBonusPercent).
  function getEffectiveStats(state) {
    var s = Object.assign({}, state.stats);
    var classTalents = WS_TALENTS[state.classId] || [];

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "missingHpStackStatPercent") return; // учтено в getPowerBreakdown
      if (eff.type === "statPercent" && POWER_RELATED_STATS.indexOf(eff.stat) !== -1) return; // учтено в getPowerBreakdown

      applyTalentStatEffect(s, eff, level);
    });

    var physBreakdown = getPowerBreakdown(state, "physical");
    var magicBreakdown = getPowerBreakdown(state, "magic");
    s.physPower = physBreakdown.finalValue;
    s.magicPower = magicBreakdown.finalValue;

    return s;
  }

  // Новый формат эффекта (таланты): { type, stat/skills, valuePerLevel }.
  // Обрабатывает только "statPercent" — эффекты по навыкам считаются отдельно
  // в getSkillTalentDamageBonusPercent (там, где известен конкретный skillId).
  function applyTalentStatEffect(statsObj, effect, level) {
    if (effect.type === "statPercent" && effect.stat in statsObj) {
      statsObj[effect.stat] *= (1 + (effect.valuePerLevel * level) / 100);
    }
  }

  // Сумма %-бонусов урона от талантов текущего класса, применимых к конкретному навыку
  // (адресные skillDamagePercent + общие allSkillsDamagePercent). skillCritDamagePercent
  // намеренно игнорируется — крит временно не участвует в расчёте.
  function getSkillTalentDamageBonusPercent(skillId, state) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "skillDamagePercent" && eff.skills && eff.skills.indexOf(skillId) !== -1) {
        bonus += eff.valuePerLevel * level;
      }
      if (eff.type === "allSkillsDamagePercent") {
        bonus += eff.valuePerLevel * level;
      }
    });

    return bonus;
  }

  function getTarget(targetId) {
    return WS_TARGETS.find(function (t) { return t.id === targetId; }) || WS_TARGETS[0];
  }

  // ЗАГЛУШКА: реальной модели защиты цели пока нет (data/targets.js хранит только
  // условный множитель defMod/resMod) — расчёт ниже лишь грубо ослабляет урон по нему,
  // чтобы UI реагировал на выбор типа цели. НЕ является реальной формулой игры.
  function physicalDamage(attackerStats, target) {
    var base = Math.max(1, (attackerStats.physPower || 0) / (target.defMod || 1));
    return Math.round(base);
  }

  function magicDamage(attackerStats, target) {
    var base = Math.max(1, (attackerStats.magicPower || 0) / (target.resMod || 1));
    return Math.round(base);
  }

  function calcSkillDamage(skill, attackerStats, target) {
    if (skill.type === "magic") return magicDamage(attackerStats, target);
    return physicalDamage(attackerStats, target);
  }

  // ЗАГЛУШКА: масштабирование урона от уровня прокачки навыка — пока прямая
  // пропорция (level x), реальная прогрессия по уровням скилла не задокументирована.
  // Реликвии суммируют свой %-бонус * стаки (несколько реликвий стакаются аддитивно
  // друг с другом), таланты — аддитивно между собой, итоговые множители перемножаются.
  function calcSkillTotalDamage(skill, attackerStats, target, skillConfig, state) {
    var base = calcSkillDamage(skill, attackerStats, target);
    var level = (skillConfig && skillConfig.level) || 1;

    var relics = (skillConfig && skillConfig.relics) || [];
    var relicBonusPercent = relics.reduce(function (sum, relicRef) {
      var relic = WS_RELICS.find(function (r) { return r.id === relicRef.id; });
      return sum + (relic ? relic.damageBonusPercent * relicRef.stacks : 0);
    }, 0);

    var talentBonusPercent = state ? getSkillTalentDamageBonusPercent(skill.id, state) : 0;

    return Math.round(base * level * (1 + relicBonusPercent / 100) * (1 + talentBonusPercent / 100));
  }

  return {
    getEffectiveStats: getEffectiveStats,
    getSkillTalentDamageBonusPercent: getSkillTalentDamageBonusPercent,
    getMissingHpForTalent: getMissingHpForTalent,
    getMissingHpStacks: getMissingHpStacks,
    getMissingHpStackPercent: getMissingHpStackPercent,
    getPowerBreakdown: getPowerBreakdown,
    getTarget: getTarget,
    physicalDamage: physicalDamage,
    magicDamage: magicDamage,
    calcSkillDamage: calcSkillDamage,
    calcSkillTotalDamage: calcSkillTotalDamage
  };
})();
