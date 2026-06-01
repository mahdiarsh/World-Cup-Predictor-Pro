import { Team } from '../types';

export interface Player {
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  isStarting: boolean;
  gridPos: { x: number; y: number }; // Coordinates on a visual soccer field (0-100)
  rating?: number;
  club?: string;
  age?: number;
}

export interface TeamSquad {
  formation: string;
  coach: string;
  strikersCount: number;
  midfieldersCount: number;
  defendersCount: number;
  players: Player[];
  stats: {
    attack: number;
    midfield: number;
    defense: number;
    overall: number;
  };
}

// Fixed rosters for top famous teams to deliver extremely professional quality
const SQUADS_DB: Record<string, TeamSquad> = {
  't-irn': {
    formation: '4-4-2',
    coach: 'امیر قلعه‌نویی',
    strikersCount: 2,
    midfieldersCount: 4,
    defendersCount: 4,
    stats: { attack: 85, midfield: 81, defense: 78, overall: 81 },
    players: [
      { name: 'علیرضا بیرانوند', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'تراکتور', age: 33, rating: 82 },
      { name: 'شجاع خلیل‌زاده', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'تراکتور', age: 37, rating: 78 },
      { name: 'حسین کنعانی‌زادگان', number: 13, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'پرسپولیس', age: 32, rating: 79 },
      { name: 'میلاد محمدی', number: 5, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'پرسپولیس', age: 32, rating: 77 },
      { name: 'صالح حردانی', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'سپاهان', age: 27, rating: 76 },
      { name: 'سعید عزت‌اللهی', number: 6, position: 'MF', isStarting: true, gridPos: { x: 38, y: 48 }, club: 'شباب الاهلی', age: 29, rating: 81 },
      { name: 'سامان قدوس', number: 14, position: 'MF', isStarting: true, gridPos: { x: 62, y: 48 }, club: 'کلباء', age: 32, rating: 82 },
      { name: 'علیرضا جهانبخش', number: 7, position: 'MF', isStarting: true, gridPos: { x: 80, y: 66 }, club: 'هیرنفین', age: 32, rating: 80 },
      { name: 'مهدی قایدی', number: 10, position: 'MF', isStarting: true, gridPos: { x: 20, y: 66 }, club: 'اتحاد کلباء', age: 27, rating: 83 },
      { name: 'مهدی طارمی', number: 9, position: 'FW', isStarting: true, gridPos: { x: 38, y: 83 }, club: 'اینتر میلان', age: 33, rating: 86 },
      { name: 'علی علیپور', number: 70, position: 'FW', isStarting: true, gridPos: { x: 62, y: 83 }, club: 'پرسپولیس', age: 30, rating: 75 },
      // Reserves
      { name: 'پیام نیازمند', number: 22, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'سپاهان', age: 31, rating: 75 },
      { name: 'سید حسین حسینی', number: 33, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'استقلال', age: 33, rating: 76 },
      { name: 'محمد خلیفه', number: 12, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'آلومینیوم اراک', age: 21, rating: 68 },
      { name: 'دانیال ایری', number: 3, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'ذوب آهن', age: 22, rating: 70 },
      { name: 'احسان حاج‌صفی', number: 11, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'آاک آتن', age: 36, rating: 78 },
      { name: 'علی نعمتی', number: 15, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'فولاد', age: 30, rating: 74 },
      { name: 'امید نورافکن', number: 21, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'ملوان', age: 29, rating: 77 },
      { name: 'رامین رضاییان', number: 23, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'استقلال', age: 36, rating: 77 },
      { name: 'روزبه چشمی', number: 15, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'استقلال', age: 32, rating: 77 },
      { name: 'محمد قربانی', number: 16, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'اورنبورگ', age: 25, rating: 74 },
      { name: 'محمد محبی', number: 8, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'روستوف', age: 27, rating: 80 },
      { name: 'امیرمحمد رزاقی‌نیا', number: 26, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'سپاهان', age: 20, rating: 66 },
      { name: 'مهدی ترابی', number: 17, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'تراکتور', age: 31, rating: 78 },
      { name: 'آریا یوسفی', number: 18, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'سپاهان', age: 24, rating: 75 },
      { name: 'دنیس درگاهی', number: 24, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لاونور', age: 20, rating: 68 },
      { name: 'هادی حبیبی‌نژاد', number: 25, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'چادرملو', age: 28, rating: 70 },
      { name: 'امیرحسین حسین‌زاده', number: 20, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'تراکتور', age: 25, rating: 76 },
      { name: 'امیرحسین محمودی', number: 27, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیگ ممتاز', age: 21, rating: 66 },
      { name: 'کسری طاهری', number: 28, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'روبین کازان', age: 19, rating: 69 }
    ]
  },
  't-bra': {
    formation: '4-3-3',
    coach: 'دوریوال جونیور',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 93, midfield: 90, defense: 88, overall: 91 },
    players: [
      { name: 'آلیسون بکر', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'لیورپول', age: 33, rating: 89 },
      { name: 'مارکینیوش', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'پاری سن ژرمن', age: 32, rating: 87 },
      { name: 'ادر میلیتائو', number: 3, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'رئال مادرید', age: 28, rating: 86 },
      { name: 'دانیلو', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'یوونتوس', age: 34, rating: 81 },
      { name: 'گیلرمه آرانا', number: 6, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'اتلتیکو مینیرو', age: 29, rating: 80 },
      { name: 'برونو گیمارش', number: 5, position: 'MF', isStarting: true, gridPos: { x: 35, y: 48 }, club: 'نیوکسل', age: 28, rating: 87 },
      { name: 'لوکاس پاکتا', number: 8, position: 'MF', isStarting: true, gridPos: { x: 65, y: 48 }, club: 'وستهام', age: 28, rating: 84 },
      { name: 'نیمار جونیور', number: 10, position: 'FW', isStarting: true, gridPos: { x: 50, y: 62 }, club: 'الهلال', age: 34, rating: 89 },
      { name: 'رافینیا', number: 11, position: 'FW', isStarting: true, gridPos: { x: 80, y: 78 }, club: 'بارسلونا', age: 29, rating: 87 },
      { name: 'وینیسیوس جونیور', number: 7, position: 'FW', isStarting: true, gridPos: { x: 20, y: 78 }, club: 'رئال مادرید', age: 25, rating: 91 },
      { name: 'رودریگو گویس', number: 9, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'رئال مادرید', age: 25, rating: 88 },
      // Reserves
      { name: 'ادرسون مورائس', number: 23, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'منچستر سیتی', age: 32, rating: 88 },
      { name: 'اندریك', number: 16, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'رئال مادرید', age: 19, rating: 82 },
      { name: 'گابریل ماگالائش', number: 14, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'آرسنال', age: 28, rating: 85 },
      { name: 'ساویو', number: 20, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'منچستر سیتی', age: 22, rating: 81 },
      { name: 'آندریاس پریرا', number: 19, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'فولام', age: 30, rating: 80 }
    ]
  },
  't-arg': {
    formation: '4-3-3',
    coach: 'لیونل اسکالونی',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 94, midfield: 91, defense: 89, overall: 92 },
    players: [
      { name: 'امیلیانو مارتینز', number: 23, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'استون ویلا', age: 33, rating: 89 },
      { name: 'کریستین رومرو', number: 13, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'تاتنهام', age: 28, rating: 88 },
      { name: 'نیکلاس اوتامندی', number: 19, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'بنفیکا', age: 38, rating: 82 },
      { name: 'ناهوئل مولینا', number: 26, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'اتلتیکو مادرید', age: 28, rating: 82 },
      { name: 'نیکلاس تاگلیافیکو', number: 3, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'لیون', age: 33, rating: 81 },
      { name: 'رودریگو د پل', number: 7, position: 'MF', isStarting: true, gridPos: { x: 70, y: 52 }, club: 'اتلتیکو مادرید', age: 32, rating: 85 },
      { name: 'انزو فرناندز', number: 24, position: 'MF', isStarting: true, gridPos: { x: 50, y: 44 }, club: 'چلسی', age: 25, rating: 85 },
      { name: 'الکسیس مک‌آلیستر', number: 20, position: 'MF', isStarting: true, gridPos: { x: 30, y: 52 }, club: 'لیورپول', age: 27, rating: 87 },
      { name: 'لیونل مسی', number: 10, position: 'FW', isStarting: true, gridPos: { x: 78, y: 76 }, club: 'اینتر میامی', age: 38, rating: 92 },
      { name: 'خولیان آلوارز', number: 9, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'اتلتیکو مادرید', age: 26, rating: 86 },
      { name: 'نیکولاس گونزالز', number: 15, position: 'FW', isStarting: true, gridPos: { x: 22, y: 76 }, club: 'یوونتوس', age: 28, rating: 81 },
      // Reserves
      { name: 'خرونیمو رولی', number: 1, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'مارسی', age: 34, rating: 81 },
      { name: 'لائوتارو مارتینز', number: 22, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'اینتر میلان', age: 28, rating: 89 },
      { name: 'لیاندرو پاردس', number: 5, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'رم', age: 31, rating: 82 },
      { name: 'لیساندرو مارتینز', number: 25, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'منچستر یونایتد', age: 28, rating: 85 },
      { name: 'جیووانی لو سلسو', number: 11, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'رئال بتیس', age: 30, rating: 82 }
    ]
  },
  't-por': {
    formation: '4-3-3',
    coach: 'روبرتو مارتینز',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 91, midfield: 90, defense: 87, overall: 89 },
    players: [
      { name: 'دیوگو کاستا', number: 22, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'پورتو', age: 26, rating: 86 },
      { name: 'روبن دیاز', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'منچستر سیتی', age: 29, rating: 89 },
      { name: 'آنتونیو سیلوا', number: 3, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'بنفیکا', age: 22, rating: 81 },
      { name: 'ژوآو کانسلو', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'الهلال', age: 32, rating: 84 },
      { name: 'نونو مندز', number: 19, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'پاری سن ژرمن', age: 23, rating: 83 },
      { name: 'ژوآو پالینیا', number: 6, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'بایرن مونیخ', age: 30, rating: 85 },
      { name: 'برونو فرناندز', number: 8, position: 'MF', isStarting: true, gridPos: { x: 70, y: 56 }, club: 'منچستر یونایتد', age: 31, rating: 88 },
      { name: 'ویتینیا', number: 23, position: 'MF', isStarting: true, gridPos: { x: 30, y: 56 }, club: 'پاری سن ژرمن', age: 26, rating: 85 },
      { name: 'برناردو سیلوا', number: 10, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'منچستر سیتی', age: 31, rating: 88 },
      { name: 'کریستیانو رونالدو', number: 7, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'النصر', age: 41, rating: 88 },
      { name: 'رافائل لیائو', number: 17, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'آث میلان', age: 26, rating: 87 },
      // Reserves
      { name: 'خوزه سا', number: 1, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'ولورهمپتون', age: 33, rating: 80 },
      { name: 'ژوآو فلیکس', number: 11, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'چلسی', age: 26, rating: 81 },
      { name: 'دیوگو ژوتا', number: 21, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیورپول', age: 29, rating: 84 },
      { name: 'پدرو نتو', number: 25, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'چلسی', age: 26, rating: 80 },
      { name: 'پپینیو', number: 15, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'براگا', age: 24, rating: 78 }
    ]
  },
  't-fra': {
    formation: '4-3-3',
    coach: 'دیدیه دشان',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 93, midfield: 89, defense: 91, overall: 91 },
    players: [
      { name: 'مایک مانیان', number: 16, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'آث میلان', age: 30, rating: 87 },
      { name: 'ویلیام سالیبا', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'آرسنال', age: 25, rating: 89 },
      { name: 'دایوت اوپامکانو', number: 15, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'بایرن مونیخ', age: 27, rating: 84 },
      { name: 'ژول کنده', number: 5, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'بارسلونا', age: 27, rating: 85 },
      { name: 'تئو هرناندز', number: 22, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'آث میلان', age: 28, rating: 87 },
      { name: 'اورلین چوآمنی', number: 8, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'رئال مادرید', age: 26, rating: 85 },
      { name: 'انگولو کانته', number: 13, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'الاتحاد', age: 35, rating: 84 },
      { name: 'آدرین رابیو', number: 14, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'مارسی', age: 31, rating: 83 },
      { name: 'عثمان دمبله', number: 11, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'پاری سن ژرمن', age: 29, rating: 86 },
      { name: 'کیلیان امباپه', number: 10, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'رئال مادرید', age: 27, rating: 92 },
      { name: 'بردلی بارکولا', number: 20, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'پاری سن ژرمن', age: 23, rating: 83 },
      // Reserves
      { name: 'بریس سامبا', number: 1, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لنز', age: 32, rating: 81 },
      { name: 'آنتوان گریزمان', number: 7, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'اتلتیکو مادرید', age: 35, rating: 87 },
      { name: 'مارکوس تورام', number: 15, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'اینتر میلان', age: 28, rating: 84 },
      { name: 'رندال کولو موآنی', number: 12, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'پاری سن ژرمن', age: 27, rating: 81 },
      { name: 'ابراهیما کوناته', number: 24, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیورپول', age: 27, rating: 84 }
    ]
  },
  't-ger': {
    formation: '4-2-3-1',
    coach: 'یولیان ناگلزمان',
    strikersCount: 1,
    midfieldersCount: 5,
    defendersCount: 4,
    stats: { attack: 89, midfield: 92, defense: 87, overall: 89 },
    players: [
      { name: 'مارک آندره ترشتگن', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'بارسلونا', age: 34, rating: 87 },
      { name: 'آنتونیو رودیگر', number: 2, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'رئال مادرید', age: 33, rating: 88 },
      { name: 'جاناتان تا', number: 4, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'بایر لورکوزن', age: 30, rating: 84 },
      { name: 'یاشوا کیمیش', number: 6, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'بایرن مونیخ', age: 31, rating: 86 },
      { name: 'ماکسیمیلیان میتلشتات', number: 18, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'اشتوتگارت', age: 29, rating: 80 },
      { name: 'روبرت آندریش', number: 23, position: 'MF', isStarting: true, gridPos: { x: 35, y: 48 }, club: 'بایر لورکوزن', age: 31, rating: 82 },
      { name: 'پاسکال گروس', number: 5, position: 'MF', isStarting: true, gridPos: { x: 65, y: 48 }, club: 'بوروسیا دورتموند', age: 34, rating: 83 },
      { name: 'فلوریان ویرتز', number: 17, position: 'MF', isStarting: true, gridPos: { x: 50, y: 62 }, club: 'بایر لورکوزن', age: 23, rating: 89 },
      { name: 'جمال موسیالا', number: 10, position: 'MF', isStarting: true, gridPos: { x: 20, y: 65 }, club: 'بایرن مونیخ', age: 23, rating: 89 },
      { name: 'لروی سانه', number: 19, position: 'MF', isStarting: true, gridPos: { x: 80, y: 65 }, club: 'بایرن مونیخ', age: 30, rating: 84 },
      { name: 'کای هاورتز', number: 7, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'آرسنال', age: 26, rating: 84 },
      // Reserves
      { name: 'الیور بائومان', number: 12, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'هوفنهایم', age: 35, rating: 80 },
      { name: 'نیکلاس فولکروگ', number: 9, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'وستهام', age: 33, rating: 82 },
      { name: 'دیوید رائوم', number: 3, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لایپزیش', age: 28, rating: 81 },
      { name: 'نیکو شلوتربک', number: 15, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'بوروسیا دورتموند', age: 26, rating: 83 },
      { name: 'امره جان', number: 25, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'بوروسیا دورتموند', age: 32, rating: 80 }
    ]
  },
  't-esp': {
    formation: '4-3-3',
    coach: 'لوئیس د د لافوئنته',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 91, midfield: 93, defense: 88, overall: 91 },
    players: [
      { name: 'اونای سیمون', number: 23, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'اتلتیک بیلبائو', age: 28, rating: 86 },
      { name: 'روبن لو نورماند', number: 3, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'اتلتیکو مادرید', age: 29, rating: 83 },
      { name: 'ایمریک لاپورت', number: 14, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'النصر', age: 32, rating: 84 },
      { name: 'دنی کارواخال', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'رئال مادرید', age: 34, rating: 87 },
      { name: 'مارک کوکوریا', number: 24, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'چلسی', age: 27, rating: 82 },
      { name: 'رودری هرناندز', number: 16, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'منچستر سیتی', age: 29, rating: 91 },
      { name: 'فابیان رویز', number: 8, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'پاری سن ژرمن', age: 30, rating: 85 },
      { name: 'پدری گونزالز', number: 20, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'بارسلونا', age: 23, rating: 86 },
      { name: 'لامین یامال', number: 19, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'بارسلونا', age: 18, rating: 88 },
      { name: 'نیکو ویلیامز', number: 17, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'اتلتیک بیلبائو', age: 23, rating: 86 },
      { name: 'آلوارو موراتا', number: 7, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'آث میلان', age: 33, rating: 83 },
      // Reserves
      { name: 'داوید رایا', number: 1, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'آرسنال', age: 30, rating: 84 },
      { name: 'دنی اولمو', number: 10, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'بارسلونا', age: 28, rating: 85 },
      { name: 'فران تورس', number: 11, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'بارسلونا', age: 26, rating: 80 },
      { name: 'میکل مرینو', number: 6, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'آرسنال', age: 29, rating: 83 },
      { name: 'پائو کوبارسی', number: 15, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'بارسلونا', age: 19, rating: 79 }
    ]
  },
  't-eng': {
    formation: '4-2-3-1',
    coach: 'توماس توخل',
    strikersCount: 1,
    midfieldersCount: 5,
    defendersCount: 4,
    stats: { attack: 92, midfield: 91, defense: 87, overall: 90 },
    players: [
      { name: 'جردن پیکفورد', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'اورتون', age: 32, rating: 84 },
      { name: 'جان استونز', number: 5, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'منچستر سیتی', age: 32, rating: 86 },
      { name: 'مارک گوهی', number: 6, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'کریستال پالاس', age: 25, rating: 83 },
      { name: 'کایل واکر', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'منچستر سیتی', age: 36, rating: 84 },
      { name: 'کی ران تریپیر', number: 12, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'نیوکسل', age: 35, rating: 81 },
      { name: 'دکلان رایس', number: 4, position: 'MF', isStarting: true, gridPos: { x: 35, y: 48 }, club: 'آرسنال', age: 27, rating: 87 },
      { name: 'کوبی ماینو', number: 26, position: 'MF', isStarting: true, gridPos: { x: 65, y: 48 }, club: 'منچستر یونایتد', age: 21, rating: 80 },
      { name: 'جود بلینگهام', number: 10, position: 'MF', isStarting: true, gridPos: { x: 50, y: 62 }, club: 'رئال مادرید', age: 22, rating: 90 },
      { name: 'بوکایو ساکا', number: 7, position: 'MF', isStarting: true, gridPos: { x: 80, y: 65 }, club: 'آرسنال', age: 24, rating: 88 },
      { name: 'فیل فودن', number: 11, position: 'MF', isStarting: true, gridPos: { x: 20, y: 65 }, club: 'منچستر سیتی', age: 26, rating: 89 },
      { name: 'هری کین', number: 9, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'بایرن مونیخ', age: 32, rating: 90 },
      // Reserves
      { name: 'آرون رمزدیل', number: 13, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'ساوتهمپتون', age: 28, rating: 80 },
      { name: 'کول پالمر', number: 24, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'چلسی', age: 24, rating: 87 },
      { name: 'اولی واتکینز', number: 19, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'استون ویلا', age: 30, rating: 82 },
      { name: 'ترنت الکساندر آرنولد', number: 8, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیورپول', age: 27, rating: 85 },
      { name: 'انزری کونساه', number: 14, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'استون ویلا', age: 28, rating: 80 }
    ]
  },
  't-ned': {
    formation: '4-3-3',
    coach: 'رونالد کومان',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 88, midfield: 87, defense: 90, overall: 88 },
    players: [
      { name: 'بارت فربروگن', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'برایتون', age: 23, rating: 82 },
      { name: 'ویرجیل فن دایک', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'لیورپول', age: 34, rating: 89 },
      { name: 'استفان د فرای', number: 6, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'اینترمیلان', age: 34, rating: 83 },
      { name: 'دنزل دومفریس', number: 22, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'اینترمیلان', age: 30, rating: 84 },
      { name: 'ناتان آکه', number: 5, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'منچستر سیتی', age: 31, rating: 84 },
      { name: 'یردی اسخوتن', number: 24, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'آیندهوون', age: 29, rating: 81 },
      { name: 'تیجانی رایندرز', number: 14, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'آث میلان', age: 27, rating: 84 },
      { name: 'ژاوی سیمونز', number: 7, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'لایپزیش', age: 23, rating: 86 },
      { name: 'دونیل مالن', number: 18, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'دورتمند', age: 27, rating: 82 },
      { name: 'کودی گاکپو', number: 11, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'لیورپول', age: 27, rating: 85 },
      { name: 'ممفیس دپای', number: 10, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'کورینتیانس', age: 32, rating: 82 }
    ]
  },
  't-ita': {
    formation: '3-5-2',
    coach: 'لوچیانو اسپالتی',
    strikersCount: 2,
    midfieldersCount: 5,
    defendersCount: 3,
    stats: { attack: 85, midfield: 88, defense: 87, overall: 86 },
    players: [
      { name: 'جانلوئیجی دوناروما', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'پاری سن ژرمن', age: 27, rating: 89 },
      { name: 'الساندرو باستونی', number: 23, position: 'DF', isStarting: true, gridPos: { x: 50, y: 26 }, club: 'اینتر میلان', age: 27, rating: 87 },
      { name: 'جانلوکا مانچینی', number: 17, position: 'DF', isStarting: true, gridPos: { x: 25, y: 30 }, club: 'رم', age: 30, rating: 83 },
      { name: 'الساندرو بوئونجیورنو', number: 4, position: 'DF', isStarting: true, gridPos: { x: 75, y: 30 }, club: 'ناپولی', age: 26, rating: 82 },
      { name: 'نیکولو بارلا', number: 18, position: 'MF', isStarting: true, gridPos: { x: 50, y: 46 }, club: 'اینتر میلان', age: 29, rating: 87 },
      { name: 'داویده فراتسی', number: 7, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'اینتر میلان', age: 26, rating: 83 },
      { name: 'فدریکو دیمارکو', number: 3, position: 'MF', isStarting: true, gridPos: { x: 15, y: 48 }, club: 'اینتر میلان', age: 28, rating: 84 },
      { name: 'آندریا کامبیاسو', number: 20, position: 'MF', isStarting: true, gridPos: { x: 85, y: 48 }, club: 'یوونتوس', age: 26, rating: 81 },
      { name: 'ساموئله ریچی', number: 6, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'تورینو', age: 24, rating: 80 },
      { name: 'متئو رتگی', number: 9, position: 'FW', isStarting: true, gridPos: { x: 40, y: 82 }, club: 'آتالانتا', age: 27, rating: 82 },
      { name: 'فدریکو کیه‌زا', number: 14, position: 'FW', isStarting: true, gridPos: { x: 60, y: 82 }, club: 'لیورپول', age: 28, rating: 84 }
    ]
  },
  't-bel': {
    formation: '4-3-3',
    coach: 'دومنیکو تدسکو',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 87, midfield: 88, defense: 83, overall: 86 },
    players: [
      { name: 'کوین کاستیلز', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'القادسیه', age: 33, rating: 83 },
      { name: 'ووت فائس', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'لستر سیتی', age: 28, rating: 80 },
      { name: 'آرتور تیاته', number: 3, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'فرانکفورت', age: 26, rating: 80 },
      { name: 'تیموتی کاستانی', number: 21, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'فولام', age: 30, rating: 80 },
      { name: 'ماکسیم د کایپر', number: 5, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'کلوب بروژ', age: 25, rating: 78 },
      { name: 'آمادو اونانا', number: 6, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'استون ویلا', age: 24, rating: 82 },
      { name: 'کوین دی بروینه', number: 7, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'منچستر سیتی', age: 34, rating: 90 },
      { name: 'یوری تیلمانس', number: 8, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'استون ویلا', age: 29, rating: 82 },
      { name: 'جرمی دوکو', number: 11, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'منچستر سیتی', age: 24, rating: 84 },
      { name: 'یوهان باکایوکو', number: 19, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'آیندهوون', age: 23, rating: 80 },
      { name: 'روملو لوکاکو', number: 10, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'ناپولی', age: 33, rating: 84 }
    ]
  },
  't-cro': {
    formation: '4-3-3',
    coach: 'زلاتکو دالیچ',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 83, midfield: 88, defense: 85, overall: 85 },
    players: [
      { name: 'دومینیک لیواکوویچ', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'فنرباحچه', age: 31, rating: 83 },
      { name: 'یوشکو گواردیول', number: 4, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'منچستر سیتی', age: 24, rating: 87 },
      { name: 'یوسیپ شوتالو', number: 6, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'آژاکس', age: 26, rating: 80 },
      { name: 'دویه چالتا-تسار', number: 5, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'المپیک لیون', age: 29, rating: 79 },
      { name: 'یوسیپ استانcontrol', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'بایرن مونیخ', age: 26, rating: 80 },
      { name: 'ماتئو کواچیچ', number: 8, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'منچستر سیتی', age: 32, rating: 84 },
      { name: 'لوکا مودریچ', number: 10, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'رئال مادرید', age: 40, rating: 86 },
      { name: 'ماریو پاشالیچ', number: 15, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'آتالانتا', age: 31, rating: 81 },
      { name: 'ایوان پریشیچ', number: 14, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'آیندهوون', age: 37, rating: 79 },
      { name: 'لوورو مایر', number: 7, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'ولفسبورگ', age: 28, rating: 81 },
      { name: 'آندری کراماریچ', number: 9, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'هوفنهایم', age: 34, rating: 82 }
    ]
  },
  't-uru': {
    formation: '4-3-3',
    coach: 'مارسلو بیلسا',
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: 87, midfield: 89, defense: 85, overall: 87 },
    players: [
      { name: 'سرخیو روچت', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'اینترناسیونال', age: 32, rating: 81 },
      { name: 'رونالد آرائوخو', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'بارسلونا', age: 27, rating: 86 },
      { name: 'خوزه ماریا خیمنز', number: 2, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'اتلتیکو مادرید', age: 31, rating: 82 },
      { name: 'ناهیتان ناندز', number: 8, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'القادسیه', age: 30, rating: 79 },
      { name: 'ماتیاس اولیورا', number: 16, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'ناپولی', age: 28, rating: 80 },
      { name: 'فدریکو والورده', number: 15, position: 'MF', isStarting: true, gridPos: { x: 70, y: 55 }, club: 'رئال مادرید', age: 27, rating: 89 },
      { name: 'مانوئل اوگارته', number: 5, position: 'MF', isStarting: true, gridPos: { x: 50, y: 45 }, club: 'منچستر یونایتد', age: 25, rating: 83 },
      { name: 'نیکولاس د لا کروز', number: 7, position: 'MF', isStarting: true, gridPos: { x: 30, y: 55 }, club: 'فلامینگو', age: 28, rating: 82 },
      { name: 'فاکوندو پلیستری', number: 11, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'پاناتینایکوس', age: 24, rating: 78 },
      { name: 'ماکسیمیلیانو آرائوخو', number: 20, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'اسپورتینگ لیسبون', age: 26, rating: 80 },
      { name: 'داروین نونیز', number: 19, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'لیورپول', age: 26, rating: 83 }
    ]
  }
};

