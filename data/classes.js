/*
 * Классы Warspear Online, патч 13.2 "Tales of Feastwood" (данные с официального форума).
 *
 * Навыки и таланты КАЖДОГО класса вынесены в data/classes/<id>/skills.js и
 * data/classes/<id>/talents.js (см. подключение скриптов в index.html, которое должно
 * идти РАНЬШЕ этого файла) — здесь только сборка списка классов и ссылки на эти данные.
 * Для классов, у которых пока нет отдельной папки, скиллы — WS_STUB_SKILLS(id), таланты
 * пустые (WS_TALENTS[id] это подставит по умолчанию, см. data/talents.js).
 *
 * damageTypes: какие поля силы урона показывать на вкладке "Основная" для класса —
 * ["physical"], ["magic"] или оба сразу (класс комбинирует оба типа/использует тот,
 * что выше). Для классов без отдельного разбора стоит заглушка ["physical","magic"].
 */

var WS_CLASSES = [
  // --- Союз Sentinels / Фракция Chosen ---
  { id: "paladin", name: "Paladin (Паладин)", union: "sentinels", faction: "chosen", role: "танк, ближний бой", damageTypes: ["physical", "magic"], skills: WS_PALADIN_SKILLS },
  { id: "mage", name: "Mage (Маг)", union: "sentinels", faction: "chosen", role: "кастер, урон", damageTypes: ["magic"], skills: WS_MAGE_SKILLS },
  { id: "priest", name: "Priest (Жрец)", union: "sentinels", faction: "chosen", role: "кастер, хил", damageTypes: ["magic"], skills: WS_PRIEST_SKILLS },
  { id: "seeker", name: "Seeker (Искатель)", union: "sentinels", faction: "chosen", role: "дальний бой, арбалет", damageTypes: ["physical"], skills: WS_SEEKER_SKILLS },
  { id: "templar", name: "Templar (Храмовник)", union: "sentinels", faction: "chosen", role: "гибрид танк/дд", damageTypes: ["physical", "magic"], skills: WS_TEMPLAR_SKILLS },

  // --- Союз Sentinels / Фракция Firstborn ---
  { id: "blade_dancer", name: "Blade Dancer (Танцор клинка)", union: "sentinels", faction: "firstborn", role: "ближний бой, дуал-вилд", damageTypes: ["physical"], skills: WS_BLADE_DANCER_SKILLS },
  { id: "ranger", name: "Ranger (Рейнджер)", union: "sentinels", faction: "firstborn", role: "лук, дальний бой", damageTypes: ["physical"], skills: WS_RANGER_SKILLS },
  { id: "druid", name: "Druid (Друид)", union: "sentinels", faction: "firstborn", role: "кастер, хил", damageTypes: ["magic"], skills: WS_DRUID_SKILLS },
  { id: "warden", name: "Warden (Страж)", union: "sentinels", faction: "firstborn", role: "танк, ближний бой", damageTypes: ["physical"], skills: WS_WARDEN_SKILLS },
  { id: "beastmaster", name: "Beastmaster (Ловчий)", union: "sentinels", faction: "firstborn", role: "дд с питомцем", damageTypes: ["physical", "magic"], skills: WS_BEASTMASTER_SKILLS },

  // --- Союз Legion / Фракция Mountain Clans ---
  { id: "barbarian", name: "Barbarian (Варвар)", union: "legion", faction: "mountain_clans", role: "танк со щитом", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("barbarian") },
  { id: "rogue", name: "Rogue (Разбойник)", union: "legion", faction: "mountain_clans", role: "дд, яды/скрытность", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("rogue") },
  { id: "shaman", name: "Shaman (Шаман)", union: "legion", faction: "mountain_clans", role: "кастер, хил", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("shaman") },
  { id: "hunter", name: "Hunter (Охотник)", union: "legion", faction: "mountain_clans", role: "дальний бой", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("hunter") },
  { id: "chieftain", name: "Chieftain (Вождь)", union: "legion", faction: "mountain_clans", role: "саппорт/дд, тотемы", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("chieftain") },

  // --- Союз Legion / Фракция Forsaken ---
  { id: "necromancer", name: "Necromancer (Некромант)", union: "legion", faction: "forsaken", role: "кастер, призыв/урон", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("necromancer") },
  { id: "warlock", name: "Warlock (Чернокнижник)", union: "legion", faction: "forsaken", role: "кастер, тёмная магия", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("warlock") },
  { id: "death_knight", name: "Death Knight (Рыцарь смерти)", union: "legion", faction: "forsaken", role: "танк", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("death_knight") },
  { id: "charmer", name: "Charmer (Заклинатель)", union: "legion", faction: "forsaken", role: "кастер-хил/саппорт", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("charmer") },
  { id: "reaper", name: "Reaper (Жнец)", union: "legion", faction: "forsaken", role: "дд", damageTypes: ["physical", "magic"], skills: WS_STUB_SKILLS("reaper") }
];

var WS_UNIONS = [
  { id: "sentinels", name: "Sentinels" },
  { id: "legion", name: "Legion" }
];

var WS_FACTIONS = [
  { id: "chosen", name: "Chosen (Избранные)", union: "sentinels" },
  { id: "firstborn", name: "Firstborn (Перворождённые)", union: "sentinels" },
  { id: "mountain_clans", name: "Mountain Clans (Горные кланы)", union: "legion" },
  { id: "forsaken", name: "Forsaken (Проклятые)", union: "legion" }
];
