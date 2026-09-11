import { LanguageCode, DisasterAlert, RoadStatus, IncidentReport } from '../types';

export const STATE_NAMES: Record<string, Record<LanguageCode, string>> = {
  Assam: {
    en: 'Assam',
    hi: 'असम',
    as: 'অসম',
    bn: 'আসাম',
    lus: 'Assam',
    mni: 'ꯑꯁꯥꯝ',
  },
  'Arunachal Pradesh': {
    en: 'Arunachal Pradesh',
    hi: 'अरुणाचल प्रदेश',
    as: 'অৰুণাচল প্ৰদেশ',
    bn: 'অরুণাচল প্রদেশ',
    lus: 'Arunachal Pradesh',
    mni: 'ꯑꯔꯨꯅꯥꯆꯜ ꯄ꯭ꯔꯗꯦꯁ',
  },
  Manipur: {
    en: 'Manipur',
    hi: 'मणिपुर',
    as: 'মণিপুৰ',
    bn: 'মণিপুর',
    lus: 'Manipur',
    mni: 'ꯃꯅꯤꯄꯨꯔ',
  },
  Meghalaya: {
    en: 'Meghalaya',
    hi: 'मेघालय',
    as: 'মেঘালয়',
    bn: 'মেঘালয়',
    lus: 'Meghalaya',
    mni: 'ꯃꯦꯘꯥꯂꯌ',
  },
  Mizoram: {
    en: 'Mizoram',
    hi: 'मिजोरम',
    as: 'মিজোৰাম',
    bn: 'মিজোরাম',
    lus: 'Mizoram',
    mni: 'ꯃꯤꯖꯣꯔꯥꯝ',
  },
  Nagaland: {
    en: 'Nagaland',
    hi: 'नागालैंड',
    as: 'নাগালেণ্ড',
    bn: 'নাগাল্যান্ড',
    lus: 'Nagaland',
    mni: 'ꯅꯥꯒꯥꯂꯦꯟꯗ',
  },
  Sikkim: {
    en: 'Sikkim',
    hi: 'सिक्किम',
    as: 'ছিকিম',
    bn: 'সিকিম',
    lus: 'Sikkim',
    mni: 'ꯁꯤꯛꯀꯤꯝ',
  },
  Tripura: {
    en: 'Tripura',
    hi: 'त्रिपुरा',
    as: 'ত্ৰিপুৰা',
    bn: 'ত্রিপুরা',
    lus: 'Tripura',
    mni: 'ꯇ꯭ꯔꯤꯄꯨꯔꯥ',
  },
};

export const getLocalizedState = (stateName: string, lang: LanguageCode | string): string => {
  const code = (lang as LanguageCode) || 'en';
  return STATE_NAMES[stateName]?.[code] || stateName;
};

// Weather Outlook Translations (Requirement 6)
export const WEATHER_CONDITIONS: Record<string, Record<LanguageCode, string>> = {
  'Heavy Monsoon Cloudburst': {
    en: 'Heavy Monsoon Cloudburst',
    hi: 'भारी मानसूनी बादल फटना',
    as: 'প্ৰচণ্ড বাৰিষাৰ ডাৱৰ বিস্ফোৰণ',
    bn: 'ভারী মৌসুমি মেঘভাঙা বৃষ্টি',
    lus: 'Ruahsur Nasa Leh Thlipui',
    mni: 'ꯑꯀꯟꯕ ꯅꯣꯡꯖꯨ ꯆꯨꯕ',
  },
  'Intense Orographic Rainfall': {
    en: 'Intense Orographic Rainfall',
    hi: 'तीव्र पर्वतीय वर्षा (ओरोग्राफिक)',
    as: 'তীব্ৰ পৰ্বতীয়া বৃষ্টিপাত',
    bn: 'তীব্র শৈলোৎক্ষেপ বৃষ্টিপাত',
    lus: 'Tlangpang Ruahsur Nasa',
    mni: 'ꯆꯤꯡꯖꯥꯎ ꯑꯀꯟꯕ ꯅꯣꯡ ꯆꯨꯕ',
  },
  'Intermittent Thundershowers': {
    en: 'Intermittent Thundershowers',
    hi: 'रुक-रुक कर गरज के साथ बौछारें',
    as: 'মাজে মাজে বিজুলী-ঢেৰেকণি সহ বৰষুণ',
    bn: 'মাঝে মাঝে বজ্রবিদ্যুৎসহ বৃষ্টি',
    lus: 'Tek Leh Khawpui Riruang Karah Ruahsur',
    mni: 'ꯅꯣꯡꯊꯥꯡ ꯈꯣꯡꯗꯨꯅ ꯅꯣꯡ ꯆꯨꯕ',
  },
  'Scattered Hill Precipitation': {
    en: 'Scattered Hill Precipitation',
    hi: 'पहाड़ों पर छिटपुट वर्षा',
    as: 'বিক্ষিপ্ত পাহাৰীয়া বৰষুণ',
    bn: 'পাহাড়ি এলাকায় বিচ্ছিন্ন বৃষ্টিপাত',
    lus: 'Tlangram Ruah Theh Thli',
    mni: 'ꯆꯤꯡꯗ ꯈꯔ-ꯈꯔ ꯅꯣꯡ ꯆꯨꯕ',
  },
  'Partly Cloudy / Light Mist': {
    en: 'Partly Cloudy / Light Mist',
    hi: 'आंशिक रूप से बादल / हल्का कोहरा',
    as: 'আংশিক মেঘাচ্ছন্ন / পাতল কুঁৱলী',
    bn: 'আংশিক মেঘলা / হালকা কুয়াশা',
    lus: 'Chhum Zing Leh Meikhu Tlem',
    mni: 'ꯂꯩꯆꯤꯜ ꯑꯃꯁꯨꯡ ꯃꯩꯈꯨ ꯈꯔ ꯂꯩꯕ',
  },
};

export const WEATHER_DAYS: Record<string, Record<LanguageCode, string>> = {
  Today: {
    en: 'Today',
    hi: 'आज',
    as: 'আজি',
    bn: 'আজ',
    lus: 'Vawiin',
    mni: 'ꯉꯁꯤ',
  },
  Tomorrow: {
    en: 'Tomorrow',
    hi: 'कल',
    as: 'কাইলৈ',
    bn: 'আগামীকাল',
    lus: 'Naktuk',
    mni: 'ꯍꯌꯦꯡ',
  },
  'Day 3': {
    en: 'Day 3',
    hi: 'दिन 3',
    as: 'দিন ৩',
    bn: 'দিন ৩',
    lus: 'Ni 3-na',
    mni: 'ꯅꯨꯃꯤꯠ ꯳',
  },
  'Day 4': {
    en: 'Day 4',
    hi: 'दिन 4',
    as: 'দিন ৪',
    bn: 'দিন ৪',
    lus: 'Ni 4-na',
    mni: 'ꯅꯨꯃꯤꯠ ꯴',
  },
  'Day 5': {
    en: 'Day 5',
    hi: 'दिन 5',
    as: 'দিন ৫',
    bn: 'দিন ৫',
    lus: 'Ni 5-na',
    mni: 'ꯅꯨꯃꯤꯠ ꯵',
  },
};

export const WEATHER_ADVISORIES: Record<string, Record<LanguageCode, string>> = {
  'Avoid transit. Extreme debris flow risk.': {
    en: 'Avoid transit. Extreme debris flow risk.',
    hi: 'आवागमन से बचें। मलबे के तीव्र बहाव का अत्यधिक जोखिम।',
    as: 'যাতায়াত এৰাই চলক। ধ্বংসাৱশেষ বৈ অহাৰ চৰম আশংকা।',
    bn: 'চলাচল এড়িয়ে চলুন। ধ্বংসাবশেষ প্রবাহের চরম ঝুঁকি।',
    lus: 'Kalvel loh tur. Leimin leh lungchim hlauhawm tak.',
    mni: 'ꯂꯝꯕꯤ ꯆꯠꯀꯅꯨ꯫ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕꯒꯤ ꯑꯆꯧꯕ ꯑꯀꯤꯕ ꯂꯩꯔꯤ꯫',
  },
  'Essential travel only. Watch cut slopes.': {
    en: 'Essential travel only. Watch cut slopes.',
    hi: 'केवल आवश्यक यात्रा करें। कटे हुए ढलानों पर नजर रखें।',
    as: 'কেৱল জৰুৰী যাত্ৰা কৰক। কটা পাহাৰীয়া ঢাললৈ লক্ষ্য ৰাখক।',
    bn: 'শুধুমাত্র জরুরি ভ্রমণ। কাটা পাহাড়ি ঢাল লক্ষ্য রাখুন।',
    lus: 'Tul bik chauhvah kal rawh. Tlangpang chhe mai thei en uluk rawh.',
    mni: 'ꯌꯥꯝꯅ ꯃꯊꯧ ꯇꯥꯕꯗ ꯆꯠꯂꯨ꯫ ꯆꯤꯡꯖꯥꯎ ꯇꯦꯛꯄ ꯌꯦꯡꯁꯤꯜꯂꯨ꯫',
  },
  'Exercise caution during night hours.': {
    en: 'Exercise caution during night hours.',
    hi: 'रात के समय सावधानी बरतें।',
    as: 'ৰাতিৰ সময়ত বিশেষ সতৰ্কতা অৱলম্বন কৰক।',
    bn: 'রাতের বেলা চলাচলে সতর্কতা অবলম্বন করুন।',
    lus: 'Zan lamah fimkhur lehzual rawh.',
    mni: 'ꯑꯍꯤꯡꯒꯤ ꯃꯇꯝꯗ ꯆꯦꯛꯁꯤꯟꯅ ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯇꯧꯕꯤꯌꯨ꯫',
  },
  'Normal mountain travel conditions.': {
    en: 'Normal mountain travel conditions.',
    hi: 'सामान्य पर्वतीय यात्रा की स्थिति।',
    as: 'স্বাভাৱিক পাহাৰীয়া যাতায়াতৰ পৰিস্থিতি।',
    bn: 'স্বাভাবিক পাহাড়ি ভ্রমণের পরিস্থিতি।',
    lus: 'Tlangkawng pangngai a tlang tha.',
    mni: 'ꯆꯤꯡꯒꯤ ꯂꯝꯕꯤ ꯆꯠꯄꯗ ꯆꯥꯡ ꯅꯥꯏꯅ ꯁꯥꯐꯅ ꯂꯩꯔꯤ꯫',
  },
};

