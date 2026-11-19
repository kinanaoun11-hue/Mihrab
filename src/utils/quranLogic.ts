import type { AyahItem, FeaturedReciter, Mp3QuranReciter, MushafPageAyah, MushafPageData, SurahSummary } from '../types/islamic';

export const TOTAL_QURAN_PAGES = 604;

export const MIN_QURAN_FONT_SIZE = 18;
export const MAX_QURAN_FONT_SIZE = 44;
export const DEFAULT_QURAN_FONT_SIZE = 26;
export const QURAN_FONT_STEP = 2;

export const MIN_QURAN_FONT_ZOOM = -4;
export const MAX_QURAN_FONT_ZOOM = 12;
export const QURAN_FONT_ZOOM_STEP = 2;

export function clampQuranFontSize(size: number): number {
  if (!Number.isFinite(size)) return DEFAULT_QURAN_FONT_SIZE;
  return Math.max(MIN_QURAN_FONT_SIZE, Math.min(MAX_QURAN_FONT_SIZE, Math.round(size)));
}

export function stepQuranFontSize(current: number, delta: number): number {
  const safeCurrent = clampQuranFontSize(current);
  return clampQuranFontSize(safeCurrent + delta);
}

export function clampQuranFontZoom(zoomOffset: number): number {
  if (!Number.isFinite(zoomOffset)) return 0;
  return Math.max(MIN_QURAN_FONT_ZOOM, Math.min(MAX_QURAN_FONT_ZOOM, Math.round(zoomOffset)));
}

export function stepQuranFontZoom(currentOffset: number, delta: number): number {
  const safeCurrent = clampQuranFontZoom(currentOffset);
  return clampQuranFontZoom(safeCurrent + delta);
}

/**
 * Resolves a horizontal touch swipe gesture (dx = endX - startX, dy = endY - startY)
 * into a Mushaf page delta (-1, 0, or +1) respecting RTL/LTR reading direction.
 */
export function resolveSwipePageDelta(
  dx: number,
  dy: number,
  dir: 'rtl' | 'ltr',
  thresholdPx = 48
): -1 | 0 | 1 {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 0;
  if (Math.abs(dx) < thresholdPx) return 0;
  if (Math.abs(dx) < Math.abs(dy) * 1.2) return 0;
  if (dir === 'rtl') {
    // RTL Mushaf: Next page sits on the left; swipe right (dx > 0) turns to Next (+1), swipe left (dx < 0) goes Prev (-1)
    return dx > 0 ? 1 : -1;
  }
  // LTR: Next page sits on the right; swipe left (dx < 0) turns to Next (+1), swipe right (dx > 0) goes Prev (-1)
  return dx < 0 ? 1 : -1;
}

// Exact Madinah Mushaf starting page (1..604) for each Surah (1..114)
export const SURAH_START_PAGES: readonly number[] = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208,
  221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404,
  411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518,
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568,
  570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594,
  595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603,
  603, 604, 604, 604,
];

export function getSurahStartPage(surahNumber: number): number {
  const idx = Math.max(1, Math.min(114, Math.floor(surahNumber))) - 1;
  return SURAH_START_PAGES[idx] ?? 1;
}

export function clampQuranPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.min(TOTAL_QURAN_PAGES, Math.floor(page)));
}

export function getHizbNumber(hizbQuarter: number): number {
  if (!Number.isFinite(hizbQuarter) || hizbQuarter <= 0) return 1;
  return Math.ceil(hizbQuarter / 4);
}

const BISMILLAH_PREFIX_RE =
  /^\s*بِسْمِ\s+[ٱا]للَّهِ\s+[ٱا]لرَّحْمَٰ?نِ\s+[ٱا]لرَّحِيمِ\s*/u;

export function stripBismillahPrefix(
  text: string,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahNumberInSurah !== 1) {
    return text;
  }
  const stripped = text.replace(BISMILLAH_PREFIX_RE, '').trim();
  return stripped.length > 0 ? stripped : text;
}

export interface MushafSurahGroup {
  surah: SurahSummary;
  ayahs: MushafPageAyah[];
}

export function groupPageAyahsBySurah(ayahs: MushafPageAyah[]): MushafSurahGroup[] {
  const groups: MushafSurahGroup[] = [];
  for (const ayah of ayahs) {
    const last = groups[groups.length - 1];
    if (last && last.surah.number === ayah.surah.number) {
      last.ayahs.push(ayah);
    } else {
      groups.push({
        surah: ayah.surah,
        ayahs: [ayah],
      });
    }
  }
  return groups;
}

export interface FullQuranApiSurah extends Omit<SurahSummary, 'numberOfAyahs'> {
  numberOfAyahs?: number;
  ayahs: AyahItem[];
}

