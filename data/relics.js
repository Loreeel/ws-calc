/*
 * Реликвии, усиливающие урон конкретного навыка. Один навык может иметь несколько
 * РАЗНЫХ реликвий одновременно; некоторые реликвии дополнительно стакаются (несколько
 * копий одной и той же, до maxStacks).
 *
 * allowedSkills — если задано, реликвия доступна ТОЛЬКО для перечисленных навыков
 * (сейчас так у реликвий "карающего умения" — Огненный шар/Каменные осколки/Искажение
 * времени — и "объединённой атаки" — пока подтверждена только для Огненного шара). Если
 * поле не задано — реликвия доступна для любого навыка (как 3 старые заглушки ниже).
 *
 * variableByGroupSize — вместо фиксированного damageBonusPercent бонус зависит от
 * количества членов группы рядом (см. skillConfig.relics[].groupSize, 1-4).
 */

var WS_RELICS = [
  { id: "relic_dmg_1", name: "Реликвия урона I (заглушка)", icon: "🔴", damageBonusPercent: 5, stackable: true, maxStacks: 3 },
  { id: "relic_dmg_2", name: "Реликвия урона II (заглушка)", icon: "🔵", damageBonusPercent: 10, stackable: false, maxStacks: 1 },
  { id: "relic_dmg_3", name: "Реликвия урона III (заглушка)", icon: "🟢", damageBonusPercent: 15, stackable: true, maxStacks: 2 },

  {
    id: "relic_punishing_minor",
    name: "Малая реликвия карающего умения",
    icon: "🔶",
    damageBonusPercent: 6,
    stackable: false,
    maxStacks: 1,
    allowedSkills: ["mage_fireball", "mage_stone_shards", "mage_time_warp"]
  },
  {
    id: "relic_punishing_major",
    name: "Великая реликвия карающего умения",
    icon: "🔺",
    damageBonusPercent: 12,
    stackable: false,
    maxStacks: 1,
    allowedSkills: ["mage_fireball", "mage_stone_shards", "mage_time_warp"]
  },
  {
    id: "relic_united_assault",
    name: "Реликвия объединённой атаки",
    icon: "🟣",
    stackable: false,
    maxStacks: 1,
    allowedSkills: ["mage_fireball"],
    variableByGroupSize: { 1: 6, 2: 8, 3: 10, 4: 12 }
  }
];
