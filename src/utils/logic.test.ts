import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMushafPagesFromFullQuran,
  calculateKhatmahStats,
  clampQuranFontSize,
  clampQuranFontZoom,
  clampQuranPage,
  DEFAULT_QURAN_FONT_SIZE,
  extractFeaturedReciters,
  formatSurahAudioUrl,
  getHizbNumber,
  getSurahStartPage,
  MAX_QURAN_FONT_SIZE,
  MAX_QURAN_FONT_ZOOM,
  MIN_QURAN_FONT_SIZE,
  MIN_QURAN_FONT_ZOOM,
  resolveSwipePageDelta,
  stepQuranFontSize,
  stepQuranFontZoom,
  stripBismillahPrefix,
  toArabicDigits,
} from './quranLogic';
import {
  applyPrayerTimeOffsets,
  calculateCompassRotation,
  calculateDistanceToKaabaKm,
  calculateQiblaBearing,
  cleanPrayerTimeStr,
  formatCountdownSeconds,
  getNextPrayerInfo,
  getQiblaCompassDirectionAr,
  shiftTimeMinutes,
} from './prayerLogic';
import { advanceTasbihCount, calculateRingProgress } from './tasbihLogic';
import {
  createHistoryState,
  isMihrabHistoryState,
  resolvePopStateTarget,
  resolveTabHistoryAction,
} from './navigationHistory';
import { formatNum, getLanguageMeta, LANGUAGE_OPTIONS, TRANSLATIONS } from '../i18n/translations';

test('calculateKhatmahStats computes percentage, remaining pages, and days accurately', () => {
  const start = calculateKhatmahStats(0, 20);
  assert.equal(start.percentage, 0);
  assert.equal(start.remainingPages, 604);
  assert.equal(start.estimatedDays, 31);
  assert.equal(start.isCompleted, false);

  const mid = calculateKhatmahStats(302, 10);
  assert.equal(mid.percentage, 50);
  assert.equal(mid.remainingPages, 302);
  assert.equal(mid.estimatedDays, 31);

  const done = calculateKhatmahStats(604, 15);
  assert.equal(done.percentage, 100);
  assert.equal(done.remainingPages, 0);
  assert.equal(done.estimatedDays, 0);
  assert.equal(done.isCompleted, true);
});

test('formatSurahAudioUrl zero-pads surah number and handles trailing slash', () => {
  assert.equal(
    formatSurahAudioUrl('https://server8.mp3quran.net/afs', 1),
    'https://server8.mp3quran.net/afs/001.mp3'
  );
  assert.equal(
    formatSurahAudioUrl('https://server8.mp3quran.net/afs/', 114),
    'https://server8.mp3quran.net/afs/114.mp3'
  );
});

test('toArabicDigits converts western numerals to Arabic-Indic numerals', () => {
  assert.equal(toArabicDigits(125), '١٢٥');
  assert.equal(toArabicDigits('2026'), '٢٠٢٦');
});

test('extractFeaturedReciters matches target Arabic reciters and selects Murattal moshaf', () => {
  const mockApi = [
    {
      id: 1,
      name: 'محمد صديق المنشاوي',
      moshaf: [
        { id: 10, name: 'مجود', server: 'https://s.net/m1/', surah_total: 114, surah_list: '1,2,3' },
        { id: 11, name: 'حفص عن عاصم - مرتل', server: 'https://s.net/m2/', surah_total: 114, surah_list: '1,2,3,4' },
      ],
    },
    {
      id: 2,
      name: 'مشاري العفاسي',
      moshaf: [
        { id: 12, name: 'حفص عن عاصم - مرتل', server: 'https://s.net/afs/', surah_total: 114, surah_list: '1,2' },
      ],
    },
    {
      id: 3,
      name: 'عبدالباسط عبدالصمد',
      moshaf: [
        { id: 13, name: 'حفص عن عاصم - مرتل', server: 'https://s.net/basit/', surah_total: 114, surah_list: '1,2' },
      ],
    },
  ];
  const extracted = extractFeaturedReciters(mockApi);
  assert.equal(extracted.length, 3);
  assert.equal(extracted[0].server, 'https://s.net/m2/');
  assert.equal(extracted[1].server, 'https://s.net/afs/');
  assert.equal(extracted[2].server, 'https://s.net/basit/');
});

