import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import TransJA from "./i18n/ja.json";
import TransKO from "./i18n/ko.json";
import TransEN from "./i18n/en.json";
import { fetchAPI } from "./util/api";

// 초기 리소스 (로컬 fallback)
const resource = {
  en: {
    translation: TransEN,
  },
  ko: {
    translation: TransKO,
  },
  ja: {
    translation: TransJA,
  },
};

// 백엔드에서 번역 데이터를 미리 로드하는 함수 (병렬 처리)
const loadTranslationsFromAPI = async () => {
  const languages = ["en", "ko", "ja"];

  // 모든 언어를 병렬로 로드
  const promises = languages.map(async (lang) => {
    try {
      const data = await fetchAPI(`translation/${lang}`);
      if (data) {
        const translations = (data as APIResponse<Map<string, string>>).data;

        // 기존 리소스와 병합
        if (!i18n.hasResourceBundle(lang, 'translation')) {
          i18n.addResourceBundle(lang, 'translation', translations, true, true);
        } else {
          i18n.addResources(lang, 'translation', translations);
        }

        console.log(`✅ Loaded ${Object.keys(translations).length} translations for ${lang}`);
      }
    } catch (error) {
      console.warn(`❌ Failed to load translations for ${lang}:`, error);
    }
  });

  await Promise.all(promises);
};

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    resources: resource,
    debug: false, // 프로덕션에서는 false로
    fallbackLng: "en",
    supportedLngs: ["en", "ko", "ja"],
    load: "languageOnly", // ko-KR -> ko, en-US -> en, ja-JP -> ja
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // SSR/CSR 호환성
    },
    // 키가 없을 때 빈 문자열 반환하지 않고 키 자체 반환
    returnEmptyString: false,
    saveMissing: false,
  });

// 초기화 후 백엔드 번역 로드 (비동기, 병렬)
if (typeof window !== 'undefined') {
  loadTranslationsFromAPI().then(() => {
    // 번역 로드 완료 후 현재 언어로 다시 렌더링
    i18n.changeLanguage(i18n.language);
  });
}

export default i18n;
