import fs from 'fs';
import path from 'path';
import { loadDB, saveDB, recalculateAllScores } from './db';

// Helper to get Farsi day name from standard JS day index (0-6)
export function getFarsiDayName(dayIndex: number): string {
  const days = [
    'یکشنبه', // Sunday = 0
    'دوشنبه', // Monday = 1
    'سه‌شنبه', // Tuesday = 2
    'چهارشنبه', // Wednesday = 3
    'پنج‌شنبه', // Thursday = 4
    'جمعه', // Friday = 5
    'شنبه' // Saturday = 6
  ];
  return days[dayIndex];
}

// Create a database backup file under process.cwd()/backups/
export function triggerBackupInDirectory(): string {
  const db = loadDB();
  const backupsDir = fs.existsSync(path.join(process.cwd(), 'data'))
    ? path.join(process.cwd(), 'data', 'backups')
    : path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .substring(0, 19); // YYYY-MM-DD_HH-mm-ss

  const filename = `backup_${timestamp}.json`;
  const filePath = path.join(backupsDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');

  // Update last backup time inside settings
  if (!db.settings) {
    db.settings = { registrationEnabled: true };
  }
  db.settings.lastBackupTime = now.toISOString();
  saveDB(db);

  console.log(`[BACKUP] Completed backup successfully: ${filename}`);
  return filename;
}

// Evaluates settings schedules and triggers auto-backups
export function checkAndTriggerBackup(): void {
  try {
    const db = loadDB();
    const settings = db.settings;
    if (!settings || !settings.backupEnabled) return;

    const now = new Date();
    const nowTime = now.getTime();

    // Parse last backup time
    const lastBackup = settings.lastBackupTime ? new Date(settings.lastBackupTime).getTime() : 0;
    
    let shouldBackup = false;

    if (settings.backupFrequency === 'daily') {
      const times = Number(settings.backupTimesPerDay) || 1;
      const intervalMs = (24 / times) * 60 * 60 * 1000;
      if (nowTime - lastBackup >= intervalMs) {
        shouldBackup = true;
      }
    } else if (settings.backupFrequency === 'weekly') {
      const times = Number(settings.backupTimesPerDay) || 1;
      const intervalMs = (7 * 24 / times) * 60 * 60 * 1000;
      if (nowTime - lastBackup >= intervalMs) {
        shouldBackup = true;
      }
    } else if (settings.backupFrequency === 'custom') {
      const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"
      const currentDayNameFarsi = getFarsiDayName(now.getDay());

      const matchedDay = (settings.backupDays || []).some(day =>
        day.toLowerCase() === currentDayName.toLowerCase() ||
        day === currentDayNameFarsi ||
        day === String(now.getDay())
      );

      if (matchedDay) {
        const times = Number(settings.backupTimesPerDay) || 1;
        const intervalMs = (24 / times) * 60 * 60 * 1000;

        const isLastBackupToday = new Date(lastBackup).toDateString() === now.toDateString();
        if (!isLastBackupToday || (nowTime - lastBackup >= intervalMs)) {
          shouldBackup = true;
        }
      }
    }

    if (shouldBackup) {
      console.log(`[BACKUP-SCHEDULER] Automatic scheduled backup conditions matched! Creating snapshots...`);
      triggerBackupInDirectory();
    }
  } catch (err) {
    console.error('[BACKUP-SCHEDULER] Automated scheduler criteria evaluation failed:', err);
  }
}
