export type AppTab = 'home' | 'quran' | 'audio' | 'prayer' | 'qibla' | 'adhkar' | 'tasbih';

export type AppLanguage = 'ar' | 'en' | 'fr' | 'de' | 'tr' | 'ur';

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan' | string;
}

export interface AyahItem {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  hizbQuarter: number;
}

export interface SurahDetail extends SurahSummary {
  ayahs: AyahItem[];
}

export interface MushafPageAyah extends AyahItem {
  surah: SurahSummary;
}

export interface MushafPageData {
  number: number;
  ayahs: MushafPageAyah[];
}

export interface VerseBookmark {
  surahNumber: number;
  surahName: string;
  ayahNumberInSurah: number;
  globalAyahNumber: number;
  text: string;
  page?: number;
  bookmarkType?: 'verse' | 'page';
  savedAt: string;
}

export interface LastReadState {
  surahNumber: number;
  surahName: string;
  ayahNumberInSurah: number;
  page: number;
}

export interface KhatmahState {
  pagesRead: number;
  dailyGoal: number;
  lastUpdatedDate: string;
}

export interface Mp3QuranMoshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
}

export interface Mp3QuranReciter {
  id: number;
  name: string;
  letter?: string;
  moshaf: Mp3QuranMoshaf[];
}

export interface FeaturedReciter {
  id: number;
  name: string;
  style: string;
  server: string;
  surahList: number[];
}

export interface CityPreset {
  id: string;
  nameAr: string;
  countryAr: string;
  latitude: number;
  longitude: number;
}

export type PrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type AdjustablePrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type PrayerOffsets = Record<AdjustablePrayerKey, number>;

export interface PrayerLocationConfig {
  mode: 'preset' | 'gps' | 'custom';
  cityId: string;
  label: string;
  latitude: number;
  longitude: number;
}

export interface PrayerTimingsResponse {
  timings: Record<PrayerKey, string>;
  hijriDateAr: string;
  hijriDateEn?: string;
  gregorianDate: string;
  timezone: string;
}

export interface AdhanSettings {
  adhanAudioEnabled: boolean;
  notificationsEnabled: boolean;
}

export type AdhkarCategory =
  | 'morning'
  | 'evening'
  | 'afterPrayer'
  | 'sleep'
  | 'ruqyah';

export interface DhikrItem {
  id: string;
  category: AdhkarCategory;
  text: string;
  targetCount: number;
  reference: string;
  virtue?: string;
}

export interface SunnahItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  reference: string;
}

export interface TasbihPreset {
  id: string;
  phrase: string;
  defaultTarget: number;
}
