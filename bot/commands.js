import { getSeasonTop, getAllTimeTop, getPersonalStats } from './db.js';
import { endAndResetSeason } from './seasonManager.js';

const HELP_LINES = {
  everyone: ['!stats — omat tilastot', '!season — kausipistetaulukko', '!hof — all-time hall of fame', '!help — tämä lista'],
  moderator: ['!next — ohita kysymys', '!pause — tauko/jatka'],
  owner: ['!reset — päätä kausi, aloita uusi'],
};

export async function handleCommand({
  name, nick, role, ws,
  triviaLoop, prisma, activeSeason,
  sendTo, broadcast,
}) {
  const canModerate = role === 'owner' || role === 'moderator';
  const isOwner = role === 'owner';

  switch (name) {
    case 'help': {
      const lines = [...HELP_LINES.everyone];
      if (canModerate) lines.push(...HELP_LINES.moderator);
      if (isOwner) lines.push(...HELP_LINES.owner);
      broadcast({ type: 'system', key: 'help', params: { text: lines.join(' · ') } });
      break;
    }
    case 'stats': {
      const personal = await getPersonalStats(prisma, nick, activeSeason.id);
      sendTo(ws, { type: 'personal_stats', nick, seasonName: activeSeason.name, ...personal });
      break;
    }
    case 'season': {
      const rows = await getSeasonTop(prisma, activeSeason.id, 10);
      broadcast({ type: 'stats', subtype: 'season', seasonName: activeSeason.name, rows });
      break;
    }
    case 'hof': {
      const rows = await getAllTimeTop(prisma, 10);
      broadcast({ type: 'stats', subtype: 'hof', rows });
      break;
    }
    case 'next': {
      if (!canModerate) {
        sendTo(ws, { type: 'system', key: 'no_permission', params: { command: 'next' } });
        return;
      }
      triviaLoop.skip();
      broadcast({ type: 'system', key: 'question_skipped', params: { by: nick } });
      break;
    }
    case 'pause': {
      if (!canModerate) {
        sendTo(ws, { type: 'system', key: 'no_permission', params: { command: 'pause' } });
        return;
      }
      if (triviaLoop.isPaused) {
        triviaLoop.resume();
        broadcast({ type: 'system', key: 'trivia_resumed', params: { by: nick } });
      } else {
        triviaLoop.pause();
        broadcast({ type: 'system', key: 'trivia_paused', params: { by: nick } });
      }
      break;
    }
    case 'reset': {
      if (!isOwner) {
        sendTo(ws, { type: 'system', key: 'no_permission', params: { command: 'reset' } });
        return;
      }
      const newSeason = await endAndResetSeason(prisma, activeSeason.id);
      Object.assign(activeSeason, newSeason);
      triviaLoop.skip();
      broadcast({ type: 'system', key: 'season_reset', params: { by: nick, newSeason: newSeason.name } });
      break;
    }
    default:
      break;
  }
}
