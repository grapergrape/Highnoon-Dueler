const TOWN_DEED_DEFS = {
  1: [
    {
      id: "t1_lead_work",
      name: "Lead Work",
      description: "Deal 140 bullet damage in this town.",
      type: "bulletDamage",
      target: 140,
    },
    {
      id: "t1_hard_cover",
      name: "Hard Cover",
      description: "Prevent 45 damage with Armor in this town.",
      type: "armorPrevented",
      target: 45,
    },
    {
      id: "t1_signature_habit",
      name: "Signature Habit",
      description: "Build 24 class-resource stacks in this town.",
      type: "classResource",
      target: 24,
    },
  ],
  2: [
    {
      id: "t2_measured_violence",
      name: "Measured Violence",
      description: "Deal 260 bullet damage in this town.",
      type: "bulletDamage",
      target: 260,
    },
    {
      id: "t2_stay_standing",
      name: "Stay Standing",
      description: "Prevent 105 damage with Armor in this town.",
      type: "armorPrevented",
      target: 105,
    },
    {
      id: "t2_clean_claims",
      name: "Clean Claims",
      description: "Win 2 duels while finishing at 85%+ HP.",
      type: "highHpWins",
      target: 2,
      hpPct: 0.85,
    },
  ],
  3: [
    {
      id: "t3_fast_hands",
      name: "Fast Hands",
      description: "Win 2 duels by round 3 or earlier.",
      type: "quickWins",
      target: 2,
      roundMax: 3,
    },
    {
      id: "t3_deep_cover",
      name: "Deep Cover",
      description: "Prevent 145 damage with Armor in this town.",
      type: "armorPrevented",
      target: 145,
    },
    {
      id: "t3_class_act",
      name: "Class Act",
      description: "Build 55 class-resource stacks in this town.",
      type: "classResource",
      target: 55,
    },
  ],
  4: [
    {
      id: "t4_full_chambers",
      name: "Full Chambers",
      description: "Enter Showdown with max loaded bullets 6 times.",
      type: "maxLoadedShowdowns",
      target: 6,
    },
    {
      id: "t4_blood_on_the_line",
      name: "Blood on the Line",
      description: "Win a duel at 25% HP or lower.",
      type: "lowHpWins",
      target: 1,
      hpPct: 0.25,
    },
    {
      id: "t4_final_accounting",
      name: "Final Accounting",
      description: "Deal 420 bullet damage in this town.",
      type: "bulletDamage",
      target: 420,
    },
  ],
  5: [
    {
      id: "t5_legend_work",
      name: "Legend Work",
      description: "Win 2 duels while finishing at 90%+ HP.",
      type: "highHpWins",
      target: 2,
      hpPct: 0.90,
    },
    {
      id: "t5_unbroken",
      name: "Unbroken",
      description: "Defeat the town boss with 65%+ HP.",
      type: "bossHighHpWin",
      target: 1,
      hpPct: 0.65,
    },
    {
      id: "t5_last_ledger",
      name: "Last Ledger",
      description: "Build 85 class-resource stacks in this town.",
      type: "classResource",
      target: 85,
    },
  ],
};

function cloneDeed(def, townOrder) {
  return {
    ...def,
    townOrder,
    progress: 0,
    completed: false,
    rewarded: false,
    justCompleted: false,
  };
}

export function deedDefsForTown(townOrder) {
  const order = Math.max(1, Math.min(5, Math.round(townOrder || 1)));
  return (TOWN_DEED_DEFS[order] ?? []).map((def) => cloneDeed(def, order));
}

