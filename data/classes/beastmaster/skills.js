/*
 * Реальные навыки Ловчего (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Луна: автоатака" — питомец постоянного действия. Гибридная формула: физическая сила
 * питомца растёт НЕЗАВИСИМО от физ. (D%) И маг. (E%) силы персонажа одновременно, итог
 * засчитывается как физический урон автоатак (damageFormula.hybridPercentByLevel, см.
 * js/formulas.js computeSkillFormulaDamage). Бонусы skillPowerScalingBonus от талантов
 * применяются к ОБЕИМ частям (D и E) одинаково.
 *
 * "Цепная молния" — урон = БОЛЬШЕЕ из (physPower×D%, magicPower×E%), т.е. «преобладающий»
 * тип (hybridPercentByLevel.combine: "max"), а не сумма обеих частей и не два отдельных
 * удара.
 *
 * baseByLevel везде не подтверждён игроком — принят за 0.
 */

var WS_BEASTMASTER_SKILLS = [
  {
    id: "beastmaster_luna_attack", name: "Луна: автоатака", type: "physical", maxLevel: 5, damageDelivery: "instant",
    note: "Гибридная формула (физ.+маг. сила персонажа независимо, см. комментарий выше). Талант «Величие лотоса» дублирует «Лесную ауру» на Луну с уроном -20% — не смоделировано (сама «Лесная аура» ещё не добавлена как навык).",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      hybridPercentByLevel: {
        physical: { 1: 70, 2: 80, 3: 90, 4: 100, 5: 110 },
        magic: { 1: 35, 2: 45, 3: 55, 4: 65, 5: 75 }
      }
    }
  },
  {
    id: "beastmaster_chain_lightning", name: "Цепная молния", type: "physical", maxLevel: 5, damageDelivery: "instant",
    note: "Урон = БОЛЬШЕЕ из (physPower×физ.%, magicPower×маг.%) — «преобладающий» тип, ОДИН удар (не два отдельных источника, в отличие от Water Force/Fiery Arrows). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      hybridPercentByLevel: {
        combine: "max",
        physical: { 1: 70, 2: 80, 3: 90, 4: 100, 5: 115 },
        magic: { 1: 120, 2: 135, 3: 150, 4: 170, 5: 190 }
      }
    },
    debuff: { targetStat: "control", valueRange: "2 / 2.5 / 3 / 3.5 / 4.5 сек", note: "Оглушение цели по уровням 1-5 — не реализовано." }
  },
  {
    id: "beastmaster_moonlight", name: "Лунный свет", type: "magic", maxLevel: 4, damageDelivery: "periodic",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 20, 2: 25, 3: 30, 4: 40 }
    },
    debuff: { targetStat: "movementSpeed", valueRange: "-8..-30%", note: "Замедление цели по уровням 1-4 — не реализовано." }
  }
];
