/*
 * Таланты Ловчего. Схема effect.type — см. комментарий в data/talents.js.
 */

var WS_BEASTMASTER_TALENTS = [
  {
    id: "beastmaster_moonlight_plus_forest_inspiration",
    name: "Воодушевление леса: Лунный свет +",
    category: "talents_minor",
    maxLevel: 3,
    description: "Увеличивает множитель от % ДД у «Лунного света» на 3% / 6% / 9% (по уровням 1-3).",
    effect: { type: "skillPowerScalingBonus", skills: ["beastmaster_moonlight"], baseValue: 3, valuePerLevel: 3 }
  },
  {
    id: "beastmaster_lotus_majesty",
    name: "Воодушевление леса: Величие лотоса",
    category: "talents_main",
    maxLevel: 1,
    description: "Пока активно «Пробуждение зверя», эффект «Лесная аура» действует ОДНОВРЕМЕННО на персонажа и на питомца Луну. Версия на питомце наносит урон навыка, уменьшенный на 20% относительно версии персонажа.",
    note: "Не смоделировано: сама «Лесная аура» ещё не добавлена как навык, а Луна не отслеживается как отдельный источник урона от этого эффекта.",
    effect: null
  }
];