export interface FullQuranBundle {
  surahs: SurahSummary[];
  pages: Record<number, MushafPageData>;
  pageCount: number;
}

export function buildMushafPagesFromFullQuran(apiSurahs: FullQuranApiSurah[]): FullQuranBundle {
  const surahs: SurahSummary[] = [];
  const pages: Record<number, MushafPageData> = {};

  for (const rawSurah of apiSurahs) {
    const ayahs = Array.isArray(rawSurah.ayahs) ? rawSurah.ayahs : [];
    const summary: SurahSummary = {
      number: rawSurah.number,
      name: rawSurah.name,
      englishName: rawSurah.englishName,
      englishNameTranslation: rawSurah.englishNameTranslation,
      numberOfAyahs:
        typeof rawSurah.numberOfAyahs === 'number' && Number.isFinite(rawSurah.numberOfAyahs)
          ? rawSurah.numberOfAyahs
          : ayahs.length,
      revelationType: rawSurah.revelationType,
    };
    surahs.push(summary);

    for (const ayah of ayahs) {
      const pageNum = clampQuranPage(ayah.page);
      if (!pages[pageNum]) {
        pages[pageNum] = { number: pageNum, ayahs: [] };
      }
      pages[pageNum].ayahs.push({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        page: pageNum,
        hizbQuarter: ayah.hizbQuarter,
        surah: summary,
      });
    }
  }

  for (const pageKey of Object.keys(pages)) {
    const pageNum = Number(pageKey);
    pages[pageNum].ayahs.sort((a, b) => a.number - b.number);
  }

  return {
    surahs,
    pages,
    pageCount: Object.keys(pages).length,
  };
}

export interface KhatmahStats {
  percentage: number;
  remainingPages: number;
  estimatedDays: number;
  isCompleted: boolean;
}

export function calculateKhatmahStats(pagesRead: number, dailyGoal: number): KhatmahStats {
  const safePages = Math.max(0, Math.min(TOTAL_QURAN_PAGES, Math.floor(pagesRead)));
  const safeGoal = Math.max(1, Math.floor(dailyGoal));
  const remainingPages = Math.max(0, TOTAL_QURAN_PAGES - safePages);
  const percentage = Math.round((safePages / TOTAL_QURAN_PAGES) * 100);
  const estimatedDays = remainingPages === 0 ? 0 : Math.ceil(remainingPages / safeGoal);
  return {
    percentage,
    remainingPages,
    estimatedDays,
    isCompleted: remainingPages === 0,
  };
}

export function formatSurahAudioUrl(serverUrl: string, surahNumber: number): string {
  const normalizedServer = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
  const padded = String(Math.max(1, Math.min(114, surahNumber))).padStart(3, '0');
  return `${normalizedServer}${padded}.mp3`;
}

export function toArabicDigits(input: number | string): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(input).replace(/\d/g, (d) => map[Number(d)] ?? d);
}

const TARGET_RECITER_KEYWORDS: { anyOf: string[][] }[] = [
  { anyOf: [['المنشاوي']] },
  { anyOf: [['الحصري']] },
  { anyOf: [['العفاسي']] },
  { anyOf: [['ياسر', 'الدوسري']] },
  { anyOf: [['ماهر', 'المعيقلي']] },
  { anyOf: [['عبدالباسط'], ['عبد الباسط']] },
];

export function extractFeaturedReciters(apiReciters: Mp3QuranReciter[]): FeaturedReciter[] {
  const results: FeaturedReciter[] = [];
  const usedIds = new Set<number>();

  for (const target of TARGET_RECITER_KEYWORDS) {
    const match = apiReciters.find((reciter) => {
      if (usedIds.has(reciter.id)) return false;
      const normalized = reciter.name.replace(/\s+/g, ' ').trim();
      return target.anyOf.some((group) => group.every((kw) => normalized.includes(kw)));
    });

    if (match && match.moshaf && match.moshaf.length > 0) {
      // Prefer Hafs Murattal with maximum surahs
      const sortedMoshaf = [...match.moshaf].sort((a, b) => {
        const aScore = (a.name.includes('مرتل') ? 1000 : 0) + a.surah_total;
        const bScore = (b.name.includes('مرتل') ? 1000 : 0) + b.surah_total;
        return bScore - aScore;
      });
      const chosen = sortedMoshaf[0];
      if (chosen?.server) {
        usedIds.add(match.id);
        results.push({
          id: match.id,
          name: match.name,
          style: chosen.name,
          server: chosen.server,
          surahList: chosen.surah_list
            .split(',')
            .map((s) => Number(s.trim()))
            .filter((n) => Number.isFinite(n) && n >= 1 && n <= 114),
        });
      }
    }
  }

  return results;
}
