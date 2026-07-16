/*
 * Реальные навыки Рейнджера (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Мощный выстрел" — единственный навык с подтверждённым baseByLevel (не 0), как у
 * Огненного шара Мага. Остальные — baseByLevel не подтверждён, принят за 0.
 *
 * "Огненные стрелы", "Град стрел", "Мстительный выстрел" — навыки с ДВУМЯ источниками
 * урона (мгновенный удар + доп. периодический/AoE-компонент), см. damageFormula.secondary.
 *
 * "Взрывная ловушка" — множитель не найден в источнике, навык не добавлен.
 */

var WS_RANGER_SKILLS = [
  {
    id: "ranger_powerful_shot", name: "Мощный выстрел", type: "physical", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 },
      percentByLevel: { 1: 100, 2: 103, 3: 106, 4: 109, 5: 112 }
    }
  },
  {
    id: "ranger_fiery_arrows", name: "Огненные стрелы", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Тип урона (физ./стихийный) не подтверждён — принят физическим, как остальные навыки лука. baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 35, 2: 40, 3: 50, 4: 60 },
      secondary: {
        label: "Горение (периодич.)",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
        percentByLevel: { 1: 35, 2: 40, 3: 50, 4: 60 }
      }
    }
  },
  {
    id: "ranger_arrow_rain", name: "Град стрел", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 135, 2: 145, 3: 160, 4: 180 },
      secondary: {
        label: "AoE-компонент",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
        percentByLevel: { 1: 90, 2: 100, 3: 115, 4: 130 }
      }
    }
  },
  {
    id: "ranger_bow_strike", name: "Удар луком", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 115, 2: 125, 3: 135, 4: 150 }
    }
  },
  {
    id: "ranger_vengeful_shot", name: "Мстительный выстрел", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 70, 2: 80, 3: 90, 4: 100 },
      secondary: {
        label: "Кровотечение (периодич.)",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
        percentByLevel: { 1: 20, 2: 30, 3: 40, 4: 50 }
      }
    }
  }
];
