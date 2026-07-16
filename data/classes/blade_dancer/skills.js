/*
 * Реальные навыки Танцора клинка / Разящего клинка (см. схему damageFormula в
 * data/classes/mage/skills.js). baseByLevel не подтверждён игроком — принят за 0
 * везде, реальны только percentByLevel.
 *
 * "Лезвие вихря" имеет доп. условный бонус урона по кровоточащим целям (+15/20/25/30/40%
 * по уровням) — НЕ реализован как отдельный источник урона (нет модели "цель кровоточит"
 * в панели "Цель"), см. поле note на навыке.
 *
 * "Ураган ударов" — множитель указан "за удар" (навык бьёт несколько раз за
 * использование), количество ударов не подтверждено — see note.
 */

var WS_BLADE_DANCER_SKILLS = [
  {
    id: "bd_lightning_strike", name: "Молниеносный удар", type: "physical", maxLevel: 5, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 140, 2: 145, 3: 150, 4: 155, 5: 160 }
    }
  },
  {
    id: "bd_whirlwind_blade", name: "Лезвие вихря", type: "physical", maxLevel: 5, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0. Доп. условный бонус +15/20/25/30/40% по кровоточащим целям (по уровням) НЕ учтён — нет модели статуса цели.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 90, 2: 95, 3: 100, 4: 110, 5: 120 }
    }
  },
  {
    id: "bd_hamstring", name: "Подрезать сухожилие", type: "physical", maxLevel: 5, damageDelivery: "periodic",
    note: "Подтверждён только тик кровотечения (каждые 2 сек) — мгновенный удар (если есть) не подтверждён. baseByLevel принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 40, 2: 45, 3: 50, 4: 55, 5: 60 }
    },
    debuff: { targetStat: "attackSpeed", valueRange: "не указано", note: "Также накладывает кровотечение как контроль — детали см. Ошеломление/др. эффекты класса." }
  },
  {
    id: "bd_sonic_strike", name: "Звуковой удар", type: "physical", maxLevel: 4, damageDelivery: "periodic",
    note: "Тик каждые 3 сек. baseByLevel не подтверждён — принят за 0. Скачок 45→55% на уровнях 3-4 — как в источнике, не опечатка проверяющего.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 35, 2: 40, 3: 45, 4: 55 }
    },
    debuff: { targetStat: "evasion", valueRange: "-10..-25%", note: "«Притупление» — снижение уклонения цели (10-25% по уровням 1-4) — не реализовано, будет добавлено в настройки цели." }
  },
  {
    id: "bd_storm_of_strikes", name: "Ураган ударов", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Множитель указан ЗА ОДИН удар серии — общее число ударов за использование не подтверждено. baseByLevel принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 40, 2: 40, 3: 45, 4: 45 }
    },
    debuff: { targetStat: "movementSpeed", valueRange: "-10..-25%", note: "«Замедление» — снижение скорости движения цели (10-25% по уровням 1-4) — не реализовано, будет добавлено в настройки цели." }
  },
  {
    id: "bd_counterattack", name: "Контратака", type: "physical", maxLevel: 4, damageDelivery: "instant",
    note: "Реактивный урон (срабатывает в ответ на атаку). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 25, 2: 32, 3: 40, 4: 50 }
    }
  }
];

/*
 * Ослабление цели БЕЗ отдельного урона (только контроль/дебаф-статы) — хранится как
 * данные для будущей реализации в настройках свойств цели (data/targets.js).
 */
var WS_BLADE_DANCER_TARGET_DEBUFFS = [
  { id: "bd_stun_debuff", name: "Ошеломление", note: "Снижение физ./маг. силы цели (20-50% по уровням 1-5) + снижение скорости атаки (12-35%) — не реализовано." }
];
