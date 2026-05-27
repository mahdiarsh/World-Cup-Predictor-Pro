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
    stats: { attack: 86, midfield: 81, defense: 79, overall: 82 },
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
      { name: 'سردار آزمون', number: 20, position: 'FW', isStarting: true, gridPos: { x: 62, y: 83 }, club: 'شباب الاهلی', age: 31, rating: 84 },
      // Reserves
      { name: 'پیام نیازمند', number: 22, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'سپاهان', age: 31, rating: 75 },
      { name: 'علی قلی‌زاده', number: 17, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لخ پوزنان', age: 30, rating: 78 },
      { name: 'محمد محبی', number: 8, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'روستوف', age: 27, rating: 80 },
      { name: 'امید نورافکن', number: 21, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'ملوان', age: 29, rating: 77 },
      { name: 'آریا یوسفی', number: 18, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'سپاهان', age: 24, rating: 75 }
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

// Realistic name pools for automatic generation
const G_SURNAMES: Record<string, string[]> = {
  't-mex': ['هرناندز', 'رودریگز', 'مارتینز', 'لوپز', 'گونزالس', 'پرز', 'سانچز', 'رامیرز', 'فلورس', 'گومز', 'دیاس', 'آلوارز'],
  't-ita': ['دوناروما', 'باستونی', 'بارلا', 'کیه‌زا', 'پلگرینی', 'دیمارکو', 'جورجینیو', 'لوکاتلی', 'اسکالاوینی', 'رتگی'],
  't-jpn': ['تاناکا', 'سوزوکی', 'واتانابه', 'ایتو', 'ناکامورا', 'کوبو', 'مینامینو', 'اندو', 'میتوما', 'تومیاسو', 'یوشیدا'],
  't-kor': ['کیم', 'لی', 'پارک', 'سون', 'هوانگ', 'چوی', 'جونگ', 'کانگ', 'چو', 'مین'],
  't-ksa': ['الدوسری', 'الشهری', 'الفرج', 'الغنام', 'المولد', 'الخیبری', 'العمری', 'کنو', 'البریک', 'القرنی'],
  't-can': ['دیویس', 'دیوید', 'لارین', 'اوستاکیو', 'میلار', 'جانستون', 'کونالی', 'بومبیتو', 'کربو', 'میلر'],
  't-cro': ['مودریچ', 'کواچیچ', 'بروژوویچ', 'پریشیچ', 'ک Kramaric', 'گوواردیول', 'سوتالو', 'لیلواکوویچ', 'پاشالیچ', 'بودیمیر'],
  't-uru': ['والورده', 'نونیز', 'آراخو', 'بنتانکور', 'اوگارته', 'خیمنز', 'پلیستری', 'الیویرا', 'روچت', 'سوارز'],
  't-bel': ['لوکاکو', 'دی‌بروینه', 'دوکو', 'تیلمانس', 'اونانا', 'کاستانی', 'فائس', 'ورتمان', 'کاستیلز', 'تروسار'],
  't-col': ['دیاز', 'خامس', 'رپوسو', 'آریاس', 'لرمه', 'مونوز', 'داوینسون', 'کوروبا', 'وارگاس', 'ریوس'],
  't-egy': ['صلاح', 'مرموش', 'مصطفی', 'الننی', 'فتوحی', 'تريزيگه', 'حجازي', 'الشناوي', 'عاشور', 'مروان']
};

export function getSquadForTeam(teamId: string, teamName: string): TeamSquad {
  if (SQUADS_DB[teamId]) {
    return SQUADS_DB[teamId];
  }

  // Generate deterministic squad based on teamId
  const rId = teamId.replace('t-', '');
  
  // Real coaches name pool based on teamId
  const COACHES: Record<string, string> = {
    't-ita': 'لوچیانو اسپالتی',
    't-bel': 'دومنیکو تدسکو',
    't-uru': 'مارسلو بیلسا',
    't-cro': 'زلاتکو دالیچ',
    't-mex': 'خاویر آگیره',
    't-col': 'نستور لورنزو',
    't-egy': 'حسام حسن',
    't-can': 'جسی مارش',
    't-jpn': 'هاجیمه موریاسو',
    't-kor': 'هونگ میونگ-بو',
    't-ksa': 'روبرتو مانچینی'
  };

  const coach = COACHES[teamId] || `پدرو ${teamName}‌زاده`;
  const surnames = G_SURNAMES[teamId] || ['سیلوا', 'سانتوس', 'اسمیت', 'مولر', 'مارتینز', 'جونز', 'علی', 'رضایی', 'روسی', 'دمبله'];
  const baseRating = teamId === 't-ita' || teamId === 't-bel' || teamId === 't-uru' || teamId === 't-cro' ? 84 : 76;

  // Real first names list depending on country/continent or general latin/eastern names
  let firstNames = ['ماتئو', 'آندرس', 'توماس', 'لوکاس', 'الکس', 'مارکوس', 'دنیل', 'فیلیپ', 'نیکولاس', 'کریستیان', 'دیگو'];
  if (teamId === 't-jpn') {
    firstNames = ['کیوگو', 'جونیا', 'تاکومى', 'کوتارو', 'شوهی', 'ریوتارو', 'دایکی', 'هیروکی', 'یوشى', 'کنتو', 'تومویا'];
  } else if (teamId === 't-kor') {
    firstNames = ['هیونگ', 'کیو', 'سئونگ', 'مین', 'هو', 'بوم', 'جه', 'دونگ', 'وون', 'هو', 'جون'];
  } else if (teamId === 't-ksa') {
    firstNames = ['سالم', 'صالح', 'عبدالله', 'یاسر', 'فهد', 'سعود', 'سلطان', 'عبدالرحمن', 'علی', 'محمد', 'حسن'];
  } else if (teamId === 't-egy') {
    firstNames = ['مصطفی', 'احمد', 'محمد', 'اسامه', 'عمر', 'طارق', 'حسین', 'محمود', 'کریم', 'عمرو', 'رمضان'];
  }

  const players: Player[] = [
    // Starting 11 players
    { name: '', number: 1, position: 'GK', isStarting: true, gridPos: { x: 50, y: 12 }, club: 'باشگاه بزرگ اروپا', age: 29, rating: baseRating + 2 },
    { name: '', number: 2, position: 'DF', isStarting: true, gridPos: { x: 82, y: 32 }, club: 'لیگ داخلی ممتاز', age: 27, rating: baseRating },
    { name: '', number: 3, position: 'DF', isStarting: true, gridPos: { x: 18, y: 32 }, club: 'لیگ داخلی ممتاز', age: 26, rating: baseRating },
    { name: '', number: 4, position: 'DF', isStarting: true, gridPos: { x: 38, y: 28 }, club: 'لژیونر معتبر', age: 28, rating: baseRating + 1 },
    { name: '', number: 5, position: 'DF', isStarting: true, gridPos: { x: 62, y: 28 }, club: 'لژیونر معتبر', age: 31, rating: baseRating - 1 },
    { name: '', number: 6, position: 'MF', isStarting: true, gridPos: { x: 50, y: 46 }, club: 'لیگ داخلی ممتاز', age: 25, rating: baseRating },
    { name: '', number: 8, position: 'MF', isStarting: true, gridPos: { x: 32, y: 56 }, club: 'لژیونر معتبر', age: 28, rating: baseRating + 2 },
    { name: '', number: 10, position: 'MF', isStarting: true, gridPos: { x: 68, y: 56 }, club: 'لژیونر معتبر', age: 27, rating: baseRating + 3 },
    { name: '', number: 17, position: 'FW', isStarting: true, gridPos: { x: 80, y: 75 }, club: 'لژیونر اروپا', age: 24, rating: baseRating + 1 },
    { name: '', number: 11, position: 'FW', isStarting: true, gridPos: { x: 20, y: 75 }, club: 'لژیونر اروپا', age: 25, rating: baseRating + 2 },
    { name: '', number: 9, position: 'FW', isStarting: true, gridPos: { x: 50, y: 85 }, club: 'باشگاه طراز اول', age: 29, rating: baseRating + 4 },

    // Reserves
    { name: '', number: 12, position: 'GK', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیگ ممتاز', age: 24, rating: baseRating - 3 },
    { name: '', number: 15, position: 'DF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیگ ممتاز', age: 22, rating: baseRating - 2 },
    { name: '', number: 14, position: 'MF', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لیگ ممتاز', age: 23, rating: baseRating - 1 },
    { name: '', number: 20, position: 'FW', isStarting: false, gridPos: { x: 0, y: 0 }, club: 'لژیونر خارج', age: 21, rating: baseRating }
  ];

  // Customize names with typical country surnames and first names deterministically
  players.forEach((p, idx) => {
    const sName = surnames[idx % surnames.length];
    const fName = firstNames[idx % firstNames.length];
    p.name = `${fName} ${sName}`;
  });

  return {
    formation: '4-3-3',
    coach,
    strikersCount: 3,
    midfieldersCount: 3,
    defendersCount: 4,
    stats: { 
      attack: baseRating + 2, 
      midfield: baseRating + 1, 
      defense: baseRating, 
      overall: Math.round((baseRating * 3 + 3) / 3) 
    },
    players
  };
}
