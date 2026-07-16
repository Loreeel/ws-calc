/*
 * Реальные навыки Храмовника (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Порицание" — подтверждённый baseByLevel (не 0), как у Огненного шара Мага.
 * "Вихрь покаяния", "Частица жизни", "Учения Харада" — урон = БОЛЬШЕЕ из (physPower×физ.%,
 * magicPower×маг.%), т.е. «преобладающий» тип (hybridPercentByLevel.combine: "max"), см.
 * js/formulas.js. Остальные — baseByLevel не подтверждён, принят за 0.
 *
 * "Солнечное клеймо" — не наносит прямого урона (дебафф + хил по автоатаке), не включён.
 */

var WS_TEMPLAR_SKILLS = [
  {
    id: "templar_censure", name: "Порицание", type: "magic", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 30, 2: 55, 3: 80, 4: 105, 5: 130 },
      percentByLevel: { 1: 130, 2: 145, 3: 160, 4: 180, 5: 200 }
    }
  },
  {
    id: "templar_whirlwind_of_repentance", name: "Вихрь покаяния", type: "physical", maxLevel: 5, damageDelivery: "instant",
    note: "Урон засчитывается как физический (условно — большее из физ./маг. вклада).",
    damageFormula: {
      baseByLevel: { 1: 30, 2: 50, 3: 70, 4: 95, 5: 120 },
      hybridPercentByLevel: {
        combine: "max",
        physical: { 1: 115, 2: 125, 3: 140, 4: 155, 5: 175 },
        magic: { 1: 125, 2: 135, 3: 145, 4: 160, 5: 180 }
      }
    }
  },
  {
    id: "templar_forbidden_technique", name: "Запрещённый приём", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 190, 2: 210, 3: 240, 4: 280 }
    }
  },
  {
    id: "templar_life_particle", name: "Частица жизни", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Урон засчитывается как физический (условно — большее из физ./маг. вклада). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      hybridPercentByLevel: {
        combine: "max",
        physical: { 1: 135, 2: 145, 3: 160, 4: 180 },
        magic: { 1: 110, 2: 120, 3: 135, 4: 155 }
      }
    }
  },
  {
    id: "templar_onslaught", name: "Натиск", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 145, 2: 155, 3: 170, 4: 190 }
    },
    debuff: { targetStat: "movementSpeed", valueRange: "-15..-30%", note: "Снижение скорости движения цели по уровням 1-4, 5-8 сек — не реализовано." }
  },
  {
    id: "templar_haradan_teachings", name: "Учения Харада", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Срабатывает по условию (при оглушении). Урон засчитывается как физический (условно — большее из физ./маг. вклада). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      hybridPercentByLevel: {
        combine: "max",
        physical: { 1: 55, 2: 65, 3: 80, 4: 100 },
        magic: { 1: 45, 2: 55, 3: 65, 4: 80 }
      }
    }
  }
];

/*
 * Ослабления цели БЕЗ собственного урона — хранятся как данные для будущей реализации
 * в настройках свойств цели (data/targets.js). Ни на что не влияют.
 */
var WS_TEMPLAR_TARGET_DEBUFFS = [
  { id: "templar_healing_mantra_slow", name: "Мантра исцеления", note: "Снижение скорости движения цели -50/35/25/15% по уровням 1-4 — не реализовано." },
  { id: "templar_reverse_current_stun", name: "Обратный поток", note: "Оглушение цели 1/1.2/1.4/1.6/1.8 сек по уровням 1-5 — не реализовано." },
  { id: "templar_touch_of_truth", name: "Касание истины", note: "Блокирует использование навыков цели на 4-7 сек — не реализовано." },
  { id: "templar_sunburst_stigma", name: "Солнечное клеймо", note: "Дебафф-эффект (без прямого урона) + лечение персонажа от автоатак 110/120/130/140% маг. силы по уровням — не реализовано." }
];
