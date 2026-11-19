import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Globe, Menu } from 'lucide-react';
import { AdhkarSunnahView } from './components/AdhkarSunnahView';
import { HomeDashboardView } from './components/HomeDashboardView';
import { NavigationDrawer } from './components/NavigationDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer';
import { PrayerTimesView } from './components/PrayerTimesView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QiblaCompassView } from './components/QiblaCompassView';
import { QuranReaderView } from './components/QuranReaderView';
import { RecitationsView } from './components/RecitationsView';
import { TasbihView } from './components/TasbihView';
import {
  ADHKAR_ITEMS,
  CITY_PRESETS,
  FALLBACK_FEATURED_RECITERS,
  FALLBACK_PRAYER_TIMINGS,
  FALLBACK_SURAH_LIST,
} from './data/adhkarData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  getCityDisplayLabel,
  getLanguageMeta,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
} from './i18n/translations';
import type {
  AdhanSettings,
  AppLanguage,
  AppTab,
  AyahItem,
  FeaturedReciter,
  KhatmahState,
  LastReadState,
  PrayerKey,
  PrayerLocationConfig,
  PrayerOffsets,
  PrayerTimingsResponse,
  SurahSummary,
  VerseBookmark,
} from './types/islamic';
import { adhanAudioEngine } from './utils/adhanAudioEngine';
import {
  applyPrayerTimeOffsets,
  calculateQiblaBearing,
  cleanPrayerTimeStr,
  DEFAULT_PRAYER_OFFSETS,
  getNextPrayerInfo,
} from './utils/prayerLogic';
import { formatSurahAudioUrl, stripBismillahPrefix, TOTAL_QURAN_PAGES } from './utils/quranLogic';
import {
  createHistoryState,
  isMihrabHistoryState,
  resolvePopStateTarget,
  resolveTabHistoryAction,
  type HistoryOverlay,
} from './utils/navigationHistory';
import { ensureFullQuranCached } from './utils/quranOfflineCache';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [historyOverlay, setHistoryOverlay] = useState<HistoryOverlay>(null);
  const activeTabRef = useRef<AppTab>('home');
  const historyOverlayRef = useRef<HistoryOverlay>(null);
  const historySeqRef = useRef(1);

  const [language, setLanguage] = useLocalStorage<AppLanguage>('mihrab_language', 'ar');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  // History API integration for browser & Android hardware back button
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isMihrabHistoryState(window.history.state)) {
      window.history.replaceState(
        createHistoryState(activeTabRef.current, historyOverlayRef.current, historySeqRef.current++),
        ''
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      const target = resolvePopStateTarget(event.state);
      activeTabRef.current = target.tab;
      historyOverlayRef.current = target.overlay;
      setActiveTab(target.tab);
      setHistoryOverlay(target.overlay);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = useCallback((nextTab: AppTab) => {
    const current = createHistoryState(
      activeTabRef.current,
      historyOverlayRef.current,
      historySeqRef.current
    );
    const { action, nextState } = resolveTabHistoryAction(
      current,
      nextTab,
      historySeqRef.current + 1
    );
    if (action === 'noop') return;
    historySeqRef.current += 1;
    activeTabRef.current = nextState.tab;
    historyOverlayRef.current = nextState.overlay;
    setActiveTab(nextState.tab);
    setHistoryOverlay(nextState.overlay);
    if (typeof window !== 'undefined') {
      if (action === 'replace') {
        window.history.replaceState(nextState, '');
      } else {
        window.history.pushState(nextState, '');
      }
    }
  }, []);

  const openOverlay = useCallback((overlay: Exclude<HistoryOverlay, null>) => {
    if (historyOverlayRef.current === overlay) return;
    const nextState = createHistoryState(
      activeTabRef.current,
      overlay,
      ++historySeqRef.current
    );
    historyOverlayRef.current = overlay;
    setHistoryOverlay(overlay);
    if (typeof window !== 'undefined') {
      window.history.pushState(nextState, '');
    }
  }, []);

  const closeOverlay = useCallback((expected?: Exclude<HistoryOverlay, null>) => {
    if (expected && historyOverlayRef.current !== expected) return;
    if (
      typeof window !== 'undefined' &&
      isMihrabHistoryState(window.history.state) &&
      window.history.state.overlay !== null
    ) {
      window.history.back();
    } else {
      historyOverlayRef.current = null;
      setHistoryOverlay(null);
    }
  }, []);

  const langMeta = useMemo(() => getLanguageMeta(language), [language]);
  const t = TRANSLATIONS[language];
  const dir = langMeta.dir;

  // Keep <html dir="..." lang="..."> synchronized with selected language
  useEffect(() => {
    document.documentElement.dir = langMeta.dir;
    document.documentElement.lang = language;
  }, [langMeta.dir, language]);

  // Close language popover on outside click or Escape
  useEffect(() => {
    if (!langMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [langMenuOpen]);

  // Persisted Quran & Worship state
  const [bookmarks, setBookmarks] = useLocalStorage<VerseBookmark[]>('mihrab_bookmarks', []);
  const [lastRead, setLastRead] = useLocalStorage<LastReadState>('mihrab_last_read', {
    surahNumber: 1,
    surahName: 'سُورَةُ ٱلْفَاتِحَةِ',
    ayahNumberInSurah: 1,
    page: 1,
  });
  const [khatmah, setKhatmah] = useLocalStorage<KhatmahState>('mihrab_khatmah', {
    pagesRead: 12,
    dailyGoal: 20,
    lastUpdatedDate: new Date().toISOString().slice(0, 10),
  });
  const [dhikrCounts, setDhikrCounts] = useLocalStorage<Record<string, number>>('mihrab_dhikr_counts', {});
  const [completedSunnahIds, setCompletedSunnahIds] = useLocalStorage<string[]>('mihrab_sunnah_done', []);
  const [tasbihState, setTasbihState] = useLocalStorage<{
    count: number;
    presetId: string;
    milestone: number;
  }>('mihrab_tasbih', {
    count: 0,
    presetId: 'subhanallah',
    milestone: 33,
  });

  // Persisted Prayer location, calculation method & manual offsets
  const defaultBiskra = CITY_PRESETS[0];
  const [prayerLocation, setPrayerLocation] = useLocalStorage<PrayerLocationConfig>(
    'mihrab_prayer_location',
    {
      mode: 'preset',
      cityId: defaultBiskra.id,
      label: `${defaultBiskra.nameAr}، ${defaultBiskra.countryAr}`,
      latitude: defaultBiskra.latitude,
      longitude: defaultBiskra.longitude,
    }
  );
  const [calculationMethod, setCalculationMethod] = useLocalStorage<number>(
    'mihrab_prayer_method',
    19
  );
  const [prayerOffsets, setPrayerOffsets] = useLocalStorage<PrayerOffsets>(
    'mihrab_prayer_offsets',
    DEFAULT_PRAYER_OFFSETS
  );
  const [adhanSettings, setAdhanSettings] = useLocalStorage<AdhanSettings>('mihrab_adhan_settings', {
    adhanAudioEnabled: true,
    notificationsEnabled: false,
  });

  // Live Prayer Timings & Countdown
  const [prayerData, setPrayerData] = useState<PrayerTimingsResponse>(FALLBACK_PRAYER_TIMINGS);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [lastAlertedMinute, setLastAlertedMinute] = useState<string>('');

  // Audio player & Multi-layer Nature mixer state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<FeaturedReciter>(FALLBACK_FEATURED_RECITERS[0]);
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(1);
  const [surahNamesMap, setSurahNamesMap] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    FALLBACK_SURAH_LIST.forEach((s) => {
      map[s.number] = s.name;
    });
    return map;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [reciterVolume, setReciterVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch Surah names map once for persistent player + silent full Quran pre-caching
  useEffect(() => {
    let cancelled = false;
    void ensureFullQuranCached();
    const handleOnline = () => {
      void ensureFullQuranCached();
    };
    window.addEventListener('online', handleOnline);

    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((json: { data?: SurahSummary[] }) => {
        if (!cancelled && Array.isArray(json.data)) {
          const map: Record<number, string> = {};
          json.data.forEach((s) => {
            map[s.number] = s.name;
          });
          setSurahNamesMap(map);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Fetch Prayer Timings whenever coordinates or calculation method change
  useEffect(() => {
    let cancelled = false;
    const fetchTimings = async () => {
      setLoadingPrayer(true);
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${prayerLocation.latitude}&longitude=${prayerLocation.longitude}&method=${calculationMethod}`
        );
        if (!res.ok) throw new Error('Aladhan error');
        const json = (await res.json()) as {
          data?: {
            timings?: Record<PrayerKey, string>;
            date?: {
              readable?: string;
              hijri?: {
                day?: string;
                month?: { ar?: string; en?: string };
                year?: string;
              };
            };
            meta?: { timezone?: string };
          };
        };
        const d = json.data;
        if (!cancelled && d?.timings) {
          const hijriStrAr = d.date?.hijri
            ? `${d.date.hijri.day ?? ''} ${d.date.hijri.month?.ar ?? ''} ${d.date.hijri.year ?? ''} هـ`
            : FALLBACK_PRAYER_TIMINGS.hijriDateAr;
          const hijriStrEn = d.date?.hijri
            ? `${d.date.hijri.day ?? ''} ${d.date.hijri.month?.en ?? ''} ${d.date.hijri.year ?? ''} AH`
            : FALLBACK_PRAYER_TIMINGS.hijriDateEn;
          setPrayerData({
            timings: {
              Fajr: cleanPrayerTimeStr(d.timings.Fajr),
              Sunrise: cleanPrayerTimeStr(d.timings.Sunrise),
              Dhuhr: cleanPrayerTimeStr(d.timings.Dhuhr),
              Asr: cleanPrayerTimeStr(d.timings.Asr),
              Maghrib: cleanPrayerTimeStr(d.timings.Maghrib),
              Isha: cleanPrayerTimeStr(d.timings.Isha),
            },
            hijriDateAr: hijriStrAr,
            hijriDateEn: hijriStrEn,
            gregorianDate: d.date?.readable ?? FALLBACK_PRAYER_TIMINGS.gregorianDate,
            timezone: d.meta?.timezone ?? 'Africa/Algiers',
          });
        }
      } catch {
        // Fallback timings remain active
      } finally {
        if (!cancelled) setLoadingPrayer(false);
      }
    };
    void fetchTimings();
    return () => {
      cancelled = true;
    };
  }, [prayerLocation.latitude, prayerLocation.longitude, calculationMethod]);

  const adjustedTimings = useMemo(
    () => applyPrayerTimeOffsets(prayerData.timings, prayerOffsets),
    [prayerData.timings, prayerOffsets]
  );

  const nextPrayer = useMemo(
    () => getNextPrayerInfo(adjustedTimings, now),
    [adjustedTimings, now]
  );

  const qiblaBearing = useMemo(
    () => calculateQiblaBearing(prayerLocation.latitude, prayerLocation.longitude),
    [prayerLocation.latitude, prayerLocation.longitude]
  );

  const displayLocationLabel = useMemo(() => {
    if (prayerLocation.mode === 'preset') {
      return getCityDisplayLabel(prayerLocation.cityId, prayerLocation.label, language);
    }
    return prayerLocation.label;
  }, [prayerLocation, language]);

  // Live 1-second prayer countdown & Adhan arrival alert
  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);
      const hhmm = `${String(current.getHours()).padStart(2, '0')}:${String(
        current.getMinutes()
      ).padStart(2, '0')}`;
      const obligatory: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const key of obligatory) {
        if (adjustedTimings[key] === hhmm && lastAlertedMinute !== `${key}-${hhmm}`) {
          setLastAlertedMinute(`${key}-${hhmm}`);
          if (adhanSettings.adhanAudioEnabled) {
            adhanAudioEngine.playAdhanChime();
          }
          if (
            adhanSettings.notificationsEnabled &&
            typeof Notification !== 'undefined' &&
            Notification.permission === 'granted'
          ) {
            new Notification(`${t.prayers[key]} — ${t.prayerView.adhanAt} ${hhmm}`, {
              body: `${displayLocationLabel} · ${hhmm}`,
              icon: '/pwa-192x192.png',
            });
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [adjustedTimings, adhanSettings, displayLocationLabel, lastAlertedMinute, t.prayers, t.prayerView.adhanAt]);

  // Sync audio volume & rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = reciterVolume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [reciterVolume, playbackRate]);

  // Cleanup Adhan preview audio on unmount
  useEffect(() => {
    return () => {
      adhanAudioEngine.stopAdhanPreview();
    };
  }, []);

  const handleSelectPresetCity = (cityId: string) => {
    const city = CITY_PRESETS.find((c) => c.id === cityId);
    if (!city) return;
    setPrayerLocation({
      mode: 'preset',
      cityId: city.id,
      label: `${city.nameAr}، ${city.countryAr}`,
      latitude: city.latitude,
      longitude: city.longitude,
    });
    setGeoStatus(null);
  };

  const handleUseGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus(t.prayerView.geoUnsupported);
      return;
    }
    setGeoStatus(t.prayerView.geoLocating);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPrayerLocation({
          mode: 'gps',
          cityId: '',
          label: 'GPS',
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
        });
        setGeoStatus(t.prayerView.geoSuccess);
      },
      () => {
        setGeoStatus(t.prayerView.geoFail);
      },
      { timeout: 8000 }
    );
  };

  const handleApplyCustomCoords = (lat: number, lon: number, label: string) => {
    setPrayerLocation({
      mode: 'custom',
      cityId: '',
      label,
      latitude: lat,
      longitude: lon,
    });
    setGeoStatus(`${label} (${lat}, ${lon})`);
  };

  const startSurahPlayback = useCallback(
    async (reciter: FeaturedReciter, surahNumber: number) => {
      setSelectedReciter(reciter);
      setCurrentSurahNumber(surahNumber);
      setAudioError(null);

      const el = audioRef.current;
      if (!el) return;

      const url = formatSurahAudioUrl(reciter.server, surahNumber);
      if (el.src !== url) {
        el.src = url;
        el.load();
      }
      el.volume = reciterVolume;
      el.playbackRate = playbackRate;
      setAudioLoading(true);
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setAudioError(t.audio.player.playLabel);
      } finally {
        setAudioLoading(false);
      }
    },
    [playbackRate, reciterVolume, t.audio.player.playLabel]
  );

  const handleTogglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.src) {
      await startSurahPlayback(selectedReciter, currentSurahNumber);
      return;
    }
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      setAudioError(null);
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setAudioError(t.audio.player.loading);
      }
    }
  };

  const handleToggleBookmark = (surah: SurahSummary, ayah: AyahItem) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) => b.bookmarkType !== 'page' && b.globalAyahNumber === ayah.number
      );
      if (exists) {
        return prev.filter(
          (b) => !(b.bookmarkType !== 'page' && b.globalAyahNumber === ayah.number)
        );
      }
      const next: VerseBookmark = {
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumberInSurah: ayah.numberInSurah,
        globalAyahNumber: ayah.number,
        text: stripBismillahPrefix(ayah.text, surah.number, ayah.numberInSurah),
        page: ayah.page,
        bookmarkType: 'verse',
        savedAt: new Date().toISOString(),
      };
      return [next, ...prev];
    });
  };

  const handleTogglePageBookmark = (
    page: number,
    surah: SurahSummary,
    firstAyah?: AyahItem
  ) => {
    const pageKey = -page;
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) => b.bookmarkType === 'page' && (b.page === page || b.globalAyahNumber === pageKey)
      );
      if (exists) {
        return prev.filter(
          (b) => !(b.bookmarkType === 'page' && (b.page === page || b.globalAyahNumber === pageKey))
        );
      }
      const next: VerseBookmark = {
        surahNumber: surah.number,
        surahName: surah.name,
        ayahNumberInSurah: firstAyah?.numberInSurah ?? 1,
        globalAyahNumber: pageKey,
        text: firstAyah?.text ?? surah.name,
        page,
        bookmarkType: 'page',
        savedAt: new Date().toISOString(),
      };
      return [next, ...prev];
    });
  };

  const handleRemoveBookmark = (globalAyahNumber: number) => {
    setBookmarks((prev) => prev.filter((b) => b.globalAyahNumber !== globalAyahNumber));
  };

  const handleIncrementDhikr = (id: string, targetCount: number) => {
    setDhikrCounts((prev) => {
      const current = prev[id] ?? 0;
      if (current >= targetCount) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleResetAdhkarCategory = (ids: string[]) => {
    setDhikrCounts((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        delete next[id];
      });
      return next;
    });
  };

  const handleToggleSunnah = (id: string) => {
    setCompletedSunnahIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedAdhkarCount = useMemo(
    () => ADHKAR_ITEMS.filter((item) => (dhikrCounts[item.id] ?? 0) >= item.targetCount).length,
    [dhikrCounts]
  );

  const currentSurahName =
    surahNamesMap[currentSurahNumber] ?? `(${currentSurahNumber})`;

  return (
    <div dir={dir} className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] flex flex-col">
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onEnded={() => {
          if (currentSurahNumber < 114) {
            void startSurahPlayback(selectedReciter, currentSurahNumber + 1);
          } else {
            setIsPlaying(false);
          }
        }}
        onError={() => {
          setIsPlaying(false);
          setAudioLoading(false);
          setAudioError(t.audio.player.loading);
        }}
      />

      {/* Ultra-Minimal Sticky Top Bar (hidden on full-screen Quran Mushaf view which embeds its own ultra-slim header) */}
      {activeTab !== 'quran' && (
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0C]/80">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 md:px-6">
            {activeTab === 'home' ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    data-testid="drawer-toggle-btn"
                    aria-label={t.openMenuLabel}
                    aria-expanded={historyOverlay === 'drawer'}
                    onClick={() => openOverlay('drawer')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#F4F4F5] transition-all duration-150 hover:bg-white/[0.1] active:scale-[0.95]"
                  >
                    <Menu className="h-5 w-5 text-[#10B981]" />
                  </button>
                  <a
                    href="#top"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToTab('home');
                    }}
                    className="text-xl font-bold tracking-tight text-[#F4F4F5] whitespace-nowrap shrink-0"
                  >
                    {t.brandName}
                  </a>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <PWAInstallButton
                    installAppLabel={t.installApp}
                    installIOSLabel={t.installIOS}
                  />

                  <div ref={langMenuRef} className="relative">
                    <button
                      type="button"
                      data-testid="language-switcher"
                      aria-label={t.languageLabel}
                      aria-expanded={langMenuOpen}
                      aria-haspopup="menu"
                      onClick={() => setLangMenuOpen((prev) => !prev)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-[#71717A] transition-all duration-150 hover:bg-white/[0.06] hover:text-[#F4F4F5] active:scale-[0.95]"
                    >
                      <Globe className="h-5 w-5" />
                    </button>

                    {langMenuOpen && (
                      <div
                        role="menu"
                        aria-label={t.languageLabel}
                        className="animate-sheet-enter absolute end-0 mt-2 w-44 rounded-2xl bg-zinc-900/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-xl"
                      >
                        {LANGUAGE_OPTIONS.map((opt) => {
                          const active = opt.code === language;
                          return (
                            <button
                              key={opt.code}
                              type="button"
                              role="menuitemradio"
                              aria-checked={active}
                              data-lang-option={opt.code}
                              onClick={() => {
                                setLanguage(opt.code);
                                setLangMenuOpen(false);
                              }}
                              className={`flex min-h-[40px] w-full items-center justify-between rounded-xl px-3 text-xs font-medium transition-colors ${
                                active
                                  ? 'bg-emerald-500/15 text-[#10B981]'
                                  : 'text-[#F4F4F5] hover:bg-white/[0.06]'
                              }`}
                            >
                              <span>{opt.nativeName}</span>
                              {active && <Check className="h-3.5 w-3.5 text-[#10B981]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex w-full items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-testid="drawer-toggle-btn"
                    aria-label={t.openMenuLabel}
                    aria-expanded={historyOverlay === 'drawer'}
                    onClick={() => openOverlay('drawer')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#F4F4F5] transition-all duration-150 hover:bg-white/[0.1] active:scale-[0.95]"
                  >
                    <Menu className="h-5 w-5 text-[#10B981]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToTab('home')}
                    data-testid="back-to-home-btn"
                    className="flex min-h-[40px] items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-[#F4F4F5] transition-all duration-150 hover:bg-white/[0.1] active:scale-[0.97] whitespace-nowrap shrink-0"
                  >
                    {dir === 'rtl' ? (
                      <ArrowRight className="h-4 w-4 text-[#10B981]" />
                    ) : (
                      <ArrowLeft className="h-4 w-4 text-[#10B981]" />
                    )}
                    <span>{t.backToHome}</span>
                  </button>
                </div>

                <span className="truncate text-sm font-semibold text-[#F4F4F5]">
                  {t.subpageTitles[activeTab]}
                </span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      {activeTab === 'quran' ? (
        <main id="top" className="w-full flex-1 overflow-hidden">
          <QuranReaderView
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onTogglePageBookmark={handleTogglePageBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            lastRead={lastRead}
            onUpdateLastRead={setLastRead}
            khatmah={khatmah}
            onUpdateKhatmah={setKhatmah}
            onPlaySurah={(surahNum) => {
              void startSurahPlayback(selectedReciter, surahNum);
            }}
            historyOverlay={historyOverlay}
            onOpenOverlay={openOverlay}
            onCloseOverlay={closeOverlay}
            onOpenDrawer={() => openOverlay('drawer')}
            onBackHome={() => navigateToTab('home')}
            openMenuLabel={t.openMenuLabel}
            backToHomeLabel={t.backToHome}
            language={language}
            dir={dir}
            t={t.quran}
            quranEdition={langMeta.quranEdition}
            quranTranslationLabel={langMeta.quranTranslationLabel}
          />
        </main>
      ) : (
        <main
          id="top"
          className="mx-auto w-full max-w-4xl flex-1 px-4 pt-3 pb-24 md:px-6 md:pt-6 md:pb-28"
        >
          <div key={activeTab} className="animate-page-enter">
            {activeTab === 'home' && (
              <HomeDashboardView
                onNavigate={navigateToTab}
                nextPrayer={nextPrayer}
                khatmah={khatmah}
                lastRead={lastRead}
                currentSurahNumber={currentSurahNumber}
                isPlaying={isPlaying}
                qiblaBearing={qiblaBearing}
                tasbihCount={tasbihState.count}
                completedAdhkarCount={completedAdhkarCount}
                totalAdhkarCount={ADHKAR_ITEMS.length}
                language={language}
                t={t}
              />
            )}

            {activeTab === 'audio' && (
              <RecitationsView
                selectedReciter={selectedReciter}
                onSelectReciter={(rec) => {
                  setSelectedReciter(rec);
                  if (isPlaying) {
                    void startSurahPlayback(rec, currentSurahNumber);
                  }
                }}
                currentSurahNumber={currentSurahNumber}
                isPlaying={isPlaying}
                playbackRate={playbackRate}
                onCycleSpeed={() => {
                  const idx = SPEED_OPTIONS.indexOf(playbackRate);
                  setPlaybackRate(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
                }}
                onPrevSurah={() => {
                  if (currentSurahNumber > 1) {
                    void startSurahPlayback(selectedReciter, currentSurahNumber - 1);
                  }
                }}
                onNextSurah={() => {
                  if (currentSurahNumber < 114) {
                    void startSurahPlayback(selectedReciter, currentSurahNumber + 1);
                  }
                }}
                currentTime={currentTime}
                duration={duration}
                onSeek={(time) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = time;
                    setCurrentTime(time);
                  }
                }}
                onPlaySurahWithReciter={(rec, num) => {
                  if (rec.id === selectedReciter.id && num === currentSurahNumber && isPlaying) {
                    void handleTogglePlay();
                  } else {
                    void startSurahPlayback(rec, num);
                  }
                }}
                reciterVolume={reciterVolume}
                onChangeReciterVolume={setReciterVolume}
                language={language}
                dir={dir}
                t={t.audio}
              />
            )}

            {activeTab === 'prayer' && (
              <PrayerTimesView
                location={prayerLocation}
                displayLocationLabel={displayLocationLabel}
                onSelectPresetCity={handleSelectPresetCity}
                onUseGeolocation={handleUseGeolocation}
                onApplyCustomCoords={handleApplyCustomCoords}
                geoStatus={geoStatus}
                prayerData={prayerData}
                adjustedTimings={adjustedTimings}
                nextPrayer={nextPrayer}
                loading={loadingPrayer}
                calculationMethod={calculationMethod}
                onChangeCalculationMethod={setCalculationMethod}
                offsets={prayerOffsets}
                onUpdateOffsets={setPrayerOffsets}
                adhanSettings={adhanSettings}
                onUpdateAdhanSettings={setAdhanSettings}
                onOpenQibla={() => navigateToTab('qibla')}
                language={language}
                prayersLabels={t.prayers}
                t={t.prayerView}
              />
            )}

            {activeTab === 'qibla' && (
              <QiblaCompassView
                displayLocationLabel={displayLocationLabel}
                latitude={prayerLocation.latitude}
                longitude={prayerLocation.longitude}
                onRequestGPS={handleUseGeolocation}
                geoStatus={geoStatus}
                language={language}
                t={t.qibla}
              />
            )}

            {activeTab === 'adhkar' && (
              <AdhkarSunnahView
                dhikrCounts={dhikrCounts}
                onIncrementDhikr={handleIncrementDhikr}
                onResetCategory={handleResetAdhkarCategory}
                completedSunnahIds={completedSunnahIds}
                onToggleSunnah={handleToggleSunnah}
                language={language}
                t={t.adhkar}
              />
            )}

            {activeTab === 'tasbih' && (
              <TasbihView
                count={tasbihState.count}
                selectedPresetId={tasbihState.presetId}
                milestone={tasbihState.milestone}
                onUpdateState={(count, presetId, milestone) =>
                  setTasbihState({ count, presetId, milestone })
                }
                language={language}
                t={t.tasbih}
              />
            )}
          </div>
        </main>
      )}

      {/* Sleek Floating Pill Mini-Player */}
      <PersistentAudioPlayer
        reciter={selectedReciter}
        surahName={currentSurahName}
        isPlaying={isPlaying}
        isLoading={audioLoading}
        audioError={audioError}
        onTogglePlay={() => void handleTogglePlay()}
        onOpenRecitationsTab={() => navigateToTab('audio')}
        t={t.audio.player}
      />

      {/* Slide-Out Navigation Drawer */}
      <NavigationDrawer
        isOpen={historyOverlay === 'drawer'}
        activeTab={activeTab}
        dir={dir}
        onClose={() => closeOverlay('drawer')}
        onSelectTab={(tab) => navigateToTab(tab)}
        t={t}
      />

      <OfflineIndicator message={t.offlineBanner} />
    </div>
  );
}

export default App;
