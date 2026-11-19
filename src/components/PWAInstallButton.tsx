import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  installAppLabel?: string;
  installIOSLabel?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  installAppLabel = 'تثبيت التطبيق',
  installIOSLabel = 'تثبيت على iOS',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="flex min-h-[40px] items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.97] whitespace-nowrap shrink-0"
      >
        <Download className="h-4 w-4 text-[#10B981]" />
        <span>{installAppLabel}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex min-h-[40px] items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-[#F4F4F5] transition hover:bg-white/[0.1] active:scale-[0.97] whitespace-nowrap shrink-0"
        >
          <Share className="h-4 w-4 text-[#10B981]" />
          <span>{installIOSLabel}</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <div className="animate-sheet-enter w-full max-w-sm rounded-3xl bg-[#111114] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 id="ios-install-title" className="text-base font-semibold text-[#F4F4F5]">
                  تثبيت محراب على الآيفون والآيباد
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="إغلاق نافذة التثبيت"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#71717A] hover:text-[#F4F4F5]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#F4F4F5]/80">
                <li>١. اضغط على زر المشاركة (Share) في شريط متصفح سفاري.</li>
                <li>٢. مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية».</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-[#10B981] py-2.5 text-sm font-semibold text-[#052e1e] transition hover:brightness-110 active:scale-[0.97]"
              >
                حسناً
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
