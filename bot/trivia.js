import { buildHintMask, applyHint } from './hints.js';

export class TriviaLoop {
  #questions;
  #remaining = [];
  #current = null;
  #timers = [];
  #paused = false;
  #questionNumber = 0;
  #hintLevel = 0;
  #broadcast;

  constructor(questions) {
    this.#questions = questions;
    this.#broadcast = () => {};
  }

  setBroadcast(fn) {
    this.#broadcast = fn;
  }

  start() {
    this.#nextQuestion();
  }

  pause() {
    if (this.#paused) return;
    this.#paused = true;
    this.#clearTimers();
  }

  resume() {
    if (!this.#paused) return;
    this.#paused = false;
    this.#nextQuestion();
  }

  skip() {
    this.#clearTimers();
    this.#current = null;
    this.#scheduleNext(0);
  }

  checkAnswer(nick, role, text) {
    if (!this.#current) return null;
    const normalized = text.trim().toLowerCase();
    const acceptable = [
      this.#current.answer,
      ...this.#current.altAnswers,
    ].map(a => a.toLowerCase());

    if (!acceptable.includes(normalized)) return null;

    const points = this.#hintLevel === 0 ? 3 : this.#hintLevel === 1 ? 2 : 1;
    const elapsedMs = Date.now() - this.#current.startedAt;
    const wpm = calcWpm(text, elapsedMs);
    const result = {
      nick,
      role,
      answer: this.#current.answer,
      question: this.#current.question,
      questionNumber: this.#questionNumber,
      points,
      elapsedMs,
      wpm,
    };

    this.#clearTimers();
    this.#current = null;
    this.#scheduleNext(5000);
    return result;
  }

  get isPaused() { return this.#paused; }
  get currentQuestion() { return this.#current; }

  #nextQuestion() {
    if (this.#paused) return;

    if (this.#remaining.length === 0) {
      this.#remaining = shuffle([...this.#questions]);
    }
    const q = this.#remaining.pop();
    this.#questionNumber++;
    this.#hintLevel = 0;
    this.#current = {
      ...q,
      hintMask: buildHintMask(q.answer),
      startedAt: Date.now(),
      questionNumber: this.#questionNumber,
    };

    this.#broadcast({ type: 'question', questionNumber: this.#questionNumber, text: q.question });

    this.#timers = [
      setTimeout(() => this.#showHint(1), 10_000),
      setTimeout(() => this.#showHint(2), 25_000),
      setTimeout(() => this.#timeout(), 60_000),
    ];
  }

  #showHint(level) {
    if (!this.#current) return;
    this.#hintLevel = level;
    const indices = level === 1
      ? this.#current.hintMask.hint1Indices
      : this.#current.hintMask.hint2Indices;
    const hint = applyHint(this.#current.answer, indices);
    this.#broadcast({ type: 'hint', questionNumber: this.#questionNumber, level, hint });
  }

  #timeout() {
    if (!this.#current) return;
    const answer = this.#current.answer;
    const qn = this.#questionNumber;
    this.#current = null;
    this.#broadcast({ type: 'timeout', questionNumber: qn, answer });
    this.#scheduleNext(2000);
  }

  #scheduleNext(delayMs) {
    this.#timers.push(setTimeout(() => this.#nextQuestion(), delayMs));
  }

  #clearTimers() {
    this.#timers.forEach(clearTimeout);
    this.#timers = [];
  }
}

function calcWpm(answer, elapsedMs) {
  const words = answer.length / 5;
  const minutes = elapsedMs / 60_000;
  return Math.round(words / minutes);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
