export async function checkAndResetSeason(prisma) {
  const active = await prisma.season.findFirst({ where: { endedAt: null } });

  if (!active) return startNewSeason(prisma, 'monthly');

  if (active.type === 'monthly') {
    const now = new Date();
    const start = new Date(active.startedAt);
    const monthPassed =
      now.getFullYear() > start.getFullYear() ||
      now.getMonth() > start.getMonth();

    if (monthPassed) {
      await prisma.season.update({ where: { id: active.id }, data: { endedAt: now } });
      return startNewSeason(prisma, 'monthly');
    }
  }

  return active;
}

export async function startNewSeason(prisma, type) {
  const now = new Date();
  const name = formatSeasonName(now);
  return prisma.season.create({ data: { name, type, startedAt: now } });
}

export async function endAndResetSeason(prisma, activeSeasonId) {
  const now = new Date();
  await prisma.season.update({ where: { id: activeSeasonId }, data: { endedAt: now } });
  return startNewSeason(prisma, 'manual');
}

function formatSeasonName(date) {
  const lang = process.env.LANG ?? 'fi';
  return date.toLocaleDateString(lang === 'fi' ? 'fi-FI' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
}
