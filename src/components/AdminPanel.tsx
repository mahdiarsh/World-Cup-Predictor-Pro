import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Calendar, Trophy, Zap, Trash2, 
  UserX, UserCheck, Key, Plus, Edit2, Check, RefreshCw, Download
} from 'lucide-react';
import { User, Match, UserRole, MatchStage, MatchStatus } from '../types';
import { teamsSeed, getTeamName, getTeamFlag } from '../data/teams';
import Avatar from './Avatar';
import FlagIcon from './FlagIcon';
import AdminSquadSync from './AdminSquadSync';

const SHAMSI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const g_days_in_active_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy2 = jy - 979;
  let j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor((jy2 % 33 + 3) / 4);
  for (let i = 0; i < jm - 1; ++i) {
    j_day_no += i < 6 ? 31 : 30;
  }
  j_day_no += jd - 1;

  let g_day_no = j_day_no + 79;
  let gy2 = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no = g_day_no % 146097;

  let leap = 1;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy2 += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;
    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = 0;
    }
  }

  gy2 += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;

  if (g_day_no >= 366) {
    leap = 0;
    g_day_no--;
    gy2 += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  let i = 0;
  for (; i < 12; i++) {
    const dj = (i === 1 && leap) ? 29 : g_days_in_active_months[i];
    if (g_day_no < dj) {
      break;
    }
    g_day_no -= dj;
  }
  return [gy2, i + 1, g_day_no + 1];
}

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  let gy2 = gy - 1600;
  let gm2 = gm - 1;
  let gd2 = gd - 1;

  const g_days_in_active_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let g_day_no = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400);

  for (let i = 0; i < gm2; ++i) {
    g_day_no += g_days_in_active_months[i];
  }
  if (gm2 > 1 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || (gy2 % 400 === 0))) {
    g_day_no++;
  }
  g_day_no += gd2;

  let j_day_no = g_day_no - 79;
  const j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;

  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;

  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }

  let i = 0;
  for (; i < 11 && j_day_no >= (i < 6 ? 31 : 30); ++i) {
    j_day_no -= i < 6 ? 31 : 30;
  }
  return [jy, i + 1, j_day_no + 1];
}

interface AdminPanelProps {
  currentUser: User | null;
  users: User[];
  matches: Match[];
  onAddMatch: (match: any) => Promise<boolean>;
  onEditMatch: (id: string, updates: any) => Promise<boolean>;
  onSetMatchResult: (id: string, home: number | null, away: number | null) => Promise<boolean>;
  onDeleteMatch: (id: string) => Promise<boolean>;
  onAddUser: (user: any) => Promise<boolean>;
  onEditUser: (id: string, updates: any) => Promise<boolean>;
  onDisableUser: (id: string) => Promise<boolean>;
  onResetPassword: (id: string, newPass: string) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  onRecalculateScores: () => Promise<boolean>;
  registrationEnabled?: boolean;
  onToggleRegistration?: (enabled: boolean) => Promise<boolean>;
  onDownloadDB?: () => Promise<boolean>;
  onUploadDB?: (dbContent: any) => Promise<boolean>;
  onExportExcel?: () => Promise<boolean>;
  settings?: any;
  onUpdateSettings?: (updates: any) => Promise<boolean>;
}

