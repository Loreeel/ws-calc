/*
 * Таланты Друида. Схема effect.type — см. комментарий в data/talents.js.
 *
 * category: "skills" (вкладка "Навыки"), "talents_main" (Таланты -> Основные),
 * "talents_minor" (Таланты -> Малые). Без category — попадает в "talents_main" (см.
 * дефолт в js/ui-talents.js:categoryOf).
 */

var WS_DRUID_TALENTS = [
  {
    id: "druid_lightning_plus_minor",
    name: "Молния +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Молнии» на 2% / 4% / 6% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["druid_lightning"], baseValue: 2, valuePerLevel: 2 }
  },
  {
    id: "druid_lightning_plus_almahada_guild",
    name: "Гильдия Альмахада: Молния +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Молнии» на 3% / 6% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["druid_lightning"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "druid_insect_swarm_plus_minor",
    name: "Рой насекомых +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Роя насекомых» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["druid_insect_swarm"], baseValue: 1, valuePerLevel: 1 }
  },
  {
    id: "druid_whirlwind_plus_almahada_guild",
    name: "Гильдия Альмахада: Смерч +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Смерча» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["druid_whirlwind"], baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "druid_elemental_support_plus_minor",
    name: "Поддержка стихии +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Поддержки стихии» на 5%.",
    effect: { type: "skillPowerScalingBonus", skills: ["druid_elemental_support"], valuePerLevel: 5 }
  },
  {
    id: "druid_elemental_support_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Поддержка стихии +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Поддержки стихии» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["druid_elemental_support"], baseValue: 1.5, valuePerLevel: 1.5 }
  }
];
