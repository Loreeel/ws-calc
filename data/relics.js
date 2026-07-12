/*
 * Реликвии, усиливающие урон конкретного навыка. Реальные реликвии из игры пока не
 * разобраны — ниже заглушки с условным бонусом и emoji-иконкой вместо реальной картинки.
 * Один навык может иметь несколько РАЗНЫХ реликвий одновременно; некоторые реликвии
 * дополнительно стакаются (несколько копий одной и той же, до maxStacks).
 */

var WS_RELICS = [
  { id: "relic_dmg_1", name: "Реликвия урона I (заглушка)", icon: "🔴", damageBonusPercent: 5, stackable: true, maxStacks: 3 },
  { id: "relic_dmg_2", name: "Реликвия урона II (заглушка)", icon: "🔵", damageBonusPercent: 10, stackable: false, maxStacks: 1 },
  { id: "relic_dmg_3", name: "Реликвия урона III (заглушка)", icon: "🟢", damageBonusPercent: 15, stackable: true, maxStacks: 2 }
];
