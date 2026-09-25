/* ==========================================================
   MindScope | script.js
   Vanilla JS behavioral self-reflection assessment.
   Data, scoring, rendering and localStorage all live here.
   ========================================================== */

/* ----------------------------------------------------------
   1. DIMENSION DEFINITIONS
   Each answer choice awards 0-3 points to one or more of
   these dimensions. Nothing here is a clinical label.
   they're just behavioral tendencies we're tracking.
---------------------------------------------------------- */
const DIMENSIONS = {
  analytical: "Analytical Thinking",
  risk: "Risk Tolerance",
  social: "Social Orientation",
  independence: "Independence",
  emotional: "Emotional Reactivity",
  adapt: "Adaptability",
  impulse: "Impulse / Spontaneity",
  planning: "Planning",
  conflict: "Conflict Directness",
  curiosity: "Curiosity & Openness",
  persistence: "Persistence",
  certainty: "Need for Certainty",
};

/* ----------------------------------------------------------
   2. QUESTION BANK (25 scenario-based questions)
   Every choice carries a "scores" object. Points are only
   added for dimensions that are relevant to that choice.
   there is no "correct" option.
---------------------------------------------------------- */
const QUESTIONS = [
  {
    text: "You have an important task due tomorrow, but you suddenly lose motivation. What do you usually do?",
    choices: [
      {
        text: "Force myself to finish it immediately.",
        scores: { impulse: 3, persistence: 2 },
      },
      {
        text: "Take a short break and return later.",
        scores: { adapt: 2, impulse: 1 },
      },
      {
        text: "Look for something else to do first.",
        scores: { curiosity: 2 },
      },
      {
        text: "Make a detailed plan before continuing.",
        scores: { planning: 3, analytical: 2 },
      },
    ],
  },
  {
    text: "A friend suddenly becomes distant without explaining why. What is your first reaction?",
    choices: [
      {
        text: "Ask them directly what happened.",
        scores: { conflict: 3, social: 2 },
      },
      { text: "Give them space.", scores: { independence: 2, adapt: 2 } },
      {
        text: "Start wondering whether I did something wrong.",
        scores: { emotional: 3, certainty: 2 },
      },
      {
        text: "Continue normally unless they mention it.",
        scores: { independence: 1, adapt: 1 },
      },
    ],
  },
  {
    text: "You're offered an opportunity with a potentially large reward but a significant chance of failure. What do you usually do?",
    choices: [
      { text: "Take the opportunity.", scores: { risk: 3, impulse: 2 } },
      {
        text: "Research it carefully first.",
        scores: { analytical: 3, planning: 2 },
      },
      { text: "Ask someone I trust.", scores: { social: 2, certainty: 1 } },
      {
        text: "Avoid it unless the risk is very low.",
        scores: { certainty: 3, planning: 1 },
      },
    ],
  },
  {
    text: "You're in a group discussion and someone strongly disagrees with you. What are you most likely to do?",
    choices: [
      {
        text: "Push back and explain why I think I'm right.",
        scores: { conflict: 3, independence: 2 },
      },
      {
        text: "Ask questions to understand their view.",
        scores: { curiosity: 3, social: 2 },
      },
      {
        text: "Let it go to keep the peace.",
        scores: { social: 1, emotional: 1 },
      },
      { text: "Feel uncomfortable but stay quiet.", scores: { emotional: 3 } },
    ],
  },
  {
    text: "A schedule you were counting on changes at the last minute. How do you respond?",
    choices: [
      { text: "Adjust quickly and move on.", scores: { adapt: 3, impulse: 2 } },
      {
        text: "Feel frustrated for a while before adjusting.",
        scores: { emotional: 3, adapt: 1 },
      },
      {
        text: "Try to salvage the original plan.",
        scores: { persistence: 3, planning: 2 },
      },
      {
        text: "Use it as a chance to do something unplanned.",
        scores: { curiosity: 3, adapt: 2 },
      },
    ],
  },
  {
    text: "You come across information that directly contradicts something you believed. What do you do?",
    choices: [
      {
        text: "Update my opinion right away.",
        scores: { curiosity: 3, adapt: 2 },
      },
      {
        text: "Look for more evidence before deciding.",
        scores: { analytical: 3, certainty: 1 },
      },
      {
        text: "Feel skeptical and stick with my original view.",
        scores: { certainty: 3, persistence: 2 },
      },
      {
        text: "Ask others what they think.",
        scores: { social: 2, curiosity: 1 },
      },
    ],
  },
  {
    text: "You're suddenly overwhelmed with more tasks than you can comfortably handle. What's your go-to move?",
    choices: [
      { text: "Make a priority list.", scores: { planning: 3, analytical: 2 } },
      {
        text: "Tackle whatever feels most urgent first.",
        scores: { impulse: 2, adapt: 1 },
      },
      { text: "Ask for help splitting the load.", scores: { social: 3 } },
      {
        text: "Push through by working longer hours.",
        scores: { persistence: 3, impulse: 1 },
      },
    ],
  },
  {
    text: "You're at a social event where you barely know anyone. What do you tend to do?",
    choices: [
      {
        text: "Introduce myself to as many people as I can.",
        scores: { social: 3, risk: 1 },
      },
      {
        text: "Stick close to the few people I know.",
        scores: { certainty: 2, independence: 1 },
      },
      {
        text: "Observe first, then join conversations gradually.",
        scores: { analytical: 1, social: 1, certainty: 1 },
      },
      {
        text: "Feel anxious and consider leaving early.",
        scores: { emotional: 3 },
      },
    ],
  },
  {
    text: "You're about to make a significant purchase. How do you usually decide?",
    choices: [
      {
        text: "Decide quickly based on gut feeling.",
        scores: { impulse: 3, risk: 2 },
      },
      {
        text: "Compare options and research thoroughly.",
        scores: { analytical: 3, planning: 2 },
      },
      {
        text: "Ask friends or family for their opinions.",
        scores: { social: 2, certainty: 1 },
      },
      {
        text: "Delay the decision until I feel completely sure.",
        scores: { certainty: 3, planning: 1 },
      },
    ],
  },
  {
    text: "A deadline is closing in and you're not finished. What happens next?",
    choices: [
      {
        text: "Focus intensely until it's done.",
        scores: { persistence: 3, impulse: 1 },
      },
      {
        text: "Break it into small steps and pace myself.",
        scores: { planning: 3, analytical: 1 },
      },
      {
        text: "Feel stressed and struggle to concentrate.",
        scores: { emotional: 3 },
      },
      {
        text: "Try to negotiate for more time.",
        scores: { conflict: 2, social: 1 },
      },
    ],
  },
  {
    text: "Someone gives you pointed criticism about your work. What's your instinct?",
    choices: [
      {
        text: "Ask for specifics so I can improve.",
        scores: { curiosity: 2, analytical: 1, conflict: 1 },
      },
      { text: "Feel hurt but try not to show it.", scores: { emotional: 3 } },
      {
        text: "Defend my choices and explain my reasoning.",
        scores: { conflict: 3, independence: 2 },
      },
      {
        text: "Take note but decide for myself if it's valid.",
        scores: { independence: 3, analytical: 1 },
      },
    ],
  },
  {
    text: "You have a completely free, unstructured weekend ahead. What's most likely?",
    choices: [
      { text: "Plan activities in advance.", scores: { planning: 3 } },
      {
        text: "Decide spontaneously as the day goes.",
        scores: { impulse: 2, adapt: 2 },
      },
      {
        text: "Try something new I haven't done before.",
        scores: { curiosity: 3, risk: 1 },
      },
      {
        text: "Use it to rest and recharge alone.",
        scores: { independence: 2 },
      },
    ],
  },
  {
    text: "Your group needs to divide up the work on a shared project. What do you do?",
    choices: [
      {
        text: "Take charge and assign roles.",
        scores: { independence: 2, conflict: 2 },
      },
      {
        text: "Wait to see what others want to do first.",
        scores: { social: 2, adapt: 1 },
      },
      {
        text: "Pick the part I'm most confident doing.",
        scores: { analytical: 1, certainty: 2 },
      },
      {
        text: "Volunteer for whatever needs the most help.",
        scores: { social: 3, persistence: 1 },
      },
    ],
  },
  {
    text: "You're traveling and your plans suddenly fall apart. How do you react?",
    choices: [
      {
        text: "Roll with it and figure it out as I go.",
        scores: { adapt: 3, risk: 1 },
      },
      {
        text: "Feel anxious until a new plan is set.",
        scores: { emotional: 2, certainty: 2 },
      },
      {
        text: "Take charge of finding a solution.",
        scores: { independence: 3, analytical: 1 },
      },
      {
        text: "See it as an unexpected adventure.",
        scores: { curiosity: 3, risk: 2 },
      },
    ],
  },
  {
    text: "You're picking up a completely new skill. What's your approach?",
    choices: [
      {
        text: "Read or study the theory before practicing.",
        scores: { analytical: 3, planning: 1 },
      },
      {
        text: "Jump in and learn by doing.",
        scores: { impulse: 2, curiosity: 2 },
      },
      {
        text: "Find a mentor or course to guide me.",
        scores: { social: 2, certainty: 2 },
      },
      {
        text: "Keep practicing even when it's frustrating.",
        scores: { persistence: 3 },
      },
    ],
  },
  {
    text: "Two friends are in a conflict and both want you on their side. What do you do?",
    choices: [
      {
        text: "Stay neutral and encourage them to talk it out.",
        scores: { conflict: 1, social: 2 },
      },
      {
        text: "Share my honest opinion, even if it's unpopular.",
        scores: { conflict: 3, independence: 2 },
      },
      { text: "Avoid getting involved at all.", scores: { independence: 1 } },
      {
        text: "Try to understand both sides before saying anything.",
        scores: { curiosity: 3, analytical: 1 },
      },
    ],
  },
  {
    text: "You're weighing a job offer that's promising but full of unknowns. What's your move?",
    choices: [
      {
        text: "Accept it, the upside seems worth it.",
        scores: { risk: 3, impulse: 1 },
      },
      {
        text: "Weigh the pros and cons carefully.",
        scores: { analytical: 3, planning: 2 },
      },
      {
        text: "Wait for more certainty before deciding.",
        scores: { certainty: 3 },
      },
      {
        text: "Talk to people who've been in similar roles.",
        scores: { social: 2, curiosity: 1 },
      },
    ],
  },
  {
    text: "You realize you made a mistake at work. What happens next?",
    choices: [
      {
        text: "Own it immediately and fix it.",
        scores: { conflict: 2, persistence: 2 },
      },
      {
        text: "Feel embarrassed and replay it repeatedly.",
        scores: { emotional: 3 },
      },
      {
        text: "Analyze what went wrong to avoid repeating it.",
        scores: { analytical: 3, planning: 1 },
      },
      { text: "Move on quickly without dwelling on it.", scores: { adapt: 2 } },
    ],
  },
  {
    text: "Your daily routine has started to feel repetitive and dull. What do you do?",
    choices: [
      {
        text: "Look for new experiences to break it up.",
        scores: { curiosity: 3, risk: 1 },
      },
      {
        text: "Stick with the routine, it's comfortable.",
        scores: { certainty: 2, planning: 1 },
      },
      {
        text: "Find small ways to make the routine more interesting.",
        scores: { adapt: 2, curiosity: 1 },
      },
      {
        text: "Feel restless and irritable.",
        scores: { emotional: 2, impulse: 1 },
      },
    ],
  },
  {
    text: "You're in a group brainstorming session. How do you typically contribute?",
    choices: [
      {
        text: "Share ideas freely, even half-formed ones.",
        scores: { curiosity: 2, social: 2, impulse: 1 },
      },
      {
        text: "Listen first, then offer a refined idea.",
        scores: { analytical: 2, social: 1 },
      },
      {
        text: "Prefer to think it through alone first.",
        scores: { independence: 3 },
      },
      {
        text: "Build on other people's ideas out loud.",
        scores: { social: 3, adapt: 1 },
      },
    ],
  },
  {
    text: "You're torn between a long-term goal and an appealing short-term reward. What usually wins?",
    choices: [
      {
        text: "The long-term goal, even if it's harder.",
        scores: { persistence: 3, planning: 2 },
      },
      {
        text: "The short-term reward, at least sometimes.",
        scores: { impulse: 2, risk: 1 },
      },
      {
        text: "I set small milestones to stay motivated toward the goal.",
        scores: { planning: 3, analytical: 1 },
      },
      {
        text: "I reassess whether the goal still matters as much.",
        scores: { adapt: 2, curiosity: 1 },
      },
    ],
  },
  {
    text: "You receive a compliment and a piece of criticism at the same time. What do you focus on?",
    choices: [
      {
        text: "The criticism, I turn it over in my mind.",
        scores: { emotional: 2, certainty: 1 },
      },
      {
        text: "The compliment, it sticks with me more.",
        scores: { emotional: 1, social: 1 },
      },
      {
        text: "I weigh both evenly and think about what's actionable.",
        scores: { analytical: 3 },
      },
      {
        text: "I feel unsettled and need time to process both.",
        scores: { emotional: 3, certainty: 2 },
      },
    ],
  },
  {
    text: "You're moving to a new city where you don't know anyone. What's your plan?",
    choices: [
      {
        text: "Get out and meet new people right away.",
        scores: { social: 3, risk: 1 },
      },
      {
        text: "Take time to settle in before socializing.",
        scores: { certainty: 2, independence: 1 },
      },
      {
        text: "Explore the city on my own first.",
        scores: { independence: 3, curiosity: 2 },
      },
      {
        text: "Research the area thoroughly before the move.",
        scores: { analytical: 2, planning: 3 },
      },
    ],
  },
  {
    text: "You have to make a decision fast, with no time to gather more information. What happens?",
    choices: [
      { text: "I go with my gut instinct.", scores: { impulse: 3, risk: 1 } },
      {
        text: "I quickly weigh the top two or three options.",
        scores: { analytical: 2, planning: 1 },
      },
      {
        text: "I ask someone nearby for a fast opinion.",
        scores: { social: 2 },
      },
      {
        text: "I freeze up and struggle to choose.",
        scores: { emotional: 3, certainty: 2 },
      },
    ],
  },
  {
    text: "Looking back on a past failure, what do you tend to do?",
    choices: [
      {
        text: "Analyze what went wrong in detail.",
        scores: { analytical: 3, planning: 1 },
      },
      {
        text: "Try again immediately, undeterred.",
        scores: { persistence: 3, impulse: 1 },
      },
      {
        text: "Feel discouraged for a while before moving on.",
        scores: { emotional: 3 },
      },
      {
        text: "Look for what it taught me and move forward.",
        scores: { curiosity: 3, adapt: 2 },
      },
    ],
  },
];

