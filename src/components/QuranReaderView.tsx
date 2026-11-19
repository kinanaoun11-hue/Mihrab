import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Languages,
  Loader2,
  Menu,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { FALLBACK_FATIHA, FALLBACK_SURAH_LIST } from '../data/adhkarData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum } from '../i18n/translations';
import type {
  AppLanguage,
  AyahItem,
  KhatmahState,
  LastReadState,
  MushafPageData,
  SurahSummary,
  VerseBookmark,
} from '../types/islamic';
import {
  calculateKhatmahStats,
  clampQuranFontZoom,
  clampQuranPage,
  getSurahStartPage,
  groupPageAyahsBySurah,
  MAX_QURAN_FONT_ZOOM,
  MIN_QURAN_FONT_ZOOM,
  QURAN_FONT_ZOOM_STEP,
  resolveSwipePageDelta,
  stepQuranFontZoom,
  stripBismillahPrefix,
  toArabicDigits,
  TOTAL_QURAN_PAGES,
} from '../utils/quranLogic';
import type { HistoryOverlay } from '../utils/navigationHistory';
import {
  ensureFullQuranCached,
  getCachedMushafPage,
  getCachedSurahList,
  getQuranOfflineStatus,
  subscribeQuranOfflineStatus,
  type QuranOfflineStatus,
} from '../utils/quranOfflineCache';
import { TafsirSheetModal } from './TafsirSheetModal';

interface QuranReaderViewProps {
  bookmarks: VerseBookmark[];
  onToggleBookmark: (surah: SurahSummary, ayah: AyahItem) => void;
  onTogglePageBookmark: (page: number, surah: SurahSummary, firstAyah?: AyahItem) => void;
  onRemoveBookmark: (globalAyahNumber: number) => void;
  lastRead: LastReadState;
  onUpdateLastRead: (next: LastReadState) => void;
  khatmah: KhatmahState;
  onUpdateKhatmah: (next: KhatmahState) => void;
  onPlaySurah: (surahNumber: number) => void;
  historyOverlay: HistoryOverlay;
  onOpenOverlay: (overlay: 'tafsir' | 'surahIndex' | 'quranSettings') => void;
  onCloseOverlay: (overlay: 'tafsir' | 'surahIndex' | 'quranSettings') => void;
  onOpenDrawer: () => void;
  onBackHome: () => void;
  openMenuLabel: string;
  backToHomeLabel: string;
  language: AppLanguage;
  dir: 'rtl' | 'ltr';
  t: TranslationStrings['quran'];
  quranEdition: string | null;
  quranTranslationLabel: string;
}

const FALLBACK_PAGE_1: MushafPageData = {
  number: 1,
  ayahs: FALLBACK_FATIHA.ayahs.map((a) => ({
    ...a,
    surah: {
      number: FALLBACK_FATIHA.number,
      name: FALLBACK_FATIHA.name,
      englishName: FALLBACK_FATIHA.englishName,
      englishNameTranslation: FALLBACK_FATIHA.englishNameTranslation,
      numberOfAyahs: FALLBACK_FATIHA.numberOfAyahs,
      revelationType: FALLBACK_FATIHA.revelationType,
    },
  })),
};

