import type {
  AdhkarCategory,
  CityPreset,
  DhikrItem,
  FeaturedReciter,
  PrayerTimingsResponse,
  SunnahItem,
  SurahDetail,
  SurahSummary,
  TasbihPreset,
} from '../types/islamic';

export const CITY_PRESETS: CityPreset[] = [
  { id: 'biskra', nameAr: 'بسكرة', countryAr: 'الجزائر', latitude: 34.8504, longitude: 5.7281 },
  { id: 'algiers', nameAr: 'الجزائر العاصمة', countryAr: 'الجزائر', latitude: 36.7538, longitude: 3.0588 },
  { id: 'oran', nameAr: 'وهران', countryAr: 'الجزائر', latitude: 35.6971, longitude: -0.6308 },
  { id: 'constantine', nameAr: 'قسنطينة', countryAr: 'الجزائر', latitude: 36.365, longitude: 6.6147 },
  { id: 'makkah', nameAr: 'مكة المكرمة', countryAr: 'السعودية', latitude: 21.4225, longitude: 39.8262 },
  { id: 'madinah', nameAr: 'المدينة المنورة', countryAr: 'السعودية', latitude: 24.4672, longitude: 39.6112 },
  { id: 'cairo', nameAr: 'القاهرة', countryAr: 'مصر', latitude: 30.0444, longitude: 31.2357 },
  { id: 'tunis', nameAr: 'تونس', countryAr: 'تونس', latitude: 36.8065, longitude: 10.1815 },
  { id: 'casablanca', nameAr: 'الدار البيضاء', countryAr: 'المغرب', latitude: 33.5731, longitude: -7.5898 },
  { id: 'amman', nameAr: 'عمّان', countryAr: 'الأردن', latitude: 31.9454, longitude: 35.9284 },
];

export const FALLBACK_PRAYER_TIMINGS: PrayerTimingsResponse = {
  timings: {
    Fajr: '05:42',
    Sunrise: '07:10',
    Dhuhr: '12:34',
    Asr: '15:36',
    Maghrib: '17:58',
    Isha: '19:19',
  },
  hijriDateAr: 'جمادى الأولى ١٤٤٨ هـ',
  hijriDateEn: 'Jumada al-Ula 1448 AH',
  gregorianDate: '19 Nov 2026',
  timezone: 'Africa/Algiers',
};

