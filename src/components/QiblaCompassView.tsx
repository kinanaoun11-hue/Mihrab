import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Compass, MapPin, Navigation, Radio } from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum } from '../i18n/translations';
import type { AppLanguage } from '../types/islamic';
import {
  calculateCompassRotation,
  calculateDistanceToKaabaKm,
  calculateQiblaBearing,
  getLocalizedCompassDirection,
  normalizeCompassAngle,
} from '../utils/prayerLogic';

interface QiblaCompassViewProps {
  displayLocationLabel: string;
  latitude: number;
  longitude: number;
  onRequestGPS: () => void;
  geoStatus: string | null;
  language: AppLanguage;
  t: TranslationStrings['qibla'];
}

type SensorStatus = 'idle' | 'active' | 'blocked';

interface DeviceOrientationIOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationConstructorWithPerm {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export const QiblaCompassView: React.FC<QiblaCompassViewProps> = ({
  displayLocationLabel,
  latitude,
  longitude,
  onRequestGPS,
  geoStatus,
  language,
  t,
}) => {
  const [sensorHeading, setSensorHeading] = useState<number | null>(null);
  const [sensorStatus, setSensorStatus] = useState<SensorStatus>('idle');
  const [manualHeading, setManualHeading] = useState<number>(0);
  const hasAbsoluteSensorRef = useRef(false);
  const sensorReceivedRef = useRef(false);

  const attachOrientationListeners = useCallback(() => {
    const handleAbsolute = (event: Event) => {
      const oe = event as DeviceOrientationIOS;
      if (typeof oe.alpha === 'number') {
        hasAbsoluteSensorRef.current = true;
        sensorReceivedRef.current = true;
        setSensorHeading(normalizeCompassAngle(360 - oe.alpha));
        setSensorStatus('active');
      }
    };

    const handleStandard = (event: DeviceOrientationEvent) => {
      const oe = event as DeviceOrientationIOS;
      // iOS Safari reports true/magnetic heading clockwise from North
      if (typeof oe.webkitCompassHeading === 'number' && !Number.isNaN(oe.webkitCompassHeading)) {
        sensorReceivedRef.current = true;
        setSensorHeading(normalizeCompassAngle(oe.webkitCompassHeading));
        setSensorStatus('active');
        return;
      }
      // Standard fallback when deviceorientationabsolute hasn't taken over
      if (!hasAbsoluteSensorRef.current && typeof oe.alpha === 'number') {
        sensorReceivedRef.current = true;
        const heading = oe.absolute ? 360 - oe.alpha : 360 - oe.alpha;
        setSensorHeading(normalizeCompassAngle(heading));
        setSensorStatus('active');
      }
    };

    window.addEventListener('deviceorientationabsolute', handleAbsolute, true);
    window.addEventListener('deviceorientation', handleStandard, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleAbsolute, true);
      window.removeEventListener('deviceorientation', handleStandard, true);
    };
  }, []);

  // Auto-attach orientation listeners on mount and detect sandbox/blocked sensors
  useEffect(() => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setSensorStatus('blocked');
      return;
    }

    const cleanup = attachOrientationListeners();

    const detectTimer = window.setTimeout(() => {
      if (!sensorReceivedRef.current) {
        setSensorStatus((prev) => (prev === 'active' ? 'active' : 'blocked'));
      }
    }, 1200);

