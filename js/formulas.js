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

  // Применяет статовые эффекты талантов/баффов к копии state.stats (не трогает урон
  // конкретных навыков — для этого см. getSkillTalentDamageBonusPercent).
  function getEffectiveStats(state) {
    var s = Object.assign({}, state.stats);
    var classTalents = WS_TALENTS[state.classId] || [];

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      applyTalentStatEffect(s, t.effect, level);
    });

    state.buffs.forEach(function (buffId) {
      var all = [].concat(WS_BUFFS.consumable, WS_BUFFS.guild, WS_BUFFS.pet, WS_BUFFS.external);
      var b = all.find(function (x) { return x.id === buffId; });
      if (b && b.effect) applyEffect(s, b.effect);
    });

    return s;
  }

  // Старый формат эффекта (баффы): { stat, value, percent }.
  function applyEffect(statsObj, effect) {
    if (!effect || !(effect.stat in statsObj)) return;
    if (effect.percent) {
      statsObj[effect.stat] *= (1 + effect.value / 100);
    } else {
      statsObj[effect.stat] += effect.value;
    }
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
    getTarget: getTarget,
    physicalDamage: physicalDamage,
    magicDamage: magicDamage,
    calcSkillDamage: calcSkillDamage,
    calcSkillTotalDamage: calcSkillTotalDamage
  };
})();
