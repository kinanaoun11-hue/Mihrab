import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Loader2,
  Pause,
  Play,
  Search,
  Volume2,
} from 'lucide-react';
import { FALLBACK_FEATURED_RECITERS, FALLBACK_SURAH_LIST } from '../data/adhkarData';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum } from '../i18n/translations';
import type {
  AppLanguage,
  FeaturedReciter,
  Mp3QuranReciter,
  SurahSummary,
} from '../types/islamic';
import { extractFeaturedReciters } from '../utils/quranLogic';

interface RecitationsViewProps {
  selectedReciter: FeaturedReciter;
  onSelectReciter: (reciter: FeaturedReciter) => void;
  currentSurahNumber: number;
  isPlaying: boolean;
  playbackRate: number;
  onCycleSpeed: () => void;
  onPrevSurah: () => void;
  onNextSurah: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onPlaySurahWithReciter: (reciter: FeaturedReciter, surahNumber: number) => void;
  reciterVolume: number;
  onChangeReciterVolume: (vol: number) => void;
  language: AppLanguage;
  dir: 'rtl' | 'ltr';
  t: TranslationStrings['audio'];
}

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const RecitationsView: React.FC<RecitationsViewProps> = ({
  selectedReciter,
  onSelectReciter,
  currentSurahNumber,
  isPlaying,
  playbackRate,
  onCycleSpeed,
  onPrevSurah,
  onNextSurah,
  currentTime,
  duration,
  onSeek,
  onPlaySurahWithReciter,
  reciterVolume,
  onChangeReciterVolume,
  language,
  dir,
  t,
}) => {
  const [featuredReciters, setFeaturedReciters] = useState<FeaturedReciter[]>(
    FALLBACK_FEATURED_RECITERS
  );
  const [allReciters, setAllReciters] = useState<FeaturedReciter[]>([]);
  const [surahs, setSurahs] = useState<SurahSummary[]>(FALLBACK_SURAH_LIST);
  const [loadingReciters, setLoadingReciters] = useState(true);
  const [surahFilter, setSurahFilter] = useState('');
  const [reciterSearch, setReciterSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setLoadingReciters(true);
      try {
        const [recRes, surahRes] = await Promise.all([
          fetch('https://www.mp3quran.net/api/v3/reciters?language=ar'),
          fetch('https://api.alquran.cloud/v1/surah'),
        ]);

        if (recRes.ok) {
          const recJson = (await recRes.json()) as { reciters?: Mp3QuranReciter[] };
          if (!cancelled && Array.isArray(recJson.reciters)) {
            const matchedFeatured = extractFeaturedReciters(recJson.reciters);
            if (matchedFeatured.length > 0) {
              setFeaturedReciters(matchedFeatured);
            }
            const parsedAll: FeaturedReciter[] = recJson.reciters
              .filter((r) => r.moshaf && r.moshaf.length > 0 && r.moshaf[0].server)
              .slice(0, 60)
              .map((r) => ({
                id: r.id,
                name: r.name,
                style: r.moshaf[0].name,
                server: r.moshaf[0].server,
                surahList: r.moshaf[0].surah_list
                  .split(',')
                  .map((s) => Number(s.trim()))
                  .filter((n) => Number.isFinite(n)),
              }));
            setAllReciters(parsedAll);
          }
        }

        if (surahRes.ok) {
          const surahJson = (await surahRes.json()) as { data?: SurahSummary[] };
          if (!cancelled && Array.isArray(surahJson.data)) {
            setSurahs(surahJson.data);
          }
        }
      } catch {
        // Offline / fallback already loaded
      } finally {
        if (!cancelled) setLoadingReciters(false);
      }
    };

    void loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayedReciters = useMemo(() => {
    const q = reciterSearch.trim();
    if (!q) return featuredReciters;
    const pool = allReciters.length > 0 ? allReciters : featuredReciters;
    return pool.filter((r) => r.name.includes(q));
  }, [reciterSearch, featuredReciters, allReciters]);

  const filteredSurahs = useMemo(() => {
    const availableSet = new Set(
      selectedReciter.surahList.length > 0
        ? selectedReciter.surahList
        : Array.from({ length: 114 }, (_, i) => i + 1)
    );
    const q = surahFilter.trim();
    return surahs.filter((s) => {
      if (!availableSet.has(s.number)) return false;
      if (!q) return true;
      return (
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q.toLowerCase()) ||
        String(s.number) === q
      );
    });
  }, [surahs, selectedReciter, surahFilter]);

  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      {/* Reciters Directory */}
      <section className="rounded-3xl bg-white/[0.04] p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#F4F4F5] md:text-xl">{t.title}</h1>
            <p className="mt-0.5 text-xs text-[#71717A]">{t.subtitle}</p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input
              type="search"
              value={reciterSearch}
              onChange={(e) => setReciterSearch(e.target.value)}
              placeholder={t.searchReciter}
              aria-label={t.searchReciter}
              className="w-full rounded-2xl bg-white/[0.05] py-2.5 ps-9 pe-3 text-xs text-[#F4F4F5] placeholder:text-[#71717A] focus:bg-white/[0.08] focus:outline-none"
            />
          </div>
        </div>

        {loadingReciters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#71717A]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#10B981]" />
            <span>{t.updatingReciters}</span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedReciters.map((reciter) => {
            const active = reciter.id === selectedReciter.id;
            return (
              <button
                key={reciter.id}
                type="button"
                onClick={() => onSelectReciter(reciter)}
                className={`flex min-h-[60px] items-center gap-3 rounded-2xl p-3 text-start transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-[#10B981]/15 text-[#F4F4F5]'
                    : 'bg-white/[0.03] text-[#F4F4F5] hover:bg-white/[0.06]'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? 'bg-[#10B981] text-[#0A0A0C]' : 'bg-white/[0.06] text-[#71717A]'
                  }`}
                >
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{reciter.name}</div>
                  <div className="truncate text-[11px] text-[#71717A]">{reciter.style}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Playback Transport & Surah Grid */}
      <section className="rounded-3xl bg-white/[0.04] p-5 md:p-6 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-[#F4F4F5]">
            {t.surahsBy} <span className="text-[#10B981]">{selectedReciter.name}</span>
          </h2>
          <div className="relative w-full sm:w-52">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
            <input
              type="search"
              value={surahFilter}
              onChange={(e) => setSurahFilter(e.target.value)}
              placeholder={t.filterSurahs}
              aria-label={t.filterSurahs}
              className="w-full rounded-2xl bg-white/[0.05] py-2 ps-9 pe-3 text-xs text-[#F4F4F5] placeholder:text-[#71717A] focus:bg-white/[0.08] focus:outline-none"
            />
          </div>
        </div>

        {/* Seek, Volume & Transport Bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
          <button
            type="button"
            onClick={onPrevSurah}
            disabled={currentSurahNumber <= 1}
            aria-label={t.player.prevSurah}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-[#F4F4F5] transition hover:bg-white/[0.1] disabled:opacity-40"
          >
            <PrevIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextSurah}
            disabled={currentSurahNumber >= 114}
            aria-label={t.player.nextSurah}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-[#F4F4F5] transition hover:bg-white/[0.1] disabled:opacity-40"
          >
            <NextIcon className="h-4 w-4" />
          </button>

          <div className="flex flex-1 items-center gap-2 min-w-[160px]">
            <span className="text-[11px] text-[#71717A] tabular-nums">{formatSec(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label={t.player.playLabel}
              className="h-1.5 w-full cursor-pointer accent-[#10B981]"
            />
            <span className="text-[11px] text-[#71717A] tabular-nums">{formatSec(duration)}</span>
          </div>

          <div className="flex items-center gap-2 min-w-[110px]">
            <Volume2 className="h-4 w-4 shrink-0 text-[#10B981]" />
            <input
              id="reciter-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={reciterVolume}
              aria-label={t.reciterVol}
              onChange={(e) => onChangeReciterVolume(Number(e.target.value))}
              className="h-1.5 w-20 cursor-pointer accent-[#10B981]"
            />
          </div>

          <button
            type="button"
            onClick={onCycleSpeed}
            className="min-h-[36px] rounded-xl bg-white/[0.06] px-3 text-xs font-semibold text-[#10B981] tabular-nums transition hover:bg-white/[0.1]"
          >
            {playbackRate}x
          </button>
        </div>

        <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pe-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSurahs.map((surah) => {
            const isCurrent = surah.number === currentSurahNumber;
            return (
              <button
                key={surah.number}
                type="button"
                onClick={() => onPlaySurahWithReciter(selectedReciter, surah.number)}
                className={`flex min-h-[52px] items-center justify-between rounded-2xl px-3.5 py-2.5 text-start transition-all duration-150 active:scale-[0.98] ${
                  isCurrent
                    ? 'bg-[#10B981]/15 text-[#F4F4F5]'
                    : 'bg-white/[0.03] text-[#F4F4F5] hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-bold text-[#10B981] tabular-nums">
                    {formatNum(surah.number, language)}
                  </span>
                  <span className="truncate font-quran text-lg">
                    {language !== 'ar' && language !== 'ur' ? surah.englishName : surah.name}
                  </span>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[#10B981]">
                  {isCurrent && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
