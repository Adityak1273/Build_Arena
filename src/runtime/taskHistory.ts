import fs from 'fs';
import path from 'path';
import { TaskHistoryEntry } from '../types';

const artifactsDir = path.resolve(process.cwd(), 'artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

const historyFilePath = path.resolve(artifactsDir, 'task_history.json');

export function loadTaskHistory(): TaskHistoryEntry[] {
  try {
    if (fs.existsSync(historyFilePath)) {
      const raw = fs.readFileSync(historyFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[TaskHistory] Read warning:', e);
  }
  return [];
}

export function saveTaskHistoryEntry(entry: TaskHistoryEntry): void {
  try {
    const list = loadTaskHistory();
    list.unshift(entry);
    const trimmed = list.slice(0, 50);
    fs.writeFileSync(historyFilePath, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[TaskHistory] Save warning:', e);
  }
}

export function clearTaskHistory(): void {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify([]), 'utf-8');
  } catch (e) {
    console.warn('[TaskHistory] Clear warning:', e);
  }
}