export function ensureDeedState(run) {
  if (!run) return [];
  const townOrder = Math.max(1, Math.min(5, Math.round(run.currentTownOrder || 1)));
  if (!Number.isFinite(run.signaturePoints)) run.signaturePoints = 0;
  if (!Array.isArray(run.completedDeedIds)) run.completedDeedIds = [];
  if (!Array.isArray(run.deedHistory)) run.deedHistory = [];
  if (!Array.isArray(run.activeDeeds) || run.activeDeeds.length === 0 || run.activeDeedTownOrder !== townOrder) {
    run.activeDeedTownOrder = townOrder;
    const completed = new Set(run.completedDeedIds);
    run.activeDeeds = deedDefsForTown(townOrder).map((deed) => ({
      ...deed,
      completed: completed.has(deed.id),
      rewarded: completed.has(deed.id),
      progress: completed.has(deed.id) ? deed.target : deed.progress,
    }));
  }
  return run.activeDeeds;
}

function increment(deed, amount) {
  if (!deed || deed.completed) return 0;
  const before = deed.progress || 0;
  deed.progress = Math.min(deed.target, before + Math.max(0, Math.round(amount || 0)));
  if (deed.progress >= deed.target) {
    deed.completed = true;
    deed.justCompleted = true;
  }
  return deed.progress - before;
}

function contributionFor(deed, duel, run) {
  const stats = duel?.deedStats ?? {};
  switch (deed.type) {
    case "bulletDamage":
      return stats.bulletDamageDealt || 0;
    case "armorPrevented":
      return stats.armorPrevented || 0;
    case "classResource":
      return stats.classResourceApplied || 0;
    case "maxLoadedShowdowns":
      return stats.maxLoadedShowdowns || 0;
    case "quickWins":
      return duel?.winner === "player" && (duel.roundNumber || 99) <= (deed.roundMax || 4) ? 1 : 0;
    case "highHpWins": {
      const hpPct = (run?.hp || 0) / Math.max(1, run?.maxHp || 1);
      return duel?.winner === "player" && hpPct >= (deed.hpPct || 0.7) ? 1 : 0;
    }
    case "lowHpWins": {
      const hpPct = (run?.hp || 0) / Math.max(1, run?.maxHp || 1);
      return duel?.winner === "player" && hpPct <= (deed.hpPct || 0.35) ? 1 : 0;
    }
    case "bossHighHpWin": {
      const hpPct = (run?.hp || 0) / Math.max(1, run?.maxHp || 1);
      return duel?.winner === "player" && duel?.opponentDef?.role === "boss" && hpPct >= (deed.hpPct || 0.5) ? 1 : 0;
    }
    default:
      return 0;
  }
}

export function applyDuelDeedProgress(run, duel) {
  const deeds = ensureDeedState(run);
  const summary = {
    townOrder: run?.activeDeedTownOrder ?? run?.currentTownOrder ?? 1,
    opponentName: duel?.opponentDef?.name ?? "Opponent",
    earnedSignaturePoints: 0,
    rows: [],
  };
  if (duel?.winner !== "player") return summary;

  for (const deed of deeds) {
    deed.justCompleted = false;
    const before = deed.progress || 0;
    const delta = increment(deed, contributionFor(deed, duel, run));
    if (deed.completed && !deed.rewarded) {
      deed.rewarded = true;
      run.signaturePoints = (run.signaturePoints || 0) + 1;
      summary.earnedSignaturePoints += 1;
      if (!run.completedDeedIds.includes(deed.id)) run.completedDeedIds.push(deed.id);
      run.deedHistory.push({ id: deed.id, townOrder: deed.townOrder, completedAfter: duel.opponentDef?.id ?? null });
    }
    summary.rows.push({
      id: deed.id,
      name: deed.name,
      description: deed.description,
      progressBefore: before,
      progressAfter: deed.progress || 0,
      target: deed.target,
      delta,
      completed: !!deed.completed,
      justCompleted: !!deed.justCompleted,
    });
  }
  return summary;
}

export function activeDeedsForRun(run) {
  return ensureDeedState(run);
}

export function deedProgressPct(deed) {
  return Math.max(0, Math.min(100, Math.round(((deed?.progress || 0) / Math.max(1, deed?.target || 1)) * 100)));
}
