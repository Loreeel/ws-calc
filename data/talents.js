/*
 * Таланты в Warspear Online НЕ являются единым деревом на класс — каждая ветка
 * привязана к конкретному скиллу (напр. ветка "Pyromancy" у Мага модифицирует Frostbolt).
 * Открываются за отдельный ресурс Knowledge + золото, а не за обычные очки скиллов.
 *
 * Сами массивы талантов вынесены в data/classes/<id>/talents.js (см. index.html —
 * они должны подключаться раньше этого файла). Здесь только сборка WS_TALENTS.
 * Классы без отдельного файла получают пустой массив по умолчанию.
 *
 * Схема effect.type:
 *  - "statPercent"             — множитель к стату персонажа: statValue *= 1 + (valuePerLevel*level)/100
 *  - "skillDamagePercent"      — бонус % к урону конкретных навыков (effect.skills — список id навыков)
 *  - "skillCritDamagePercent"  — бонус % к КРИТ. урону конкретных навыков. Стат крита сейчас
 *                                убран из калькулятора (см. решение по crit chance), поэтому этот
 *                                тип эффекта хранится, но пока не участвует в расчёте.
 *  - "allSkillsDamagePercent"  — бонус % к урону ВСЕХ навыков персонажа
 *  - "missingHpStackStatPercent" — бонус % к стату персонажа за каждый "стак" недостающего
 *                                HP (effect.stackHpStep — % HP на 1 стак). Значение "% потерянного
 *                                HP" вводится отдельно на вкладке "Таланты" (state.talentInputs).
 *
 * level — сколько раз применён талант (1 для обычных, до maxLevel для стакающихся).
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

var WS_TALENTS = {
  paladin: [],
  mage: WS_MAGE_TALENTS,
  priest: [],
  seeker: WS_SEEKER_TALENTS,
  templar: [],
  blade_dancer: WS_BLADE_DANCER_TALENTS,
  ranger: [],
  druid: [],
  warden: WS_WARDEN_TALENTS,
  beastmaster: [],
  barbarian: [],
  rogue: [],
  shaman: [],
  hunter: [],
  chieftain: [],
  necromancer: [],
  warlock: [],
  death_knight: [],
  charmer: [],
  reaper: []
};
