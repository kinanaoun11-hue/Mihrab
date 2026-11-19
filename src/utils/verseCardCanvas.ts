import { toArabicDigits } from './quranLogic';

export interface VerseCardOptions {
  verseText: string;
  surahName: string;
  ayahNumber: number;
}

export function renderVerseCardToCanvas(
  canvas: HTMLCanvasElement,
  options: VerseCardOptions
): void {
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Deep AMOLED + Emerald gradient background
  const grad = ctx.createRadialGradient(width * 0.5, height * 0.38, 60, width * 0.5, height * 0.5, 820);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(0.55, '#042f24');
  grad.addColorStop(1, '#09090b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle geometric corner accents & double gold border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(66, 66, width - 132, height - 132);

  // Top ornamental header
  ctx.fillStyle = '#d4af37';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.font = '600 32px Cairo, sans-serif';
  ctx.fillText('﷽', width / 2, 155);

  // Subtle divider line
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 195);
  ctx.lineTo(width / 2 + 120, 195);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Wrap verse text in Amiri font
  const maxWidth = width - 190;
  const fullVerse = `﴿ ${options.verseText} ﴾`;
  const fontSize = options.verseText.length > 260 ? 44 : options.verseText.length > 140 ? 52 : 60;
  ctx.font = `400 ${fontSize}px Amiri, Georgia, serif`;
  ctx.fillStyle = '#fafafa';

  const words = fullVerse.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const lineHeight = fontSize * 1.95;
  const totalTextHeight = lines.length * lineHeight;
  let startY = Math.max(290, (height - totalTextHeight) / 2 + 20);

  for (const line of lines) {
    ctx.fillText(line, width / 2, startY);
    startY += lineHeight;
  }

  // Footer Surah & Ayah reference
  ctx.fillStyle = '#d4af37';
  ctx.font = '600 34px Cairo, sans-serif';
  const refText = `${options.surahName} · الآية ${toArabicDigits(options.ayahNumber)}`;
  ctx.fillText(refText, width / 2, height - 155);

  ctx.fillStyle = 'rgba(212, 212, 216, 0.55)';
  ctx.font = '400 24px Cairo, sans-serif';
  ctx.fillText('محراب · رفيقك اليومي للقرآن والأذكار', width / 2, height - 105);
}
