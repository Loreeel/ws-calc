/*
 * Атрибуты персонажа Warspear Online (комьюнити-сводка с форума/вики, раздел "Attributes").
 * Официальной документации по игре нет — часть атрибутов (Expertise, стекинг баффов)
 * задокументирована не полностью, см. комментарии.
 *
 * basic: true  -> показывается в базовом режиме (игрок вводит уже итоговое значение).
 * cap: максимум атрибута по данным форума (там, где он известен).
 */

var WS_STATS = {

  meta: [
    { id: "level", name: "Уровень", group: "meta", basic: false, min: 1, max: 34, default: 34 }
  ],

  state: [
    { id: "hpRegen", name: "Health Regeneration", group: "state", basic: false, default: 0 },
    { id: "energy", name: "Energy", group: "state", basic: false, default: 0 }
  ],

  attack: [
    { id: "attackStrength", name: "Attack Strength", group: "attack", basic: false, default: 0,
      note: "Увеличивает физ. и маг. урон от автоатак" },
    { id: "ferocity", name: "Ferocity", group: "attack", basic: false, default: 0,
      note: "+% урона по игрокам, тот же % СНИЖАЕТ урон по NPC" },
    { id: "physPenetration", name: "Physical Penetration, %", group: "attack", basic: false, default: 0, cap: 50,
      note: "Игнорирует % Physical Resistance цели, не действует на Resilience" },
    { id: "magicPenetration", name: "Magic Penetration, %", group: "attack", basic: false, default: 0, cap: 50,
      note: "Игнорирует % Magic Resistance цели, не действует на Resilience" },
    { id: "accuracy", name: "Accuracy, %", group: "attack", basic: false, default: 0, cap: 50,
      note: "Нейтрализует Dodge цели, может быть отрицательной" },
    { id: "rage", name: "Rage, %", group: "attack", basic: false, default: 0,
      note: "Шанс баффа +10% физ./маг. силы на 10с при атаке" },
    { id: "attackSpeed", name: "Attack Speed, %", group: "attack", basic: false, default: 0, cap: 70 },
    { id: "lifeSteal", name: "Life Steal, %", group: "attack", basic: false, default: 0 },
    { id: "expertise", name: "Expertise", group: "attack", basic: false, default: 0,
      note: "Точный механизм не задокументирован на форуме/вики" },
    { id: "penetrationPower", name: "Пробивная способность (%)", group: "attack", basic: true, default: 0 },
    { id: "skillPower", name: "Сила навыков (%)", group: "attack", basic: true, default: 0 },
    { id: "critDamagePower", name: "Сила критического урона (%)", group: "attack", basic: true, default: 0 },
    { id: "autoAttackPower", name: "Сила автоатаки (%)", group: "attack", basic: true, default: 0 },
    { id: "depthsWrath", name: "Гнев глубин (%)", group: "attack", basic: true, default: 0,
      note: "Финальный множитель ×(1+X/100) поверх готового урона навыка (обычного И крита) — подтверждено формулой игрока." }
  ],

  defense: [
    { id: "hp", name: "Health (HP)", group: "defense", basic: true, default: 0 },
    { id: "dodge", name: "Dodge, %", group: "defense", basic: false, default: 0, cap: 50 },
    { id: "block", name: "Block, %", group: "defense", basic: false, default: 0, cap: 25,
      note: "Требуется щит" },
    { id: "parry", name: "Parry, %", group: "defense", basic: false, default: 0, cap: 30 },
    { id: "resilience", name: "Resilience, %", group: "defense", basic: false, default: 0, cap: 60,
      note: "Только PvP: снижает урон от игроков и их шанс/силу крита" },
    { id: "physResistance", name: "Physical Resistance", group: "defense", basic: true, default: 0 },
    { id: "magicResistance", name: "Magic Resistance", group: "defense", basic: true, default: 0 }
  ]
};
