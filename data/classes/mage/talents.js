/*
 * Таланты Мага. Схема effect.type — см. комментарий в data/talents.js.
 *
 * category: "skills" (вкладка "Навыки"), "talents_main" (Таланты -> Основные),
 * "talents_minor" (Таланты -> Малые). Без category — попадает в "talents_main" (см.
 * дефолт в js/ui-talents.js:categoryOf).
 *
 * branch: "pyromancy" | "geomancy" | "arcane_magic" | "guild_adventurers" |
 * "guild_assassins" | "guild_mages" (или массив из нескольких — талант доступен в
 * любой из них) — используется ТОЛЬКО для фильтра "текущая ветка/гильдия" на вкладках
 * Основные/Малые (см. js/ui-talents.js), никак не связано с exclusiveGroup. Таланты
 * БЕЗ branch — группа "Общие", видны всегда независимо от выбора.
 */

var WS_MAGE_TALENTS = [
  {
    id: "mage_dragon_eye",
    name: "Глаз дракона",
    category: "skills",
    maxLevel: 1,
    description: "Увеличивает Сила навыков на 14%.",
    effect: { type: "statPercent", stat: "skillPower", valuePerLevel: 14 }
  },
  {
    id: "mage_magma_boulder",
    name: "Пиромантия: Магмовая глыба",
    category: "talents_main",
    maxLevel: 1,
    branch: "pyromancy",
    exclusiveGroup: "mage_school",
    description: "Повышает урон навыка «Ледяная стрела» на 15%.",
    note: "Прибавляется напрямую к % от ДД «Ледяной стрелы» (как «Огненный шар +» и т.п.), а НЕ как отдельный финальный множитель — см. skillPowerScalingBonus в js/formulas.js.",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_ice_arrow"], valuePerLevel: 15 }
  },
  {
    id: "mage_pyromaniac",
    name: "Пиромантия: Пироманьяк",
    category: "talents_main",
    maxLevel: 1,
    branch: "pyromancy",
    exclusiveGroup: "mage_school",
    description: "Увеличивает критический урон навыков «Огненный шар», «Пламенеющая земля», «Яростное пламя», «Аура огня» и «Ледяная стрела» на 50%.",
    effect: {
      type: "skillCritDamagePercent",
      skills: ["mage_fireball", "mage_blazing_ground", "mage_raging_flame", "mage_fire_aura", "mage_ice_arrow"],
      valuePerLevel: 50
    }
  },
  {
    id: "mage_spatial_manipulation",
    name: "Тайная магия: Манипуляция пространством",
    category: "talents_main",
    maxLevel: 7,
    branch: "arcane_magic",
    exclusiveGroup: "mage_school",
    description: "Увеличивает Magic Power, % на 6% сразу на 1 уровне, затем +2% за каждый следующий уровень (6/8/10/12/14/16/18% на уровнях 1-7).",
    effect: { type: "statPercent", stat: "magicPowerPercent", baseValue: 6, valuePerLevel: 2 }
  },
  {
    id: "mage_nature_magic",
    name: "Геомантия: Магия природы",
    category: "talents_main",
    maxLevel: 1,
    branch: "geomancy",
    exclusiveGroup: "mage_school",
    description: "Увеличивает Сила навыков на 10%.",
    effect: { type: "statPercent", stat: "skillPower", valuePerLevel: 10 }
  },
  {
    id: "mage_toughness_test",
    name: "Пиромантия: Проверка на прочность",
    category: "talents_minor",
    maxLevel: 3,
    branch: "pyromancy",
    exclusiveGroup: "mage_school",
    description: "Увеличивает урон по цели со здоровьем БОЛЬШЕ 70% на 1.5% / 3% / 4.5% (по уровням 1-3).",
    effect: { type: "targetHpBelowDamagePercent", direction: "above", threshold: 70, baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "mage_fireball_plus_base",
    name: "Огненный шар +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Огненного шара» на 5% (напр. 170 → 175).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_fireball"], valuePerLevel: 5 }
  },
  {
    id: "mage_fireball_plus_pyro_geo",
    name: "Пиромантия/Геомантия: Огненный шар +",
    category: "talents_minor",
    maxLevel: 1,
    branch: ["pyromancy", "geomancy"],
    description: "Увеличивает множитель от % ДД у «Огненного шара» на 9%.",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_fireball"], valuePerLevel: 9 }
  },
  {
    id: "mage_fireball_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Огненный шар +",
    category: "talents_minor",
    maxLevel: 1,
    branch: "guild_adventurers",
    description: "Увеличивает множитель от % ДД у «Огненного шара» на 9%.",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_fireball"], valuePerLevel: 9 }
  },
  {
    id: "mage_stone_shards_plus_geo",
    name: "Геомантия: Каменные осколки +",
    category: "talents_minor",
    maxLevel: 1,
    branch: "geomancy",
    description: "Увеличивает множитель от % ДД у «Каменных осколков» на 7%.",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_stone_shards"], valuePerLevel: 7 }
  },
  {
    id: "mage_stone_shards_plus_mages_guild",
    name: "Гильдия Магов: Каменные осколки +",
    category: "talents_minor",
    maxLevel: 1,
    branch: "guild_mages",
    description: "Увеличивает множитель от % ДД у «Каменных осколков» на 7%.",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_stone_shards"], valuePerLevel: 7 }
  },
  {
    id: "mage_time_warp_plus_arcane",
    name: "Тайная магия: Искажение времени +",
    category: "talents_minor",
    maxLevel: 3,
    branch: "arcane_magic",
    description: "Увеличивает множитель от % ДД у «Искажения времени» на 2.5% / 5% / 7.5% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_time_warp"], baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "mage_blazing_ground_plus_pyro",
    name: "Пиромантия: Пламенеющая земля +",
    category: "talents_minor",
    maxLevel: 1,
    branch: "pyromancy",
    description: "Увеличивает множитель от % ДД у «Пламенеющей земли» на 2%.",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_blazing_ground"], valuePerLevel: 2 }
  },
  {
    id: "mage_overload_plus_minor",
    name: "Перегрузка +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Перегрузки» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_overload"], baseValue: 1, valuePerLevel: 1 }
  },
  {
    id: "mage_overload_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Перегрузка +",
    category: "talents_minor",
    maxLevel: 2,
    branch: "guild_adventurers",
    description: "Увеличивает множитель от % ДД у «Перегрузки» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_overload"], baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "mage_overload_plus_mages_guild",
    name: "Гильдия Магов: Перегрузка +",
    category: "talents_minor",
    maxLevel: 2,
    branch: "guild_mages",
    description: "Увеличивает множитель от % ДД у «Перегрузки» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_overload"], baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "mage_overload_plus_almahada_guild",
    name: "Гильдия Альмахада: Перегрузка +",
    category: "talents_minor",
    maxLevel: 2,
    branch: "guild_assassins",
    description: "Увеличивает множитель от % ДД у «Перегрузки» на 1.5% / 3% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_overload"], baseValue: 1.5, valuePerLevel: 1.5 }
  },
  {
    id: "mage_raging_flame_plus_pyro",
    name: "Пиромантия: Яростное пламя +",
    category: "talents_minor",
    maxLevel: 1,
    branch: "pyromancy",
    description: "Увеличивает силу дебафа «Яростного пламени» (доп. урон по цели) на 2% (НЕ множитель урона самого навыка).",
    effect: { type: "debuffEffectPercent", skills: ["mage_raging_flame"], valuePerLevel: 2 }
  },
  {
    id: "mage_raging_flame_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Яростное пламя +",
    category: "talents_minor",
    maxLevel: 2,
    branch: "guild_adventurers",
    description: "Увеличивает множитель от % ДД у «Яростного пламени» на 4% / 8% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_raging_flame"], baseValue: 4, valuePerLevel: 4 }
  },
  {
    id: "mage_raging_flame_plus_mages_guild",
    name: "Гильдия Магов: Яростное пламя +",
    category: "talents_minor",
    maxLevel: 2,
    branch: "guild_mages",
    description: "Увеличивает множитель от % ДД у «Яростного пламени» на 4% / 8% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_raging_flame"], baseValue: 4, valuePerLevel: 4 }
  },
  {
    id: "mage_raging_flame_plus_almahada_guild",
    name: "Гильдия Альмахада: Яростное пламя +",
    category: "talents_minor",
    maxLevel: 2,
    branch: "guild_assassins",
    description: "Увеличивает множитель от % ДД у «Яростного пламени» на 4% / 8% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_raging_flame"], baseValue: 4, valuePerLevel: 4 }
  },
  {
    id: "mage_fire_aura_plus_pyro",
    name: "Пиромантия: Аура огня +",
    category: "talents_minor",
    maxLevel: 3,
    branch: "pyromancy",
    description: "Увеличивает множитель от % ДД у «Ауры огня» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["mage_fire_aura"], baseValue: 1, valuePerLevel: 1 }
  }
];
