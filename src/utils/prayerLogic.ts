import type { AdjustablePrayerKey, PrayerKey, PrayerOffsets } from '../types/islamic';

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export const PRAYER_LABELS_AR: Record<PrayerKey, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export const ORDERED_PRAYER_KEYS: PrayerKey[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

export const OBLIGATORY_PRAYER_KEYS: AdjustablePrayerKey[] = [
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

export const DEFAULT_PRAYER_OFFSETS: PrayerOffsets = {
  Fajr: 0,
  Dhuhr: 0,
  Asr: 0,
  Maghrib: 0,
  Isha: 0,
};

export interface CalculationMethodOption {
  id: number;
  nameAr: string;
  subtitleAr: string;
}

export const CALCULATION_METHODS: CalculationMethodOption[] = [
  { id: 19, nameAr: 'وزارة الشؤون الدينية الجزائرية', subtitleAr: 'المعتمد في الجزائر (18° / 17°)' },
  { id: 3, nameAr: 'رابطة العالم الإسلامي (MWL)', subtitleAr: 'الفجر 18° · العشاء 17°' },
  { id: 4, nameAr: 'جامعة أم القرى (مكة المكرمة)', subtitleAr: 'الفجر 18.5° · العشاء 90 دقيقة' },
  { id: 5, nameAr: 'الهيئة المصرية العامة للمساحة', subtitleAr: 'الفجر 19.5° · العشاء 17.5°' },
  { id: 2, nameAr: 'الجمعية الإسلامية بأمريكا الشمالية (ISNA)', subtitleAr: 'الفجر 15° · العشاء 15°' },
];

export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(latitude);
  const lon1 = toRad(longitude);
  const lat2 = toRad(KAABA_LAT);
  const lon2 = toRad(KAABA_LON);

  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return Math.round(bearing * 10) / 10;
}

export function calculateDistanceToKaabaKm(latitude: number, longitude: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(KAABA_LAT - latitude);
  const dLon = toRad(KAABA_LON - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latitude)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getLocalizedCompassDirection(bearing: number, directions8: string[]): string {
  const normalized = ((bearing % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions8[index] ?? directions8[0] ?? '';
}

export function getQiblaCompassDirectionAr(bearing: number): string {
  return getLocalizedCompassDirection(bearing, [
    'الشمال',
    'الشمال الشرقي',
    'الشرق',
    'الجنوب الشرقي',
    'الجنوب',
    'الجنوب الغربي',
    'الغرب',
    'الشمال الغربي',
  ]);
}

export interface CompassRotationResult {
  roseRotation: number;
  needleRotation: number;
  angularDiff: number;
  isAligned: boolean;
}

export function normalizeCompassAngle(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return ((deg % 360) + 360) % 360;
}

export function calculateCompassRotation(
  qiblaBearing: number,
  deviceHeadingDeg: number | null
): CompassRotationResult {
  const heading = deviceHeadingDeg !== null ? normalizeCompassAngle(deviceHeadingDeg) : 0;
  const roseRotation = heading === 0 ? 0 : -heading;
  const needleRotation = normalizeCompassAngle(qiblaBearing - heading);
  const angularDiff = Math.min(needleRotation, 360 - needleRotation);
  return {
    roseRotation,
    needleRotation,
    angularDiff: Math.round(angularDiff * 10) / 10,
    isAligned: deviceHeadingDeg !== null ? angularDiff <= 5 : angularDiff <= 5,
  };
}

export function cleanPrayerTimeStr(raw: string): string {
  const match = raw.match(/(\d{1,2}:\d{2})/);
  return match ? match[1].padStart(5, '0') : '00:00';
}

export function shiftTimeMinutes(timeStr: string, offsetMinutes: number): string {
  const cleaned = cleanPrayerTimeStr(timeStr);
  const [hStr, mStr] = cleaned.split(':');
  const clampedOffset = Math.max(-15, Math.min(15, Math.round(offsetMinutes)));
  const totalMinutes = (Number(hStr) * 60 + Number(mStr) + clampedOffset + 1440) % 1440;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function applyPrayerTimeOffsets(
  timings: Record<PrayerKey, string>,
  offsets: PrayerOffsets
): Record<PrayerKey, string> {
  return {
    Fajr: shiftTimeMinutes(timings.Fajr, offsets.Fajr ?? 0),
    Sunrise: cleanPrayerTimeStr(timings.Sunrise),
    Dhuhr: shiftTimeMinutes(timings.Dhuhr, offsets.Dhuhr ?? 0),
    Asr: shiftTimeMinutes(timings.Asr, offsets.Asr ?? 0),
    Maghrib: shiftTimeMinutes(timings.Maghrib, offsets.Maghrib ?? 0),
    Isha: shiftTimeMinutes(timings.Isha, offsets.Isha ?? 0),
  };
}

export function parsePrayerTimeForDate(timeStr: string, baseDate: Date): Date {
  const cleaned = cleanPrayerTimeStr(timeStr);
  const [hoursStr, minutesStr] = cleaned.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const target = new Date(baseDate.getTime());
  target.setHours(hours, minutes, 0, 0);
  return target;
}

export interface NextPrayerInfo {
  nextKey: PrayerKey;
  nextNameAr: string;
  nextTimeFormatted: string;
  remainingSeconds: number;
  formattedCountdown: string;
}

export function formatCountdownSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getNextPrayerInfo(
  timings: Record<PrayerKey, string>,
  now: Date
): NextPrayerInfo {
  for (const key of OBLIGATORY_PRAYER_KEYS) {
    const candidate = parsePrayerTimeForDate(timings[key], now);
    if (candidate.getTime() > now.getTime()) {
      const remainingSeconds = Math.max(0, Math.floor((candidate.getTime() - now.getTime()) / 1000));
      return {
        nextKey: key,
        nextNameAr: PRAYER_LABELS_AR[key],
        nextTimeFormatted: cleanPrayerTimeStr(timings[key]),
        remainingSeconds,
        formattedCountdown: formatCountdownSeconds(remainingSeconds),
      };
    }
  }

  const tomorrow = new Date(now.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextFajr = parsePrayerTimeForDate(timings.Fajr, tomorrow);
  const remainingSeconds = Math.max(0, Math.floor((nextFajr.getTime() - now.getTime()) / 1000));
  return {
    nextKey: 'Fajr',
    nextNameAr: PRAYER_LABELS_AR.Fajr,
    nextTimeFormatted: cleanPrayerTimeStr(timings.Fajr),
    remainingSeconds,
    formattedCountdown: formatCountdownSeconds(remainingSeconds),
  };
}
