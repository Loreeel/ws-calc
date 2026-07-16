/*
 * Таланты Паладина. Схема effect.type — см. комментарий в data/talents.js.
 * effect.part ("primary"/"secondary") — фильтр для навыков с двумя частями формулы
 * разных типов (см. "Очищение" в skills.js и js/formulas.js getSkillPowerScalingBonus).
 */

var WS_PALADIN_TALENTS = [
  {
    id: "paladin_cleansing_plus_holy_warrior",
    name: "Святой воин: Очищение +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у мгновенной (физ.) части «Очищения» на 2.5% / 5% / 7.5% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["paladin_cleansing"], part: "primary", baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "paladin_cleansing_plus_retribution",
    name: "Воздаяние: Очищение +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у периодической (маг.) части «Очищения» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["paladin_cleansing"], part: "secondary", baseValue: 1, valuePerLevel: 1 }
  },
  {
    id: "paladin_solar_seal_plus",
    name: "Солнечная печать +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Солнечной печати» на 8%.",
    effect: { type: "skillPowerScalingBonus", skills: ["paladin_solar_seal"], valuePerLevel: 8 }
  },
  {
    id: "paladin_harad_banner_plus_retribution",
    name: "Воздаяние: Призыв Харада +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Знамени Харада» на 8%.",
    effect: { type: "skillPowerScalingBonus", skills: ["paladin_harad_banner"], valuePerLevel: 8 }
  }
];