export const QuranReaderView: React.FC<QuranReaderViewProps> = ({
  bookmarks,
  onToggleBookmark,
  onTogglePageBookmark,
  onRemoveBookmark,
  lastRead,
  onUpdateLastRead,
  khatmah,
  onUpdateKhatmah,
  onPlaySurah,
  historyOverlay,
  onOpenOverlay,
  onCloseOverlay,
  onOpenDrawer,
  onBackHome,
  openMenuLabel,
  backToHomeLabel,
  language,
  dir,
  t,
  quranEdition,
  quranTranslationLabel,
}) => {
  const [surahs, setSurahs] = useState<SurahSummary[]>(FALLBACK_SURAH_LIST);
  const [loadingList, setLoadingList] = useState(true);

  const initialPage = clampQuranPage(lastRead.page || 1);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageJumpInput, setPageJumpInput] = useState<string>(String(initialPage));

  // Auto-scale offset around clamp(15px, 3.8vw, 19px); 0 = Auto-Fit default
  const [fontZoom, setFontZoom] = useLocalStorage<number>('mihrab_quran_font_zoom', 0);
  const safeZoom = clampQuranFontZoom(fontZoom);

  const prevOverlayRef = useRef<HistoryOverlay>(historyOverlay);
  const swipeTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollPaneRef = useRef<HTMLDivElement | null>(null);

  const [pageCache, setPageCache] = useState<Record<number, MushafPageData>>({});
  const [pageData, setPageData] = useState<MushafPageData | null>(
    initialPage === 1 ? FALLBACK_PAGE_1 : null
  );
  const [loadingPage, setLoadingPage] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [offlineStatus, setOfflineStatus] = useState<QuranOfflineStatus>(() =>
    getQuranOfflineStatus()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [indexMode, setIndexMode] = useState<'surahs' | 'bookmarks'>('surahs');

  const [activeSelection, setActiveSelection] = useState<{
    ayah: AyahItem;
    surah: SurahSummary;
  } | null>(null);

  const [showTranslation, setShowTranslation] = useState<boolean>(language !== 'ar');
  const [translationCache, setTranslationCache] = useState<Record<string, Record<number, string>>>(
    {}
  );
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeQuranOfflineStatus(setOfflineStatus);
    void ensureFullQuranCached();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (prevOverlayRef.current === 'tafsir' && historyOverlay !== 'tafsir') {
      setActiveSelection(null);
    }
    prevOverlayRef.current = historyOverlay;
  }, [historyOverlay]);

  useEffect(() => {
    setShowTranslation(language !== 'ar');
  }, [language]);

  useEffect(() => {
    setPageJumpInput(String(currentPage));
    if (scrollPaneRef.current) {
      scrollPaneRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const activeEdition = quranEdition ?? 'en.sahih';
  const activeEditionLabel = quranEdition ? quranTranslationLabel : 'Saheeh International';
  const translationCacheKey = `page:${currentPage}:${activeEdition}`;
  const currentTranslationMap = translationCache[translationCacheKey];

  // Fetch Surah Index (local offline cache first)
  useEffect(() => {
    let cancelled = false;
    const loadSurahs = async () => {
      setLoadingList(true);
      try {
        const cachedSurahs = await getCachedSurahList();
        if (!cancelled && cachedSurahs && cachedSurahs.length >= 114) {
          setSurahs(cachedSurahs);
          setLoadingList(false);
          return;
        }
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        if (!res.ok) throw new Error('Network error');
        const json = (await res.json()) as { data?: SurahSummary[] };
        if (!cancelled && Array.isArray(json.data) && json.data.length > 0) {
          setSurahs(json.data);
        }
      } catch {
        // Fallback already populated
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };
    void loadSurahs();
    return () => {
      cancelled = true;
    };
  }, [offlineStatus]);

  // Fetch Mushaf Page (1..604) — local IndexedDB / localStorage cache first
  useEffect(() => {
    let cancelled = false;
    const loadPage = async () => {
      if (pageCache[currentPage]) {
        setPageData(pageCache[currentPage]);
        setPageError(null);
        return;
      }

      const offlineCached = await getCachedMushafPage(currentPage);
      if (
        !cancelled &&
        offlineCached &&
        Array.isArray(offlineCached.ayahs) &&
        offlineCached.ayahs.length > 0
      ) {
        setPageData(offlineCached);
        setPageCache((prev) => ({ ...prev, [currentPage]: offlineCached }));
        setPageError(null);
        setLoadingPage(false);
        return;
      }

      setLoadingPage(true);
      setPageError(null);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`
        );
        if (!res.ok) throw new Error('Page load error');
        const json = (await res.json()) as { data?: MushafPageData };
        if (!cancelled && json.data && Array.isArray(json.data.ayahs)) {
          setPageData(json.data);
          setPageCache((prev) => ({ ...prev, [currentPage]: json.data! }));
        }
      } catch {
        if (!cancelled) {
          if (currentPage === 1) {
            setPageData(FALLBACK_PAGE_1);
            setPageError(null);
          } else {
            setPageError(t.pageLoadError);
          }
        }
      } finally {
        if (!cancelled) setLoadingPage(false);
      }
    };
    void loadPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageCache, offlineStatus, t.pageLoadError]);

  // Fetch Translation when enabled
  useEffect(() => {
    if (!showTranslation) return;
    if (translationCache[translationCacheKey]) return;

    let cancelled = false;
    const loadPageTranslation = async () => {
      setLoadingTranslation(true);
      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/page/${currentPage}/${activeEdition}`
        );
        if (!res.ok) throw new Error('Translation fetch error');
        const json = (await res.json()) as {
          data?: { ayahs?: Array<{ number: number; text: string }> };
        };
        const ayahs = json.data?.ayahs;
        if (!cancelled && Array.isArray(ayahs)) {
          const map: Record<number, string> = {};
          ayahs.forEach((a) => {
            map[a.number] = a.text;
          });
          setTranslationCache((prev) => ({ ...prev, [translationCacheKey]: map }));
        }
      } catch {
        // Silent fallback
      } finally {
        if (!cancelled) setLoadingTranslation(false);
      }
    };
    void loadPageTranslation();
    return () => {
      cancelled = true;
    };
  }, [showTranslation, currentPage, activeEdition, translationCacheKey, translationCache]);

  const surahGroups = useMemo(
    () => (pageData ? groupPageAyahsBySurah(pageData.ayahs) : []),
    [pageData]
  );

  const primarySurah =
    surahGroups[0]?.surah ??
    surahs.find((s) => s.number === lastRead.surahNumber) ??
    surahs[0];
  const primaryAyah = pageData?.ayahs[0];
  const currentJuz = primaryAyah?.juz ?? 1;

  // Keep LastRead metadata in sync when a loaded page finishes fetching
  useEffect(() => {
    if (!pageData || pageData.number !== currentPage || pageData.ayahs.length === 0) return;
    const firstAyah = pageData.ayahs[0];
    if (
      lastRead.page === currentPage &&
      (lastRead.surahNumber !== firstAyah.surah.number ||
        lastRead.surahName !== firstAyah.surah.name)
    ) {
      onUpdateLastRead({
        surahNumber: firstAyah.surah.number,
        surahName: firstAyah.surah.name,
        ayahNumberInSurah: firstAyah.numberInSurah,
        page: currentPage,
      });
    }
  }, [
    pageData,
    currentPage,
    lastRead.page,
    lastRead.surahNumber,
    lastRead.surahName,
    onUpdateLastRead,
  ]);

  const navigateToPage = useCallback(
    (targetPage: number, overrideSurah?: SurahSummary, overrideAyahNumber = 1) => {
      const clamped = clampQuranPage(targetPage);
      setCurrentPage(clamped);
      if (historyOverlay === 'surahIndex') {
        onCloseOverlay('surahIndex');
      }

      const cached = pageCache[clamped];
      const firstAyah = cached?.ayahs[0];
      const resolvedSurah = overrideSurah ?? firstAyah?.surah ?? primarySurah;

      onUpdateLastRead({
        surahNumber: resolvedSurah?.number ?? 1,
        surahName: resolvedSurah?.name ?? lastRead.surahName,
        ayahNumberInSurah: overrideAyahNumber,
        page: clamped,
      });

      onUpdateKhatmah({
        ...khatmah,
        pagesRead: clamped,
        lastUpdatedDate: new Date().toISOString().slice(0, 10),
      });
    },
    [
      pageCache,
      primarySurah,
      onUpdateLastRead,
      lastRead.surahName,
      onUpdateKhatmah,
      khatmah,
      historyOverlay,
      onCloseOverlay,
    ]
  );

  const handleSelectSurah = (surahNumber: number) => {
    const startPage = getSurahStartPage(surahNumber);
    const found = surahs.find((s) => s.number === surahNumber);
    navigateToPage(startPage, found, 1);
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(pageJumpInput);
    if (Number.isFinite(parsed)) {
      navigateToPage(parsed);
    }
  };

  const khatmahStats = useMemo(
    () => calculateKhatmahStats(khatmah.pagesRead, khatmah.dailyGoal),
    [khatmah.pagesRead, khatmah.dailyGoal]
  );

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q.toLowerCase()) ||
        String(s.number) === q
    );
  }, [surahs, searchQuery]);

  const handleOpenAyah = (surah: SurahSummary, ayah: AyahItem) => {
    setActiveSelection({ surah, ayah });
    onOpenOverlay('tafsir');
    onUpdateLastRead({
      surahNumber: surah.number,
      surahName: surah.name,
      ayahNumberInSurah: ayah.numberInSurah,
      page: ayah.page || currentPage,
    });
  };

  const adjustPagesRead = (delta: number) => {
    const nextPages = Math.max(0, Math.min(TOTAL_QURAN_PAGES, khatmah.pagesRead + delta));
    onUpdateKhatmah({
      ...khatmah,
      pagesRead: nextPages,
      lastUpdatedDate: new Date().toISOString().slice(0, 10),
    });
    if (nextPages >= 1) {
      setCurrentPage(nextPages);
    }
  };

  const setDailyGoal = (goal: number) => {
    const clamped = Math.max(1, Math.min(100, goal));
    onUpdateKhatmah({
      ...khatmah,
      dailyGoal: clamped,
    });
  };

  const isAyahBookmarked = (globalAyahNumber: number) =>
    bookmarks.some((b) => b.bookmarkType !== 'page' && b.globalAyahNumber === globalAyahNumber);

  const isCurrentPageBookmarked = bookmarks.some(
    (b) =>
      b.bookmarkType === 'page' &&
      (b.page === currentPage || b.globalAyahNumber === -currentPage)
  );

  const activeSurahsOnPage = useMemo(() => {
    const seen = new Set<number>();
    const list: SurahSummary[] = [];
    for (const g of surahGroups) {
      if (!seen.has(g.surah.number)) {
        seen.add(g.surah.number);
        list.push(g.surah);
      }
    }
    return list;
  }, [surahGroups]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    swipeTouchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = swipeTouchStartRef.current;
    swipeTouchStartRef.current = null;
    if (!start || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    const delta = resolveSwipePageDelta(dx, dy, dir);
    if (delta !== 0) {
      const next = clampQuranPage(currentPage + delta);
      if (next !== currentPage) {
        navigateToPage(next);
      }
    }
  };

  // Close sheets on Escape
  useEffect(() => {
    if (historyOverlay !== 'surahIndex' && historyOverlay !== 'quranSettings') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseOverlay(historyOverlay);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [historyOverlay, onCloseOverlay]);

  const ForwardChevron = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const computedFontSize =
    safeZoom === 0
      ? 'clamp(15px, 3.8vw, 19px)'
      : `calc(clamp(15px, 3.8vw, 19px) + ${safeZoom}px)`;
  const computedMarkerSize =
    safeZoom === 0
      ? 'clamp(13px, 3.1vw, 15px)'
      : `calc(clamp(13px, 3.1vw, 15px) + ${Math.round(safeZoom * 0.7)}px)`;

  const activeSurahLabel =
    activeSurahsOnPage.map((s) => s.name).join(' · ') || primarySurah?.name || '';

  const savedResumePage = clampQuranPage(lastRead.page || currentPage);
  const resumeBannerLabel = t.continueReadingFromPage.replace(
    '{page}',
    formatNum(savedResumePage, language)
  );

  // Portaled Index & Bookmarks Bottom Sheet (فهرس)
  const indexSheetNode =
    historyOverlay === 'surahIndex' ? (
      <>
        <div
          aria-hidden="true"
          data-testid="surah-index-backdrop"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => onCloseOverlay('surahIndex')}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.surahIndexTab}
          className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
        >
          <div
            data-testid="surah-index-sheet"
            className="pointer-events-auto relative z-50 animate-sheet-enter flex max-h-[86vh] w-full max-w-xl flex-col rounded-t-3xl md:rounded-3xl border-t border-zinc-800 md:border bg-zinc-900 p-4 md:p-6 text-zinc-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-700 md:hidden" />

            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="grid flex-1 grid-cols-2 gap-1 rounded-2xl bg-white/[0.05] p-1">
                <button
                  type="button"
                  onClick={() => setIndexMode('surahs')}
                  className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    indexMode === 'surahs'
                      ? 'bg-[#10B981] text-[#0A0A0C]'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {t.surahIndexTab} ({formatNum(surahs.length, language)})
                </button>
                <button
                  type="button"
                  onClick={() => setIndexMode('bookmarks')}
                  className={`min-h-[38px] rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    indexMode === 'bookmarks'
                      ? 'bg-[#10B981] text-[#0A0A0C]'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {t.bookmarksTab} ({formatNum(bookmarks.length, language)})
                </button>
              </div>
              <button
                type="button"
                data-testid="surah-index-close-btn"
                aria-label={t.tafsirModal.closeLabel}
                onClick={() => onCloseOverlay('surahIndex')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Direct Page Jump Form */}
            <form
              onSubmit={handlePageJumpSubmit}
              className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-white/[0.04] px-3 py-2"
            >
              <label htmlFor="mushaf-page-jump" className="text-xs text-zinc-400 whitespace-nowrap">
                {t.jumpToPageLabel} ({formatNum(1, language)} - {formatNum(TOTAL_QURAN_PAGES, language)})
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="mushaf-page-jump"
                  data-testid="mushaf-page-jump-input"
                  type="number"
                  min={1}
                  max={TOTAL_QURAN_PAGES}
                  value={pageJumpInput}
                  onChange={(e) => setPageJumpInput(e.target.value)}
                  className="h-9 w-16 rounded-xl bg-white/[0.07] px-2 text-center text-xs font-semibold text-zinc-100 tabular-nums focus:bg-white/[0.12] focus:outline-none"
                />
                <button
                  type="submit"
                  data-testid="mushaf-page-jump-btn"
                  className="h-9 rounded-xl bg-[#10B981] px-3 text-xs font-bold text-[#0A0A0C] transition hover:bg-emerald-400 active:scale-[0.97] whitespace-nowrap"
                >
                  {t.goToPageBtn}
                </button>
              </div>
            </form>

            {indexMode === 'surahs' ? (
              <>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchSurahPlaceholder}
                    aria-label={t.searchSurahPlaceholder}
                    className="w-full rounded-2xl bg-white/[0.06] py-2.5 ps-9 pe-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:bg-white/[0.09] focus:outline-none"
                  />
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto pe-1">
                  {loadingList && surahs.length <= FALLBACK_SURAH_LIST.length ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-400">
                      <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" />
                      <span>{t.loadingSurahs}</span>
                    </div>
                  ) : filteredSurahs.length === 0 ? (
                    <p className="py-8 text-center text-xs text-zinc-400">{t.noSurahsFound}</p>
                  ) : (
                    filteredSurahs.map((s) => {
                      const isOnCurrentPage = activeSurahsOnPage.some(
                        (active) => active.number === s.number
                      );
                      const startPage = getSurahStartPage(s.number);
                      return (
                        <button
                          key={s.number}
                          type="button"
                          data-testid={`surah-index-${s.number}`}
                          onClick={() => handleSelectSurah(s.number)}
                          className={`flex min-h-[50px] w-full items-center justify-between rounded-2xl px-3 py-2 text-start transition-all duration-150 active:scale-[0.98] ${
                            isOnCurrentPage
                              ? 'bg-[#10B981]/15 text-zinc-100'
                              : 'text-zinc-100 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold tabular-nums ${
                                isOnCurrentPage
                                  ? 'bg-[#10B981] text-[#0A0A0C]'
                                  : 'bg-white/[0.07] text-zinc-400'
                              }`}
                            >
                              {formatNum(s.number, language)}
                            </span>
                            <div className="min-w-0">
                              <div className="font-quran text-lg leading-tight truncate">
                                {s.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 truncate">
                                {language !== 'ar' ? `${s.englishName} · ` : ''}
                                {t.pageLabel} {formatNum(startPage, language)} ·{' '}
                                {formatNum(s.numberOfAyahs, language)} {t.ayahWord}
                              </div>
                            </div>
                          </div>
                          <ForwardChevron className="h-4 w-4 shrink-0 text-zinc-500" />
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div data-testid="bookmarks-list" className="flex-1 space-y-2.5 overflow-y-auto pe-1">
                {bookmarks.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bookmark className="mx-auto h-8 w-8 text-zinc-600" />
                    <p className="mt-2 text-xs text-zinc-400">{t.noBookmarks}</p>
                  </div>
                ) : (
                  bookmarks.map((bm) => {
                    const isPageBm = bm.bookmarkType === 'page' || bm.globalAyahNumber < 0;
                    const targetPage = bm.page ?? getSurahStartPage(bm.surahNumber);
                    return (
                      <div
                        key={bm.globalAyahNumber}
                        data-testid={`bookmark-item-${bm.globalAyahNumber}`}
                        className="rounded-2xl bg-white/[0.05] p-3.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigateToPage(targetPage, undefined, bm.ayahNumberInSurah)
                            }
                            className="text-start text-xs font-semibold text-[#10B981] hover:underline"
                          >
                            <span className="me-1.5 inline-block rounded-lg bg-[#10B981]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                              {isPageBm ? t.pageBookmarkBadge : t.verseBookmarkBadge}
                            </span>
                            {isPageBm
                              ? `${t.pageLabel} ${formatNum(targetPage, language)} · ${bm.surahName}`
                              : `${bm.surahName} · ${formatNum(bm.ayahNumberInSurah, language)} (${t.pageLabel} ${formatNum(targetPage, language)})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveBookmark(bm.globalAyahNumber)}
                            aria-label={`${bm.surahName} ${bm.ayahNumberInSurah}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {!isPageBm && (
                          <p
                            dir="rtl"
                            className="mt-2 line-clamp-2 text-right font-quran text-base leading-relaxed text-zinc-100"
                          >
                            {bm.text}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </>
    ) : null;

  // Portaled Settings Bottom Sheet (⚙️)
  const settingsSheetNode =
    historyOverlay === 'quranSettings' ? (
      <>
        <div
          aria-hidden="true"
          data-testid="quran-settings-backdrop"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => onCloseOverlay('quranSettings')}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.settingsLabel}
          className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
        >
          <div
            data-testid="quran-settings-sheet"
            className="pointer-events-auto relative z-50 animate-sheet-enter w-full max-w-lg max-h-[86vh] overflow-y-auto rounded-t-3xl md:rounded-3xl border-t border-zinc-800 md:border bg-zinc-900 p-5 md:p-6 text-zinc-100 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-zinc-700 md:hidden" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#10B981]" />
                <h2 className="text-base font-bold text-zinc-100">{t.settingsLabel}</h2>
              </div>
              <button
                type="button"
                data-testid="quran-settings-close-btn"
                aria-label={t.tafsirModal.closeLabel}
                onClick={() => onCloseOverlay('quranSettings')}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Font Size Manual A- / Auto / A+ Controls */}
            <div className="rounded-2xl bg-white/[0.04] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{t.fontSizeLabel}</span>
                {safeZoom !== 0 && (
                  <button
                    type="button"
                    data-testid="font-size-reset"
                    onClick={() => setFontZoom(0)}
                    className="text-[11px] font-medium text-[#10B981] hover:underline"
                  >
                    {t.resetFontAuto}
                  </button>
                )}
              </div>
              <div
                role="group"
                aria-label={t.fontSizeLabel}
                data-testid="font-size-pill"
                className="flex items-center justify-between gap-2 rounded-2xl bg-white/[0.04] p-1.5"
              >
                <button
                  type="button"
                  data-testid="font-size-decrease"
                  aria-label={t.fontSizeDecrease}
                  disabled={safeZoom <= MIN_QURAN_FONT_ZOOM}
                  onClick={() =>
                    setFontZoom((prev) => stepQuranFontZoom(prev, -QURAN_FONT_ZOOM_STEP))
                  }
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-bold text-zinc-100 transition hover:bg-white/[0.1] active:scale-[0.96] disabled:opacity-35"
                >
                  A-
                </button>
                <span
                  data-testid="font-size-value"
                  className="min-w-[84px] text-center text-xs font-semibold text-[#10B981] tabular-nums"
                >
                  {safeZoom === 0
                    ? t.fontAutoLabel
                    : `${safeZoom > 0 ? '+' : ''}${formatNum(safeZoom, language)}px`}
                </span>
                <button
                  type="button"
                  data-testid="font-size-increase"
                  aria-label={t.fontSizeIncrease}
                  disabled={safeZoom >= MAX_QURAN_FONT_ZOOM}
                  onClick={() =>
                    setFontZoom((prev) => stepQuranFontZoom(prev, QURAN_FONT_ZOOM_STEP))
                  }
                  className="flex h-10 flex-1 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-bold text-zinc-100 transition hover:bg-white/[0.1] active:scale-[0.96] disabled:opacity-35"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Translation, Page Bookmark, and Recitation Quick Row */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                aria-pressed={showTranslation}
                data-testid="toggle-quran-translation"
                onClick={() => setShowTranslation((prev) => !prev)}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
                  showTranslation
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                }`}
              >
                <Languages className="h-4 w-4" />
                <span>{t.toggleTranslation}</span>
              </button>

              <button
                type="button"
                data-testid="mushaf-page-bookmark-btn"
                aria-pressed={isCurrentPageBookmarked}
                onClick={() => {
                  if (primarySurah) {
                    onTogglePageBookmark(currentPage, primarySurah, primaryAyah);
                  }
                }}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition active:scale-[0.97] ${
                  isCurrentPageBookmarked
                    ? 'bg-[#10B981] text-[#0A0A0C]'
                    : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                }`}
              >
                {isCurrentPageBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                <span>{isCurrentPageBookmarked ? t.pageBookmarked : t.bookmarkPage}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onPlaySurah(primarySurah?.number ?? 1);
                  onCloseOverlay('quranSettings');
                }}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-3 py-2 text-xs font-bold text-[#0A0A0C] transition hover:bg-emerald-400 active:scale-[0.97]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{t.playRecitation}</span>
              </button>
            </div>

            {showTranslation && (
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/[0.03] px-3.5 py-2.5 text-xs text-zinc-400">
                <span>
                  {t.translationEditionLabel}:{' '}
                  <strong className="text-[#10B981]">{activeEditionLabel}</strong>
                </span>
                {loadingTranslation && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#10B981]" />}
              </div>
            )}

            {/* Khatmah Progress Tracker inside Settings Sheet */}
            <div className="rounded-2xl bg-white/[0.04] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#10B981]">{t.khatmahBannerLabel}</span>
                <span className="text-xs font-semibold text-zinc-200 tabular-nums">
                  {khatmahStats.isCompleted
                    ? t.khatmahCompleted
                    : `${formatNum(khatmah.pagesRead, language)} / ${formatNum(TOTAL_QURAN_PAGES, language)} (${khatmahStats.percentage}%)`}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-[#10B981] transition-all duration-500 ease-out"
                  style={{ width: `${khatmahStats.percentage}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 tabular-nums">
                <span>
                  {t.remainingPages} {formatNum(khatmahStats.remainingPages, language)} ·{' '}
                  {t.estimatedDays} {formatNum(khatmahStats.estimatedDays, language)}
                </span>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="daily-goal-input" className="text-[11px] text-zinc-400">
                    {t.dailyGoalInput}
                  </label>
                  <input
                    id="daily-goal-input"
                    type="number"
                    min={1}
                    max={100}
                    value={khatmah.dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value) || 1)}
                    className="w-12 rounded-xl bg-white/[0.07] px-1.5 py-1 text-center text-xs font-semibold text-[#10B981] tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => adjustPagesRead(-1)}
                  aria-label="-1"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-100 transition hover:bg-white/[0.1] active:scale-[0.96]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustPagesRead(khatmah.dailyGoal)}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-3 text-xs font-bold text-[#0A0A0C] transition hover:bg-emerald-400 active:scale-[0.97] whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {t.completeGoalBtn} (+{formatNum(khatmah.dailyGoal, language)})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustPagesRead(1)}
                  aria-label="+1"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-100 transition hover:bg-white/[0.1] active:scale-[0.96]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {khatmah.pagesRead > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateKhatmah({
                        ...khatmah,
                        pagesRead: 0,
                        lastUpdatedDate: new Date().toISOString().slice(0, 10),
                      })
                    }
                    aria-label="Reset Khatmah"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400 transition hover:text-white active:scale-[0.96]"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {savedResumePage !== currentPage && (
              <button
                type="button"
                data-testid="quran-resume-banner"
                onClick={() => {
                  navigateToPage(savedResumePage, undefined, lastRead.ayahNumberInSurah || 1);
                  onCloseOverlay('quranSettings');
                }}
                className="flex w-full items-center justify-between gap-2 rounded-2xl bg-white/[0.05] px-4 py-3 text-start text-xs font-semibold text-zinc-100 transition hover:bg-white/[0.09]"
              >
                <span>{resumeBannerLabel}</span>
                <ForwardChevron className="h-4 w-4 text-[#10B981]" />
              </button>
            )}
          </div>
        </div>
      </>
    ) : null;

  return (
    <div
      data-testid="quran-reader-shell"
      className="mx-auto flex h-[100dvh] w-full max-w-4xl flex-col justify-between overflow-hidden bg-[#0A0A0C]"
    >
      {/* Ultra-Slim Single Top Bar */}
      <header
        data-testid="quran-slim-header"
        className="shrink-0 z-30 flex items-center justify-between gap-1.5 px-2.5 py-2 md:px-4"
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="drawer-toggle-btn"
            aria-label={openMenuLabel}
            aria-expanded={historyOverlay === 'drawer'}
            onClick={onOpenDrawer}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.95]"
          >
            <Menu className="h-4 w-4 text-[#10B981]" />
          </button>

          <button
            type="button"
            data-testid="back-to-home-btn"
            aria-label={backToHomeLabel}
            onClick={onBackHome}
            className="flex h-9 items-center gap-1 rounded-full bg-white/[0.06] px-2.5 text-xs font-semibold text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            {dir === 'rtl' ? (
              <ArrowRight className="h-3.5 w-3.5 text-[#10B981]" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5 text-[#10B981]" />
            )}
            <span className="hidden sm:inline">{backToHomeLabel}</span>
          </button>
        </div>

        {/* Compact Single-Line Mushaf Status Pill */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden px-0.5">
          <span
            data-testid="mushaf-surah-heading"
            className="min-w-0 truncate font-quran text-xs font-bold text-[#F4F4F5] sm:text-sm md:text-base"
          >
            {activeSurahLabel}
          </span>
          <span aria-hidden="true" className="text-[#71717A] text-[10px] shrink-0">
            •
          </span>
          <span
            data-testid="mushaf-juz-badge"
            className="shrink-0 text-[10px] sm:text-[11px] font-medium text-[#10B981] whitespace-nowrap"
          >
            {t.juzLabel} {formatNum(currentJuz, language)}
          </span>
          <span aria-hidden="true" className="text-[#71717A] text-[10px] shrink-0">
            •
          </span>
          <span
            data-testid="mushaf-page-badge"
            className="shrink-0 text-[10px] sm:text-[11px] font-medium text-[#71717A] tabular-nums whitespace-nowrap"
          >
            {t.pageLabel} {formatNum(currentPage, language)} / {formatNum(TOTAL_QURAN_PAGES, language)}
          </span>
          {offlineStatus === 'ready' && (
            <span
              data-testid="quran-offline-ready-badge"
              className="hidden sm:inline-flex shrink-0 items-center rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10B981] whitespace-nowrap"
            >
              {t.offlineReadyBadge}
            </span>
          )}
        </div>

        {/* Index & Settings Triggers */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="surah-list-btn"
            onClick={() => {
              setIndexMode('surahs');
              onOpenOverlay('surahIndex');
            }}
            className="flex h-9 items-center gap-1 rounded-full bg-white/[0.06] px-2.5 text-xs font-semibold text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.96] whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#10B981]" />
            <span>{t.indexShortBtn}</span>
          </button>

          <button
            type="button"
            data-testid="quran-settings-btn"
            aria-label={t.settingsLabel}
            onClick={() => onOpenOverlay('quranSettings')}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.95]"
          >
            <Settings className="h-4 w-4 text-[#10B981]" />
            {offlineStatus === 'ready' && (
              <span
                aria-hidden="true"
                className="sm:hidden absolute top-1.5 end-1.5 h-1.5 w-1.5 rounded-full bg-[#10B981]"
              />
            )}
          </button>
        </div>
      </header>

      {/* Center Single-Page Mushaf Viewport (Swipeable, Auto-Scaled) */}
      <div
        ref={scrollPaneRef}
        data-testid="mushaf-page-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex flex-1 min-h-0 flex-col overflow-y-auto px-3 py-1 md:px-6 md:py-2"
      >
        {loadingPage ? (
          <div className="my-auto flex flex-col items-center justify-center gap-3 py-12 text-sm text-[#71717A]">
            <Loader2 className="h-6 w-6 animate-spin text-[#10B981]" />
            <span>{t.loadingSurah}</span>
          </div>
        ) : pageError ? (
          <div className="my-auto mx-auto max-w-sm rounded-3xl bg-white/[0.04] p-6 text-center">
            <p className="text-sm text-[#F4F4F5]">{pageError}</p>
            <button
              type="button"
              onClick={() =>
                setPageCache((prev) => {
                  const next = { ...prev };
                  delete next[currentPage];
                  return next;
                })
              }
              className="mt-4 rounded-full bg-[#10B981] px-4 py-2 text-xs font-bold text-[#0A0A0C]"
            >
              {t.retry}
            </button>
          </div>
        ) : (
          <div className="my-auto mx-auto w-full max-w-3xl rounded-3xl bg-white/[0.03] px-3.5 py-3 md:px-8 md:py-5 space-y-2.5">
            {offlineStatus === 'ready' && (
              <div className="flex sm:hidden items-center justify-center">
                <span className="inline-flex items-center rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-medium text-[#10B981]">
                  {t.offlineReadyBadge}
                </span>
              </div>
            )}

            {surahGroups.map((group) => {
              const startsSurahHere = group.ayahs[0]?.numberInSurah === 1;
              const showBismillahBanner =
                startsSurahHere && group.surah.number !== 1 && group.surah.number !== 9;

              return (
                <div key={`${currentPage}-${group.surah.number}`} className="space-y-2">
                  {/* Compact Surah & Bismillah Banner */}
                  {startsSurahHere && (
                    <div className="space-y-1.5 text-center">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.05] px-4 py-1">
                        <span className="font-quran text-lg font-bold text-[#F4F4F5] md:text-xl">
                          {group.surah.name}
                        </span>
                        <span className="text-[11px] text-[#71717A]">
                          {group.surah.revelationType === 'Meccan' ? t.meccan : t.medinan} ·{' '}
                          {formatNum(group.surah.numberOfAyahs, language)} {t.ayahWord}
                        </span>
                      </div>

                      {showBismillahBanner && (
                        <div
                          dir="rtl"
                          data-testid={`bismillah-banner-${group.surah.number}`}
                          className="font-quran text-lg leading-tight text-[#10B981]/95 md:text-xl"
                        >
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </div>
                      )}
                    </div>
                  )}

                  {/* Continuous Inline Justified Auto-Scaled Arabic Verses */}
                  <div
                    dir="rtl"
                    data-testid={`mushaf-text-block-${group.surah.number}`}
                    style={{ fontSize: computedFontSize }}
                    className="font-quran text-justify leading-[1.85] text-[#F4F4F5] [text-align-last:center]"
                  >
                    {group.ayahs.map((ayah) => {
                      const cleanText = stripBismillahPrefix(
                        ayah.text,
                        group.surah.number,
                        ayah.numberInSurah
                      );
                      const bookmarked = isAyahBookmarked(ayah.number);
                      const isSelected = activeSelection?.ayah.number === ayah.number;

                      return (
                        <span
                          key={ayah.number}
                          role="button"
                          tabIndex={0}
                          data-testid={`mushaf-ayah-${group.surah.number}-${ayah.numberInSurah}`}
                          aria-label={`${group.surah.name} ${ayah.numberInSurah} — ${t.tafsirHint}`}
                          onClick={() => handleOpenAyah(group.surah, ayah)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenAyah(group.surah, ayah);
                            }
                          }}
                          className={`inline cursor-pointer rounded-lg px-0.5 transition-colors duration-150 hover:bg-[#10B981]/15 focus-visible:bg-[#10B981]/20 focus:outline-none ${
                            isSelected
                              ? 'bg-[#10B981]/25 text-white'
                              : bookmarked
                              ? 'bg-[#10B981]/10'
                              : ''
                          }`}
                        >
                          {cleanText}{' '}
                          <span
                            aria-hidden="true"
                            style={{ fontSize: computedMarkerSize }}
                            className="inline-block px-0.5 text-[#10B981] select-none"
                          >
                            ﴿{toArabicDigits(ayah.numberInSurah)}﴾
                          </span>{' '}
                        </span>
                      );
                    })}
                  </div>

                  {/* Optional Translation below Mushaf block when enabled */}
                  {showTranslation && (
                    <div className="mt-3 space-y-1.5 rounded-2xl bg-white/[0.025] p-3">
                      {group.ayahs.map((ayah) => {
                        const translated = currentTranslationMap?.[ayah.number];
                        if (!translated) return null;
                        return (
                          <button
                            key={`tr-${ayah.number}`}
                            type="button"
                            onClick={() => handleOpenAyah(group.surah, ayah)}
                            data-testid={`ayah-translation-${ayah.numberInSurah}`}
                            dir={activeEdition === 'ur.jalandhry' ? 'rtl' : 'ltr'}
                            className="block w-full rounded-xl px-2 py-1 text-start text-xs leading-relaxed text-[#71717A] transition hover:bg-white/[0.05] hover:text-[#F4F4F5]"
                          >
                            <span className="me-1.5 font-semibold text-[#10B981] tabular-nums">
                              {group.surah.number}:{ayah.numberInSurah}
                            </span>
                            {translated}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tactile Previous/Next Navigation Bar sitting cleanly above the Mini-Player */}
      <nav
        aria-label={t.pageLabel}
        data-testid="mushaf-bottom-nav"
        className="shrink-0 z-20 px-3 pt-1.5 pb-[78px] md:px-6"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-2xl bg-white/[0.05] px-2.5 py-1.5 backdrop-blur-md">
          <button
            type="button"
            disabled={currentPage <= 1}
            data-testid="mushaf-prev-page"
            onClick={() => navigateToPage(currentPage - 1)}
            className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-[#F4F4F5] transition hover:bg-white/[0.12] active:scale-[0.96] disabled:opacity-35 whitespace-nowrap"
          >
            <PrevIcon className="h-4 w-4 text-[#10B981]" />
            <span>{t.prevPage}</span>
          </button>

          <button
            type="button"
            data-testid="mushaf-page-counter-btn"
            onClick={() => {
              setIndexMode('surahs');
              onOpenOverlay('surahIndex');
            }}
            className="flex min-h-[38px] items-center rounded-xl px-3 text-xs font-semibold text-[#F4F4F5] tabular-nums transition hover:bg-white/[0.07]"
          >
            {formatNum(currentPage, language)} / {formatNum(TOTAL_QURAN_PAGES, language)}
          </button>

          <button
            type="button"
            disabled={currentPage >= TOTAL_QURAN_PAGES}
            data-testid="mushaf-next-page"
            onClick={() => navigateToPage(currentPage + 1)}
            className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-[#F4F4F5] transition hover:bg-white/[0.12] active:scale-[0.96] disabled:opacity-35 whitespace-nowrap"
          >
            <span>{t.nextPage}</span>
            <NextIcon className="h-4 w-4 text-[#10B981]" />
          </button>
        </div>
      </nav>

      {/* Portaled Bottom Sheets & Modals */}
      {typeof document !== 'undefined' && indexSheetNode
        ? createPortal(indexSheetNode, document.body)
        : indexSheetNode}
      {typeof document !== 'undefined' && settingsSheetNode
        ? createPortal(settingsSheetNode, document.body)
        : settingsSheetNode}

      {/* Tafsir & Verse Card Bottom Sheet */}
      <TafsirSheetModal
        ayah={activeSelection?.ayah ?? null}
        surah={activeSelection?.surah ?? null}
        isBookmarked={activeSelection ? isAyahBookmarked(activeSelection.ayah.number) : false}
        onToggleBookmark={(ayah) => {
          if (activeSelection) onToggleBookmark(activeSelection.surah, ayah);
        }}
        onPlaySurah={onPlaySurah}
        onClose={() => {
          setActiveSelection(null);
          onCloseOverlay('tafsir');
        }}
        language={language}
        translatedAyahText={
          activeSelection && showTranslation
            ? currentTranslationMap?.[activeSelection.ayah.number]
            : undefined
        }
        translationEditionLabel={activeEditionLabel}
        translationIsRtl={activeEdition === 'ur.jalandhry'}
        t={t.tafsirModal}
      />
    </div>
  );
};
