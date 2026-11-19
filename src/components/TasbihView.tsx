import React, { useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { TASBIH_PRESETS } from '../data/adhkarData';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum } from '../i18n/translations';
import type { AppLanguage } from '../types/islamic';
import { advanceTasbihCount, calculateRingProgress } from '../utils/tasbihLogic';

interface TasbihViewProps {
  count: number;
  selectedPresetId: string;
  milestone: number;
  onUpdateState: (nextCount: number, nextPresetId: string, nextMilestone: number) => void;
  language: AppLanguage;
  t: TranslationStrings['tasbih'];
}

const MILESTONE_OPTIONS = [33, 100, 1000];

export const TasbihView: React.FC<TasbihViewProps> = ({
  count,
  selectedPresetId,
  milestone,
  onUpdateState,
  language,
  t,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [milestoneNotice, setMilestoneNotice] = useState<string | null>(null);
  const [tapPulseKey, setTapPulseKey] = useState(0);

  const activePreset =
    TASBIH_PRESETS.find((p) => p.id === selectedPresetId) ?? TASBIH_PRESETS[0];

  const progress = calculateRingProgress(count, milestone);
  const completedRounds = Math.floor(count / milestone);
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const handleTap = () => {
    const res = advanceTasbihCount(count, milestone);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(res.justReachedMilestone ? [50, 40, 60] : 30);
    }
    if (res.justReachedMilestone) {
      setMilestoneNotice(`${t.milestoneReached} (${formatNum(res.nextCount, language)})`);
    } else if (milestoneNotice) {
      setMilestoneNotice(null);
    }
    setTapPulseKey((k) => k + 1);
    onUpdateState(res.nextCount, selectedPresetId, milestone);
  };

  const handleConfirmReset = () => {
    onUpdateState(0, selectedPresetId, milestone);
    setMilestoneNotice(null);
    setShowResetConfirm(false);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-6 py-2 md:py-6">
      {/* Phrase Presets & Target Milestones */}
      <section className="w-full rounded-3xl bg-white/[0.04] p-5 md:p-6">
        <div dir="rtl" className="flex flex-wrap items-center justify-center gap-2">
          {TASBIH_PRESETS.map((preset) => {
            const active = preset.id === activePreset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onUpdateState(count, preset.id, milestone)}
                className={`min-h-[40px] rounded-full px-4 py-2 font-quran text-base transition active:scale-[0.97] ${
                  active
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-white/[0.04] text-[#F4F4F5]/80 hover:bg-white/[0.08]'
                }`}
              >
                {preset.phrase}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717A]">{t.targetLabel}</span>
            {MILESTONE_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onUpdateState(count, selectedPresetId, m)}
                className={`min-h-[38px] min-w-[54px] rounded-full px-3 text-xs font-semibold tabular-nums transition active:scale-[0.97] ${
                  milestone === m
                    ? 'bg-[#10B981] text-[#052e1e]'
                    : 'bg-white/[0.05] text-[#71717A] hover:text-[#F4F4F5]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#71717A] tabular-nums">
              {t.completedRounds}{' '}
              <strong className="text-[#10B981]">{formatNum(completedRounds, language)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              aria-label={t.resetBtn}
              className="flex min-h-[38px] items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 text-xs text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.97] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#10B981]" />
              <span>{t.resetBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Distraction-Free Giant Haptic Counter */}
      <div className="flex flex-col items-center justify-center py-4">
        <p dir="rtl" className="mb-5 text-center font-quran text-3xl text-[#F4F4F5] md:text-4xl">
          {activePreset.phrase}
        </p>

        <button
          type="button"
          onClick={handleTap}
          data-testid="tasbih-tap-button"
          aria-label={`${activePreset.phrase} — ${count}`}
          className="group relative flex h-64 w-64 items-center justify-center rounded-full bg-white/[0.03] transition-transform duration-150 hover:bg-white/[0.05] active:scale-[0.97] md:h-72 md:w-72"
        >
          <svg className="h-full w-full -rotate-90" viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <circle
              cx="130"
              cy="130"
              r={radius}
              fill="none"
              stroke="#10B981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              key={tapPulseKey}
              data-testid="tasbih-count-value"
              className={`text-6xl font-light tracking-tight text-[#F4F4F5] tabular-nums md:text-7xl ${
                tapPulseKey > 0 ? 'animate-tasbih-pop' : ''
              }`}
            >
              {count}
            </span>
            <span className="mt-2 text-xs text-[#71717A] tabular-nums">
              / {formatNum(milestone, language)} · {t.ofTargetHint}
            </span>
          </div>
        </button>

        <div className="mt-5 min-h-[24px] text-center">
          {milestoneNotice && (
            <p className="animate-sheet-enter flex items-center justify-center gap-1.5 text-sm font-medium text-[#10B981]">
              <Sparkles className="h-4 w-4" />
              <span>{milestoneNotice}</span>
            </p>
          )}
        </div>
      </div>

      {/* Accessible Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tasbih-reset-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="animate-sheet-enter w-full max-w-sm rounded-3xl bg-[#111114] p-6 shadow-2xl">
            <h2 id="tasbih-reset-title" className="text-lg font-semibold text-[#F4F4F5]">
              {t.resetDialogTitle}
            </h2>
            <p className="mt-2 text-sm text-[#71717A]">{t.resetDialogBody}</p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="min-h-[44px] flex-1 rounded-2xl bg-[#10B981] py-2.5 text-sm font-semibold text-[#052e1e] transition hover:brightness-110 active:scale-[0.97]"
              >
                {t.confirmReset}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="min-h-[44px] flex-1 rounded-2xl bg-white/[0.06] py-2.5 text-sm font-medium text-[#F4F4F5] transition hover:bg-white/[0.1]"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
