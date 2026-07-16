/*
 * Реальные навыки Паладина (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Очищение" — навык с ДВУМЯ источниками урона РАЗНЫХ типов одновременно: мгновенный
 * физ. удар (primary) + периодический маг. эффект (secondary, formula.type: "magic"
 * переопределяет skill.type только для этой части). Единственный навык с подтверждённым
 * baseByLevel (не 0) в этом классе.
 *
 * "Солнечная печать" — урон = БОЛЬШЕЕ из (physPower×физ.%, magicPower×маг.%), см.
 * hybridPercentByLevel/combine:"max" в js/formulas.js (как «Цепная молния» у Ловчего).
 *
 * "Небесный свет" — чистый хил, без урона, не включён.
 */

var WS_PALADIN_SKILLS = [
  {
    id: "paladin_cleansing", name: "Очищение", type: "physical", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 15, 2: 25, 3: 35, 4: 50, 5: 65 },
      percentByLevel: { 1: 135, 2: 145, 3: 160, 4: 185, 5: 200 },
      secondary: {
        label: "Периодич. эффект (маг.)",
        type: "magic",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        percentByLevel: { 1: 50, 2: 55, 3: 60, 4: 70, 5: 80 }
      }
    }
  },
  {
    id: "paladin_solar_seal", name: "Солнечная печать", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Урон засчитывается как физический (условно — большее из физ./маг. вклада, см. damageFormula.hybridPercentByLevel.combine). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      hybridPercentByLevel: {
        combine: "max",
        physical: { 1: 170, 2: 180, 3: 200, 4: 220 },
        magic: { 1: 180, 2: 200, 3: 220, 4: 250 }
      }
    }
  },
  {
    id: "paladin_harad_banner", name: "Знамя Харада", type: "magic", maxLevel: 4, damageDelivery: "periodic",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 50, 2: 60, 3: 70, 4: 85 }
    }
  }
];
