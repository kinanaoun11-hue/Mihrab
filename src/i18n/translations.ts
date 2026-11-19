import type { AdhkarCategory, AppLanguage, PrayerKey } from '../types/islamic';
import { toArabicDigits } from '../utils/quranLogic';

export interface LanguageOption {
  code: AppLanguage;
  nativeName: string;
  dir: 'rtl' | 'ltr';
  quranEdition: string | null;
  quranTranslationLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'ar', nativeName: 'العربية', dir: 'rtl', quranEdition: null, quranTranslationLabel: 'العربية' },
  { code: 'en', nativeName: 'English', dir: 'ltr', quranEdition: 'en.sahih', quranTranslationLabel: 'Saheeh International' },
  { code: 'fr', nativeName: 'Français', dir: 'ltr', quranEdition: 'fr.hamidullah', quranTranslationLabel: 'Hamidullah' },
  { code: 'de', nativeName: 'Deutsch', dir: 'ltr', quranEdition: 'de.bubenheim', quranTranslationLabel: 'Bubenheim & Elyas' },
  { code: 'tr', nativeName: 'Türkçe', dir: 'ltr', quranEdition: 'tr.diyanet', quranTranslationLabel: 'Diyanet İşleri' },
  { code: 'ur', nativeName: 'اردو', dir: 'rtl', quranEdition: 'ur.jalandhry', quranTranslationLabel: 'فتح محمد جالندھری' },
];

export function getLanguageMeta(lang: AppLanguage): LanguageOption {
  return LANGUAGE_OPTIONS.find((l) => l.code === lang) ?? LANGUAGE_OPTIONS[0];
}

export function formatNum(value: number | string, lang: AppLanguage): string {
  if (lang === 'ar') return toArabicDigits(value);
  return String(value);
}

