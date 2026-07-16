/*
 * Реальные навыки Мага (maxLevel — заглушка, реальный потолок прокачки скилла не уточнён,
 * кроме случаев где есть damageFormula — там maxLevel подтверждён вместе с формулой).
 *
 * damageFormula (пока только у Огненного шара, подтверждено игроком по формуле из Excel):
 *   урон = (baseByLevel[ур] + ДД_персонажа * percentByLevel[ур] / 100)
 *          * (1 + <резерв под таланты по типу цели/условные> / 100)
 *          * (1 + <бонус от реликвий навыка> / 100)
 *          * (1 + Сила_навыков / 100)
 *   Резерв под таланты по типу цели пока всегда 0 — числа для них ещё не собраны
 *   (см. js/formulas.js calcSkillTotalDamage).
 *
 * damageDelivery: "instant" (по умолчанию) | "periodic" — тип нанесения урона,
 * используется талантами "Момент силы" / "Долгая смерть".
 */

var WS_MAGE_SKILLS = [
  {
    id: "mage_fireball", name: "Огненный шар", type: "magic", maxLevel: 5, damageDelivery: "instant",
    damageFormula: {
      baseByLevel: { 1: 30, 2: 55, 3: 80, 4: 105, 5: 130 },
      percentByLevel: { 1: 130, 2: 140, 3: 150, 4: 160, 5: 170 }
    }
  },
  {
    id: "mage_time_warp", name: "Искажение времени", type: "magic", maxLevel: 5, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 115, 2: 120, 3: 125, 4: 135, 5: 145 }
    }
  },
  {
    id: "mage_stone_shards", name: "Каменные осколки", type: "magic", maxLevel: 5, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком (нет своего Excel-расчёта, как у Огненного шара) — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentByLevel: { 1: 150, 2: 160, 3: 175, 4: 190, 5: 210 }
    }
  },
  {
    id: "mage_blazing_ground", name: "Пламенеющая земля", type: "magic", maxLevel: 4, damageDelivery: "periodic",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 20, 2: 25, 3: 30, 4: 35 }
    }
  },
  {
    id: "mage_ice_arrow", name: "Ледяная стрела", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 160, 2: 175, 3: 190, 4: 220 }
    }
  },
  {
    id: "mage_overload", name: "Перегрузка", type: "magic", maxLevel: 4, damageDelivery: "periodic",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 30, 2: 40, 3: 50, 4: 60 }
    }
  },
  {
    id: "mage_raging_flame", name: "Яростное пламя", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 100, 2: 110, 3: 120, 4: 135 }
    },
    // Дебафф "повышенный урон по цели" — не привязан к урону самого навыка, выбирается
    // отдельно в панели "Цель" (см. js/ui-target.js, state.targetDebuffs) со СВОИМ уровнем
    // (1-4, независимым от уровня навыка в карточке "Навыки"). Применяется как ФИНАЛЬНЫЙ
    // множитель ко ВСЕМУ урону по цели (любым навыком), см. getTargetDebuffDamageBonusPercent.
    debuffDamageTakenByLevel: { 1: 5, 2: 10, 3: 15, 4: 20 }
  },
  {
    id: "mage_fire_aura", name: "Аура огня", type: "magic", maxLevel: 4, damageDelivery: "instant",
    note: "baseByLevel не подтверждён игроком — принят за 0, реальны только percentByLevel.",
    damageFormula: {
      baseByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
      percentByLevel: { 1: 25, 2: 30, 3: 35, 4: 40 }
    }
  },
  {
    id: "mage_magic_phantom", name: "Альмахада: Гильдия магов: Магический фантом", type: "magic", maxLevel: 1, damageDelivery: "instant", noRelics: true,
    note: "При использовании «Огненного шара», «Ледяной стрелы», «Яростного пламени» (и «Волшебного запрета» — навык ещё не заведён) с шансом 14% в радиусе 3 ярдов призывает фантом на 8 сек (КД срабатывания 1.5 сек, макс. 3 одновременно), который применяет ИСПОЛЬЗОВАННЫЙ навык в ту же цель. Показаны 3 отдельные цифры (обычный + крит), т.к. это 3 независимых источника. Модель наследования (подтверждено 3 тестами — Шар x2, Ледяная стрела x1, разброс ~1.9%): фантом наследует Magic/Physical Power (БЕЗ бонусов от скилл-специфичных талантов на % от ДД, напр. «Магмовая глыба» подтверждённо НЕ влияет), Силу навыков (стат), бонус по классу цели и по типу урона — но НЕ реликвии навыка, НЕ скилл-специфичный крит. урон (напр. Пироманьяк — подтверждено), НЕ адресные бонусы урона и НЕ бонус по HP цели (напр. «Проверка на прочность»). Крит. множитель — ОБЩИЙ (без скилл-специфичных бонусов).",
    mirrorsSkills: ["mage_fireball", "mage_ice_arrow", "mage_raging_flame"]
  }
];
