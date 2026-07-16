/*
 * ЗАГЛУШКА формул урона Warspear Online.
 *
 * Официальных формул разработчик не публиковал; комьюнити-версии противоречат друг другу
 * (особенно взаимодействие Defense/Resilience и формула крита — не найдена вообще).
 * Тела physicalDamage/magicDamage ниже — временная примитивная модель ТОЛЬКО для того,
 * чтобы интерфейс не падал на пустых расчётах. Использовать debug-вкладку, чтобы
 * подобрать/откалибровать реальную формулу по боевым логам, и заменить эти функции.
 */

var WsFormulas = (function () {

  var POWER_RELATED_STATS = ["physPower", "magicPower", "physPowerPercent", "magicPowerPercent"];

  // Округление ТОЛЬКО для читаемости текста в тултипах (2 знака после запятой) —
  // сами расчёты остаются полностью дробными, см. правило "не округлять в расчётах".
  function round2(x) {
    return Math.round(x * 100) / 100;
  }

  // "% потерянного HP" для talentId: либо принудительно зафиксирован другим талантом
  // (forcesMissingHpFor), либо взят из ручного ввода на вкладке "Таланты".
  function getMissingHpForTalent(talentId, classTalents, state) {
    var forcer = classTalents.find(function (t) {
      return t.forcesMissingHpFor === talentId && (state.talents[t.id] || 0) > 0;
    });
    if (forcer) return forcer.forcedMissingHpValue;
    return (state.talentInputs && state.talentInputs[talentId]) || 0;
  }

  // Стак засчитывается только за ПОЛНЫЙ пройденный порог (строго больше stackHpStep*n,
  // не "или равно") — 3.49% при шаге 3.5% даёт 0 стаков, а ровно 70% при шаге 3.5% даёт
  // 19 стаков, а не 20 (эмпирика: ровно на границе стак ещё не засчитан).
  // ceil(x/step) - 1 даёт то же самое без спецразбора "ровно на границе":
  //   3.49/3.5 -> ceil(0.997)-1 = 1-1 = 0
  //   70/3.5   -> ceil(20)-1   = 20-1 = 19
  //   73.5/3.5 -> ceil(21)-1  = 21-1 = 20
  function getMissingHpStacks(missingHp, stackHpStep) {
    if (missingHp <= 0) return 0;
    return Math.max(0, Math.ceil(missingHp / stackHpStep) - 1);
  }

  // % от одного стакающегося по HP таланта (Внутренняя ярость и т.п.), с учётом
  // вложенных саб-талантов вроде "Внутренняя ярость +", повышающих силу стака.
  function getMissingHpStackPercent(talent, level, classTalents, state) {
    var effect = talent.effect;
    var missingHp = getMissingHpForTalent(talent.id, classTalents, state);
    var stackHpStep = (effect.stackHpStepByLevel && effect.stackHpStepByLevel[level]) || effect.stackHpStep || 1;
    var stacks = getMissingHpStacks(missingHp, stackHpStep);

    var percentPerStack = effect.percentPerStack || 0;
    var bonusTalent = classTalents.find(function (t) {
      return t.subTalentOf === talent.id && t.effect && t.effect.type === "missingHpStackBonusPercent";
    });
    if (bonusTalent && (state.talents[bonusTalent.id] || 0) > 0) {
      percentPerStack += bonusTalent.effect.bonusPerStack;
    }

    return percentPerStack * stacks;
  }

  // % от таланта, зависящего от ручного ввода "игроков на локации" (state.talentInputs),
  // с потолком effect.cap.
  function getPlayerCountPercent(talent, state) {
    var effect = talent.effect;
    var playerCount = (state.talentInputs && state.talentInputs[talent.id]) || 0;
    var percent = playerCount * effect.perPlayer;
    return Math.min(effect.cap, percent);
  }

  // Единая сборка Physical/Magic Power: "фиксированный ДД" (введено вручную + уровень +
  // плоские баффы) и "% ДД" (введённый вручную "..., %", фракция, ЛЮБЫЕ таланты/баффы,
  // дающие % урона этому типу — независимо от того, бьют они формально по полю
  // "..., %" или напрямую по Physical/Magic Power: игра считает это одним и тем же
  // процентом, а не отдельными перемножаемыми слоями). Используется и для самого
  // расчёта (getEffectiveStats), и для тултипа в блоке "Итог" — один источник правды.
  // Значение statPercent-эффекта на конкретном уровне. По умолчанию линейно от нуля
  // (valuePerLevel*level). Если задан baseValue — это значение НА 1 УРОВНЕ, а
  // valuePerLevel добавляется за каждый уровень СВЕРХ первого (напр. Манипуляция
  // пространством: 6% на 1 ур., +2%/ур. дальше — 6/8/10/12/14/16/18 на ур. 1-7).
  function getTalentPercentValue(effect, level) {
    if (effect.baseValue != null) {
      return effect.baseValue + effect.valuePerLevel * (level - 1);
    }
    return effect.valuePerLevel * level;
  }

  function getPowerBreakdown(state, type) {
    var powerField = type === "magic" ? "magicPower" : "physPower";
    var percentField = type === "magic" ? "magicPowerPercent" : "physPowerPercent";
    var classTalents = WS_TALENTS[state.classId] || [];

    var levelBonus = state.stats.level || 0;
    var fixEntries = [];
    var percentEntries = [];

    // Экипировка: в "advanced" — 15 полей сетки (см. data/damage-grid.js), каждое
    // привязано к своему типу урона; в "basic" — один агрегированный фикс.+% на тип.
    if (state.equipmentMode === "basic") {
      var agg = (state.equipmentAggregate && state.equipmentAggregate[type]) || { fixed: 0, percent: 0 };
      if (agg.fixed) fixEntries.push({ label: "Экипировка (фикс.)", value: agg.fixed });
      if (agg.percent) percentEntries.push({ label: "Экипировка (%)", value: agg.percent });
    } else {
      WS_DAMAGE_GRID.forEach(function (cell) {
        if (cell.locked) return;
        var cfg = state.damageGrid[cell.id];
        if (!cfg || cfg.type !== type) return;
        var label = cell.name || ("ДД " + cell.row + "-" + cell.col);

        if (cell.mode === "dual") {
          // "dual"-ячейки (напр. Плащ): фиксированный ДД и % ДД активны ОДНОВРЕМЕННО.
          if (cfg.value) fixEntries.push({ label: label, value: cfg.value });
          if (cfg.percentValue) percentEntries.push({ label: label, value: cfg.percentValue });
          return;
        }

        if (!cfg.value) return;
        if (cfg.mode === "percent") {
          percentEntries.push({ label: label, value: cfg.value });
        } else {
          fixEntries.push({ label: label, value: cfg.value });
        }
      });
    }

    var fixTotal = levelBonus + fixEntries.reduce(function (sum, e) { return sum + e.value; }, 0);

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "statPercent" && (eff.stat === powerField || eff.stat === percentField)) {
        percentEntries.push({ label: t.name, value: getTalentPercentValue(eff, level) });
      } else if (eff.type === "bothPowerPercent") {
        // Бьёт и по физ., и по маг. ДД одновременно — попадает в оба вызова getPowerBreakdown.
        percentEntries.push({ label: t.name, value: getTalentPercentValue(eff, level) });
      } else if (eff.type === "missingHpStackStatPercent" && eff.stat === powerField) {
        var value = getMissingHpStackPercent(t, level, classTalents, state);
        if (value) percentEntries.push({ label: t.name, value: value });
      } else if (eff.type === "playerCountBothPowerPercent") {
        // Бьёт и по физ., и по маг. ДД одновременно (как bothPowerPercent), но значение
        // зависит от ручного ввода "игроков на локации" вместо уровня таланта.
        var playerPercent = getPlayerCountPercent(t, state);
        if (playerPercent) percentEntries.push({ label: t.name, value: playerPercent });
      }
    });

    // Зелье — один эффект из WS_POTION_OPTIONS; учитывается тут только вариант "power",
    // привязанный к конкретному типу урона (skillPower/critDamage считаются отдельно).
    var potionCfg = state.buffInputs && state.buffInputs.potion;
    if (potionCfg && potionCfg.optionId) {
      var potionOpt = WS_POTION_OPTIONS.find(function (o) { return o.id === potionCfg.optionId; });
      if (potionOpt && potionOpt.kind === "power" && potionOpt.damageType === type) {
        percentEntries.push({ label: "Зелье (" + potionOpt.name + ")", value: potionOpt.percent });
      }
    }

    var scrollCfg = state.buffInputs && state.buffInputs.scroll;
    if (scrollCfg && scrollCfg.value && scrollCfg.type === type) {
      if (scrollCfg.mode === "percent") {
        percentEntries.push({ label: "Свиток", value: scrollCfg.value });
      } else {
        fixEntries.push({ label: "Свиток", value: scrollCfg.value });
        fixTotal += scrollCfg.value;
      }
    }

    // Гильдия/Замок/Битва — действуют на физ. И маг. ДД одновременно (без выбора типа).
    var guildCfg = state.buffInputs && state.buffInputs.guild;
    if (guildCfg && guildCfg.percent) {
      percentEntries.push({ label: "Гильдия", value: guildCfg.percent });
    }

    var castleCfg = state.buffInputs && state.buffInputs.castle;
    if (castleCfg && castleCfg.stacks) {
      percentEntries.push({ label: "Замок", value: castleCfg.stacks * 1.5 });
    }

    var battleCfg = state.buffInputs && state.buffInputs.battle;
    if (battleCfg && battleCfg.active) {
      percentEntries.push({ label: "Битва", value: 10 });
    }

    // Группа — независимые вкл/выкл бафы (WS_GROUP_BUFFS), только тип "bothPower"
    // (физ. И маг. ДД одновременно); "critDamage" учитывается в getBuffCritDamageBonusPercent.
    var groupBuffsCfg = (state.buffInputs && state.buffInputs.groupBuffs) || {};
    WS_GROUP_BUFFS.forEach(function (buff) {
      if (buff.kind === "bothPower" && groupBuffsCfg[buff.id]) {
        percentEntries.push({ label: buff.name, value: buff.percent });
      }
    });

    // Фракционные навыки союза Sentinels, действуют на всех персонажей выбранной
    // фракции: "Духовность" (Chosen/Избранные, +2% физ. И маг. ДД) и "Сосредоточенность"
    // (Firstborn/Перворождённые, +4% физ. И маг. ДД) — РАЗНЫЕ % у разных фракций.
    var cls = WS_CLASSES.find(function (c) { return c.id === state.classId; });
    if (cls && cls.faction === "chosen") {
      percentEntries.push({ label: "Духовность (фракция Chosen)", value: 2 });
    } else if (cls && cls.faction === "firstborn") {
      percentEntries.push({ label: "Сосредоточенность (фракция Firstborn)", value: 4 });
    }

    var percentTotal = percentEntries.reduce(function (sum, e) { return sum + e.value; }, 0);

    // Расчёт ведётся в неокруглённых (дробных) числах — округление только при
    // отображении в UI (см. ui-results.js), в тултипе показывается точное значение.
    var finalValue = fixTotal * (1 + percentTotal / 100);

    return {
      levelBonus: levelBonus,
      fixEntries: fixEntries,
      fixTotal: fixTotal,
      percentEntries: percentEntries,
      percentTotal: percentTotal,
      finalValue: finalValue
    };
  }

  // Применяет статовые эффекты талантов/баффов к копии state.stats — КРОМЕ
  // Physical/Magic Power и их "..., %" полей, те считаются отдельно в getPowerBreakdown
  // (не трогает урон конкретных навыков — для этого см. getSkillTalentDamageBonusPercent).
  function getEffectiveStats(state) {
    var s = Object.assign({}, state.stats);
    var classTalents = WS_TALENTS[state.classId] || [];

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "missingHpStackStatPercent") return; // учтено в getPowerBreakdown
      if (eff.type === "bothPowerPercent") return; // учтено в getPowerBreakdown
      if (eff.type === "playerCountBothPowerPercent") return; // учтено в getPowerBreakdown
      if (eff.type === "statPercent" && POWER_RELATED_STATS.indexOf(eff.stat) !== -1) return; // учтено в getPowerBreakdown

      applyTalentStatEffect(s, eff, level);
    });

    // Бафы (Зелье/Группа), бьющие напрямую по "(%)"-статам (Сила навыков, Пробивная
    // способность, Сила автоатаки) — прибавляются к проценту напрямую (см.
    // applyTalentStatEffect выше по той же логике: эти статы сами являются процентом).
    ["skillPower", "penetrationPower", "autoAttackPower"].forEach(function (stat) {
      s[stat] = (s[stat] || 0) + getBuffStatBonusPercent(state, stat);
    });

    var physBreakdown = getPowerBreakdown(state, "physical");
    var magicBreakdown = getPowerBreakdown(state, "magic");
    s.physPower = physBreakdown.finalValue;
    s.magicPower = magicBreakdown.finalValue;

    return s;
  }

  // Сумма %-бонусов от Зелья (WS_POTION_OPTIONS) и бафов от группы (WS_GROUP_BUFFS),
  // чей kind совпадает с переданным stat (напр. "skillPower", "critDamage",
  // "penetrationPower", "autoAttackPower"). Бафы с kind "unmodeled" сюда никогда не
  // попадают — они хранятся только как данные, эффект пока не реализован в расчёте.
  function getBuffStatBonusPercent(state, stat) {
    var bonus = 0;

    var potionCfg = state.buffInputs && state.buffInputs.potion;
    if (potionCfg && potionCfg.optionId) {
      var opt = WS_POTION_OPTIONS.find(function (o) { return o.id === potionCfg.optionId; });
      if (opt && opt.kind === stat) bonus += opt.percent;
    }

    var groupBuffsCfg = (state.buffInputs && state.buffInputs.groupBuffs) || {};
    WS_GROUP_BUFFS.forEach(function (buff) {
      if (buff.kind === stat && groupBuffsCfg[buff.id]) bonus += buff.percent;
    });

    return bonus;
  }

  // Бонус "Силы навыков" (%) от Зелья/Группы (kind "skillPower"). Оставлен отдельной
  // функцией для обратной совместимости экспорта — просто обёртка над getBuffStatBonusPercent.
  function getBuffSkillPowerBonusPercent(state) {
    return getBuffStatBonusPercent(state, "skillPower");
  }

  // Сумма %-бонусов крит. урона от Зелья/Группы (kind "critDamage") — участвует в
  // getCritDamageMultiplier наравне с бонусами малых талантов (getTalentCritDamageBonusPercent).
  function getBuffCritDamageBonusPercent(state) {
    return getBuffStatBonusPercent(state, "critDamage");
  }

  // Новый формат эффекта (таланты): { type, stat/skills, valuePerLevel }.
  // Обрабатывает только "statPercent" — эффекты по навыкам считаются отдельно
  // в getSkillTalentDamageBonusPercent (там, где известен конкретный skillId).
  //
  // Эта функция используется только для статов, которые САМИ являются процентом
  // (Сила навыков, Пробивная способность и т.п. — все "(%)"-статы из ATTACK_ROW2).
  // Такие таланты ПРИБАВЛЯЮТ проценты напрямую (Глаз дракона: 0% -> 14%, не 0%*1.14=0%),
  // а не умножают текущее значение — иначе при нулевом/маленьком базовом статe бонус
  // таланта почти не давал эффекта. (Physical/Magic Power, % считаются отдельно —
  // см. POWER_RELATED_STATS и getPowerBreakdown, там своя, тоже аддитивная, логика.)
  function applyTalentStatEffect(statsObj, effect, level) {
    if (effect.type === "statPercent" && effect.stat in statsObj) {
      statsObj[effect.stat] += getTalentPercentValue(effect, level);
    }
  }

  // Сумма %-бонусов урона от талантов текущего класса, применимых к конкретному навыку
  // (адресные skillDamagePercent + общие allSkillsDamagePercent). skillCritDamagePercent
  // намеренно игнорируется — крит временно не участвует в расчёте.
  function getSkillTalentDamageBonusPercent(skillId, state) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "skillDamagePercent" && eff.skills && eff.skills.indexOf(skillId) !== -1) {
        bonus += eff.valuePerLevel * level;
      }
      if (eff.type === "allSkillsDamagePercent") {
        bonus += eff.valuePerLevel * level;
      }
    });

    return bonus;
  }

  // Сумма %-бонусов урона навыков от талантов "targetTypeDamagePercent" — по КЛАССУ цели
  // (Обычный/Нормальный/Сильный/Элитный/Минибосс-Рейдбосс), напр. "Звериная ярость",
  // "Исступление хищника". Не привязано к конкретному skillId (аналогично allSkillsDamagePercent).
  function getTargetTypeDamageBonusPercent(state, targetId) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "targetTypeDamagePercent" && eff.targetTypes.indexOf(targetId) !== -1) {
        bonus += getTalentPercentValue(eff, level);
      }
    });

    return bonus;
  }

  // Сумма %-бонусов урона навыков от талантов "targetHpBelowDamagePercent" — по HP цели
  // НИЖЕ порога (effect.threshold, %) по умолчанию, либо ВЫШЕ порога при
  // effect.direction === "above" (напр. "Пиромантия: Проверка на прочность" — порог 70%,
  // бонус когда HP БОЛЬШЕ 70%). Значение "% HP цели" вводится вручную на вкладке "Таланты"
  // (state.talentInputs), как у Внутренней ярости. СЧИТАЕТСЯ ОТДЕЛЬНЫМ множителем от
  // getTargetTypeDamageBonusPercent (по прямому указанию пользователя) — своя строка/
  // множитель в формуле, а не общий "бонус по цели".
  function getTargetHpBonusPercent(state, talentInputsState) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "targetHpBelowDamagePercent") {
        var targetHp = (talentInputsState && talentInputsState[talentId]) || 0;
        var thresholdMet = eff.direction === "above" ? targetHp > eff.threshold : (targetHp > 0 && targetHp < eff.threshold);
        if (thresholdMet) {
          bonus += getTalentPercentValue(eff, level);
        }
      }
    });

    return bonus;
  }

  // Сумма %-бонусов урона от талантов, зависящих от ТИПА НАНЕСЕНИЯ УРОНА навыка
  // (skill.damageDelivery: "instant" мгновенный / "periodic" периодический) — напр.
  // "Момент силы" (+2% мгновенным), "Долгая смерть" (+2% периодическим). Навыки без
  // явного damageDelivery считаются "instant".
  function getSkillDeliveryTypeDamageBonusPercent(skill, state) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var deliveryType = skill.damageDelivery || "instant";
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "damageDeliveryTypePercent" && eff.deliveryType === deliveryType) {
        bonus += getTalentPercentValue(eff, level);
      }
    });

    return bonus;
  }

  // Сумма %-бонусов, применяемых ПОСЛЕДНИМ множителем поверх УЖЕ полностью посчитанного
  // урона навыка (после всех остальных бонусов) — напр. "Гильдия Альмахада: Сила стихий"
  // (+8%: итог 3421 -> 3421*1.08). Отдельно от getSkillTalentDamageBonusPercent, которая
  // складывается АДДИТИВНО с другими % ДО применения как единого множителя.
  function getFinalSkillDamageMultiplierBonusPercent(state) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "finalSkillDamagePercent") {
        bonus += getTalentPercentValue(eff, level);
      }
    });

    return bonus;
  }

  // Сумма %-бонусов от ДЕБАФФОВ НА ЦЕЛИ (напр. "Яростное пламя" у Мага), повышающих
  // входящий урон — выбираются в панели "Цель" (state.targetDebuffs, см. js/ui-target.js),
  // НЕ зависят от того, каким навыком бьёт персонаж. База берётся из
  // skill.debuffDamageTakenByLevel[level] (level — СВОЙ уровень дебаффа, выбранный в панели
  // "Цель", а НЕ уровень навыка в карточке "Навыки"), плюс бонусы талантов персонажа
  // (effect.type "debuffEffectPercent", напр. "Пиромантия: Яростное пламя +"/"Пиромантия:
  // Пламенеющая земля +"). Считается ПОСЛЕДНИМ множителем — после всего остального,
  // включая finalSkillDamagePercent/адресные бонусы (см. computeSkillFormulaDamage).
  function getTargetDebuffDamageBonusPercent(state) {
    var targetDebuffs = state.targetDebuffs || {};
    var classDef = WS_CLASSES.find(function (c) { return c.id === state.classId; });
    var classSkillsList = (classDef && classDef.skills) || [];
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(targetDebuffs).forEach(function (skillId) {
      var cfg = targetDebuffs[skillId];
      if (!cfg || !cfg.active) return;

      var skill = classSkillsList.find(function (s) { return s.id === skillId; });
      if (!skill || !skill.debuffDamageTakenByLevel) return;

      var base = skill.debuffDamageTakenByLevel[cfg.level] || 0;

      var talentBonus = 0;
      Object.keys(state.talents).forEach(function (talentId) {
        var level = state.talents[talentId];
        if (!level) return;
        var t = classTalents.find(function (x) { return x.id === talentId; });
        if (!t || !t.effect) return;
        var eff = t.effect;
        if (eff.type === "debuffEffectPercent" && eff.skills && eff.skills.indexOf(skillId) !== -1) {
          talentBonus += getTalentPercentValue(eff, level);
        }
      });

      bonus += base + talentBonus;
    });

    return bonus;
  }

  // Сумма %-бонусов крит. урона от МАЛЫХ талантов персонажа, действующих на ВСЕ навыки
  // (effect.type "allSkillsCritDamagePercent", напр. "Сокрушительная воля 1"), от
  // талантов, зависящих от КЛАССА цели (effect.type "targetTypeCritDamagePercent",
  // напр. "Животный гнев" — аналог "Звериной ярости", но бьёт по крит. урону), а также
  // (если передан skillId) от талантов, бьющих по крит. урону КОНКРЕТНЫХ навыков
  // (effect.type "skillCritDamagePercent", напр. "Пироманьяк" — +50% Огненному шару,
  // Пламенеющей земле, Яростному пламени, Ауре огня, Ледяной стреле).
  function getTalentCritDamageBonusPercent(state, targetId, skillId) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type === "allSkillsCritDamagePercent") {
        bonus += getTalentPercentValue(eff, level);
      }

      if (eff.type === "targetTypeCritDamagePercent" && targetId && eff.targetTypes.indexOf(targetId) !== -1) {
        bonus += getTalentPercentValue(eff, level);
      }

      if (eff.type === "skillCritDamagePercent" && skillId && eff.skills && eff.skills.indexOf(skillId) !== -1) {
        bonus += getTalentPercentValue(eff, level);
      }
    });

    return bonus;
  }

  // Множитель критического урона: 2 + (стат "Критический урон" + бонусы малых талантов
  // на крит. урон) / 100. Бонусы малых талантов участвуют только в этом расчёте и НЕ
  // прибавляются к самому стату critDamagePower (он остаётся как введён пользователем).
  // skillId (необязательный) — добавляет адресные skillCritDamagePercent-бонусы (напр.
  // Пироманьяк) ТОЛЬКО для этого навыка; без skillId считается общий множитель (как раньше).
  function getCritDamageMultiplier(state, skillId) {
    var statPercent = state.stats.critDamagePower || 0;
    var talentPercent = getTalentCritDamageBonusPercent(state, state.targetId, skillId);
    var buffPercent = getBuffCritDamageBonusPercent(state);
    return 2 + (statPercent + talentPercent + buffPercent) / 100;
  }

  // "Гнев глубин" применяется к готовому урону навыка ДВАЖДЫ для крита: обычный урон уже
  // включает один множитель (см. computeSkillFormulaDamage), крит = обычный_урон ×
  // критМножитель × ЕЩЁ ОДИН множитель "Гнева глубин" (подтверждено формулой игрока:
  // крит = база × критМножитель × (1+X/100)^2).
  function getDepthsWrathMultiplier(state) {
    var percent = (state && state.stats) ? (state.stats.depthsWrath || 0) : 0;
    return 1 + percent / 100;
  }

  function getTarget(targetId) {
    return WS_TARGETS.find(function (t) { return t.id === targetId; }) || WS_TARGETS[0];
  }

  // ЗАГЛУШКА: реальной модели защиты цели пока нет (data/targets.js хранит только
  // условный множитель defMod/resMod) — расчёт ниже лишь грубо ослабляет урон по нему,
  // чтобы UI реагировал на выбор типа цели. НЕ является реальной формулой игры.
  function physicalDamage(attackerStats, target) {
    // Неокруглённое значение — округление только при отображении (см. ui-results.js).
    return Math.max(1, (attackerStats.physPower || 0) / (target.defMod || 1));
  }

  function magicDamage(attackerStats, target) {
    // Неокруглённое значение — округление только при отображении (см. ui-results.js).
    return Math.max(1, (attackerStats.magicPower || 0) / (target.resMod || 1));
  }

  function calcSkillDamage(skill, attackerStats, target) {
    if (skill.type === "magic") return magicDamage(attackerStats, target);
    return physicalDamage(attackerStats, target);
  }

  // Сумма %-бонуса реликвий, прикреплённых к навыку. Обычные реликвии: damageBonusPercent
  // * stacks. Реликвии с variableByGroupSize (напр. "Объединённая атака"): бонус берётся
  // по выбранному числу членов группы (relicRef.groupSize, 1-4), стаки не участвуют.
  function getSkillRelicBonusPercent(skillConfig) {
    var relics = (skillConfig && skillConfig.relics) || [];
    return relics.reduce(function (sum, relicRef) {
      var relic = WS_RELICS.find(function (r) { return r.id === relicRef.id; });
      if (!relic) return sum;
      if (relic.variableByGroupSize) {
        return sum + (relic.variableByGroupSize[relicRef.groupSize || 1] || 0);
      }
      return sum + (relic.damageBonusPercent || 0) * relicRef.stacks;
    }, 0);
  }

  // Сумма бонусов к коэффициенту "% от ДД" КОНКРЕТНОГО навыка (percentByLevel в
  // damageFormula) — напр. "Огненный шар +" добавляет +5 к 170% => 175%. Это ДРУГОЕ,
  // чем %-бонус к итоговому урону: тут меняется сам множитель ВНУТРИ формулы, до
  // применения реликвий/силы навыков.
  // part (необязательный): "primary" | "secondary" — для навыков с ДВУМЯ источниками
  // урона разных типов (напр. Очищение у Паладина: физ. мгновенный удар + маг. DoT),
  // где талант бустит только ОДНУ из частей. effect.part на таланте фильтрует по этому
  // значению; таланты БЕЗ effect.part (обычный случай) применяются к любой part.
  function getSkillPowerScalingBonus(skillId, state, part) {
    var classTalents = WS_TALENTS[state.classId] || [];
    var bonus = 0;

    Object.keys(state.talents).forEach(function (talentId) {
      var level = state.talents[talentId];
      if (!level) return;
      var t = classTalents.find(function (x) { return x.id === talentId; });
      if (!t || !t.effect) return;
      var eff = t.effect;

      if (eff.type !== "skillPowerScalingBonus" || !eff.skills || eff.skills.indexOf(skillId) === -1) return;
      if (eff.part && eff.part !== part) return;
      bonus += getTalentPercentValue(eff, level);
    });

    return bonus;
  }

  // Считает урон ОДНОГО источника формулы (baseByLevel/percentByLevel) — используется
  // и для основного damageFormula навыка, и для damageFormula.secondary (навыки с ДВУМЯ
  // источниками урона, напр. мгновенный удар + доп. периодический эффект — см. комментарий
  // у getSkillDamageBreakdown).
  function computeSkillFormulaDamage(formula, skill, attackerStats, target, skillConfig, state, level, part, phantomCopy) {
    // phantomCopy: копия навыка от "Магический фантом" — по 3 тестам игрока (Шар x2,
    // Ледяная стрела x1, разброс ~1.9% — в пределах обычного шума) фантом наследует
    // Magic/Physical Power БЕЗ бонусов к % от ДД от скилл-специфичных талантов (напр.
    // "Магмовая глыба"/"Огненный шар +" — подтверждено, что Магмовая глыба НЕ влияет),
    // Силу навыков (стат), бонус по классу цели и по типу урона — но НЕ реликвии навыка,
    // НЕ скилл-специфичный крит. урон (напр. Пироманьяк — подтверждено по крит-тесту) и
    // НЕ бонус по HP цели (напр. "Проверка на прочность"). Крит. множитель для фантома
    // считается getCritDamageMultiplier(state) БЕЗ skillId (см. js/ui-results.js).
    var relicBonusPercent = phantomCopy ? 0 : getSkillRelicBonusPercent(skillConfig);
    // powerSource переопределяет обычный выбор "physical/magic по skill.type" — нужен
    // для навыков, зависящих от ОБЕИХ веток силы одновременно (напр. питомец "Луна" у
    // Ловчего: гибридный множитель от физ.+маг. силы, конвертируется в физ. урон) или
    // от большей из двух (skill.type в этом случае определяет только против чего
    // применяется урон — target defMod/resMod, см. physicalDamage/magicDamage):
    //  - "max"        — Math.max(physPower, magicPower)
    //  - "hybrid_sum"  — physPower + magicPower
    //  - "hybrid_avg"  — (physPower + magicPower) / 2
    var baseFix = formula.baseByLevel[level] || 0;
    var powerScalingBonus = (state && !phantomCopy) ? getSkillPowerScalingBonus(skill.id, state, part) : 0;
    var power, basePowerPercent, powerPercent, powerContribution;

    if (formula.hybridPercentByLevel) {
      // Питомец "Луна" у Ловчего, "Вихрь покаяния"/"Частица жизни"/"Учения Харада" у
      // Храмовника и т.п.: НЕ единый % от суммы физ.+маг. силы, а ДВА независимых
      // коэффициента — physPower*D% + magicPower*E%. По умолчанию (combine не задан или
      // "sum") оба вклада СКЛАДЫВАЮТСЯ, итог засчитывается как физический урон
      // (skill.type). combine: "max" — берётся БОЛЬШИЙ из двух вкладов ("преобладающий"
      // тип, напр. "Цепная молния"/"Учения Харада": урон = max(physPower*D%, magicPower*E%)).
      // powerScalingBonus (от талантов, напр. "Частица жизни+": +5% физ. И +5% маг.
      // ОДНОВРЕМЕННО) добавляется К ОБЕИМ частям одинаково.
      var physPct = formula.hybridPercentByLevel.physical[level] || 0;
      var magicPct = formula.hybridPercentByLevel.magic[level] || 0;
      var physContribution = (attackerStats.physPower || 0) * (physPct + powerScalingBonus) / 100;
      var magicContribution = (attackerStats.magicPower || 0) * (magicPct + powerScalingBonus) / 100;
      powerContribution = formula.hybridPercentByLevel.combine === "max"
        ? Math.max(physContribution, magicContribution)
        : physContribution + magicContribution;
      basePowerPercent = physPct;
      powerPercent = physPct + powerScalingBonus;
      power = (attackerStats.physPower || 0) + (attackerStats.magicPower || 0);
    } else {
      // formula.type переопределяет skill.type ТОЛЬКО для выбора источника силы этой
      // конкретной формулы (нужно для навыков вроде "Цепная молния" — физ. удар +
      // магический удар одновременно, разные типы силы для primary/secondary).
      var effectiveType = formula.type || skill.type;
      if (skill.powerSource === "max") {
        power = Math.max(attackerStats.physPower || 0, attackerStats.magicPower || 0);
      } else if (skill.powerSource === "hybrid_sum") {
        power = (attackerStats.physPower || 0) + (attackerStats.magicPower || 0);
      } else if (skill.powerSource === "hybrid_avg") {
        power = ((attackerStats.physPower || 0) + (attackerStats.magicPower || 0)) / 2;
      } else {
        power = effectiveType === "magic" ? (attackerStats.magicPower || 0) : (attackerStats.physPower || 0);
      }
      basePowerPercent = formula.percentByLevel[level] || 0;
      powerPercent = basePowerPercent + powerScalingBonus;
      powerContribution = power * powerPercent / 100;
    }

    var base = baseFix + powerContribution;

    // Таланты, зависящие от класса цели (напр. "Звериная ярость", "Исступление
    // хищника") — считаются от ВЫБРАННОЙ на панели "Цель" цели.
    var targetTypeBonusPercent = state ? getTargetTypeDamageBonusPercent(state, target.id) : 0;
    // Таланты по HP цели (напр. "Пиромантия: Проверка на прочность") — ОТДЕЛЬНЫЙ множитель
    // от targetTypeBonusPercent (по прямому указанию пользователя), своя строка/шаг в формуле.
    var targetHpBonusPercent = (state && !phantomCopy) ? getTargetHpBonusPercent(state, state.talentInputs) : 0;
    // Таланты по типу нанесения урона (мгновенный/периодический) — "Момент силы"/"Долгая смерть".
    var deliveryBonusPercent = state ? getSkillDeliveryTypeDamageBonusPercent(skill, state) : 0;
    var skillPowerPercent = attackerStats.skillPower || 0;

    var finalMultiplierBonus = state ? getFinalSkillDamageMultiplierBonusPercent(state) : 0;
    // Адресные бонусы урона КОНКРЕТНОМУ навыку (effect.type "skillDamagePercent"/
    // "allSkillsDamagePercent") — по прямому указанию считаются ПОСЛЕДНИМ множителем,
    // ПОСЛЕ "Гильдия Альмахада: Сила стихий" (finalMultiplierBonus), а не смешиваются с
    // target/delivery/relic-бонусами внутри базы. Скилл-специфичные (skillDamagePercent)
    // НЕ передаются фантому (по той же логике, что и реликвии/Пироманьяк).
    var skillTalentDamageBonusPercent = (state && !phantomCopy) ? getSkillTalentDamageBonusPercent(skill.id, state) : 0;
    // Дебаффы на цели (напр. Яростное пламя) — САМЫЙ последний множитель, после вообще
    // всего остального (см. getTargetDebuffDamageBonusPercent).
    var targetDebuffBonusPercent = state ? getTargetDebuffDamageBonusPercent(state) : 0;
    // "Гнев глубин" — стат персонажа, отдельный финальный множитель ПОСЛЕ всего
    // остального (подтверждено по формуле игрока: обычный урон = база×(1+X/100), крит =
    // база×критМножитель×(1+X/100) — множитель применяется РОВНО ОДИН РАЗ к готовому
    // числу, что для крита получается автоматически, т.к. крит = final×critMultiplier).
    var depthsWrathPercent = (state && state.stats) ? (state.stats.depthsWrath || 0) : 0;

    // Неокруглённое значение — округление только при отображении (см. ui-results.js).
    // "Момент силы"/"Долгая смерть" (deliveryBonusPercent) считается ОТДЕЛЬНЫМ множителем
    // (своя строка × 1.0X), а не смешивается в одном выражении с target/relic/skillPower —
    // по прямому указанию пользователя (математически на итог это не влияет, умножение
    // коммутативно, но так нагляднее видно вклад каждого множителя по отдельности).
    var final = base
      * (1 + targetTypeBonusPercent / 100)
      * (1 + relicBonusPercent / 100)
      * (1 + skillPowerPercent / 100);
    var finalBeforeTargetHp = final;
    final = final * (1 + targetHpBonusPercent / 100);
    var finalBeforeDelivery = final;
    final = final * (1 + deliveryBonusPercent / 100);
    var finalBeforeMultiplier = final;
    final = final * (1 + finalMultiplierBonus / 100);
    final = final * (1 + skillTalentDamageBonusPercent / 100);
    final = final * (1 + targetDebuffBonusPercent / 100);
    final = final * (1 + depthsWrathPercent / 100);

    var lines = [];
    lines.push({ label: "Фикс. урон навыка (ур. " + level + ")", value: String(baseFix) });
    if (formula.hybridPercentByLevel) {
      var combineMode = formula.hybridPercentByLevel.combine === "max" ? "max" : "sum";
      var magicPctLine = formula.hybridPercentByLevel.magic[level] || 0;
      lines.push({ label: "Гибридная формула (физ.+маг. сила независимо, " + (combineMode === "max" ? "берётся большее" : "суммируется") + ")", value: "Physical Power × " + powerPercent + "% " + (combineMode === "max" ? "vs" : "+") + " Magic Power × " + magicPctLine + "%" });
      lines.push({ label: "Physical Power × " + powerPercent + "%", value: round2(attackerStats.physPower || 0) + " × " + powerPercent + "%" });
      lines.push({ label: "Magic Power × " + magicPctLine + "%", value: round2(attackerStats.magicPower || 0) + " × " + magicPctLine + "%" });
      lines.push({ label: (combineMode === "max" ? "Большее из двух" : "Сумма") + " (итог засчитывается как физ. урон)", value: round2(powerContribution) });
    } else {
      lines.push({ label: "Множитель от ДД (" + basePowerPercent + "%" + (powerScalingBonus ? " + " + powerScalingBonus + "% от талантов" : "") + ")", value: powerPercent + "%" });
      lines.push({ label: ((formula.type || skill.type) === "magic" ? "Magic Power" : "Physical Power") + " × " + powerPercent + "%", value: round2(power) + " × " + powerPercent + "% = " + round2(powerContribution) });
    }
    lines.push({ label: "База (фикс. + от ДД)", value: String(round2(base)) });
    lines.push({ label: "Бонус по классу цели (" + target.name + ")", value: (targetTypeBonusPercent >= 0 ? "+" : "") + targetTypeBonusPercent + "%" });
    lines.push({ label: "Реликвии", value: (relicBonusPercent >= 0 ? "+" : "") + relicBonusPercent + "%" });
    lines.push({ label: "Сила навыков", value: (skillPowerPercent >= 0 ? "+" : "") + skillPowerPercent + "%" });
    if (targetHpBonusPercent) {
      lines.push({ label: "Итог до множителя по HP цели", value: String(round2(finalBeforeTargetHp)) });
      lines.push({ label: "Множитель по HP цели (напр. Проверка на прочность)", value: "× " + (1 + targetHpBonusPercent / 100) });
    }
    lines.push({ label: "Итог до множителя типа урона", value: String(round2(finalBeforeDelivery)) });
    lines.push({ label: "Множитель по типу урона (" + (skill.damageDelivery || "instant") + ", напр. Момент силы)", value: "× " + (1 + deliveryBonusPercent / 100) });
    if (finalMultiplierBonus) {
      lines.push({ label: "Итог до финального множителя", value: String(round2(finalBeforeMultiplier)) });
      lines.push({ label: "Финальный множитель (Гильдия Альмахада: Сила стихий)", value: "× " + (1 + finalMultiplierBonus / 100) });
    }
    if (skillTalentDamageBonusPercent) {
      lines.push({ label: "Адресный бонус урона навыку (напр. Магмовая глыба) — ПОСЛЕ Силы стихий", value: "× " + (1 + skillTalentDamageBonusPercent / 100) });
    }
    if (targetDebuffBonusPercent) {
      lines.push({ label: "Дебафф на цели (напр. Яростное пламя) — САМЫЙ последний множитель", value: "× " + (1 + targetDebuffBonusPercent / 100) });
    }
    if (depthsWrathPercent) {
      lines.push({ label: "Гнев глубин (стат) — финальный множитель", value: "× " + (1 + depthsWrathPercent / 100) });
    }

    return { lines: lines, final: final };
  }

  // Разбивка урона навыка на составляющие — общий источник и для расчёта, и для
  // тултипа в блоке "Итог" (см. ui-results.js). Два варианта:
  //  - skill.damageFormula задан (подтверждено по Excel-расчёту, пока только Огненный
  //    шар): урон = (baseByLevel[ур] + ДД_персонажа*percentByLevel[ур]/100)
  //    * (1 + <резерв под таланты по типу цели>/100) * (1 + реликвии/100) * (1 + Сила_навыков/100).
  //    Мишень (target) тут НЕ участвует — как в исходной формуле игрока.
  //    Если у навыка ДВА источника урона (напр. мгновенный удар + доп. периодический
  //    эффект, см. "Сила воды" у Друида) — damageFormula.secondary считается ТЕМ ЖЕ
  //    способом независимо и кладётся в result.secondary (с тем же набором бонусов).
  //  - иначе — старая ЗАГЛУШКА (base/defMod * level * реликвии * таланты на урон навыка).
  function getSkillDamageBreakdown(skill, attackerStats, target, skillConfig, state, phantomCopy) {
    var level = (skillConfig && skillConfig.level) || 1;
    var relicBonusPercent = phantomCopy ? 0 : getSkillRelicBonusPercent(skillConfig);
    var lines = [];

    // Урон = % от вылеченного HP (напр. "Опаление гневом: Боевое лечение" у Стража) —
    // модели лечения/HP в калькуляторе нет, поэтому НЕ считаем через плейсхолдер-формулу
    // (это дало бы неверное число от Power/defMod, не имеющее отношения к реальной
    // механике) — явно показываем 0 с пояснением.
    if (skill.healBasedDamage) {
      return {
        lines: [
          { label: "Урон = % от вылеченного HP", value: skill.healBasedDamage.percentOfHeal + "% (не более " + skill.healBasedDamage.capPercentMaxHp + "% от макс. HP)" },
          { label: "Не рассчитывается", value: "нет модели лечения/HP в калькуляторе" }
        ],
        final: 0
      };
    }

    // Навык-"фантом" (напр. "Альмахада: Гильдия магов: Магический фантом" у Мага) — по
    // шансу ПОВТОРЯЕТ один из перечисленных навыков со 100% его урона (не % от него —
    // "применяет использованный навык"), поэтому считаем через РЕКУРСИВНЫЙ вызов
    // getSkillDamageBreakdown для каждого навыка-источника (со своим текущим уровнем/
    // реликвиями) и возвращаем result.mirrors — массив {skillId, name, final} для
    // отдельного отображения каждого источника (см. ui-results.js).
    if (skill.mirrorsSkills) {
      var classDef = WS_CLASSES.find(function (c) { return c.id === state.classId; });
      var classSkillsList = (classDef && classDef.skills) || [];
      var mirrors = skill.mirrorsSkills.map(function (mirroredId) {
        var mirroredSkill = classSkillsList.find(function (s) { return s.id === mirroredId; });
        if (!mirroredSkill) return null;
        var mirroredCfg = (state.skillsConfig && state.skillsConfig[mirroredId]) || { level: 1, relics: [] };
        var mirroredBreakdown = getSkillDamageBreakdown(mirroredSkill, attackerStats, target, mirroredCfg, state, true);
        return { skillId: mirroredId, name: mirroredSkill.name, final: mirroredBreakdown.final };
      }).filter(Boolean);

      return {
        lines: [{ label: "Механика", value: "По шансу повторяет 100% урона одного из навыков-источников (см. строки ниже)" }],
        final: 0,
        mirrors: mirrors
      };
    }

    if (skill.damageFormula) {
      var primary = computeSkillFormulaDamage(skill.damageFormula, skill, attackerStats, target, skillConfig, state, level, "primary", phantomCopy);
      var result = { lines: primary.lines, final: primary.final };

      if (skill.damageFormula.secondary) {
        var secondary = computeSkillFormulaDamage(skill.damageFormula.secondary, skill, attackerStats, target, skillConfig, state, level, "secondary", phantomCopy);
        result.secondary = {
          label: skill.damageFormula.secondary.label || "Доп. источник урона",
          lines: secondary.lines,
          final: secondary.final
        };
      }

      return result;
    }

    var base2 = calcSkillDamage(skill, attackerStats, target);
    var talentBonusPercent = (state && !phantomCopy) ? getSkillTalentDamageBonusPercent(skill.id, state) : 0;
    var targetTypeBonusPercent2 = state ? getTargetTypeDamageBonusPercent(state, target.id) : 0;
    var targetHpBonusPercent2 = (state && !phantomCopy) ? getTargetHpBonusPercent(state, state.talentInputs) : 0;
    var deliveryBonusPercent2 = state ? getSkillDeliveryTypeDamageBonusPercent(skill, state) : 0;
    var finalMultiplierBonus2 = state ? getFinalSkillDamageMultiplierBonusPercent(state) : 0;
    var targetDebuffBonusPercent2 = state ? getTargetDebuffDamageBonusPercent(state) : 0;
    var depthsWrathPercent2 = (state && state.stats) ? (state.stats.depthsWrath || 0) : 0;
    // Неокруглённое значение — округление только при отображении (см. ui-results.js).
    var final2 = base2 * level
      * (1 + deliveryBonusPercent2 / 100)
      * (1 + relicBonusPercent / 100)
      * (1 + talentBonusPercent / 100)
      * (1 + targetTypeBonusPercent2 / 100)
      * (1 + targetHpBonusPercent2 / 100);
    var final2BeforeMultiplier = final2;
    final2 = final2 * (1 + finalMultiplierBonus2 / 100);
    final2 = final2 * (1 + targetDebuffBonusPercent2 / 100);
    final2 = final2 * (1 + depthsWrathPercent2 / 100);

    lines.push({ label: "База (ЗАГЛУШКА, без реальной формулы)", value: String(round2(base2)) });
    lines.push({ label: "Уровень навыка", value: "× " + level });
    lines.push({ label: "Реликвии", value: (relicBonusPercent >= 0 ? "+" : "") + relicBonusPercent + "%" });
    lines.push({ label: "Таланты на урон навыка", value: (talentBonusPercent >= 0 ? "+" : "") + talentBonusPercent + "%" });
    lines.push({ label: "Бонус по классу цели (" + target.name + ")", value: (targetTypeBonusPercent2 >= 0 ? "+" : "") + targetTypeBonusPercent2 + "%" });
    if (targetHpBonusPercent2) {
      lines.push({ label: "Множитель по HP цели (напр. Проверка на прочность)", value: "× " + (1 + targetHpBonusPercent2 / 100) });
    }
    lines.push({ label: "Бонус по типу урона (" + (skill.damageDelivery || "instant") + ")", value: (deliveryBonusPercent2 >= 0 ? "+" : "") + deliveryBonusPercent2 + "%" });
    if (finalMultiplierBonus2) {
      lines.push({ label: "Итог до финального множителя", value: String(round2(final2BeforeMultiplier)) });
      lines.push({ label: "Финальный множитель (Гильдия Альмахада: Сила стихий)", value: "× " + (1 + finalMultiplierBonus2 / 100) });
    }
    if (targetDebuffBonusPercent2) {
      lines.push({ label: "Дебафф на цели (напр. Яростное пламя) — САМЫЙ последний множитель", value: "× " + (1 + targetDebuffBonusPercent2 / 100) });
    }
    if (depthsWrathPercent2) {
      lines.push({ label: "Гнев глубин (стат) — финальный множитель", value: "× " + (1 + depthsWrathPercent2 / 100) });
    }

    return { lines: lines, final: final2 };
  }

  function calcSkillTotalDamage(skill, attackerStats, target, skillConfig, state) {
    return getSkillDamageBreakdown(skill, attackerStats, target, skillConfig, state).final;
  }

  return {
    getEffectiveStats: getEffectiveStats,
    getSkillTalentDamageBonusPercent: getSkillTalentDamageBonusPercent,
    getSkillDeliveryTypeDamageBonusPercent: getSkillDeliveryTypeDamageBonusPercent,
    getTalentCritDamageBonusPercent: getTalentCritDamageBonusPercent,
    getCritDamageMultiplier: getCritDamageMultiplier,
    getDepthsWrathMultiplier: getDepthsWrathMultiplier,
    getDepthsWrathMultiplier: getDepthsWrathMultiplier,
    getBuffSkillPowerBonusPercent: getBuffSkillPowerBonusPercent,
    getBuffCritDamageBonusPercent: getBuffCritDamageBonusPercent,
    getBuffStatBonusPercent: getBuffStatBonusPercent,
    getMissingHpForTalent: getMissingHpForTalent,
    getMissingHpStacks: getMissingHpStacks,
    getMissingHpStackPercent: getMissingHpStackPercent,
    getPlayerCountPercent: getPlayerCountPercent,
    getTalentPercentValue: getTalentPercentValue,
    getSkillPowerScalingBonus: getSkillPowerScalingBonus,
    getPowerBreakdown: getPowerBreakdown,
    getSkillRelicBonusPercent: getSkillRelicBonusPercent,
    getSkillDamageBreakdown: getSkillDamageBreakdown,
    getTargetTypeDamageBonusPercent: getTargetTypeDamageBonusPercent,
    getTargetHpBonusPercent: getTargetHpBonusPercent,
    getTargetDebuffDamageBonusPercent: getTargetDebuffDamageBonusPercent,
    getTarget: getTarget,
    physicalDamage: physicalDamage,
    magicDamage: magicDamage,
    calcSkillDamage: calcSkillDamage,
    calcSkillTotalDamage: calcSkillTotalDamage
  };
})();
