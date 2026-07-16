/*
 * Таланты Храмовника. Схема effect.type — см. комментарий в data/talents.js.
 *
 * "Учения Харада +" — источник дал только расплывчатые числа ("+2.5% или +1.25%/+2.5%
 * в зависимости от ветки") без чёткой привязки к конкретным веткам — НЕ добавлен, чтобы
 * не внести неверные данные.
 */

var WS_TEMPLAR_TALENTS = [
  {
    id: "templar_censure_plus_oath_keeper",
    name: "Хранитель клятвы: Порицание +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Порицания» на 3% / 6% / 9% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["templar_censure"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "templar_whirlwind_plus_faith_bastion",
    name: "Твердыня веры: Вихрь покаяния +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД (физ. часть) у «Вихря покаяния» на 2% / 4% / 6% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["templar_whirlwind_of_repentance"], baseValue: 2, valuePerLevel: 2 }
  },
  {
    id: "templar_forbidden_technique_plus_faith_bastion",
    name: "Твердыня веры: Запрещённый приём +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Запрещённого приёма» на 3% / 6% / 9% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["templar_forbidden_technique"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "templar_life_particle_plus",
    name: "Частица жизни +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД (обе части, физ. и маг.) у «Частицы жизни» на 5%.",
    effect: { type: "skillPowerScalingBonus", skills: ["templar_life_particle"], valuePerLevel: 5 }
  }
];
