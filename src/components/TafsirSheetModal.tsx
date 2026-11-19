import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, BookmarkCheck, Download, Image as ImageIcon, Loader2, Play, X } from 'lucide-react';
import type { TranslationStrings } from '../i18n/translations';
import { formatNum } from '../i18n/translations';
import type { AppLanguage, AyahItem, SurahSummary } from '../types/islamic';
import { renderVerseCardToCanvas } from '../utils/verseCardCanvas';
import { stripBismillahPrefix } from '../utils/quranLogic';

interface TafsirSheetModalProps {
  ayah: AyahItem | null;
  surah: SurahSummary | null;
  isBookmarked: boolean;
  onToggleBookmark: (ayah: AyahItem) => void;
  onPlaySurah: (surahNumber: number) => void;
  onClose: () => void;
  language: AppLanguage;
  translatedAyahText?: string;
  translationEditionLabel?: string;
  translationIsRtl?: boolean;
  t: TranslationStrings['quran']['tafsirModal'];
}

type TafsirEdition = 'ar.muyassar' | 'ar.jalalayn';

export const TafsirSheetModal: React.FC<TafsirSheetModalProps> = ({
  ayah,
  surah,
  isBookmarked,
  onToggleBookmark,
  onPlaySurah,
  onClose,
  language,
  translatedAyahText,
  translationEditionLabel,
  translationIsRtl = false,
  t,
}) => {
  const [edition, setEdition] = useState<TafsirEdition>('ar.muyassar');
  const [tafsirText, setTafsirText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCardGenerator, setShowCardGenerator] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!ayah || !surah) return;
    let cancelled = false;
    const reference = `${surah.number}:${ayah.numberInSurah}`;

    const fetchTafsir = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${reference}/${edition}`);
        if (!res.ok) throw new Error('Tafsir fetch failed');
        const json = (await res.json()) as { data?: { text?: string } };
        if (!cancelled) {
          setTafsirText(json.data?.text ?? t.tafsirError);
        }
      } catch {
        if (!cancelled) {
          setError(t.tafsirError);
          setTafsirText('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchTafsir();
    return () => {
      cancelled = true;
    };
  }, [ayah, surah, edition, t.tafsirError]);

  useEffect(() => {
    if (!ayah) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [ayah, onClose]);

  useEffect(() => {
    if (!showCardGenerator || !ayah || !surah || !canvasRef.current) return;
    const render = async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      if (canvasRef.current) {
        renderVerseCardToCanvas(canvasRef.current, {
          verseText: stripBismillahPrefix(ayah.text, surah.number, ayah.numberInSurah),
          surahName: surah.name,
          ayahNumber: ayah.numberInSurah,
        });
      }
    };
    void render();
  }, [showCardGenerator, ayah, surah]);

  if (!ayah || !surah) return null;

  const displayVerseText = stripBismillahPrefix(ayah.text, surah.number, ayah.numberInSurah);

  const handleDownloadCard = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `mihrab-surah-${surah.number}-ayah-${ayah.numberInSurah}.png`;
    link.href = dataUrl;
    link.click();
  };

  const modalNode = (
    <>
      {/* Backdrop Overlay */}
      <div
        aria-hidden="true"
        data-testid="tafsir-backdrop"
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container & Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tafsir-modal-title"
        className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      >
        <div
          data-testid="tafsir-modal-card"
          className="pointer-events-auto relative z-50 animate-sheet-enter w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-zinc-900 text-zinc-100 border-t border-zinc-800 md:border p-5 md:p-7 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700 md:hidden" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="tafsir-modal-title" className="text-lg font-bold text-zinc-100">
                {surah.name} · {formatNum(ayah.numberInSurah, language)}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                {t.juz} {formatNum(ayah.juz, language)} · {t.page} {formatNum(ayah.page, language)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeLabel}
              data-testid="tafsir-close-btn"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Verse Text */}
          <div className="mt-5 rounded-3xl bg-zinc-800/70 border border-zinc-800 p-5 text-center space-y-3">
            <p dir="rtl" className="font-quran text-2xl leading-[2.3] text-zinc-100 md:text-3xl">
              {displayVerseText}
            </p>
            {translatedAyahText && (
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-[11px] font-semibold text-[#10B981] mb-1">
                  {t.translationHeading}
                  {translationEditionLabel ? ` · ${translationEditionLabel}` : ''}
                </div>
                <p
                  dir={translationIsRtl ? 'rtl' : 'ltr'}
                  className="text-sm leading-relaxed text-zinc-300"
                >
                  {translatedAyahText}
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-testid="tafsir-bookmark-btn"
              onClick={() => onToggleBookmark(ayah)}
              className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                isBookmarked
                  ? 'bg-[#10B981] text-[#0A0A0C]'
                  : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span>{isBookmarked ? t.bookmarked : t.bookmarkVerse}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCardGenerator((prev) => !prev)}
              className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                showCardGenerator
                  ? 'bg-[#10B981]/20 text-[#10B981]'
                  : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
              }`}
            >
              <ImageIcon className="h-4 w-4 text-[#10B981]" />
              <span>{showCardGenerator ? t.showTafsir : t.shareCard}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onPlaySurah(surah.number);
                onClose();
              }}
              className="flex min-h-[44px] items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-100 transition-all duration-150 hover:bg-zinc-700 active:scale-[0.97]"
            >
              <Play className="h-4 w-4 text-[#10B981]" />
              <span>{t.listenSurah}</span>
            </button>
          </div>

          {/* Share Card Canvas View vs Tafsir View */}
          {showCardGenerator ? (
            <div className="mt-6 space-y-4">
              <div className="overflow-hidden rounded-3xl bg-zinc-950 p-3 border border-zinc-800">
                <canvas
                  ref={canvasRef}
                  data-testid="verse-card-canvas"
                  className="mx-auto max-h-[380px] w-auto rounded-2xl object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleDownloadCard}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#10B981] px-5 py-3 text-sm font-bold text-[#0A0A0C] transition-all duration-150 hover:bg-emerald-400 active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                <span>{t.downloadCard}</span>
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-[#10B981]">{t.tafsirHeading}</h3>
                <div className="flex items-center gap-1 rounded-2xl bg-zinc-800/80 p-1">
                  <button
                    type="button"
                    onClick={() => setEdition('ar.muyassar')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                      edition === 'ar.muyassar'
                        ? 'bg-[#10B981] text-[#0A0A0C] font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {t.muyassar}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdition('ar.jalalayn')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                      edition === 'ar.jalalayn'
                        ? 'bg-[#10B981] text-[#0A0A0C] font-semibold'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {t.jalalayn}
                  </button>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-zinc-800/70 border border-zinc-800 p-4 min-h-[110px]">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-300">
                    <Loader2 className="h-4 w-4 animate-spin text-[#10B981]" />
                    <span>{t.loadingTafsir}</span>
                  </div>
                ) : error ? (
                  <p className="text-sm leading-relaxed text-zinc-300">{error}</p>
                ) : (
                  <p
                    dir="rtl"
                    data-testid="tafsir-body-text"
                    className="text-right text-base leading-[2] text-zinc-100"
                  >
                    {tafsirText}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
};
