/*
 * Таланты Жреца. Схема effect.type — см. комментарий в data/talents.js.
 * "Целительное прикосновение +"/"Кара света + (Служение свету, доп. длительность)" —
 * бонусы к хилу/длительности, НЕ к урону — не добавлены (см. конвенцию по хилам в проекте).
 */

var WS_PRIEST_TALENTS = [
  {
    id: "priest_tears_of_harad_plus_covenant",
    name: "Служение свету: Слёзы Харада +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Слёз Харада» на 7.5%.",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_tears_of_harad"], valuePerLevel: 7.5 }
  },
  {
    id: "priest_tears_of_harad_plus_inquisition",
    name: "Инквизиция: Слёзы Харада +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Слёз Харада» на 2.5% / 5% / 7.5% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_tears_of_harad"], baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "priest_tears_of_harad_plus_holy_wrath",
    name: "Священный гнев: Слёзы Харада +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Слёз Харада» на 2.5% / 5% / 7.5% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_tears_of_harad"], baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "priest_tears_of_harad_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Слёзы Харада +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Слёз Харада» на 2.5% / 5% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_tears_of_harad"], baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "priest_tears_of_harad_plus_assassins_guild",
    name: "Гильдия Ассасинов: Слёзы Харада +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Слёз Харада» на 2.5% / 5% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_tears_of_harad"], baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "priest_retribution_plus_inquisition",
    name: "Инквизиция: Расплата +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Расплаты» на 10%.",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_retribution"], valuePerLevel: 10 }
  },
  {
    id: "priest_mystical_mark_plus_inquisition",
    name: "Инквизиция: Мистическая метка +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Мистической метки» на 9%.",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_mystical_mark"], valuePerLevel: 9 }
  },
  {
    id: "priest_mystical_mark_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Мистическая метка +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мистической метки» на 5% / 10% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_mystical_mark"], baseValue: 5, valuePerLevel: 5 }
  },
  {
    id: "priest_mystical_mark_plus_assassins_guild",
    name: "Гильдия Ассасинов: Мистическая метка +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мистической метки» на 5% / 10% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_mystical_mark"], baseValue: 5, valuePerLevel: 5 }
  },
  {
    id: "priest_light_judgment_plus_inquisition",
    name: "Инквизиция: Кара света +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Кары света» на 8%.",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_light_judgment"], valuePerLevel: 8 }
  },
  {
    id: "priest_light_judgment_plus_holy_wrath",
    name: "Священный гнев: Кара света +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Кары света» на 8%.",
    effect: { type: "skillPowerScalingBonus", skills: ["priest_light_judgment"], valuePerLevel: 8 }
  }
];