export const FALLBACK_SURAH_LIST: SurahSummary[] = [
  { number: 1, name: 'سُورَةُ ٱلْفَاتِحَةِ', englishName: 'Al-Faatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
  { number: 2, name: 'سُورَةُ البَقَرَةِ', englishName: 'Al-Baqara', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
  { number: 18, name: 'سُورَةُ الكَهْفِ', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'Meccan' },
  { number: 36, name: 'سُورَةُ يسٓ', englishName: 'Yaseen', englishNameTranslation: 'Yaseen', numberOfAyahs: 83, revelationType: 'Meccan' },
  { number: 55, name: 'سُورَةُ الرَّحْمَٰن', englishName: 'Ar-Rahmaan', englishNameTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'Medinan' },
  { number: 67, name: 'سُورَةُ المُلْكِ', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'Meccan' },
  { number: 112, name: 'سُورَةُ الإِخْلَاصِ', englishName: 'Al-Ikhlaas', englishNameTranslation: 'Sincerity', numberOfAyahs: 4, revelationType: 'Meccan' },
  { number: 113, name: 'سُورَةُ الفَلَقِ', englishName: 'Al-Falaq', englishNameTranslation: 'The Dawn', numberOfAyahs: 5, revelationType: 'Meccan' },
  { number: 114, name: 'سُورَةُ النَّاسِ', englishName: 'An-Naas', englishNameTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'Meccan' },
];

export const FALLBACK_FATIHA: SurahDetail = {
  number: 1,
  name: 'سُورَةُ ٱلْفَاتِحَةِ',
  englishName: 'Al-Faatiha',
  englishNameTranslation: 'The Opening',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
  ayahs: [
    { number: 1, numberInSurah: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', juz: 1, page: 1, hizbQuarter: 1 },
    { number: 2, numberInSurah: 2, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', juz: 1, page: 1, hizbQuarter: 1 },
    { number: 3, numberInSurah: 3, text: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', juz: 1, page: 1, hizbQuarter: 1 },
    { number: 4, numberInSurah: 4, text: 'مَٰلِكِ يَوْمِ ٱلدِّينِ', juz: 1, page: 1, hizbQuarter: 1 },
    { number: 5, numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', juz: 1, page: 1, hizbQuarter: 1 },
    { number: 6, numberInSurah: 6, text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', juz: 1, page: 1, hizbQuarter: 1 },
    { number: 7, numberInSurah: 7, text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ', juz: 1, page: 1, hizbQuarter: 1 },
  ],
};

export const FALLBACK_FEATURED_RECITERS: FeaturedReciter[] = [
  {
    id: 112,
    name: 'محمد صديق المنشاوي',
    style: 'حفص عن عاصم - مرتل',
    server: 'https://server10.mp3quran.net/minsh/',
    surahList: Array.from({ length: 114 }, (_, i) => i + 1),
  },
  {
    id: 118,
    name: 'محمود خليل الحصري',
    style: 'حفص عن عاصم - مرتل',
    server: 'https://server13.mp3quran.net/husr/',
    surahList: Array.from({ length: 114 }, (_, i) => i + 1),
  },
  {
    id: 123,
    name: 'مشاري راشد العفاسي',
    style: 'حفص عن عاصم - مرتل',
    server: 'https://server8.mp3quran.net/afs/',
    surahList: Array.from({ length: 114 }, (_, i) => i + 1),
  },
  {
    id: 92,
    name: 'ياسر الدوسري',
    style: 'حفص عن عاصم - مرتل',
    server: 'https://server11.mp3quran.net/yasser/',
    surahList: Array.from({ length: 114 }, (_, i) => i + 1),
  },
  {
    id: 102,
    name: 'ماهر المعيقلي',
    style: 'حفص عن عاصم - مرتل',
    server: 'https://server12.mp3quran.net/maher/',
    surahList: Array.from({ length: 114 }, (_, i) => i + 1),
  },
  {
    id: 51,
    name: 'عبد الباسط عبد الصمد',
    style: 'حفص عن عاصم - مرتل',
    server: 'https://server7.mp3quran.net/basit/',
    surahList: Array.from({ length: 114 }, (_, i) => i + 1),
  },
];

export const ADHKAR_CATEGORIES: { id: AdhkarCategory; label: string }[] = [
  { id: 'morning', label: 'أذكار الصباح' },
  { id: 'evening', label: 'أذكار المساء' },
  { id: 'afterPrayer', label: 'بعد الصلاة' },
  { id: 'sleep', label: 'أذكار النوم' },
  { id: 'ruqyah', label: 'الرقية الشرعية' },
];

export const ADHKAR_ITEMS: DhikrItem[] = [
  // Morning
  {
    id: 'm-1',
    category: 'morning',
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    targetCount: 1,
    reference: 'سورة البقرة: ٢٥٥',
    virtue: 'من قالها حين يصبح أُجير من الجن حتى يمسي.',
  },
  {
    id: 'm-2',
    category: 'morning',
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.',
    targetCount: 1,
    reference: 'رواه مسلم',
    virtue: 'من أذكار الصباح الجامعة لخير اليوم والبركة فيه.',
  },
  {
    id: 'm-3',
    category: 'morning',
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    targetCount: 1,
    reference: 'سيد الاستغفار · رواه البخاري',
    virtue: 'من قالها موقنًا بها حين يصبح فمات من يومه دخل الجنة.',
  },
  {
    id: 'm-4',
    category: 'morning',
    text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    targetCount: 3,
    reference: 'رواه أبو داود والترمذي',
    virtue: 'لم يضره شيء بإذن الله.',
  },
  {
    id: 'm-5',
    category: 'morning',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
    targetCount: 3,
    reference: 'رواه مسلم',
    virtue: 'كلمات عظيمة الأجر والثواب في الصباح.',
  },
  {
    id: 'm-6',
    category: 'morning',
    text: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    targetCount: 7,
    reference: 'رواه أبو داود',
    virtue: 'من قالها سبع مرات كفاه الله ما أهمه.',
  },

  // Evening
  {
    id: 'e-1',
    category: 'evening',
    text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.',
    targetCount: 1,
    reference: 'رواه مسلم',
    virtue: 'تحصين المساء وسؤال الله خير الليلة.',
  },
  {
    id: 'e-2',
    category: 'evening',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    targetCount: 3,
    reference: 'رواه مسلم',
    virtue: 'حفظ من كل سوء وشر في المساء.',
  },
  {
    id: 'e-3',
    category: 'evening',
    text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.',
    targetCount: 1,
    reference: 'رواه الترمذي',
    virtue: 'تذكير بالتوكل على الله في كل حال.',
  },
  {
    id: 'e-4',
    category: 'evening',
    text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.',
    targetCount: 3,
    reference: 'رواه أبو داود',
    virtue: 'حق على الله أن يرضيه يوم القيامة.',
  },
  {
    id: 'e-5',
    category: 'evening',
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.',
    targetCount: 10,
    reference: 'رواه الطبراني',
    virtue: 'أدركته شفاعة النبي ﷺ يوم القيامة.',
  },

  // After Prayer
  {
    id: 'p-1',
    category: 'afterPrayer',
    text: 'أَسْتَغْفِرُ اللَّهَ (ثلاثًا) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.',
    targetCount: 3,
    reference: 'رواه مسلم',
    virtue: 'أول ما يقال بعد السلام من الفريضة.',
  },
  {
    id: 'p-2',
    category: 'afterPrayer',
    text: 'سُبْحَانَ اللَّهِ',
    targetCount: 33,
    reference: 'رواه مسلم',
    virtue: 'من تمام تسبيح دبر كل صلاة مكتوبة.',
  },
  {
    id: 'p-3',
    category: 'afterPrayer',
    text: 'الْحَمْدُ لِلَّهِ',
    targetCount: 33,
    reference: 'رواه مسلم',
    virtue: 'تملأ الميزان حمدًا وشكرًا لله.',
  },
  {
    id: 'p-4',
    category: 'afterPrayer',
    text: 'اللَّهُ أَكْبَرُ',
    targetCount: 33,
    reference: 'رواه مسلم',
    virtue: 'تمام المائة: لا إله إلا الله وحده لا شريك له.',
  },
  {
    id: 'p-5',
    category: 'afterPrayer',
    text: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
    targetCount: 1,
    reference: 'رواه مسلم',
    virtue: 'غُفرت خطاياه وإن كانت مثل زبد البحر.',
  },

  // Sleep
  {
    id: 's-1',
    category: 'sleep',
    text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
    targetCount: 1,
    reference: 'متفق عليه',
    virtue: 'دعاء الاضطجاع على الشق الأيمن قبل النوم.',
  },
  {
    id: 's-2',
    category: 'sleep',
    text: 'قراءة سورة الإخلاص والمعوذتين ثلاث مرات، والنفث في الكفين ومسح ما استطاع من الجسد.',
    targetCount: 3,
    reference: 'رواه البخاري',
    virtue: 'تحصين نبوي مبارك عند النوم.',
  },
  {
    id: 's-3',
    category: 'sleep',
    text: 'سُبْحَانَ اللَّهِ (٣٣) · الْحَمْدُ لِلَّهِ (٣٣) · اللَّهُ أَكْبَرُ (٣٤)',
    targetCount: 34,
    reference: 'تسبيحة فاطمة · متفق عليه',
    virtue: 'خير من خادم وتُعين على بركة الوقت والنشاط.',
  },
  {
    id: 's-4',
    category: 'sleep',
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
    targetCount: 3,
    reference: 'رواه أبو داود',
    virtue: 'كان النبي ﷺ يضع يده اليمنى تحت خده ويقولها.',
  },

  // Ruqyah
  {
    id: 'r-1',
    category: 'ruqyah',
    text: 'أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ، مِنْ هَمْزِهِ وَنَفْخِهِ وَنَفْثِهِ.',
    targetCount: 3,
    reference: 'سورة الفاتحة · آية الكرسي',
    virtue: 'الاستعاذة بالله من كل شر وحفظ القلب.',
  },
  {
    id: 'r-2',
    category: 'ruqyah',
    text: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ.',
    targetCount: 7,
    reference: 'رواه أبو داود والترمذي',
    virtue: 'من رقى بها مريضًا عُوفي بإذن الله ما لم يحضر أجله.',
  },
  {
    id: 'r-3',
    category: 'ruqyah',
    text: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ.',
    targetCount: 3,
    reference: 'رواه مسلم',
    virtue: 'رقية جبريل عليه السلام للنبي ﷺ.',
  },
  {
    id: 'r-4',
    category: 'ruqyah',
    text: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.',
    targetCount: 3,
    reference: 'متفق عليه',
    virtue: 'من أجمع أدعية الشفاء والعافية.',
  },
];

export const DAILY_SUNNAH_LIST: SunnahItem[] = [
  {
    id: 'sunnah-1',
    title: 'صلاة ركعتي الضحى',
    description: 'أقلها ركعتان وتُجزئ عن صدقة كل مفصل في الجسد (صلاة الأوابين).',
    timeLabel: 'بعد الشروق بربع ساعة حتى قبيل الظهر',
    reference: 'رواه مسلم',
  },
  {
    id: 'sunnah-2',
    title: 'السواك عند كل صلاة ووضوء',
    description: 'مطهرة للفم ومرضاة للرب، ويُسن عند الاستيقاظ وقراءة القرآن.',
    timeLabel: 'طوال اليوم',
    reference: 'متفق عليه',
  },
  {
    id: 'sunnah-3',
    title: 'السنن الرواتب (١٢ ركعة)',
    description: 'ركعتان قبل الفجر، أربع قبل الظهر وركعتان بعده، وركعتان بعد المغرب، وركعتان بعد العشاء.',
    timeLabel: 'مع الصلوات الخمس',
    reference: 'رواه مسلم',
  },
  {
    id: 'sunnah-4',
    title: 'قراءة سورة الملك قبل النوم',
    description: 'هي المانعة المنجية التي تشفع لصاحبها حتى يُغفر له.',
    timeLabel: 'كل ليلة قبل النوم',
    reference: 'رواه الترمذي',
  },
  {
    id: 'sunnah-5',
    title: 'صلاة الوتر قبل النوم أو آخر الليل',
    description: 'أقلها ركعة واحدة، وأدنى الكمال ثلاث ركعات، وهي ختام صلاة الليل.',
    timeLabel: 'بين صلاة العشاء والفجر',
    reference: 'متفق عليه',
  },
];

export const TASBIH_PRESETS: TasbihPreset[] = [
  { id: 'subhanallah', phrase: 'سُبْحَانَ اللَّهِ', defaultTarget: 33 },
  { id: 'alhamdulillah', phrase: 'الْحَمْدُ لِلَّهِ', defaultTarget: 33 },
  { id: 'allahuakbar', phrase: 'اللَّهُ أَكْبَرُ', defaultTarget: 33 },
  { id: 'tahlil', phrase: 'لَا إِلَٰهَ إِلَّا اللَّهُ', defaultTarget: 100 },
  { id: 'istighfar', phrase: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ', defaultTarget: 100 },
  { id: 'salawat', phrase: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', defaultTarget: 100 },
];