export default function AdminPanel({
  currentUser,
  users,
  matches,
  onAddMatch,
  onEditMatch,
  onSetMatchResult,
  onDeleteMatch,
  onAddUser,
  onEditUser,
  onDisableUser,
  onResetPassword,
  onDeleteUser,
  onRecalculateScores,
  registrationEnabled = true,
  onToggleRegistration,
  onDownloadDB,
  onUploadDB,
  onExportExcel,
  settings = {},
  onUpdateSettings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'engine'>('matches');
  const [displayTime, setDisplayTime] = useState<Date | null>(null);

  // Sync client-side display clock with backend simulation settings in admin panel
  useEffect(() => {
    if (settings?.simulatedTime) {
      setDisplayTime(new Date(settings.simulatedTime));
    } else {
      setDisplayTime(null);
    }
  }, [settings?.simulatedTime]);

  // Local clock ticker for admin panel
  useEffect(() => {
    if (settings?.syncMode !== 'simulation' || !displayTime || settings?.isFastForwarding) {
      return;
    }
    const tick = setInterval(() => {
      setDisplayTime(prev => prev ? new Date(prev.getTime() + 1000) : null);
    }, 1000);
    return () => clearInterval(tick);
  }, [settings?.syncMode, settings?.isFastForwarding, !displayTime]);

  // SMS Panel Settings State
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsUsername, setSmsUsername] = useState('');
  const [smsPassword, setSmsPassword] = useState('');
  const [smsBodyIdVerify, setSmsBodyIdVerify] = useState('');
  const [smsBodyIdReset, setSmsBodyIdReset] = useState('');
  const [smsInitialized, setSmsInitialized] = useState(false);

  // Gemini/OpenRouter Settings State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('google/gemini-2.5-flash');
  const [proxyType, setProxyType] = useState<'none' | 'http' | 'socks' | 'mix'>('none');
  const [geminiProxyMode, setGeminiProxyMode] = useState<'none' | 'auto' | 'manual'>('none');
  const [geminiProxyUrl, setGeminiProxyUrl] = useState('');
  const [geminiHttpProxy, setGeminiHttpProxy] = useState('');
  const [geminiInitialized, setGeminiInitialized] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Backup Settings States
  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [backupDays, setBackupDays] = useState<string[]>([]);
  const [backupTimesPerDay, setBackupTimesPerDay] = useState(1);
  const [backupInitialized, setBackupInitialized] = useState(false);

  useEffect(() => {
    if (settings) {
      if (!smsInitialized && (settings.smsUsername !== undefined || settings.smsEnabled !== undefined)) {
        setSmsEnabled(!!settings.smsEnabled);
        setSmsUsername(settings.smsUsername || '');
        setSmsPassword(settings.smsPassword || '');
        setSmsBodyIdVerify(settings.smsBodyIdVerify !== undefined ? String(settings.smsBodyIdVerify) : '');
        setSmsBodyIdReset(settings.smsBodyIdReset !== undefined ? String(settings.smsBodyIdReset) : '');
        setSmsInitialized(true);
      }
      if (!geminiInitialized && (settings.geminiApiKey !== undefined || settings.geminiProxyMode !== undefined || settings.openRouterApiKey !== undefined)) {
        setGeminiApiKey(settings.geminiApiKey || '');
        setOpenRouterApiKey(settings.openRouterApiKey || settings.geminiApiKey || '');
        setOpenRouterModel(settings.openRouterModel || 'google/gemini-2.5-flash');
        setProxyType(settings.proxyType || 'none');
        setGeminiProxyMode(settings.geminiProxyMode || 'none');
        setGeminiProxyUrl(settings.geminiProxyUrl || '');
        setGeminiHttpProxy(settings.geminiHttpProxy || '');
        setGeminiInitialized(true);
      }
      if (!backupInitialized && (settings.backupEnabled !== undefined || settings.backupFrequency !== undefined)) {
        setBackupEnabled(!!settings.backupEnabled);
        setBackupFrequency(settings.backupFrequency || 'daily');
        setBackupDays(Array.isArray(settings.backupDays) ? settings.backupDays : []);
        setBackupTimesPerDay(settings.backupTimesPerDay !== undefined ? Number(settings.backupTimesPerDay) : 1);
        setBackupInitialized(true);
      }
    }
  }, [settings, smsInitialized, geminiInitialized, backupInitialized]);

  // SMS Test states
  const [testMobile, setTestMobile] = useState('');
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [smsTestSuccess, setSmsTestSuccess] = useState('');
  const [smsTestError, setSmsTestError] = useState('');

  // Gemini Test states
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestSuccess, setGeminiTestSuccess] = useState('');
  const [geminiTestError, setGeminiTestError] = useState('');
  const [geminiTestSampleResponse, setGeminiTestSampleResponse] = useState('');

  // Proxy Test states
  const [isTestingProxy, setIsTestingProxy] = useState(false);
  const [proxyTestSuccess, setProxyTestSuccess] = useState('');
  const [proxyTestError, setProxyTestError] = useState('');

  const [backups, setBackups] = useState<any[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState<string | null>(null);
  const [isDeletingBackup, setIsDeletingBackup] = useState<string | null>(null);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState<string | null>(null);
  const [isSavingBackupConfig, setIsSavingBackupConfig] = useState(false);

  const handleDownloadBackup = async (filename: string) => {
    try {
      setIsDownloadingBackup(filename);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch(`/api/admin/backups/${encodeURIComponent(filename)}/download`, {
        headers: {
          'Authorization': `Bearer ${tokenVal}`
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        alert(data.error || 'خطا در دانلود فایل بکاپ.');
      }
    } catch (err) {
      alert('خطا در برقراری ارتباط با سرور برای دانلود فایل.');
    } finally {
      setIsDownloadingBackup(null);
    }
  };

  const handleResetSingleMatchResult = async (matchId: string) => {
    if (window.confirm('آیا مایل به بازنشانی این مسابقه به وضعیت «برگزار نشده» هستید؟ تمام پیش‌بینی‌های قبلی کاربران پابرجا می‌مانند اما امتیاز و نتیجه برداشته می‌شود.')) {
      const succ = await onSetMatchResult(matchId, null, null);
      if (succ) {
        triggerAlert('نتایج این مسابقه با موفقیت بازنشانی شد و جدول رده‌بندی کاربران دوباره محاسبه گردید!');
        setScoreSetOpen(null);
      } else {
        triggerAlert('خطا در بازنشانی نتایج مسابقه.', true);
      }
    }
  };

  const fetchBackupsList = async () => {
    try {
      setIsLoadingBackups(true);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch('/api/admin/backups', {
        headers: {
          'Authorization': `Bearer ${tokenVal}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (err) {
      console.error('Failed to load database backups list:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleCreateInstantBackup = async () => {
    try {
      setIsCreatingBackup(true);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch('/api/admin/backups/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenVal}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('نسخه پشتیبان دستی با موفقیت ایجاد گردید.');
        fetchBackupsList();
      } else {
        setStatusErr(data.error || 'ایجاد نسخه پشتیبان با خطا مواجه شد.');
      }
    } catch (err) {
      setStatusErr('خطا در برقراری ارتباط با سرور جهت ساخت بکاپ فوری.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!window.confirm(`⚠️ بازگردانی کل پایگاه‌داده به بکاپ انتخابی (${filename}) انجام شود؟ تمام اطلاعات تغییر یافته فعلی حذف خواهند شد.`)) {
      return;
    }
    try {
      setIsRestoringBackup(filename);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenVal}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (res.ok) {
        alert('پایگاه‌داده با موفقیت بازگردانی شد. صفحه برای اعمال کامل تغییرات بارگذاری مجدد می‌شود.');
        window.location.reload();
      } else {
        alert(data.error || 'خطا در بازگردانی فایل بکاپ پایگاه داده.');
      }
    } catch (err) {
      alert('ارتباط با سرور جهت بازگردانی دیتابیس با شکست مواجه شد.');
    } finally {
      setIsRestoringBackup(null);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!window.confirm(`آیا از حذف برگشت‌ناپذیر فایل بکاپ (${filename}) اطمینان دارید؟`)) {
      return;
    }
    try {
      setIsDeletingBackup(filename);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch(`/api/admin/backups/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenVal}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('فایل بکاپ با موفقیت از سیستم حذف گردید.');
        fetchBackupsList();
      } else {
        setStatusErr(data.error || 'خطا در حذف این فایل بکاپ.');
      }
    } catch (err) {
      setStatusErr('برقراری ارتباط با سرور برای حذف فایل ناموفق بود.');
    } finally {
      setIsDeletingBackup(null);
    }
  };

  const handleSaveBackupConfig = async () => {
    try {
      setIsSavingBackupConfig(true);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenVal}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backupEnabled,
          backupFrequency,
          backupDays,
          backupTimesPerDay
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('پیکربندی زمان‌بندی بکاپ‌گیری خودکار با موفقیت بر روی سرور ثبت و اعمال شد.');
        if (onUpdateSettings) {
          onUpdateSettings({
            backupEnabled,
            backupFrequency,
            backupDays,
            backupTimesPerDay
          });
        }
      } else {
        setStatusErr(data.error || 'پیکربندی با خطا مواجه شد.');
      }
    } catch (err) {
      setStatusErr('عدم توانایی برقراری ارتباط برای پیکربندی زمان‌بندی بکاپ‌گیری.');
    } finally {
      setIsSavingBackupConfig(false);
    }
  };

  // Success / Error alerts
  const [statusMsg, setStatusMsg] = useState('');
  const [statusErr, setStatusErr] = useState('');
  const timeoutRef = React.useRef<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [dbStats, setDbStats] = useState<any | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const fetchDbStats = async () => {
    try {
      setIsLoadingStats(true);
      const tokenVal = localStorage.getItem('wc_token');
      if (!tokenVal) return;
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${tokenVal}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (e) {
      console.error('Failed to load database stats:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'engine') {
      fetchDbStats();
      fetchBackupsList();
    }
  }, [activeTab]);

  const getLocalDateTimeString = (isoString?: string) => {
    if (!isoString) return '2026-06-11T00:00';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '2026-06-11T00:00';
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const handleChangeSimulatedTime = (localValue: string) => {
    if (!localValue) return;
    const d = new Date(localValue);
    if (!isNaN(d.getTime())) {
      onUpdateSettings?.({ simulatedTime: d.toISOString(), isFastForwarding: false });
    }
  };

  const getShamsiComponents = (isoString?: string) => {
    const d = isoString ? new Date(isoString) : new Date('2026-06-11T00:00:00Z');
    const gy = d.getFullYear();
    const gm = d.getMonth() + 1;
    const gd = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    
    const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
    return { jy, jm, jd, hour, minute };
  };

  const handleShamsiTimeChange = (field: 'jy' | 'jm' | 'jd' | 'hour' | 'minute', val: number) => {
    const current = getShamsiComponents(settings?.simulatedTime);
    const updated = { ...current, [field]: val };
    
    // Safety check for day count in Shamsi
    let maxDays = 30;
    if (updated.jm >= 1 && updated.jm <= 6) maxDays = 31;
    else if (updated.jm === 12) {
      const isLeap = updated.jy % 33 === 1 || updated.jy % 33 === 5 || updated.jy % 33 === 9 || updated.jy % 33 === 13 || updated.jy % 33 === 17 || updated.jy % 33 === 22 || updated.jy % 33 === 26 || updated.jy % 33 === 30;
      maxDays = isLeap ? 30 : 29;
    }
    if (updated.jd > maxDays) {
      updated.jd = maxDays;
    }

    const [gy, gm, gd] = jalaliToGregorian(updated.jy, updated.jm, updated.jd);
    const d = new Date(gy, gm - 1, gd, updated.hour, updated.minute, 0);
    onUpdateSettings?.({ simulatedTime: d.toISOString(), isFastForwarding: false });
  };

  const handleResetTournament = async () => {
    const isConfirmed = window.confirm('⚠️ توجه بسیار مهم ⚠️\nآیا واقعاً می‌خواهید کل تورنمنت را ریست کنید؟\n\nاین عمل باعث می‌شود:\n۱. تمام گل‌ها و نتایج ثبت شده مسابقات پاک شوند (به حالت برنامه‌ریزی‌شده برگردند).\n۲. تمام پیش‌بینی‌ها و امتیاز کاربران صفر (۰) شوند.\n۳. زمان فرضی سیستم به تاریخ افتتاحیه (۲۱ خرداد) بازگردد.\n۴. حالت همگام‌ساز خودکار به کنترل دستی ادمین تغییر کند تا خودتان بازی‌ها را شبیه‌سازی یا مدیریت کنید.\n\nآیا مطمئن هستید؟');
    
    if (!isConfirmed) return;
    
    try {
      setIsRefreshing(true);
      const tokenVal = localStorage.getItem('wc_token');
      const res = await fetch('/api/admin/reset-tournament', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenVal}`
        }
      });
      if (res.ok) {
        triggerAlert('تورنمنت جام جهانی با موفقیت ریست شد! بازی‌ها به حالت آماده استفاده برگشتند.');
        fetchDbStats();
        if (onRecalculateScores) {
          await onRecalculateScores();
        }
      } else {
        triggerAlert('خطا در اجرای بازنشانی دیتابیس تورنمنت.', true);
      }
    } catch (e) {
      triggerAlert('ارتباط با سرور برای بازنشانی برقرار نشد.', true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadDatabase = async () => {
    if (!onDownloadDB) return;
    setIsDownloading(true);
    const succ = await onDownloadDB();
    setIsDownloading(false);
    if (succ) {
      triggerAlert('پایگاه داده کل با موفقیت دانلود شد!');
    } else {
      triggerAlert('خطا در بارگیری نسخه پشتیبان دیتابیس.', true);
    }
  };

  // Users forms states
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [uUsername, setUUsername] = useState('');
  const [uFullName, setUFullName] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<UserRole>(UserRole.USER);

  const [passResetOpen, setPassResetOpen] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // User edit states
  const [userEditOpenId, setUserEditOpenId] = useState<string | null>(null);
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Matches forms states
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [mHomeTeamId, setMHomeTeamId] = useState('t1');
  const [mAwayTeamId, setMAwayTeamId] = useState('t2');
  const [mStage, setMStage] = useState<MatchStage>(MatchStage.GROUP);
  const [mStadium, setMStadium] = useState('');
  const [mKickoff, setMKickoff] = useState('');

  const [scoreSetOpen, setScoreSetOpen] = useState<string | null>(null);
  const [sHomeScore, setSHomeScore] = useState<number>(0);
  const [sAwayScore, setSAwayScore] = useState<number>(0);

  const [manualTeamOpen, setManualTeamOpen] = useState<string | null>(null);
  const [mHomeTeamOverride, setMHomeTeamOverride] = useState<string>('');
  const [mAwayTeamOverride, setMAwayTeamOverride] = useState<string>('');

  const triggerAlert = (msg: string, isErr = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isErr) {
      setStatusErr(msg);
      setStatusMsg('');
    } else {
      setStatusMsg(msg);
      setStatusErr('');
    }
    timeoutRef.current = setTimeout(() => {
      setStatusMsg('');
      setStatusErr('');
    }, 4500);
  };

  const STAGE_TRANSLATIONS: Record<string, string> = {
    'Group Stage': 'مرحله گروهی',
    'Round of 32': 'یک‌شانزدهم نهایی',
    'Round of 16': 'یک‌هشتم نهایی',
    'Quarter Finals': 'یک‌چهارم نهایی',
    'Semi Finals': 'نیمه‌نهایی',
    'Third Place Playoff': 'رده‌بندی مقام سوم',
    'Final': 'فینال'
  };

  // User submissions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uUsername || !uFullName || !uPassword) {
      triggerAlert('لطفاً اطلاعات تمام فیلدهای مشخص شده کاربر را وارد کنید.', true);
      return;
    }
    const succ = await onAddUser({ username: uUsername, fullName: uFullName, password: uPassword, role: uRole });
    if (succ) {
      triggerAlert(`کاربر شرکت‌کننده "${uUsername}" با موفقیت ایجاد شد!`);
      setUserFormOpen(false);
      setUUsername('');
      setUFullName('');
      setUPassword('');
    } else {
      triggerAlert('خطا در ایجاد کاربر. بررسی کنید که نام کاربری از پیش وجود نداشته باشد.', true);
    }
  };

  const handleResetPasswordSubmit = async (userId: string) => {
    if (!newPassword.trim()) return;
    const succ = await onResetPassword(userId, newPassword);
    if (succ) {
      triggerAlert('گذرواژه جدید با موفقیت بروزرسانی شد!');
      setPassResetOpen(null);
      setNewPassword('');
    } else {
      triggerAlert('خطا در بروزرسانی گذرواژه کاربر.', true);
    }
  };

  const handleEditUserSubmit = async (userId: string) => {
    if (!editUserFullName.trim() || !editUserUsername.trim()) {
      triggerAlert('نام و نام خانوادگی و نام کاربری نمی‌توانند خالی باشند.', true);
      return;
    }
    setIsUpdatingUser(true);
    const succ = await onEditUser(userId, { fullName: editUserFullName.trim(), username: editUserUsername.trim() });
    setIsUpdatingUser(false);
    if (succ) {
      triggerAlert('اطلاعات کاربر با موفقیت ویرایش شد!');
      setUserEditOpenId(null);
    } else {
      triggerAlert('خطا در بروزرسانی اطلاعات کاربر. ممکن است نام کاربری تکراری باشد.', true);
    }
  };

  // Match submissions
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mHomeTeamId === mAwayTeamId) {
      triggerAlert('تیم میزبان و میهمان نمی‌توانند یکسان باشند.', true);
      return;
    }
    if (!mStadium || !mKickoff) {
      triggerAlert('لطفاً استادیوم محل برگزاری و زمان برگزاری بازی را مشخص کنید.', true);
      return;
    }
    const succ = await onAddMatch({
      homeTeamId: mHomeTeamId,
      awayTeamId: mAwayTeamId,
      stage: mStage,
      stadium: mStadium,
      kickoffTimeUtc: new Date(mKickoff).toISOString()
    });

    if (succ) {
      triggerAlert('مسابقه تورنمنت جدید با موفقیت ثبت گردید!');
      setMatchFormOpen(false);
      setMStadium('');
      setMKickoff('');
    } else {
      triggerAlert('خطا در ثبت اطلاعات مسابقه.', true);
    }
  };

  const handleSetResults = async (matchId: string) => {
    const succ = await onSetMatchResult(matchId, sHomeScore, sAwayScore);
    if (succ) {
      triggerAlert('نتیجه با موفقیت ثبت شد و جدول امتیاز کاربران مجدداً محاسبه گردید!');
      setScoreSetOpen(null);
    } else {
      triggerAlert('خطا در ثبت نتایج مسابقه.', true);
    }
  };

  const handleSaveManualTeams = async (matchId: string) => {
    if (!mHomeTeamOverride || !mAwayTeamOverride) {
      triggerAlert('لطفاً هر دو تیم میزبان و میهمان را انتخاب کنید.', true);
      return;
    }
    if (mHomeTeamOverride === mAwayTeamOverride) {
      triggerAlert('تیم‌های میزبان و میهمان نمی‌توانند یکسان باشند.', true);
      return;
    }
    const succ = await onEditMatch(matchId, {
      homeTeamId: mHomeTeamOverride,
      awayTeamId: mAwayTeamOverride
    });
    if (succ) {
      triggerAlert('تیم‌های این مسابقه با موفقیت به صورت دستی (آفلاین) بازنویسی شدند!');
      setManualTeamOpen(null);
    } else {
      triggerAlert('خطا در بروزرسانی تیم‌های مسابقه.', true);
    }
  };

  const handleRecalculateEngine = async () => {
    setIsRefreshing(true);
    const succ = await onRecalculateScores();
    setIsRefreshing(false);
    if (succ) {
      triggerAlert('موتور محاسباتی با موفقیت اجرا شد! جداول امتیازدهی کاملاً همگام هستند.');
    } else {
      triggerAlert('خطا در پردازش مجدد نتایج در هسته محاسباتی.', true);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-right font-sans" dir="rtl">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-amber-500 rounded-xl text-slate-950">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              سامانه کنترل مدیریت <span className="text-amber-400">پیش‌بینی فوتبال</span>
            </h2>
            <p className="text-xs text-slate-400">مدیریت شرکت‌ها، مسابقات، تنظیم نتایج نهایی و اجرای دقیق پردازش امتیازات.</p>
          </div>
        </div>

        {/* Global Notifications Banners */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Users className="h-4 w-4 inline ml-1.5" /> کاربران ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'matches' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="h-4 w-4 inline ml-1.5" /> مسابقات ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'engine' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Zap className="h-4 w-4 inline ml-1.5" /> تنظیمات پیشرفته
          </button>
        </div>
      </div>

      {/* Toast Notification Container (Floating Top-Right) */}
      <div className="fixed top-8 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-[90%] sm:w-85" dir="rtl">
        {statusMsg && (
          <div className="p-4 bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs font-bold shadow-2xl flex items-center justify-between gap-3 transition-all duration-300">
            <div className="flex items-center gap-2 text-right">
              <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{statusMsg}</span>
            </div>
            <button 
              onClick={() => setStatusMsg('')} 
              className="text-slate-400 hover:text-white p-1 rounded-lg text-base leading-none shrink-0 cursor-pointer"
              title="بستن"
            >
              ×
            </button>
          </div>
        )}

        {statusErr && (
          <div className="p-4 bg-slate-900/95 backdrop-blur-md border border-rose-500/40 text-rose-450 rounded-2xl text-xs font-bold shadow-2xl flex items-center justify-between gap-3 transition-all duration-300">
            <div className="flex items-center gap-2 text-right justify-start">
              <span className="text-rose-450 text-sm shrink-0">⚠️</span>
              <span className="leading-relaxed">{statusErr}</span>
            </div>
            <button 
              onClick={() => setStatusErr('')} 
              className="text-slate-400 hover:text-white p-1 rounded-lg text-lg leading-none shrink-0 cursor-pointer"
              title="بستن"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* -------------------- USERS MANAGEMENT TAB -------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg">مدیریت شرکت‌کنندگان</h3>
            <button
              onClick={() => setUserFormOpen(prev => !prev)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs tracking-wide rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> تعریف شرکت‌کننده جدید
            </button>
          </div>

          {/* User Registration Form Collapse */}
          {userFormOpen && (
            <form onSubmit={handleCreateUser} className="bg-slate-900/50 p-5 rounded-2xl border border-emerald-500/10 grid grid-cols-1 sm:grid-cols-4 gap-4" dir="rtl">
              <div className="sm:col-span-1">
                <label className="block text-xs text-slate-400 font-semibold pb-1.5">نام کاربری</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 09123456789"
                  value={uUsername}
                  onChange={e => setUUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-200"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs text-slate-400 font-semibold pb-1.5">نام و نام خانوادگی</label>
                <input
                  type="text"
                  required
                  placeholder="لیونل مسی"
                  value={uFullName}
                  onChange={e => setUFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-200"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs text-slate-400 font-semibold pb-1.5">گذرواژه اولیه</label>
                <input
                  type="password"
                  required
                  placeholder="********"
                  value={uPassword}
                  onChange={e => setUPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-sm text-slate-200"
                />
              </div>
              <div className="sm:col-span-1 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider rounded-lg transition-colors"
                >
                  ایجاد حساب کاربری شرکت‌کننده
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto bg-slate-900/10 border border-slate-800 rounded-2xl shadow-xl">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="px-5 py-3 text-right">شرکت‌کننده</th>
                  <th className="px-5 py-3 text-center">نقش</th>
                  <th className="px-5 py-3 text-center">کل امتیاز</th>
                  <th className="px-5 py-3 text-center">دقیق / درست</th>
                  <th className="px-5 py-3 text-center">وضعیت</th>
                  <th className="px-5 py-3 text-center">عملیات مدیریت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/30">
                    <td className="px-5 py-3 flex items-center gap-3 text-right">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-800 shrink-0 select-none">
                        <Avatar avatar={u.avatar} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-100 block">{u.fullName}</span>
                        <span className="text-slate-500 font-mono">@{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-sans ${u.role === UserRole.ADMIN ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' : 'bg-slate-800 text-slate-400'}`}>
                        {u.role === UserRole.ADMIN ? 'مدیر ارشد' : 'کاربر'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-bold font-mono text-emerald-400 text-sm">
                      {u.totalScore}
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-slate-400">
                      {u.exactPredictions} <span className="text-slate-600">/</span> {u.correctPredictions}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${u.isDisabled ? 'bg-red-500' : 'bg-emerald-500'}`} title={u.isDisabled ? 'مسدود شده' : 'فعال و معتبر'}></span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle Disable */}
                        <button
                          onClick={() => onDisableUser(u.id)}
                          className={`p-1.5 rounded-lg border hover:scale-105 transition-all ${
                            u.isDisabled 
                              ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' 
                              : 'border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/11'
                          }`}
                          title={u.isDisabled ? 'فعالسازی کاربر' : 'مسدودسازی موقت کاربر'}
                          disabled={u.role === UserRole.ADMIN}
                        >
                          {u.isDisabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </button>

                        {/* Password reset collapse controller */}
                        <button
                          onClick={() => {
                            setPassResetOpen(passResetOpen === u.id ? null : u.id);
                            setUserEditOpenId(null);
                          }}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 bg-slate-950/40 hover:text-white"
                          title="تنظیم گذرواژه جدید"
                        >
                          <Key className="h-4 w-4" />
                        </button>

                        {/* Edit User Details */}
                        <button
                          onClick={() => {
                            if (userEditOpenId === u.id) {
                              setUserEditOpenId(null);
                            } else {
                              setUserEditOpenId(u.id);
                              setEditUserFullName(u.fullName);
                              setEditUserUsername(u.username);
                              setPassResetOpen(null);
                            }
                          }}
                          className={`p-1.5 rounded-lg border border-slate-800 text-slate-400 bg-slate-950/40 hover:text-white transition-colors ${userEditOpenId === u.id ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/5' : ''}`}
                          title="ویرایش نام و نام کاربری"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => {
                            if (window.confirm(`آیا از حذف دائمی کاربر "${u.fullName}" برای همیشه اطمینان دارید؟ این عملیات به غیرقابل بازیافت است!`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300"
                          title="حذف دائمی کاربر از دیتابیس"
                          disabled={u.role === UserRole.ADMIN}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Reset input collapse */}
                      {passResetOpen === u.id && (
                        <div className="mt-2 flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850" dir="rtl">
                          <input
                            type="text"
                            placeholder="رمز جدید..."
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="bg-slate-900 border border-slate-800 p-1 rounded text-xs text-white placeholder-slate-600 focus:outline-none text-right font-sans"
                          />
                          <button
                            onClick={() => handleResetPasswordSubmit(u.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded font-bold text-[10px]"
                          >
                             ثبت
                          </button>
                        </div>
                      )}

                      {/* Edit User details collapse */}
                      {userEditOpenId === u.id && (
                        <div className="mt-2 flex flex-col gap-2 p-3 bg-slate-950/80 backdrop-blur-md rounded-xl border border-slate-800 text-right" dir="rtl">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">نام و نام خانوادگی:</label>
                            <input
                              type="text"
                              placeholder="نام و نام خانوادگی جدید..."
                              value={editUserFullName}
                              onChange={e => setEditUserFullName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-right font-sans"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">نام کاربری / شماره همراه:</label>
                            <input
                              type="text"
                              placeholder="نام کاربری جدید..."
                              value={editUserUsername}
                              onChange={e => setEditUserUsername(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-left font-sans"
                              dir="ltr"
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1 justify-end">
                            <button
                              onClick={() => setUserEditOpenId(null)}
                              className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded text-[10px]"
                            >
                              انصراف
                            </button>
                            <button
                              disabled={isUpdatingUser}
                              onClick={() => handleEditUserSubmit(u.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 rounded font-bold text-[10px]"
                            >
                              {isUpdatingUser ? 'در حال ثبت...' : 'ذخیره تغییرات'}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- FIXTURES MANAGEMENT TAB -------------------- */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-lg">لیست کل مسابقات تورنمنت</h3>
            <button
              onClick={() => setMatchFormOpen(prev => !prev)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs tracking-wide rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> تعریف مسابقه فوتبالی جدید
            </button>
          </div>

          {/* New Match Register Collapse */}
          {matchFormOpen && (
            <form onSubmit={handleCreateMatch} className="bg-slate-900/55 p-5 rounded-2xl border border-emerald-500/15 space-y-4" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">تیم میزبان (داخل خانه)</label>
                  <select
                    value={mHomeTeamId}
                    onChange={e => setMHomeTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs p-2 rounded-lg"
                  >
                    {teamsSeed.map(t => (
                      <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">تیم میهمان (خارج خانه)</label>
                  <select
                    value={mAwayTeamId}
                    onChange={e => setMAwayTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs p-2 rounded-lg"
                  >
                    {teamsSeed.map(t => (
                      <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">مرحله برگزاری</label>
                  <select
                    value={mStage}
                    onChange={e => setMStage(e.target.value as MatchStage)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs p-2 rounded-lg hover:cursor-pointer"
                  >
                    {Object.values(MatchStage).map(v => (
                      <option key={v} value={v}>{STAGE_TRANSLATIONS[v] || v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">استادیوم محل برگزاری</label>
                  <input
                    type="text"
                    required
                    placeholder="استادیوم آزادی"
                    value={mStadium}
                    onChange={e => setMStadium(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold pb-1.5">شروع مسابقه (به وقت محلی/UTC)</label>
                  <input
                    type="datetime-local"
                    required
                    value={mKickoff}
                    onChange={e => setMKickoff(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider rounded-xl transition-colors"
                >
                  تایید و ذخیره رسمی بازی در تقویم مسابقات
                </button>
              </div>
            </form>
          )}

          {/* Match listings list admin control rows */}
          <div className="space-y-3">
            {matches.map(m => {
              const homeFlag = getTeamFlag(m.homeTeamId);
              const homeName = getTeamName(m.homeTeamId);
              const awayFlag = getTeamFlag(m.awayTeamId);
              const awayName = getTeamName(m.awayTeamId);

              const kickoffTime = new Date(m.kickoffTimeUtc);

              return (
                <div key={m.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-sans text-emerald-400 uppercase tracking-widest block font-bold">{STAGE_TRANSLATIONS[m.stage] || m.stage}</span>
                    <span className="font-extrabold text-white text-base inline-flex items-center gap-2">
                      <FlagIcon teamIdOrCode={m.homeTeamId} className="h-4 w-6 rounded" />
                      <span>{homeName}</span>
                      <span className="text-slate-500 font-normal text-xs font-sans">در برابر</span>
                      <span>{awayName}</span>
                      <FlagIcon teamIdOrCode={m.awayTeamId} className="h-4 w-6 rounded" />
                    </span>
                    <span className="block text-xs text-slate-500 font-sans mt-1">آغاز مسابقه: {kickoffTime.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · محل برگزاری استادیوم: {m.stadium}</span>
                  </div>

                  {/* Right Score action details */}
                  <div className="flex items-center gap-3.5">
                    {m.status === MatchStatus.FINISHED ? (
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-500 font-sans">نتیجه نهایی ثبت شده</span>
                        <span className="font-black text-emerald-400 text-lg font-mono">{m.homeScore} : {m.awayScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-500 font-sans tracking-wide px-2 py-0.5 bg-amber-500/5 rounded border border-amber-500/10">برگزار نشده / آینده</span>
                    )}

                    {/* Action toggles */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      
                      {/* Open results edit log panel */}
                      <button
                        onClick={() => {
                          setScoreSetOpen(scoreSetOpen === m.id ? null : m.id);
                          setSHomeScore(m.homeScore || 0);
                          setSAwayScore(m.awayScore || 0);
                          setManualTeamOpen(null);
                        }}
                        className="px-3 py-1.5 bg-slate-950 text-slate-300 hover:text-white rounded-lg border border-slate-800 hover:border-emerald-500/30 text-xs font-bold font-sans transition-colors"
                      >
                        {m.status === MatchStatus.FINISHED ? 'ویرایش نتیجه نهایی' : 'ثبت نتیجه بازی'}
                      </button>

                      {/* Manual team assignment override button */}
                      <button
                        onClick={() => {
                          setManualTeamOpen(manualTeamOpen === m.id ? null : m.id);
                          setMHomeTeamOverride(m.homeTeamId.startsWith('TBD_') ? '' : m.homeTeamId);
                          setMAwayTeamOverride(m.awayTeamId.startsWith('TBD_') ? '' : m.awayTeamId);
                          setScoreSetOpen(null);
                        }}
                        className="px-3 py-1.5 bg-slate-950 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-800 hover:border-emerald-500/30 text-xs font-bold font-sans transition-colors"
                        title="تعریف دستی و آفلاین تیم‌های این دور مسابقه حذفی"
                      >
                        👥 تعریف دستی تیم‌ها
                      </button>

                      {/* Delete Match */}
                      <button
                        onClick={() => {
                          if (window.confirm('آیا مطمئن هستید که می‌خواهید مسابقه و کل پیش‌بینی‌های متصل به آن را حذف کنید؟ این فرآیند امتیازات تمام کاربران را بازنویسی می‌کند!')) {
                            onDeleteMatch(m.id);
                          }
                        }}
                        className="p-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20"
                        title="حذف دائمی بازی از دیتابیس"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>
                  </div>

                  {/* Record Match Scores collapsing panel */}
                  {scoreSetOpen === m.id && (
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 mt-2 md:mt-0" dir="rtl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{homeName}</span>
                        <input
                          type="number"
                          min="0"
                          value={sHomeScore}
                          onChange={e => setSHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-10 bg-slate-900 border border-slate-800 text-center font-black font-mono text-white rounded p-1 text-sm focus:outline-none"
                        />
                        <span className="text-slate-600 font-bold">:</span>
                        <input
                          type="number"
                          min="0"
                          value={sAwayScore}
                          onChange={e => setSAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-10 bg-slate-900 border border-slate-800 text-center font-black font-mono text-white rounded p-1 text-sm focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">{awayName}</span>
                      </div>
                      
                      <button
                        onClick={() => handleSetResults(m.id)}
                        className="w-full sm:w-auto px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-xs rounded"
                      >
                        ثبت و اعمال نهایی نتایج
                      </button>

                      <button
                        onClick={() => handleResetSingleMatchResult(m.id)}
                        type="button"
                        className="w-full sm:w-auto px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-red-400 hover:text-red-300 font-extrabold text-xs rounded border border-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-center gap-1 select-none"
                        title="پاک کردن نتایج ثبت شده و تبدیل مجدد به بازی برگزار نشده"
                      >
                        🔄 بازنشانی بازی
                      </button>
                    </div>
                  )}

                  {/* Manual Team Override collapsing panel */}
                  {manualTeamOpen === m.id && (
                    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 mt-2" dir="rtl">
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col gap-1 w-full sm:w-56 text-right">
                          <label className="text-[10px] text-slate-400 font-bold">تیم میزبان:</label>
                          <select
                            value={mHomeTeamOverride}
                            onChange={e => setMHomeTeamOverride(e.target.value)}
                            className="bg-slate-900 border border-slate-805 text-xs text-white rounded p-2 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- انتخاب تیم میزبان --</option>
                            {teamsSeed.map(t => (
                              <option key={t.id} value={t.id}>{t.logo} {t.name} ({t.groupName})</option>
                            ))}
                          </select>
                        </div>

                        <span className="text-slate-500 font-black text-xs sm:mt-5 self-center">در برابر</span>

                        <div className="flex flex-col gap-1 w-full sm:w-56 text-right">
                          <label className="text-[10px] text-slate-400 font-bold">تیم میهمان:</label>
                          <select
                            value={mAwayTeamOverride}
                            onChange={e => setMAwayTeamOverride(e.target.value)}
                            className="bg-slate-900 border border-slate-805 text-xs text-white rounded p-2 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- انتخاب تیم میهمان --</option>
                            {teamsSeed.map(t => (
                              <option key={t.id} value={t.id}>{t.logo} {t.name} ({t.groupName})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto mt-3 md:mt-0 select-none">
                        <button
                          type="button"
                          onClick={() => handleSaveManualTeams(m.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
                        >
                          ذخیره تغییرات دستی تیم‌ها
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualTeamOpen(null)}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs rounded-lg border border-slate-800 transition-all font-bold"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* -------------------- STATS / ENGINE TAB -------------------- */}
      {activeTab === 'engine' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="text-right space-y-2">
            <h3 className="font-extrabold text-white text-lg">بخش تنظیمات فنی و هسته محاسباتی</h3>
            <p className="text-slate-400 text-xs">
              پیکربندی کلیدی، باز یا بسته کردن مسدودیت ثبت نام کاربران عادی جدید و اجرای موتور پردازش امتیازها.
            </p>
          </div>

          {/* Database Stats Dashboard */}
          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-850 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="text-right">
                <h4 className="text-sm font-black text-amber-400">📊 اطلاعات پایگاه داده دیتابیس پروژه</h4>
                <p className="text-[11px] text-slate-400 mt-1">ساختار ذخیره‌سازی، تعداد رکوردها و اطلاعات همگام‌ساز</p>
              </div>
              <button
                onClick={fetchDbStats}
                type="button"
                className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-[10px] text-slate-400 active:scale-95 transition-all cursor-pointer"
              >
                🔄 بروزرسانی آمار
              </button>
            </div>

            {isLoadingStats ? (
              <div className="flex justify-center items-center py-6 text-xs text-slate-500 font-sans gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                <span>در حال پرس و جو از سرور...</span>
              </div>
            ) : dbStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-right">
                  <p className="text-[10px] text-slate-500 font-sans">نوع ذخیره‌ساز فعال</p>
                  <p className="text-xs font-black text-slate-205 mt-1 font-sans">{dbStats.dbEngine}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-right">
                  <p className="text-[10px] text-slate-500 font-sans">کاربران ثبت‌نام شده</p>
                  <p className="text-xs font-black text-emerald-400 mt-1 font-sans">{dbStats.totalUsers} کاربر</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-right">
                  <p className="text-[10px] text-slate-500 font-sans">پیش‌بینی‌های ثبت‌شده</p>
                  <p className="text-xs font-black text-emerald-400 mt-1 font-sans">{dbStats.totalPredictions} عدد</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-right">
                  <p className="text-[10px] text-slate-500 font-sans">مسابقات پایان یافته</p>
                  <p className="text-xs font-black text-amber-400 mt-1 font-sans">{dbStats.finishedMatches} از {dbStats.totalMatches}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-600">آماری یافت نشد</div>
            )}

            <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-right">
                <p className="font-extrabold text-red-400 text-xs">⚠️ بازنشانی مجدد (Reset) تورنمنت جهت تست شبیه‌سازی</p>
                <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                  با کلیک بر روی دکمه زیر کل امتیازها، پیش‌بینی‌ها و نتایج بازی‌ها ریست شده و کلیه بازی‌ها آماده شبیه‌سازی گام‌به‌گام و تست شما می‌شوند.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleResetTournament}
                className="px-5 py-2 w-full md:w-auto bg-red-600/20 text-red-400 hover:bg-red-650 hover:text-white font-extrabold text-xs tracking-wider rounded-xl transition-all border border-red-500/25 active:scale-95 cursor-pointer"
              >
                🔥 ریست و شروع مجدد تورنمنت
              </button>
            </div>
          </div>

          {/* Registration Lock Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
            <div className="space-y-1 text-right">
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-sans border ${
                registrationEnabled 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' 
                  : 'bg-red-950/40 text-red-500 border-red-500/10'
              }`}>
                {registrationEnabled ? '🟢 عضویت جدید آزاد است' : '🔴 عضویت جدید بسته است'}
              </span>
              <p className="font-extrabold text-slate-200 text-sm">ارائه دسترسی ثبت‌نام همگانی</p>
              <p className="text-slate-500 text-xs">
                {registrationEnabled 
                  ? 'هر کسی با مراجعه به صفحه تعریف حساب کاربر می‌تواند ثبت نام نماید.' 
                  : 'امکان ساخت کاربر عمومی جدید قفل شده است؛ فقط حساب‌های قدیمی قابل دسترسی می‌باشند.'}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (onToggleRegistration) {
                  onToggleRegistration(!registrationEnabled);
                }
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                registrationEnabled 
                  ? 'bg-red-650 hover:bg-red-500 text-white shadow-lg' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg'
              }`}
            >
              {registrationEnabled ? 'مسدودسازی عضویت عمومی 🔒' : 'آزادسازی عضویت عمومی 🔓'}
            </button>
          </div>

          {/* SMS Panel Settings (تنظیمات پنل پیامکی ملی پیامک) */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-black text-amber-400">📩 تنظیمات پنل پیامکی (ملی‌پیامک)</h4>
                <p className="text-[11px] text-slate-400 mt-1">اتصال به سامانه پیامک Melipayamak جهت ارسال کدهای ورود و فراموشی رمز عبور (OTP)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  smsEnabled 
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  {smsEnabled ? 'فعال' : 'غیرفعال (شبیه‌ساز)'}
                </span>
                <input
                  type="checkbox"
                  id="sms-enabled-toggle"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-bold">نام کاربری ملی پیامک:</label>
                <input
                  type="text"
                  placeholder="مثال: myusername"
                  value={smsUsername}
                  onChange={e => setSmsUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-left font-sans"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-bold">کلمه عبور ملی پیامک:</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={smsPassword}
                  onChange={e => setSmsPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-left font-sans"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-bold">شناسه الگو تأیید شماره (Verification BodyId):</label>
                <input
                  type="number"
                  placeholder="مثال: 124555"
                  value={smsBodyIdVerify}
                  onChange={e => setSmsBodyIdVerify(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-left font-sans"
                  dir="ltr"
                />
                <span className="text-[9px] text-slate-500 block leading-tight">الگویی با حداقل یک متغیر برای کد تأیید (مثلا: کد تایید شما: {`{0}`})</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 block font-bold">شناسه الگو بازیابی رمز عبور (Reset PW BodyId):</label>
                <input
                  type="number"
                  placeholder="مثال: 124556"
                  value={smsBodyIdReset}
                  onChange={e => setSmsBodyIdReset(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-left font-sans"
                  dir="ltr"
                />
                <span className="text-[9px] text-slate-500 block leading-tight">الگوی ارسال رمزعبور جدید یا کد ریست (مثلا: کد تایید ریست رمز: {`{0}`})</span>
              </div>
            </div>

            {/* Live SMS Tester */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 space-y-3 text-right">
              <div className="flex items-center justify-between border-b border-indigo-950/25 pb-2">
                <span className="text-xs font-black text-indigo-400">🔌 تست زنده و فوری ارسال پیامک</span>
                <span className="text-[10px] text-slate-500">یک شماره همراه وارد کنید تا پس از تست مستقیم اتصال شما بررسی شود</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 space-y-1 text-right w-full">
                  <label className="text-[10px] text-slate-400 block font-bold font-sans">شماره همراه مقصد برای دریافت پیامک تست:</label>
                  <input
                    type="text"
                    placeholder="مثال: 09123456789"
                    value={testMobile}
                    onChange={e => setTestMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-400 font-sans text-left"
                    dir="ltr"
                  />
                </div>
                
                <button
                  type="button"
                  disabled={isTestingSms || !testMobile.trim()}
                  onClick={async () => {
                    setSmsTestSuccess('');
                    setSmsTestError('');
                    setIsTestingSms(true);
                    try {
                      const token = localStorage.getItem('wc_token');
                      const res = await fetch('/api/admin/sms-test', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': token ? `Bearer ${token}` : ''
                        },
                        body: JSON.stringify({
                          testMobile: testMobile.trim(),
                          smsUsername: smsUsername.trim(),
                          smsPassword: smsPassword.trim(),
                          smsBodyIdVerify: smsBodyIdVerify ? Number(smsBodyIdVerify) : undefined
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setSmsTestError(data.error || 'خطا در ارسال پیامک تست.');
                      } else {
                        setSmsTestSuccess(data.message || 'پیامک با موفقیت ارسال شد!');
                      }
                    } catch (e) {
                      setSmsTestError('خطای ناشناخته در اتصال به سرور.');
                    } finally {
                      setIsTestingSms(false);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer font-sans"
                >
                  {isTestingSms ? 'در حال ارسال پیامک...' : '⚡ ارسال پیامک تست'}
                </button>
              </div>

              {smsTestSuccess && (
                <div className="p-2.5 bg-emerald-950/40 text-emerald-400 text-xs rounded-lg border border-emerald-500/10 text-right font-semibold leading-relaxed">
                  ✅ {smsTestSuccess}
                </div>
              )}

              {smsTestError && (
                <div className="p-2.5 bg-red-950/40 text-red-400 text-xs rounded-lg border border-red-500/10 text-right font-semibold leading-relaxed">
                  ❌ {smsTestError}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-950">
              <button
                type="button"
                onClick={async () => {
                  if (onUpdateSettings) {
                    const success = await onUpdateSettings({
                      smsEnabled,
                      smsUsername: smsUsername.trim(),
                      smsPassword: smsPassword.trim(),
                      smsBodyIdVerify: smsBodyIdVerify ? Number(smsBodyIdVerify) : undefined,
                      smsBodyIdReset: smsBodyIdReset ? Number(smsBodyIdReset) : undefined
                    });
                    if (success) {
                      triggerAlert('تنظیمات اتصال به پنل پیامکی با موفقیت به‌روزرسانی شد!');
                    } else {
                      triggerAlert('خطا در ذخیره‌سازی پیکربندی پنل پیامک.', true);
                    }
                  }
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                💾 ذخیره تنظیمات پنل پیامکی
              </button>
            </div>
          </div>

          {/* OpenRouter AI & Proxy Settings (تنظیمات وب‌سرویس هوش مصنوعی و پروکسی) */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4 text-right">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="text-sm font-black text-emerald-400">🤖 تنظیمات وب‌سرویس هوش مصنوعی (OpenRouter) & پروکسی</h4>
              <p className="text-[11px] text-slate-400 mt-1">پیکربندی کلید اتصالی OpenRouter و نوع کانکشن پروکسی جهت استخراج هوشمند و برخط بازیکنان واقعی، باشگاه‌ها و همگام‌ساز زنده رکوردهای فیفا</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] text-slate-400 block font-bold">کلید معتبر وب‌سرویس (OpenRouter API Key):</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-or-v1-..."
                    value={openRouterApiKey}
                    onChange={e => setOpenRouterApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 pl-14 pr-3 py-2 rounded-lg text-xs text-white placeholder-slate-700 focus:outline-none focus:border-emerald-400 text-left font-sans"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute left-1.5 top-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-350 rounded-md select-none cursor-pointer"
                  >
                    {showApiKey ? 'مخفی' : 'نمایش'}
                  </button>
                </div>
                <span className="text-[9px] text-slate-500 block leading-tight">شما می‌توانید کلید را در وبسایت رسمی (OpenRouter.ai) بسازید.</span>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[11px] text-slate-400 block font-bold">مدل پیام‌رسانی هوش مصنوعی (OpenRouter Model):</label>
                <input
                  type="text"
                  placeholder="google/gemini-2.5-flash"
                  value={openRouterModel}
                  onChange={e => setOpenRouterModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-650 focus:outline-none focus:border-emerald-400 text-left font-mono"
                  dir="ltr"
                />
                <span className="text-[9px] text-slate-500 block leading-tight">پیش‌فرض: google/gemini-2.5-flash</span>
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <label className="text-[11px] text-slate-400 block font-bold">نوع پروتکل ارتباطی پروکسی (Proxy Type):</label>
                <select
                  value={proxyType}
                  onChange={e => setProxyType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400 text-right font-sans"
                >
                  <option value="none">بدون پروکسی (اتصال مستقیم از کلاود)</option>
                  <option value="http">پروکسی تونلی HTTP Proxy</option>
                  <option value="socks">پروکسی SOCKS Proxy (SOCKS4 / SOCKS5)</option>
                  <option value="mix">پروکسی ترکیبی (Mixed Protocol / MIX)</option>
                </select>
                <span className="text-[9px] text-slate-500 block leading-tight">انتخاب بستر مناسب متغیر با پروتکل سرور واسط شما</span>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] text-slate-400 block font-bold">آدرس مستقیم سرور یا جزییات پروکسی 🔒:</label>
                <input
                  type="text"
                  placeholder="e.g. 127.0.0.1:1080 or username:password@ip:port"
                  value={geminiHttpProxy}
                  onChange={e => setGeminiHttpProxy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs text-emerald-400 placeholder-slate-650 focus:outline-none focus:border-emerald-400 text-left font-mono"
                  dir="ltr"
                />
                <span className="text-[9px] text-slate-500 block leading-normal text-right">آدرس لوکال یا راه دور پروکسی را در کادر فوق وارد نمایید. بر اساس نوع پروکسی بالا، پروتکل نهایی روی کانکشن اعمال خواهد شد.</span>
              </div>
            </div>

            {/* Live Proxy & OpenRouter Connection Tester */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Proxy Only Connection Test */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 space-y-3 text-right flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-sky-950/25 pb-2">
                    <span className="text-xs font-black text-sky-450">🔗 ۱. تست اتصال خود پروکسی</span>
                    <span className="text-[9px] text-slate-500 font-sans">بررسی مستقل سرور پروکسی</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed font-sans mt-2">جهت ارزیابی صحت آدرس پروکسی، سیگنال همگام‌ساز سرور مستقیماً تلاش می‌کند از این تونل عبور کرده و اتصال به بازه شبکه‌های گوگل کلود را بررسی کند.</p>
                </div>

                <div className="space-y-2 mt-2">
                  <button
                    type="button"
                    disabled={isTestingProxy || !geminiHttpProxy.trim()}
                    onClick={async () => {
                      setProxyTestSuccess('');
                      setProxyTestError('');
                      setIsTestingProxy(true);
                      try {
                        const token = localStorage.getItem('wc_token');
                        const res = await fetch('/api/admin/proxy-test', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                          },
                          body: JSON.stringify({
                            testHttpProxy: geminiHttpProxy.trim(),
                            testProxyType: proxyType
                          })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setProxyTestError(data.error || 'خطا در ارزیابی مستقل سلامت پروکسی از روی سرور.');
                        } else {
                          setProxyTestSuccess(data.message || 'تونل ارتباط پروکسی با موفقیت فعال و تایید شد!');
                        }
                      } catch (e) {
                        setProxyTestError('خطای سیستمی در آغاز گام پینگ پروکسی.');
                      } finally {
                        setIsTestingProxy(false);
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-750 disabled:opacity-50 disabled:hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-extrabold text-[11px] rounded-lg active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer font-sans"
                  >
                    {isTestingProxy ? 'در حال پینگ مستقل پروکسی...' : '🔌 تست کیفیت اتصال مستقل پروکسی'}
                  </button>

                  {proxyTestSuccess && (
                    <div className="p-2.5 bg-emerald-950/40 text-emerald-400 text-[10px] rounded border border-emerald-500/10 text-right leading-relaxed font-medium font-sans">
                      ✅ {proxyTestSuccess}
                    </div>
                  )}

                  {proxyTestError && (
                    <div className="p-2.5 bg-rose-950/40 text-rose-400 text-[10px] rounded border border-rose-500/10 text-right leading-relaxed font-semibold font-sans">
                      ❌ {proxyTestError}
                    </div>
                  )}
                </div>
              </div>

              {/* Box 2: OpenRouter Connection Test */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 space-y-3 text-right flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-emerald-950/25 pb-2">
                    <span className="text-xs font-black text-emerald-400">⚡ ۲. تست کلید ثبتی OpenRouter</span>
                    <span className="text-[9px] text-slate-500 font-sans">بررسی نهایی پورت رفت‌و‌برگشتی</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed font-sans mt-2">درخواست چت آزمایشی کوتاهی به هوش مصنوعی OpenRouter ارسال می‌کند تا تایید نهایی صحت کارکرد API Key را بدست آورید.</p>
                </div>

                <div className="space-y-2 mt-2">
                  <button
                    type="button"
                    disabled={isTestingGemini || !openRouterApiKey.trim()}
                    onClick={async () => {
                      setGeminiTestSuccess('');
                      setGeminiTestError('');
                      setGeminiTestSampleResponse('');
                      setIsTestingGemini(true);
                      try {
                        const token = localStorage.getItem('wc_token');
                        const res = await fetch('/api/admin/gemini-test', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token ? `Bearer ${token}` : ''
                          },
                          body: JSON.stringify({
                            testApiKey: openRouterApiKey.trim(),
                            testHttpProxy: geminiHttpProxy.trim(),
                            testProxyType: proxyType,
                            testModel: openRouterModel.trim()
                          })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setGeminiTestError(data.error || 'خطا در برقراری ارتباط نهایی هندشیک باز با OpenRouter.');
                        } else {
                          setGeminiTestSuccess(data.message || 'اتصال زنده مدل با موفقیت برقرار شد!');
                          setGeminiTestSampleResponse(data.responseSample || '');
                        }
                      } catch (e) {
                        setGeminiTestError('خطای ناخواسته در ارسال پینگ پایانی وب‌سرویس.');
                      } finally {
                        setIsTestingGemini(false);
                      }
                    }}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-lg active:scale-95 transition-all text-center whitespace-nowrap cursor-pointer font-sans"
                  >
                    {isTestingGemini ? 'در حال ارسال کوئری به OpenRouter...' : '⚡ اجرای تست مدل هوش مصنوعی (OpenRouter)'}
                  </button>
                  
                  {geminiTestSuccess && (
                    <div className="space-y-1.5 p-2.5 bg-emerald-950/40 text-emerald-400 text-[10px] rounded border border-emerald-500/10 text-right leading-relaxed font-medium">
                      <p className="font-bold">✅ {geminiTestSuccess}</p>
                      {geminiTestSampleResponse && (
                        <p className="text-[9px] text-emerald-300 font-mono bg-slate-950/60 p-1.5 rounded border border-emerald-950/50 block text-left" dir="ltr">
                          Response Sample: {geminiTestSampleResponse}
                        </p>
                      )}
                    </div>
                  )}

                  {geminiTestError && (
                    <div className="p-2.5 bg-rose-950/40 text-rose-450 text-[10px] rounded border border-rose-500/10 text-right font-semibold leading-relaxed">
                      ❌ {geminiTestError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-950">
              <button
                type="button"
                onClick={async () => {
                  if (onUpdateSettings) {
                    const success = await onUpdateSettings({
                      openRouterApiKey: openRouterApiKey.trim(),
                      openRouterModel: openRouterModel.trim(),
                      proxyType: proxyType,
                      geminiHttpProxy: geminiHttpProxy.trim()
                    });
                    if (success) {
                      triggerAlert('تنظیمات جدید وب‌سرویس هوش مصنوعی (OpenRouter) و پروکسی با موفقیت روی سرور ذخیره شد!');
                    } else {
                      triggerAlert('خطا در ذخیره‌سازی پیکربندی وب‌سرویس.', true);
                    }
                  }
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                💾 ذخیره تنظیمات OpenRouter
              </button>
            </div>
          </div>

          {/* AI Batch Squad Sync Engine */}
          <AdminSquadSync onNotify={triggerAlert} />

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
            <div className="space-y-1 text-right">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-950/40 text-amber-400 rounded-md font-sans border border-amber-500/10">موتور پردازشی فعال کلاود</span>
              <p className="font-extrabold text-slate-200 text-sm font-sans">محاسبه و همگام‌ساز امتیاز کـل کاربران</p>
              <p className="text-slate-500 text-xs text-right">اجرای محاسبات کامل امتیازدهی با تحلیل دوباره تک به تک پیش‌بینی‌های کل مسابقات جهت سنکرون‌سازی کل جداول رتبه‌ها.</p>
            </div>
            
            <button
              onClick={handleRecalculateEngine}
              disabled={isRefreshing}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-extrabold text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 font-sans"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'در حال بازنویسی جدول امتیازها...' : 'اجرای بازنگری مجدد امتیازها'}
            </button>
          </div>

          {/* FIFA Live Sync & Intelligent Simulation Engine */}
          <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 space-y-5 text-right">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 bg-emerald-950 text-emerald-400 rounded-md font-sans border border-emerald-500/15">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  بروزرسانی خودکار زنده فیفا (FIFA Live Sync)
                </span>
                <p className="font-extrabold text-slate-100 text-base">موتور همگام‌ساز زنده هوشمند مسابقات</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  سیستم به صورت خودکار بازی‌ها، نتایج، گل‌ها و صعود تیم‌ها را شبیه‌سازی و زنده همگام‌سازی می‌کند. شما نیازی به وارد کردن تک تک نتایج ندارید!
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ syncMode: 'simulation' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    (settings?.syncMode || 'simulation') === 'simulation'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-250'
                  }`}
                >
                  شبیه‌ساز هوشمند زنده فیفا ⚽
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ syncMode: 'online' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings?.syncMode === 'online'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-505/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-250'
                  }`}
                >
                  دریافت آنلاین نتایج واقعی 🌐
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings?.({ syncMode: 'manual' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings?.syncMode === 'manual'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-250'
                  }`}
                >
                  کنترل دستی ادمین 🛠️
                </button>
              </div>
            </div>

            {(settings?.syncMode || 'simulation') === 'simulation' && (
              <div className="space-y-4 pt-1">
                {/* Simulated Time Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  <div className="space-y-1 text-center sm:text-right w-full sm:w-auto">
                    <p className="text-[11px] text-slate-500">تقویم زمانی جاری تورنمنت (Virtual Tournament Time)</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-sm sm:text-lg font-black font-sans text-white tracking-wide">
                        {(displayTime || new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z')).toLocaleDateString('fa-IR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-700/30">
                        {(displayTime || new Date(settings?.simulatedTime || '2026-06-11T00:00:00Z')).toLocaleTimeString('fa-IR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                    <div className="flex gap-2 items-center flex-wrap justify-end">
                      {/* Speed multiplier picker select option */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 px-2 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold select-none shrink-0 border-l border-slate-800 pl-1.5">سرعت گذر زمان:</span>
                        <select
                          value={settings?.simSpeedFactor || 1}
                          onChange={(e) => onUpdateSettings?.({ simSpeedFactor: Number(e.target.value) })}
                          className="bg-transparent text-emerald-400 text-[10px] font-black focus:outline-none cursor-pointer outline-none"
                        >
                          <option value={1} className="bg-slate-950 text-slate-350">۱ برابر (ثانیه به ثانیه)</option>
                          <option value={60} className="bg-slate-950 text-slate-350">۶۰ برابر (۱ ثانیه = ۱ دقیقه)</option>
                          <option value={600} className="bg-slate-950 text-slate-350">۶۰۰ برابر (۱ ثانیه = ۱۰ دقیقه)</option>
                          <option value={3600} className="bg-slate-950 text-slate-350">۳۶۰۰ برابر (۱ ثانیه = ۱ ساعت)</option>
                          <option value={21600} className="bg-slate-950 text-slate-350">۲۱۶۰۰ برابر (۱ ثانیه = ۶ ساعت)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUpdateSettings?.({ isFastForwarding: !settings?.isFastForwarding })}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          settings?.isFastForwarding
                            ? 'bg-emerald-600 text-white font-black animate-pulse shadow-emerald-500/20 shadow-lg'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <span>{settings?.isFastForwarding ? '⏸️ توقف گذر زمان' : '⏩ فعالسازی جلوبر خودکار زمان'}</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 text-right font-sans block">
                      {settings?.isFastForwarding 
                        ? `شبیه‌ساز فعال است و زمان با سرعت ${
                            settings?.simSpeedFactor === 21600 ? '۶ ساعت در ثانیه' :
                            settings?.simSpeedFactor === 3600 ? '۱ ساعت در ثانیه' :
                            settings?.simSpeedFactor === 600 ? '۱۰ دقیقه در ثانیه' :
                            settings?.simSpeedFactor === 60 ? '۱ دقیقه در ثانیه' : 'ثانیه به ثانیه واقعی'
                          } به جلو می‌رود.` 
                        : 'زمان فرضی سیستم متغیر نیست. برای جلو بردن از کنترل دسترسی زیر یا پرش‌ها استفاده کنید.'}
                    </span>
                  </div>
                </div>

                {/* Custom Date & Time Picker input (Custom Shamsi) */}
                {(() => {
                  const shComponent = getShamsiComponents(settings?.simulatedTime);
                  return (
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4" dir="rtl">
                      <div className="space-y-1 text-right">
                        <p className="text-xs font-bold text-slate-200">تنظیم دستی تاریخ و ساعت فرضی شبیه‌ساز (شمسی) 📅</p>
                        <p className="text-[10px] text-slate-500">تاریخ و زمان فرضی مسابقات جام جهانی را بر اساس تقویم خورشیدی وارد کنید:</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 justify-start xl:justify-end">
                        {/* Day selector */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 text-center select-none font-bold">روز</span>
                          <select
                            value={shComponent.jd}
                            onChange={(e) => handleShamsiTimeChange('jd', Number(e.target.value))}
                            className="bg-slate-950 text-emerald-400 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-xs font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer font-mono"
                          >
                            {Array.from({ length: shComponent.jm <= 6 ? 31 : (shComponent.jm === 12 ? 29 : 30) }, (_, i) => i + 1).map(day => (
                              <option key={day} value={day} className="bg-slate-950 text-slate-350">{day}</option>
                            ))}
                          </select>
                        </div>

                        {/* Month selector */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 text-center select-none font-bold">ماه</span>
                          <select
                            value={shComponent.jm}
                            onChange={(e) => handleShamsiTimeChange('jm', Number(e.target.value))}
                            className="bg-slate-950 text-emerald-400 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                          >
                            {SHAMSI_MONTH_NAMES.map((name, idx) => (
                              <option key={idx + 1} value={idx + 1} className="bg-slate-950 text-slate-350">{name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Year selector */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 text-center select-none font-bold">سال</span>
                          <select
                            value={shComponent.jy}
                            onChange={(e) => handleShamsiTimeChange('jy', Number(e.target.value))}
                            className="bg-slate-950 text-emerald-400 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-xs font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer font-mono"
                          >
                            {[1405, 1406].map(year => (
                              <option key={year} value={year} className="bg-slate-950 text-slate-350">{year}</option>
                            ))}
                          </select>
                        </div>

                        <span className="text-slate-600 font-bold self-end mb-2 px-0.5">:</span>

                        {/* Hour selector */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 text-center select-none font-bold">ساعت</span>
                          <select
                            value={shComponent.hour}
                            onChange={(e) => handleShamsiTimeChange('hour', Number(e.target.value))}
                            className="bg-slate-950 text-emerald-400 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-xs font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer font-mono"
                          >
                            {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                              <option key={hour} value={hour} className="bg-slate-950 text-slate-350">{hour.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>

                        {/* Minute selector */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-slate-500 text-center select-none font-bold">دقیقه</span>
                          <select
                            value={shComponent.minute}
                            onChange={(e) => handleShamsiTimeChange('minute', Number(e.target.value))}
                            className="bg-slate-950 text-emerald-400 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-xs font-black focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer font-mono"
                          >
                            {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                              <option key={minute} value={minute} className="bg-slate-950 text-slate-350">{minute.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Quick Jumps */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-extrabold mb-2.5">پرش سریع به مراحل مختلف جام جهانی ۲۰۲۶:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-06-11T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">مرحله اول گروهی</span>
                      افتتاحیه (۲۱ خرداد) ⚽
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-06-20T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">مرحله دوم گروهی</span>
                      دور هیجانی (۳۰ خرداد) 🔥
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-06-26T23:59:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">پایان مرحله گروهی</span>
                      صعود طلایی (۵ تیر) 🥇
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-07-02T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-slate-500">آغاز بازی‌های حذفی</span>
                      یک شانزدهم (۱۲ تیر) 🏆
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ simulatedTime: '2026-07-20T12:00:00Z', isFastForwarding: false })}
                      className="p-2.5 bg-emerald-950/20 hover:bg-emerald-950/35 border border-emerald-500/10 rounded-lg text-[11px] font-bold text-emerald-400 transition-all text-center"
                    >
                      <span className="block mb-0.5 text-[9px] text-emerald-600">پایان فینال جام جهانی</span>
                      معرفی قهرمان (۲۹ تیر) 🥇
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ephemeral Warning and Auto-Restore Banner */}
          <div className="bg-amber-950/20 border border-amber-500/25 rounded-2xl p-5 space-y-3 text-right">
            <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
              ⚠️ راهنمای پیشگیری از حذف کاربران و دیتابیس هنگام ارتقا و جایگزینی فایل‌ها
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              از آنجایی که برنامه شما روی محیط‌های ابری موقت اجرا می‌شود، با هر بار آپلود کدهای جدید یا جایگزینی فایل‌ها، مخزن ریستارت شده و کل اطلاعات محلی شامل کاربران ثبت‌نامی و پیش‌بینی‌ها پاک می‌گردند. برای حل آسان این مشکل:
            </p>
            <div className="text-[11px] text-slate-400 leading-relaxed space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-900">
              <p>
                ۱. پیش از ارسال فایل‌های جدید، از انتهای همین بخش دکمه <span className="text-blue-400 font-bold">«دانلود فایل دیتابیس (JSON)»</span> را کلیک کنید تا فایل پشتیبان دیتابیس روی کامپیوترتان دانلود شود.
              </p>
              <p>
                ۲. <b className="text-emerald-400">قابلیت بازیابی خودکار سرور:</b> فایل دانلود شده را دقیقاً به نام <span className="text-white font-mono font-bold bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">database.json</span> نام‌گذاری کرده و آن را در پوشه اصلی کدهای پروژه خود (کنار فایل <code className="text-white bg-slate-900 px-1 py-0.5 border border-slate-800 rounded font-mono">package.json</code>) قرار دهید و سپس آپلود نهایی کدهایتان انجام شود.
              </p>
              <p>
                ۳. سرور در اولین اجرا وجود این فایل را تشخیص داده و کل کاربران، رمزهای عبور و پیش‌بینی‌های قبلی شما را <b className="text-emerald-400 font-black">به صورت کاملاً اتوماتیک و در عرض ۱ ثانیه به دیتابیس زنده پیوند می‌دهد!</b>
              </p>
              <p>
                ۴. همچنین می‌توانید پس از آپلود، از ابزار دستی بخش زیر فایلی که بارگیری کرده‌اید را آپلود و یک لحظه‌ای بازگردانی نمایید.
              </p>
            </div>
          </div>

          {/* Automatic Backup Scheduler Settings Card */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-6 text-right">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="text-right space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-amber-950/40 text-amber-400 rounded-md font-sans border border-amber-500/10">هسته هوشمند شبیه‌ساز بکاپ</span>
                <h4 className="text-md font-extrabold text-slate-100 flex items-center gap-2">
                  <span>📅 زمان‌بندی و مدیریت فایل‌های پشتیبان پایگاه‌داده</span>
                </h4>
                <p className="text-slate-400 text-xs text-right">
                  زمان‌بندی تهیه نسخه پشتیبان مکانیزه (روزانه، هفتگی یا روزهای منتخب) با تکرار ۲ الی ۳ بار، بازگردانی و حذف فایل‌های ذخیره شده.
                </p>
              </div>
              
              <div className="mt-3 md:mt-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateInstantBackup}
                  disabled={isCreatingBackup}
                  className="px-4 py-2 bg-[#359ab6] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer select-none"
                >
                  <Zap className={`h-3.5 w-3.5 ${isCreatingBackup ? 'animate-pulse' : ''}`} />
                  <span>{isCreatingBackup ? 'در حال تهیه...' : 'ایجاد بکاپ فوری سرور ⚡'}</span>
                </button>
              </div>
            </div>

            {/* Config Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              {/* Left Column (Lg: 5): Backup Schedule Settings */}
              <div className="lg:col-span-5 space-y-4 bg-slate-900/65 p-4 rounded-xl border border-slate-850 text-right">
                <h5 className="text-xs font-black text-amber-400 border-b border-slate-800/60 pb-2">⚙️ تنظیمات اتوماسیون بکاپ خودکار</h5>
                
                {/* Switch to enable backup */}
                <div className="flex items-center justify-between bg-slate-950/45 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold">فعال‌سازی سیستم زمان‌بندی</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={backupEnabled}
                      onChange={(e) => setBackupEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#359ab6] peer-checked:after:bg-slate-950 peer-checked:after:border-slate-950"></div>
                  </label>
                </div>

                {/* Backup Frequency */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block pb-1">دوره‌های پشتیبان‌گیری</label>
                  <select
                    value={backupFrequency}
                    onChange={(e: any) => setBackupFrequency(e.target.value)}
                    disabled={!backupEnabled}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-slate-205 focus:border-amber-400 focus:outline-none disabled:opacity-40"
                  >
                    <option value="daily">روزانه (Daily)</option>
                    <option value="weekly">هفتگی (Weekly)</option>
                    <option value="custom">روزهای سفارشی هفته (Custom Days)</option>
                  </select>
                </div>

                {/* Custom Days selection (Only shown if Custom Days) */}
                {backupFrequency === 'custom' && (
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/80 space-y-2.5">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">روزهایی که مایل به بکاپ در آن‌ها هستید را مشخص نمایید:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { en: 'Saturday', fa: 'شنبه' },
                        { en: 'Sunday', fa: 'یکشنبه' },
                        { en: 'Monday', fa: 'دوشنبه' },
                        { en: 'Tuesday', fa: 'سه‌شنبه' },
                        { en: 'Wednesday', fa: 'چهارشنبه' },
                        { en: 'Thursday', fa: 'پنج‌شنبه' },
                        { en: 'Friday', fa: 'جمعه' }
                      ].map((day) => {
                        const isChecked = backupDays.includes(day.en) || backupDays.includes(day.fa);
                        return (
                          <label key={day.en} className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer text-slate-300 select-none hover:text-white">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!backupEnabled}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setBackupDays([...backupDays, day.en]);
                                } else {
                                  setBackupDays(backupDays.filter(d => d !== day.en && d !== day.fa));
                                }
                              }}
                              className="accent-amber-400 rounded"
                            />
                            <span>{day.fa}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Times Per Day Frequency Selector (e.g. 2 times or 3 times) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block pb-1 font-sans">تعداد دفعات بکاپ‌گیری در دوره مشخص شده</label>
                  <select
                    value={backupTimesPerDay}
                    onChange={(e) => setBackupTimesPerDay(Number(e.target.value))}
                    disabled={!backupEnabled}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-slate-205 focus:border-amber-400 focus:outline-none disabled:opacity-40"
                  >
                    <option value={1}>۱ بار در دوره (هر ۲۴ ساعت / هفته)</option>
                    <option value={2}>۲ بار در دوره (هر ۱۲ ساعت / هفته)</option>
                    <option value={3}>۳ بار در دوره (هر ۸ ساعت / هفته)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-relaxed pt-0.5">
                    💡 سیستم با تقسیم بازه دوره به تعداد دفعات مشخص شده، به طور خودکار فواصل بکاپ‌گیری را شبیه‌ساز کرده و اجرا می‌نماید.
                  </p>
                </div>

                {/* Save button */}
                <button
                  type="button"
                  onClick={handleSaveBackupConfig}
                  disabled={isSavingBackupConfig}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 select-none mt-3"
                >
                  {isSavingBackupConfig ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Check className="h-4 w-4 text-white font-black" />
                  )}
                  <span>ثبت و ذخیره پیکربندی زمان‌بندی</span>
                </button>
              </div>

              {/* Right Column (Lg: 7): Existing snapshots listing */}
              <div className="lg:col-span-7 space-y-4 text-right flex flex-col">
                <h5 className="text-xs font-black text-[#359ab6] border-b border-slate-800/60 pb-2 flex items-center justify-between">
                  <span>📋 نسخه‌های پشتیبان دیتابیس روی سرور</span>
                  <span className="text-[10px] text-slate-500 font-sans">{backups.length} فایل ثبت شده</span>
                </h5>

                {isLoadingBackups ? (
                  <div className="flex-1 flex flex-col justify-center items-center py-12 text-slate-500 text-xs gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-[#359ab6]" />
                    <span>در حال بارگذاری لیست بکاپ‌ها...</span>
                  </div>
                ) : backups.length === 0 ? (
                  <div className="flex-1 border-2 border-dashed border-slate-800/80 rounded-xl p-8 flex flex-col justify-center items-center text-center space-y-2">
                    <span className="text-4xl">🗂️</span>
                    <p className="text-xs text-slate-400 font-extrabold">هیچ فایل پشتیبان منسجمی روی سرور یافت نشد.</p>
                    <p className="text-[10px] text-slate-500 max-w-sm">
                      برای شروع، می‌توانید با کلیک بر روی دکمه <span className="text-emerald-400 font-bold">ایجاد بکاپ فوری</span> در بالا، اولین نقطه بازگردانی مستقل خود را ذخیره نمایید.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 bg-slate-950/45 rounded-xl border border-slate-800/60 overflow-hidden max-h-[340px] overflow-y-auto">
                    <div className="divide-y divide-slate-850/60 font-sans">
                      {backups.map((bak) => {
                        const sizeKb = (bak.size / 1024).toFixed(1);
                        const cleanDate = new Date(bak.createdAt).toLocaleString('fa-IR');
                        return (
                          <div key={bak.filename} className="p-3 hover:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-slate-200 select-all truncate max-w-[280px] text-left font-mono shrink-0" dir="ltr">
                                📄 {bak.filename}
                              </p>
                              <p className="text-[9.5px] text-slate-400 font-medium">
                                ایجاد شده در: <span className="font-bold text-slate-300">{cleanDate}</span> | حجم: <span className="font-bold text-amber-500">{sizeKb} KB</span>
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap">
                              <button
                                type="button"
                                disabled={isRestoringBackup !== null || isDeletingBackup !== null || isDownloadingBackup !== null}
                                onClick={() => handleDownloadBackup(bak.filename)}
                                className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-blue-950/40 text-blue-400 border border-blue-500/25 hover:bg-blue-950/80 transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
                              >
                                {isDownloadingBackup === bak.filename ? (
                                  <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                                ) : (
                                  <Download className="h-3.5 w-3.5 text-blue-400 font-extrabold" />
                                )}
                                <span>دانلود</span>
                              </button>
                              
                              <button
                                type="button"
                                disabled={isRestoringBackup !== null || isDeletingBackup !== null || isDownloadingBackup !== null}
                                onClick={() => handleRestoreBackup(bak.filename)}
                                className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-950/80 transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
                              >
                                {isRestoringBackup === bak.filename ? (
                                  <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 text-emerald-400" />
                                )}
                                <span>بازگردانی</span>
                              </button>
                              <button
                                type="button"
                                disabled={isRestoringBackup !== null || isDeletingBackup !== null || isDownloadingBackup !== null}
                                onClick={() => handleDeleteBackup(bak.filename)}
                                className="p-1 px-1.5 text-[11px] font-black rounded-lg bg-red-950/30 text-red-400 border border-red-500/15 hover:bg-red-950/85 hover:border-red-500/35 transition-all cursor-pointer flex items-center gap-1 active:scale-95 select-none"
                              >
                                {isDeletingBackup === bak.filename ? (
                                  <RefreshCw className="h-3 w-3 animate-spin text-red-400" />
                                ) : (
                                  <Trash2 className="h-3 w-3 text-red-400" />
                                )}
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Database Backup Download Card */}
          {onDownloadDB && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
              <div className="space-y-1 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-blue-950/40 text-blue-400 rounded-md font-sans border border-blue-500/10">نسخه پشتیبان سیستم</span>
                <p className="font-extrabold text-slate-200 text-sm">بارگیری مستقیم فایل پشتیبان پایگاه داده (JSON)</p>
                <p className="text-slate-500 text-xs text-right">دانلود نسخه پشتیبان آنلاین کل پروژه شامل لیست کاربران، گذرواژه‌ها و پاسخ‌های ارسالی.</p>
              </div>
              
              <button
                onClick={handleDownloadDatabase}
                disabled={isDownloading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-extrabold text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 font-sans"
              >
                <Download className={`h-4.5 w-4.5 ${isDownloading ? 'animate-spin' : ''}`} />
                {isDownloading ? 'در حال بارگیری...' : 'دانلود فایل دیتابیس (JSON)'}
              </button>
            </div>
          )}

          {/* Database Backup Upload/Import Card */}
          {onUploadDB && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
              <div className="space-y-1 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-violet-950/40 text-violet-400 rounded-md font-sans border border-violet-500/10">بارگذاری کل دیتابیس</span>
                <p className="font-extrabold text-slate-200 text-sm">بارگذاری فایل بکاپ پایگاه داده (JSON)</p>
                <p className="text-slate-500 text-xs text-right">فایل دیتابیس پشتیبان را انتخاب کنید تا کل اطلاعات سایت با اطلاعات قبلی جایگزین و همگام‌ساز شوند.</p>
              </div>
              
              <div className="relative shrink-0">
                <input
                  type="file"
                  id="db-backup-file-input"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (window.confirm("هشدار جدی: آیا از جایگذاری کامل دیتابیس و پاک شدن اطلاعات فعلی مطمئن هستید؟")) {
                          await onUploadDB(parsed);
                        }
                      } catch (err) {
                        alert("خطا در خواندن فایل JSON. مطمئن شوید فایل دیتابیس معتبر است.");
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
                <label
                  htmlFor="db-backup-file-input"
                  className="cursor-pointer px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-slate-950 font-extrabold text-xs tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 font-sans hover:scale-[1.02] select-none"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>بارگذاری و بازگردانی دیتابیس (JSON)</span>
                </label>
              </div>
            </div>
          )}

          {/* Export Predictions Excel Card */}
          {onExportExcel && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 p-5 rounded-xl border border-slate-800 justify-between">
              <div className="space-y-1 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-emerald-950/40 text-emerald-400 rounded-md font-sans border border-emerald-500/10">گزارش‌های مسابقات</span>
                <p className="font-extrabold text-slate-200 text-sm">دانلود اکسل پیش‌بینی کل رخدادها</p>
                <p className="text-slate-500 text-xs text-right">یک خروجی تمیز با فرمت CSV شامل اطلاعات کامل پیش‌بینی‌ها، امتیازات کسب شده و پاسخ هر کاربر دریافت کنید.</p>
              </div>
              
              <button
                onClick={() => {
                  setIsExporting(true);
                  onExportExcel().finally(() => setIsExporting(false));
                }}
                disabled={isExporting}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-extrabold text-xs tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 font-sans select-none shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'در حال خروجی گرفتن...' : 'دانلود خروجی پیش‌بینی‌ها (CSV)'}</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
