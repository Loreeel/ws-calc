/*
 * Таланты в Warspear Online НЕ являются единым деревом на класс — каждая ветка
 * привязана к конкретному скиллу (напр. ветка "Pyromancy" у Мага модифицирует Frostbolt).
 * Открываются за отдельный ресурс Knowledge + золото, а не за обычные очки скиллов.
 *
 * Схема effect.type:
 *  - "statPercent"          — множитель к стату персонажа: statValue *= 1 + (valuePerLevel*level)/100
 *  - "skillDamagePercent"   — бонус % к урону конкретных навыков (effect.skills — список id навыков)
 *  - "skillCritDamagePercent" — бонус % к КРИТ. урону конкретных навыков. Стат крита сейчас
 *                            убран из калькулятора (см. решение по crit chance), поэтому этот
 *                            тип эффекта хранится, но пока не участвует в расчёте.
 *  - "allSkillsDamagePercent" — бонус % к урону ВСЕХ навыков персонажа
 *
 * level — сколько раз применён талант (1 для обычных, до maxLevel для стакающихся).
 * Полный список веток/талантов разобран только для Мага. Остальные классы — по мере
 * прохождения форумных гайдов (кроме двух старых подтверждённых примеров из патча 13.2).
 *
 * exclusiveGroup + branch: таланты с одинаковым exclusiveGroup, но РАЗНЫМ branch,
 * взаимоисключающие — выбор таланта одной ветки автоматически снимает выбранные
 * таланты другой ветки той же группы (напр. Пиромантия / Тайная магия / Геомантия у Мага).
 * Таланты одной и той же ветки друг друга не исключают.
 */

var WS_TALENTS = {
  paladin: [],

  mage: [
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
  ],

  priest: [],
  seeker: [],
  templar: [],
  blade_dancer: [
    {
      id: "bd_weakness_suppression",
      name: "Weakness Suppression (ветка Featherlike Agility)",
      maxLevel: 1,
      skillHint: "Spirit of Resistance",
      description: "При активации Spirit of Resistance даёт иммунитет к контролю на 1 сек.",
      effect: null
    }
  ],
  ranger: [],
  druid: [],
  warden: [
    {
      id: "warden_inner_harmony",
      name: "Inner Harmony (ветка Righteous Fury)",
      maxLevel: 1,
      skillHint: "Righteous Fury",
      description: "Увеличивает Resistance от всех источников на 30%.",
      effect: null
    }
  ],
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
