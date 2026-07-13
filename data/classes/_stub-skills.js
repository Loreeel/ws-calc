/*
 * Общий хелпер заглушечных навыков — используется классами, для которых реальный
 * список скиллов ещё не разобран. maxLevel и урон условны.
 */

function WS_STUB_SKILLS(classId) {
  return [
    { id: classId + "_skill_1", name: "Навык 1 (заглушка)", type: "physical", maxLevel: 5 },
    { id: classId + "_skill_2", name: "Навык 2 (заглушка)", type: "magic", maxLevel: 5 }
  ];
}