/* ----------------------------------------------------------
   3. ARCHETYPES
   Descriptive, non-clinical profiles based on which
   dimensions score highest. These are app-specific labels,
   not validated psychological categories.
---------------------------------------------------------- */
const ARCHETYPES = [
  {
    name: "The Strategist",
    keyDims: ["analytical", "planning"],
    desc: "You tend to slow down before you act, mapping out options, weighing trade-offs, and building a plan before committing. Structure feels less like a constraint and more like a tool.",
  },
  {
    name: "The Explorer",
    keyDims: ["curiosity", "risk"],
    desc: "You're drawn toward the unfamiliar. New ideas, new situations, and a bit of uncertainty tend to energize you rather than put you off.",
  },
  {
    name: "The Observer",
    keyDims: ["analytical", "certainty"],
    desc: "You prefer to understand something fully before acting on it. You're comfortable holding off on a decision until you trust the information behind it.",
  },
  {
    name: "The Adaptive Thinker",
    keyDims: ["adapt", "curiosity"],
    desc: "When things shift unexpectedly, you tend to move with them rather than against them, treating change as something to work with, not just something to endure.",
  },
  {
    name: "The Independent Thinker",
    keyDims: ["independence", "analytical"],
    desc: "You tend to trust your own read on a situation. Outside input is welcome, but you generally want to land on conclusions yourself.",
  },
  {
    name: "The Social Navigator",
    keyDims: ["social", "conflict"],
    desc: "People and relationships tend to factor heavily into how you move through situations, you notice the social dynamics in a room and often address things directly rather than letting them sit.",
  },
];

