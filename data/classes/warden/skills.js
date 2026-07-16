/*
 * Реальные навыки Стража (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Мощный удар" — подтверждённый baseByLevel (не 0), как у Огненного шара Мага.
 * Остальные — baseByLevel не подтверждён, принят за 0.
 *
 * "Гнев стража" — чисто дебафф-навык (снижает "силу" цели на 20/25/30/35% по уровням),
 * без собственного урона — НЕ включён сюда, см. WS_WARDEN_TARGET_DEBUFFS в talents.js.
 */

var WS_WARDEN_SKILLS = [
  {
    id: "warden_powerful_strike", name: "Мощный удар", type: "physical", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 25, 2: 50, 3: 70, 4: 95, 5: 120 },
      percentByLevel: { 1: 135, 2: 140, 3: 150, 4: 160, 5: 175 }
    }
  },
  {
    id: "warden_powerful_lunge", name: "Мощный выпад", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 185, 2: 210, 3: 240, 4: 280 }
    }
  },
  {
    id: "warden_shield_throw", name: "Бросок щита", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 150, 2: 160, 3: 180, 4: 200 }
    }
  },
  {
    id: "warden_combat_healing", name: "Опаление гневом: Боевое лечение", type: "physical", maxLevel: 1, damageDelivery: "instant", noRelics: true,
    note: "Ключевой талант ветки «Опаление гневом». Наносит физ. урон 3 противникам в радиусе 4 ярдов в размере 60% от восстановленного здоровья (от навыков и «Кражи здоровья»), не более 25% от макс. HP персонажа за срабатывание.",
    healBasedDamage: { percentOfHeal: 60, capPercentMaxHp: 25 }
  }
];