export const getLocalizedWeatherCondition = (condition: string, lang: LanguageCode | string): string => {
  const code = (lang as LanguageCode) || 'en';
  return WEATHER_CONDITIONS[condition]?.[code] || condition;
};

export const getLocalizedWeatherDay = (day: string, lang: LanguageCode | string): string => {
  const code = (lang as LanguageCode) || 'en';
  return WEATHER_DAYS[day]?.[code] || day;
};

export const getLocalizedWeatherAdvisory = (advisory: string, lang: LanguageCode | string): string => {
  const code = (lang as LanguageCode) || 'en';
  return WEATHER_ADVISORIES[advisory]?.[code] || advisory;
};

// Risk levels
export const RISK_LEVELS: Record<string, Record<LanguageCode, string>> = {
  CRITICAL: {
    en: 'CRITICAL',
    hi: 'गंभीर',
    as: 'সংকটজনক',
    bn: 'সংকটজনক',
    lus: 'HLAUHAWM',
    mni: 'ꯈꯨꯗꯣꯡꯊꯤꯕ',
  },
  HIGH: {
    en: 'HIGH',
    hi: 'उच्च',
    as: 'উচ্চ',
    bn: 'উচ্চ',
    lus: 'SANG',
    mni: 'ꯌꯥꯝꯅ ꯑꯀꯤꯕ',
  },
  MODERATE: {
    en: 'MODERATE',
    hi: 'मध्यम',
    as: 'মধ্যম',
    bn: 'মাঝারি',
    lus: 'FIMKHUR',
    mni: 'ꯃꯌꯥꯏ ꯑꯣꯏꯕ',
  },
  LOW: {
    en: 'LOW',
    hi: 'कम',
    as: 'নিম্ন',
    bn: 'কম',
    lus: 'HIM',
    mni: 'ꯑꯀꯤꯕ ꯂꯩꯇꯦ',
  },
};

export const getLocalizedRiskLevel = (risk: string, lang: LanguageCode | string): string => {
  const code = (lang as LanguageCode) || 'en';
  const upper = (risk || '').toUpperCase();
  return RISK_LEVELS[upper]?.[code] || risk;
};

export interface LocalizedWeatherRiskBadge {
  label: string;
  desc: string;
}

export const WEATHER_RISK_BADGES: Record<string, Record<LanguageCode, LocalizedWeatherRiskBadge>> = {
  CRITICAL: {
    en: { label: 'CRITICAL HAZARD', desc: 'High probability of slope failure & road blockage' },
    hi: { label: 'अत्यधिक गंभीर खतरा', desc: 'ढलान टूटने और सड़क अवरुद्ध होने की उच्च संभावना' },
    as: { label: 'চৰম বিপদসংকুল', desc: 'পাহাৰ খহি পৰাৰ আৰু পথ বন্ধ হোৱাৰ প্ৰৱল আশংকা' },
    bn: { label: 'চরম বিপজ্জনক', desc: 'পাহাড় ধস এবং রাস্তা বন্ধের প্রবল সম্ভাবনা' },
    lus: { label: 'DINHMUN HLAUHAWM LUTUK', desc: 'Leimin leh kawng ping thut theihna a sang hle' },
    mni: { label: 'ꯌꯥꯝꯅ ꯆꯥꯎꯕ ꯈꯨꯗꯣꯡꯊꯤꯕ', desc: 'ꯆꯤꯡ ꯇꯨꯝꯕ ꯑꯃꯁꯨꯡ ꯂꯝꯕꯤ ꯊꯤꯡꯕꯒꯤ ꯑꯀꯤꯕ ꯌꯥꯝꯅ ꯂꯩ' },
  },
  HIGH: {
    en: { label: 'HIGH RISK', desc: 'High antecedent moisture. Travel cautiously.' },
    hi: { label: 'उच्च जोखिम', desc: 'मिट्टी में अत्यधिक नमी। सावधानीपूर्वक यात्रा करें।' },
    as: { label: 'উচ্চ আশংকা', desc: 'মাটিৰ আৰ্দ্ৰতা অত্যন্ত বেছি। সাৱধানেৰে যাত্ৰা কৰক।' },
    bn: { label: 'উচ্চ ঝুঁকি', desc: 'মাটিতে অতিরিক্ত আর্দ্রতা। সাবধানে ভ্রমণ করুন।' },
    lus: { label: 'DINHMUN HAUHAWM', desc: 'Lei a hnawng tawh hle. Fimkhur takin kal tur.' },
    mni: { label: 'ꯑꯋꯥꯡꯕ ꯈꯨꯗꯣꯡꯊꯤꯕ', desc: 'ꯂꯩꯃꯥꯏ ꯏꯁꯤꯡ ꯌꯥꯝꯅ ꯂꯩꯔꯦ꯫ ꯆꯦꯛꯁꯤꯟꯅ ꯆꯠꯎ꯫' },
  },
  MODERATE: {
    en: { label: 'MODERATE RISK', desc: 'Moisture buildup. Monitor localized drains.' },
    hi: { label: 'मध्यम जोखिम', desc: 'नमी का संचय। स्थानीय जल निकासी पर नजर रखें।' },
    as: { label: 'মধ্যমীয়া আশংকা', desc: 'আৰ্দ্ৰতা বৃদ্ধি পাইছে। স্থানীয় নলা-নৰ্দমা পৰ্যবেক্ষণ কৰক।' },
    bn: { label: 'মাঝারি ঝুঁকি', desc: 'আর্দ্রতা বৃদ্ধি। স্থানীয় ড্রেনেজ পর্যবেক্ষণ করুন।' },
    lus: { label: 'DINHMUN LAIHAWL', desc: 'Lei a hnawng chho mek. Tui luan kawr te en zui rawh.' },
    mni: { label: 'ꯃꯌꯥꯏ ꯑꯣꯏꯕ ꯈꯨꯗꯣꯡꯊꯤꯕ', desc: 'ꯏꯁꯤꯡ ꯊꯨꯝꯖꯤꯜꯂꯛꯂꯦ꯫ ꯏꯁꯤꯡ ꯆꯠꯄ ꯃꯐꯝꯁꯤꯡ ꯌꯦꯡꯁꯤꯟꯎ꯫' },
  },
  LOW: {
    en: { label: 'LOW RISK / STABLE', desc: 'Safe mountain corridors under current conditions.' },
    hi: { label: 'कम जोखिम / स्थिर', desc: 'वर्तमान परिस्थितियों में सुरक्षित पर्वतीय गलियारे।' },
    as: { label: 'কম আশংকা / সুস্থিৰ', desc: 'বৰ্তমান পৰিস্থিতিত সুৰক্ষিত পাহাৰীয়া পথ।' },
    bn: { label: 'কম ঝুঁকি / স্থিতিশীল', desc: 'বর্তমান পরিস্থিতিতে নিরাপদ পাহাড়ি করিডোর।' },
    lus: { label: 'DINHMUN THA / TLANGPANG', desc: 'Tun dinhmunah chuan tlang kawng a him tawk.' },
    mni: { label: 'ꯅꯦꯝꯕ ꯈꯨꯗꯣꯡꯊꯤꯕ / ꯐꯤꯚꯝ ꯐꯩ', desc: 'ꯍꯧꯖꯤꯛ ꯐꯤꯚꯝꯗ ꯆꯤꯡꯒꯤ ꯂꯝꯕꯤ ꯉꯥꯛ-ꯁꯦꯟꯅ ꯂꯩꯔꯤ꯫' },
  },
};

export const getLocalizedWeatherRiskBadge = (
  level: string,
  lang: LanguageCode | string
): LocalizedWeatherRiskBadge => {
  const code = (lang as LanguageCode) || 'en';
  const upper = (level || '').toUpperCase();
  const found = WEATHER_RISK_BADGES[upper]?.[code] || WEATHER_RISK_BADGES.MODERATE[code] || WEATHER_RISK_BADGES.MODERATE.en;
  return found;
};