// Realistic database for all other World Cup 2026 teams
const REAL_TEAMS_DATA: Record<string, { coach: string; formation: string; players: { name: string; position: 'GK' | 'DF' | 'MF' | 'FW'; rating: number; number: number; age: number }[] }> = {
  't-mex': {
    coach: 'خاویر آگیره',
    formation: '4-3-3',
    players: [
      { name: 'لوییس مالاگون', position: 'GK', rating: 80, number: 1, age: 29 },
      { name: 'سزار مونتس', position: 'DF', rating: 79, number: 3, age: 29 },
      { name: 'یوهان واسکز', position: 'DF', rating: 79, number: 5, age: 27 },
      { name: 'خسوس گایاردو', position: 'DF', rating: 77, number: 23, age: 31 },
      { name: 'خورخه سانچز', position: 'DF', rating: 76, number: 2, age: 28 },
      { name: 'ادسون آلوارز', position: 'MF', rating: 83, number: 4, age: 28 },
      { name: 'لوئیس چاوز', position: 'MF', rating: 79, number: 24, age: 30 },
      { name: 'لوئیس رومو', position: 'MF', rating: 78, number: 7, age: 31 },
      { name: 'سانتیاگو خیمنز', position: 'FW', rating: 82, number: 9, age: 25 },
      { name: 'هیروینگ لوزانو', position: 'FW', rating: 81, number: 11, age: 30 },
      { name: 'رائول خیمنز', position: 'FW', rating: 80, number: 19, age: 35 },
      // Reserves
      { name: 'گیلرمو اوچوآ', position: 'GK', rating: 76, number: 13, age: 40 },
      { name: 'اوربلین پیندا', position: 'MF', rating: 78, number: 17, age: 30 },
      { name: 'خولین کینونس', position: 'FW', rating: 79, number: 10, age: 29 },
      { name: 'اسرائیل ریس', position: 'DF', rating: 75, number: 15, age: 26 }
    ]
  },
  't-rsa': {
    coach: 'هوگو بروس',
    formation: '4-3-3',
    players: [
      { name: 'رونوئن ویلیامز', position: 'GK', rating: 79, number: 1, age: 34 },
      { name: 'موتوبی اموالا', position: 'DF', rating: 74, number: 2, age: 32 },
      { name: 'گرانت ککانا', position: 'DF', rating: 74, number: 4, age: 33 },
      { name: 'آبری مودیبا', position: 'DF', rating: 74, number: 14, age: 30 },
      { name: 'خولیسو مودائو', position: 'DF', rating: 75, number: 20, age: 31 },
      { name: 'توبوهو موکوینا', position: 'MF', rating: 78, number: 4, age: 29 },
      { name: 'تمبا زوانه', position: 'MF', rating: 77, number: 18, age: 36 },
      { name: 'اسپهله مخولیسه', position: 'MF', rating: 74, number: 23, age: 30 },
      { name: 'پرسی تائو', position: 'FW', rating: 77, number: 10, age: 32 },
      { name: 'میهایل مایامبلا', position: 'FW', rating: 73, number: 9, age: 28 },
      { name: 'ایکرام راینرز', position: 'FW', rating: 74, number: 15, age: 30 },
      // Reserves
      { name: 'فلور اوینز', position: 'GK', rating: 71, number: 16, age: 27 },
      { name: 'سیاندا زولو', position: 'DF', rating: 73, number: 3, age: 34 },
      { name: 'تلاپلو مورنا', position: 'DF', rating: 73, number: 11, age: 32 },
      { name: 'الیاس موکوانا', position: 'FW', rating: 73, number: 7, age: 26 }
    ]
  },
  't-kor': {
    coach: 'هونگ میونگ-بو',
    formation: '4-3-3',
    players: [
      { name: 'جو هیون وو', position: 'GK', rating: 79, number: 21, age: 34 },
      { name: 'کیم مین جائه', position: 'DF', rating: 85, number: 4, age: 29 },
      { name: 'سئول یونگ وو', position: 'DF', rating: 76, number: 22, age: 27 },
      { name: 'کیم جین سو', position: 'DF', rating: 75, number: 3, age: 33 },
      { name: 'جونگ سئونگ-هیون', position: 'DF', rating: 74, number: 15, age: 32 },
      { name: 'لی کانگ این', position: 'MF', rating: 84, number: 18, age: 25 },
      { name: 'هوانگ این بئوم', position: 'MF', rating: 81, number: 6, age: 29 },
      { name: 'لی جائه سونگ', position: 'MF', rating: 78, number: 10, age: 33 },
      { name: 'سون هیونگ مین', position: 'FW', rating: 87, number: 7, age: 33 },
      { name: 'هوانگ هی چان', position: 'FW', rating: 81, number: 11, age: 30 },
      { name: 'چو گوئه سونگ', position: 'FW', rating: 76, number: 9, age: 28 },
      // Reserves
      { name: 'کیم سونگ گیو', position: 'GK', rating: 78, number: 1, age: 35 },
      { name: 'کیم یونگ گوان', position: 'DF', rating: 74, number: 19, age: 36 },
      { name: 'هوانگ اوی-جو', position: 'FW', rating: 75, number: 16, age: 33 },
      { name: 'بائه جون-هو', position: 'MF', rating: 74, number: 14, age: 22 }
    ]
  },
  't-cze': {
    coach: 'ایوان هاشک',
    formation: '4-3-3',
    players: [
      { name: 'جیندریش استانک', position: 'GK', rating: 79, number: 1, age: 30 },
      { name: 'ولادیمیر کوفال', position: 'DF', rating: 80, number: 5, age: 33 },
      { name: 'ویلیام کرچی', position: 'DF', rating: 78, number: 4, age: 27 },
      { name: 'رابین هراناچ', position: 'DF', rating: 77, number: 3, age: 26 },
      { name: 'دیوید دوادرا', position: 'DF', rating: 76, number: 12, age: 27 },
      { name: 'توماس سوچک', position: 'MF', rating: 83, number: 22, age: 31 },
      { name: 'آنتونین باراک', position: 'MF', rating: 79, number: 7, age: 31 },
      { name: 'لوکاس پروود', position: 'MF', rating: 77, number: 14, age: 29 },
      { name: 'پاتریک شیک', position: 'FW', rating: 82, number: 10, age: 30 },
      { name: 'آدام هلوژک', position: 'FW', rating: 79, number: 9, age: 23 },
      { name: 'واکلاو چرنی', position: 'FW', rating: 78, number: 17, age: 28 },
      // Reserves
      { name: 'ماتئی کووار', position: 'GK', rating: 77, number: 16, age: 26 },
      { name: 'مارتین ویتیک', position: 'DF', rating: 76, number: 2, age: 23 },
      { name: 'توماس چوری', position: 'FW', rating: 77, number: 11, age: 31 },
      { name: 'پاول شولک', position: 'MF', rating: 76, number: 18, age: 25 }
    ]
  },
  't-can': {
    coach: 'جسی مارش',
    formation: '4-3-3',
    players: [
      { name: 'ماکسیم کرپو', position: 'GK', rating: 77, number: 16, age: 32 },
      { name: 'آلفونسو دیویس', position: 'DF', rating: 84, number: 19, age: 25 },
      { name: 'آلیستر جانستون', position: 'DF', rating: 79, number: 2, age: 27 },
      { name: 'موئیز بومبیتو', position: 'DF', rating: 77, number: 15, age: 26 },
      { name: 'درک کورنلیوس', position: 'DF', rating: 75, number: 13, age: 28 },
      { name: 'استفن اوستاکیو', position: 'MF', rating: 80, number: 7, age: 29 },
      { name: 'تاجون بوکانان', position: 'MF', rating: 79, number: 11, age: 27 },
      { name: 'ایسمائل کونه', position: 'MF', rating: 77, number: 8, age: 23 },
      { name: 'جاناتان دیوید', position: 'FW', rating: 83, number: 10, age: 26 },
      { name: 'سایل لارین', position: 'FW', rating: 78, number: 9, age: 31 },
      { name: 'یاکوب شافلبرگ', position: 'FW', rating: 76, number: 14, age: 25 },
      // Reserves
      { name: 'داین سن کلر', position: 'GK', rating: 73, number: 1, age: 29 },
      { name: 'کمال میلر', position: 'DF', rating: 74, number: 4, age: 29 },
      { name: 'ساموئل پیت', position: 'MF', rating: 72, number: 6, age: 31 },
      { name: 'تانی اولوواسیی', position: 'FW', rating: 73, number: 25, age: 25 }
    ]
  },
  't-bih': {
    coach: 'سرگی باربارز',
    formation: '4-3-3',
    players: [
      { name: 'نیکولا واسیلی', position: 'GK', rating: 74, number: 1, age: 30 },
      { name: 'سئاد کولاسیناک', position: 'DF', rating: 79, number: 3, age: 32 },
      { name: 'انل احمدوهوژیچ', position: 'DF', rating: 78, number: 16, age: 27 },
      { name: 'آمار ددیچ', position: 'DF', rating: 78, number: 2, age: 23 },
      { name: 'دنیس هادزیکادونیچ', position: 'DF', rating: 74, number: 5, age: 27 },
      { name: 'راده کرونیچ', position: 'MF', rating: 78, number: 8, age: 32 },
      { name: 'بنجامین تاهیروویچ', position: 'MF', rating: 74, number: 6, age: 23 },
      { name: 'هریس هایرادینوویچ', position: 'MF', rating: 75, number: 10, age: 32 },
      { name: 'ادین ژکو', position: 'FW', rating: 81, number: 11, age: 40 },
      { name: 'ارمین دمیلوویچ', position: 'FW', rating: 80, number: 9, age: 28 },
      { name: 'ساد هاکسابانوویچ', position: 'FW', rating: 74, number: 7, age: 27 },
      // Reserves
      { name: 'کنان پیریچ', position: 'GK', rating: 72, number: 12, age: 31 },
      { name: 'ارمین بیچاکچیچ', position: 'DF', rating: 72, number: 4, age: 36 },
      { name: 'امیر هادهیاهمتوویچ', position: 'MF', rating: 74, number: 18, age: 29 },
      { name: 'هاریس تاباکوویچ', position: 'FW', rating: 75, number: 15, age: 31 }
    ]
  },
  't-qat': {
    coach: 'تانتین مارکز',
    formation: '4-3-3',
    players: [
      { name: 'مشعل برشم', position: 'GK', rating: 76, number: 22, age: 28 },
      { name: 'لوکاس مندس', position: 'DF', rating: 75, number: 12, age: 35 },
      { name: 'بوعلام خوخی', position: 'DF', rating: 75, number: 16, age: 35 },
      { name: 'بسام الراوی', position: 'DF', rating: 74, number: 15, age: 28 },
      { name: 'پدرو میگل', position: 'DF', rating: 74, number: 2, age: 35 },
      { name: 'حسن الهیدوس', position: 'MF', rating: 76, number: 10, age: 35 },
      { name: 'احمد فتحی', position: 'MF', rating: 73, number: 6, age: 33 },
      { name: 'عبدالعزیز حاتم', position: 'MF', rating: 73, number: 8, age: 35 },
      { name: 'اکرم عفیف', position: 'FW', rating: 82, number: 11, age: 29 },
      { name: 'المعز علی', position: 'FW', rating: 79, number: 19, age: 29 },
      { name: 'یوسف عبدالرزاق', position: 'FW', rating: 72, number: 7, age: 26 },
      // Reserves
      { name: 'سعد الشیب', position: 'GK', rating: 73, number: 1, age: 36 },
      { name: 'همام الامین', position: 'DF', rating: 73, number: 3, age: 26 },
      { name: 'مصطفی مشعل', position: 'MF', rating: 72, number: 23, age: 25 },
      { name: 'عاصم مادیبو', position: 'MF', rating: 71, number: 4, age: 29 }
    ]
  },
  't-sui': {
    coach: 'مورات یاکین',
    formation: '4-3-3',
    players: [
      { name: 'گریگور کوبل', position: 'GK', rating: 86, number: 1, age: 28 },
      { name: 'مانوئل آکانجی', position: 'DF', rating: 85, number: 5, age: 30 },
      { name: 'ریکاردو رودریگز', position: 'DF', rating: 79, number: 13, age: 33 },
      { name: 'سیلوان ویدمر', position: 'DF', rating: 76, number: 3, age: 33 },
      { name: 'نیکو الودی', position: 'DF', rating: 78, number: 4, age: 29 },
      { name: 'گرانیت ژاکا', position: 'MF', rating: 86, number: 10, age: 33 },
      { name: 'رمو فرولر', position: 'MF', rating: 81, number: 8, age: 34 },
      { name: 'میشل ایبیشر', position: 'MF', rating: 79, number: 20, age: 29 },
      { name: 'بریل امبولو', position: 'FW', rating: 81, number: 7, age: 29 },
      { name: 'دن ندویه', position: 'FW', rating: 80, number: 19, age: 25 },
      { name: 'روبن وارگاس', position: 'FW', rating: 78, number: 17, age: 27 },
      // Reserves
      { name: 'یان سومر', position: 'GK', rating: 84, number: 21, age: 37 },
      { name: 'فابیان شار', position: 'DF', rating: 81, number: 22, age: 34 },
      { name: 'دنیز زکریا', position: 'MF', rating: 81, number: 6, age: 29 },
      { name: 'زکی امدونی', position: 'FW', rating: 77, number: 25, age: 25 }
    ]
  },
  't-mar': {
    coach: 'ولید الرکراکی',
    formation: '4-3-3',
    players: [
      { name: 'یاسین بونو', position: 'GK', rating: 85, number: 1, age: 35 },
      { name: 'اشرف حکیمی', position: 'DF', rating: 86, number: 2, age: 27 },
      { name: 'نایف اکرد', position: 'DF', rating: 82, number: 5, age: 30 },
      { name: 'نصیر مزراوی', position: 'DF', rating: 81, number: 3, age: 28 },
      { name: 'شادي رياض', position: 'DF', rating: 76, number: 15, age: 22 },
      { name: 'براهیم دیاز', position: 'MF', rating: 85, number: 10, age: 26 },
      { name: 'سفیان امرابط', position: 'MF', rating: 82, number: 4, age: 29 },
      { name: 'عزالدین اوناحی', position: 'MF', rating: 81, number: 8, age: 26 },
      { name: 'یوسف النصیری', position: 'FW', rating: 82, number: 19, age: 28 },
      { name: 'سفیان رحیمی', position: 'FW', rating: 81, number: 21, age: 29 },
      { name: 'حکیم زیاش', position: 'FW', rating: 81, number: 7, age: 33 },
      // Reserves
      { name: 'منیر محمدی', position: 'GK', rating: 77, number: 12, age: 37 },
      { name: 'اشرف داری', position: 'DF', rating: 75, number: 6, age: 27 },
      { name: 'امین عدلی', position: 'FW', rating: 80, number: 17, age: 26 },
      { name: 'ایوب الکعبی', position: 'FW', rating: 81, number: 9, age: 32 }
    ]
  },
  't-hai': {
    coach: 'سباستین مینیه',
    formation: '4-3-3',
    players: [
      { name: 'جانی پلاسید', position: 'GK', rating: 71, number: 1, age: 38 },
      { name: 'ریکاردو آده', position: 'DF', rating: 71, number: 4, age: 36 },
      { name: 'کارل آرتوس', position: 'DF', rating: 70, number: 6, age: 30 },
      { name: 'استیون سونس', position: 'DF', rating: 70, number: 2, age: 30 },
      { name: 'آلکس جونیور', position: 'DF', rating: 69, number: 22, age: 32 },
      { name: 'دانلی ژان ژاک', position: 'MF', rating: 72, number: 17, age: 25 },
      { name: 'دریک اتین', position: 'MF', rating: 71, number: 11, age: 29 },
      { name: 'برایان آلبوس', position: 'MF', rating: 70, number: 14, age: 30 },
      { name: 'دوکنز نازون', position: 'FW', rating: 74, number: 9, age: 32 },
      { name: 'فرانتزدی پیرو', position: 'FW', rating: 74, number: 20, age: 31 },
      { name: 'موند گراند', position: 'FW', rating: 71, number: 10, age: 33 },
      // Reserves
      { name: 'الکساندر جرمی', position: 'GK', rating: 68, number: 23, age: 31 },
      { name: 'لو مارک', position: 'DF', rating: 69, number: 3, age: 27 },
      { name: 'هرولد جف', position: 'MF', rating: 69, number: 8, age: 29 },
      { name: 'فابریس پیکاوت', position: 'FW', rating: 67, number: 15, age: 32 }
    ]
  },
  't-sco': {
    coach: 'استیو کلارک',
    formation: '4-3-3',
    players: [
      { name: 'آنگوس گان', position: 'GK', rating: 77, number: 1, age: 30 },
      { name: 'اندرو رابرتسون', position: 'DF', rating: 84, number: 3, age: 32 },
      { name: 'کیرن تیرنی', position: 'DF', rating: 80, number: 6, age: 28 },
      { name: 'جک هندری', position: 'DF', rating: 76, number: 5, age: 31 },
      { name: 'آنتونی رالستون', position: 'DF', rating: 74, number: 2, age: 27 },
      { name: 'اسکات مک‌تومینای', position: 'MF', rating: 82, number: 4, age: 29 },
      { name: 'جان مک‌گین', position: 'MF', rating: 82, number: 7, age: 31 },
      { name: 'بیلی گیلمور', position: 'MF', rating: 79, number: 14, age: 24 },
      { name: 'چ آدامز', position: 'FW', rating: 77, number: 10, age: 29 },
      { name: 'رایان کریستی', position: 'FW', rating: 77, number: 11, age: 31 },
      { name: 'لارنس شانکلند', position: 'FW', rating: 76, number: 9, age: 30 },
      // Reserves
      { name: 'زاندر کلارک', position: 'GK', rating: 72, number: 12, age: 34 },
      { name: 'گرانت هنلی', position: 'DF', rating: 73, number: 15, age: 34 },
      { name: 'کالوم مک‌گرگور', position: 'MF', rating: 79, number: 8, age: 32 },
      { name: 'تامی کانوی', position: 'FW', rating: 72, number: 22, age: 23 }
    ]
  },
  't-usa': {
    coach: 'مائوریسیو پوچتینو',
    formation: '4-3-3',
    players: [
      { name: 'مت ترنر', position: 'GK', rating: 77, number: 1, age: 31 },
      { name: 'آنتونی رابینسون', position: 'DF', rating: 80, number: 5, age: 28 },
      { name: 'کریس ریچاردز', position: 'DF', rating: 78, number: 3, age: 26 },
      { name: 'کامرون کارتر-ویکرز', position: 'DF', rating: 78, number: 4, age: 28 },
      { name: 'سرجینیو دست', position: 'DF', rating: 77, number: 2, age: 25 },
      { name: 'وستون مک‌کنی', position: 'MF', rating: 81, number: 8, age: 27 },
      { name: 'تایلر آدامز', position: 'MF', rating: 79, number: 4, age: 27 },
      { name: 'جیووانی رینا', position: 'MF', rating: 79, number: 10, age: 23 },
      { name: 'کریستین پولیشیچ', position: 'FW', rating: 84, number: 11, age: 27 },
      { name: 'تیموتی وه‌آ', position: 'FW', rating: 79, number: 21, age: 26 },
      { name: 'فولارین بالوگون', position: 'FW', rating: 80, number: 9, age: 24 },
      // Reserves
      { name: 'پاتریک شولته', position: 'GK', rating: 75, number: 18, age: 25 },
      { name: 'تیم ریم', position: 'DF', rating: 75, number: 13, age: 38 },
      { name: 'یونس موسی', position: 'MF', rating: 78, number: 6, age: 23 },
      { name: 'هاجی رایت', position: 'FW', rating: 77, number: 19, age: 28 }
    ]
  },
  't-par': {
    coach: 'گوستاوو آلفارو',
    formation: '4-3-3',
    players: [
      { name: 'روبرتو فرناندز', position: 'GK', rating: 75, number: 12, age: 26 },
      { name: 'گوستاوو گومز', position: 'DF', rating: 79, number: 15, age: 33 },
      { name: 'عمر الدریتی', position: 'DF', rating: 77, number: 3, age: 29 },
      { name: 'جونیور آلونسو', position: 'DF', rating: 76, number: 6, age: 33 },
      { name: 'سانتیاگو آرزامندیا', position: 'DF', rating: 74, number: 4, age: 28 },
      { name: 'میگل آلمیرون', position: 'MF', rating: 80, number: 10, age: 32 },
      { name: 'دیگو گومز', position: 'MF', rating: 76, number: 8, age: 23 },
      { name: 'آندرس کوباس', position: 'MF', rating: 76, number: 26, age: 29 },
      { name: 'خولیو انسیسو', position: 'FW', rating: 78, number: 19, age: 22 },
      { name: 'تونی سانابریا', position: 'FW', rating: 78, number: 9, age: 30 },
      { name: 'رامون سوسا', position: 'FW', rating: 76, number: 24, age: 26 },
      // Reserves
      { name: 'کارلوس کورونل', position: 'GK', rating: 74, number: 1, age: 29 },
      { name: 'فابیان بالبوئنا', position: 'DF', rating: 74, number: 5, age: 34 },
      { name: 'ماتیوس گالارزا', position: 'MF', rating: 73, number: 16, age: 24 },
      { name: 'آدام باریرو', position: 'FW', rating: 75, number: 11, age: 29 }
    ]
  },
  't-aus': {
    coach: 'تونی پاپاوویچ',
    formation: '4-3-3',
    players: [
      { name: 'متیو رایان', position: 'GK', rating: 78, number: 1, age: 34 },
      { name: 'هری سوتار', position: 'DF', rating: 75, number: 19, age: 27 },
      { name: 'کی راولس', position: 'DF', rating: 74, number: 3, age: 27 },
      { name: 'جرد باس', position: 'DF', rating: 74, number: 5, age: 22 },
      { name: 'عریز بهیچ', position: 'DF', rating: 72, number: 16, age: 35 },
      { name: 'جکسون ایروین', position: 'MF', rating: 76, number: 22, age: 33 },
      { name: 'کریگ گودوین', position: 'MF', rating: 76, number: 23, age: 34 },
      { name: 'کانر متکالف', position: 'MF', rating: 74, number: 8, age: 26 },
      { name: 'میچل دوک', position: 'FW', rating: 71, number: 15, age: 35 },
      { name: 'نستر ایراندوستا', position: 'FW', rating: 75, number: 17, age: 20 },
      { name: 'براندون بورلو', position: 'FW', rating: 72, number: 9, age: 30 },
      // Reserves
      { name: 'جو گوچی', position: 'GK', rating: 72, number: 18, age: 25 },
      { name: 'لوئیس میلر', position: 'DF', rating: 71, number: 2, age: 25 },
      { name: 'آیدین هروستیچ', position: 'MF', rating: 74, number: 10, age: 29 },
      { name: 'کاسینی ینگی', position: 'FW', rating: 72, number: 11, age: 27 }
    ]
  },
  't-tur': {
    coach: 'وینچنزو مونتلا',
    formation: '4-3-3',
    players: [
      { name: 'مرت گونوک', position: 'GK', rating: 79, number: 1, age: 37 },
      { name: 'فردی کادی‌اوغلو', position: 'DF', rating: 82, number: 20, age: 26 },
      { name: 'مریح دمیرال', position: 'DF', rating: 80, number: 3, age: 28 },
      { name: 'عبدالکریم بارداکچی', position: 'DF', rating: 80, number: 14, age: 31 },
      { name: 'مرت مولدور', position: 'DF', rating: 77, number: 4, age: 27 },
      { name: 'هاکان چالهان‌اوغلو', position: 'MF', rating: 86, number: 10, age: 32 },
      { name: 'آردا گولر', position: 'MF', rating: 84, number: 8, age: 21 },
      { name: 'اورکون کوکچو', position: 'MF', rating: 81, number: 6, age: 25 },
      { name: 'کنان ییلدیز', position: 'FW', rating: 82, number: 19, age: 21 },
      { name: 'کرم آکتورک‌اوغلو', position: 'FW', rating: 81, number: 7, age: 27 },
      { name: 'باریش آلپر ییلماز', position: 'FW', rating: 81, number: 21, age: 26 },
      // Reserves
      { name: 'آلتای بایندیر', position: 'GK', rating: 76, number: 12, age: 28 },
      { name: 'کان آیهان', position: 'DF', rating: 77, number: 22, age: 31 },
      { name: 'اسماعیل یوکسک', position: 'MF', rating: 77, number: 15, age: 27 },
      { name: 'سميح کیلیچسوی', position: 'FW', rating: 76, number: 9, age: 20 }
    ]
  },
  't-cuw': {
    coach: 'دیک ادووکات',
    formation: '4-3-3',
    players: [
      { name: 'الویر اتاق', position: 'GK', rating: 69, number: 1, age: 32 },
      { name: 'جورهان کارملا', position: 'DF', rating: 67, number: 3, age: 26 },
      { name: 'ونتو دی لور', position: 'DF', rating: 69, number: 4, age: 28 },
      { name: 'برنارد هنس', position: 'DF', rating: 66, number: 5, age: 27 },
      { name: 'مایکل ماریا', position: 'DF', rating: 67, number: 2, age: 31 },
      { name: 'جونینیو باکونا', position: 'MF', rating: 74, number: 7, age: 28 },
      { name: 'لئاندرو باکونا', position: 'MF', rating: 71, number: 8, age: 34 },
      { name: 'جود کاستیلیو', position: 'MF', rating: 67, number: 14, age: 25 },
      { name: 'یورگن لوکادیا', position: 'FW', rating: 71, number: 9, age: 32 },
      { name: 'جیورانی ورونیکا', position: 'FW', rating: 69, number: 10, age: 24 },
      { name: 'رانگلو جانگا', position: 'FW', rating: 70, number: 19, age: 34 },
      // Reserves
      { name: 'تروور دوزبا', position: 'GK', rating: 65, number: 12, age: 25 },
      { name: 'روشین فیلد', position: 'DF', rating: 65, number: 13, age: 24 },
      { name: 'رای جینیو', position: 'MF', rating: 66, number: 16, age: 25 },
      { name: 'جیورن شرمن', position: 'FW', rating: 68, number: 11, age: 27 }
    ]
  },
  't-civ': {
    coach: 'امرس فائه',
    formation: '4-3-3',
    players: [
      { name: 'یحیی فوفانا', position: 'GK', rating: 78, number: 1, age: 25 },
      { name: 'اوان اندیکا', position: 'DF', rating: 83, number: 21, age: 26 },
      { name: 'اودیلون کاسونو', position: 'DF', rating: 82, number: 7, age: 25 },
      { name: 'ویلفرد سینگو', position: 'DF', rating: 80, number: 5, age: 25 },
      { name: 'سرژ اوریه', position: 'DF', rating: 76, number: 17, age: 33 },
      { name: 'فرانک کسیه', position: 'MF', rating: 82, number: 8, age: 29 },
      { name: 'سکو فوفانا', position: 'MF', rating: 81, number: 6, age: 31 },
      { name: 'ابراهیم سانگاره', position: 'MF', rating: 80, number: 18, age: 28 },
      { name: 'سباستین هالر', position: 'FW', rating: 80, number: 22, age: 31 },
      { name: 'سیمون آدینگرا', position: 'FW', rating: 80, number: 24, age: 24 },
      { name: 'عمر دیاکیته', position: 'FW', rating: 77, number: 14, age: 22 },
      // Reserves
      { name: 'غزل ادوارد', position: 'GK', rating: 70, number: 16, age: 23 },
      { name: 'ویلی بولی', position: 'DF', rating: 76, number: 4, age: 35 },
      { name: 'نیکولاس پپه', position: 'FW', rating: 77, number: 10, age: 30 },
      { name: 'امانوئل لاتی لات', position: 'FW', rating: 76, number: 9, age: 27 }
    ]
  },
  't-ecu': {
    coach: 'سباستین بکاسسه',
    formation: '4-3-3',
    players: [
      { name: 'هرنان گالیندز', position: 'GK', rating: 77, number: 1, age: 39 },
      { name: 'پیرو هینکاپیه', position: 'DF', rating: 83, number: 3, age: 24 },
      { name: 'ویلیام پاچو', position: 'DF', rating: 83, number: 6, age: 24 },
      { name: 'پرویس استوپینیان', position: 'DF', rating: 80, number: 7, age: 28 },
      { name: 'آنجلو پرسیادو', position: 'DF', rating: 78, number: 17, age: 28 },
      { name: 'مویسس کایسدو', position: 'MF', rating: 85, number: 23, age: 24 },
      { name: 'کندری پائز', position: 'MF', rating: 78, number: 10, age: 19 },
      { name: 'آلن فرانکو', position: 'MF', rating: 76, number: 21, age: 27 },
      { name: 'انر والنسیا', position: 'FW', rating: 79, number: 13, age: 36 },
      { name: 'جرمی سارمینتو', position: 'FW', rating: 75, number: 16, age: 23 },
      { name: 'کوین رودریگز', position: 'FW', rating: 74, number: 11, age: 26 },
      // Reserves
      { name: 'الکساندر دومینگز', position: 'GK', rating: 75, number: 22, age: 38 },
      { name: 'فیلیکس تورس', position: 'DF', rating: 76, number: 2, age: 29 },
      { name: 'کارلوس گروئزو', position: 'MF', rating: 75, number: 8, age: 31 },
      { name: 'جان یبوا', position: 'FW', rating: 74, number: 9, age: 25 }
    ]
  },
  't-jpn': {
    coach: 'هاجیمه موریاسو',
    formation: '4-3-3',
    players: [
      { name: 'زیون سوزوکی', position: 'GK', rating: 79, number: 12, age: 23 },
      { name: 'هیروکی ایتو', position: 'DF', rating: 81, number: 21, age: 27 },
      { name: 'کو ایتاکورا', position: 'DF', rating: 81, number: 4, age: 29 },
      { name: 'یوکیناری سوگاوارا', position: 'DF', rating: 79, number: 2, age: 25 },
      { name: 'شوگو تانیگوچی', position: 'DF', rating: 75, number: 3, age: 34 },
      { name: 'واتارو اندو', position: 'MF', rating: 83, number: 6, age: 33 },
      { name: 'هیده‌ماسا موریتا', position: 'MF', rating: 80, number: 5, age: 31 },
      { name: 'داichi کامادا', position: 'MF', rating: 80, number: 8, age: 29 },
      { name: 'کائورو میتوما', position: 'FW', rating: 84, number: 7, age: 29 },
      { name: 'تاکفوسا کوبو', position: 'FW', rating: 84, number: 20, age: 24 },
      { name: 'تاکومی مینامینو', position: 'FW', rating: 81, number: 10, age: 31 },
      // Reserves
      { name: 'کی سوکه اوساکو', position: 'GK', rating: 75, number: 1, age: 26 },
      { name: 'کیتو ناکامورا', position: 'FW', rating: 79, number: 13, age: 25 },
      { name: 'ریتسو دوان', position: 'MF', rating: 80, number: 11, age: 27 },
      { name: 'کیوگو فوروهاشی', position: 'FW', rating: 79, number: 9, age: 31 }
    ]
  },
  't-swe': {
    coach: 'یان دال توماسون',
    formation: '4-3-3',
    players: [
      { name: 'روبن اولسن', position: 'GK', rating: 77, number: 1, age: 36 },
      { name: 'ویکتور لیندلوف', position: 'DF', rating: 80, number: 3, age: 31 },
      { name: 'ایزاک هین', position: 'DF', rating: 79, number: 4, age: 27 },
      { name: 'امیل کرافت', position: 'DF', rating: 75, number: 2, age: 31 },
      { name: 'لودویگ آوگوستینسون', position: 'DF', rating: 75, number: 5, age: 32 },
      { name: 'دژان کولوسوسکی', position: 'MF', rating: 83, number: 21, age: 26 },
      { name: 'هوگو لارسون', position: 'MF', rating: 79, number: 18, age: 21 },
      { name: 'ماتیاس سوانبرگ', position: 'MF', rating: 77, number: 11, age: 27 },
      { name: 'ویکتور گیوکرش', position: 'FW', rating: 86, number: 17, age: 27 },
      { name: 'الکساندر ایساک', position: 'FW', rating: 85, number: 9, age: 26 },
      { name: 'آنتونی الانگا', position: 'FW', rating: 78, number: 19, age: 24 },
      // Reserves
      { name: 'فکتور یوهانسن', position: 'GK', rating: 75, number: 12, age: 27 },
      { name: 'کرل استارلفت', position: 'DF', rating: 74, number: 6, age: 30 },
      { name: 'لوکاس برگوال', position: 'MF', rating: 75, number: 24, age: 20 },
      { name: 'امیل فورزبرگ', position: 'MF', rating: 77, number: 10, age: 34 }
    ]
  },
  't-tun': {
    coach: 'قیس یعقوبی',
    formation: '4-3-3',
    players: [
      { name: 'امان‌الله ممیش', position: 'GK', rating: 73, number: 22, age: 22 },
      { name: 'منتصر طالبی', position: 'DF', rating: 76, number: 3, age: 28 },
      { name: 'علی العابدی', position: 'DF', rating: 75, number: 2, age: 32 },
      { name: 'یان والری', position: 'DF', rating: 73, number: 4, age: 27 },
      { name: 'وجدی کشرط', position: 'DF', rating: 72, number: 21, age: 30 },
      { name: 'الیاس صخیری', position: 'MF', rating: 80, number: 17, age: 31 },
      { name: 'عیسی لایدونی', position: 'MF', rating: 76, number: 14, age: 29 },
      { name: 'حمزه رفیعه', position: 'MF', rating: 73, number: 10, age: 27 },
      { name: 'الیاس سعد', position: 'FW', rating: 74, number: 7, age: 26 },
      { name: 'یوسف المساکنی', position: 'FW', rating: 73, number: 9, age: 35 },
      { name: 'سیف‌الله لطیف', position: 'FW', rating: 72, number: 11, age: 26 },
      // Reserves
      { name: 'بشیر بن سعید', position: 'GK', rating: 72, number: 1, age: 31 },
      { name: 'یاسین مریاح', position: 'DF', rating: 72, number: 15, age: 32 },
      { name: 'هانیبال مجبری', position: 'MF', rating: 74, number: 8, age: 23 },
      { name: 'عیسام جبالی', position: 'FW', rating: 72, number: 19, age: 34 }
    ]
  },
  't-egy': {
    coach: 'حسام حسن',
    formation: '4-3-3',
    players: [
      { name: 'محمد الشناوی', position: 'GK', rating: 78, number: 1, age: 37 },
      { name: 'محمد عبدالمنعم', position: 'DF', rating: 79, number: 24, age: 27 },
      { name: 'رامی ربیعه', position: 'DF', rating: 74, number: 5, age: 33 },
      { name: 'محمد هانی', position: 'DF', rating: 73, number: 3, age: 30 },
      { name: 'عمر کمال', position: 'DF', rating: 73, number: 4, age: 32 },
      { name: 'محمد صلاح', position: 'FW', rating: 89, number: 10, age: 33 },
      { name: 'عمر مرموش', position: 'FW', rating: 83, number: 22, age: 27 },
      { name: 'مصطفی محمد', position: 'FW', rating: 79, number: 19, age: 28 },
      { name: 'محمود حسن ترزگه', position: 'MF', rating: 78, number: 7, age: 31 },
      { name: 'احمد سید زیزو', position: 'MF', rating: 77, number: 21, age: 30 },
      { name: 'امام عاشور', position: 'MF', rating: 77, number: 8, age: 28 },
      // Reserves
      { name: 'مصطفی شوبیر', position: 'GK', rating: 75, number: 16, age: 26 },
      { name: 'احمد حجازی', position: 'DF', rating: 74, number: 6, age: 35 },
      { name: 'حمدی فتحی', position: 'MF', rating: 76, number: 14, age: 31 },
      { name: 'محمد شریف', position: 'FW', rating: 74, number: 11, age: 30 }
    ]
  },
  't-nzl': {
    coach: 'دارن بازیلی',
    formation: '4-3-3',
    players: [
      { name: 'الکس پاولسن', position: 'GK', rating: 71, number: 1, age: 23 },
      { name: 'لیبراتو کاکاچه', position: 'DF', rating: 74, number: 3, age: 25 },
      { name: 'تایلر بیندون', position: 'DF', rating: 72, number: 4, age: 21 },
      { name: 'مایکل بوکسال', position: 'DF', rating: 69, number: 15, age: 37 },
      { name: 'ناندو پیجناکر', position: 'DF', rating: 66, number: 5, age: 27 },
      { name: 'مارکو استامنیچ', position: 'MF', rating: 73, number: 6, age: 24 },
      { name: 'سارپریت سینگ', position: 'MF', rating: 71, number: 10, age: 27 },
      { name: 'متیو گاربت', position: 'MF', rating: 70, number: 8, age: 24 },
      { name: 'کریس وود', position: 'FW', rating: 80, number: 9, age: 34 },
      { name: 'بن واین', position: 'FW', rating: 69, number: 19, age: 24 },
      { name: 'کوستا بارباروسس', position: 'FW', rating: 68, number: 7, age: 36 },
      // Reserves
      { name: 'اولیور سیل', position: 'GK', rating: 68, number: 12, age: 30 },
      { name: 'تامی اسمیت', position: 'DF', rating: 65, number: 2, age: 36 },
      { name: 'الیجا جاست', position: 'MF', rating: 68, number: 14, age: 26 },
      { name: 'مکس ماتا', position: 'FW', rating: 67, number: 11, age: 25 }
    ]
  },
  't-cpv': {
    coach: 'بوبیستا',
    formation: '4-3-3',
    players: [
      { name: 'جوزیما دیاس فوزینها', position: 'GK', rating: 71, number: 23, age: 39 },
      { name: 'لوگان کاستا', position: 'DF', rating: 76, number: 4, age: 25 },
      { name: 'استیون موریرا', position: 'DF', rating: 72, number: 20, age: 31 },
      { name: 'روبرتو لوپز', position: 'DF', rating: 70, number: 3, age: 33 },
      { name: 'دیلان تاوارس', position: 'DF', rating: 69, number: 5, age: 29 },
      { name: 'پاتریک آندراده', position: 'MF', rating: 71, number: 6, age: 33 },
      { name: 'وینی لورنزو', position: 'MF', rating: 71, number: 10, age: 31 },
      { name: 'جامی رابیرو', position: 'MF', rating: 70, number: 18, age: 26 },
      { name: 'رایان مندس', position: 'FW', rating: 75, number: 20, age: 36 },
      { name: 'جووان کابرال', position: 'FW', rating: 73, number: 11, age: 27 },
      { name: 'بهبه', position: 'FW', rating: 70, number: 7, age: 35 },
      // Reserves
      { name: 'دیلن سیلوا', position: 'GK', rating: 66, number: 1, age: 27 },
      { name: 'دوکی', position: 'DF', rating: 68, number: 14, age: 28 },
      { name: 'لنو پینا', position: 'MF', rating: 67, number: 8, age: 26 },
      { name: 'گری مندس رودریگز', position: 'FW', rating: 72, number: 9, age: 35 }
    ]
  },
  't-ksa': {
    coach: 'هروه رنار',
    formation: '4-3-3',
    players: [
      { name: 'احمد الکصار', position: 'GK', rating: 73, number: 22, age: 34 },
      { name: 'سعود عبدالحمید', position: 'DF', rating: 78, number: 12, age: 26 },
      { name: 'حسان تمبکتی', position: 'DF', rating: 75, number: 4, age: 27 },
      { name: 'علی البلیهی', position: 'DF', rating: 74, number: 5, age: 36 },
      { name: 'سلطان الغنام', position: 'DF', rating: 74, number: 2, age: 32 },
      { name: 'سالم الدوسری', position: 'MF', rating: 79, number: 10, age: 34 },
      { name: 'محمد کنو', position: 'MF', rating: 75, number: 23, age: 31 },
      { name: 'فیصل الغامدی', position: 'MF', rating: 72, number: 15, age: 24 },
      { name: 'فراس البریکان', position: 'FW', rating: 77, number: 9, age: 26 },
      { name: 'عبدالرحمن غریب', position: 'FW', rating: 74, number: 18, age: 29 },
      { name: 'مروان الصحفی', position: 'FW', rating: 74, number: 11, age: 22 },
      // Reserves
      { name: 'محمد الیوامی', position: 'GK', rating: 71, number: 1, age: 28 },
      { name: 'یاسر الشهرانی', position: 'DF', rating: 72, number: 13, age: 34 },
      { name: 'مصعب الجویر', position: 'MF', rating: 72, number: 8, age: 22 },
      { name: 'صالح الشهری', position: 'FW', rating: 73, number: 11, age: 32 }
    ]
  },
  't-sen': {
    coach: 'پاپ تیائو',
    formation: '4-3-3',
    players: [
      { name: 'ادوارد مندی', position: 'GK', rating: 80, number: 16, age: 34 },
      { name: 'کالیدو کولیبالی', position: 'DF', rating: 81, number: 3, age: 34 },
      { name: 'عبدم دیالو', position: 'DF', rating: 77, number: 22, age: 30 },
      { name: 'مورت داکوتی', position: 'DF', rating: 76, number: 4, age: 27 },
      { name: 'حبیب دیارا', position: 'DF', rating: 75, number: 2, age: 22 },
      { name: 'پاپ ماتار سار', position: 'MF', rating: 81, number: 17, age: 23 },
      { name: 'لامین کامارا', position: 'MF', rating: 78, number: 25, age: 22 },
      { name: 'ادریس گی', position: 'MF', rating: 77, number: 5, age: 36 },
      { name: 'سادیو مانه', position: 'FW', rating: 83, number: 10, age: 34 },
      { name: 'نیکلاس جکسون', position: 'FW', rating: 83, number: 7, age: 24 },
      { name: 'اسماعیلا سار', position: 'FW', rating: 78, number: 18, age: 28 },
      // Reserves
      { name: 'موری دیاو', position: 'GK', rating: 74, number: 1, age: 32 },
      { name: 'فودی بالو-توره', position: 'DF', rating: 73, number: 12, age: 29 },
      { name: 'نامپالیس مندی', position: 'MF', rating: 75, number: 6, age: 33 },
      { name: 'حبیب دیالو', position: 'FW', rating: 76, number: 20, age: 30 }
    ]
  },
  't-irq': {
    coach: 'خسوس کاساس',
    formation: '4-3-3',
    players: [
      { name: 'جلال حسن', position: 'GK', rating: 73, number: 12, age: 34 },
      { name: 'حسین علی', position: 'DF', rating: 71, number: 3, age: 24 },
      { name: 'میرخاس دوسکی', position: 'DF', rating: 71, number: 15, age: 26 },
      { name: 'ریبین سولاقا', position: 'DF', rating: 70, number: 4, age: 33 },
      { name: 'مناف یونس', position: 'DF', rating: 70, number: 6, age: 29 },
      { name: 'ابراهیم بایش', position: 'MF', rating: 73, number: 8, age: 26 },
      { name: 'امیر العماری', position: 'MF', rating: 73, number: 16, age: 28 },
      { name: 'زیدان اقبال', position: 'MF', rating: 73, number: 14, age: 23 },
      { name: 'ایمن حسین', position: 'FW', rating: 77, number: 18, age: 30 },
      { name: 'علی جاسم', position: 'FW', rating: 74, number: 17, age: 22 },
      { name: 'یوسف امین', position: 'FW', rating: 73, number: 7, age: 22 },
      // Reserves
      { name: 'فهد طالب', position: 'GK', rating: 68, number: 1, age: 31 },
      { name: 'سعد ناطق', position: 'DF', rating: 71, number: 2, age: 32 },
      { name: 'اسامه رشید', position: 'MF', rating: 70, number: 11, age: 34 },
      { name: 'مهند علی', position: 'FW', rating: 71, number: 10, age: 25 }
    ]
  },
  't-nor': {
    coach: 'استوله سولباکن',
    formation: '4-3-3',
    players: [
      { name: 'اوریان نیلاند', position: 'GK', rating: 78, number: 1, age: 35 },
      { name: 'یولیان رایرسون', position: 'DF', rating: 80, number: 14, age: 28 },
      { name: 'لئو اوستیگارد', position: 'DF', rating: 77, number: 4, age: 26 },
      { name: 'آندریاس هنش اولسن', position: 'DF', rating: 76, number: 3, age: 29 },
      { name: 'داوید میر نیلسن', position: 'DF', rating: 74, number: 15, age: 23 },
      { name: 'مارتین اودگارد', position: 'MF', rating: 89, number: 10, age: 27 },
      { name: 'ساندر برگ', position: 'MF', rating: 80, number: 8, age: 28 },
      { name: 'پاتریک برگ', position: 'MF', rating: 75, number: 6, age: 32 },
      { name: 'ارلینگ هالند', position: 'FW', rating: 91, number: 9, age: 25 },
      { name: 'الکساندر سورلوث', position: 'FW', rating: 82, number: 19, age: 30 },
      { name: 'آنتونیو نوسا', position: 'FW', rating: 79, number: 20, age: 21 },
      // Reserves
      { name: 'ماتیاس دیلاند', position: 'GK', rating: 73, number: 12, age: 21 },
      { name: 'کریستوفر آیر', position: 'DF', rating: 77, number: 5, age: 28 },
      { name: 'مورتن تورسبی', position: 'MF', rating: 75, number: 23, age: 30 },
      { name: 'اسکار باب', position: 'FW', rating: 80, number: 7, age: 22 }
    ]
  },
  't-alg': {
    coach: 'ولادیمیر پتکوویچ',
    formation: '4-3-3',
    players: [
      { name: 'آنتونی ماندریا', position: 'GK', rating: 76, number: 16, age: 31 },
      { name: 'رایان آیت‌نوری', position: 'DF', rating: 81, number: 3, age: 24 },
      { name: 'رامی بن‌سبعینی', position: 'DF', rating: 79, number: 21, age: 31 },
      { name: 'عیسی ماندی', position: 'DF', rating: 75, number: 2, age: 34 },
      { name: 'یوسف عطال', position: 'DF', rating: 75, number: 20, age: 30 },
      { name: 'اسماعیل بن‌ناصر', position: 'MF', rating: 82, number: 14, age: 28 },
      { name: 'حسام عوار', position: 'MF', rating: 78, number: 8, age: 27 },
      { name: 'رامیز زروقی', position: 'MF', rating: 76, number: 6, age: 27 },
      { name: 'امین غویری', position: 'FW', rating: 81, number: 11, age: 26 },
      { name: 'ریاض محرز', position: 'FW', rating: 80, number: 7, age: 35 },
      { name: 'سعید بن‌رحمه', position: 'FW', rating: 78, number: 10, age: 30 },
      // Reserves
      { name: 'الکساندر اوکیجا', position: 'GK', rating: 74, number: 1, age: 37 },
      { name: 'جوان حجام', position: 'DF', rating: 73, number: 15, age: 23 },
      { name: 'فارس شعیبی', position: 'MF', rating: 77, number: 18, age: 23 },
      { name: 'بغداد بونجاح', position: 'FW', rating: 76, number: 9, age: 34 }
    ]
  },
  't-aut': {
    coach: 'رالف رانگنیک',
    formation: '4-3-3',
    players: [
      { name: 'پاتریک پنتز', position: 'GK', rating: 77, number: 13, age: 29 },
      { name: 'کوین دانسو', position: 'DF', rating: 81, number: 14, age: 27 },
      { name: 'استفان پوش', position: 'DF', rating: 80, number: 5, age: 29 },
      { name: 'فیلیپ لینهارت', position: 'DF', rating: 79, number: 15, age: 29 },
      { name: 'فیلیپ اموونه', position: 'DF', rating: 76, number: 3, age: 32 },
      { name: 'مارسل سابیتزر', position: 'MF', rating: 83, number: 9, age: 32 },
      { name: 'کونراد لایمر', position: 'MF', rating: 82, number: 20, age: 29 },
      { name: 'کریستوف بومگارتنر', position: 'MF', rating: 81, number: 19, age: 26 },
      { name: 'مایکل گرگوریتش', position: 'FW', rating: 78, number: 11, age: 32 },
      { name: 'پاتریک ویمر', position: 'FW', rating: 77, number: 23, age: 24 },
      { name: 'فلوریان گریلتیش', position: 'FW', rating: 78, number: 10, age: 30 },
      // Reserves
      { name: 'الکساندر شلاگر', position: 'GK', rating: 76, number: 1, age: 30 },
      { name: 'ماکسیمیلیان وبور', position: 'DF', rating: 76, number: 2, age: 28 },
      { name: 'الکساندر پراس', position: 'MF', rating: 77, number: 8, age: 24 },
      { name: 'مارکو آرناتوویچ', position: 'FW', rating: 76, number: 7, age: 37 }
    ]
  },
  't-jor': {
    coach: 'جمال سلامی',
    formation: '4-3-3',
    players: [
      { name: 'یزید ابولیلا', position: 'GK', rating: 72, number: 1, age: 33 },
      { name: 'یزن العرب', position: 'DF', rating: 72, number: 5, age: 30 },
      { name: 'عبدالله نصیب', position: 'DF', rating: 71, number: 3, age: 32 },
      { name: 'احسان حداد', position: 'DF', rating: 70, number: 2, age: 32 },
      { name: 'سالم العجالین', position: 'DF', rating: 68, number: 19, age: 37 },
      { name: 'نور الروابده', position: 'MF', rating: 71, number: 8, age: 29 },
      { name: 'نزار الرشدان', position: 'MF', rating: 71, number: 14, age: 26 },
      { name: 'رجعتی عاید', position: 'MF', rating: 69, number: 6, age: 33 },
      { name: 'موسی التعمری', position: 'FW', rating: 78, number: 10, age: 28 },
      { name: 'یزن النعیمات', position: 'FW', rating: 76, number: 11, age: 26 },
      { name: 'علی علوان', position: 'FW', rating: 73, number: 9, age: 26 },
      // Reserves
      { name: 'عبدالله الفاخوری', position: 'GK', rating: 68, number: 22, age: 26 },
      { name: 'ابراهیم سعادت', position: 'DF', rating: 67, number: 4, age: 29 },
      { name: 'صالح راتب', position: 'MF', rating: 68, number: 18, age: 31 },
      { name: 'انس العوضات', position: 'FW', rating: 68, number: 7, age: 27 }
    ]
  },
  't-cod': {
    coach: 'سباستین دسابره',
    formation: '4-3-3',
    players: [
      { name: 'دیمیتری برتود', position: 'GK', rating: 74, number: 16, age: 28 },
      { name: 'شانسل امبمبا', position: 'DF', rating: 80, number: 22, age: 31 },
      { name: 'آرتور ماسواکو', position: 'DF', rating: 75, number: 26, age: 32 },
      { name: 'دیلان باتوبینسیکا', position: 'DF', rating: 74, number: 4, age: 30 },
      { name: 'گیدئون کالولو', position: 'DF', rating: 73, number: 2, age: 28 },
      { name: 'تئو بونگوندا', position: 'MF', rating: 76, number: 10, age: 30 },
      { name: 'صاموئل موتوسامی', position: 'MF', rating: 74, number: 18, age: 29 },
      { name: 'چارلز پیکول', position: 'MF', rating: 73, number: 8, age: 35 },
      { name: 'یوآن ویسا', position: 'FW', rating: 79, number: 20, age: 29 },
      { name: 'مشاک الیا', position: 'FW', rating: 76, number: 13, age: 28 },
      { name: 'سدريك باکامبو', position: 'FW', rating: 76, number: 9, age: 35 },
      // Reserves
      { name: 'لیونل امپاسی', position: 'GK', rating: 72, number: 1, age: 31 },
      { name: 'اینونگا باکا', position: 'DF', rating: 73, number: 5, age: 30 },
      { name: 'ادو کایمبه', position: 'MF', rating: 73, number: 6, age: 27 },
      { name: 'سایلاس کاتومپا', position: 'FW', rating: 75, number: 11, age: 27 }
    ]
  },
  't-uzb': {
    coach: 'سرچکو کاتانتس',
    formation: '4-3-3',
    players: [
      { name: 'اوتکیر یوسوپوف', position: 'GK', rating: 72, number: 1, age: 35 },
      { name: 'ابدوکودیر خوسانوف', position: 'DF', rating: 77, number: 13, age: 22 },
      { name: 'حسن‌الدین علیقلوف', position: 'DF', rating: 72, number: 2, age: 29 },
      { name: 'رستم آشورماتوف', position: 'DF', rating: 69, number: 4, age: 29 },
      { name: 'فرخ سایفیف', position: 'DF', rating: 68, number: 3, age: 35 },
      { name: 'آبوسبک فیض‌الله‌اف', position: 'MF', rating: 76, number: 22, age: 22 },
      { name: 'اوستون اورونوف', position: 'MF', rating: 75, number: 11, age: 25 },
      { name: 'اوتابک شوکوروف', position: 'MF', rating: 72.5, number: 9, age: 29 },
      { name: 'الدور شومورودوف', position: 'FW', rating: 77, number: 14, age: 30 },
      { name: 'جلال‌الدین ماشاریپوف', position: 'FW', rating: 73.5, number: 10, age: 32 },
      { name: 'جمشید اسکندروف', position: 'FW', rating: 69, number: 8, age: 33 },
      // Reserves
      { name: 'عبدالواحد نمتوف', position: 'GK', rating: 67, number: 12, age: 25 },
      { name: 'شرزود نصرالله‌اف', position: 'DF', rating: 68, number: 5, age: 27 },
      { name: 'عادل‌جان هامروبکوف', position: 'MF', rating: 71, number: 7, age: 30 },
      { name: 'ایگور سرگیف', position: 'FW', rating: 69.5, number: 21, age: 33 }
    ]
  },
  't-col': {
    coach: 'نستور لورنزو',
    formation: '4-3-3',
    players: [
      { name: 'کامیلو وارگاس', position: 'GK', rating: 79, number: 12, age: 37 },
      { name: 'دانیال مونیوز', position: 'DF', rating: 81, number: 21, age: 30 },
      { name: 'داوینسون سانچز', position: 'DF', rating: 80, number: 23, age: 29 },
      { name: 'یوهان موخیکا', position: 'DF', rating: 77, number: 17, age: 33 },
      { name: 'خوان کابل', position: 'DF', rating: 76, number: 3, age: 25 },
      { name: 'خامس رودریگز', position: 'MF', rating: 82, number: 10, age: 34 },
      { name: 'جفرسون لرما', position: 'MF', rating: 80, number: 16, age: 31 },
      { name: 'ریچارد ریوس', position: 'MF', rating: 79, number: 6, age: 25 },
      { name: 'لوئیس دیاز', position: 'FW', rating: 84, number: 7, age: 29 },
      { name: 'جان دوران', position: 'FW', rating: 80, number: 19, age: 22 },
      { name: 'جان آریاس', position: 'FW', rating: 80, number: 11, age: 28 },
      // Reserves
      { name: 'دیوید اوسپینا', position: 'GK', rating: 75, number: 1, age: 37 },
      { name: 'یری مینا', position: 'DF', rating: 75, number: 13, age: 31 },
      { name: 'ماتئوس اوریبه', position: 'MF', rating: 76, number: 15, age: 35 },
      { name: 'لوئیس سینیسترا', position: 'FW', rating: 78, number: 18, age: 26 }
    ]
  },
  't-gha': {
    coach: 'اوتو ادو',
    formation: '4-3-3',
    players: [
      { name: 'لارنس آتی-زیگی', position: 'GK', rating: 75, number: 1, age: 29 },
      { name: 'محمد سالیسو', position: 'DF', rating: 78, number: 22, age: 27 },
      { name: 'الکساندر جیکو', position: 'DF', rating: 77, number: 23, age: 31 },
      { name: 'طارق لمپتی', position: 'DF', rating: 75, number: 2, age: 25 },
      { name: 'آلیدو سیدو', position: 'DF', rating: 76, number: 5, age: 25 },
      { name: 'محمد قدوس', position: 'MF', rating: 84, number: 20, age: 25 },
      { name: 'توماس پارتی', position: 'MF', rating: 80, number: 4, age: 32 },
      { name: 'سالیس عبدالصمد', position: 'MF', rating: 76, number: 6, age: 26 },
      { name: 'اینیاکی ویلیامز', position: 'FW', rating: 82, number: 19, age: 31 },
      { name: 'آنتوان سمینیو', position: 'FW', rating: 78, number: 25, age: 26 },
      { name: 'جوردن آیو', position: 'FW', rating: 76, number: 9, age: 34 },
      // Reserves
      { name: 'جوزف وولاکات', position: 'GK', rating: 70, number: 12, age: 29 },
      { name: 'عبدالمومن سهول', position: 'DF', rating: 74, number: 15, age: 27 },
      { name: 'الیشا اووسو', position: 'MF', rating: 74, number: 18, age: 28 },
      { name: 'ارنست نوآمه', position: 'FW', rating: 76, number: 11, age: 22 }
    ]
  },
  't-pan': {
    coach: 'توماس کریستیانسن',
    formation: '4-3-3',
    players: [
      { name: 'اورلاندو موسکرا', position: 'GK', rating: 71, number: 22, age: 31 },
      { name: 'مایکل موریو', position: 'DF', rating: 75, number: 2, age: 30 },
      { name: 'خوزه کوردوبا', position: 'DF', rating: 72, number: 3, age: 24 },
      { name: 'فیدل اسکوبار', position: 'DF', rating: 71, number: 4, age: 31 },
      { name: 'سزار بلکمن', position: 'DF', rating: 77, number: 23, age: 28 },
      { name: 'آدالبرتو کاراسکیا', position: 'MF', rating: 76, number: 8, age: 27 },
      { name: 'ادگار بارسناس', position: 'MF', rating: 71, number: 10, age: 32 },
      { name: 'کریستین مارتینز', position: 'MF', rating: 70, number: 6, age: 32 },
      { name: 'خوزه فاخاردو', position: 'FW', rating: 72, number: 17, age: 32 },
      { name: 'اسماعیل دیاز', position: 'FW', rating: 71, number: 7, age: 29 },
      { name: 'ادواردو گررو', position: 'FW', rating: 71, number: 9, age: 26 },
      // Reserves
      { name: 'سزار سامودیو', position: 'GK', rating: 67, number: 1, age: 29 },
      { name: 'اریک دیویس', position: 'DF', rating: 70, number: 15, age: 35 },
      { name: 'آبدیل آیارزا', position: 'MF', rating: 69, number: 16, age: 33 },
      { name: 'سسیلیو واترمن', position: 'FW', rating: 70.5, number: 11, age: 32 }
    ]
  }
};

