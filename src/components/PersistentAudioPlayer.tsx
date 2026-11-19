import React from 'react';
import { Loader2, Pause, Play } from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import type { FeaturedReciter } from '../types/islamic';

interface PersistentAudioPlayerProps {
  reciter: FeaturedReciter;
  surahName: string;
  isPlaying: boolean;
  isLoading: boolean;
  audioError: string | null;
  onTogglePlay: () => void;
  onOpenRecitationsTab: () => void;
  t: TranslationStrings['audio']['player'];
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  reciter,
  surahName,
  isPlaying,
  isLoading,
  audioError,
  onTogglePlay,
  onOpenRecitationsTab,
  t,
}) => {
  return (
    <div
      role="region"
      aria-label={t.openRecitations}
      data-testid="persistent-audio-player"
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 pb-safe"
    >
      <div className="relative mx-auto max-w-xl">
        {/* Living Ambient Breathing Glow when playing */}
        {isPlaying && (
          <div
            aria-hidden="true"
            data-testid="ambient-breathing-glow"
            className="animate-ambient-breathe pointer-events-none absolute inset-x-4 bottom-2 top-0 rounded-2xl bg-[#10B981]/20 blur-xl"
          />
        )}

        {/* Sleek Floating Pill-Shaped Mini-Player (Surah, Reciter, Play/Pause only) */}
        <div className="pointer-events-auto relative mx-3 mb-2 flex items-center justify-between gap-3 rounded-2xl bg-zinc-900/90 px-3 py-2 shadow-2xl shadow-black/70 backdrop-blur-xl">
          <button
            type="button"
            data-testid="mini-player-toggle-btn"
            onClick={onTogglePlay}
            aria-label={isPlaying ? t.pauseLabel : t.playLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-[#0A0A0C] transition-transform duration-150 hover:bg-emerald-400 active:scale-[0.95]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            data-testid="mini-player-open-recitations-btn"
            onClick={onOpenRecitationsTab}
            className="min-w-0 flex-1 text-start"
          >
            <div className="truncate font-quran text-base font-bold text-[#F4F4F5]">
              {surahName}
            </div>
            <div className="truncate text-xs text-[#71717A]">
              {audioError ? audioError : isLoading ? t.loading : reciter.name}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