export const LOCATION_NAMES: Record<string, Record<LanguageCode, string>> = {
  'loc-assam-dima-hasao': {
    en: 'Haflong Hill Cut (NH-27 Corridor)',
    hi: 'हाफलोंग हिल कट (एनएच-27 कॉरिडोर)',
    as: 'হাফলং পাহাৰীয়া পথ (এনএইচ-২৭ কৰিডৰ)',
    bn: 'হাফলং পাহাড় কাটা পথ (এনএইচ-২৭ করিডোর)',
    lus: 'Haflong Tlang Kawng (NH-27 Corridor)',
    mni: 'ꯍꯥꯐꯂꯣꯡ ꯆꯤꯡ ꯀꯛꯄ ꯂꯝꯕꯤ (NH-27)',
  },
  'loc-sikkim-north-mangan': {
    en: 'Mangan - Chungthang Slope (NH-10 Spur)',
    hi: 'मंगन - चुंगथांग ढलान (एनएच-10 स्पर)',
    as: 'মাংগন - চুংথাং ঢাল (এনএইচ-১০ স্পাৰ)',
    bn: 'মাঙ্গান - চুংথাং ঢাল (এনএইচ-১০ স্পার)',
    lus: 'Mangan - Chungthang Tlangpang (NH-10 Spur)',
    mni: 'ꯃꯥꯡꯒꯟ - ꯆꯨꯡꯊꯥꯡ ꯆꯤꯡꯖꯥꯎ (NH-10)',
  },
  'loc-meghalaya-east-khasi-sohra': {
    en: 'Sohra (Cherrapunji) - Mawkdok Gorge Edge',
    hi: 'सोहरा (चेरापूंजी) - मॉवकडोक कंदरा छोर',
    as: 'চোহৰা (চেৰাপুঞ্জী) - মাওকডক গিৰিখাতৰ দাঁতি',
    bn: 'সোহরা (চেরাপুঞ্জি) - মাওকডক গিরিখাত প্রান্ত',
    lus: 'Sohra (Cherrapunji) - Mawkdok Mawng Pang',
    mni: 'ꯁꯣꯍꯔꯥ (ꯆꯦꯔꯥꯄꯨꯟꯖꯤ) - ꯃꯥꯎꯛꯗꯣꯛ ꯆꯤꯡꯖꯥꯎ',
  },
  'loc-manipur-noney-tupul': {
    en: 'Tupul Yard - Ijai River Slope (Jiribam-Imphal Line)',
    hi: 'तूपुल यार्ड - इजाई नदी ढलान (जिरीबाम-इंफाल लाइन)',
    as: 'টুপুল য়াৰ্ড - ইজাই নদীৰ ঢাল (জিৰিবাম-ইম্ফল লাইন)',
    bn: 'টুপুল ইয়ার্ড - ইজাই নদী ঢাল (জিরিবাম-ইম্ফল লাইন)',
    lus: 'Tupul Hmun - Ijai Lui Kam (Jiribam-Imphal Line)',
    mni: 'ꯇꯨꯄꯨꯜ ꯌꯥꯔꯗ - ꯏꯖꯥꯏ ꯇꯨꯔꯦꯜ ꯇꯣꯔꯕꯥꯟ (ꯖꯤꯔꯤꯕꯥꯝ-ꯏꯝꯐꯥꯜ)',
  },
  'loc-nagaland-kohima-south': {
    en: 'Kohima South - Dzükou Valley Scarp (NH-29 Bypass)',
    hi: 'कोहिमा दक्षिण - द्जुको घाटी ढलान (एनएच-29 बाईपास)',
    as: 'কহিমা দক্ষিণ - জুকৌ উপত্যকাৰ ঢাল (এনএইচ-২৯ বাইপাছ)',
    bn: 'কোহিমা দক্ষিণ - জুকো ভ্যালি ঢাল (এনএইচ-২৯ বাইপাস)',
    lus: 'Kohima Chhimlam - Dzukou Phaizawl Chhehvel (NH-29 Bypass)',
    mni: 'ꯀꯣꯍꯤꯃꯥ ꯃꯈꯥ - ꯖꯨꯀꯣ ꯇꯝꯄꯥꯛ (NH-29)',
  },
  'loc-arunachal-west-kameng-bomdila': {
    en: 'Bomdila Pass - Sela Tunnel Approach (NH-13)',
    hi: 'बोमडिला दर्रा - सेला टनल मार्ग (एनएच-13)',
    as: 'বমডিলা পাছ - চেলা সুৰংগ পথ (এনএইচ-১৩)',
    bn: 'বোমডিলা গিরিপথ - সেলা টানেল পথ (এনএইচ-১৩)',
    lus: 'Bomdila Pass - Sela Tunnel Kawng (NH-13)',
    mni: 'ꯕꯣꯃꯗꯤꯂꯥ ꯄꯥꯁ - ꯁꯦꯂꯥ ꯇꯅꯦꯜ ꯂꯝꯕꯤ (NH-13)',
  },
  'loc-mizoram-aizawl-hunthar': {
    en: 'Hunthar Sinking Zone (Aizawl West NH-54)',
    hi: 'हुनथार धंसान क्षेत्र (आइजोल पश्चिम एनएच-54)',
    as: 'হুনথাৰ ভূ-নিমজ্জন অঞ্চল (আইজল পশ্চিম এনএইচ-৫৪)',
    bn: 'হুনথার ভূমিধ্বস এলাকা (আইজল পশ্চিম এনএইচ-৫৪)',
    lus: 'Hunthar Leimin Hmun (Aizawl West NH-54)',
    mni: 'ꯍꯨꯟꯊꯥꯔ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ ꯃꯐꯝ (ꯑꯥꯏꯖꯣꯜ NH-54)',
  },
  'loc-tripura-dhalai-ambassa': {
    en: 'Ambassa - Longtharai Valley Ridge (NH-8)',
    hi: 'अम्बासा - लोंगथराई घाटी कटक (एनएच-8)',
    as: 'আম্বাছা - লংথৰাই উপত্যকা পাহাৰ (এনএইচ-৮)',
    bn: 'আম্বাসা - লংথরাই উপত্যকা শৈলশিরা (এনএইচ-৮)',
    lus: 'Ambassa - Longtharai Phaizawl Mual (NH-8)',
    mni: 'ꯑꯝꯕꯥꯁꯥ - ꯂꯣꯡꯊꯔꯥꯏ ꯇꯝꯄꯥꯛ (NH-8)',
  },
  'loc-assam-kamrup-guwahati': {
    en: 'Khanapara - Narakasur Hill Slopes',
    hi: 'खानापारा - नरकासुर पहाड़ी ढलान',
    as: 'খানাপাৰা - নৰকাসুৰ পাহাৰৰ ঢাল',
    bn: 'খানাপাড়া - নরকাসুর পাহাড়ি ঢাল',
    lus: 'Khanapara - Narakasur Tlangpang',
    mni: 'ꯈꯥꯅꯥꯄꯥꯔꯥ - ꯅꯔꯀꯥꯁꯨꯔ ꯆꯤꯡꯖꯥꯎ',
  },
  'loc-arunachal-tawang-pass': {
    en: 'Tawang - Lumla High Altitude Pass',
    hi: 'तवांग - लुमला उच्च तुंगता दर्रा',
    as: 'তাৱাং - লুমলা উচ্চ উচ্চতাৰ পাছ',
    bn: 'তাওয়াং - লুমলা উচ্চ পার্বত্য গিরিপথ',
    lus: 'Tawang - Lumla Tlang Sang Pass',
    mni: 'ꯇꯋꯥꯡ - ꯂꯨꯃꯂꯥ ꯑꯋꯥꯡꯕ ꯄꯥꯁ',
  },
};

export const getLocalizedLocationName = (
  locId: string,
  defaultName: string,
  lang: LanguageCode | string
): string => {
  const code = (lang as LanguageCode) || 'en';
  return LOCATION_NAMES[locId]?.[code] || defaultName;
};

// Alert translations (Requirement 2 and Requirement 3)
export interface LocalizedAlertContent {
  title: string;
  message: string;
}