test('calculateQiblaBearing and distance compute accurate values for Biskra, Algeria', () => {
  const bearing = calculateQiblaBearing(34.8504, 5.7281);
  assert.ok(bearing > 100 && bearing < 120, `Expected ~108 deg, got ${bearing}`);
  assert.equal(getQiblaCompassDirectionAr(bearing), 'الشرق');
  const distKm = calculateDistanceToKaabaKm(34.8504, 5.7281);
  assert.ok(distKm > 3400 && distKm < 3800, `Expected ~3600km, got ${distKm}`);
});

test('shiftTimeMinutes and applyPrayerTimeOffsets adjust timings cleanly within -15..+15 range', () => {
  assert.equal(shiftTimeMinutes('05:45', 5), '05:50');
  assert.equal(shiftTimeMinutes('00:05', -10), '23:55');
  assert.equal(shiftTimeMinutes('12:00', 25), '12:15');
  assert.equal(shiftTimeMinutes('12:00', -25), '11:45');

  const adjusted = applyPrayerTimeOffsets(
    { Fajr: '05:42', Sunrise: '07:10', Dhuhr: '12:34', Asr: '15:36', Maghrib: '17:58', Isha: '19:19' },
    { Fajr: -3, Dhuhr: 2, Asr: 0, Maghrib: 4, Isha: -5 }
  );
  assert.equal(adjusted.Fajr, '05:39');
  assert.equal(adjusted.Sunrise, '07:10');
  assert.equal(adjusted.Dhuhr, '12:36');
  assert.equal(adjusted.Maghrib, '18:02');
  assert.equal(adjusted.Isha, '19:14');
});

test('cleanPrayerTimeStr strips timezone annotations cleanly', () => {
  assert.equal(cleanPrayerTimeStr('05:42 (CET)'), '05:42');
  assert.equal(cleanPrayerTimeStr('17:58'), '17:58');
});

test('getNextPrayerInfo identifies next prayer today and wraps to tomorrow Fajr after Isha', () => {
  const timings = {
    Fajr: '05:30',
    Sunrise: '07:00',
    Dhuhr: '12:30',
    Asr: '15:30',
    Maghrib: '18:00',
    Isha: '19:30',
  };
  const morning = new Date(2026, 10, 19, 10, 0, 0);
  const nextMorning = getNextPrayerInfo(timings, morning);
  assert.equal(nextMorning.nextKey, 'Dhuhr');
  assert.equal(nextMorning.nextNameAr, 'الظهر');
  assert.equal(nextMorning.formattedCountdown, '02:30:00');

  const lateNight = new Date(2026, 10, 19, 22, 30, 0);
  const nextNight = getNextPrayerInfo(timings, lateNight);
  assert.equal(nextNight.nextKey, 'Fajr');
  assert.equal(nextNight.formattedCountdown, '07:00:00');
  assert.equal(formatCountdownSeconds(3661), '01:01:01');
});

test('Tasbih counter and ring progress work at boundaries and milestones', () => {
  const step32 = advanceTasbihCount(32, 33);
  assert.equal(step32.nextCount, 33);
  assert.equal(step32.justReachedMilestone, true);
  assert.equal(step32.completedRounds, 1);

  assert.equal(calculateRingProgress(0, 33), 0);
  assert.equal(calculateRingProgress(33, 33), 1);
  assert.ok(Math.abs(calculateRingProgress(16, 33) - 16 / 33) < 0.001);
});

