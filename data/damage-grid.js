/*
 * Сетка вкладки "Основная": 5 рядов x 3 поля ввода ДД, каждое привязано к слоту
 * экипировки. Расположение (мод ввода):
 *   Ряды 1, 4, 5: [выбор фикс./%, фикс.-only, выбор фикс./%]
 *   Ряды 2, 3:    [фикс.-only, фикс.-only, фикс.-only]
 *
 * mode: "choice" — можно выбрать фиксированный ДД ИЛИ % ДД (выпадающий список, одно из двух).
 *       "dual"   — фиксированный ДД И % ДД одновременно, два отдельных поля (напр. Плащ —
 *                    там реально бывает и то, и другое сразу на одном предмете).
 *       "fixed"  — только фиксированный ДД, без выбора.
 * locked: true    — слот не может давать ДД ни при каких обстоятельствах (напр. Шлем) —
 *                    поле отображается неактивным, всегда игнорируется в расчёте.
 * magicOnly: true — слот даёт ДД только классам с магическим уроном (Доспех/Перчатки/
 *                    Пояс) — жёстко привязан к типу "magic" (без выбора типа), и
 *                    полностью недоступен классам без магического урона.
 *
 * Каждое незаблокированное поле дополнительно привязывается к типу урона (физ./маг.):
 * для классов с одним типом — жёстко на нём, для классов с двумя — свой выбор типа на
 * каждое поле (кроме magicOnly-полей, у них тип всегда фиксирован на "magic").
 */

var WS_DAMAGE_GRID = [
  { id: "dd_r1c1", row: 1, col: 1, mode: "dual", name: "Плащ" },
  { id: "dd_r1c2", row: 1, col: 2, mode: "fixed", name: "Шлем", locked: true },
  { id: "dd_r1c3", row: 1, col: 3, mode: "choice", name: "Амулет" },

  { id: "dd_r2c1", row: 2, col: 1, mode: "fixed", name: "Оружие 1" },
  { id: "dd_r2c2", row: 2, col: 2, mode: "fixed", name: "Доспех", magicOnly: true },
  { id: "dd_r2c3", row: 2, col: 3, mode: "fixed", name: "Оружие 2" },

  { id: "dd_r3c1", row: 3, col: 1, mode: "fixed", name: null, locked: true },
  { id: "dd_r3c2", row: 3, col: 2, mode: "fixed", name: null, locked: true },
  { id: "dd_r3c3", row: 3, col: 3, mode: "fixed", name: "Перчатки", magicOnly: true },

  { id: "dd_r4c1", row: 4, col: 1, mode: "choice", name: "Браслет 1" },
  { id: "dd_r4c2", row: 4, col: 2, mode: "fixed", name: "Пояс", magicOnly: true },
  { id: "dd_r4c3", row: 4, col: 3, mode: "choice", name: "Браслет 2" },

  { id: "dd_r5c1", row: 5, col: 1, mode: "choice", name: "Кольцо 1" },
  { id: "dd_r5c2", row: 5, col: 2, mode: "fixed", name: null, locked: true },
  { id: "dd_r5c3", row: 5, col: 3, mode: "choice", name: "Кольцо 2" }
];
