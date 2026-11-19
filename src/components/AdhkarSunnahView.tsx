import React, { useMemo, useState } from 'react';
import { Check, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { ADHKAR_CATEGORIES, ADHKAR_ITEMS, DAILY_SUNNAH_LIST } from '../data/adhkarData';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum } from '../i18n/translations';
import type { AdhkarCategory, AppLanguage } from '../types/islamic';
import { calculateRingProgress } from '../utils/tasbihLogic';

interface AdhkarSunnahViewProps {
  dhikrCounts: Record<string, number>;
  onIncrementDhikr: (id: string, targetCount: number) => void;
  onResetCategory: (ids: string[]) => void;
  completedSunnahIds: string[];
  onToggleSunnah: (id: string) => void;
  language: AppLanguage;
  t: TranslationStrings['adhkar'];
}

export const AdhkarSunnahView: React.FC<AdhkarSunnahViewProps> = ({
  dhikrCounts,
  onIncrementDhikr,
  onResetCategory,
  completedSunnahIds,
  onToggleSunnah,
  language,
  t,
}) => {
  const [activeSection, setActiveSection] = useState<'adhkar' | 'sunnah'>('adhkar');
  const [activeCategory, setActiveCategory] = useState<AdhkarCategory>('morning');

  const categoryItems = useMemo(
    () => ADHKAR_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const completedInCategory = useMemo(
    () =>
      categoryItems.filter((item) => (dhikrCounts[item.id] ?? 0) >= item.targetCount).length,
    [categoryItems, dhikrCounts]
  );

  const handleTapDhikr = (id: string, targetCount: number) => {
    const current = dhikrCounts[id] ?? 0;
    if (current >= targetCount) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(30);
    }
    onIncrementDhikr(id, targetCount);
  };

  return (
    <div className="space-y-6">
      {/* Header & Section Switch */}
      <section className="rounded-3xl bg-white/[0.04] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#F4F4F5] md:text-2xl">
              {t.title}
            </h1>
            <p className="mt-1 text-xs text-[#71717A]">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.04] p-1">
            <button
              type="button"
              onClick={() => setActiveSection('adhkar')}
              className={`min-h-[42px] rounded-xl px-4 py-1.5 text-xs font-semibold transition active:scale-[0.97] whitespace-nowrap ${
                activeSection === 'adhkar'
                  ? 'bg-[#10B981] text-[#052e1e]'
                  : 'text-[#71717A] hover:text-[#F4F4F5]'
              }`}
            >
              {t.adhkarTab}
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sunnah')}
              className={`min-h-[42px] rounded-xl px-4 py-1.5 text-xs font-semibold transition active:scale-[0.97] whitespace-nowrap ${
                activeSection === 'sunnah'
                  ? 'bg-[#10B981] text-[#052e1e]'
                  : 'text-[#71717A] hover:text-[#F4F4F5]'
              }`}
            >
              {t.sunnahTab} ({formatNum(completedSunnahIds.length, language)}/
              {formatNum(DAILY_SUNNAH_LIST.length, language)})
            </button>
          </div>
        </div>

        {/* Category Filter Bar for Adhkar */}
        {activeSection === 'adhkar' && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {ADHKAR_CATEGORIES.map((cat) => {
                const active = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-medium transition active:scale-[0.97] whitespace-nowrap ${
                      active
                        ? 'bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-white/[0.04] text-[#71717A] hover:bg-white/[0.08] hover:text-[#F4F4F5]'
                    }`}
                  >
                    {t.categories[cat.id]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs text-[#71717A]">
              <span className="tabular-nums">
                {t.completedCount}: {formatNum(completedInCategory, language)} /{' '}
                {formatNum(categoryItems.length, language)}
              </span>
              <button
                type="button"
                onClick={() => onResetCategory(categoryItems.map((i) => i.id))}
                className="flex min-h-[38px] items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 text-xs text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.97] whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#10B981]" />
                <span>{t.resetCategory}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Content Cards */}
      {activeSection === 'adhkar' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryItems.map((item) => {
            const current = dhikrCounts[item.id] ?? 0;
            const remaining = Math.max(0, item.targetCount - current);
            const isDone = remaining === 0;
            const progress = isDone ? 1 : calculateRingProgress(current, item.targetCount);
            const radius = 24;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference * (1 - progress);

            return (
              <article
                key={item.id}
                className={`flex flex-col justify-between rounded-3xl p-6 transition ${
                  isDone ? 'bg-[#10B981]/[0.08]' : 'bg-white/[0.04]'
                }`}
              >
                <div dir="rtl" className="text-right">
                  <p className="font-quran text-xl leading-[2.1] text-[#F4F4F5] md:text-2xl">
                    {item.text}
                  </p>
                  <p className="mt-3 text-xs text-[#71717A]">
                    {item.reference}
                    {item.virtue ? ` · ${item.virtue}` : ''}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between pt-2">
                  <span className="text-xs text-[#71717A] tabular-nums">
                    {t.requiredCount}: {formatNum(item.targetCount, language)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTapDhikr(item.id, item.targetCount)}
                    disabled={isDone}
                    aria-label={isDone ? t.doneLabel : `${t.tapToCount} (${remaining})`}
                    className={`flex min-h-[56px] items-center gap-3 rounded-2xl px-4 py-2 transition-transform duration-150 active:scale-[0.97] ${
                      isDone
                        ? 'bg-[#10B981]/20 text-[#10B981]'
                        : 'bg-white/[0.06] text-[#F4F4F5] hover:bg-white/[0.1]'
                    }`}
                  >
                    <div className="relative flex h-12 w-12 items-center justify-center">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 60 60">
                        <circle
                          cx="30"
                          cy="30"
                          r={radius}
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r={radius}
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 ease-out"
                        />
                      </svg>
                      <span className="absolute text-sm font-semibold tabular-nums">
                        {isDone ? (
                          <Check className="h-4 w-4 text-[#10B981]" />
                        ) : (
                          formatNum(remaining, language)
                        )}
                      </span>
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {isDone ? t.doneLabel : t.tapToCount}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DAILY_SUNNAH_LIST.map((sunnah) => {
            const checked = completedSunnahIds.includes(sunnah.id);
            return (
              <button
                key={sunnah.id}
                type="button"
                onClick={() => onToggleSunnah(sunnah.id)}
                className={`flex items-start justify-between gap-4 rounded-3xl p-6 text-start transition duration-150 active:scale-[0.97] ${
                  checked
                    ? 'bg-[#10B981]/[0.1]'
                    : 'bg-white/[0.04] hover:bg-white/[0.06]'
                }`}
              >
                <div dir="rtl" className="space-y-1.5 text-right">
                  <div className="flex items-center gap-2 text-xs text-[#10B981]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{sunnah.timeLabel}</span>
                    <span aria-hidden="true" className="text-[#71717A]">·</span>
                    <span className="text-[#71717A]">{sunnah.reference}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#F4F4F5]">{sunnah.title}</h3>
                  <p className="text-sm leading-relaxed text-[#71717A]">{sunnah.description}</p>
                </div>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                    checked
                      ? 'bg-[#10B981] text-[#052e1e]'
                      : 'bg-white/[0.06] text-[#71717A]'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