test('i18n metadata maps directions and Quran translation editions for all 6 languages', () => {
  assert.equal(LANGUAGE_OPTIONS.length, 6);
  assert.equal(getLanguageMeta('ar').dir, 'rtl');
  assert.equal(getLanguageMeta('ur').dir, 'rtl');
  assert.equal(getLanguageMeta('en').dir, 'ltr');
  assert.equal(getLanguageMeta('fr').dir, 'ltr');
  assert.equal(getLanguageMeta('de').dir, 'ltr');
  assert.equal(getLanguageMeta('tr').dir, 'ltr');

  assert.equal(getLanguageMeta('en').quranEdition, 'en.sahih');
  assert.equal(getLanguageMeta('fr').quranEdition, 'fr.hamidullah');
  assert.equal(getLanguageMeta('de').quranEdition, 'de.bubenheim');
  assert.equal(getLanguageMeta('tr').quranEdition, 'tr.diyanet');
  assert.equal(getLanguageMeta('ur').quranEdition, 'ur.jalandhry');

  assert.equal(formatNum(42, 'ar'), '٤٢');
  assert.equal(formatNum(42, 'en'), '42');

  for (const opt of LANGUAGE_OPTIONS) {
    assert.ok(TRANSLATIONS[opt.code].backToHome.length > 0);
    assert.ok(TRANSLATIONS[opt.code].home.tiles.quranTitle.length > 0);
    assert.ok(TRANSLATIONS[opt.code].home.shortTiles.quran.length > 0);
    assert.ok(TRANSLATIONS[opt.code].home.shortTiles.tasbih.length > 0);
    assert.ok(TRANSLATIONS[opt.code].quran.prevPage.length > 0);
    assert.ok(TRANSLATIONS[opt.code].quran.offlineReadyBadge.length > 0);
    assert.ok(TRANSLATIONS[opt.code].qibla.activateCompass.length > 0);
  }
});