export const ALERT_TRANSLATIONS: Record<string, Record<LanguageCode, LocalizedAlertContent>> = {
  'alert-ner-001': {
    en: {
      title: 'RED ALERT: Imminent Landslide & Debris Flow Warning for Dima Hasao District',
      message:
        'Extreme precipitation (184mm/24h) and 86% soil moisture detected. High risk of catastrophic slope failure along Haflong hill cut and Lumding-Silchar corridor. Citizens advised to evacuate low-lying toe settlements immediately.',
    },
    hi: {
      title: 'रेड अलर्ट: दीमा हसाओ जिले के लिए आसन्न भूस्खलन और मलबे के बहाव की चेतावनी',
      message:
        'अत्यधिक वर्षा (184 मिमी/24 घंटे) और 86% मिट्टी की नमी दर्ज की गई। हाफलोंग पहाड़ी कट और लामडिंग-सिलचर गलियारे में भीषण ढलान विफलता का उच्च जोखिम। नागरिकों को निचले इलाकों की बस्तियों को तुरंत खाली करने की सलाह दी जाती है।',
    },
    as: {
      title: 'ৰেড এলাৰ্ট: ডিমা হাচাও জিলাৰ বাবে আসন্ন ভূমিস্খলন আৰু পলস বৈ অহাৰ সতৰ্কবাণী',
      message:
        'চৰম বৰষুণ (১৮৪মিমি/২৪ঘণ্টা) আৰু ৮৬% মাটিৰ আৰ্দ্ৰতা ধৰা পৰিছে। হাফলং পাহাৰীয়া অংশ আৰু লামডিং-শিলচৰ কৰিডৰত ভূমিস্খলনৰ প্ৰচণ্ড আশংকা। নাগৰিকসকলক অবিলম্বে নদীৰ কাষৰ আৰু তলৰ বসতিস্থল খালী কৰিবলৈ পৰামৰ্শ দিয়া হৈছে।',
    },
    bn: {
      title: 'রেড অ্যালার্ট: ডিমা হাসাও জেলার জন্য আসন্ন ভূমিধস ও ধ্বংসাবশেষের সতর্কতা',
      message:
        'চরম বৃষ্টিপাত (১৮৪মিমি/২৪ঘণ্টা) এবং ৮৬% মাটির আর্দ্রতা সনাক্ত হয়েছে। হাফলং পাহাড়ি কাটা এবং লামডিং-শিলচর করিডোরে বিধ্বংসী ভূমিধসের উচ্চ ঝুঁকি। নাগরিকদের অবিলম্বে নিচু বসতি খালি করার পরামর্শ দেওয়া হচ্ছে।',
    },
    lus: {
      title: 'RED ALERT: Dima Hasao District tan Leimin Hlauhawm Hriattirna',
      message:
        'Ruahsur nasa (184mm/24h) leh leilung hnawnna 86% hmuh a ni. Haflong tlangpang leh Lumding-Silchar kawngah leimin nasa tak thleng thei a ni. Mipui te chu tlang hnuai hmun him lo chhuahsan nghal tura hriattir in ni.',
    },
    mni: {
      title: 'ꯔꯦꯗ ꯑꯦꯂꯥꯔ꯭ꯇ: ꯗꯤꯃꯥ ꯍꯥꯁꯥꯑꯣ ꯖꯤꯂꯥꯒꯤ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ ꯑꯆꯧꯕ ꯆꯦꯛꯁꯤꯟꯋꯥ',
      message:
        'ꯑꯀꯟꯕ ꯅꯣꯡ (১৮৪mm/২৪ ꯄꯨꯡ) ꯑꯃꯁꯨꯡ ꯂꯩꯃꯥꯏ ꯏꯁꯤꯡ ৮৬% ꯂꯩꯕ ꯎꯔꯦ꯫ ꯍꯥꯐꯂꯣꯡ ꯆꯤꯡꯖꯥꯎ ꯑꯃꯁꯨꯡ ꯂꯨꯃꯗꯤꯡ-ꯁꯤꯜꯆꯔ ꯂꯝꯕꯤꯗ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕꯒꯤ ꯑꯆꯧꯕ ꯑꯀꯤꯕ ꯂꯩꯔꯦ꯫ ꯃꯤꯌꯥꯝ ꯈꯨꯗꯛꯇ ꯁꯥꯐꯕ ꯃꯐꯝꯗ ꯍꯣꯡꯒꯗꯕꯅꯤ꯫',
    },
  },
  'alert-ner-002': {
    en: {
      title: 'RED ALERT: Severe Landslide Threat in North Sikkim (Mangan & Chungthang)',
      message:
        'Teesta river toe erosion coupled with 145mm rainfall and 42° slope destabilization. Heavy rockfall and road breaches expected on NH-10. All non-essential mountain vehicular movement suspended.',
    },
    hi: {
      title: 'रेड अलर्ट: उत्तरी सिक्किम (मंगन और चुंगथांग) में गंभीर भूस्खलन का खतरा',
      message:
        'तीस्ता नदी के कटाव, 145 मिमी बारिश और 42° अस्थिर ढलान के कारण एनएच-10 पर भारी चट्टान गिरने और सड़क टूटने की आशंका। सभी गैर-जरूरी पर्वतीय वाहनों की आवाजाही स्थगित।',
    },
    as: {
      title: 'ৰেড এলাৰ্ট: উত্তৰ ছিকিমত (মাংগন আৰু চুংথাং) প্ৰচণ্ড ভূমিস্খলনৰ ভাবুকি',
      message:
        'তিস্তা নদীৰ খনন, ১৪৫মিমি বৰষুণ আৰু ৪২° পাহাৰীয়া ঢালৰ অস্থিৰতাৰ বাবে এনএইচ-১০ত শিল খহি পৰা আৰু পথ বন্ধ হোৱাৰ আশংকা। সকলো অনাবশ্যকীয় যান-বাহন চলাচল স্থগিত ৰখা হৈছে।',
    },
    bn: {
      title: 'রেড অ্যালার্ট: উত্তর সিকিমে (মাঙ্গান ও চুংথাং) মারাত্মক ভূমিধসের আশঙ্কা',
      message:
        'তিস্তা নদীর ক্ষয়, ১৪৫ মিমি বৃষ্টিপাত এবং ৪২° ঢাল অস্থিতিশীলতার কারণে এনএইচ-১০ এ ভারী শিলাপতন ও সড়ক ভাঙনের সম্ভাবনা। সমস্ত অপ্রয়োজনীয় পাহাড়ি যানবাহন চলাচল স্থগিত।',
    },
    lus: {
      title: 'RED ALERT: North Sikkim (Mangan & Chungthang)-ah Leimin Hlauhawm',
      message:
        'Teesta lui lian leh ruahsur 145mm vangin NH-10 kawngah lungchim leh leimin a thleng thei. Tul bik lo tan tlangkawng zawh khap a ni.',
    },
    mni: {
      title: 'ꯔꯦꯗ ꯑꯦꯂꯥꯔ꯭ꯇ: ꯑꯋꯥꯡ ꯁꯤꯛꯀꯤꯃꯗ (ꯃꯥꯡꯒꯟ ꯑꯃꯁꯨꯡ ꯆꯨꯡꯊꯥꯡ) ꯑꯀꯟꯕ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ ꯆꯦꯛꯁꯤꯟꯋꯥ',
      message:
        'ꯇꯤꯁ꯭ꯇꯥ ꯇꯨꯔꯦꯜ ꯏꯁꯤꯡ ꯂꯥꯟꯕ ꯑꯃꯁꯨꯡ ১৪৫mm ꯅꯣꯡ ꯆꯨꯕꯅ NH-10 ꯂꯝꯕꯤꯗ ꯅꯨꯡ ꯇꯥꯕ ꯑꯃꯁꯨꯡ ꯂꯝꯕꯤ ꯊꯤꯡꯕꯒꯤ ꯑꯀꯤꯕ ꯂꯩꯔꯦ꯫',
    },
  },
  'alert-ner-003': {
    en: {
      title: 'ORANGE ALERT: High Landslide Vulnerability for Sohra & Mawkdok Gorge',
      message:
        '240mm/24h rainfall recorded across Cherrapunji plateau. Saturated sandstone scarp prone to translational block sliding. Tourist trekking and canyon rim activities prohibited.',
    },
    hi: {
      title: 'ऑरेंज अलर्ट: सोहरा और मॉडक गॉर्ज के लिए उच्च भूस्खलन संवेदनशीलता',
      message:
        'चेरापूंजी पठार में 240 मिमी/24 घंटे बारिश दर्ज। बलुआ पत्थर की चट्टानें खिसकने की आशंका। पर्यटकों की ट्रैकिंग और घाटी की गतिविधियों पर प्रतिबंध।',
    },
    as: {
      title: 'অৰেঞ্জ এলাৰ্ট: চোহৰা আৰু মাওকডক গভীৰ উপত্যকাৰ বাবে ভূমিস্খলনৰ সতৰ্কবাণী',
      message:
        'চেৰাপুঞ্জী মালভূমিত ২৪০মিমি/২৪ঘণ্টা বৰষুণ ৰেকৰ্ড। পর্যটকৰ ট্ৰেকিং আৰু উপত্যকাত সকলো গতিবিধি নিষিদ্ধ কৰা হৈছে।',
    },
    bn: {
      title: 'অরেঞ্জ অ্যালার্ট: সোহরা এবং মাওকদক গিরিখাতের জন্য উচ্চ ভূমিধসের ঝুঁকি',
      message:
        'চেরাপুঞ্জি মালভূমিতে ২৪০মিমি/২৪ঘণ্টা বৃষ্টিপাত রেকর্ড। বেলেপাথরের খাড়া ঢালে ধসের প্রবল সম্ভাবনা। পর্যটক ট্র্যাকিং এবং গিরিখাত কার্যক্রম নিষিদ্ধ।',
    },
    lus: {
      title: 'ORANGE ALERT: Sohra & Mawkdok Gorge-a Leimin Fimkhurna',
      message:
        'Cherrapunji bialah ruahsur nasa (240mm/24h) a tla. Lungchim hlauhawm a nih avangin khualzin kalvel leh tlanglawn khap a ni.',
    },
    mni: {
      title: 'ꯑꯣꯔꯦꯟꯖ ꯑꯦꯂꯥꯔ꯭ꯇ: ꯁꯣꯍꯔꯥ ꯑꯃꯁꯨꯡ ꯃꯥꯎꯛꯗꯣꯛꯇ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ ꯆꯦꯛꯁꯤꯟꯋꯥ',
      message:
        'ꯆꯦꯔꯥꯄꯨꯟꯖꯤꯗ २४০mm ꯅꯣꯡ ꯆꯨꯔꯦ꯫ ꯅꯨꯡ ꯇꯥꯕꯒꯤ ꯑꯀꯤꯕ ꯂꯩꯕꯅ ꯇꯨꯔꯤꯁ꯭ꯇ ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯊꯤꯡꯖꯤꯜꯂꯦ꯫',
    },
  },
  'alert-ner-004': {
    en: {
      title: 'ORANGE ALERT: Slope Instability along Tupul Rail Yard Sector',
      message:
        '118mm rain combined with active cut-slope excavation. Heightened risk of mudflows and Ijai river channel constriction. Station staff on alert.',
    },
    hi: {
      title: 'ऑरेंज अलर्ट: तुपुल रेल यार्ड क्षेत्र में ढलान अस्थिरता',
      message:
        '118 मिमी बारिश और ढलान कटाई के कारण कीचड़ के बहाव और इजई नदी का मार्ग अवरुद्ध होने का खतरा। स्टेशन कर्मचारी सतर्क।',
    },
    as: {
      title: 'অৰেঞ্জ এলাৰ্ট: তূপুল ৰে\'ল য়াৰ্ড অঞ্চলত পাহাৰীয়া ঢালৰ অস্থিৰতা',
      message:
        '১১৮মিমি বৰষুণৰ ফলত বোকা আৰু পলস বৈ অহাৰ আশংকা। ষ্টেচন কৰ্মচাৰীসকল সতৰ্ক অৱস্থাত আছে।',
    },
    bn: {
      title: 'অরেঞ্জ অ্যালার্ট: তূপুল রেল ইয়ার্ড সেক্টরে ঢালের অস্থিরতা',
      message:
        '১১৮ মিমি বৃষ্টি এবং মাটি কাটার কারণে কাদা ও ধ্বংসাবশেষ ধসের আশঙ্কা। ইজাই নদীর চ্যানেল আটকে যাওয়ার ঝুঁকি। স্টেশন কর্মীরা সতর্ক রয়েছেন।',
    },
    lus: {
      title: 'ORANGE ALERT: Tupul Rail Yard biala Leimin Fimkhurna',
      message:
        'Ruahsur 118mm avangin leimin leh chirh luang a awm thei. Railway hnathawkte inralring tura hriattir an ni.',
    },
    mni: {
      title: 'ꯑꯣꯔꯦꯟꯖ ꯑꯦꯂꯥꯔ꯭ꯇ: ꯇꯨꯄꯨꯜ ꯔꯦꯜ ꯌꯥꯔ꯭ꯗ ꯂꯝꯕꯤꯗ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ ꯆꯦꯛꯁꯤꯟꯋꯥ',
      message:
        '১১৮mm ꯅꯣꯡ ꯆꯨꯕ ꯑꯃꯁꯨꯡ ꯆꯤꯡ ꯀꯛꯄꯅ ꯃꯔꯝ ꯑꯣꯏꯗꯨꯅ ꯏꯖꯥꯏ ꯇꯨꯔꯦꯜ ꯊꯤꯡꯕꯒꯤ ꯑꯀꯤꯕ ꯂꯩꯔꯦ꯫',
    },
  },
};

export const getLocalizedAlert = (
  alert: DisasterAlert,
  lang: LanguageCode | string
): { title: string; message: string; state: string; locationName: string } => {
  const code = (lang as LanguageCode) || 'en';
  const trans = ALERT_TRANSLATIONS[alert.id]?.[code];
  return {
    title: trans?.title || alert.title,
    message: trans?.message || alert.message,
    state: getLocalizedState(alert.state, code),
    locationName: alert.locationName,
  };
};

// Road Lifelines translations (Requirement 5)
export interface LocalizedRoadContent {
  name: string;
  landmark?: string;
  blockageLandmark?: string;
  clearanceETA?: string;
  alternateName?: string;
  alternateDesc?: string;
  alternateRouteName?: string;
  alternateRouteDescription?: string;
  importance?: string;
  startPoint?: string;
  endPoint?: string;
}