/* ----------------------------------------------------------
   4. APPLICATION STATE
---------------------------------------------------------- */
let state = {
  currentIndex: 0,
  answers: new Array(QUESTIONS.length).fill(null), // stores selected choice index per question
};

const STORAGE_KEY = "mindscope_history";

/* ----------------------------------------------------------
   5. DOM REFERENCES
---------------------------------------------------------- */
const screens = {
  home: document.getElementById("homeScreen"),
  quiz: document.getElementById("quizScreen"),
  results: document.getElementById("resultsScreen"),
  history: document.getElementById("historyScreen"),
};

const startBtn = document.getElementById("startBtn");
const resumeHistoryBtn = document.getElementById("resumeHistoryBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const questionText = document.getElementById("questionText");
const choicesList = document.getElementById("choicesList");
const progressFill = document.getElementById("progressFill");
const questionCounter = document.getElementById("questionCounter");

const restartBtn = document.getElementById("restartBtn");
const viewHistoryBtn = document.getElementById("viewHistoryBtn");
const historyNavBtn = document.getElementById("historyNavBtn");
const backHomeBtn = document.getElementById("backHomeBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

/* ----------------------------------------------------------
   6. NAVIGATION HELPERS
---------------------------------------------------------- */
function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");

  if (name === "quiz" || name === "results" || name === "history") {
    requestAnimationFrame(() => {
      screens[name].scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ----------------------------------------------------------
   7. QUIZ FLOW
---------------------------------------------------------- */
function startAssessment() {
  state = {
    currentIndex: 0,
    answers: new Array(QUESTIONS.length).fill(null),
  };
  showScreen("quiz");
  showQuestion();
}

function showQuestion() {
  const q = QUESTIONS[state.currentIndex];
  questionText.textContent = q.text;

  // Build the choice buttons for this question
  choicesList.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.setAttribute("type", "button");
    btn.innerHTML = `<span class="choice-letter">${letters[i]}</span><span class="choice-text">${choice.text}</span>`;
    if (state.answers[state.currentIndex] === i) {
      btn.classList.add("selected");
    }
    btn.addEventListener("click", () => selectAnswer(i));
    choicesList.appendChild(btn);
  });

  // Progress bar + counter
  const progressPct = (state.currentIndex / QUESTIONS.length) * 100;
  progressFill.style.width = progressPct + "%";
  questionCounter.textContent = `Question ${state.currentIndex + 1} of ${QUESTIONS.length}`;

  // Nav button states
  prevBtn.disabled = state.currentIndex === 0;
  nextBtn.disabled = state.answers[state.currentIndex] === null;
  nextBtn.textContent =
    state.currentIndex === QUESTIONS.length - 1 ? "See My Results" : "Next";
}

function selectAnswer(choiceIndex) {
  state.answers[state.currentIndex] = choiceIndex;

  // Update selected styling
  [...choicesList.children].forEach((el, i) => {
    el.classList.toggle("selected", i === choiceIndex);
  });

  nextBtn.disabled = false;
}

function nextQuestion() {
  if (state.answers[state.currentIndex] === null) return; // guard

  if (state.currentIndex === QUESTIONS.length - 1) {
    const result = calculateResults();
    saveResults(result);
    showResults(result);
    return;
  }
  state.currentIndex++;
  showQuestion();
}

function previousQuestion() {
  if (state.currentIndex === 0) return;
  state.currentIndex--;
  showQuestion();
}

/* ----------------------------------------------------------
   8. SCORING
---------------------------------------------------------- */
function calculateResults() {
  const totals = {};
  const maxPossible = {};
  Object.keys(DIMENSIONS).forEach((dim) => {
    totals[dim] = 0;
    maxPossible[dim] = 0;
  });

  QUESTIONS.forEach((q, qi) => {
    const chosenIndex = state.answers[qi];
    const chosenScores = q.choices[chosenIndex].scores;

    // Add the user's earned points
    Object.entries(chosenScores).forEach(([dim, val]) => {
      totals[dim] += val;
    });

    // Track the max any single choice offered for each dimension,
    // so we can normalize fairly per-question.
    const perQuestionMax = {};
    q.choices.forEach((choice) => {
      Object.entries(choice.scores).forEach(([dim, val]) => {
        perQuestionMax[dim] = Math.max(perQuestionMax[dim] || 0, val);
      });
    });
    Object.entries(perQuestionMax).forEach(([dim, val]) => {
      maxPossible[dim] += val;
    });
  });

  const scores = {};
  Object.keys(DIMENSIONS).forEach((dim) => {
    const max = maxPossible[dim] || 1; // avoid divide-by-zero
    scores[dim] = Math.round((totals[dim] / max) * 100);
  });

  const archetype = pickArchetype(scores);

  return {
    date: new Date().toISOString(),
    scores,
    archetypeName: archetype.name,
    archetypeDesc: archetype.desc,
    questionsCompleted: QUESTIONS.length,
  };
}

function pickArchetype(scores) {
  let best = ARCHETYPES[0];
  let bestAvg = -1;
  ARCHETYPES.forEach((arch) => {
    const avg =
      arch.keyDims.reduce((sum, d) => sum + scores[d], 0) / arch.keyDims.length;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = arch;
    }
  });
  return best;
}

/* ----------------------------------------------------------
   9. INSIGHT TEXT GENERATION
   Threshold-based, balanced language (mentions trade-offs,
   never diagnostic).
---------------------------------------------------------- */
function level(score) {
  if (score >= 65) return "high";
  if (score >= 35) return "mid";
  return "low";
}

const INSIGHT_TEXT = {
  decide: {
    high: "You tend to lean on structured, analytical thinking when making decisions, gathering information and weighing options before committing. That approach can reduce costly mistakes, but it can also slow you down when a fast call is what's actually needed.",
    mid: "Your decision-making blends gut instinct with some deliberate thought, shifting depending on the stakes involved. That flexibility is useful, though it can occasionally mean your approach feels inconsistent from one decision to the next.",
    low: "You tend to decide quickly and intuitively rather than dwelling on options. That can help you move fast and stay unstuck, but it may also mean occasionally acting before all the relevant information is in.",
  },
  conflict: {
    high: "You tend to address disagreement directly rather than let it linger. This can resolve tension faster, but it can also come across as confrontational if the other person prefers a softer approach.",
    mid: "You tend to read the situation before deciding how directly to engage in conflict, sometimes speaking up and sometimes letting things settle on their own.",
    low: "You tend to avoid direct confrontation when possible, favoring peace over friction. This can keep relationships smooth, but unresolved tension can build up over time if it's never addressed.",
  },
  uncertainty: {
    high: "You tend to want solid information before you feel settled about a situation. That caution can protect you from acting on shaky assumptions, but it can also cause hesitation when some ambiguity is simply unavoidable.",
    mid: "You can tolerate a fair amount of ambiguity, but you still appreciate having some clarity before fully committing to a direction.",
    low: "You tend to be comfortable moving forward even without full certainty. That comfort with ambiguity can be an asset in fast-changing situations, though it may occasionally lead you to commit before thinking things all the way through.",
  },
  social: {
    high: "You tend to orient toward people, seeking input, collaborating, and drawing energy from interaction. That can build strong connections, but it may also mean you rely on others' opinions more than your own at times.",
    mid: "You move between social engagement and solo focus depending on the situation, without leaning heavily on either.",
    low: "You tend to prefer working things out independently rather than looping others in early. That autonomy can be efficient, but it can also mean missing perspectives that a conversation might have surfaced.",
  },
  change: {
    high: "You tend to adjust quickly when circumstances shift, treating change as something to work with rather than resist. That flexibility helps in unpredictable situations, though it can sometimes mean under-investing in longer-term plans.",
    mid: "You can adapt to change when needed, but you generally prefer a bit of notice and structure to feel comfortable with it.",
    low: "You tend to prefer stability and a clear plan, and sudden change can be genuinely disruptive. That preference supports consistency, but it can also make abrupt shifts harder to absorb.",
  },
};

function buildDetailSections(scores) {
  return [
    {
      title: "How You Tend to Decide",
      key: "decide",
      score: (scores.analytical + (100 - scores.impulse)) / 2,
    },
    {
      title: "How You Tend to Handle Conflict",
      key: "conflict",
      score: scores.conflict,
    },
    {
      title: "How You React to Uncertainty",
      key: "uncertainty",
      score: scores.certainty,
    },
    {
      title: "How You Approach Social Situations",
      key: "social",
      score: scores.social,
    },
    { title: "How You Handle Change", key: "change", score: scores.adapt },
  ].map((section) => ({
    title: section.title,
    text: INSIGHT_TEXT[section.key][level(section.score)],
  }));
}

function buildHighlights(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topThree = sorted.slice(0, 3);
  return topThree.map(([dim, val]) => {
    return `Your responses suggest a notable lean toward <strong>${DIMENSIONS[dim]}</strong> (${val}%).`;
  });
}

function buildStrengthsAndReflections(scores) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-3).reverse();

  const strengthTemplates = {
    analytical: "You bring careful, structured thinking to problems.",
    risk: "You're willing to act on opportunities others might hesitate on.",
    social: "You draw on other people well and build connection easily.",
    independence: "You trust your own judgment and work well unsupervised.",
    emotional:
      "You feel things deeply, which can make you attentive to others' emotions too.",
    adapt: "You adjust to change without losing momentum.",
    impulse: "You act quickly and don't get stuck overthinking.",
    planning: "You prepare well, which reduces avoidable mistakes.",
    conflict:
      "You're willing to address problems directly instead of avoiding them.",
    curiosity: "You stay open to new ideas and information.",
    persistence: "You keep going even when things get difficult.",
    certainty: "You're careful about acting on incomplete information.",
  };

  const reflectTemplates = {
    analytical:
      "Leaning on analysis a lot can slow you down on decisions that don't need it.",
    risk: "It may help to occasionally pause and weigh downside before committing.",
    social:
      "Checking in with your own view before seeking others' input might sharpen your instincts.",
    independence:
      "Looping others in earlier could surface useful perspectives you'd otherwise miss.",
    emotional:
      "Building a few grounding habits for high-emotion moments could help you respond rather than react.",
    adapt:
      "Occasionally sticking with a plan a bit longer might pay off before pivoting.",
    impulse:
      "Pausing briefly before acting could catch details you might otherwise miss.",
    planning:
      "Leaving some room for spontaneity might reduce pressure when plans inevitably shift.",
    conflict:
      "Softening how disagreement is raised, without avoiding it, might land better with some people.",
    curiosity:
      "Following through on ideas, not just generating them, can turn curiosity into results.",
    persistence:
      "Knowing when to step back, not just push through, is worth building as a skill too.",
    certainty:
      "Practicing comfort with 'good enough' information could help you move a bit faster.",
  };

  return {
    strengths: top.map(([dim]) => strengthTemplates[dim]),
    reflections: bottom.map(([dim]) => reflectTemplates[dim]),
  };
}

