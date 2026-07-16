/*
 * Малые таланты, общие для ВСЕХ классов. Подключаются в data/talents.js к списку
 * каждого класса.
 *
 * category: "skills" (вкладка "Навыки"), "talents_main" (Таланты -> Основные),
 * "talents_minor" (Таланты -> Малые), "ship_graveyard" (Кладбище Кораблей),
 * "golden_sands" (Золотые пески).
 *
 * effect.type "bothPowerPercent" — увеличивает И Physical Power, И Magic Power
 * одновременно (в отличие от "statPercent", который бьёт по одному конкретному стату).
 */

var WS_SHARED_MINOR_TALENTS = [
  {
    id: "power_attack_rank1",
    name: "Силовая атака: 1 ранг",
    category: "talents_minor",
    maxLevel: 4,
    description: "Увеличивает физическую и магическую силу персонажа на 0.25% / 0.5% / 0.75% / 1% (по уровням 1-4).",
    effect: { type: "bothPowerPercent", valuePerLevel: 0.25 }
  },
  {
    id: "power_attack_rank2",
    name: "Силовая атака: 2 ранг",
    category: "talents_minor",
    maxLevel: 4,
    description: "Увеличивает физическую и магическую силу персонажа на 0.5% / 0.75% / 1% / 1.25% (по уровням 1-4).",
    effect: { type: "bothPowerPercent", baseValue: 0.5, valuePerLevel: 0.25 }
  },
  {
    id: "power_attack_rank3",
    name: "Силовая атака: 3 ранг",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает физическую и магическую силу персонажа на 0.75% / 1% / 1.25% (по уровням 1-3).",
    effect: { type: "bothPowerPercent", baseValue: 0.75, valuePerLevel: 0.25 }
  },
  {
    id: "power_attack_rank4",
    name: "Силовая атака: 4 ранг",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает физическую и магическую силу персонажа на 0.75% / 1% / 1.25% (по уровням 1-3).",
    effect: { type: "bothPowerPercent", baseValue: 0.75, valuePerLevel: 0.25 }
  },
  {
    id: "feral_fury_1",
    name: "Звериная ярость 1",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает урон навыка по монстрам класса «Нормальный» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeDamagePercent", targetTypes: ["regular"], valuePerLevel: 1 }
  },
  {
    id: "feral_fury_2",
    name: "Звериная ярость 2",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает урон навыка по монстрам класса «Сильный» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeDamagePercent", targetTypes: ["strong"], valuePerLevel: 1 }
  },
  {
    id: "feral_fury_3",
    name: "Звериная ярость 3",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает урон навыка по монстрам класса «Элитный» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeDamagePercent", targetTypes: ["elite"], valuePerLevel: 1 }
  },
  {
    id: "feral_fury_4",
    name: "Звериная ярость 4",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает урон навыка по монстрам класса «Минибосс/Рейдбосс» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeDamagePercent", targetTypes: ["boss"], valuePerLevel: 1 }
  },
  {
    id: "animal_rage_1",
    name: "Животный гнев 1",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает критический урон навыков по монстрам класса «Нормальный» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeCritDamagePercent", targetTypes: ["regular"], valuePerLevel: 1 }
  },
  {
    id: "animal_rage_2",
    name: "Животный гнев 2",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает критический урон навыков по монстрам класса «Сильный» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeCritDamagePercent", targetTypes: ["strong"], valuePerLevel: 1 }
  },
  {
    id: "animal_rage_3",
    name: "Животный гнев 3",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает критический урон навыков по монстрам класса «Элитный» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeCritDamagePercent", targetTypes: ["elite"], valuePerLevel: 1 }
  },
  {
    id: "animal_rage_4",
    name: "Животный гнев 4",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает критический урон навыков по монстрам класса «Минибосс/Рейдбосс» на 1% / 2% / 3% (по уровням 1-3).",
    effect: { type: "targetTypeCritDamagePercent", targetTypes: ["boss"], valuePerLevel: 1 }
  },
  {
    id: "predator_frenzy_1",
    name: "Исступление хищника 1",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает урон навыка по монстрам классов «Нормальный», «Сильный», «Элитный» на 1% / 1.5% / 2% (по уровням 1-3).",
    effect: { type: "targetTypeDamagePercent", targetTypes: ["regular", "strong", "elite"], baseValue: 1, valuePerLevel: 0.5 }
  },
  {
    id: "predator_frenzy_2",
    name: "Исступление хищника 2",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает урон навыка по монстрам класса «Минибосс/Рейдбосс» на 1% / 1.5% / 2% (по уровням 1-3).",
    effect: { type: "targetTypeDamagePercent", targetTypes: ["boss"], baseValue: 1, valuePerLevel: 0.5 }
  },
  {
    id: "crushing_will_rank1",
    name: "Сокрушительная воля 1",
    category: "skills",
    maxLevel: 5,
    description: "Увеличивает критический урон навыков на 6% за стак, до 5 стаков (30%).",
    note: "Критический урон временно не учитывается в расчёте (стат крита убран из калькулятора) — эффект сохранён, но пока не влияет на итоговую цифру.",
    effect: { type: "allSkillsCritDamagePercent", valuePerLevel: 6 }
  },
  {
    id: "crushing_will_rank2",
    name: "Сокрушительная воля 2",
    category: "skills",
    maxLevel: 1,
    description: "Увеличивает магическую силу персонажа на 30%.",
    effect: { type: "statPercent", stat: "magicPowerPercent", valuePerLevel: 30 }
  },
  {
    id: "guild_of_mages_battle_phalanx",
    name: "Гильдия Магов: Боевая фаланга",
    category: "talents_main",
    maxLevel: 1,
    description: "Увеличивает физическую и магическую силу персонажа на 0.08% за каждого игрока на локации, максимум 4%.",
    effect: { type: "playerCountBothPowerPercent", perPlayer: 0.08, cap: 4 }
  },
  {
    id: "underwater_territory_long_standoff",
    name: "Долгое противостояние",
    category: "ship_graveyard",
    maxLevel: 10,
    description: "Увеличивает физическую и магическую силу персонажа на 1.5% за стак, максимум 10 стаков (15%).",
    effect: { type: "bothPowerPercent", valuePerLevel: 1.5 }
  },
  {
    id: "moment_of_power",
    name: "Момент силы",
    category: "talents_minor",
    maxLevel: 4,
    description: "Увеличивает урон от навыков персонажа, наносящих МГНОВЕННЫЙ урон, на 0.5% / 1% / 1.5% / 2% (по уровням 1-4).",
    effect: { type: "damageDeliveryTypePercent", deliveryType: "instant", baseValue: 0.5, valuePerLevel: 0.5 }
  },
  {
    id: "long_death",
    name: "Долгая смерть",
    category: "talents_minor",
    maxLevel: 4,
    description: "Увеличивает урон от навыков персонажа, наносящих ПЕРИОДИЧЕСКИЙ урон, на 0.5% / 1% / 1.5% / 2% (по уровням 1-4).",
    effect: { type: "damageDeliveryTypePercent", deliveryType: "periodic", baseValue: 0.5, valuePerLevel: 0.5 }
  },
  {
    id: "guild_of_almahada_elemental_power",
    name: "Гильдия Альмахада: Сила стихий",
    category: "talents_main",
    maxLevel: 1,
    description: "Улучшает урон всех навыков персонажа на 8%.",
    note: "Применяется отдельным множителем в самом конце формулы, поверх уже полностью посчитанного урона (напр. 3421 -> 3421×1.08), а не складывается с остальными % бонусами.",
    effect: { type: "finalSkillDamagePercent", valuePerLevel: 8 }
  }
];