export function getStartingLineupCoordinates(formation: string): { GK: { x: number; y: number }[]; DF: { x: number; y: number }[]; MF: { x: number; y: number }[]; FW: { x: number; y: number }[] } {
  const parts = formation.split('-').map(Number);
  
  let defendersCount = 4;
  let midfieldersCount = 3;
  let strikersCount = 3;

  if (parts.length === 3) {
    defendersCount = parts[0] || 4;
    midfieldersCount = parts[1] || 3;
    strikersCount = parts[2] || 3;
  } else if (parts.length === 4) {
    defendersCount = parts[0] || 4;
    midfieldersCount = (parts[1] || 0) + (parts[2] || 0);
    strikersCount = parts[3] || 1;
  }

  const gkCoords = [{ x: 50, y: 12 }];

  // Defenders Layout
  const dfCoords: { x: number; y: number }[] = [];
  if (defendersCount === 3) {
    dfCoords.push({ x: 25, y: 30 }, { x: 50, y: 26 }, { x: 75, y: 30 });
  } else if (defendersCount === 5) {
    dfCoords.push({ x: 15, y: 34 }, { x: 33, y: 28 }, { x: 50, y: 26 }, { x: 67, y: 28 }, { x: 85, y: 34 });
  } else {
    dfCoords.push({ x: 18, y: 32 }, { x: 38, y: 28 }, { x: 62, y: 28 }, { x: 82, y: 32 });
  }

  // Midfielders Layout
  const mfCoords: { x: number; y: number }[] = [];
  if (midfieldersCount === 2) {
    mfCoords.push({ x: 35, y: 48 }, { x: 65, y: 48 });
  } else if (midfieldersCount === 3) {
    mfCoords.push({ x: 30, y: 55 }, { x: 50, y: 45 }, { x: 70, y: 55 });
  } else if (midfieldersCount === 4) {
    mfCoords.push({ x: 18, y: 56 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 82, y: 56 });
  } else if (midfieldersCount === 5) {
    mfCoords.push({ x: 18, y: 58 }, { x: 35, y: 48 }, { x: 50, y: 58 }, { x: 65, y: 48 }, { x: 82, y: 58 });
  } else {
    for (let i = 0; i < midfieldersCount; i++) {
      const segment = 100 / (midfieldersCount + 1);
      mfCoords.push({ x: Math.round(segment * (i + 1)), y: 50 });
    }
  }

  // Forwards Layout
  const fwCoords: { x: number; y: number }[] = [];
  if (strikersCount === 1) {
    fwCoords.push({ x: 50, y: 85 });
  } else if (strikersCount === 2) {
    fwCoords.push({ x: 35, y: 82 }, { x: 65, y: 82 });
  } else if (strikersCount === 3) {
    fwCoords.push({ x: 20, y: 75 }, { x: 50, y: 85 }, { x: 80, y: 75 });
  } else {
    for (let i = 0; i < strikersCount; i++) {
      const segment = 100 / (strikersCount + 1);
      fwCoords.push({ x: Math.round(segment * (i + 1)), y: 80 });
    }
  }

  return { GK: gkCoords, DF: dfCoords, MF: mfCoords, FW: fwCoords };
}

