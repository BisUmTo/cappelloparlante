function _shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Picks 3 questions that discriminate well between available labs, with a
// randomness factor so different students rarely get the exact same set.
// Discriminating power = variance of impact values across the available lab set.
function selectQuestions(availableLabs) {
  const scored = QUESTIONS.map(q => {
    const impacts = availableLabs.map(lab => q.impatto[lab.id] ?? 0);
    const n = impacts.length;
    const mean = impacts.reduce((a, b) => a + b, 0) / n;
    const variance = impacts.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    return { question: q, variance };
  });

  scored.sort((a, b) => b.variance - a.variance);
  const maxVar = scored[0]?.variance ?? 0;

  // No question discriminates (all flat) → pure random 3.
  if (maxVar === 0) {
    return _shuffle(QUESTIONS.slice()).slice(0, 3);
  }

  // Candidate pool: keep questions within 35% of the best discriminator,
  // but always at least 6 so there is room for variety.
  const threshold = maxVar * 0.35;
  let pool = scored.filter(s => s.variance >= threshold);
  if (pool.length < 6) pool = scored.slice(0, Math.min(6, scored.length));

  // Weighted-random pick of 3 distinct questions (weight ∝ variance):
  // strong discriminators are favored but not guaranteed → fresh mix each run.
  const picked = [];
  const candidates = pool.slice();
  while (picked.length < 3 && candidates.length > 0) {
    const totalW = candidates.reduce((s, c) => s + c.variance, 0);
    let r = Math.random() * totalW;
    let idx = 0;
    for (; idx < candidates.length - 1; idx++) {
      r -= candidates[idx].variance;
      if (r <= 0) break;
    }
    picked.push(candidates[idx].question);
    candidates.splice(idx, 1);
  }
  return picked;
}

// Scores answers against available labs and returns the winning lab.
// BIPOLAR scoring: factor = sliderValue − 5 ∈ [−5, +5].
//   right end (10) → +5 favors positive-impact labs;
//   left end (0)   → −5 favors negative-impact labs;
//   middle (5)     →  0 neutral.
function computeAssignment(questions, answers, availableLabs) {
  const cumulative = {};
  availableLabs.forEach(lab => { cumulative[lab.id] = 0; });

  questions.forEach((q, i) => {
    const factor = answers[i] - 5;
    availableLabs.forEach(lab => {
      cumulative[lab.id] += factor * (q.impatto[lab.id] ?? 0);
    });
  });

  const maxScore = Math.max(...Object.values(cumulative));
  const winners = availableLabs.filter(lab => cumulative[lab.id] === maxScore);

  if (winners.length === 1) return winners[0];

  // Tie-break: lowest fill ratio wins (promotes even filling).
  return winners.sort((a, b) => {
    const ra = a.occupied / a.capacity;
    const rb = b.occupied / b.capacity;
    if (Math.abs(ra - rb) > 0.0001) return ra - rb;
    return a.id.localeCompare(b.id);
  })[0];
}
