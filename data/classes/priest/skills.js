/*
 * Реальные навыки Жреца (см. схему damageFormula в data/classes/mage/skills.js).
 *
 * "Слёзы Харада" — подтверждённый baseByLevel (не 0), как у Огненного шара Мага.
 * "Кара света" — навык с ДВУМЯ источниками урона ОДНОГО типа (осн. удар + AoE-компонент,
 * как Град стрел у Рейнджера). Остальные — baseByLevel не подтверждён, принят за 0.
 *
 * "Расплата" — доп. немоделируемое масштабирование "+1% урона за каждый 1% недостающего
 * HP цели" (см. note) — не то же самое, что threshold-таланты (targetHpBelowDamagePercent).
 * "Искупление" — чистый хил, без урона, не включён.
 */

var WS_PRIEST_SKILLS = [
  {
    id: "priest_tears_of_harad", name: "Слёзы Харада", type: "magic", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 30, 2: 55, 3: 80, 4: 105, 5: 130 },
      percentByLevel: { 1: 110, 2: 115, 3: 120, 4: 125, 5: 130 }
    }
  },
  {
    id: "priest_retribution", name: "Расплата", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "Доп. масштабирование «+1% урона за каждый 1% недостающего HP цели» НЕ смоделировано (нет такого механизма в калькуляторе). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 145, 2: 160, 3: 180, 4: 200 }
    }
  },
  {
    id: "priest_word_of_power", name: "Слово силы", type: "magic", maxLevel: 5, damageDelivery: "instant",
    note: "Урон срабатывает при истечении эффекта («Обет проклятья» — см. WS_PRIEST_TARGET_DEBUFFS). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 120, 2: 125, 3: 135, 4: 145, 5: 160 }
    }
  },
  {
    id: "priest_mystical_mark", name: "Мистическая метка", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "Урон срабатывает при окончании эффекта. baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 140, 2: 150, 3: 165, 4: 185 }
    }
  },
  {
    id: "priest_light_judgment", name: "Кара света", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 120, 2: 130, 3: 145, 4: 160 },
      secondary: {
        label: "AoE-компонент",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
        percentByLevel: { 1: 100, 2: 105, 3: 115, 4: 130 }
      }
    }
  },
  {
    id: "priest_elusive_threat", name: "Неуловимая угроза", type: "magic", maxLevel: 4, damageDelivery: "periodic",
    note: "Доп. бонус пробивной способности (4/8/12/15% по уровням) для ЭТОГО навыка НЕ смоделирован (нет per-навыкового модификатора пробития). baseByLevel не подтверждён — принят за 0.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 55, 2: 65, 3: 75, 4: 90 }
    }
  }
];

/*
 * Ослабления цели БЕЗ собственного урона — хранятся как данные для будущей реализации
 * в настройках свойств цели (data/targets.js). Ни на что не влияют.
 */
var WS_PRIEST_TARGET_DEBUFFS = [
  { id: "priest_curse_oath", name: "Слово силы: Обет проклятья", note: "Увеличивает затраты энергии на навыки цели на 100/115/135/155/180% по уровням, 6-8 сек — не реализовано." },
  { id: "priest_truce", name: "Перемирие", note: "Увеличивает получаемый цель урон на 12/15/18/22/25% + снижает наносимый ею урон на 50/55/65/75/85%, 4-7.2 сек (себе тоже штраф -50%/-25% vs игроки/монстры) — не реализовано." },
  { id: "priest_passivity", name: "Неуловимая угроза: Пассивность", note: "Трата энергии цели при движении 4/5/6/8% от макс. энергии, 4-7 сек — не реализовано." },
  { id: "priest_mystical_mark_defense", name: "Мистическая метка: снижение защиты", note: "Снижает физ./маг. защиту цели на 15/20/30/40% по уровням, 15 сек — не реализовано." },
  { id: "priest_light_judgment_silence", name: "Кара света: Немота", note: "Блокирует использование навыков цели на 3-6 сек — контроль, не реализовано." }
];