test('Mushaf page helpers resolve Surah start pages, Hizb, clamping, and strip duplicate Bismillah cleanly', () => {
  assert.equal(getSurahStartPage(1), 1);
  assert.equal(getSurahStartPage(2), 2);
  assert.equal(getSurahStartPage(112), 604);
  assert.equal(getSurahStartPage(114), 604);
  assert.equal(clampQuranPage(0), 1);
  assert.equal(clampQuranPage(999), 604);
  assert.equal(getHizbNumber(1), 1);
  assert.equal(getHizbNumber(5), 2);

  // Keeps Bismillah in Al-Fatihah (Surah 1)
  assert.equal(
    stripBismillahPrefix('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 1, 1),
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'
  );
  // Strips duplicate Bismillah from Surah 2 ayah 1 & Surah 112 ayah 1
  assert.equal(
    stripBismillahPrefix('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ', 2, 1),
    'الٓمٓ'
  );
  assert.equal(
    stripBismillahPrefix('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ', 112, 1),
    'قُلْ هُوَ ٱللَّهُ أَحَدٌ'
  );
  // Does not alter Surah 9 or subsequent ayahs
  assert.equal(stripBismillahPrefix('بَرَآءَةٌ مِّنَ ٱللَّهِ', 9, 1), 'بَرَآءَةٌ مِّنَ ٱللَّهِ');
  assert.equal(stripBismillahPrefix('ٱلْحَمْدُ لِلَّهِ', 1, 2), 'ٱلْحَمْدُ لِلَّهِ');
});

test('calculateCompassRotation computes rose rotation (-heading), Qibla needle, and ±5° alignment', () => {
  const northFacing = calculateCompassRotation(106, 0);
  assert.equal(northFacing.roseRotation, 0);
  assert.equal(northFacing.needleRotation, 106);
  assert.equal(northFacing.isAligned, false);

  const alignedHeading = calculateCompassRotation(106, 103);
  assert.equal(alignedHeading.roseRotation, -103);
  assert.equal(alignedHeading.needleRotation, 3);
  assert.equal(alignedHeading.angularDiff, 3);
  assert.equal(alignedHeading.isAligned, true);

  const wrapAligned = calculateCompassRotation(2, 359);
  assert.equal(wrapAligned.needleRotation, 3);
  assert.equal(wrapAligned.angularDiff, 3);
  assert.equal(wrapAligned.isAligned, true);
});

test('Quran font size & zoom helpers clamp and step safely within bounds', () => {
  assert.equal(clampQuranFontSize(Number.NaN), DEFAULT_QURAN_FONT_SIZE);
  assert.equal(clampQuranFontSize(10), MIN_QURAN_FONT_SIZE);
  assert.equal(clampQuranFontSize(100), MAX_QURAN_FONT_SIZE);
  assert.equal(stepQuranFontSize(26, 2), 28);
  assert.equal(stepQuranFontSize(MIN_QURAN_FONT_SIZE, -2), MIN_QURAN_FONT_SIZE);
  assert.equal(stepQuranFontSize(MAX_QURAN_FONT_SIZE, 2), MAX_QURAN_FONT_SIZE);

  assert.equal(clampQuranFontZoom(Number.NaN), 0);
  assert.equal(clampQuranFontZoom(-50), MIN_QURAN_FONT_ZOOM);
  assert.equal(clampQuranFontZoom(50), MAX_QURAN_FONT_ZOOM);
  assert.equal(stepQuranFontZoom(0, 2), 2);
  assert.equal(stepQuranFontZoom(MIN_QURAN_FONT_ZOOM, -2), MIN_QURAN_FONT_ZOOM);
  assert.equal(stepQuranFontZoom(MAX_QURAN_FONT_ZOOM, 2), MAX_QURAN_FONT_ZOOM);
});

test('resolveSwipePageDelta respects RTL/LTR direction, threshold, and vertical scroll rejection', () => {
  // RTL: swipe right (+dx) advances to next page (+1), swipe left (-dx) goes previous (-1)
  assert.equal(resolveSwipePageDelta(80, 5, 'rtl'), 1);
  assert.equal(resolveSwipePageDelta(-80, 5, 'rtl'), -1);

  // LTR: swipe left (-dx) advances to next page (+1), swipe right (+dx) goes previous (-1)
  assert.equal(resolveSwipePageDelta(-80, 5, 'ltr'), 1);
  assert.equal(resolveSwipePageDelta(80, 5, 'ltr'), -1);

  // Below threshold or mostly vertical scroll -> no page flip
  assert.equal(resolveSwipePageDelta(20, 0, 'rtl'), 0);
  assert.equal(resolveSwipePageDelta(60, 70, 'rtl'), 0);
  assert.equal(resolveSwipePageDelta(Number.NaN, 0, 'rtl'), 0);
});

test('History API helpers manage tab pushes, drawer replacements, and popstate fallbacks', () => {
  const home = createHistoryState('home', null, 1);
  assert.equal(isMihrabHistoryState(home), true);
  assert.equal(isMihrabHistoryState({ random: 1 }), false);

  const navToQuran = resolveTabHistoryAction(home, 'quran', 2);
  assert.equal(navToQuran.action, 'push');
  assert.equal(navToQuran.nextState.tab, 'quran');
  assert.equal(navToQuran.nextState.overlay, null);

  const sameTab = resolveTabHistoryAction(navToQuran.nextState, 'quran', 3);
  assert.equal(sameTab.action, 'noop');

  const withDrawer = createHistoryState('quran', 'drawer', 4);
  const navFromDrawer = resolveTabHistoryAction(withDrawer, 'prayer', 5);
  assert.equal(navFromDrawer.action, 'replace');
  assert.equal(navFromDrawer.nextState.tab, 'prayer');
  assert.equal(navFromDrawer.nextState.overlay, null);

  assert.deepEqual(resolvePopStateTarget(withDrawer), { tab: 'quran', overlay: 'drawer' });
  assert.deepEqual(resolvePopStateTarget(null), { tab: 'home', overlay: null });
});

test('buildMushafPagesFromFullQuran partitions surah ayahs into sorted Mushaf pages cleanly', () => {
  const bundle = buildMushafPagesFromFullQuran([
    {
      number: 1,
      name: 'سورة الفاتحة',
      englishName: 'Al-Fatihah',
      englishNameTranslation: 'The Opening',
      numberOfAyahs: 2,
      revelationType: 'Meccan',
      ayahs: [
        { number: 2, text: 'آية 2', numberInSurah: 2, juz: 1, page: 1, hizbQuarter: 1 },
        { number: 1, text: 'آية 1', numberInSurah: 1, juz: 1, page: 1, hizbQuarter: 1 },
      ],
    },
    {
      number: 114,
      name: 'سورة الناس',
      englishName: 'An-Nas',
      englishNameTranslation: 'Mankind',
      revelationType: 'Meccan',
      ayahs: [
        { number: 6236, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', numberInSurah: 1, juz: 30, page: 604, hizbQuarter: 240 },
      ],
    },
  ]);

  assert.equal(bundle.surahs.length, 2);
  assert.equal(bundle.surahs[1]?.numberOfAyahs, 1);
  assert.equal(bundle.pageCount, 2);
  assert.equal(bundle.pages[1]?.ayahs[0]?.number, 1);
  assert.equal(bundle.pages[1]?.ayahs[1]?.number, 2);
  assert.equal(bundle.pages[604]?.ayahs[0]?.surah.number, 114);
  assert.equal(bundle.pages[604]?.ayahs[0]?.surah.numberOfAyahs, 1);
  assert.equal('ayahs' in bundle.surahs[0], false);
});
