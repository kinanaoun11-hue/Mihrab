import React, { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  Compass,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CITY_PRESETS } from '../data/adhkarData';
import type { TranslationStrings } from '../i18n/translations';
import {
  formatNum,
  getCityDisplayLabel,
  getMethodDisplayLabel,
} from '../i18n/translations';
import type {
  AdhanSettings,
  AdjustablePrayerKey,
  AppLanguage,
  PrayerKey,
  PrayerLocationConfig,
  PrayerOffsets,
  PrayerTimingsResponse,
} from '../types/islamic';
import { adhanAudioEngine } from '../utils/adhanAudioEngine';
import {
  CALCULATION_METHODS,
  DEFAULT_PRAYER_OFFSETS,
  OBLIGATORY_PRAYER_KEYS,
  ORDERED_PRAYER_KEYS,
  type NextPrayerInfo,
} from '../utils/prayerLogic';

interface PrayerTimesViewProps {
  location: PrayerLocationConfig;
  displayLocationLabel: string;
  onSelectPresetCity: (cityId: string) => void;
  onUseGeolocation: () => void;
  onApplyCustomCoords: (lat: number, lon: number, label: string) => void;
  geoStatus: string | null;
  prayerData: PrayerTimingsResponse;
  adjustedTimings: PrayerTimingsResponse['timings'];
  nextPrayer: NextPrayerInfo;
  loading: boolean;
  calculationMethod: number;
  onChangeCalculationMethod: (methodId: number) => void;
  offsets: PrayerOffsets;
  onUpdateOffsets: (next: PrayerOffsets) => void;
  adhanSettings: AdhanSettings;
  onUpdateAdhanSettings: (next: AdhanSettings) => void;
  onOpenQibla: () => void;
  language: AppLanguage;
  prayersLabels: Record<PrayerKey, string>;
  t: TranslationStrings['prayerView'];
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  location,
  displayLocationLabel,
  onSelectPresetCity,
  onUseGeolocation,
  onApplyCustomCoords,
  geoStatus,
  prayerData,
  adjustedTimings,
  nextPrayer,
  loading,
  calculationMethod,
  onChangeCalculationMethod,
  offsets,
  onUpdateOffsets,
  adhanSettings,
  onUpdateAdhanSettings,
  onOpenQibla,
  language,
  prayersLabels,
  t,
}) => {
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const [isAdhanPreviewPlaying, setIsAdhanPreviewPlaying] = useState(false);
  const [testFeedbackMsg, setTestFeedbackMsg] = useState<string | null>(null);
  const [customLat, setCustomLat] = useState(String(location.latitude));
  const [customLon, setCustomLon] = useState(String(location.longitude));
  const [customLabel, setCustomLabel] = useState(displayLocationLabel);
  const [coordError, setCoordError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      adhanAudioEngine.stopAdhanPreview();
    };
  }, []);

  const hijriDisplay =
    language === 'ar' || language === 'ur'
      ? prayerData.hijriDateAr
      : prayerData.hijriDateEn ?? prayerData.hijriDateAr;

  const adjustSinglePrayer = (key: AdjustablePrayerKey, delta: number) => {
    const current = offsets[key] ?? 0;
    const next = Math.max(-15, Math.min(15, current + delta));
    onUpdateOffsets({ ...offsets, [key]: next });
  };

  const handleSaveCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(customLat);
    const lon = Number(customLon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setCoordError(t.coordError);
      return;
    }
    setCoordError(null);
    onApplyCustomCoords(
      Number(lat.toFixed(4)),
      Number(lon.toFixed(4)),
      customLabel.trim() || `(${lat.toFixed(2)}, ${lon.toFixed(2)})`
    );
  };

  const handleToggleNotifications = async () => {
    setNotifError(null);
    if (!adhanSettings.notificationsEnabled) {
      if (typeof Notification === 'undefined') {
        setNotifPermission('unsupported');
        setNotifError(t.notifUnsupported);
        return;
      }
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setNotifPermission(result);
        if (result !== 'granted') {
          setNotifError(t.notifAllow);
          return;
        }
      } else if (Notification.permission === 'denied') {
        setNotifPermission('denied');
        setNotifError(t.notifBlocked);
        return;
      }
    }
    onUpdateAdhanSettings({
      ...adhanSettings,
      notificationsEnabled: !adhanSettings.notificationsEnabled,
    });
  };

  const handleTestNotificationAndAdhan = async () => {
    setNotifError(null);

    if (isAdhanPreviewPlaying) {
      adhanAudioEngine.stopAdhanPreview();
      setIsAdhanPreviewPlaying(false);
      return;
    }

    // Request permission if needed
    let currentPerm: NotificationPermission | 'unsupported' =
      typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        currentPerm = await Notification.requestPermission();
      } catch {
        currentPerm = Notification.permission;
      }
    }
    setNotifPermission(currentPerm);

    // Fire sample notification if granted
    if (typeof Notification !== 'undefined' && currentPerm === 'granted') {
      try {
        new Notification(t.sampleAdhanTitle, {
          body: t.sampleAdhanBody,
          icon: '/pwa-192x192.png',
        });
        if (!adhanSettings.notificationsEnabled) {
          onUpdateAdhanSettings({ ...adhanSettings, notificationsEnabled: true });
        }
      } catch {
        // Ignore browser notification construction restrictions in sandboxed environments
      }
    }

    // Trigger gentle haptic vibration if supported
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([200, 100, 200]);
    }

    // Play 10-second Adhan audio preview with automatic cleanup
    setIsAdhanPreviewPlaying(true);
    setTestFeedbackMsg(t.sampleAdhanTitle);
    adhanAudioEngine.playAdhanPreview(10000, () => {
      setIsAdhanPreviewPlaying(false);
    });
  };

  const permissionBadgeLabel =
    notifPermission === 'granted'
      ? t.permGranted
      : notifPermission === 'denied'
      ? t.permDenied
      : t.permDefault;

  const permissionBadgeStyle =
    notifPermission === 'granted'
      ? 'bg-[#10B981]/15 text-[#10B981]'
      : notifPermission === 'denied'
      ? 'bg-rose-500/15 text-rose-400'
      : 'bg-amber-500/15 text-amber-300';

  const hasAnyOffset = OBLIGATORY_PRAYER_KEYS.some((k) => (offsets[k] ?? 0) !== 0);

  return (
    <div className="space-y-6">
      {/* Spotlight Prayer Card */}
      <section className="rounded-3xl bg-white/[0.04] p-6 md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
              <MapPin className="h-3.5 w-3.5 text-[#10B981]" />
              <span className="font-medium text-[#F4F4F5]">{displayLocationLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{hijriDisplay}</span>
              <span aria-hidden="true">·</span>
              <span>{prayerData.gregorianDate}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F5] md:text-3xl">
              {t.upcomingBadge}: <span className="text-[#10B981]">{prayersLabels[nextPrayer.nextKey]}</span>
            </h1>
            <div className="flex items-baseline gap-3">
              <span
                data-testid="prayer-countdown"
                className="text-4xl font-light tracking-tight text-[#F4F4F5] tabular-nums md:text-5xl"
              >
                {nextPrayer.formattedCountdown}
              </span>
              <span className="text-xs text-[#71717A] tabular-nums">
                {t.adhanAt} {nextPrayer.nextTimeFormatted}
              </span>
            </div>
          </div>

          {/* City Selector, GPS, and Adjust Times Trigger */}
          <div className="flex flex-wrap items-center gap-2.5">
            <label htmlFor="city-select" className="sr-only">
              {t.cityNamePlaceholder}
            </label>
            <select
              id="city-select"
              value={location.mode === 'preset' ? location.cityId : ''}
              onChange={(e) => {
                if (e.target.value) onSelectPresetCity(e.target.value);
              }}
              className="min-h-[44px] rounded-2xl bg-white/[0.05] px-4 py-2 text-sm text-[#F4F4F5] focus:bg-white/[0.08] focus:outline-none"
            >
              {location.mode !== 'preset' && (
                <option value="" className="bg-[#111114]">
                  {displayLocationLabel}
                </option>
              )}
              {CITY_PRESETS.map((city) => (
                <option key={city.id} value={city.id} className="bg-[#111114]">
                  {getCityDisplayLabel(city.id, `${city.nameAr} — ${city.countryAr}`, language)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onUseGeolocation}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-2 text-xs font-semibold text-[#052e1e] transition duration-150 hover:brightness-110 active:scale-[0.97] whitespace-nowrap"
            >
              <Navigation className="h-4 w-4" />
              <span>{t.useGPS}</span>
            </button>

            <button
              type="button"
              aria-expanded={showAdjustPanel}
              onClick={() => setShowAdjustPanel((prev) => !prev)}
              className={`flex min-h-[44px] items-center gap-2 rounded-2xl px-4 py-2 text-xs font-medium transition duration-150 active:scale-[0.97] whitespace-nowrap ${
                showAdjustPanel
                  ? 'bg-[#10B981]/20 text-[#10B981]'
                  : 'bg-white/[0.05] text-[#F4F4F5] hover:bg-white/[0.08]'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-[#10B981]" />
              <span>{t.adjustTimes}</span>
            </button>
          </div>
        </div>

        {(geoStatus || notifError) && (
          <p className="mt-3 text-xs text-[#10B981]">{geoStatus ?? notifError}</p>
        )}
      </section>

      {/* Manual Prayer Time Adjustment & Calculation Settings Panel */}
      {showAdjustPanel && (
        <section
          aria-label={t.adjustPanelTitle}
          className="animate-sheet-enter rounded-3xl bg-white/[0.04] p-6 space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#F4F4F5]">{t.adjustPanelTitle}</h2>
              <p className="mt-0.5 text-xs text-[#71717A]">{t.adjustPanelSub}</p>
            </div>
            {hasAnyOffset && (
              <button
                type="button"
                onClick={() => onUpdateOffsets(DEFAULT_PRAYER_OFFSETS)}
                className="flex min-h-[38px] items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 text-xs text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.97] whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#10B981]" />
                <span>{t.resetOffsets}</span>
              </button>
            )}
          </div>

          {/* Per-Prayer Minute Offsets */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {OBLIGATORY_PRAYER_KEYS.map((key) => {
              const offset = offsets[key] ?? 0;
              return (
                <div
                  key={key}
                  className="rounded-2xl bg-white/[0.04] p-4 text-center"
                >
                  <div className="text-sm font-medium text-[#F4F4F5]">{prayersLabels[key]}</div>
                  <div className="mt-1 text-xs text-[#71717A] tabular-nums">
                    {t.currentTime}:{' '}
                    <span className="font-semibold text-[#10B981]">{adjustedTimings[key]}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={offset <= -15}
                      onClick={() => adjustSinglePrayer(key, -1)}
                      aria-label={`-1 ${prayersLabels[key]}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.95] disabled:opacity-35"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span
                      data-testid={`offset-val-${key}`}
                      className={`text-sm font-semibold tabular-nums ${
                        offset === 0 ? 'text-[#71717A]' : 'text-[#10B981]'
                      }`}
                    >
                      {offset > 0 ? `+${offset}` : offset} {t.minShort}
                    </span>

                    <button
                      type="button"
                      disabled={offset >= 15}
                      onClick={() => adjustSinglePrayer(key, 1)}
                      aria-label={`+1 ${prayersLabels[key]}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.95] disabled:opacity-35"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculation Method & Manual Coordinates */}
          <div className="grid grid-cols-1 gap-5 pt-2 lg:grid-cols-2">
            <div>
              <label htmlFor="calc-method-select" className="block text-sm font-medium text-[#F4F4F5]">
                {t.calcMethodLabel}
              </label>
              <select
                id="calc-method-select"
                value={calculationMethod}
                onChange={(e) => onChangeCalculationMethod(Number(e.target.value))}
                className="mt-2 min-h-[44px] w-full rounded-2xl bg-white/[0.05] px-4 py-2 text-sm text-[#F4F4F5] focus:bg-white/[0.08] focus:outline-none"
              >
                {CALCULATION_METHODS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#111114]">
                    {getMethodDisplayLabel(m.id, m.nameAr, m.subtitleAr, language)}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSaveCustomCoords} className="space-y-2.5">
              <div className="text-sm font-medium text-[#F4F4F5]">{t.manualCoordsTitle}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder={t.cityNamePlaceholder}
                  aria-label={t.cityNamePlaceholder}
                  className="min-h-[42px] rounded-xl bg-white/[0.05] px-3 text-xs text-[#F4F4F5] placeholder:text-[#71717A] focus:bg-white/[0.08] focus:outline-none"
                />
                <input
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder={t.latPlaceholder}
                  aria-label={t.latPlaceholder}
                  className="min-h-[42px] rounded-xl bg-white/[0.05] px-3 text-xs text-[#F4F4F5] tabular-nums placeholder:text-[#71717A] focus:bg-white/[0.08] focus:outline-none"
                />
                <input
                  type="number"
                  step="any"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  placeholder={t.lonPlaceholder}
                  aria-label={t.lonPlaceholder}
                  className="min-h-[42px] rounded-xl bg-white/[0.05] px-3 text-xs text-[#F4F4F5] tabular-nums placeholder:text-[#71717A] focus:bg-white/[0.08] focus:outline-none"
                />
              </div>
              {coordError && <p className="text-xs text-[#10B981]">{coordError}</p>}
              <button
                type="submit"
                className="min-h-[42px] rounded-xl bg-[#10B981] px-4 py-2 text-xs font-semibold text-[#052e1e] transition hover:brightness-110 active:scale-[0.97]"
              >
                {t.applyCoordsBtn}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Daily Prayer Times Grid */}
      <section className="rounded-3xl bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#F4F4F5]">{t.todayTimings}</h2>
          <div className="flex items-center gap-3">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" />}
            <button
              type="button"
              onClick={onOpenQibla}
              className="flex min-h-[38px] items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 text-xs font-medium text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.97]"
            >
              <Compass className="h-4 w-4 text-[#10B981]" />
              <span>{t.openQibla}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {ORDERED_PRAYER_KEYS.map((key) => {
            const isNext = key === nextPrayer.nextKey;
            const offsetVal = key === 'Sunrise' ? 0 : offsets[key as AdjustablePrayerKey] ?? 0;
            return (
              <div
                key={key}
                className={`rounded-2xl p-4 transition ${
                  isNext ? 'bg-[#10B981]/15' : 'bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-sm font-medium ${isNext ? 'text-[#10B981]' : 'text-[#71717A]'}`}>
                    {prayersLabels[key]}
                  </span>
                  {isNext && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#10B981]" aria-label={t.upcomingBadge} />
                  )}
                </div>
                <div
                  data-testid={`prayer-time-${key}`}
                  className="mt-3 text-2xl font-semibold text-[#F4F4F5] tabular-nums"
                >
                  {adjustedTimings[key]}
                </div>
                {offsetVal !== 0 && (
                  <div className="mt-1 text-[11px] text-[#10B981] tabular-nums">
                    {offsetVal > 0 ? `+${formatNum(offsetVal, language)}` : formatNum(offsetVal, language)}{' '}
                    {t.minShort}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Adhan Audio & Browser Notification Settings */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              {adhanSettings.adhanAudioEnabled ? (
                <Volume2 className="h-5 w-5 text-[#10B981]" />
              ) : (
                <VolumeX className="h-5 w-5 text-[#71717A]" />
              )}
              <div>
                <div className="text-sm font-medium text-[#F4F4F5]">{t.adhanAudioAlert}</div>
                <button
                  type="button"
                  onClick={() => adhanAudioEngine.playAdhanChime()}
                  className="mt-0.5 text-xs text-[#10B981] hover:underline"
                >
                  {t.testTone}
                </button>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={adhanSettings.adhanAudioEnabled}
              aria-label={t.adhanAudioAlert}
              onClick={() =>
                onUpdateAdhanSettings({
                  ...adhanSettings,
                  adhanAudioEnabled: !adhanSettings.adhanAudioEnabled,
                })
              }
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                adhanSettings.adhanAudioEnabled
                  ? 'justify-end bg-[#10B981]'
                  : 'justify-start bg-white/[0.12]'
              }`}
            >
              <span className="block h-5 w-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-3 min-w-0">
              {adhanSettings.notificationsEnabled ? (
                <Bell className="h-5 w-5 shrink-0 text-[#10B981]" />
              ) : (
                <BellOff className="h-5 w-5 shrink-0 text-[#71717A]" />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[#F4F4F5]">{t.browserNotifications}</span>
                  <span
                    data-testid="notification-permission-badge"
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${permissionBadgeStyle}`}
                  >
                    {permissionBadgeLabel}
                  </span>
                </div>
                <div className="text-[11px] text-[#71717A]">{t.notificationsSub}</div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={adhanSettings.notificationsEnabled}
              aria-label={t.browserNotifications}
              onClick={() => void handleToggleNotifications()}
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
                adhanSettings.notificationsEnabled
                  ? 'justify-end bg-[#10B981]'
                  : 'justify-start bg-white/[0.12]'
              }`}
            >
              <span className="block h-5 w-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        {/* Test Notification & 10-Second Adhan Preview Row */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-4">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[#F4F4F5]">{t.testNotifAdhanBtn}</span>
              <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${permissionBadgeStyle}`}>
                {permissionBadgeLabel}
              </span>
            </div>
            {testFeedbackMsg && (
              <p data-testid="test-adhan-feedback" className="text-xs text-[#10B981]">
                {isAdhanPreviewPlaying ? `${testFeedbackMsg} · ${t.adhanPreviewPlaying}` : testFeedbackMsg}
              </p>
            )}
          </div>

          <button
            type="button"
            data-testid="test-notification-adhan-btn"
            onClick={() => void handleTestNotificationAndAdhan()}
            className={`flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 active:scale-[0.97] whitespace-nowrap shrink-0 ${
              isAdhanPreviewPlaying
                ? 'bg-rose-500 text-white hover:bg-rose-400'
                : 'bg-[#10B981] text-[#0A0A0C] hover:bg-emerald-400'
            }`}
          >
            {isAdhanPreviewPlaying ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>{t.stopAdhanBtn}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{t.testNotifAdhanBtn}</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
