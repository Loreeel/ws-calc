/*
 * Таланты Искателя. Схема effect.type — см. комментарий в data/talents.js.
 *
 * "Внутренняя ярость" — особый эффект "missingHpStackStatPercent": бонус зависит от
 * ВРЕМЕННОГО ввода "% потерянного HP" (не от постоянных статов персонажа), который
 * задаётся прямо на вкладке "Таланты" рядом с талантом.
 *
 * Уровень таланта (1-4) меняет НЕ силу бонуса за стак (она фиксированная, 1%), а порог
 * HP% на 1 стак (effect.stackHpStepByLevel):
 *   1 ур. — 6%, 2 ур. — 5.5%, 3 ур. — 4.5%, 4 ур. — 3.5% (подтверждено).
 *
 * Расчёт стаков (js/formulas.js:getMissingHpStacks):
 *   stacks = ceil(missingHp% / stackHpStep) - 1, минимум 0 — стак засчитывается только
 *   за ПОЛНОСТЬЮ пройденный порог (на 4 ур.: 3.49% ещё 0 стаков, 70% даёт 19, а не 20 —
 *   подтверждено эмпирически).
 *
 * "Внутренняя ярость +" — малый классовый талант (subTalentOf), добавляет +0.1% к силе
 * стака (1% -> 1.1%). Рендерится как доп. галочка ВНУТРИ строки "Внутренней ярости",
 * не отдельным пунктом списка.
 *
 * "Одурманивающая боль" не имеет собственного стат-эффекта — она принудительно
 * фиксирует missingHp-ввод "Внутренней ярости" на 70% через forcesMissingHpFor.
 */

var WS_SEEKER_TALENTS = [
  {
    id: "seeker_inner_rage",
    name: "Внутренняя ярость",
    maxLevel: 4,
    defaultLevel: 4,
    description: "Даёт {percent}% физ. урона за каждый стак потерянного здоровья. Порог HP% на 1 стак зависит от уровня: 6% (ур.1) / 5.5% (ур.2) / 4.5% (ур.3) / 3.5% (ур.4).",
    effect: {
      type: "missingHpStackStatPercent",
      stat: "physPower",
      percentPerStack: 1,
      stackHpStepByLevel: { 1: 6, 2: 5.5, 3: 4.5, 4: 3.5 }
    }
  },
  {
    id: "seeker_inner_rage_plus",
    name: "Внутренняя ярость +",
    maxLevel: 1,
    subTalentOf: "seeker_inner_rage",
    description: "Малый классовый талант: +0.1% к силе стака «Внутренней ярости» (итого 1.1% за стак).",
    effect: { type: "missingHpStackBonusPercent", bonusPerStack: 0.1 }
  },
  {
    id: "seeker_debilitating_pain",
    name: "Одурманивающая боль",
    maxLevel: 1,
    description: "Бонус «Внутренней ярости» больше не зависит от реального потерянного HP — всегда считается так, будто здоровья осталось 30% (потеряно 70%, это 19 стаков на 4 уровне).",
    forcesMissingHpFor: "seeker_inner_rage",
    forcedMissingHpValue: 70,
    effect: null
  },
  {
    id: "seeker_hardening_2h",
    name: "Ожесточение: Двуручное оружие",
    maxLevel: 1,
    branch: "weapon_2h",
    exclusiveGroup: "seeker_hardening",
    description: "+22% Physical Power при экипированном двуручном оружии.",
    effect: { type: "statPercent", stat: "physPower", valuePerLevel: 22 }
  },
  {
    id: "seeker_hardening_daggers",
    name: "Ожесточение: Кинжалы",
    maxLevel: 1,
    branch: "weapon_daggers",
    exclusiveGroup: "seeker_hardening",
    description: "+25% Сила автоатаки при экипированных кинжалах.",
    effect: { type: "statPercent", stat: "autoAttackPower", valuePerLevel: 25 }
  }
];
