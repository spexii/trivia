import 'dotenv/config';
import { loadI18n } from './i18n.js';
import { loadQuestions } from './questions.js';
import { createPrismaClient } from './db.js';
import { checkAndResetSeason } from './seasonManager.js';
import { startWsServer } from './wsServer.js';
import { TriviaLoop } from './trivia.js';

const LANG = process.env.BOT_LANG ?? 'en';
const BOT_PORT = parseInt(process.env.BOT_PORT ?? '3001', 10);

async function main() {
  const i18n = loadI18n(LANG);
  const questions = loadQuestions(LANG);
  const prisma = createPrismaClient();
  const activeSeason = await checkAndResetSeason(prisma);

  console.log(i18n.started.replace('{count}', questions.length));

  const triviaLoop = new TriviaLoop(questions);

  const { broadcast } = startWsServer({
    port: BOT_PORT,
    prisma,
    triviaLoop,
    activeSeason,
  });

  triviaLoop.start();
  console.log(`Bot running on ws://localhost:${BOT_PORT} (lang=${LANG})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
