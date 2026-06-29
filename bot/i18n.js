import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUPPORTED = ['fi', 'en'];

export function loadI18n(lang) {
  const l = SUPPORTED.includes(lang) ? lang : 'fi';
  const filePath = path.join(__dirname, 'i18n', `${l}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
