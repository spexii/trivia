import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadQuestions(lang) {
  const filePath = path.join(__dirname, 'questions', `${lang}.txt`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
    .map(parseLine)
    .filter(q => q !== null);

  if (questions.length === 0) throw new Error(`No questions loaded from ${filePath}`);
  console.log(`Loaded ${questions.length} questions (${lang})`);
  return questions;
}

function parseLine(line) {
  const parts = line.split('*');
  if (parts.length < 2) return null;
  return {
    question: parts[0].trim(),
    answer: parts[1].trim(),
    altAnswers: parts.slice(2).map(a => a.trim()).filter(Boolean),
  };
}