export const ROAD_TRANSLATIONS: Record<string, Record<LanguageCode, LocalizedRoadContent>> = {
  'road-nh-27': {
    en: {
      name: 'Guwahati - Shillong - Haflong - Silchar East-West Lifeline',
      landmark: 'KM 142 near Jatinga-Haflong Ridge Cut',
      clearanceETA: '14 Hours (Excavators on site)',
      alternateName: 'NH-6 via Meghalaya Jowai - Badarpur route',
      alternateDesc:
        'Divert heavy freight via NH-6 Jowai-Ratacherra-Badarpur corridor. Single-lane light vehicles only permitted via Mahur old link road.',
    },
    hi: {
      name: 'गुवाहाटी - शिलांग - हाफलोंग - सिलचर पूर्व-पश्चिम लाइफलाइन',
      landmark: 'किमी 142 जतिंगा-हाफलोंग रिज कट के पास',
      clearanceETA: '14 घंटे (मशीनें मौके पर तैनात)',
      alternateName: 'मेघालय जोवाई - बदरपुर मार्ग से एनएच-6',
      alternateDesc:
        'भारी मालवाहक वाहनों को एनएच-6 जोवाई-रताचेरा-बदरपुर से मोड़ें। केवल एकल-लेन हल्के वाहनों को माहूर पुराने लिंक रोड से अनुमति है।',
    },
    as: {
      name: 'গুৱাহাটী - শ্বিলং - হাফলং - শিলচৰ পূব-পশ্চিম জীৱনৰেখা',
      landmark: 'জাতিঙ্গা-হাফলং পাহাৰীয়া কাটিব লগা স্থানৰ সমীপত ১৪২ কিমি',
      clearanceETA: '১৪ ঘণ্টা (ঘটনাস্থলীত এক্সকেভেতৰ উপস্থিত)',
      alternateName: 'মেঘালয় জোৱাই হৈ এনএইচ-৬ - বদৰপুৰ পথ',
      alternateDesc:
        'গধূৰ সামগ্ৰীবাহী গাড়ী এনএইচ-৬ জোৱাই-ৰাতাচেৰা-বদৰপুৰ হৈ ঘূৰাই দিয়ক। মাহুৰ পুৰণি সংযোগ পথৰে কেৱল একক লেনত পাতল বাহন যাব পাৰিব।',
    },
    bn: {
      name: 'গুয়াহাটি - শিলং - হাফলং - শিলচর পূর্ব-পশ্চিম লাইফলাইন',
      landmark: 'কিমি ১৪২ জাতিঙ্গা-হাফলং পাহাড়ি কাটার নিকটে',
      clearanceETA: '১৪ ঘণ্টা (ঘটনাস্থলে এক্সকাভেটর প্রস্তুত)',
      alternateName: 'মেঘালয় জোয়াই হয়ে এনএইচ-৬ - বদরপুর রুট',
      alternateDesc:
        'ভারী মালবাহী যান এনএইচ-৬ জোয়াই-রাতাকেরা-বদরপুর দিয়ে ঘুরিয়ে দিন। মাহুর পুরোনো লিঙ্ক রোড দিয়ে শুধু এক লেনে হালকা গাড়ি চলতে পারবে।',
    },
    lus: {
      name: 'Guwahati - Shillong - Haflong - Silchar Kawngpui Pawimawh',
      landmark: 'KM 142 Jatinga-Haflong Tlangpang bul',
      clearanceETA: 'Darkar 14 (Khawl lian te an thawk mek)',
      alternateName: 'Meghalaya Jowai - Badarpur kaltlang NH-6',
      alternateDesc:
        'Lirthei rit te chu NH-6 Jowai-Badarpur lamah kualtir a ni. Lirthei te deuh chu Mahur kawng hlui ah an kal thei.',
    },
    mni: {
      name: 'ꯒꯨꯋꯥꯍꯥꯇꯤ - ꯁꯤꯜꯂꯣꯡ - ꯍꯥꯐꯂꯣꯡ - ꯁꯤꯜꯆꯔ ꯅꯣꯡꯄꯣꯛ-ꯅꯣꯡꯆꯨꯞ ꯂꯝꯕꯤ',
      landmark: 'KM 142 ꯖꯥꯇꯤꯡꯒꯥ-ꯍꯥꯐꯂꯣꯡ ꯆꯤꯡꯖꯥꯎ ꯃꯅꯥꯛ',
      clearanceETA: 'ꯄꯨꯡ ১৪ (ꯃꯦꯁꯤꯟ ꯊꯕꯛ ꯇꯧꯔꯤ)',
      alternateName: 'ꯃꯦꯘꯥꯂꯌ ꯖꯣꯋꯥꯏ - ꯕꯗꯔꯄꯨꯔ NH-6 ꯂꯝꯕꯤ',
      alternateDesc:
        'ꯑꯔꯨꯝꯕ ꯂꯣꯔꯤꯁꯤꯡ NH-6 ꯂꯝꯕꯤꯗ ꯍꯣꯡꯗꯣꯛꯎ꯫ ꯌꯥꯝꯅ ꯂꯨꯗꯕ ꯒꯥꯔꯤꯁꯤꯡ ꯃꯥꯍꯨꯔ ꯂꯝꯕꯤꯗ ꯆꯠꯄ ꯌꯥꯒꯅꯤ꯫',
    },
  },
  'road-nh-10': {
    en: {
      name: 'Siliguri - Sevoke - Rangpo - Gangtok Mountain Lifeline',
      landmark: 'Rangpo - Singtam stretch (29th Mile)',
      clearanceETA: '6 Hours (Single-lane traffic operating)',
      alternateName: 'Lava - Algarah - Reshi - Rhenock Bypass',
      alternateDesc:
        'Light vehicles diverted via Gorubathan-Lava-Rongli route. Heavy trucks prohibited during active rainfall spells.',
    },
    hi: {
      name: 'सिलीगुड़ी - सेवोक - रंगपो - गंगटोक पर्वतीय लाइफलाइन',
      landmark: 'रंगपो - सिंगताम खंड (29वां मील)',
      clearanceETA: '6 घंटे (एकल-लेन यातायात चालू)',
      alternateName: 'लावा - अल्गराह - रेशी - रेनोक बाईपास',
      alternateDesc:
        'हल्के वाहनों को गोरुबथान-लावा-रोंगली मार्ग से मोड़ा गया। बारिश के दौरान भारी ट्रकों पर प्रतिबंध।',
    },
    as: {
      name: 'শিলিগুৰি - ছেভোক - ৰাংপো - গেংটক পাহাৰীয়া জীৱনৰেখা',
      landmark: 'ৰাংপো - ছিংতাম অংশ (২৯ মাইল)',
      clearanceETA: '৬ ঘণ্টা (একক লেন চলাচল আৰম্ভ)',
      alternateName: 'লাভা - আলগাৰাহ - ৰেছি - ৰেনক বাইপাছ',
      alternateDesc:
        'পাতল বাহনসমূহ গৰুবাথান-লাভা-ৰংলি পথেৰে ডাইভাৰ্ট কৰা হৈছে। বৰষুণৰ সময়ত গধূৰ ট্ৰাক নিষিদ্ধ।',
    },
    bn: {
      name: 'শিলিগুড়ি - সেভোক - রংপো - গ্যাংটক পাহাড়ি লাইফলাইন',
      landmark: 'রংপো - সিংতম অংশ (২৯তম মাইল)',
      clearanceETA: '৬ ঘণ্টা (এক লেনে যান চলাচল চলছে)',
      alternateName: 'লাভা - আলগারা - রেশি - রেনক বাইপাস',
      alternateDesc:
        'হালকা যান গোরুবাথান-লাভা-রংলি রুট দিয়ে ঘোরানো হয়েছে। বৃষ্টির সময় ভারী ট্রাক নিষিদ্ধ।',
    },
    lus: {
      name: 'Siliguri - Sevoke - Rangpo - Gangtok Tlangkawng',
      landmark: 'Rangpo - Singtam inkar (29th Mile)',
      clearanceETA: 'Darkar 6 (Kawng sir khat ah kal theih)',
      alternateName: 'Lava - Algarah - Reshi - Rhenock Kualna',
      alternateDesc:
        'Lirthei te chu Gorubathan-Lava-Rongli kawngah kualtir an ni. Truck lian te chu ruahsur laiin khap an ni.',
    },
    mni: {
      name: 'ꯁꯤꯂꯤꯒꯨꯔꯤ - ꯁꯦꯚꯣꯛ - ꯔꯥꯡꯄꯣ - ꯒꯦꯡꯇꯣꯛ ꯆꯤꯡꯒꯤ ꯂꯝꯕꯤ',
      landmark: 'ꯔꯥꯡꯄꯣ - ꯁꯤꯡꯇꯥꯝ (29 ꯃꯥꯏꯜ)',
      clearanceETA: 'ꯄꯨꯡ ꯶ (ꯂꯝꯕꯤ ꯅꯥꯀꯟ ꯑꯃ ꯍꯥꯡꯂꯦ)',
      alternateName: 'ꯂꯥꯚꯥ - ꯑꯜꯒꯥꯔꯥ - ꯔꯦꯅꯣꯛ ꯕꯥꯏꯄꯥꯁ',
      alternateDesc:
        'ꯒꯥꯔꯤ ꯑꯄꯤꯛꯄꯁꯤꯡ ꯂꯥꯚꯥ ꯂꯝꯕꯤꯗ ꯍꯣꯡꯗꯣꯛꯎ꯫ ꯅꯣꯡ ꯆꯨꯔꯤꯉꯩꯗ ꯇ꯭ꯔꯛ ꯑꯆꯧꯕ ꯊꯤꯡꯖꯤꯜꯂꯦ꯫',
    },
  },
  'road-nh-29': {
    en: {
      name: 'Dimapur - Kohima - Maram - Imphal Strategic Lifeline',
      landmark: 'Phesama Sinking Zone KM 38',
      clearanceETA: 'Open with escorted convoy speed limit 20 km/h',
      alternateName: 'Jotsoma - Khonoma bypass arterial',
      alternateDesc:
        'Emergency vehicles priority. Civilians advised to avoid night transit between 19:00 and 05:00.',
    },
    hi: {
      name: 'दीमापुर - कोहिमा - मारम - इंफाल रणनीतिक लाइफलाइन',
      landmark: 'फेसामा धंसान क्षेत्र किमी 38',
      clearanceETA: 'सुरक्षा काफिले के साथ खुला, गति सीमा 20 किमी/घंटा',
      alternateName: 'जोत्सोमा - खोनोमा बाईपास मार्ग',
      alternateDesc:
        'आपातकालीन वाहनों को प्राथमिकता। नागरिकों को 19:00 से 05:00 बजे के बीच रात के सफर से बचने की सलाह।',
    },
    as: {
      name: 'ডিমাপুৰ - কহিমা - মাৰাম - ইম্ফল কৌশলগত জীৱনৰেখা',
      landmark: 'ফেচামা ভূ-নিমজ্জন মণ্ডল ৩৮ কিমি',
      clearanceETA: 'কনভয় সুৰক্ষাসহ মুকলি, গতিসীমা ২০ কিমি/ঘণ্টা',
      alternateName: 'জোতচোমা - খোনোমা বাইপাছ পথ',
      alternateDesc:
        'জৰুৰীকালীন বাহনক অগ্ৰাধিকাৰ। সন্ধিয়া ১৯:০০ বজাৰ পৰা পুৱা ০৫:০০ বজালৈ নিশাযাত্ৰা নকৰিবলৈ পৰামৰ্শ।',
    },
    bn: {
      name: 'ডিমাপুর - কোহিমা - মারাম - ইম্ফল কৌশলগত লাইফলাইন',
      landmark: 'ফেসামা ভূমিধ্বস এলাকা কিমি ৩৮',
      clearanceETA: 'কনভয় পাহারায় খোলা, গতিসীমা ২০ কিমি/ঘণ্টা',
      alternateName: 'জোৎসোমা - খোনোমা বাইপাস সড়ক',
      alternateDesc:
        'জরুরি যানবাহনের অগ্রাধিকার। নাগরিকদের ১৯:০০ থেকে ০৫:০০ পর্যন্ত রাতের ভ্রমণ এড়াতে পরামর্শ।',
    },
    lus: {
      name: 'Dimapur - Kohima - Maram - Imphal Kawngpui',
      landmark: 'Phesama Leimin Hmun KM 38',
      clearanceETA: 'Tlang e, motor chak zawng 20 km/h aia chakin tlan loh tur',
      alternateName: 'Jotsoma - Khonoma Kualna Kawng',
      alternateDesc:
        'Emergency motor te dah pawimawh hmasak tur. Zan dar 7 atanga zing dar 5 inkar tlan loh tur.',
    },
    mni: {
      name: 'ꯗꯤꯃꯥꯄꯨꯔ - ꯀꯣꯍꯤꯃꯥ - ꯃꯥꯔꯥꯝ - ꯏꯝꯐꯥꯜ ꯃꯔꯨꯑꯣꯏꯕ ꯂꯝꯕꯤ',
      landmark: 'ꯐꯦꯁꯥꯃꯥ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ KM 38',
      clearanceETA: 'ꯍꯥꯡꯂꯦ, ꯒꯥꯔꯤ ꯌꯥꯡꯅ ꯊꯧꯒꯅꯨ (20 km/h)',
      alternateName: 'ꯖꯣꯠꯁꯣꯃꯥ - ꯈꯣꯅꯣꯃꯥ ꯕꯥꯏꯄꯥꯁ',
      alternateDesc:
        'ꯑꯃꯔꯖꯦꯟꯁꯤ ꯒꯥꯔꯤꯁꯤꯡ ꯍꯥꯟꯅ ꯊꯥꯗꯣꯛꯎ꯫ ꯑꯍꯤꯡꯗ ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯇꯧꯒꯅꯨ꯫',
    },
  },
  'road-nh-13': {
    en: {
      name: 'Trans-Arunachal Highway (Bomdila - Tawang Sector)',
      landmark: 'Munna Camp Hairpin Bend 4',
      clearanceETA: 'Cleared (Rockfall hazard remaining active)',
      alternateName: 'Orang - Kalaktang - Rupa - Dirang axis',
      alternateDesc:
        'OKSR Defense Road fully operational and recommended as principal supply route during monsoon.',
    },
    hi: {
      name: 'ट्रांस-अरुणाचल हाईवे (बोमडिला - तवांग सेक्टर)',
      landmark: 'मुन्ना कैंप हेयरपिन मोड़ 4',
      clearanceETA: 'साफ किया गया (पत्थर गिरने का खतरा बना हुआ है)',
      alternateName: 'ओरंग - कलाकतांग - रूपा - दिरांग अक्ष',
      alternateDesc:
        'ओकेएसआर रक्षा मार्ग पूरी तरह से चालू है और मानसून के दौरान प्रमुख आपूर्ति मार्ग के रूप में अनुशंसित है।',
    },
    as: {
      name: 'ট্ৰান্স-অৰুণাচল ঘাইপথ (বমডিলা - তাৱাং খণ্ড)',
      landmark: 'মুন্না কেম্প হেয়াৰপিন বেণ্ড ৪',
      clearanceETA: 'পৰিষ্কাৰ কৰা হ’ল (শিল খহি পৰাৰ আশংকা অব্যাহত)',
      alternateName: 'ওৰাং - কালাকটাং - ৰূপা - দিৰাং পথ',
      alternateDesc:
        'অ’কেএছআৰ প্ৰতিৰক্ষা পথ সম্পূৰ্ণৰূপে সক্ৰিয় আৰু বাৰিষাৰ সময়ত মূল যোগান পথ হিচাপে অনুমোদিত।',
    },
    bn: {
      name: 'ট্রান্স-অরুণাচল হাইওয়ে (বোমডিলা - তাওয়াং সেক্টর)',
      landmark: 'মুন্না ক্যাম্প হেয়ারপিন বাঁক ৪',
      clearanceETA: 'পরিষ্কার করা হয়েছে (পাথর পড়ার ঝুঁকি অব্যাহত)',
      alternateName: 'ওরাং - কালাকটাং - রূপা - দিরাং অক্ষ',
      alternateDesc:
        'ওকেএসআর প্রতিরক্ষা সড়ক সম্পূর্ণ সচল এবং বর্ষাকালে প্রধান সরবরাহ পথ হিসেবে ব্যবহারের পরামর্শ।',
    },
    lus: {
      name: 'Trans-Arunachal Highway (Bomdila - Tawang Bial)',
      landmark: 'Munna Camp Kual 4-na',
      clearanceETA: 'Thianfai tawh (Lungchim theihna a la awm reng)',
      alternateName: 'Orang - Kalaktang - Rupa - Dirang Kawng',
      alternateDesc:
        'OKSR Defense Road chu a tlang tha a, fur chhungin hman ber tura tih a ni.',
    },
    mni: {
      name: 'ꯇ꯭ꯔꯥꯟꯁ-ꯑꯔꯨꯅꯥꯆꯜ ꯍꯥꯏꯋꯦ (ꯕꯣꯃꯗꯤꯂꯥ - ꯇꯋꯥꯡ)',
      landmark: 'ꯃꯨꯟꯅꯥ ꯀꯦꯝꯞ ꯂꯝꯕꯤ ꯃꯈꯣꯟ 4',
      clearanceETA: 'ꯁꯦꯡꯗꯣꯛꯈ꯭ꯔꯦ (ꯅꯨꯡ ꯇꯥꯕꯒꯤ ꯑꯀꯤꯕ ꯂꯩꯔꯤ)',
      alternateName: 'ꯑꯣꯔꯥꯡ - ꯀꯂꯛꯇꯥꯡ - ꯔꯨꯄꯥ ꯂꯝꯕꯤ',
      alternateDesc:
        'OKSR ꯗꯤꯐꯦꯟꯁ ꯂꯝꯕꯤ ꯍꯥꯡꯂꯦ ꯑꯃꯁꯨꯡ ꯅꯣꯡꯖꯨ ꯃꯇꯝꯗ ꯁꯤꯖꯤꯟꯅꯕ ꯌꯥꯏ꯫',
    },
  },
  'road-nh-306': {
    en: {
      name: 'Silchar - Vairengte - Kolasib - Aizawl Corridor',
      landmark: 'Hunthar Veng Sinking Area',
      clearanceETA: 'Open / Clear (24/7 Patrols Active)',
      alternateName: 'Bairabi - Mamit route',
      alternateDesc:
        'Route is open with continuous highway maintenance patrols near Hunthar.',
    },
    hi: {
      name: 'सिलचर - वैरेंगते - कोलासिब - आइजोल कॉरिडोर',
      landmark: 'हुनथर वेंग धंसाव क्षेत्र',
      clearanceETA: 'खुला / सुरक्षित (24/7 गश्त जारी)',
      alternateName: 'बैराबी - मामित मार्ग',
      alternateDesc:
        'हुनथर के पास निरंतर राजमार्ग रखरखाव गश्त के साथ मार्ग खुला है।',
    },
    as: {
      name: 'শিলচৰ - ভাইৰেংতে - কোলাছিব - আইজল কৰিডৰ',
      landmark: 'হুনথাৰ ভেং নিমজ্জন এলেকা',
      clearanceETA: 'মুকলি / সুৰক্ষিত (২৪/৭ নিৰীক্ষণ সক্ৰিয়)',
      alternateName: 'বৈৰাবী - মামিত পথ',
      alternateDesc:
        'হুনথাৰ সমীপত নিয়মীয়া ৰাজপথ মেৰামতি আৰু নিৰীক্ষণৰ সৈতে পথ মুকলি আছে।',
    },
    bn: {
      name: 'শিলচর - ভাইরেংতে - কোলাসিব - আইজল করিডোর',
      landmark: 'হুনথার ভেং দেবে যাওয়া এলাকা',
      clearanceETA: 'খোলা / নিরাপদ (২৪/৭ নজরদারি চালু)',
      alternateName: 'বৈরাবি - মামিত রুট',
      alternateDesc:
        'হুনথারের কাছে অবিরাম মহাসড়ক রক্ষণাবেক্ষণ এবং টহলের সাথে পথ খোলা রয়েছে।',
    },
    lus: {
      name: 'Silchar - Vairengte - Kolasib - Aizawl Kawngpui',
      landmark: 'Hunthar Veng Leimin Hmun',
      clearanceETA: 'Kawng a tlang tha (Patrol an kal reng)',
      alternateName: 'Bairabi - Mamit Kawng',
      alternateDesc:
        'Hunthar bul velah enkawltu an awm reng a, kawng a tlang tha e.',
    },
    mni: {
      name: 'ꯁꯤꯜꯆꯔ - ꯚꯥꯏꯔꯦꯡꯇꯦ - ꯀꯣꯂꯥꯁꯤꯕ - ꯑꯥꯏꯖꯣꯜ ꯂꯝꯕꯤ',
      landmark: 'ꯍꯨꯟꯊꯥꯔ ꯚꯦꯡ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ',
      clearanceETA: 'ꯍꯥꯡꯗꯨꯅ ꯂꯩꯔꯤ (২৪/৭ ꯌꯦꯡꯁꯤꯜꯂꯤ)',
      alternateName: 'ꯕꯥꯏꯔꯥꯕꯤ - ꯃꯥꯃꯤꯠ ꯂꯝꯕꯤ',
      alternateDesc:
        'ꯍꯨꯟꯊꯥꯔ ꯃꯅꯥꯛꯇ ꯂꯝꯕꯤ ꯌꯦꯡꯁꯤꯟꯗꯨꯅ ꯂꯝꯕꯤ ꯍꯥꯡꯗꯨꯅ ꯂꯩꯔꯤ꯫',
    },
  },
};