/* ----------------------------------------------------------
   10. RESULTS RENDERING
---------------------------------------------------------- */
function showResults(result, previousResult) {
  document.getElementById("archetypeName").textContent = result.archetypeName;
  document.getElementById("archetypeDesc").textContent = result.archetypeDesc;

  // Chart
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = "";
  Object.entries(result.scores)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dim, val]) => {
      const row = document.createElement("div");
      row.className = "chart-row";
      row.innerHTML = `
        <div class="chart-row-top"><span>${DIMENSIONS[dim]}</span><strong>${val}%</strong></div>
        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:0%" data-target="${val}"></div></div>
      `;
      chartContainer.appendChild(row);
    });
  // animate bars after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      chartContainer.querySelectorAll(".chart-bar-fill").forEach((bar) => {
        bar.style.width = bar.dataset.target + "%";
      });
    }, 50);
  });

  // Highlights
  const highlightsList = document.getElementById("highlightsList");
  highlightsList.innerHTML = "";
  buildHighlights(result.scores).forEach((text) => {
    const li = document.createElement("li");
    li.innerHTML = text;
    highlightsList.appendChild(li);
  });

  // Detail sections
  const detailSections = document.getElementById("detailSections");
  detailSections.innerHTML = "";
  buildDetailSections(result.scores).forEach((section) => {
    const card = document.createElement("div");
    card.className = "detail-card";
    card.innerHTML = `<h4>${section.title}</h4><p>${section.text}</p>`;
    detailSections.appendChild(card);
  });

  // Strengths / reflections
  const { strengths, reflections } = buildStrengthsAndReflections(
    result.scores,
  );
  const strengthsList = document.getElementById("strengthsList");
  const reflectList = document.getElementById("reflectList");
  strengthsList.innerHTML = strengths.map((s) => `<li>${s}</li>`).join("");
  reflectList.innerHTML = reflections.map((r) => `<li>${r}</li>`).join("");

  // Compare banner
  const compareBanner = document.getElementById("compareBanner");
  if (previousResult) {
    const diffs = Object.keys(DIMENSIONS)
      .map((dim) => ({
        dim,
        delta: result.scores[dim] - previousResult.scores[dim],
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 2)
      .filter((d) => d.delta !== 0);

    if (diffs.length > 0) {
      const parts = diffs.map((d) => {
        const dir = d.delta > 0 ? "up" : "down";
        return `${DIMENSIONS[d.dim]} is ${dir} ${Math.abs(d.delta)} points`;
      });
      compareBanner.textContent = `Compared to your previous assessment (${formatDate(previousResult.date)}): ${parts.join(", ")}.`;
      compareBanner.classList.remove("hidden");
    } else {
      compareBanner.classList.add("hidden");
    }
  } else {
    compareBanner.classList.add("hidden");
  }

  showScreen("results");
}

/* ----------------------------------------------------------
   11. LOCALSTORAGE / HISTORY
---------------------------------------------------------- */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveResults(result) {
  const history = loadHistory();
  history.push(result);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // localStorage unavailable, fail silently, app still works this session
  }
  updateHistoryButtons();
}

