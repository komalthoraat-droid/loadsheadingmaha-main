import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "mr" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "header.title": "Load Shedding Info",
    "header.subtitle": "Power Cut Schedule",
    "header.engineer": "Engineer",
    "header.authority": "Authority",
    
    // Hero
    "hero.title": "Today's Load Shedding Schedule",
    "hero.subtitle": "Check your village's power cut timing",
    "hero.reportButton": "Report Light Problem",
    
    // Selection
    "select.title": "Select Your Village",
    "select.substation": "Select Substation",
    "select.substationPlaceholder": "Choose substation...",
    "select.village": "Select Village",
    "select.villagePlaceholder": "Choose village...",
    "select.firstSelectSubstation": "First select a substation",
    
    // Schedule
    "schedule.title": "Today's Schedule",
    "schedule.loading": "Loading schedule...",
    "schedule.noSchedule": "No load shedding scheduled for today",
    "schedule.from": "From",
    "schedule.to": "To",
    "schedule.remarks": "Remarks",
    "schedule.updatedAt": "Last updated",
    
    // Weather Prediction
    "weather.title": "Weather-Based Outage Prediction",
    "weather.loading": "Loading weather predictions...",
    "weather.disclaimer": "This is a weather-based prediction, not confirmed load shedding.",
    "weather.disclaimerNote": "Note:",
    "weather.highRisk": "HIGH RISK",
    "weather.mediumRisk": "MEDIUM RISK",
    "weather.lowRisk": "LOW RISK",
    "weather.noWarnings": "No Weather Warnings",
    "weather.normalConditions": "Current weather conditions are normal across all substations.",
    "weather.possibleOutage": "Possible power outage due to:",
    "weather.mayAffect": "Weather conditions may affect power:",
    "weather.riskLevels": "Risk Levels:",
    "weather.high": "High",
    "weather.medium": "Medium",
    "weather.normal": "Normal",
    "weather.monsoonNote": "Active during monsoon season (June-November)",
    "weather.thunderstorm": "Thunderstorm",
    "weather.heavyRain": "Heavy Rain",
    "weather.moderateRain": "Moderate Rain",
    "weather.lightRain": "Light Rain",
    "weather.strongWinds": "Strong Winds",
    "weather.extremeHeat": "Extreme Heat",
    
    // Customer Care
    "care.title": "Mahavitaran Customer Care",
    "care.tollFree": "Toll Free",
    
    // Footer
    "footer.title": "Mahavitaran Load Shedding Info",
    "footer.copyright": "Rural Electricity Information Portal",
    
    // About Section
    "about.title": "About This Portal",
    "about.description": "This website helps villagers in rural Maharashtra know when power cuts (load shedding) will happen in their area. You can plan your daily activities like farming, cooking, and charging phones accordingly.",
    "about.feature1": "Updates are provided by authorized substation engineers",
    "about.feature2": "Outage prediction is weather-based and advisory only",
    "about.feature3": "Designed for easy use on basic smartphones",
    "about.feature4": "Works even on slow internet connections",
    "about.advisory": "Weather predictions are informational only. Always check official announcements for confirmed schedules.",
    
    // Language
    "language.select": "Language",
    "language.en": "English",
    "language.mr": "मराठी",
    "language.hi": "हिंदी",
    
    // Village Names
    "village.nighoj": "Nighoj",
    "village.manchar": "Manchar",
    "village.shirur": "Shirur City",
    "village.ralegan": "Ralegan Therpal",
    "village.supa": "Supa",
    "village.dhawanvasti": "Dhawan Vasti",
    "village.shirsule": "Shirsule",
    "village.tukaimala": "Tukai Mala",
    
    // Substation Names
    "substation.shirur": "Shirur Substation",
    "substation.junnar": "Junnar Substation",
    "substation.nighoj": "Nighoj Substation",
    "substation.manchar": "Manchar Substation",
    "substation.ralegan": "Ralegan Therpal Substation",
    "substation.supa": "Supa Substation",
    "weather.aiPowered": "AI Prediction",
    
    // Prediction
    "prediction.title": "AI Outage Risk for Your Village",
    "prediction.selectVillage": "Select a village to see prediction",
    "prediction.probability": "Outage Probability",
    "prediction.factors": "Risk Factors",
    "prediction.noFactors": "No adverse weather conditions",
    "prediction.temp": "Temperature",
    "prediction.wind": "Wind Speed",
    "prediction.humidity": "Humidity",
    "prediction.advisory": "This is an AI-based estimate, not confirmed outage.",
    "prediction.loading": "Analyzing weather conditions...",
    "prediction.error": "Could not load prediction",
    "prediction.retry": "Try Again",
    "prediction.lastUpdated": "Updated",
    "prediction.refresh": "Refresh",
    "prediction.disclaimer": "This is an estimated risk based on weather conditions, not an official power-cut confirmation. Always check official announcements for confirmed schedules.",
    
    // Risk Levels
    "risk.high": "High Risk",
    "risk.medium": "Medium Risk",
    "risk.low": "Low Risk",
    
    // Additional Weather Terms
    "weather.moderateWinds": "Moderate Winds",
    "weather.highTemp": "High Temperature",
    "weather.highHumidity": "High Humidity",
    "weather.rainChance": "Rain",
  },
  
  mr: {
    // Header
    "header.title": "लोडशेडिंग माहिती",
    "header.subtitle": "वीज खंडित वेळापत्रक",
    "header.engineer": "अभियंता",
    "header.authority": "अधिकारी",
    
    // Hero
    "hero.title": "आजचे लोडशेडिंग वेळापत्रक",
    "hero.subtitle": "तुमच्या गावातील वीज खंडित वेळ तपासा",
    "hero.reportButton": "वीज समस्या नोंदवा",
    
    // Selection
    "select.title": "तुमचे गाव निवडा",
    "select.substation": "सबस्टेशन निवडा",
    "select.substationPlaceholder": "सबस्टेशन निवडा...",
    "select.village": "गाव निवडा",
    "select.villagePlaceholder": "गाव निवडा...",
    "select.firstSelectSubstation": "आधी सबस्टेशन निवडा",
    
    // Schedule
    "schedule.title": "आजचे वेळापत्रक",
    "schedule.loading": "वेळापत्रक लोड होत आहे...",
    "schedule.noSchedule": "आज लोडशेडिंग नियोजित नाही",
    "schedule.from": "पासून",
    "schedule.to": "पर्यंत",
    "schedule.remarks": "टिप्पणी",
    "schedule.updatedAt": "शेवटचे अपडेट",
    
    // Weather Prediction
    "weather.title": "हवामान आधारित वीज खंडित अंदाज",
    "weather.loading": "हवामान अंदाज लोड होत आहे...",
    "weather.disclaimer": "हा हवामानावर आधारित अंदाज आहे, निश्चित लोडशेडिंग नाही.",
    "weather.disclaimerNote": "टीप:",
    "weather.highRisk": "उच्च धोका",
    "weather.mediumRisk": "मध्यम धोका",
    "weather.lowRisk": "कमी धोका",
    "weather.noWarnings": "हवामान इशारे नाहीत",
    "weather.normalConditions": "सर्व सबस्टेशनवर सध्याची हवामान परिस्थिती सामान्य आहे.",
    "weather.possibleOutage": "वीज खंडित होण्याची शक्यता:",
    "weather.mayAffect": "हवामान परिस्थितीमुळे वीज प्रभावित होऊ शकते:",
    "weather.riskLevels": "धोक्याची पातळी:",
    "weather.high": "उच्च",
    "weather.medium": "मध्यम",
    "weather.normal": "सामान्य",
    "weather.monsoonNote": "पावसाळ्यात सक्रिय (जून-नोव्हेंबर)",
    "weather.thunderstorm": "वादळ",
    "weather.heavyRain": "मुसळधार पाऊस",
    "weather.moderateRain": "मध्यम पाऊस",
    "weather.lightRain": "हलका पाऊस",
    "weather.strongWinds": "जोरदार वारे",
    "weather.extremeHeat": "अति उष्णता",
    
    // Customer Care
    "care.title": "महावितरण ग्राहक सेवा",
    "care.tollFree": "मोफत",
    
    // Footer
    "footer.title": "महावितरण लोडशेडिंग माहिती",
    "footer.copyright": "ग्रामीण वीज माहिती पोर्टल",
    
    // About Section
    "about.title": "या पोर्टलबद्दल",
    "about.description": "हे वेबसाईट ग्रामीण महाराष्ट्रातील गावकऱ्यांना त्यांच्या परिसरात वीज खंडित (लोडशेडिंग) कधी होईल हे जाणून घेण्यास मदत करते. तुम्ही शेती, स्वयंपाक, फोन चार्जिंग यासारख्या दैनंदिन कामांचे नियोजन करू शकता.",
    "about.feature1": "अधिकृत सबस्टेशन अभियंत्यांकडून अपडेट्स दिले जातात",
    "about.feature2": "वीज खंडित अंदाज हवामानावर आधारित आहे, केवळ सल्लागार",
    "about.feature3": "साध्या स्मार्टफोनवर सोप्या वापरासाठी डिझाइन केलेले",
    "about.feature4": "कमी इंटरनेट स्पीडवरही काम करते",
    "about.advisory": "हवामान अंदाज केवळ माहितीसाठी आहेत. निश्चित वेळापत्रकांसाठी नेहमी अधिकृत घोषणा तपासा.",
    
    // Language
    "language.select": "भाषा",
    "language.en": "English",
    "language.mr": "मराठी",
    "language.hi": "हिंदी",
    
    // Village Names
    "village.nighoj": "निघोज",
    "village.manchar": "मंचर",
    "village.shirur": "शिरूर शहर",
    "village.ralegan": "राळेगण थेरपळ",
    "village.supa": "सुपा",
    "village.dhawanvasti": "धवन वस्ती",
    "village.shirsule": "शिरसुले",
    "village.tukaimala": "तुकाई माळ",
    
    // Substation Names
    "substation.shirur": "शिरूर सबस्टेशन",
    "substation.junnar": "जुन्नर सबस्टेशन",
    "substation.nighoj": "निघोज सबस्टेशन",
    "substation.manchar": "मंचर सबस्टेशन",
    "substation.ralegan": "राळेगण थेरपळ सबस्टेशन",
    "substation.supa": "सुपा सबस्टेशन",
    "weather.aiPowered": "AI अंदाज",
    
    // Prediction
    "prediction.title": "तुमच्या गावासाठी AI वीज खंडित धोका",
    "prediction.selectVillage": "अंदाज पाहण्यासाठी गाव निवडा",
    "prediction.probability": "वीज खंडित शक्यता",
    "prediction.factors": "धोक्याचे घटक",
    "prediction.noFactors": "प्रतिकूल हवामान परिस्थिती नाही",
    "prediction.temp": "तापमान",
    "prediction.wind": "वारा वेग",
    "prediction.humidity": "आर्द्रता",
    "prediction.advisory": "हा AI-आधारित अंदाज आहे, निश्चित वीज खंडित नाही.",
    "prediction.loading": "हवामान परिस्थिती विश्लेषण करत आहे...",
    "prediction.error": "अंदाज लोड करता आला नाही",
    "prediction.retry": "पुन्हा प्रयत्न करा",
    "prediction.lastUpdated": "अपडेट केले",
    "prediction.refresh": "रिफ्रेश",
    "prediction.disclaimer": "हा हवामान परिस्थितीवर आधारित अंदाजित धोका आहे, अधिकृत वीज खंडित पुष्टी नाही. निश्चित वेळापत्रकांसाठी नेहमी अधिकृत घोषणा तपासा.",
    
    // Risk Levels
    "risk.high": "उच्च धोका",
    "risk.medium": "मध्यम धोका",
    "risk.low": "कमी धोका",
    
    // Additional Weather Terms
    "weather.moderateWinds": "मध्यम वारे",
    "weather.highTemp": "उच्च तापमान",
    "weather.highHumidity": "उच्च आर्द्रता",
    "weather.rainChance": "पाऊस",
  },
  
  hi: {
    // Header
    "header.title": "लोडशेडिंग जानकारी",
    "header.subtitle": "बिजली कटौती समय सारणी",
    "header.engineer": "इंजीनियर",
    "header.authority": "अधिकारी",
    
    // Hero
    "hero.title": "आज का लोडशेडिंग समय",
    "hero.subtitle": "अपने गाँव की बिजली कटौती का समय जानें",
    "hero.reportButton": "बिजली समस्या दर्ज करें",
    
    // Selection
    "select.title": "अपना गाँव चुनें",
    "select.substation": "सबस्टेशन चुनें",
    "select.substationPlaceholder": "सबस्टेशन चुनें...",
    "select.village": "गाँव चुनें",
    "select.villagePlaceholder": "गाँव चुनें...",
    "select.firstSelectSubstation": "पहले सबस्टेशन चुनें",
    
    // Schedule
    "schedule.title": "आज का समय",
    "schedule.loading": "समय सारणी लोड हो रही है...",
    "schedule.noSchedule": "आज लोडशेडिंग नियोजित नहीं है",
    "schedule.from": "से",
    "schedule.to": "तक",
    "schedule.remarks": "टिप्पणी",
    "schedule.updatedAt": "अंतिम अपडेट",
    
    // Weather Prediction
    "weather.title": "मौसम आधारित बिजली कटौती अनुमान",
    "weather.loading": "मौसम अनुमान लोड हो रहा है...",
    "weather.disclaimer": "यह मौसम पर आधारित अनुमान है, निश्चित लोडशेडिंग नहीं।",
    "weather.disclaimerNote": "नोट:",
    "weather.highRisk": "उच्च जोखिम",
    "weather.mediumRisk": "मध्यम जोखिम",
    "weather.lowRisk": "कम जोखिम",
    "weather.noWarnings": "कोई मौसम चेतावनी नहीं",
    "weather.normalConditions": "सभी सबस्टेशनों पर वर्तमान मौसम स्थिति सामान्य है।",
    "weather.possibleOutage": "बिजली कटौती की संभावना:",
    "weather.mayAffect": "मौसम की स्थिति से बिजली प्रभावित हो सकती है:",
    "weather.riskLevels": "जोखिम स्तर:",
    "weather.high": "उच्च",
    "weather.medium": "मध्यम",
    "weather.normal": "सामान्य",
    "weather.monsoonNote": "मानसून में सक्रिय (जून-नवंबर)",
    "weather.thunderstorm": "आँधी-तूफान",
    "weather.heavyRain": "भारी बारिश",
    "weather.moderateRain": "मध्यम बारिश",
    "weather.lightRain": "हल्की बारिश",
    "weather.strongWinds": "तेज़ हवाएँ",
    "weather.extremeHeat": "अत्यधिक गर्मी",
    
    // Customer Care
    "care.title": "महावितरण ग्राहक सेवा",
    "care.tollFree": "मुफ्त",
    
    // Footer
    "footer.title": "महावितरण लोडशेडिंग जानकारी",
    "footer.copyright": "ग्रामीण बिजली जानकारी पोर्टल",
    
    // About Section
    "about.title": "इस पोर्टल के बारे में",
    "about.description": "यह वेबसाइट ग्रामीण महाराष्ट्र के गाँववालों को उनके क्षेत्र में बिजली कटौती (लोडशेडिंग) कब होगी यह जानने में मदद करती है। आप खेती, खाना बनाना, फोन चार्जिंग जैसी दैनिक गतिविधियों की योजना बना सकते हैं।",
    "about.feature1": "अधिकृत सबस्टेशन इंजीनियरों द्वारा अपडेट दिए जाते हैं",
    "about.feature2": "बिजली कटौती अनुमान मौसम पर आधारित है, केवल सलाहकार",
    "about.feature3": "साधारण स्मार्टफोन पर आसान उपयोग के लिए डिज़ाइन किया गया",
    "about.feature4": "धीमे इंटरनेट कनेक्शन पर भी काम करता है",
    "about.advisory": "मौसम अनुमान केवळ जानकारी के लिए हैं। निश्चित समय सारणी के लिए हमेशा आधिकारिक घोषणाएँ देखें।",
    
    // Language
    "language.select": "भाषा",
    "language.en": "English",
    "language.mr": "मराठी",
    "language.hi": "हिंदी",
    
    // Village Names
    "village.nighoj": "निघोज",
    "village.manchar": "मंचर",
    "village.shirur": "शिरूर शहर",
    "village.ralegan": "रालेगण थेरपल",
    "village.supa": "सुपा",
    "village.dhawanvasti": "धवन बस्ती",
    "village.shirsule": "शिरसुले",
    "village.tukaimala": "तुकाई माला",
    
    // Substation Names
    "substation.shirur": "शिरूर सबस्टेशन",
    "substation.junnar": "जुन्नर सबस्टेशन",
    "substation.nighoj": "निघोज सबस्टेशन",
    "substation.manchar": "मंचर सबस्टेशन",
    "substation.ralegan": "रालेगण थेरपल सबस्टेशन",
    "substation.supa": "सुपा सबस्टेशन",
    "weather.aiPowered": "AI अनुमान",
    
    // Prediction
    "prediction.title": "आपके गाँव के लिए AI बिजली कटौती जोखिम",
    "prediction.selectVillage": "अनुमान देखने के लिए गाँव चुनें",
    "prediction.probability": "बिजली कटौती संभावना",
    "prediction.factors": "जोखिम कारक",
    "prediction.noFactors": "कोई प्रतिकूल मौसम स्थिति नहीं",
    "prediction.temp": "तापमान",
    "prediction.wind": "हवा गति",
    "prediction.humidity": "आर्द्रता",
    "prediction.advisory": "यह AI-आधारित अनुमान है, निश्चित बिजली कटौती नहीं।",
    "prediction.loading": "मौसम स्थिति का विश्लेषण कर रहे हैं...",
    "prediction.error": "अनुमान लोड नहीं हो सका",
    "prediction.retry": "फिर से प्रयास करें",
    "prediction.lastUpdated": "अपडेट किया गया",
    "prediction.refresh": "रिफ्रेश",
    "prediction.disclaimer": "यह मौसम स्थितियों पर आधारित अनुमानित जोखिम है, आधिकारिक बिजली कटौती पुष्टि नहीं। निश्चित समय सारणी के लिए हमेशा आधिकारिक घोषणाएँ देखें।",
    
    // Risk Levels
    "risk.high": "उच्च जोखिम",
    "risk.medium": "मध्यम जोखिम",
    "risk.low": "कम जोखिम",
    
    // Additional Weather Terms
    "weather.moderateWinds": "मध्यम हवाएँ",
    "weather.highTemp": "उच्च तापमान",
    "weather.highHumidity": "उच्च आर्द्रता",
    "weather.rainChance": "बारिश",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferred-language");
      if (saved && (saved === "en" || saved === "mr" || saved === "hi")) {
        return saved as Language;
      }
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("preferred-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
