/*
 * Таланты Стража.
 */

var WS_WARDEN_TALENTS = [
  {
    id: "warden_inner_harmony",
    name: "Inner Harmony (ветка Righteous Fury)",
    maxLevel: 1,
    skillHint: "Righteous Fury",
    description: "Увеличивает Resistance от всех источников на 30%.",
    effect: null
  },
  {
    id: "warden_powerful_strike_plus_adventurers_guild",
    name: "Гильдия Авантюристов: Мощный удар +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мощного удара» на 3% / 6% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_strike"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "warden_powerful_strike_plus_assassins_guild",
    name: "Гильдия Ассасинов: Мощный удар +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мощного удара» на 3% / 6% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_strike"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "warden_powerful_strike_plus_mages_guild",
    name: "Гильдия Магов: Мощный удар +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мощного удара» на 3% / 6% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_strike"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "warden_powerful_strike_plus_guardian_axe",
    name: "Секира хранителя: Мощный удар +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Мощного удара» на 2.5% / 5% / 7.5% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_strike"], baseValue: 2.5, valuePerLevel: 2.5 }
  },
  {
    id: "warden_powerful_lunge_plus_minor",
    name: "Мощный выпад +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Мощного выпада» на 3% / 6% / 9% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_lunge"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "warden_powerful_lunge_plus_mages_guild",
    name: "Гильдия Магов: Мощный выпад +",
    category: "talents_minor",
    maxLevel: 2,
    description: "Увеличивает множитель от % ДД у «Мощного выпада» на 4% / 8% (по уровням 1-2).",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_lunge"], baseValue: 4, valuePerLevel: 4 }
  },
  {
    id: "warden_powerful_lunge_plus_guardian_axe",
    name: "Секира хранителя: Мощный выпад +",
    category: "talents_minor",
    maxLevel: 1,
    description: "Увеличивает множитель от % ДД у «Мощного выпада» на 8%.",
    effect: { type: "skillPowerScalingBonus", skills: ["warden_powerful_lunge"], valuePerLevel: 8 }
  }
];

/*
 * Ослабления цели БЕЗ собственного урона — хранятся как данные для будущей реализации
 * в настройках свойств цели (data/targets.js). Ни на что не влияют.
 */
var WS_WARDEN_TARGET_DEBUFFS = [
  { id: "warden_punishment", name: "Наказание", note: "Снижение точности цели (5/10/15/20/25% по уровням 1-5) + снижение силы навыков цели (6/8/10/12/16%) — не реализовано." },
  { id: "warden_wardens_wrath", name: "Гнев стража", note: "Чисто дебафф-навык, снижает «силу» цели на 20/25/30/35% по уровням 1-4 (без собственного урона) — не реализовано." },
  { id: "warden_shocking_strike", name: "Шокирующий удар", note: "Оглушение цели на 2/2.5/3/3.5/4 сек по уровням 1-5 — контроль, не реализовано." },
  { id: "warden_swap", name: "Подмена", note: "Увеличивает входящий урон цели на 8/10/13/16% + снижает скорость цели на 40/50/65/80% (по уровням 1-4) — не реализовано." }
];

/*
 * Бафы союзникам/группе от Стража, повышающие защитные параметры (щиты/снижение
 * входящего урона) — не отслеживаются калькулятором (нет модели HP/щитов/mitigации),
 * добавлены в общую вкладку Бафы -> Группа как "unmodeled" (см. data/buffs.js).
 */
