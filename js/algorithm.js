// Picks 3 questions that maximally discriminate between available labs.
// Uses variance of impact values across the available lab set as discriminating power metric.
function selectQuestions(availableLabs) {
  const scored = QUESTIONS.map(q => {
    const impacts = availableLabs.map(lab => q.impatto[lab.id] ?? 0);
    const n = impacts.length;
    const mean = impacts.reduce((a, b) => a + b, 0) / n;
    const variance = impacts.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
    return { question: q, variance };
  });
  scored.sort((a, b) => b.variance - a.variance);
  return scored.slice(0, 3).map(s => s.question);
}

// Scores answers against available labs and returns the winning lab.
// answers[i] ∈ [0, 10]; score contribution = sliderValue × impact.
function computeAssignment(questions, answers, availableLabs) {
  const cumulative = {};
  availableLabs.forEach(lab => { cumulative[lab.id] = 0; });

  questions.forEach((q, i) => {
    const val = answers[i];
    availableLabs.forEach(lab => {
      cumulative[lab.id] += val * (q.impatto[lab.id] ?? 0);
    });
  });

  const maxScore = Math.max(...Object.values(cumulative));
  const winners = availableLabs.filter(lab => cumulative[lab.id] === maxScore);

  if (winners.length === 1) return winners[0];

  // Tie-break: lowest fill ratio wins (promotes even filling)
  return winners.sort((a, b) => {
    const ra = a.occupied / a.capacity;
    const rb = b.occupied / b.capacity;
    if (Math.abs(ra - rb) > 0.0001) return ra - rb;
    return a.id.localeCompare(b.id);
  })[0];
}