export function getSquadForTeam(teamId: string, teamName: string): TeamSquad {
  if (SQUADS_DB[teamId]) {
    return SQUADS_DB[teamId];
  }

  // Check if we have high-fidelity real data for this team
  if (REAL_TEAMS_DATA[teamId]) {
    const data = REAL_TEAMS_DATA[teamId];
    const layout = getStartingLineupCoordinates(data.formation);
    
    let gkCount = 0;
    let dfCount = 0;
    let mfCount = 0;
    let fwCount = 0;

    // Dynamically lay out coordinates based on position indices and formation structure
    const players: Player[] = data.players.map((p, idx) => {
      const isStarting = idx < 11;
      let gridPos = { x: 0, y: 0 };
      
      if (isStarting) {
        if (p.position === 'GK') {
          gridPos = layout.GK[gkCount++] || { x: 50, y: 12 };
        } else if (p.position === 'DF') {
          gridPos = layout.DF[dfCount++] || { x: 50, y: 30 };
        } else if (p.position === 'MF') {
          gridPos = layout.MF[mfCount++] || { x: 50, y: 50 };
        } else {
          gridPos = layout.FW[fwCount++] || { x: 50, y: 80 };
        }
      }

      return {
        name: p.name,
        number: p.number,
        position: p.position,
        isStarting,
        gridPos,
        rating: p.rating,
        age: p.age
      };
    });

    // Calculate dynamic state stats cleanly for maximum realistic variety
    const ratings = data.players.map(p => p.rating);
    const overall = Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length);

    return {
      formation: data.formation,
      coach: data.coach,
      strikersCount: data.players.filter(p => p.position === 'FW' && p.number < 15).length,
      midfieldersCount: data.players.filter(p => p.position === 'MF' && p.number < 15).length,
      defendersCount: data.players.filter(p => p.position === 'DF' && p.number < 15).length,
      stats: {
        attack: overall + 2,
        midfield: overall,
        defense: overall - 1,
        overall: overall
      },
      players
    };
  }

  // Fallback to random/generic if somehow not matched
  const baseRating = 75;
  const coach = `سر مربی ${teamName}`;
  const players: Player[] = [
    { name: 'دروازه‌بان اصلی', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, age: 28, rating: baseRating },
    { name: 'مدافع راست', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, age: 26, rating: baseRating },
    { name: 'مدافع چپ', number: 3, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, age: 25, rating: baseRating },
    { name: 'مدافع میانی ۱', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, age: 29, rating: baseRating },
    { name: 'مدافع میانی ۲', number: 5, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, age: 27, rating: baseRating },
    { name: 'هافبک دفاعی', number: 6, position: 'MF', isStarting: true, gridPos: { x: 50, y: 46 }, age: 26, rating: baseRating },
    { name: 'هافبک چپ', number: 8, position: 'MF', isStarting: true, gridPos: { x: 32, y: 56 }, age: 28, rating: baseRating },
    { name: 'هافبک راست', number: 10, position: 'MF', isStarting: true, gridPos: { x: 68, y: 56 }, age: 27, rating: baseRating },
    { name: 'بال راست', number: 7, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, age: 24, rating: baseRating },
    { name: 'بال چپ', number: 11, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, age: 25, rating: baseRating },
    { name: 'مهاجم نوک', number: 9, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, age: 29, rating: baseRating + 2 },
    // Reserves
    { name: 'دروازه‌بان ذخیره', number: 12, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, age: 24, rating: baseRating - 3 },
    { name: 'مدافع ذخیره', number: 15, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, age: 22, rating: baseRating - 2 },
    { name: 'هافبک ذخیره', number: 14, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, age: 23, rating: baseRating - 1 },
    { name: 'مهاجم ذخیره', number: 20, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, age: 21, rating: baseRating }
  ];

  return {
    formation: '4-3-3',
    coach,
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { attack: baseRating, midfield: baseRating, defense: baseRating, overall: baseRating },
    players
  };
}