export const getLocalizedRoad = (
  road: RoadStatus,
  lang: LanguageCode | string
): {
  name: string;
  importance: string;
  startPoint: string;
  endPoint: string;
  landmark: string;
  blockageLandmark: string;
  clearanceETA: string;
  alternateName: string;
  alternateDesc: string;
  alternateRouteName: string;
  alternateRouteDescription: string;
  state: string;
  statusBadge: string;
} => {
  const code = (lang as LanguageCode) || 'en';
  const trans = ROAD_TRANSLATIONS[road.id]?.[code];

  let statusBadge = road.status.replace(/_/g, ' ');
  if (code !== 'en') {
    switch (road.status) {
      case 'FULLY_BLOCKED':
        statusBadge =
          lang === 'hi'
            ? 'पूरी तरह अवरुद्ध'
            : lang === 'as'
            ? 'সম্পূৰ্ণ বন্ধ'
            : lang === 'bn'
            ? 'সম্পূর্ণ অবরুদ্ধ'
            : lang === 'lus'
            ? 'PING THAP'
            : 'ꯃꯄꯨꯡ ꯐꯥꯅ ꯊꯤꯡꯖꯤꯜꯂꯕ';
        break;
      case 'PARTIALLY_BLOCKED':
        statusBadge =
          lang === 'hi'
            ? 'आंशिक अवरुद्ध'
            : lang === 'as'
            ? 'আংশিক বন্ধ'
            : lang === 'bn'
            ? 'আংশিক অবরুদ্ধ'
            : lang === 'lus'
            ? 'PING THAWNTLING LO'
            : 'ꯈꯔ ꯊꯤꯡꯕ';
        break;
      case 'HIGH_RISK_WARNING':
        statusBadge =
          lang === 'hi'
            ? 'उच्च जोखिम चेतावनी'
            : lang === 'as'
            ? 'উচ্চ বিপদ সতৰ্কবাণী'
            : lang === 'bn'
            ? 'উচ্চ ঝুঁকি সতর্কতা'
            : lang === 'lus'
            ? 'FIMKHUR HLAUHAWM'
            : 'ꯑꯀꯟꯕ ꯆꯦꯛꯁꯤꯟꯋꯥ';
        break;
      case 'OPEN':
      default:
        statusBadge =
          lang === 'hi'
            ? 'खुला / सुरक्षित'
            : lang === 'as'
            ? 'মুকলি / সুৰক্ষিত'
            : lang === 'bn'
            ? 'খোলা / নিরাপদ'
            : lang === 'lus'
            ? 'TLANG / HIM'
            : 'ꯍꯥꯡꯕ / ꯁꯥꯐꯕ';
        break;
    }
  }

  const landmarkVal = trans?.blockageLandmark || trans?.landmark || road.blockageLocation?.landmark || '';
  const altNameVal = trans?.alternateRouteName || trans?.alternateName || road.alternateRouteName || '';
  const altDescVal = trans?.alternateRouteDescription || trans?.alternateDesc || road.alternateRouteDescription || '';

  return {
    name: trans?.name || road.name,
    importance: trans?.importance || road.importance || '',
    startPoint: trans?.startPoint || road.startPoint || '',
    endPoint: trans?.endPoint || road.endPoint || '',
    landmark: landmarkVal,
    blockageLandmark: landmarkVal,
    clearanceETA: trans?.clearanceETA || road.clearanceETA || '',
    alternateName: altNameVal,
    alternateDesc: altDescVal,
    alternateRouteName: altNameVal,
    alternateRouteDescription: altDescVal,
    state: getLocalizedState(road.state, code),
    statusBadge,
  };
};