export interface TranslationStrings {
  brandName: string;
  backToHome: string;
  homeLabel: string;
  languageLabel: string;
  installApp: string;
  installIOS: string;
  offlineBanner: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  drawerTitle: string;
  drawerItems: {
    home: string;
    quran: string;
    audio: string;
    prayer: string;
    qibla: string;
    adhkar: string;
    tasbih: string;
  };
  subpageTitles: {
    quran: string;
    audio: string;
    prayer: string;
    qibla: string;
    adhkar: string;
    tasbih: string;
  };
  home: {
    nextPrayer: string;
    timeRemaining: string;
    adhanOn: string;
    adhanMuted: string;
    prayerAndAdjustBtn: string;
    khatmahTitle: string;
    pagesReadOf: string; // "{read} / {total}"
    dailyGoalLabel: string;
    daysLeft: string;
    completeDailyGoal: string;
    continueReading: string;
    continueReadingFromPage: string;
    tiles: {
      quranTitle: string;
      quranSub: string;
      lastReadPrefix: string;
      audioTitle: string;
      audioSub: string;
      audioMetaIdle: string;
      audioMetaActive: string;
      prayerTitle: string;
      prayerSub: string;
      qiblaTitle: string;
      qiblaSub: string;
      adhkarTitle: string;
      adhkarSub: string;
      adhkarMetaPrefix: string;
      tasbihTitle: string;
      tasbihSub: string;
      tasbihMetaPrefix: string;
    };
    shortTiles: {
      quran: string;
      audio: string;
      prayer: string;
      qibla: string;
      adhkar: string;
      tasbih: string;
    };
  };
  prayers: Record<PrayerKey, string>;
  qibla: {
    title: string;
    updateGPS: string;
    bearingLabel: string;
    directionLabel: string;
    distanceLabel: string;
    kmUnit: string;
    sensorConnected: string;
    compassHint: string;
    north: string;
    east: string;
    south: string;
    west: string;
    directions8: string[];
    activateCompass: string;
    compassActiveBadge: string;
    sensorBlockedNotice: string;
    manualHeadingLabel: string;
    alignedBadge: string;
    fromNorthHint: string;
  };
  prayerView: {
    adhanAt: string;
    useGPS: string;
    adjustTimes: string;
    adjustPanelTitle: string;
    adjustPanelSub: string;
    resetOffsets: string;
    currentTime: string;
    minShort: string;
    calcMethodLabel: string;
    manualCoordsTitle: string;
    cityNamePlaceholder: string;
    latPlaceholder: string;
    lonPlaceholder: string;
    applyCoordsBtn: string;
    coordError: string;
    todayTimings: string;
    openQibla: string;
    upcomingBadge: string;
    adjustedBadge: string;
    adhanAudioAlert: string;
    testTone: string;
    browserNotifications: string;
    notificationsSub: string;
    geoUnsupported: string;
    geoLocating: string;
    geoSuccess: string;
    geoFail: string;
    notifUnsupported: string;
    notifAllow: string;
    notifBlocked: string;
    testNotifAdhanBtn: string;
    stopAdhanBtn: string;
    permGranted: string;
    permDenied: string;
    permDefault: string;
    sampleAdhanTitle: string;
    sampleAdhanBody: string;
    adhanPreviewPlaying: string;
  };
  quran: {
    khatmahBannerLabel: string;
    khatmahCompleted: string;
    pagesReadHeading: string; // "{read} / {total} pages"
    progressLabel: string;
    remainingPages: string;
    estimatedDays: string;
    dailyGoalInput: string;
    completeGoalBtn: string;
    surahIndexTab: string;
    bookmarksTab: string;
    searchSurahPlaceholder: string;
    loadingSurahs: string;
    noSurahsFound: string;
    noBookmarks: string;
    ayahWord: string;
    meccan: string;
    medinan: string;
    surahListBtn: string;
    readerHint: string;
    playRecitation: string;
    loadingSurah: string;
    surahLoadError: string;
    retry: string;
    tafsirHint: string;
    prevSurah: string;
    nextSurah: string;
    toggleTranslation: string;
    translationEditionLabel: string;
    loadingTranslation: string;
    pageLabel: string;
    juzLabel: string;
    hizbLabel: string;
    prevPage: string;
    nextPage: string;
    jumpToPageLabel: string;
    goToPageBtn: string;
    pageLoadError: string;
    continueReadingFromPage: string;
    ayahShort: string;
    bookmarkPage: string;
    pageBookmarked: string;
    pageBookmarkBadge: string;
    verseBookmarkBadge: string;
    fontSizeDecrease: string;
    fontSizeIncrease: string;
    fontSizeLabel: string;
    indexShortBtn: string;
    settingsLabel: string;
    resetFontAuto: string;
    fontAutoLabel: string;
    offlineReadyBadge: string;
    tafsirModal: {
      juz: string;
      page: string;
      bookmarked: string;
      bookmarkVerse: string;
      shareCard: string;
      showTafsir: string;
      listenSurah: string;
      downloadCard: string;
      tafsirHeading: string;
      muyassar: string;
      jalalayn: string;
      loadingTafsir: string;
      tafsirError: string;
      translationHeading: string;
      closeLabel: string;
    };
  };
  audio: {
    title: string;
    subtitle: string;
    searchReciter: string;
    updatingReciters: string;
    surahsBy: string;
    filterSurahs: string;
    reciterVol: string;
    player: {
      loading: string;
      openRecitations: string;
      prevSurah: string;
      nextSurah: string;
      playLabel: string;
      pauseLabel: string;
    };
  };
  adhkar: {
    title: string;
    subtitle: string;
    adhkarTab: string;
    sunnahTab: string;
    completedCount: string;
    resetCategory: string;
    requiredCount: string;
    doneLabel: string;
    tapToCount: string;
    categories: Record<AdhkarCategory, string>;
  };
  tasbih: {
    targetLabel: string;
    completedRounds: string;
    resetBtn: string;
    ofTargetHint: string;
    milestoneReached: string;
    resetDialogTitle: string;
    resetDialogBody: string;
    confirmReset: string;
    cancel: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationStrings> = {
  ar: {
    brandName: 'محراب',
    backToHome: 'العودة للرئيسية',
    homeLabel: 'الرئيسية',
    languageLabel: 'اللغة',
    installApp: 'تثبيت التطبيق',
    installIOS: 'تثبيت على iOS',
    offlineBanner: 'وضع عدم الاتصال · يتم استخدام البيانات المحفوظة',
    openMenuLabel: 'فتح القائمة الجانبية',
    closeMenuLabel: 'إغلاق القائمة الجانبية',
    drawerTitle: 'التنقل السريع',
    drawerItems: {
      home: 'الرئيسية',
      quran: 'القرآن الكريم والتفسير',
      audio: 'التلاوات',
      prayer: 'مواقيت الصلاة',
      qibla: 'اتجاه القبلة',
      adhkar: 'حصن المسلم والسنن',
      tasbih: 'المسبحة الإلكترونية',
    },
    subpageTitles: {
      quran: 'القرآن الكريم والتفسير',
      audio: 'التلاوات',
      prayer: 'مواقيت الصلاة والتعديل',
      qibla: 'اتجاه القبلة',
      adhkar: 'حصن المسلم والسنن',
      tasbih: 'المسبحة الإلكترونية',
    },
    home: {
      nextPrayer: 'الصلاة القادمة',
      timeRemaining: 'المتبقي على الأذان',
      adhanOn: 'تنبيه الأذان مفعّل',
      adhanMuted: 'الأذان صامت',
      prayerAndAdjustBtn: 'مواقيت الصلاة وتعديلها',
      khatmahTitle: 'متابع الختمة اليومي',
      pagesReadOf: 'صفحة',
      dailyGoalLabel: 'الورد اليومي',
      daysLeft: 'يوماً متبقياً',
      completeDailyGoal: 'إتمام ورد اليوم',
      continueReading: 'متابعة القراءة',
      continueReadingFromPage: 'متابعة القراءة من صفحة {page}',
      tiles: {
        quranTitle: 'القرآن الكريم والتفسير',
        quranSub: 'القراءة العثمانية، التفسير وبطاقات الآيات',
        lastReadPrefix: 'آخر قراءة',
        audioTitle: 'التلاوات',
        audioSub: 'كبار القراء برواية حفص',
        audioMetaIdle: 'تلاوات مرتلة',
        audioMetaActive: 'قيد التشغيل',
        prayerTitle: 'مواقيت الصلاة',
        prayerSub: 'الأوقات اليومية وتعديل الدقائق وطرق الحساب',
        qiblaTitle: 'اتجاه القبلة',
        qiblaSub: 'بوصلة القبلة التفاعلية نحو مكة المكرمة',
        adhkarTitle: 'حصن المسلم والسنن',
        adhkarSub: 'أذكار الصباح والمساء والرقية دون إنترنت',
        adhkarMetaPrefix: 'المنجز',
        tasbihTitle: 'المسبحة الإلكترونية',
        tasbihSub: 'عدّاد لمسي هادئ مع اهتزاز وأهداف ذكر',
        tasbihMetaPrefix: 'الرصيد الحالي',
      },
      shortTiles: {
        quran: 'القرآن',
        audio: 'التلاوات',
        prayer: 'الصلاة',
        qibla: 'القبلة',
        adhkar: 'الأذكار',
        tasbih: 'المسبحة',
      },
    },
    prayers: {
      Fajr: 'الفجر',
      Sunrise: 'الشروق',
      Dhuhr: 'الظهر',
      Asr: 'العصر',
      Maghrib: 'المغرب',
      Isha: 'العشاء',
    },
    qibla: {
      title: 'بوصلة اتجاه القبلة المشرفة',
      updateGPS: 'تحديث عبر GPS',
      bearingLabel: 'زاوية القبلة',
      directionLabel: 'الاتجاه',
      distanceLabel: 'المسافة إلى الكعبة',
      kmUnit: 'كم',
      sensorConnected: 'البوصلة متصلة بحساس الاتجاه في جهازك.',
      compassHint: 'اتجه نحو المؤشر الذهبي نسبةً إلى الشمال الجغرافي.',
      north: 'شمال',
      east: 'شرق',
      south: 'جنوب',
      west: 'غرب',
      directions8: ['الشمال', 'الشمال الشرقي', 'الشرق', 'الجنوب الشرقي', 'الجنوب', 'الجنوب الغربي', 'الغرب', 'الشمال الغربي'],
      activateCompass: 'تفعيل البوصلة',
      compassActiveBadge: 'الحساس نشط',
      sensorBlockedNotice: 'حساسات الاتجاه غير متوفرة أو محجوبة في هذا المتصفح. يمكنك الاعتماد على الزاوية من الشمال أدناه أو تجربة التوجيه اليدوي:',
      manualHeadingLabel: 'زاوية اتجاه الهاتف يدوياً (من الشمال)',
      alignedBadge: 'أنت متجه نحو القبلة المشرفة',
      fromNorthHint: 'عن الشمال الجغرافي',
    },
    prayerView: {
      adhanAt: 'الأذان الساعة',
      useGPS: 'تحديد موقعي (GPS)',
      adjustTimes: 'تعديل المواقيت',
      adjustPanelTitle: 'تعديل المواقيت وإعدادات الحساب',
      adjustPanelSub: 'اضبط فروق الدقائق (-15 إلى +15 دقيقة) لكل صلاة لتتطابق مع أذان المسجد المحلي',
      resetOffsets: 'تصفير الفروقات',
      currentTime: 'الوقت الحالي',
      minShort: 'د',
      calcMethodLabel: 'طريقة الحساب الفقهية',
      manualCoordsTitle: 'إدخال الإحداثيات يدوياً',
      cityNamePlaceholder: 'اسم المدينة',
      latPlaceholder: 'خط العرض (Lat)',
      lonPlaceholder: 'خط الطول (Lon)',
      applyCoordsBtn: 'تطبيق الإحداثيات وحساب المواقيت',
      coordError: 'يرجى إدخال إحداثيات صالحة (خط العرض -90..90 وخط الطول -180..180).',
      todayTimings: 'مواقيت الصلاة اليوم',
      openQibla: 'فتح بوصلة القبلة',
      upcomingBadge: 'القادمة',
      adjustedBadge: 'معدل',
      adhanAudioAlert: 'تنبيه الأذان الصوتي',
      testTone: 'تجربة نغمة التنبيه',
      browserNotifications: 'إشعارات المتصفح',
      notificationsSub: 'تنبيه فوري عند دخول الوقت',
      geoUnsupported: 'المتصفح لا يدعم تحديد الموقع الجغرافي.',
      geoLocating: 'جاري تحديد موقعك...',
      geoSuccess: 'تم تحديث المواقيت والقبلة حسب موقعك الحالي.',
      geoFail: 'تعذر الحصول على إذن الموقع، تم الإبقاء على الموقع المختار.',
      notifUnsupported: 'المتصفح لا يدعم إشعارات النظام.',
      notifAllow: 'يرجى السماح بالإشعارات من إعدادات المتصفح.',
      notifBlocked: 'تم حظر الإشعارات في المتصفح.',
      testNotifAdhanBtn: 'تجربة الإشعار والأذان',
      stopAdhanBtn: 'إيقاف الأذان',
      permGranted: 'مفعّلة',
      permDenied: 'مرفوضة',
      permDefault: 'تحتاج تفعيل',
      sampleAdhanTitle: 'حان الآن موعد أذان العصر — تجربة',
      sampleAdhanBody: 'تم إرسال إشعار تجريبي مع تشغيل معاينة الأذان في تطبيق محراب.',
      adhanPreviewPlaying: 'جاري تشغيل معاينة الأذان (10 ثوانٍ)...',
    },
    quran: {
      khatmahBannerLabel: 'متابع الختمة القرآنية',
      khatmahCompleted: 'أتممت ختمة القرآن الكريم، تقبل الله طاعتك',
      pagesReadHeading: 'صفحة مقروءة',
      progressLabel: 'نسبة الإنجاز',
      remainingPages: 'المتبقي',
      estimatedDays: 'المدة المقدرة',
      dailyGoalInput: 'الورد اليومي (صفحة):',
      completeGoalBtn: 'إتمام ورد اليوم',
      surahIndexTab: 'فهرس السور',
      bookmarksTab: 'المحفوظات',
      searchSurahPlaceholder: 'ابحث باسم السورة أو رقمها...',
      loadingSurahs: 'جاري تحميل فهرس السور...',
      noSurahsFound: 'لا توجد سورة مطابقة للبحث.',
      noBookmarks: 'لم تحفظ أي آية بعد. اضغط على أي آية لعرض تفسيرها وحفظها.',
      ayahWord: 'آية',
      meccan: 'مكية',
      medinan: 'مدنية',
      surahListBtn: 'فهرس السور',
      readerHint: 'اضغط على أي آية للتفسير والمشاركة',
      playRecitation: 'تشغيل التلاوة',
      loadingSurah: 'جاري تحميل آيات السورة الكريمة...',
      surahLoadError: 'تعذر تحميل نص السورة. تأكد من اتصالك بالإنترنت وحاول مجدداً.',
      retry: 'إعادة المحاولة',
      tafsirHint: 'تفسير',
      prevSurah: 'السورة السابقة',
      nextSurah: 'السورة التالية',
      toggleTranslation: 'إظهار الترجمة',
      translationEditionLabel: 'الترجمة',
      loadingTranslation: 'جاري تحميل الترجمة...',
      pageLabel: 'صفحة',
      juzLabel: 'الجزء',
      hizbLabel: 'الحزب',
      prevPage: 'الصفحة السابقة',
      nextPage: 'الصفحة التالية',
      jumpToPageLabel: 'انتقال لصفحة',
      goToPageBtn: 'انتقال',
      pageLoadError: 'تعذر تحميل صفحة المصحف. تأكد من اتصالك بالإنترنت وحاول مجدداً.',
      continueReadingFromPage: 'متابعة القراءة من صفحة {page}',
      ayahShort: 'آية',
      bookmarkPage: 'حفظ الصفحة كعلامة',
      pageBookmarked: 'الصفحة محفوظة كعلامة',
      pageBookmarkBadge: 'علامة صفحة',
      verseBookmarkBadge: 'علامة آية',
      fontSizeDecrease: 'تصغير الخط',
      fontSizeIncrease: 'تكبير الخط',
      fontSizeLabel: 'حجم الخط',
      indexShortBtn: 'فهرس',
      settingsLabel: 'إعدادات المصحف',
      resetFontAuto: 'تلقائي',
      fontAutoLabel: 'تلقائي',
      offlineReadyBadge: 'متاح بدون إنترنت ✓',
      tafsirModal: {
        juz: 'الجزء',
        page: 'الصفحة',
        bookmarked: 'محفوظة كعلامة',
        bookmarkVerse: 'حفظ كعلامة',
        shareCard: 'بطاقة مشاركة الآية',
        showTafsir: 'عرض التفسير',
        listenSurah: 'استماع للسورة',
        downloadCard: 'تحميل بطاقة الآية (PNG)',
        tafsirHeading: 'التفسير',
        muyassar: 'التفسير الميسر',
        jalalayn: 'تفسير الجلالين',
        loadingTafsir: 'جاري تحميل التفسير...',
        tafsirError: 'تعذر الاتصال بخدمة التفسير. تأكد من اتصالك بالإنترنت.',
        translationHeading: 'ترجمة معاني الآية',
        closeLabel: 'إغلاق نافذة التفسير',
      },
    },
    audio: {
      title: 'مشغل التلاوات المباركة',
      subtitle: 'اختر القارئ ثم السورة للاستماع المباشر عبر mp3quran',
      searchReciter: 'ابحث عن قارئ...',
      updatingReciters: 'جاري تحديث قائمة القراء...',
      surahsBy: 'سور القرآن بصوت',
      filterSurahs: 'تصفية السور...',
      reciterVol: 'مستوى صوت القارئ',
      player: {
        loading: 'جاري التحميل...',
        openRecitations: 'التلاوات',
        prevSurah: 'السورة السابقة',
        nextSurah: 'السورة التالية',
        playLabel: 'تشغيل التلاوة',
        pauseLabel: 'إيقاف التلاوة مؤقتاً',
      },
    },
    adhkar: {
      title: 'حصن المسلم والسنن اليومية',
      subtitle: 'أذكار مأثورة محفوظة محلياً للعمل دون اتصال بالإنترنت في أي وقت',
      adhkarTab: 'الأذكار والرقية',
      sunnahTab: 'السنن اليومية',
      completedCount: 'المنجز',
      resetCategory: 'إعادة القسم',
      requiredCount: 'التكرار المطلوب',
      doneLabel: 'تم بحمد الله',
      tapToCount: 'اضغط للعد',
      categories: {
        morning: 'أذكار الصباح',
        evening: 'أذكار المساء',
        afterPrayer: 'بعد الصلاة',
        sleep: 'أذكار النوم',
        ruqyah: 'الرقية الشرعية',
      },
    },
    tasbih: {
      targetLabel: 'الهدف:',
      completedRounds: 'الدورات المكتملة:',
      resetBtn: 'تصفير',
      ofTargetHint: 'اضغط للتسبيح',
      milestoneReached: 'أتممت الهدف بحمد الله',
      resetDialogTitle: 'تصفير المسبحة؟',
      resetDialogBody: 'سيتم إعادة العداد الحالي إلى الصفر. هل تريد المتابعة؟',
      confirmReset: 'نعم، تصفير',
      cancel: 'إلغاء',
    },
  },

  en: {
    brandName: 'Mihrab',
    backToHome: 'Back to Home',
    homeLabel: 'Home',
    languageLabel: 'Language',
    installApp: 'Install App',
    installIOS: 'Install on iOS',
    offlineBanner: 'Offline Mode · Using cached data',
    openMenuLabel: 'Open navigation menu',
    closeMenuLabel: 'Close navigation menu',
    drawerTitle: 'Quick Navigation',
    drawerItems: {
      home: 'Home',
      quran: 'Quran & Tafsir',
      audio: 'Recitations',
      prayer: 'Prayer Times',
      qibla: 'Qibla Compass',
      adhkar: 'Hisn Al-Muslim & Sunnah',
      tasbih: 'Smart Tasbih',
    },
    subpageTitles: {
      quran: 'Quran & Tafsir',
      audio: 'Recitations',
      prayer: 'Prayer Times & Adjustments',
      qibla: 'Qibla Compass',
      adhkar: 'Hisn Al-Muslim & Sunnah',
      tasbih: 'Smart Tasbih',
    },
    home: {
      nextPrayer: 'Next Prayer',
      timeRemaining: 'Time until Adhan',
      adhanOn: 'Adhan Alert On',
      adhanMuted: 'Adhan Muted',
      prayerAndAdjustBtn: 'Prayer Times & Settings',
      khatmahTitle: 'Daily Khatmah Tracker',
      pagesReadOf: 'pages',
      dailyGoalLabel: 'Daily Goal',
      daysLeft: 'days left',
      completeDailyGoal: 'Complete Daily Goal',
      continueReading: 'Continue Reading',
      continueReadingFromPage: 'Continue reading from page {page}',
      tiles: {
        quranTitle: 'Quran & Tafsir',
        quranSub: 'Uthmani script, Tafsir, translations & verse cards',
        lastReadPrefix: 'Last read',
        audioTitle: 'Recitations',
        audioSub: 'Renowned reciters with live Surah streaming',
        audioMetaIdle: 'Murattal audio',
        audioMetaActive: 'Playing',
        prayerTitle: 'Prayer Times',
        prayerSub: 'Daily schedule, minute offsets & calculation methods',
        qiblaTitle: 'Qibla Compass',
        qiblaSub: 'Interactive Qibla direction finder toward Makkah',
        adhkarTitle: 'Adhkar & Sunnah',
        adhkarSub: 'Offline morning, evening, post-prayer & Ruqyah',
        adhkarMetaPrefix: 'Completed',
        tasbihTitle: 'Smart Tasbih',
        tasbihSub: 'Distraction-free haptic counter with milestones',
        tasbihMetaPrefix: 'Current count',
      },
      shortTiles: {
        quran: 'Quran',
        audio: 'Recitations',
        prayer: 'Prayer',
        qibla: 'Qibla',
        adhkar: 'Adhkar',
        tasbih: 'Tasbih',
      },
    },
    prayers: {
      Fajr: 'Fajr',
      Sunrise: 'Sunrise',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Isha',
    },
    qibla: {
      title: 'Qibla Direction Compass',
      updateGPS: 'Update via GPS',
      bearingLabel: 'Qibla Bearing',
      directionLabel: 'Direction',
      distanceLabel: 'Distance to Kaaba',
      kmUnit: 'km',
      sensorConnected: 'Compass synced with your device orientation sensor.',
      compassHint: 'Face the golden needle relative to True North.',
      north: 'N',
      east: 'E',
      south: 'S',
      west: 'W',
      directions8: ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'],
      activateCompass: 'Activate Compass',
      compassActiveBadge: 'Sensor Active',
      sensorBlockedNotice: 'Orientation sensors are unavailable or blocked in this browser/sandbox. Use the exact degree from North below or rotate manually:',
      manualHeadingLabel: 'Manual Heading Preview (from North)',
      alignedBadge: 'Aligned with Qibla',
      fromNorthHint: 'from True North',
    },
    prayerView: {
      adhanAt: 'Adhan at',
      useGPS: 'Use My Location (GPS)',
      adjustTimes: 'Adjust Times',
      adjustPanelTitle: 'Manual Adjustments & Calculation Settings',
      adjustPanelSub: 'Add or subtract minutes (-15 to +15 min) per prayer to match your local mosque',
      resetOffsets: 'Reset Offsets',
      currentTime: 'Adjusted',
      minShort: 'm',
      calcMethodLabel: 'Calculation Method',
      manualCoordsTitle: 'Manual Coordinates',
      cityNamePlaceholder: 'City name',
      latPlaceholder: 'Latitude',
      lonPlaceholder: 'Longitude',
      applyCoordsBtn: 'Apply Coordinates',
      coordError: 'Please enter valid coordinates (Latitude -90..90, Longitude -180..180).',
      todayTimings: "Today's Prayer Times",
      openQibla: 'Open Qibla Compass',
      upcomingBadge: 'Next',
      adjustedBadge: 'Adjusted',
      adhanAudioAlert: 'Adhan Audio Alert',
      testTone: 'Test Alert Tone',
      browserNotifications: 'Browser Notifications',
      notificationsSub: 'Instant alert at prayer time',
      geoUnsupported: 'Geolocation is not supported by your browser.',
      geoLocating: 'Detecting your location...',
      geoSuccess: 'Prayer times and Qibla updated to your current location.',
      geoFail: 'Unable to access GPS location; keeping selected location.',
      notifUnsupported: 'Browser notifications are not supported.',
      notifAllow: 'Please allow notifications in browser settings.',
      notifBlocked: 'Notifications are blocked in browser settings.',
      testNotifAdhanBtn: 'Test Notification & Adhan',
      stopAdhanBtn: 'Stop Adhan',
      permGranted: 'Enabled',
      permDenied: 'Blocked',
      permDefault: 'Needs Activation',
      sampleAdhanTitle: 'It is now time for Asr Adhan — Test',
      sampleAdhanBody: 'Sample prayer alert triggered with a 10-second Adhan preview.',
      adhanPreviewPlaying: 'Playing 10s Adhan preview...',
    },
    quran: {
      khatmahBannerLabel: 'Quran Khatmah Tracker',
      khatmahCompleted: 'You have completed the Quran Khatmah!',
      pagesReadHeading: 'pages read',
      progressLabel: 'Progress',
      remainingPages: 'Remaining',
      estimatedDays: 'Est. days',
      dailyGoalInput: 'Daily goal (pages):',
      completeGoalBtn: 'Log Daily Goal',
      surahIndexTab: 'Surahs',
      bookmarksTab: 'Bookmarks',
      searchSurahPlaceholder: 'Search Surah name or number...',
      loadingSurahs: 'Loading Surah index...',
      noSurahsFound: 'No matching Surahs found.',
      noBookmarks: 'No bookmarked verses yet. Tap any verse to view Tafsir & bookmark.',
      ayahWord: 'verses',
      meccan: 'Meccan',
      medinan: 'Medinan',
      surahListBtn: 'Surah Index',
      readerHint: 'Tap any verse for Tafsir, translation & share card',
      playRecitation: 'Play Surah',
      loadingSurah: 'Loading Uthmani verses...',
      surahLoadError: 'Could not load Surah text. Check your connection and retry.',
      retry: 'Retry',
      tafsirHint: 'Tafsir',
      prevSurah: 'Previous Surah',
      nextSurah: 'Next Surah',
      toggleTranslation: 'Show Translation',
      translationEditionLabel: 'Translation',
      loadingTranslation: 'Loading translation...',
      pageLabel: 'Page',
      juzLabel: 'Juz',
      hizbLabel: 'Hizb',
      prevPage: 'Previous Page',
      nextPage: 'Next Page',
      jumpToPageLabel: 'Go to page',
      goToPageBtn: 'Go',
      pageLoadError: 'Could not load Mushaf page. Check your connection and retry.',
      continueReadingFromPage: 'Continue reading from page {page}',
      ayahShort: 'Verse',
      bookmarkPage: 'Bookmark page',
      pageBookmarked: 'Page bookmarked',
      pageBookmarkBadge: 'Page mark',
      verseBookmarkBadge: 'Verse mark',
      fontSizeDecrease: 'Decrease font size',
      fontSizeIncrease: 'Increase font size',
      fontSizeLabel: 'Font size',
      indexShortBtn: 'Index',
      settingsLabel: 'Mushaf Settings',
      resetFontAuto: 'Auto',
      fontAutoLabel: 'Auto',
      offlineReadyBadge: 'Available offline ✓',
      tafsirModal: {
        juz: 'Juz',
        page: 'Page',
        bookmarked: 'Bookmarked',
        bookmarkVerse: 'Bookmark',
        shareCard: 'Share Verse Card',
        showTafsir: 'Show Tafsir',
        listenSurah: 'Listen to Surah',
        downloadCard: 'Download Verse Card (PNG)',
        tafsirHeading: 'Arabic Tafsir',
        muyassar: 'Al-Muyassar',
        jalalayn: 'Al-Jalalayn',
        loadingTafsir: 'Loading Tafsir...',
        tafsirError: 'Unable to fetch Tafsir right now.',
        translationHeading: 'Verse Translation',
        closeLabel: 'Close Tafsir modal',
      },
    },
    audio: {
      title: 'Quran Recitations',
      subtitle: 'Select a reciter and Surah for live mp3quran streaming',
      searchReciter: 'Search reciter...',
      updatingReciters: 'Updating reciters list...',
      surahsBy: 'Surahs recited by',
      filterSurahs: 'Filter Surahs...',
      reciterVol: 'Reciter Volume',
      player: {
        loading: 'Loading...',
        openRecitations: 'Recitations',
        prevSurah: 'Previous Surah',
        nextSurah: 'Next Surah',
        playLabel: 'Play recitation',
        pauseLabel: 'Pause recitation',
      },
    },
    adhkar: {
      title: 'Hisn Al-Muslim & Daily Sunnah',
      subtitle: 'Authentic Adhkar stored locally for instant offline access',
      adhkarTab: 'Adhkar & Ruqyah',
      sunnahTab: 'Daily Sunnah',
      completedCount: 'Completed',
      resetCategory: 'Reset Section',
      requiredCount: 'Repetitions',
      doneLabel: 'Completed',
      tapToCount: 'Tap to Count',
      categories: {
        morning: 'Morning',
        evening: 'Evening',
        afterPrayer: 'After Prayer',
        sleep: 'Before Sleep',
        ruqyah: 'Ruqyah',
      },
    },
    tasbih: {
      targetLabel: 'Target:',
      completedRounds: 'Completed Rounds:',
      resetBtn: 'Reset',
      ofTargetHint: 'Tap to Count',
      milestoneReached: 'Milestone reached — Alhamdulillah',
      resetDialogTitle: 'Reset Tasbih Counter?',
      resetDialogBody: 'Your current count will be reset to zero. Continue?',
      confirmReset: 'Yes, Reset',
      cancel: 'Cancel',
    },
  },

  fr: {
    brandName: 'Mihrab',
    backToHome: "Retour à l'accueil",
    homeLabel: 'Accueil',
    languageLabel: 'Langue',
    installApp: "Installer l'application",
    installIOS: 'Installer sur iOS',
    offlineBanner: 'Mode hors ligne · Données enregistrées utilisées',
    openMenuLabel: 'Ouvrir le menu',
    closeMenuLabel: 'Fermer le menu',
    drawerTitle: 'Navigation rapide',
    drawerItems: {
      home: 'Accueil',
      quran: 'Coran & Tafsir',
      audio: 'Récitations',
      prayer: 'Horaires de Prière',
      qibla: 'Boussole Qibla',
      adhkar: 'Hisn Al-Muslim & Sunnah',
      tasbih: 'Tasbih Numérique',
    },
    subpageTitles: {
      quran: 'Coran & Tafsir',
      audio: 'Récitations',
      prayer: 'Horaires de Prière',
      qibla: 'Boussole Qibla',
      adhkar: 'Hisn Al-Muslim & Sunnah',
      tasbih: 'Tasbih Numérique',
    },
    home: {
      nextPrayer: 'Prochaine prière',
      timeRemaining: "Temps restant avant l'Adhan",
      adhanOn: 'Alerte Adhan activée',
      adhanMuted: 'Adhan silencieux',
      prayerAndAdjustBtn: 'Horaires et réglages',
      khatmahTitle: 'Suivi de Khatmah',
      pagesReadOf: 'pages',
      dailyGoalLabel: 'Objectif quotidien',
      daysLeft: 'jours restants',
      completeDailyGoal: "Valider l'objectif du jour",
      continueReading: 'Continuer la lecture',
      continueReadingFromPage: 'Continuer la lecture à la page {page}',
      tiles: {
        quranTitle: 'Coran & Tafsir',
        quranSub: 'Texte Uthmani, traductions, Tafsir et cartes',
        lastReadPrefix: 'Dernière lecture',
        audioTitle: 'Récitations',
        audioSub: 'Grands récitateurs en écoute directe',
        audioMetaIdle: 'Récitations',
        audioMetaActive: 'En lecture',
        prayerTitle: 'Horaires de Prière',
        prayerSub: 'Heures quotidiennes, ajustements et méthodes',
        qiblaTitle: 'Direction Qibla',
        qiblaSub: 'Boussole interactive vers La Mecque',
        adhkarTitle: 'Adhkar & Sunnah',
        adhkarSub: 'Invocations authentiques disponibles hors ligne',
        adhkarMetaPrefix: 'Accomplis',
        tasbihTitle: 'Tasbih Tactile',
        tasbihSub: 'Compteur épuré avec vibration et objectifs',
        tasbihMetaPrefix: 'Total actuel',
      },
      shortTiles: {
        quran: 'Coran',
        audio: 'Récitations',
        prayer: 'Prière',
        qibla: 'Qibla',
        adhkar: 'Adhkar',
        tasbih: 'Tasbih',
      },
    },
    prayers: {
      Fajr: 'Fajr',
      Sunrise: 'Lever',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Isha',
    },
    qibla: {
      title: 'Boussole de la Qibla',
      updateGPS: 'Mettre à jour via GPS',
      bearingLabel: 'Angle Qibla',
      directionLabel: 'Direction',
      distanceLabel: 'Distance à la Kaaba',
      kmUnit: 'km',
      sensorConnected: 'Boussole synchronisée avec le capteur de votre appareil.',
      compassHint: "Orientez-vous selon l'aiguille dorée par rapport au Nord.",
      north: 'N',
      east: 'E',
      south: 'S',
      west: 'O',
      directions8: ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'],
      activateCompass: 'Activer la boussole',
      compassActiveBadge: 'Capteur actif',
      sensorBlockedNotice: 'Les capteurs d’orientation sont indisponibles ou bloqués ici. Utilisez l’angle exact depuis le Nord ou le curseur manuel :',
      manualHeadingLabel: 'Orientation manuelle (depuis le Nord)',
      alignedBadge: 'Aligné vers la Qibla',
      fromNorthHint: 'depuis le Nord géographique',
    },
    prayerView: {
      adhanAt: 'Adhan à',
      useGPS: 'Ma position (GPS)',
      adjustTimes: 'Ajuster les horaires',
      adjustPanelTitle: 'Ajustement manuel & Méthode de calcul',
      adjustPanelSub: 'Ajoutez ou retirez des minutes (-15 à +15 min) pour chaque prière',
      resetOffsets: 'Réinitialiser',
      currentTime: 'Ajusté',
      minShort: 'm',
      calcMethodLabel: 'Méthode de calcul',
      manualCoordsTitle: 'Coordonnées manuelles',
      cityNamePlaceholder: 'Nom de la ville',
      latPlaceholder: 'Latitude',
      lonPlaceholder: 'Longitude',
      applyCoordsBtn: 'Appliquer les coordonnées',
      coordError: 'Veuillez saisir des coordonnées valides.',
      todayTimings: "Horaires d'aujourd'hui",
      openQibla: 'Ouvrir la boussole',
      upcomingBadge: 'Prochaine',
      adjustedBadge: 'Ajusté',
      adhanAudioAlert: 'Alerte sonore Adhan',
      testTone: 'Tester la sonnerie',
      browserNotifications: 'Notifications navigateur',
      notificationsSub: "Alerte instantanée à l'heure",
      geoUnsupported: 'La géolocalisation est indisponible.',
      geoLocating: 'Localisation en cours...',
      geoSuccess: 'Horaires et Qibla mis à jour.',
      geoFail: "Impossible d'obtenir la position GPS.",
      notifUnsupported: 'Notifications non supportées.',
      notifAllow: 'Veuillez autoriser les notifications.',
      notifBlocked: 'Notifications bloquées dans le navigateur.',
      testNotifAdhanBtn: 'Tester Notification & Adhan',
      stopAdhanBtn: 'Arrêter',
      permGranted: 'Activée',
      permDenied: 'Refusée',
      permDefault: 'À activer',
      sampleAdhanTitle: "C'est l'heure de la prière d'Al-Asr — Test",
      sampleAdhanBody: "Notification de test envoyée avec un aperçu de l'Adhan.",
      adhanPreviewPlaying: "Lecture de l'aperçu Adhan (10s)...",
    },
    quran: {
      khatmahBannerLabel: 'Suivi de Khatmah',
      khatmahCompleted: 'Khatmah terminée ! Qu’Allah accepte votre lecture.',
      pagesReadHeading: 'pages lues',
      progressLabel: 'Progression',
      remainingPages: 'Restant',
      estimatedDays: 'Jours estimés',
      dailyGoalInput: 'Objectif / jour :',
      completeGoalBtn: 'Valider objectif',
      surahIndexTab: 'Sourates',
      bookmarksTab: 'Favoris',
      searchSurahPlaceholder: 'Rechercher une sourate...',
      loadingSurahs: 'Chargement des sourates...',
      noSurahsFound: 'Aucune sourate trouvée.',
      noBookmarks: 'Aucun verset enregistré. Touchez un verset pour le sauvegarder.',
      ayahWord: 'versets',
      meccan: 'Mecquoise',
      medinan: 'Médinoise',
      surahListBtn: 'Sourates',
      readerHint: 'Touchez un verset pour le Tafsir et le partage',
      playRecitation: 'Écouter la sourate',
      loadingSurah: 'Chargement des versets...',
      surahLoadError: 'Erreur de chargement. Vérifiez votre connexion.',
      retry: 'Réessayer',
      tafsirHint: 'Tafsir',
      prevSurah: 'Précédente',
      nextSurah: 'Suivante',
      toggleTranslation: 'Traduction',
      translationEditionLabel: 'Traduction',
      loadingTranslation: 'Chargement de la traduction...',
      pageLabel: 'Page',
      juzLabel: 'Juz',
      hizbLabel: 'Hizb',
      prevPage: 'Page précédente',
      nextPage: 'Page suivante',
      jumpToPageLabel: 'Aller à la page',
      goToPageBtn: 'Aller',
      pageLoadError: 'Impossible de charger cette page du Mushaf.',
      continueReadingFromPage: 'Continuer la lecture à la page {page}',
      ayahShort: 'Verset',
      bookmarkPage: 'Marquer la page',
      pageBookmarked: 'Page marquée',
      pageBookmarkBadge: 'Signet page',
      verseBookmarkBadge: 'Signet verset',
      fontSizeDecrease: 'Réduire le texte',
      fontSizeIncrease: 'Agrandir le texte',
      fontSizeLabel: 'Taille du texte',
      indexShortBtn: 'Index',
      settingsLabel: 'Paramètres',
      resetFontAuto: 'Auto',
      fontAutoLabel: 'Auto',
      offlineReadyBadge: 'Disponible hors ligne ✓',
      tafsirModal: {
        juz: 'Juz',
        page: 'Page',
        bookmarked: 'Enregistré',
        bookmarkVerse: 'Sauvegarder',
        shareCard: 'Carte du verset',
        showTafsir: 'Voir Tafsir',
        listenSurah: 'Écouter la sourate',
        downloadCard: 'Télécharger la carte (PNG)',
        tafsirHeading: 'Tafsir en arabe',
        muyassar: 'Al-Muyassar',
        jalalayn: 'Al-Jalalayn',
        loadingTafsir: 'Chargement du Tafsir...',
        tafsirError: 'Impossible de charger le Tafsir.',
        translationHeading: 'Traduction française',
        closeLabel: 'Fermer',
      },
    },
    audio: {
      title: 'Récitations du Coran',
      subtitle: 'Choisissez un récitateur et une sourate',
      searchReciter: 'Chercher un récitateur...',
      updatingReciters: 'Mise à jour des récitateurs...',
      surahsBy: 'Sourates par',
      filterSurahs: 'Filtrer les sourates...',
      reciterVol: 'Volume Récitateur',
      player: {
        loading: 'Chargement...',
        openRecitations: 'Récitations',
        prevSurah: 'Sourate précédente',
        nextSurah: 'Sourate suivante',
        playLabel: 'Lire',
        pauseLabel: 'Pause',
      },
    },
    adhkar: {
      title: 'Hisn Al-Muslim & Sunnah',
      subtitle: 'Invocations authentiques disponibles à tout moment hors ligne',
      adhkarTab: 'Adhkar & Ruqyah',
      sunnahTab: 'Sunnah du jour',
      completedCount: 'Accomplis',
      resetCategory: 'Réinitialiser',
      requiredCount: 'Répétitions',
      doneLabel: 'Terminé',
      tapToCount: 'Compter',
      categories: {
        morning: 'Matin',
        evening: 'Soir',
        afterPrayer: 'Après la prière',
        sleep: 'Sommeil',
        ruqyah: 'Ruqyah',
      },
    },
    tasbih: {
      targetLabel: 'Objectif :',
      completedRounds: 'Cycles accomplis :',
      resetBtn: 'Réinitialiser',
      ofTargetHint: 'Toucher pour compter',
      milestoneReached: 'Objectif atteint — Alhamdulillah',
      resetDialogTitle: 'Réinitialiser le Tasbih ?',
      resetDialogBody: 'Le compteur actuel sera remis à zéro. Continuer ?',
      confirmReset: 'Oui, réinitialiser',
      cancel: 'Annuler',
    },
  },

  de: {
    brandName: 'Mihrab',
    backToHome: 'Zurück zur Startseite',
    homeLabel: 'Start',
    languageLabel: 'Sprache',
    installApp: 'App installieren',
    installIOS: 'Auf iOS installieren',
    offlineBanner: 'Offline-Modus · Gespeicherte Daten aktiv',
    openMenuLabel: 'Menü öffnen',
    closeMenuLabel: 'Menü schließen',
    drawerTitle: 'Schnellnavigation',
    drawerItems: {
      home: 'Startseite',
      quran: 'Koran & Tafsir',
      audio: 'Rezitationen',
      prayer: 'Gebetszeiten',
      qibla: 'Qibla-Kompass',
      adhkar: 'Hisn Al-Muslim & Sunnah',
      tasbih: 'Digitaler Tasbih',
    },
    subpageTitles: {
      quran: 'Koran & Tafsir',
      audio: 'Rezitationen',
      prayer: 'Gebetszeiten & Anpassung',
      qibla: 'Qibla-Kompass',
      adhkar: 'Hisn Al-Muslim & Sunnah',
      tasbih: 'Digitaler Tasbih',
    },
    home: {
      nextPrayer: 'Nächstes Gebet',
      timeRemaining: 'Zeit bis zum Adhan',
      adhanOn: 'Adhan-Ton Ein',
      adhanMuted: 'Adhan Stumm',
      prayerAndAdjustBtn: 'Gebetszeiten & Einstellungen',
      khatmahTitle: 'Täglicher Khatmah-Tracker',
      pagesReadOf: 'Seiten',
      dailyGoalLabel: 'Tagesziel',
      daysLeft: 'Tage übrig',
      completeDailyGoal: 'Tagesziel abschließen',
      continueReading: 'Weiterlesen',
      continueReadingFromPage: 'Weiterlesen ab Seite {page}',
      tiles: {
        quranTitle: 'Koran & Tafsir',
        quranSub: 'Uthmani-Schrift, Übersetzungen & Verskarten',
        lastReadPrefix: 'Zuletzt gelesen',
        audioTitle: 'Rezitationen',
        audioSub: 'Bekannte Rezitatoren direkt anhören',
        audioMetaIdle: 'Rezitationen',
        audioMetaActive: 'Läuft',
        prayerTitle: 'Gebetszeiten',
        prayerSub: 'Tageszeiten, Minutenanpassung & Methoden',
        qiblaTitle: 'Qibla-Richtung',
        qiblaSub: 'Interaktiver Kompass nach Mekka',
        adhkarTitle: 'Adhkar & Sunnah',
        adhkarSub: 'Authentische Bittgebete komplett offline',
        adhkarMetaPrefix: 'Erledigt',
        tasbihTitle: 'Smarter Tasbih',
        tasbihSub: 'Ruhiger Zähler mit Vibration & Zielen',
        tasbihMetaPrefix: 'Aktueller Stand',
      },
      shortTiles: {
        quran: 'Koran',
        audio: 'Rezitationen',
        prayer: 'Gebet',
        qibla: 'Qibla',
        adhkar: 'Adhkar',
        tasbih: 'Tasbih',
      },
    },
    prayers: {
      Fajr: 'Fadschr',
      Sunrise: 'Sonnenaufgang',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Ischa',
    },
    qibla: {
      title: 'Qibla-Richtungskompass',
      updateGPS: 'Per GPS aktualisieren',
      bearingLabel: 'Qibla-Winkel',
      directionLabel: 'Richtung',
      distanceLabel: 'Entfernung zur Kaaba',
      kmUnit: 'km',
      sensorConnected: 'Kompass mit dem Gerätesensor synchronisiert.',
      compassHint: 'Richten Sie sich nach der goldenen Nadel relativ zu Norden aus.',
      north: 'N',
      east: 'O',
      south: 'S',
      west: 'W',
      directions8: ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten'],
      activateCompass: 'Kompass aktivieren',
      compassActiveBadge: 'Sensor aktiv',
      sensorBlockedNotice: 'Orientierungssensoren sind in diesem Browser/Sandbox nicht verfügbar. Nutzen Sie den exakten Winkel von Norden oder den manuellen Regler:',
      manualHeadingLabel: 'Manuelle Ausrichtung (von Norden)',
      alignedBadge: 'Auf die Qibla ausgerichtet',
      fromNorthHint: 'vom geographischen Norden',
    },
    prayerView: {
      adhanAt: 'Adhan um',
      useGPS: 'Mein Standort (GPS)',
      adjustTimes: 'Zeiten anpassen',
      adjustPanelTitle: 'Manuelle Anpassung & Berechnungsmethode',
      adjustPanelSub: 'Minuten (-15 bis +15) je Gebet an Ihre örtliche Moschee anpassen',
      resetOffsets: 'Zurücksetzen',
      currentTime: 'Angepasst',
      minShort: 'm',
      calcMethodLabel: 'Berechnungsmethode',
      manualCoordsTitle: 'Manuelle Koordinaten',
      cityNamePlaceholder: 'Stadtname',
      latPlaceholder: 'Breitengrad',
      lonPlaceholder: 'Längengrad',
      applyCoordsBtn: 'Koordinaten anwenden',
      coordError: 'Bitte gültige Koordinaten eingeben.',
      todayTimings: 'Heutige Gebetszeiten',
      openQibla: 'Qibla-Kompass öffnen',
      upcomingBadge: 'Nächstes',
      adjustedBadge: 'Angepasst',
      adhanAudioAlert: 'Adhan-Audiohinweis',
      testTone: 'Signalton testen',
      browserNotifications: 'Browser-Benachrichtigungen',
      notificationsSub: 'Sofortige Erinnerung zur Gebetszeit',
      geoUnsupported: 'Geolokalisierung wird nicht unterstützt.',
      geoLocating: 'Standort wird ermittelt...',
      geoSuccess: 'Gebetszeiten und Qibla aktualisiert.',
      geoFail: 'Standort konnte nicht abgerufen werden.',
      notifUnsupported: 'Benachrichtigungen nicht unterstützt.',
      notifAllow: 'Bitte Benachrichtigungen im Browser erlauben.',
      notifBlocked: 'Benachrichtigungen sind blockiert.',
      testNotifAdhanBtn: 'Benachrichtigung & Adhan testen',
      stopAdhanBtn: 'Stopp',
      permGranted: 'Aktiviert',
      permDenied: 'Blockiert',
      permDefault: 'Aktivierung nötig',
      sampleAdhanTitle: 'Zeit für das Asr-Gebet — Test',
      sampleAdhanBody: 'Test-Benachrichtigung mit 10-Sekunden-Adhan-Vorschau.',
      adhanPreviewPlaying: 'Adhan-Vorschau läuft (10s)...',
    },
    quran: {
      khatmahBannerLabel: 'Koran-Khatmah-Tracker',
      khatmahCompleted: 'Khatmah abgeschlossen! Möge Allah es annehmen.',
      pagesReadHeading: 'Seiten gelesen',
      progressLabel: 'Fortschritt',
      remainingPages: 'Verbleibend',
      estimatedDays: 'Gesch. Tage',
      dailyGoalInput: 'Tagesziel (Seiten):',
      completeGoalBtn: 'Tagesziel verbuchen',
      surahIndexTab: 'Suren',
      bookmarksTab: 'Lesezeichen',
      searchSurahPlaceholder: 'Sure suchen...',
      loadingSurahs: 'Surenverzeichnis wird geladen...',
      noSurahsFound: 'Keine passende Sure gefunden.',
      noBookmarks: 'Noch keine Verse gespeichert.',
      ayahWord: 'Verse',
      meccan: 'Mekkanisch',
      medinan: 'Medinensisch',
      surahListBtn: 'Surenliste',
      readerHint: 'Vers antippen für Tafsir, Übersetzung & Karte',
      playRecitation: 'Sure abspielen',
      loadingSurah: 'Verse werden geladen...',
      surahLoadError: 'Laden fehlgeschlagen. Bitte Verbindung prüfen.',
      retry: 'Erneut versuchen',
      tafsirHint: 'Tafsir',
      prevSurah: 'Vorherige Sure',
      nextSurah: 'Nächste Sure',
      toggleTranslation: 'Übersetzung',
      translationEditionLabel: 'Übersetzung',
      loadingTranslation: 'Übersetzung wird geladen...',
      pageLabel: 'Seite',
      juzLabel: 'Dschuz',
      hizbLabel: 'Hizb',
      prevPage: 'Vorherige Seite',
      nextPage: 'Nächste Seite',
      jumpToPageLabel: 'Zur Seite',
      goToPageBtn: 'Öffnen',
      pageLoadError: 'Mushaf-Seite konnte nicht geladen werden.',
      continueReadingFromPage: 'Weiterlesen ab Seite {page}',
      ayahShort: 'Vers',
      bookmarkPage: 'Seite merken',
      pageBookmarked: 'Seite gespeichert',
      pageBookmarkBadge: 'Seitenzeichen',
      verseBookmarkBadge: 'Verszeichen',
      fontSizeDecrease: 'Schrift verkleinern',
      fontSizeIncrease: 'Schrift vergrößern',
      fontSizeLabel: 'Schriftgröße',
      indexShortBtn: 'Index',
      settingsLabel: 'Einstellungen',
      resetFontAuto: 'Auto',
      fontAutoLabel: 'Auto',
      offlineReadyBadge: 'Offline verfügbar ✓',
      tafsirModal: {
        juz: 'Dschuz',
        page: 'Seite',
        bookmarked: 'Gespeichert',
        bookmarkVerse: 'Merken',
        shareCard: 'Vers-Karte teilen',
        showTafsir: 'Tafsir zeigen',
        listenSurah: 'Sure anhören',
        downloadCard: 'Karte herunterladen (PNG)',
        tafsirHeading: 'Arabischer Tafsir',
        muyassar: 'Al-Muyassar',
        jalalayn: 'Al-Jalalayn',
        loadingTafsir: 'Tafsir wird geladen...',
        tafsirError: 'Tafsir derzeit nicht verfügbar.',
        translationHeading: 'Deutsche Übersetzung',
        closeLabel: 'Schließen',
      },
    },
    audio: {
      title: 'Koran-Rezitationen',
      subtitle: 'Wählen Sie einen Rezitator und eine Sure',
      searchReciter: 'Rezitator suchen...',
      updatingReciters: 'Liste wird aktualisiert...',
      surahsBy: 'Suren von',
      filterSurahs: 'Suren filtern...',
      reciterVol: 'Rezitator-Lautstärke',
      player: {
        loading: 'Laden...',
        openRecitations: 'Rezitationen',
        prevSurah: 'Vorherige Sure',
        nextSurah: 'Nächste Sure',
        playLabel: 'Abspielen',
        pauseLabel: 'Pause',
      },
    },
    adhkar: {
      title: 'Hisn Al-Muslim & Sunnah',
      subtitle: 'Authentische Adhkar jederzeit offline verfügbar',
      adhkarTab: 'Adhkar & Ruqyah',
      sunnahTab: 'Tägliche Sunnah',
      completedCount: 'Erledigt',
      resetCategory: 'Zurücksetzen',
      requiredCount: 'Wiederholungen',
      doneLabel: 'Erledigt',
      tapToCount: 'Tippen',
      categories: {
        morning: 'Morgen',
        evening: 'Abend',
        afterPrayer: 'Nach dem Gebet',
        sleep: 'Vor dem Schlaf',
        ruqyah: 'Ruqyah',
      },
    },
    tasbih: {
      targetLabel: 'Ziel:',
      completedRounds: 'Runden:',
      resetBtn: 'Zurücksetzen',
      ofTargetHint: 'Zum Zählen tippen',
      milestoneReached: 'Ziel erreicht — Alhamdulillah',
      resetDialogTitle: 'Tasbih zurücksetzen?',
      resetDialogBody: 'Der aktuelle Zähler wird auf Null zurückgesetzt. Fortfahren?',
      confirmReset: 'Ja, zurücksetzen',
      cancel: 'Abbrechen',
    },
  },

  tr: {
    brandName: 'Mihrab',
    backToHome: 'Ana Sayfaya Dön',
    homeLabel: 'Ana Sayfa',
    languageLabel: 'Dil',
    installApp: 'Uygulamayı Yükle',
    installIOS: "iOS'a Yükle",
    offlineBanner: 'Çevrimdışı Mod · Kayıtlı veriler kullanılıyor',
    openMenuLabel: 'Menüyü aç',
    closeMenuLabel: 'Menüyü kapat',
    drawerTitle: 'Hızlı Gezinti',
    drawerItems: {
      home: 'Ana Sayfa',
      quran: "Kur'an ve Tefsir",
      audio: 'Tilavetler',
      prayer: 'Namaz Vakitleri',
      qibla: 'Kıble Pusulası',
      adhkar: 'Hisnul Müslim ve Sünnet',
      tasbih: 'Akıllı Tesbih',
    },
    subpageTitles: {
      quran: "Kur'an ve Tefsir",
      audio: 'Tilavetler',
      prayer: 'Namaz Vakitleri',
      qibla: 'Kıble Pusulası',
      adhkar: 'Hisnul Müslim ve Sünnet',
      tasbih: 'Akıllı Tesbih',
    },
    home: {
      nextPrayer: 'Sıradaki Vakit',
      timeRemaining: 'Ezana kalan süre',
      adhanOn: 'Ezan Uyarısı Açık',
      adhanMuted: 'Ezan Sessiz',
      prayerAndAdjustBtn: 'Namaz Vakitleri ve Ayarlar',
      khatmahTitle: 'Günlük Hatim Takibi',
      pagesReadOf: 'sayfa',
      dailyGoalLabel: 'Günlük Hedef',
      daysLeft: 'gün kaldı',
      completeDailyGoal: 'Günlük Hedefi Tamamla',
      continueReading: 'Okumaya Devam Et',
      continueReadingFromPage: '{page}. sayfadan okumaya devam et',
      tiles: {
        quranTitle: "Kur'an ve Tefsir",
        quranSub: 'Osmanlı hattı, meal, tefsir ve ayet kartları',
        lastReadPrefix: 'Son okunan',
        audioTitle: 'Tilavetler',
        audioSub: 'Ünlü hafızlardan canlı sure dinleme',
        audioMetaIdle: 'Tilavet',
        audioMetaActive: 'Çalıyor',
        prayerTitle: 'Namaz Vakitleri',
        prayerSub: 'Günlük vakitler, dakika ayarı ve hesaplama',
        qiblaTitle: 'Kıble Pusulası',
        qiblaSub: "Mekke'ye doğru canlı kıble yönü bulucu",
        adhkarTitle: 'Zikirler ve Sünnet',
        adhkarSub: 'Çevrimdışı sabah, akşam, namaz sonrası zikirler',
        adhkarMetaPrefix: 'Tamamlanan',
        tasbihTitle: 'Elektronik Tesbih',
        tasbihSub: 'Titreşimli, hedefli sade zikir sayacı',
        tasbihMetaPrefix: 'Mevcut sayı',
      },
      shortTiles: {
        quran: "Kur'an",
        audio: 'Tilavet',
        prayer: 'Namaz',
        qibla: 'Kıble',
        adhkar: 'Zikir',
        tasbih: 'Tesbih',
      },
    },
    prayers: {
      Fajr: 'İmsak',
      Sunrise: 'Güneş',
      Dhuhr: 'Öğle',
      Asr: 'İkindi',
      Maghrib: 'Akşam',
      Isha: 'Yatsı',
    },
    qibla: {
      title: 'Kıble Yönü Pusulası',
      updateGPS: 'GPS ile Güncelle',
      bearingLabel: 'Kıble Açısı',
      directionLabel: 'Yön',
      distanceLabel: "Kabe'ye Mesafe",
      kmUnit: 'km',
      sensorConnected: 'Pusula cihaz yön sensörüne bağlandı.',
      compassHint: 'Gerçek Kuzeye göre altın ibreyi takip edin.',
      north: 'K',
      east: 'D',
      south: 'G',
      west: 'B',
      directions8: ['Kuzey', 'Kuzeydoğu', 'Doğu', 'Güneydoğu', 'Güney', 'Güneybatı', 'Batı', 'Kuzeybatı'],
      activateCompass: 'Pusulayı Etkinleştir',
      compassActiveBadge: 'Sensör Aktif',
      sensorBlockedNotice: 'Yön sensörleri bu tarayıcıda engellenmiş veya kullanılamıyor. Kuzeyden tam açıyı veya manuel kaydırıcıyı kullanabilirsiniz:',
      manualHeadingLabel: 'Manuel Yön Önizlemesi (Kuzeyden)',
      alignedBadge: 'Kıbleye Hizalandı',
      fromNorthHint: 'Gerçek Kuzeyden',
    },
    prayerView: {
      adhanAt: 'Ezan saati',
      useGPS: 'Konumumu Kullan (GPS)',
      adjustTimes: 'Vakitleri Düzenle',
      adjustPanelTitle: 'Manuel Vakit ve Hesaplama Ayarları',
      adjustPanelSub: 'Yerel cami vakitlerine göre her namaz için (-15 / +15 dk) fark ekleyin',
      resetOffsets: 'Farkları Sıfırla',
      currentTime: 'Ayarlı',
      minShort: 'dk',
      calcMethodLabel: 'Hesaplama Yöntemi',
      manualCoordsTitle: 'Manuel Koordinat Girişi',
      cityNamePlaceholder: 'Şehir adı',
      latPlaceholder: 'Enlem',
      lonPlaceholder: 'Boylam',
      applyCoordsBtn: 'Koordinatları Uygula',
      coordError: 'Lütfen geçerli enlem ve boylam girin.',
      todayTimings: 'Bugünün Namaz Vakitleri',
      openQibla: 'Kıble Pusulasını Aç',
      upcomingBadge: 'Sıradaki',
      adjustedBadge: 'Ayarlı',
      adhanAudioAlert: 'Sesli Ezan Uyarısı',
      testTone: 'Uyarı Sesini Test Et',
      browserNotifications: 'Tarayıcı Bildirimleri',
      notificationsSub: 'Vakit girdiğinde anlık bildirim',
      geoUnsupported: 'Tarayıcınız konum özelliğini desteklemiyor.',
      geoLocating: 'Konum belirleniyor...',
      geoSuccess: 'Vakitler ve kıble konumunuza göre güncellendi.',
      geoFail: 'Konum alınamadı, seçili şehir korundu.',
      notifUnsupported: 'Bildirimler desteklenmiyor.',
      notifAllow: 'Lütfen tarayıcıdan bildirim izni verin.',
      notifBlocked: 'Bildirimler tarayıcıda engellenmiş.',
      testNotifAdhanBtn: 'Bildirim ve Ezanı Test Et',
      stopAdhanBtn: 'Durdur',
      permGranted: 'Etkin',
      permDenied: 'Reddedildi',
      permDefault: 'Etkinleştirme Gerekli',
      sampleAdhanTitle: 'İkindi Ezanı Vakti — Deneme',
      sampleAdhanBody: '10 saniyelik ezan önizlemesi ile deneme bildirimi gönderildi.',
      adhanPreviewPlaying: 'Ezan önizlemesi çalıyor (10 sn)...',
    },
    quran: {
      khatmahBannerLabel: "Kur'an Hatim Takibi",
      khatmahCompleted: 'Hatmi tamamladınız, Allah kabul etsin!',
      pagesReadHeading: 'sayfa okundu',
      progressLabel: 'İlerleme',
      remainingPages: 'Kalan',
      estimatedDays: 'Tahmini gün',
      dailyGoalInput: 'Günlük hedef (sayfa):',
      completeGoalBtn: 'Günlük Hedefi İşle',
      surahIndexTab: 'Sureler',
      bookmarksTab: 'Yer İmleri',
      searchSurahPlaceholder: 'Sure adı veya numarası ara...',
      loadingSurahs: 'Sure listesi yükleniyor...',
      noSurahsFound: 'Eşleşen sure bulunamadı.',
      noBookmarks: 'Henüz kaydedilmiş ayet yok.',
      ayahWord: 'ayet',
      meccan: 'Mekki',
      medinan: 'Medeni',
      surahListBtn: 'Sureler',
      readerHint: 'Tefsir, meal ve kart için ayete dokunun',
      playRecitation: 'Sureyi Dinle',
      loadingSurah: 'Ayetler yükleniyor...',
      surahLoadError: 'Sure yüklenemedi. Bağlantınızı kontrol edin.',
      retry: 'Tekrar Dene',
      tafsirHint: 'Tefsir',
      prevSurah: 'Önceki Sure',
      nextSurah: 'Sonraki Sure',
      toggleTranslation: 'Meal',
      translationEditionLabel: 'Meal',
      loadingTranslation: 'Meal yükleniyor...',
      pageLabel: 'Sayfa',
      juzLabel: 'Cüz',
      hizbLabel: 'Hizb',
      prevPage: 'Önceki Sayfa',
      nextPage: 'Sonraki Sayfa',
      jumpToPageLabel: 'Sayfaya git',
      goToPageBtn: 'Git',
      pageLoadError: 'Mushaf sayfası yüklenemedi.',
      continueReadingFromPage: '{page}. sayfadan okumaya devam et',
      ayahShort: 'Ayet',
      bookmarkPage: 'Sayfayı kaydet',
      pageBookmarked: 'Sayfa kaydedildi',
      pageBookmarkBadge: 'Sayfa işareti',
      verseBookmarkBadge: 'Ayet işareti',
      fontSizeDecrease: 'Yazıyı küçült',
      fontSizeIncrease: 'Yazıyı büyüt',
      fontSizeLabel: 'Yazı boyutu',
      indexShortBtn: 'Fihrist',
      settingsLabel: 'Ayarlar',
      resetFontAuto: 'Oto',
      fontAutoLabel: 'Oto',
      offlineReadyBadge: 'Çevrimdışı hazır ✓',
      tafsirModal: {
        juz: 'Cüz',
        page: 'Sayfa',
        bookmarked: 'Kaydedildi',
        bookmarkVerse: 'Kaydet',
        shareCard: 'Ayet Kartı Paylaş',
        showTafsir: 'Tefsiri Göster',
        listenSurah: 'Sureyi Dinle',
        downloadCard: 'Kartı İndir (PNG)',
        tafsirHeading: 'Arapça Tefsir',
        muyassar: 'El-Muyesser',
        jalalayn: 'Celaleyn',
        loadingTafsir: 'Tefsir yükleniyor...',
        tafsirError: 'Tefsir şu an yüklenemedi.',
        translationHeading: 'Türkçe Meal',
        closeLabel: 'Kapat',
      },
    },
    audio: {
      title: "Kur'an Tilavetleri",
      subtitle: 'Hafız ve sure seçerek canlı dinleyin',
      searchReciter: 'Hafız ara...',
      updatingReciters: 'Hafız listesi güncelleniyor...',
      surahsBy: 'Okuyan:',
      filterSurahs: 'Sure filtrele...',
      reciterVol: 'Hafız Sesi',
      player: {
        loading: 'Yükleniyor...',
        openRecitations: 'Tilavetler',
        prevSurah: 'Önceki Sure',
        nextSurah: 'Sonraki Sure',
        playLabel: 'Oynat',
        pauseLabel: 'Duraklat',
      },
    },
    adhkar: {
      title: 'Hisnul Müslim ve Günlük Sünnetler',
      subtitle: 'İnternetsiz erişim için cihazda kayıtlı sahih zikirler',
      adhkarTab: 'Zikirler ve Rukye',
      sunnahTab: 'Günlük Sünnetler',
      completedCount: 'Tamamlanan',
      resetCategory: 'Bölümü Sıfırla',
      requiredCount: 'Tekrar',
      doneLabel: 'Tamamlandı',
      tapToCount: 'Say',
      categories: {
        morning: 'Sabah',
        evening: 'Akşam',
        afterPrayer: 'Namaz Sonrası',
        sleep: 'Uyku Öncesi',
        ruqyah: 'Rukye',
      },
    },
    tasbih: {
      targetLabel: 'Hedef:',
      completedRounds: 'Tamamlanan Tur:',
      resetBtn: 'Sıfırla',
      ofTargetHint: 'Saymak için dokun',
      milestoneReached: 'Hedefe ulaşıldı — Elhamdülillah',
      resetDialogTitle: 'Tesbih Sıfırlansın mı?',
      resetDialogBody: 'Mevcut sayaç sıfırlanacak. Devam edilsin mi?',
      confirmReset: 'Evet, Sıfırla',
      cancel: 'İptal',
    },
  },

  ur: {
    brandName: 'محراب',
    backToHome: 'مرکزی صفحہ',
    homeLabel: 'مرکزی صفحہ',
    languageLabel: 'زبان',
    installApp: 'ایپ انسٹال کریں',
    installIOS: 'iOS پر انسٹال کریں',
    offlineBanner: 'آف لائن موڈ · محفوظ شدہ ڈیٹا استعمال ہو رہا ہے',
    openMenuLabel: 'مینو کھولیں',
    closeMenuLabel: 'مینو بند کریں',
    drawerTitle: 'فوری نیویگیشن',
    drawerItems: {
      home: 'مرکزی صفحہ',
      quran: 'قرآن کریم اور تفسیر',
      audio: 'تلاوت',
      prayer: 'نماز کے اوقات',
      qibla: 'سمتِ قبلہ',
      adhkar: 'حصن المسلم اور سنتیں',
      tasbih: 'ڈیجیٹل تسبیح',
    },
    subpageTitles: {
      quran: 'قرآن کریم اور تفسیر',
      audio: 'تلاوت',
      prayer: 'نماز کے اوقات اور ترتیبات',
      qibla: 'سمتِ قبلہ',
      adhkar: 'حصن المسلم اور سنتیں',
      tasbih: 'ڈیجیٹل تسبیح',
    },
    home: {
      nextPrayer: 'اگلی نماز',
      timeRemaining: 'اذان میں باقی وقت',
      adhanOn: 'اذان الرٹ فعال ہے',
      adhanMuted: 'اذان خاموش ہے',
      prayerAndAdjustBtn: 'اوقات اور ترتیبات',
      khatmahTitle: 'روزانہ ختمِ قرآن',
      pagesReadOf: 'صفحات',
      dailyGoalLabel: 'روزانہ ہدف',
      daysLeft: 'دن باقی',
      completeDailyGoal: 'آج کا ہدف مکمل کریں',
      continueReading: 'تلاوت جاری رکھیں',
      continueReadingFromPage: 'صفحہ {page} سے تلاوت جاری رکھیں',
      tiles: {
        quranTitle: 'قرآن کریم اور تفسیر',
        quranSub: 'عثمانی رسم الخط، اردو ترجمہ، تفسیر اور آیت کارڈ',
        lastReadPrefix: 'آخری تلاوت',
        audioTitle: 'تلاوت',
        audioSub: 'مشہور قراء کرام کی خوبصورت تلاوتیں',
        audioMetaIdle: 'تلاوت',
        audioMetaActive: 'جاری ہے',
        prayerTitle: 'اوقاتِ نماز',
        prayerSub: 'نماز کے اوقات، منٹوں کی ترمیم اور طریقے',
        qiblaTitle: 'سمتِ قبلہ',
        qiblaSub: 'مکہ مکرمہ کی طرف قبلہ نما کمپاس',
        adhkarTitle: 'اذکار اور مسنون دعائیں',
        adhkarSub: 'صبح و شام اور نماز کے بعد کے اذکار آف لائن',
        adhkarMetaPrefix: 'مکمل',
        tasbihTitle: 'اسمارٹ تسبیح',
        tasbihSub: 'وائبریشن اور اہداف کے ساتھ تسبیح کاؤنٹر',
        tasbihMetaPrefix: 'موجودہ گنتی',
      },
      shortTiles: {
        quran: 'قرآن',
        audio: 'تلاوت',
        prayer: 'نماز',
        qibla: 'قبلہ',
        adhkar: 'اذکار',
        tasbih: 'تسبیح',
      },
    },
    prayers: {
      Fajr: 'فجر',
      Sunrise: 'طلوعِ آفتاب',
      Dhuhr: 'ظہر',
      Asr: 'عصر',
      Maghrib: 'مغرب',
      Isha: 'عشاء',
    },
    qibla: {
      title: 'سمتِ قبلہ کمپاس',
      updateGPS: 'GPS سے اپڈیٹ کریں',
      bearingLabel: 'قبلہ کا زاویہ',
      directionLabel: 'سمت',
      distanceLabel: 'کعبہ سے فاصلہ',
      kmUnit: 'کلومیٹر',
      sensorConnected: 'کمپاس آپ کے فون کے سینسر سے منسلک ہے۔',
      compassHint: 'شمال کی نسبت سنہری سوئی کی طرف رخ کریں۔',
      north: 'شمال',
      east: 'مشرق',
      south: 'جنوب',
      west: 'مغرب',
      directions8: ['شمال', 'شمال مشرق', 'مشرق', 'جنوب مشرق', 'جنوب', 'جنوب مغرب', 'مغرب', 'شمال مغرب'],
      activateCompass: 'کمپاس فعال کریں',
      compassActiveBadge: 'سینسر فعال',
      sensorBlockedNotice: 'اس براؤزر یا سینڈ باکس میں سمت کے سینسر دستیاب نہیں ہیں۔ نیچے دیے گئے درست زاویے یا دستی سلائیڈر سے رہنمائی حاصل کریں:',
      manualHeadingLabel: 'دستی سمت کا زاویہ (شمال سے)',
      alignedBadge: 'آپ قبلہ رُخ ہیں',
      fromNorthHint: 'حقیقی شمال سے',
    },
    prayerView: {
      adhanAt: 'وقتِ اذان',
      useGPS: 'میرا مقام (GPS)',
      adjustTimes: 'اوقات میں ترمیم',
      adjustPanelTitle: 'اوقات میں دستی ترمیم اور حساب کا طریقہ',
      adjustPanelSub: 'مقامی مسجد کے مطابق ہر نماز میں (-15 تا +15 منٹ) کی تبدیلی کریں',
      resetOffsets: 'ترمیم ختم کریں',
      currentTime: 'موجودہ وقت',
      minShort: 'منٹ',
      calcMethodLabel: 'حساب کا طریقہ',
      manualCoordsTitle: 'دستی عرض البلد و طول البلد',
      cityNamePlaceholder: 'شہر کا نام',
      latPlaceholder: 'عرض البلد',
      lonPlaceholder: 'طول البلد',
      applyCoordsBtn: 'مقام لاگو کریں',
      coordError: 'درست عرض البلد اور طول البلد درج کریں۔',
      todayTimings: 'آج کے نماز کے اوقات',
      openQibla: 'قبلہ کمپاس کھولیں',
      upcomingBadge: 'اگلی',
      adjustedBadge: 'ترمیم شدہ',
      adhanAudioAlert: 'اذان کا صوتی الرٹ',
      testTone: 'آواز چیک کریں',
      browserNotifications: 'براؤزر نوٹیفکیشن',
      notificationsSub: 'وقت داخل ہونے پر فوری اطلاع',
      geoUnsupported: 'آپ کا براؤزر لوکیشن سپورٹ نہیں کرتا۔',
      geoLocating: 'مقام تلاش کیا جا رہا ہے...',
      geoSuccess: 'نماز کے اوقات اور قبلہ اپڈیٹ ہو گئے۔',
      geoFail: 'لوکیشن تک رسائی نہ مل سکی۔',
      notifUnsupported: 'نوٹیفکیشن دستیاب نہیں۔',
      notifAllow: 'براؤزر سیٹنگز میں نوٹیفکیشن کی اجازت دیں۔',
      notifBlocked: 'نوٹیفکیشن بلاک ہیں۔',
      testNotifAdhanBtn: 'نوٹیفکیشن اور اذان ٹیسٹ کریں',
      stopAdhanBtn: 'روکیں',
      permGranted: 'فعال ہے',
      permDenied: 'مسترد شدہ',
      permDefault: 'فعالیت درکار ہے',
      sampleAdhanTitle: 'نمازِ عصر کی اذان کا وقت ہو گیا — تجربہ',
      sampleAdhanBody: '10 سیکنڈ کی اذان پیش نظارہ کے ساتھ تجرباتی اطلاع بھیجی گئی۔',
      adhanPreviewPlaying: 'اذان کا تجربہ جاری ہے (10 سیکنڈ)...',
    },
    quran: {
      khatmahBannerLabel: 'ختمِ قرآن ٹریکر',
      khatmahCompleted: 'ختمِ قرآن مکمل ہو گیا، اللہ قبول فرمائے!',
      pagesReadHeading: 'صفحات پڑھے گئے',
      progressLabel: 'پیش رفت',
      remainingPages: 'باقی',
      estimatedDays: 'متوقع دن',
      dailyGoalInput: 'روزانہ ہدف (صفحات):',
      completeGoalBtn: 'آج کا ورد مکمل کریں',
      surahIndexTab: 'فہرستِ سورت',
      bookmarksTab: 'محفوظ آیات',
      searchSurahPlaceholder: 'سورت کا نام یا نمبر تلاش کریں...',
      loadingSurahs: 'سورتوں کی فہرست لوڈ ہو رہی ہے...',
      noSurahsFound: 'کوئی سورت نہیں ملی۔',
      noBookmarks: 'ابھی کوئی آیت محفوظ نہیں کی گئی۔',
      ayahWord: 'آیات',
      meccan: 'مکی',
      medinan: 'مدنی',
      surahListBtn: 'فہرستِ سورت',
      readerHint: 'تفسیر، ترجمہ اور کارڈ کے لیے آیت پر کلک کریں',
      playRecitation: 'تلاوت سنیں',
      loadingSurah: 'آیات لوڈ ہو رہی ہیں...',
      surahLoadError: 'سورت لوڈ نہ ہو سکی۔ انٹرنیٹ چیک کریں۔',
      retry: 'دوبارہ کوشش',
      tafsirHint: 'تفسیر',
      prevSurah: 'پچھلی سورت',
      nextSurah: 'اگلی سورت',
      toggleTranslation: 'اردو ترجمہ',
      translationEditionLabel: 'ترجمہ',
      loadingTranslation: 'ترجمہ لوڈ ہو رہا ہے...',
      pageLabel: 'صفحہ',
      juzLabel: 'پارہ',
      hizbLabel: 'حزب',
      prevPage: 'پچھلا صفحہ',
      nextPage: 'اگلا صفحہ',
      jumpToPageLabel: 'صفحہ نمبر',
      goToPageBtn: 'جائیں',
      pageLoadError: 'مصحف کا صفحہ لوڈ نہ ہو سکا۔',
      continueReadingFromPage: 'صفحہ {page} سے تلاوت جاری رکھیں',
      ayahShort: 'آیت',
      bookmarkPage: 'صفحہ محفوظ کریں',
      pageBookmarked: 'صفحہ محفوظ ہے',
      pageBookmarkBadge: 'صفحہ نشان',
      verseBookmarkBadge: 'آیت نشان',
      fontSizeDecrease: 'حروف چھوٹے کریں',
      fontSizeIncrease: 'حروف بڑے کریں',
      fontSizeLabel: 'خط کا سائز',
      indexShortBtn: 'فہرست',
      settingsLabel: 'ترتیبات',
      resetFontAuto: 'خودکار',
      fontAutoLabel: 'خودکار',
      offlineReadyBadge: 'آف لائن دستیاب ✓',
      tafsirModal: {
        juz: 'پارہ',
        page: 'صفحہ',
        bookmarked: 'محفوظ شدہ',
        bookmarkVerse: 'نشان لگائیں',
        shareCard: 'آیت کارڈ شیئر کریں',
        showTafsir: 'تفسیر دیکھیں',
        listenSurah: 'سورت سنیں',
        downloadCard: 'کارڈ ڈاؤن لوڈ کریں (PNG)',
        tafsirHeading: 'تفسیر',
        muyassar: 'التفسیر المیسر',
        jalalayn: 'تفسیر الجلالین',
        loadingTafsir: 'تفسیر لوڈ ہو رہی ہے...',
        tafsirError: 'تفسیر دستیاب نہیں ہو سکی۔',
        translationHeading: 'اردو ترجمہ',
        closeLabel: 'بند کریں',
      },
    },
    audio: {
      title: 'قرآن کریم کی تلاوتیں',
      subtitle: 'قاری اور سورت منتخب کریں',
      searchReciter: 'قاری تلاش کریں...',
      updatingReciters: 'قراء کی فہرست اپڈیٹ ہو رہی ہے...',
      surahsBy: 'تلاوت از',
      filterSurahs: 'سورت تلاش کریں...',
      reciterVol: 'قاری کی آواز',
      player: {
        loading: 'لوڈ ہو رہا ہے...',
        openRecitations: 'تلاوت',
        prevSurah: 'پچھلی سورت',
        nextSurah: 'اگلی سورت',
        playLabel: 'چلائیں',
        pauseLabel: 'روکیں',
      },
    },
    adhkar: {
      title: 'حصن المسلم اور روزانہ کی سنتیں',
      subtitle: 'بغیر انٹرنیٹ کے ہر وقت دستیاب مسنون اذکار',
      adhkarTab: 'اذکار اور رقیہ',
      sunnahTab: 'روزانہ کی سنتیں',
      completedCount: 'مکمل',
      resetCategory: 'ری سیٹ کریں',
      requiredCount: 'تعداد',
      doneLabel: 'مکمل ہوا',
      tapToCount: 'گنتی کریں',
      categories: {
        morning: 'صبح کے اذکار',
        evening: 'شام کے اذکار',
        afterPrayer: 'نماز کے بعد',
        sleep: 'سونے کے اذکار',
        ruqyah: 'رقیہ شرعیہ',
      },
    },
    tasbih: {
      targetLabel: 'ہدف:',
      completedRounds: 'مکمل چکر:',
      resetBtn: 'صفر کریں',
      ofTargetHint: 'تسبیح کے لیے دبائیں',
      milestoneReached: 'ہدف مکمل ہو گیا — الحمد للہ',
      resetDialogTitle: 'تسبیح صفر کریں؟',
      resetDialogBody: 'موجودہ گنتی صفر ہو جائے گی۔ کیا آپ جاری رکھنا چاہتے ہیں؟',
      confirmReset: 'جی ہاں، صفر کریں',
      cancel: 'منسوخ',
    },
  },
};

const CITY_NAMES_LATIN: Record<string, string> = {
  biskra: 'Biskra, Algeria',
  algiers: 'Algiers, Algeria',
  oran: 'Oran, Algeria',
  constantine: 'Constantine, Algeria',
  makkah: 'Makkah, Saudi Arabia',
  madinah: 'Madinah, Saudi Arabia',
  cairo: 'Cairo, Egypt',
  tunis: 'Tunis, Tunisia',
  casablanca: 'Casablanca, Morocco',
  amman: 'Amman, Jordan',
};

const CALC_METHODS_LATIN: Record<number, string> = {
  19: 'Algerian Ministry of Religious Affairs (18° / 17°)',
  3: 'Muslim World League (MWL · 18° / 17°)',
  4: 'Umm Al-Qura University, Makkah (18.5°)',
  5: 'Egyptian General Authority of Survey (19.5° / 17.5°)',
  2: 'Islamic Society of North America (ISNA · 15°)',
};

export function getCityDisplayLabel(cityId: string, fallbackLabel: string, lang: AppLanguage): string {
  if (lang === 'ar' || lang === 'ur') return fallbackLabel;
  return CITY_NAMES_LATIN[cityId] ?? fallbackLabel;
}

export function getMethodDisplayLabel(
  methodId: number,
  nameAr: string,
  subtitleAr: string,
  lang: AppLanguage
): string {
  if (lang === 'ar' || lang === 'ur') return `${nameAr} — ${subtitleAr}`;
  return CALC_METHODS_LATIN[methodId] ?? `${nameAr} — ${subtitleAr}`;
}

