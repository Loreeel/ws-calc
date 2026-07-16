/*
 * Реальные навыки Искателя (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Рассекание" — подтверждённый baseByLevel (не 0), как у Огненного шара Мага.
 * "Опасный удар" — навык с ДВУМЯ источниками урона (мгновенный удар + периодич. DoT),
 * см. damageFormula.secondary.
 * "Истощающий удар" (Draining Strike) — имеет доп. условный бонус +20/25/30/40% урона
 * по оглушённым целям (по уровням) — НЕ смоделирован как отдельный источник (нет модели
 * статуса цели "оглушена"), это НЕ два одновременных удара, в отличие от "Опасного удара".
 * "Инстинкт атаки" — доп. компромисс "-15/20/30/40% урона от навыков, пока активен" НЕ
 * смоделирован (нет общего множителя урона навыков в калькуляторе).
 *
 * Остальные — baseByLevel не подтверждён, принят за 0.
 */

var WS_SEEKER_SKILLS = [
  {
    id: "seeker_slash", name: "Рассекание", type: "physical", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 },
      percentByLevel: { 1: 140, 2: 145, 3: 150, 4: 155, 5: 160 }
    }
  },
  {
    id: "seeker_dangerous_strike", name: "Опасный удар", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 110, 2: 115, 3: 120, 4: 130 },
      secondary: {
        label: "Периодич. эффект (DoT)",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
        percentByLevel: { 1: 30, 2: 40, 3: 50, 4: 60 }
      }
    }
  },
  {
    id: "seeker_crushing_blow", name: "Дробящий удар", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 45, 2: 50, 3: 60, 4: 70 }
    }
  },
  {
    id: "seeker_bloodlust", name: "Жажда крови", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 160, 2: 180, 3: 200, 4: 225 }
    }
  },
  {
    id: "seeker_draining_strike", name: "Истощающий удар", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Доп. условный бонус +20/25/30/40% урона по ОГЛУШЁННЫМ целям (по уровням) НЕ смоделирован — нет модели статуса цели. baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 130, 2: 135, 3: 140, 4: 150 }
    }
  },
  {
    id: "seeker_attack_instinct", name: "Инстинкт атаки", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "AoE-эффект от автоатак. Компромисс «-15/20/30/40% урона от НАВЫКОВ, пока активен» НЕ смоделирован. baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 15, 2: 20, 3: 30, 4: 40 }
    }
  }
];

/*
 * Ослабления цели БЕЗ собственного урона — хранятся как данные для будущей реализации
 * в настройках свойств цели (data/targets.js). Ни на что не влияют.
 */
var WS_SEEKER_TARGET_DEBUFFS = [
  { id: "seeker_solar_nets", name: "Солнечные сети", note: "Сон + снижение защиты всех ближайших врагов — точные числа не указаны в источнике, не реализовано." },
  { id: "seeker_pull", name: "Притяжение", note: "Увеличивает получаемый цель урон на A% на B сек — точные числа не указаны в источнике, не реализовано." }
];
