/*
 * Классы Warspear Online, патч 13.2 "Tales of Feastwood" (данные с официального форума).
 * Навыки/таланты пока не расписаны по классам — заполняются отдельно по мере разбора
 * форумных гайдов по каждому классу.
 *
 * Ниже у каждого класса стоят 2 ЗАГЛУШЕЧНЫХ навыка (WS_STUB_SKILLS) — чтобы можно было
 * проверить панель "Навыки" (прокачка + реликвии) до того, как будут разобраны реальные
 * скиллы. maxLevel и урон условны, реальными формулами/уровнями пока не являются.
 */

function WS_STUB_SKILLS(classId) {
  return [
    { id: classId + "_skill_1", name: "Навык 1 (заглушка)", type: "physical", maxLevel: 5 },
    { id: classId + "_skill_2", name: "Навык 2 (заглушка)", type: "magic", maxLevel: 5 }
  ];
}

// Реальные навыки Мага (maxLevel — заглушка, реальный потолок прокачки скилла не уточнён).
var WS_MAGE_SKILLS = [
  { id: "mage_fireball", name: "Огненный шар", type: "magic", maxLevel: 5 },
  { id: "mage_time_warp", name: "Искажение времени", type: "magic", maxLevel: 5 },
  { id: "mage_stone_shards", name: "Каменные осколки", type: "magic", maxLevel: 5 },
  { id: "mage_blazing_ground", name: "Пламенеющая земля", type: "magic", maxLevel: 5 },
  { id: "mage_ice_arrow", name: "Ледяная стрела", type: "magic", maxLevel: 5 },
  { id: "mage_overload", name: "Перегрузка", type: "magic", maxLevel: 5 },
  { id: "mage_raging_flame", name: "Яростное пламя", type: "magic", maxLevel: 5 },
  { id: "mage_fire_aura", name: "Аура огня", type: "magic", maxLevel: 5 }
];

var WS_CLASSES = [
  // --- Союз Sentinels / Фракция Chosen ---
  { id: "paladin", name: "Paladin (Паладин)", union: "sentinels", faction: "chosen", role: "танк, ближний бой", skills: WS_STUB_SKILLS("paladin") },
  { id: "mage", name: "Mage (Маг)", union: "sentinels", faction: "chosen", role: "кастер, урон", skills: WS_MAGE_SKILLS },
  { id: "priest", name: "Priest (Жрец)", union: "sentinels", faction: "chosen", role: "кастер, хил", skills: WS_STUB_SKILLS("priest") },
  { id: "seeker", name: "Seeker (Искатель)", union: "sentinels", faction: "chosen", role: "дальний бой, арбалет", skills: WS_STUB_SKILLS("seeker") },
  { id: "templar", name: "Templar (Храмовник)", union: "sentinels", faction: "chosen", role: "гибрид танк/дд", skills: WS_STUB_SKILLS("templar") },

  // --- Союз Sentinels / Фракция Firstborn ---
  { id: "blade_dancer", name: "Blade Dancer (Танцор клинка)", union: "sentinels", faction: "firstborn", role: "ближний бой, дуал-вилд", skills: WS_STUB_SKILLS("blade_dancer") },
  { id: "ranger", name: "Ranger (Рейнджер)", union: "sentinels", faction: "firstborn", role: "лук, дальний бой", skills: WS_STUB_SKILLS("ranger") },
  { id: "druid", name: "Druid (Друид)", union: "sentinels", faction: "firstborn", role: "кастер, хил", skills: WS_STUB_SKILLS("druid") },
  { id: "warden", name: "Warden (Страж)", union: "sentinels", faction: "firstborn", role: "танк, ближний бой", skills: WS_STUB_SKILLS("warden") },
  { id: "beastmaster", name: "Beastmaster (Ловчий)", union: "sentinels", faction: "firstborn", role: "дд с питомцем", skills: WS_STUB_SKILLS("beastmaster") },

  // --- Союз Legion / Фракция Mountain Clans ---
  { id: "barbarian", name: "Barbarian (Варвар)", union: "legion", faction: "mountain_clans", role: "танк со щитом", skills: WS_STUB_SKILLS("barbarian") },
  { id: "rogue", name: "Rogue (Разбойник)", union: "legion", faction: "mountain_clans", role: "дд, яды/скрытность", skills: WS_STUB_SKILLS("rogue") },
  { id: "shaman", name: "Shaman (Шаман)", union: "legion", faction: "mountain_clans", role: "кастер, хил", skills: WS_STUB_SKILLS("shaman") },
  { id: "hunter", name: "Hunter (Охотник)", union: "legion", faction: "mountain_clans", role: "дальний бой", skills: WS_STUB_SKILLS("hunter") },
  { id: "chieftain", name: "Chieftain (Вождь)", union: "legion", faction: "mountain_clans", role: "саппорт/дд, тотемы", skills: WS_STUB_SKILLS("chieftain") },

  // --- Союз Legion / Фракция Forsaken ---
  { id: "necromancer", name: "Necromancer (Некромант)", union: "legion", faction: "forsaken", role: "кастер, призыв/урон", skills: WS_STUB_SKILLS("necromancer") },
  { id: "warlock", name: "Warlock (Чернокнижник)", union: "legion", faction: "forsaken", role: "кастер, тёмная магия", skills: WS_STUB_SKILLS("warlock") },
  { id: "death_knight", name: "Death Knight (Рыцарь смерти)", union: "legion", faction: "forsaken", role: "танк", skills: WS_STUB_SKILLS("death_knight") },
  { id: "charmer", name: "Charmer (Заклинатель)", union: "legion", faction: "forsaken", role: "кастер-хил/саппорт", skills: WS_STUB_SKILLS("charmer") },
  { id: "reaper", name: "Reaper (Жнец)", union: "legion", faction: "forsaken", role: "дд", skills: WS_STUB_SKILLS("reaper") }
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