// Incident Reports translations (Requirement 2)
export const INCIDENT_TRANSLATIONS: Record<
  string,
  Record<LanguageCode, { title: string; description: string; hazardType: string }>
> = {
  'inc-01': {
    en: {
      title: 'Major Rockfall & Mudslide blocking NH-27 near Jatinga',
      description:
        'Debris of approximately 1,800 cubic meters slipped from the upper hill cut over 60 meters of double-lane carriageway. Three freight trucks stranded safely.',
      hazardType: 'Landslide',
    },
    hi: {
      title: 'जातिंगा के पास एनएच-27 को अवरुद्ध करने वाला बड़ा भूस्खलन और मलबे का बहाव',
      description:
        'ऊपरी पहाड़ी कट से लगभग 1,800 घन मीटर मलबा 60 मीटर दोहरे लेन मार्ग पर आ गिरा। तीन मालवाहक ट्रक सुरक्षित रूप से फंसे हुए हैं।',
      hazardType: 'भूस्खलन',
    },
    as: {
      title: 'জাতিঙ্গাৰ সমীপত এনএইচ-২৭ অৱৰোধ কৰি বৃহৎ শিল আৰু বোকা খহি পৰা',
      description:
        'পাহাৰৰ ওপৰৰ অংশৰ পৰা প্ৰায় ১,৮০০ ঘনমিটাৰ ধ্বংসাৱশেষ ৬০ মিটাৰ পথত খহি পৰে। তিনিখন মালবাহী ট্ৰাক নিৰাপদে আৱদ্ধ হৈ আছে।',
      hazardType: 'ভূমিস্খলন',
    },
    bn: {
      title: 'জাতিঙ্গার কাছে এনএইচ-২৭ অবরোধ করে ব্যাপক শিলাপতন ও কাদাধস',
      description:
        'পাহাড়ের উপরিভাগ থেকে প্রায় ১,৮০০ ঘনমিটার ধ্বংসাবশেষ ৬০ মিটার সড়কে আছড়ে পড়ে। তিনটি মালবাহী ট্রাক নিরাপদে আটকে আছে।',
      hazardType: 'ভূমিধস',
    },
    lus: {
      title: 'Jatinga bulah NH-27 kawng tibuaiin Lungchim leh Leimin nasa tak',
      description:
        'Tlangpang chunglam atangin leilung 1,800 cubic meters lai kawngpuiah a rawn chim a. Truck pathum him takin an tang mek.',
      hazardType: 'Leimin',
    },
    mni: {
      title: 'ꯖꯥꯇꯤꯡꯒꯥ ꯃꯅꯥꯛꯇ NH-27 ꯊꯤꯡꯗꯨꯅ ꯑꯆꯧꯕ ꯅꯨꯡ ꯑꯃꯁꯨꯡ ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ',
      description:
        'ꯆꯤꯡꯖꯥꯎ ꯃꯊꯛꯇꯒꯤ ꯂꯩꯃꯥꯏ ꯑꯃꯁꯨꯡ ꯅꯨꯡ ꯂꯝꯕꯤꯗ ꯆꯨꯝꯊꯥꯔꯛꯈ꯭ꯔꯦ꯫ ꯂꯣꯔꯤ ꯳ ꯁꯥꯐꯅ ꯂꯩꯔꯤ꯫',
      hazardType: 'ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ',
    },
  },
  'inc-02': {
    en: {
      title: 'Severe Slope Crack on Mangan-Singhik Access Road',
      description:
        'Continuous longitudinal tension crack of 45m length and 12cm aperture observed after heavy night downpour. Road foundation shifting towards Teesta gorge.',
      hazardType: 'Slope Crack',
    },
    hi: {
      title: 'मंगन-सिंघिक संपर्क मार्ग पर ढलान में भारी दरार',
      description:
        'भारी रात की बारिश के बाद 45 मीटर लंबी और 12 सेमी चौड़ी दरार देखी गई। सड़क की नींव तीस्ता घाटी की ओर खिसक रही है।',
      hazardType: 'ढलान दरार',
    },
    as: {
      title: 'মাংগন-ছিংঘিক সংযোগী পথত পাহাৰীয়া ঢালত ডাঙৰ ফাঁট',
      description:
        'নিশাৰ ধাৰাষাৰ বৰষুণৰ পিছত ৪৫ মিটাৰ দৈৰ্ঘ্যৰ আৰু ১২ ছেমি গভীৰ ফাঁট দেখা গৈছে। পথৰ ভেটি তিস্তা নদীৰ দিশে ঢাল খাইছে।',
      hazardType: 'পাহাৰত ফাঁট',
    },
    bn: {
      title: 'মাঙ্গান-সিংঘিক সংযোগ সড়কে পাহাড়ের ঢালে ভয়াবহ ফাটল',
      description:
        'রাতের ভারী বৃষ্টির পর ৪৫ মিটার দীর্ঘ এবং ১২ সেমি চওড়া ফাটল দেখা গেছে। সড়কের ভিত্তি তিস্তা খাদের দিকে সরে যাচ্ছে।',
      hazardType: 'ঢালে ফাটল',
    },
    lus: {
      title: 'Mangan-Singhik Kawngah Tlangpang Khi Nasa Tak',
      description:
        'Zan ruahsur hnuah metre 45 vela thui leh 12cm vela zau lei khi hmuh a ni. Kawng chu Teesta ruam lamah a tawlh mek.',
      hazardType: 'Lei Khi',
    },
    mni: {
      title: 'ꯃꯥꯡꯒꯟ-ꯁꯤꯡꯍꯤꯛ ꯂꯝꯕꯤꯗ ꯆꯤꯡꯖꯥꯎ ꯇꯦꯛꯈꯤꯕ',
      description:
        'ꯑꯍꯤꯡꯗ ꯅꯣꯡ ꯆꯨꯔꯕ ꯃꯇꯨꯡꯗ ꯃꯤꯇꯔ ꯴꯵ ꯂꯝꯕꯤ ꯇꯦꯛꯈꯤꯕ ꯎꯔꯦ꯫ ꯂꯝꯕꯤ ꯇꯤꯁ꯭ꯇꯥ ꯃꯥꯏꯀꯩꯗ ꯆꯨꯝꯊꯥꯔꯛꯄꯒꯤ ꯑꯀꯤꯕ ꯂꯩꯔꯤ꯫',
      hazardType: 'ꯆꯤꯡ ꯇꯦꯛꯄ',
    },
  },
  'inc-03': {
    en: {
      title: 'Culvert Blockage and Muddy Slurry Runoff at Phesama',
      description:
        'Muddy debris clogged drainage culvert causing water logging and softening road shoulder. Traffic slowed to crawl.',
      hazardType: 'Road Blockage',
    },
    hi: {
      title: 'फेसामा में पुलिया अवरुद्ध और कीचड़युक्त पानी का बहाव',
      description:
        'कीचड़ और मलबे से पुलिया बंद हो गई है जिससे जलभराव हो गया है और सड़क का किनारा धंस रहा है। यातायात अत्यंत धीमा हो गया है।',
      hazardType: 'सड़क अवरोध',
    },
    as: {
      title: 'ফেচামাত কালভাৰ্ট বন্ধ আৰু বোকা পানীৰ সোঁত',
      description:
        'বোকামাটিয়ে নলা বন্ধ কৰি দিয়াত পানী জমা হৈছে আৰু পথৰ কাষ কোমল হৈ পৰিছে। যান-বাহন চলাচল অতি মন্থৰ হৈ পৰিছে।',
      hazardType: 'পথ অৱৰোধ',
    },
    bn: {
      title: 'ফেসামায় কালভার্ট বন্ধ ও কাদার ঢল',
      description:
        'কাদা ও আবর্জনায় ড্রেনেজ কালভার্ট আটকে জল জমে সড়ক নরম হয়ে পড়েছে। যান চলাচল অত্যন্ত ধীরগতিতে চলছে।',
      hazardType: 'সড়ক অবরোধ',
    },
    lus: {
      title: 'Phesama-ah Tuisikna Pingin Chirh A Luang Chhuak',
      description:
        'Leivung leh chirhin tuiluanna a ti ping a, kawng a tihnawng nasa. Motor kalvel a ti khaihlak.',
      hazardType: 'Kawng Ping',
    },
    mni: {
      title: 'ꯐꯦꯁꯥꯃꯥꯗ ꯏꯁꯤꯡ ꯂꯝꯕꯤ ꯊꯤꯡꯖꯤꯜꯂꯒ ꯂꯩ-ꯏꯁꯤꯡ ꯆꯦꯟꯕ',
      description:
        'ꯏꯁꯤꯡ ꯇꯨꯔꯦꯜ ꯊꯤꯡꯖꯤꯜꯂꯒ ꯂꯝꯕꯤꯗ ꯏꯁꯤꯡ ꯏꯁꯤꯡ ꯊꯨꯝꯖꯤꯜꯂꯦ꯫ ꯒꯥꯔꯤ ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯌꯥꯝꯅ ꯇꯞꯊꯔꯦ꯫',
      hazardType: 'ꯂꯝꯕꯤ ꯊꯤꯡꯕ',
    },
  },
  'inc-04': {
    en: {
      title: 'Earth & Boulder Slide Overhanging Arterial Link near Cherrapunji',
      description:
        'Sudden collapse of sandstone ridge after 210mm torrential cloudburst. Boulders measuring over 1.5m diameter obstructing uphill link road to tourist settlements.',
      hazardType: 'Landslide',
    },
    hi: {
      title: 'चेरापूंजी के पास मुख्य संपर्क मार्ग पर पत्थर और मिट्टी का भूस्खलन',
      description:
        '210 मिमी मूसलाधार बारिश के बाद बलुआ पत्थर की चट्टान अचानक ढह गई। 1.5 मीटर से अधिक व्यास के पत्थर मुख्य मार्ग को अवरुद्ध कर रहे हैं।',
      hazardType: 'भूस्खलन',
    },
    as: {
      title: 'চেৰাপুঞ্জীৰ সমীপত ডাঙৰ শিল আৰু মাটি খহি পথ অৱৰোধ',
      description:
        '২১০মিমি ধাৰাষাৰ বৰষুণৰ পিছত পাহাৰৰ এটা অংশ হঠাৎ খহি পৰে। ১.৫ মিটাৰতকৈ ডাঙৰ শিলাখণ্ডই পাহাৰীয়া সংযোগী পথ বন্ধ কৰি পেলাইছে।',
      hazardType: 'ভূমিস্খলন',
    },
    bn: {
      title: 'চেরাপুঞ্জির নিকটে পাথর ও মাটির ধসে প্রধান সড়ক অবরুদ্ধ',
      description:
        '২১০ মিমি মুষলধারে বৃষ্টির পর বেলেপাথরের শৈলশিরা হঠাৎ ধসে পড়ে। দেড় মিটারের বেশি ব্যাসের পাথর খণ্ড পর্যটন সড়কে বাধা সৃষ্টি করেছে।',
      hazardType: 'ভূমিধস',
    },
    lus: {
      title: 'Cherrapunji bulah Lung lian leh Leimin kawngpui chim',
      description:
        'Ruahsur nasa (210mm) hnuah lung lian pui pui kawngah a rawn lum thla a, khualzin kawng a tibuai.',
      hazardType: 'Leimin',
    },
    mni: {
      title: 'ꯆꯦꯔꯥꯄꯨꯟꯖꯤ ꯃꯅꯥꯛꯇ ꯑꯆꯧꯕ ꯅꯨꯡ ꯆꯨꯝꯊꯥꯔꯛꯄ',
      description:
        '২১০mm ꯅꯣꯡ ꯆꯨꯔꯕ ꯃꯇꯨꯡꯗ ꯆꯤꯡ ꯇꯦꯛꯇꯨꯅ ꯑꯆꯧꯕ ꯅꯨꯡꯁꯤꯡ ꯂꯝꯕꯤꯗ ꯇꯥꯔꯛꯈ꯭ꯔꯦ꯫',
      hazardType: 'ꯂꯩꯃꯥꯏ ꯆꯨꯝꯊꯥꯕ',
    },
  },
  'inc-05': {
    en: {
      title: 'Deep Tension Fracture and Slump on NH-10 Teesta Corridor',
      description:
        'Geotechnical field survey identified 80m continuous lateral fissure with progressive 15cm vertical drop along highway embankment facing the Teesta river gorge.',
      hazardType: 'Slope Crack',
    },
    hi: {
      title: 'एनएच-10 तीस्ता कॉरिडोर पर गहरी दरार और धंसाव',
      description:
        'भू-तकनीकी सर्वेक्षण में तीस्ता नदी घाटी की ओर 80 मीटर लंबी दरार और 15 सेमी ऊर्ध्वाधर धंसाव देखा गया।',
      hazardType: 'ढलान दरार',
    },
    as: {
      title: 'এনএইচ-১০ তিস্তা কৰিডৰত গভীৰ ফাট আৰু স্খলন',
      description:
        'ভূতাত্ত্বিক জৰীপত তিস্তা নদীৰ দিশত ৮০ মিটাৰ দীঘল ফাট আৰু ১৫ ছেমি তললৈ বহি যোৱা দেখা গৈছে।',
      hazardType: 'পাহাৰত ফাঁট',
    },
    bn: {
      title: 'এনএইচ-১০ তিস্তা করিডোরে গভীর ফাটল ও মাটির অবনমন',
      description:
        'ভূতাত্ত্বিক সমীক্ষায় তিস্তা নদীর গিরিখাতের দিকে ৮০ মিটার দীর্ঘ ফাটল এবং ১৫ সেমি উল্লম্ব ধ্বস শনাক্ত হয়েছে।',
      hazardType: 'ঢালে ফাটল',
    },
    lus: {
      title: 'NH-10 Teesta Kawngah Lei Khi Thuk Tak',
      description:
        'Teesta ruam lamah metre 80 vela thui lei khi leh 15cm vela hniam tawlh hmuh a ni.',
      hazardType: 'Lei Khi',
    },
    mni: {
      title: 'NH-10 ꯇꯤꯁ꯭ꯇꯥ ꯂꯝꯕꯤꯗ ꯑꯆꯧꯕ ꯇꯦꯛꯈꯤꯕ',
      description:
        'ꯇꯤꯁ꯭ꯇꯥ ꯇꯨꯔꯦꯜ ꯃꯥꯏꯀꯩꯗ ꯃꯤꯇꯔ ৮০ ꯂꯝꯕꯤ ꯇꯦꯛꯇꯨꯅ ꯁꯦꯟꯇꯤꯃꯤꯇꯔ ১৫ ꯆꯨꯝꯊꯥꯔꯛꯈ꯭ꯔꯦ꯫',
      hazardType: 'ꯆꯤꯡ ꯇꯦꯛꯄ',
    },
  },
};

export const getLocalizedIncident = (
  incident: IncidentReport,
  lang: LanguageCode | string
): { title: string; description: string; hazardType: string; state: string } => {
  const code = (lang as LanguageCode) || 'en';
  const trans = INCIDENT_TRANSLATIONS[incident.id]?.[code];
  return {
    title: trans?.title || incident.title,
    description: trans?.description || incident.description,
    hazardType: trans?.hazardType || incident.hazardType,
    state: getLocalizedState(incident.state, code),
  };
};

