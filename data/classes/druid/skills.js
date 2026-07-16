/*
 * Реальные навыки Друида (см. схему damageFormula в data/classes/mage/skills.js).
 * baseByLevel не подтверждён игроком (нет Excel-калибровки, как у Огненного шара
 * Мага) — принят за 0 везде, реальны только percentByLevel.
 *
 * "Сила воды" — навык с ДВУМЯ источниками урона (основной удар + доп. AoE-компонент),
 * представлены через damageFormula.secondary (см. js/formulas.js getSkillDamageBreakdown).
 *
 * debuff — необязательное информационное поле на навыках, которые ТАКЖЕ накладывают
 * ослабление на цель (снижение скорости атаки/движения и т.п.). Модель ослаблений цели
 * ещё не реализована (см. data/targets.js) — поле хранится только как данные для
 * будущей реализации, ни на что не влияет.
 */

var WS_DRUID_SKILLS = [
  {
    id: "druid_lightning", name: "Молния", type: "magic", maxLevel: 5, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 130, 2: 135, 3: 140, 4: 145, 5: 155 }
    }
  },
  {
    id: "druid_water_force", name: "Сила воды", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 130, 2: 140, 3: 150, 4: 165 },
      secondary: {
        label: "AoE-компонент",
        baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
        percentByLevel: { 1: 60, 2: 70, 3: 80, 4: 90 }
      }
    },
    debuff: { targetStat: "energyRegen", valueRange: "-10..-40%", note: "Снижение реген. энергии цели (+ условный стан с Молнией) — не реализовано, будет добавлено в настройки цели." }
  },
  {
    id: "druid_insect_swarm", name: "Рой насекомых", type: "magic", maxLevel: 5, damageDelivery: "periodic",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel (за тик).",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 40, 2: 45, 3: 50, 4: 55, 5: 60 }
    },
    debuff: { targetStat: "attackSpeed", valueRange: "-20..-45%", note: "Снижение скорости атаки цели — не реализовано, будет добавлено в настройки цели." }
  },
  {
    id: "druid_whirlwind", name: "Смерч", type: "magic", maxLevel: 4, damageDelivery: "periodic",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel (за тик).",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 40, 2: 50, 3: 60, 4: 70 }
    },
    debuff: { targetStat: "movementSpeed", valueRange: "-10..-30%", note: "Снижение скорости движения цели — не реализовано, будет добавлено в настройки цели." }
  },
  {
    id: "druid_elemental_support", name: "Поддержка стихии", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "Призванный элементаль наносит мгновенный магический урон. baseByLevel не подтверждён — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 65, 2: 80, 3: 100, 4: 120 }
    }
  }
];

/*
 * Навыки-ослабления БЕЗ собственного урона (контроль/дебаф) — не входят в WS_DRUID_SKILLS
 * (там только навыки, наносящие урон, для карточек "Навыки"). Хранятся тут как данные
 * для будущей реализации в настройках свойств цели (data/targets.js).
 */
var WS_DRUID_TARGET_DEBUFFS = [
  { id: "druid_root_entanglement", name: "Опутывание корнями", note: "Обездвиживание + блок навыков (с 3 ур.), 2-5 сек — контроль, не реализовано." },
  { id: "druid_forest_song", name: "Лесное пение", note: "Сон (блок движения/атак/навыков), 3-6 сек — контроль, не реализовано." },
  { id: "druid_punishing_roots", name: "Карающие корни", note: "-15..-30% физ./маг. урона цели + обездвиживание, шанс срабатывания 15-35% при получении мгновенного урона, 1.5-3.5 сек — не реализовано." }
];
