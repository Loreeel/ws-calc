/*
 * Таланты в Warspear Online НЕ являются единым деревом на класс — каждая ветка
 * привязана к конкретному скиллу (напр. ветка "Pyromancy" у Мага модифицирует Frostbolt).
 * Открываются за отдельный ресурс Knowledge + золото, а не за обычные очки скиллов.
 *
 * Сами массивы талантов вынесены в data/classes/<id>/talents.js (см. index.html —
 * они должны подключаться раньше этого файла). Здесь только сборка WS_TALENTS.
 * Классы без отдельного файла получают пустой массив по умолчанию.
 *
 * К каждому классу дополнительно подмешиваются WS_SHARED_MINOR_TALENTS (малые таланты,
 * общие для всех классов, category "minor" — вкладка "Дополнительные").
 *
 * Схема effect.type:
 *  - "statPercent"             — множитель к стату персонажа: statValue *= 1 + (valuePerLevel*level)/100
 *  - "bothPowerPercent"        — % бонус ОДНОВРЕМЕННО к Physical Power и Magic Power
 *                                (в отличие от statPercent, который бьёт по одному стату)
 *  - "skillDamagePercent"      — бонус % к урону конкретных навыков (effect.skills — список id навыков)
 *  - "skillCritDamagePercent"  — бонус % к КРИТ. УРОНУ (не шансу крита) конкретных навыков,
 *                                напр. "Пироманьяк". Участвует в getCritDamageMultiplier(state, skillId)
 *                                — множитель крита теперь считается ОТДЕЛЬНО для каждого
 *                                навыка (см. js/ui-results.js).
 *  - "allSkillsDamagePercent"  — бонус % к урону ВСЕХ навыков персонажа
 *  - "missingHpStackStatPercent" — бонус % к стату персонажа за каждый "стак" недостающего
 *                                HP (effect.stackHpStep — % HP на 1 стак). Значение "% потерянного
 *                                HP" вводится отдельно на вкладке "Таланты" (state.talentInputs).
 *  - "debuffEffectPercent"     — бонус % к эффекту дебафа НА ЦЕЛИ, накладываемого навыком
 *                                (НЕ к урону/множителю самого навыка). Участвует в
 *                                getTargetDebuffDamageBonusPercent, если дебафф ЭТОГО
 *                                навыка выбран/активен в панели "Цель" (state.targetDebuffs,
 *                                см. skill.debuffDamageTakenByLevel в data/classes/<id>/skills.js).
 *  - "healBasedDamagePercent"  — наносит урон, равный effect.percentOfHeal % от вылеченного
 *                                HP, не больше effect.capPercentMaxHp % от макс. HP персонажа
 *                                за срабатывание (напр. Страж, 3 ветка). Модель лечения/HP
 *                                ещё не реализована — эффект хранится, но пока не участвует
 *                                в расчёте.
 *
 * level — сколько раз применён талант (1 для обычных, до maxLevel для стакающихся).
 * category — "main" (по умолчанию) или "minor" (под-вкладка "Дополнительные").
 *
 * exclusiveGroup + branch: таланты с одинаковым exclusiveGroup, но РАЗНЫМ branch,
 * взаимоисключающие — выбор таланта одной ветки автоматически снимает выбранные
 * таланты другой ветки той же группы (напр. Пиромантия / Тайная магия / Геомантия у Мага,
 * Двуручное оружие / Кинжалы у Ожесточения Искателя). Таланты одной ветки друг друга не исключают.
 *
 * forcesMissingHpFor + forcedMissingHpValue: талант без своего эффекта, который вместо
 * этого принудительно фиксирует missingHp-ввод ДРУГОГО таланта (напр. "Одурманивающая боль"
 * у Искателя фиксирует ввод "Внутренней ярости" на 70%).
 */

function WS_CLASS_TALENTS(specific) {
  return (specific || []).concat(WS_SHARED_MINOR_TALENTS);
}

var WS_TALENTS = {
  paladin: WS_CLASS_TALENTS(WS_PALADIN_TALENTS),
  mage: WS_CLASS_TALENTS(WS_MAGE_TALENTS),
  priest: WS_CLASS_TALENTS(WS_PRIEST_TALENTS),
  seeker: WS_CLASS_TALENTS(WS_SEEKER_TALENTS),
  templar: WS_CLASS_TALENTS(WS_TEMPLAR_TALENTS),
  blade_dancer: WS_CLASS_TALENTS(WS_BLADE_DANCER_TALENTS),
  ranger: WS_CLASS_TALENTS(WS_RANGER_TALENTS),
  druid: WS_CLASS_TALENTS(WS_DRUID_TALENTS),
  warden: WS_CLASS_TALENTS(WS_WARDEN_TALENTS),
  beastmaster: WS_CLASS_TALENTS(WS_BEASTMASTER_TALENTS),
  barbarian: WS_CLASS_TALENTS(),
  rogue: WS_CLASS_TALENTS(),
  shaman: WS_CLASS_TALENTS(),
  hunter: WS_CLASS_TALENTS(),
  chieftain: WS_CLASS_TALENTS(),
  necromancer: WS_CLASS_TALENTS(),
  warlock: WS_CLASS_TALENTS(),
  death_knight: WS_CLASS_TALENTS(),
  charmer: WS_CLASS_TALENTS(),
  reaper: WS_CLASS_TALENTS()
};
