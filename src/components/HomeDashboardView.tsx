import React from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Fingerprint,
  Headphones,
  HeartHandshake,
} from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum, getLanguageMeta } from '../i18n/translations';
import type { AppLanguage, AppTab, KhatmahState, LastReadState } from '../types/islamic';
import type { NextPrayerInfo } from '../utils/prayerLogic';
import { calculateKhatmahStats, TOTAL_QURAN_PAGES } from '../utils/quranLogic';

interface HomeDashboardViewProps {
  onNavigate: (tab: AppTab) => void;
  nextPrayer: NextPrayerInfo;
  khatmah: KhatmahState;
  lastRead: LastReadState;
  currentSurahNumber: number;
  isPlaying: boolean;
  qiblaBearing: number;
  tasbihCount: number;
  completedAdhkarCount: number;
  totalAdhkarCount: number;
  language: AppLanguage;
  t: TranslationStrings;
}

interface MinimalTile {
  id: Exclude<AppTab, 'home'>;
  title: string;
  badge: string;
  active?: boolean;
  icon: React.FC<{ className?: string }>;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigate,
  nextPrayer,
  khatmah,
  lastRead,
  currentSurahNumber,
  isPlaying,
  qiblaBearing,
  tasbihCount,
  completedAdhkarCount,
  totalAdhkarCount,
  language,
  t,
}) => {
  const khatmahStats = calculateKhatmahStats(khatmah.pagesRead, khatmah.dailyGoal);
  const nextPrayerName = t.prayers[nextPrayer.nextKey];
  const isRtl = getLanguageMeta(language).dir === 'rtl';
  const ResumeArrow = isRtl ? ChevronLeft : ChevronRight;
  const savedPage = lastRead.page || 1;
  const resumeLabel = t.home.continueReadingFromPage.replace(
    '{page}',
    formatNum(savedPage, language)
  );

  const tiles: MinimalTile[] = [
    {
      id: 'quran',
      title: t.home.shortTiles.quran,
      badge: formatNum(savedPage, language),
      icon: BookOpen,
    },
    {
      id: 'audio',
      title: t.home.shortTiles.audio,
      badge: formatNum(currentSurahNumber, language),
      active: isPlaying,
      icon: Headphones,
    },
    {
      id: 'prayer',
      title: t.home.shortTiles.prayer,
      badge: nextPrayer.nextTimeFormatted,
      icon: Clock,
    },
    {
      id: 'qibla',
      title: t.home.shortTiles.qibla,
      badge: `${Math.round(qiblaBearing)}°`,
      icon: Compass,
    },
    {
      id: 'adhkar',
      title: t.home.shortTiles.adhkar,
      badge: `${formatNum(completedAdhkarCount, language)}/${formatNum(totalAdhkarCount, language)}`,
      icon: HeartHandshake,
    },
    {
      id: 'tasbih',
      title: t.home.shortTiles.tasbih,
      badge: formatNum(tasbihCount, language),
      icon: Fingerprint,
    },
  ];

  return (
    <div className="space-y-5 md:space-y-7">
      {/* Sleek Quick-Resume Reading Banner */}
      <button
        type="button"
        data-testid="home-resume-banner"
        onClick={() => onNavigate('quran')}
        className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-start transition-all duration-150 hover:bg-white/[0.07] active:scale-[0.99]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-[#F4F4F5] md:text-sm">
              {resumeLabel}
            </div>
            <div className="truncate text-[11px] text-[#71717A]">
              {lastRead.surahName} · {t.quran.ayahShort} {formatNum(lastRead.ayahNumberInSurah || 1, language)}
            </div>
          </div>
        </div>
        <ResumeArrow className="h-4 w-4 shrink-0 text-[#10B981]" />
      </button>

      {/* Borderless Hero Prayer Spotlight + Subtle One-Line Khatmah Bar */}
      <section
        aria-label={t.home.nextPrayer}
        className="relative overflow-hidden rounded-3xl bg-white/[0.04] px-6 py-7 md:px-10 md:py-9"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 start-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-3xl"
        />

        <div className="relative flex flex-col items-center text-center">
          <button
            type="button"
            onClick={() => onNavigate('prayer')}
            className="group flex flex-col items-center rounded-2xl px-4 py-1 transition-transform duration-150 active:scale-[0.98]"
          >
            <span className="text-xs font-medium text-[#71717A]">
              {t.home.nextPrayer}
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#10B981] md:text-3xl">
              {nextPrayerName}
            </h1>
            <div
              data-testid="home-prayer-countdown"
              className="mt-2 text-5xl font-bold tracking-tight text-[#F4F4F5] tabular-nums md:text-6xl"
            >
              {nextPrayer.formattedCountdown}
            </div>
          </button>

          {/* Subtle One-Line Khatmah Progress Bar */}
          <button
            type="button"
            onClick={() => onNavigate('quran')}
            aria-label={t.home.khatmahTitle}
            className="mt-7 w-full max-w-md space-y-2 rounded-xl px-2 py-1 text-start transition-transform duration-150 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-[#71717A] tabular-nums">
              <span>{t.home.khatmahTitle}</span>
              <span>
                {formatNum(khatmah.pagesRead, language)} / {formatNum(TOTAL_QURAN_PAGES, language)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all duration-700 ease-out"
                style={{ width: `${khatmahStats.percentage}%` }}
              />
            </div>
          </button>
        </div>
      </section>

      {/* Clean 2x3 Compact Tile Grid */}
      <section aria-label={t.brandName}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => onNavigate(tile.id)}
                data-testid={`bento-tile-${tile.id}`}
                className="group flex min-h-[126px] md:min-h-[144px] flex-col justify-between rounded-3xl bg-white/[0.04] p-5 text-start transition-all duration-150 hover:bg-white/[0.07] active:scale-[0.97]"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors duration-150 ${
                      tile.active
                        ? 'bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-white/[0.06] text-[#10B981] group-hover:bg-[#10B981]/15'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span
                    className={`text-xs font-medium tabular-nums whitespace-nowrap ${
                      tile.active ? 'text-[#10B981]' : 'text-[#71717A]'
                    }`}
                  >
                    {tile.badge}
                  </span>
                </div>

                <h2 className="mt-4 text-base font-bold tracking-tight text-[#F4F4F5] md:text-lg">
                  {tile.title}
                </h2>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
