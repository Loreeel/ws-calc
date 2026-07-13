/*
 * Таланты Мага. Схема effect.type — см. комментарий в data/talents.js.
 */

var WS_MAGE_TALENTS = [
  {
    id: "mage_dragon_eye",
    name: "Глаз дракона",
    maxLevel: 1,
    description: "Увеличивает Сила навыков на 14%.",
    effect: { type: "statPercent", stat: "skillPower", valuePerLevel: 14 }
  },
  {
    id: "mage_magma_boulder",
    name: "Пиромантия: Магмовая глыба",
    maxLevel: 1,
    branch: "pyromancy",
    exclusiveGroup: "mage_school",
    description: "Повышает урон навыка «Ледяная стрела» на 15%.",
    effect: { type: "skillDamagePercent", skills: ["mage_ice_arrow"], valuePerLevel: 15 }
  },
  {
    id: "mage_pyromaniac",
    name: "Пиромантия: Пироманьяк",
    maxLevel: 1,
    branch: "pyromancy",
    exclusiveGroup: "mage_school",
    description: "Увеличивает критический урон навыков «Огненный шар», «Пламенеющая земля», «Яростное пламя», «Аура огня» и «Ледяная стрела» на 50%.",
    note: "Критический урон временно не учитывается в расчёте (стат крита убран из калькулятора) — эффект сохранён, но пока не влияет на итоговую цифру.",
    effect: {
      type: "skillCritDamagePercent",
      skills: ["mage_fireball", "mage_blazing_ground", "mage_raging_flame", "mage_fire_aura", "mage_ice_arrow"],
      valuePerLevel: 50
    }
  },
  {
    id: "mage_spatial_manipulation",
    name: "Тайная магия: Манипуляция пространством",
    maxLevel: 6,
    branch: "arcane_magic",
    exclusiveGroup: "mage_school",
    description: "Увеличивает Magic Power, % на 2% за уровень (от 6% до 18% суммарно, 6 уровней усиления).",
    effect: { type: "statPercent", stat: "magicPowerPercent", valuePerLevel: 2 }
  },
  {
    id: "mage_nature_magic",
    name: "Геомантия: Магия природы",
    maxLevel: 1,
    branch: "geomancy",
    exclusiveGroup: "mage_school",
    description: "Увеличивает Сила навыков на 10%.",
    effect: { type: "statPercent", stat: "skillPower", valuePerLevel: 10 }
  },
  {
    id: "mage_elemental_power",
    name: "Сила стихий",
    maxLevel: 1,
    description: "Увеличивает урон всех навыков персонажа на 8%.",
    note: "Формула объединения со скилл-специфичными бонусами (Магмовая глыба и т.п.) будет сверена позже — сейчас бонусы суммируются аддитивно.",
    effect: { type: "allSkillsDamagePercent", valuePerLevel: 8 }
  }
];