function getPreviousResult() {
  const history = loadHistory();
  if (history.length < 2) return null;
  return history[history.length - 2];
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderHistory() {
  const history = loadHistory();
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = `<div class="history-empty">No assessments yet. Take the assessment once to start building your history.</div>`;
    return;
  }

  [...history].reverse().forEach((entry, reversedIndex) => {
    const realIndex = history.length - 1 - reversedIndex;
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div class="history-item-main">
        <span class="history-item-archetype">${entry.archetypeName}</span>
        <span class="history-item-date">${formatDate(entry.date)} · ${entry.questionsCompleted} questions</span>
      </div>
      <div class="history-item-actions">
        <button class="btn btn-ghost" data-index="${realIndex}">View</button>
      </div>
    `;
    item.querySelector("button").addEventListener("click", () => {
      const prev = realIndex > 0 ? history[realIndex - 1] : null;
      showResults(history[realIndex], prev);
    });
    historyList.appendChild(item);
  });
}

function updateHistoryButtons() {
  const history = loadHistory();
  resumeHistoryBtn.classList.toggle("hidden", history.length === 0);
}

/* ----------------------------------------------------------
   12. THEME TOGGLE
---------------------------------------------------------- */
function setThemeIcon(isLight) {
  const moonIcon = `
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3a8.8 8.8 0 1 0 11 11.5Z"/>
    </svg>
  `;

  const sunIcon = `
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2.6M12 19.4V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.6M19.4 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>
    </svg>
  `;

  themeToggleBtn.innerHTML = isLight ? sunIcon : moonIcon;
  themeToggleBtn.title = isLight
    ? "Switch to dark mode"
    : "Switch to light mode";
  themeToggleBtn.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode",
  );
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  setThemeIcon(isLight);
  try {
    localStorage.setItem("mindscope_theme", isLight ? "light" : "dark");
  } catch (e) {
    /* ignore */
  }
}

function initTheme() {
  try {
    const saved = localStorage.getItem("mindscope_theme");
    if (saved === "light") {
      document.body.classList.add("light");
      setThemeIcon(true);
    } else {
      setThemeIcon(false);
    }
  } catch (e) {
    /* ignore */
  }
}

/* ----------------------------------------------------------
   13. RESTART
---------------------------------------------------------- */
function restartAssessment() {
  startAssessment();
}

/* ----------------------------------------------------------
   14. EVENT LISTENERS
---------------------------------------------------------- */
startBtn.addEventListener("click", startAssessment);
resumeHistoryBtn.addEventListener("click", () => {
  renderHistory();
  showScreen("history");
});
prevBtn.addEventListener("click", previousQuestion);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartAssessment);
viewHistoryBtn.addEventListener("click", () => {
  renderHistory();
  showScreen("history");
});
historyNavBtn.addEventListener("click", () => {
  renderHistory();
  showScreen("history");
});
backHomeBtn.addEventListener("click", () => showScreen("home"));
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Clear all saved assessment history? This can't be undone.")) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    updateHistoryButtons();
  }
});
themeToggleBtn.addEventListener("click", toggleTheme);

/* ----------------------------------------------------------
   15. INIT
---------------------------------------------------------- */
initTheme();
updateHistoryButtons();