    return () => {
      cleanup();
      window.clearTimeout(detectTimer);
    };
  }, [attachOrientationListeners]);

  const handleActivateCompass = async () => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setSensorStatus('blocked');
      return;
    }

    const ctor = DeviceOrientationEvent as unknown as DeviceOrientationConstructorWithPerm;
    if (typeof ctor.requestPermission === 'function') {
      try {
        const permission = await ctor.requestPermission();
        if (permission !== 'granted') {
          setSensorStatus('blocked');
          return;
        }
      } catch {
        setSensorStatus('blocked');
        return;
      }
    }

    sensorReceivedRef.current = false;
    attachOrientationListeners();

    window.setTimeout(() => {
      if (!sensorReceivedRef.current) {
        setSensorStatus('blocked');
      }
    }, 1400);
  };

  const qiblaBearing = useMemo(
    () => calculateQiblaBearing(latitude, longitude),
    [latitude, longitude]
  );

  const qiblaDirection = useMemo(
    () => getLocalizedCompassDirection(qiblaBearing, t.directions8),
    [qiblaBearing, t.directions8]
  );

  const distanceKm = useMemo(
    () => calculateDistanceToKaabaKm(latitude, longitude),
    [latitude, longitude]
  );

  const activeHeading = sensorHeading !== null ? sensorHeading : manualHeading;
  const compass = useMemo(
    () => calculateCompassRotation(qiblaBearing, activeHeading),
    [qiblaBearing, activeHeading]
  );

  const isUsingSensor = sensorHeading !== null && sensorStatus === 'active';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-3xl bg-white/[0.04] p-6 text-center md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-start">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <MapPin className="h-3.5 w-3.5 text-[#10B981]" />
              <span className="font-medium text-[#F4F4F5]">{displayLocationLabel}</span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#F4F4F5] md:text-2xl">
              {t.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="activate-compass-btn"
              onClick={() => void handleActivateCompass()}
              className={`flex min-h-[44px] items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition duration-150 active:scale-[0.97] whitespace-nowrap ${
                isUsingSensor
                  ? 'bg-[#10B981]/20 text-[#10B981]'
                  : 'bg-white/[0.08] text-[#F4F4F5] hover:bg-white/[0.12]'
              }`}
            >
              <Radio className="h-4 w-4 text-[#10B981]" />
              <span>{isUsingSensor ? t.compassActiveBadge : t.activateCompass}</span>
            </button>

            <button
              type="button"
              onClick={onRequestGPS}
              className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#10B981] px-4 py-2 text-xs font-semibold text-[#052e1e] transition duration-150 hover:brightness-110 active:scale-[0.97] whitespace-nowrap"
            >
              <Navigation className="h-4 w-4" />
              <span>{t.updateGPS}</span>
            </button>
          </div>
        </div>

        {geoStatus && <p className="mt-3 text-xs text-[#10B981]">{geoStatus}</p>}

        {/* Alignment Status Pill */}
        <div className="mt-5 flex items-center justify-center">
          <div
            data-testid="qibla-alignment-badge"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
              compass.isAligned
                ? 'bg-[#10B981] text-[#052e1e]'
                : 'bg-white/[0.06] text-[#F4F4F5]'
            }`}
          >
            {compass.isAligned ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{t.alignedBadge}</span>
              </>
            ) : (
              <>
                <Compass className="h-4 w-4 text-[#10B981]" />
                <span className="tabular-nums">
                  {qiblaBearing}° {qiblaDirection} · {t.fromNorthHint}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Interactive Rotating Compass Rose & Qibla Needle */}
        <div className="relative mx-auto my-6 flex h-72 w-72 items-center justify-center md:h-80 md:w-80">
          {/* Top Phone Alignment Marker */}
          <div
            aria-hidden="true"
            className={`absolute top-0 left-1/2 -translate-x-1/2 h-3.5 w-1 rounded-full transition-colors ${
              compass.isAligned ? 'bg-[#10B981]' : 'bg-white/30'
            }`}
          />

          <svg
            viewBox="0 0 220 220"
            className="h-full w-full"
            aria-label={`${t.bearingLabel} ${qiblaBearing}°`}
          >
            {/* Subtle alignment glow ring when within ±5° */}
            <circle
              cx="110"
              cy="110"
              r="102"
              fill="#0A0A0C"
              stroke={compass.isAligned ? '#10B981' : 'rgba(255,255,255,0.08)'}
              strokeWidth={compass.isAligned ? '3' : '2'}
              className="transition-all duration-300"
            />
            <circle
              cx="110"
              cy="110"
              r="84"
              fill="none"
              stroke={compass.isAligned ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.22)'}
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Rotating Compass Rose (-heading degrees) */}
            <g
              data-testid="compass-rose-group"
              transform={`rotate(${compass.roseRotation} 110 110)`}
              className="transition-transform duration-200 ease-out"
            >
              {/* North pointer triangle */}
              <polygon points="110,13 114,20 106,20" fill="#ef4444" />
              <text x="110" y="33" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">
                {t.north}
              </text>
              <text x="195" y="114" textAnchor="middle" fill="#71717A" fontSize="12" fontWeight="600">
                {t.east}
              </text>
              <text x="110" y="201" textAnchor="middle" fill="#71717A" fontSize="12" fontWeight="600">
                {t.south}
              </text>
              <text x="25" y="114" textAnchor="middle" fill="#71717A" fontSize="12" fontWeight="600">
                {t.west}
              </text>
            </g>

            {/* Qibla Direction Needle (qiblaBearing - heading) */}
            <g
              data-testid="qibla-needle-group"
              transform={`rotate(${compass.needleRotation} 110 110)`}
              className="transition-transform duration-200 ease-out"
            >
              <polygon
                points="110,28 122,110 110,96 98,110"
                fill={compass.isAligned ? '#34d399' : '#10B981'}
              />
              {/* Kaaba Icon Tip */}
              <rect
                x="105"
                y="38"
                width="10"
                height="10"
                rx="1.5"
                fill="#0A0A0C"
                stroke="#F4F4F5"
                strokeWidth="1.2"
              />
              <polygon points="110,190 116,110 110,122 104,110" fill="rgba(255,255,255,0.14)" />
              <circle
                cx="110"
                cy="110"
                r="9"
                fill="#0A0A0C"
                stroke={compass.isAligned ? '#34d399' : '#10B981'}
                strokeWidth="2.5"
              />
            </g>
          </svg>
        </div>

        {/* Bearing & Distance Metrics */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-[#71717A]">{t.bearingLabel}</div>
            <div
              data-testid="qibla-bearing-value"
              className="mt-1 text-xl font-semibold text-[#10B981] tabular-nums"
            >
              {qiblaBearing}°
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-[#71717A]">{t.directionLabel}</div>
            <div className="mt-1 text-xl font-semibold text-[#F4F4F5]">{qiblaDirection}</div>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs text-[#71717A]">{t.distanceLabel}</div>
            <div className="mt-1 text-xl font-semibold text-[#F4F4F5] tabular-nums">
              {formatNum(distanceKm, language)} {t.kmUnit}
            </div>
          </div>
        </div>

        {/* Fallback / Manual Heading Calibration when Sensor is Blocked or Unavailable */}
        {sensorStatus === 'blocked' ? (
          <div
            data-testid="qibla-sensor-fallback"
            className="mt-5 rounded-2xl bg-white/[0.03] p-4 text-start space-y-3"
          >
            <p className="text-xs leading-relaxed text-[#71717A]">{t.sensorBlockedNotice}</p>
            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="manual-heading-slider" className="font-medium text-[#F4F4F5]">
                  {t.manualHeadingLabel}
                </label>
                <span className="font-semibold text-[#10B981] tabular-nums">
                  {manualHeading}°
                </span>
              </div>
              <input
                id="manual-heading-slider"
                data-testid="manual-heading-slider"
                type="range"
                min={0}
                max={359}
                step={1}
                value={manualHeading}
                onChange={(e) => setManualHeading(Number(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer accent-[#10B981]"
              />
            </div>
          </div>
        ) : (
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#71717A]">
            <Compass className="h-4 w-4 text-[#10B981]" />
            <span>{isUsingSensor ? t.sensorConnected : t.compassHint}</span>
          </p>
        )}
      </section>
    </div>
  );
};
