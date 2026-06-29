import { PrismaClient } from '@prisma/client';

let _prisma;
export function createPrismaClient() {
  _prisma = new PrismaClient();
  return _prisma;
}

export async function updateStatsCorrect(prisma, nick, seasonId, result) {
  const { points, elapsedMs, wpm, question, answer } = result;
  const now = new Date();

  const existing = await prisma.stats.findUnique({
    where: { nick_seasonId: { nick, seasonId } },
  });

  const isQuicker =
    !existing || existing.quickestAnswerMs === 0 || elapsedMs < existing.quickestAnswerMs;
  const isFasterWpm = !existing || wpm > existing.bestWpm;
  const newStreak = (existing?.currentStreak ?? 0) + 1;
  const newBestStreak = Math.max(existing?.bestStreak ?? 0, newStreak);

  const updated = await prisma.stats.upsert({
    where: { nick_seasonId: { nick, seasonId } },
    create: {
      nick,
      seasonId,
      points,
      questionsWon: 1,
      currentStreak: 1,
      bestStreak: 1,
      bestWpm: wpm,
      bestWpmQuestion: question,
      bestWpmAnswer: answer,
      bestWpmAnsweredAt: now,
      quickestAnswerMs: elapsedMs,
      quickestQuestion: question,
      quickestAnswer: answer,
      quickestAnsweredAt: now,
    },
    update: {
      points: { increment: points },
      questionsWon: { increment: 1 },
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      ...(isFasterWpm && {
        bestWpm: wpm,
        bestWpmQuestion: question,
        bestWpmAnswer: answer,
        bestWpmAnsweredAt: now,
      }),
      ...(isQuicker && {
        quickestAnswerMs: elapsedMs,
        quickestQuestion: question,
        quickestAnswer: answer,
        quickestAnsweredAt: now,
      }),
    },
  });

  const rank = await prisma.stats.count({
    where: { seasonId, points: { gt: updated.points } },
  }) + 1;

  return { totalPoints: updated.points, currentStreak: updated.currentStreak, rank };
}

export async function resetStreaks(prisma, seasonId, excludeNick) {
  await prisma.stats.updateMany({
    where: { seasonId, nick: { not: excludeNick } },
    data: { currentStreak: 0 },
  });
}

export async function getPersonalStats(prisma, nick, seasonId) {
  const [current, allSeasons] = await Promise.all([
    prisma.stats.findUnique({ where: { nick_seasonId: { nick, seasonId } } }),
    prisma.stats.findMany({ where: { nick } }),
  ]);

  const allTime = allSeasons.reduce((acc, s) => {
    const betterWpm = s.bestWpm > acc.bestWpm;
    const betterQuick = s.quickestAnswerMs > 0 && (acc.quickestAnswerMs === 0 || s.quickestAnswerMs < acc.quickestAnswerMs);
    return {
      points: acc.points + s.points,
      questionsWon: acc.questionsWon + s.questionsWon,
      bestStreak: Math.max(acc.bestStreak, s.bestStreak),
      bestWpm: betterWpm ? s.bestWpm : acc.bestWpm,
      bestWpmQuestion: betterWpm ? s.bestWpmQuestion : acc.bestWpmQuestion,
      bestWpmAnswer: betterWpm ? s.bestWpmAnswer : acc.bestWpmAnswer,
      quickestAnswerMs: betterQuick ? s.quickestAnswerMs : acc.quickestAnswerMs,
      quickestQuestion: betterQuick ? s.quickestQuestion : acc.quickestQuestion,
      quickestAnswer: betterQuick ? s.quickestAnswer : acc.quickestAnswer,
    };
  }, { points: 0, questionsWon: 0, bestStreak: 0, bestWpm: 0, bestWpmQuestion: null, bestWpmAnswer: null, quickestAnswerMs: 0, quickestQuestion: null, quickestAnswer: null });

  return { season: current ?? null, allTime };
}

export async function getSeasonTop(prisma, seasonId, limit = 10) {
  const rows = await prisma.stats.findMany({
    where: { seasonId },
    orderBy: [{ points: 'desc' }, { questionsWon: 'desc' }],
    take: limit,
  });
  return rows.map((r, i) => ({
    rank: i + 1,
    nick: r.nick,
    points: r.points,
    questionsWon: r.questionsWon,
    bestStreak: r.bestStreak,
    bestWpm: r.bestWpm,
  }));
}

export async function getAllTimeTop(prisma, limit = 10) {
  const rows = await prisma.stats.groupBy({
    by: ['nick'],
    _sum: { points: true, questionsWon: true },
    _max: { bestStreak: true, bestWpm: true },
    orderBy: { _sum: { points: 'desc' } },
    take: limit,
  });
  return rows.map((r, i) => ({
    rank: i + 1,
    nick: r.nick,
    points: r._sum.points ?? 0,
    questionsWon: r._sum.questionsWon ?? 0,
    bestStreak: r._max.bestStreak ?? 0,
    bestWpm: r._max.bestWpm ?? 0,
  }));
}
