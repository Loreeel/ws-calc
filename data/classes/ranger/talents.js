/*
 * Таланты Рейнджера. Схема effect.type — см. комментарий в data/talents.js.
 */

var WS_RANGER_TALENTS = [
  {
    id: "ranger_powerful_shot_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Мощный выстрел +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мощного выстрела» на 3% / 6% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_powerful_shot"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "ranger_powerful_shot_plus_assassins_guild",
    name: "Гильдия Ассасинов: Мощный выстрел +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мощного выстрела» на 3% / 6% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_powerful_shot"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "ranger_powerful_shot_plus_massive_barrage",
    name: "Массивный обстрел: Мощный выстрел +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Мощного выстрела» на 2% / 4% / 6% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_powerful_shot"], baseValue: 2, valuePerLevel: 2 }
  },
  {
    id: "ranger_arrow_rain_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Град стрел +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Града стрел» на 9%.",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_arrow_rain"], valuePerLevel: 9 }
  },
  {
    id: "ranger_arrow_rain_plus_massive_barrage",
    name: "Массивный обстрел: Град стрел +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Града стрел» на 9%.",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_arrow_rain"], valuePerLevel: 9 }
  },
  {
    id: "ranger_vengeful_shot_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Мстительный выстрел +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мстительного выстрела» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_vengeful_shot"], baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "ranger_vengeful_shot_plus_assassins_guild",
    name: "Гильдия Ассасинов: Мстительный выстрел +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мстительного выстрела» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_vengeful_shot"], baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "ranger_vengeful_shot_plus_massive_barrage",
    name: "Массивный обстрел: Мстительный выстрел +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Мстительного выстрела» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["ranger_vengeful_shot"], baseValue: 1, valuePerLevel: 1 }
  }
];
