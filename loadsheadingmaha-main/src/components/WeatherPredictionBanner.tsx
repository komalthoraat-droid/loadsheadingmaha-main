import { useState, useEffect } from "react";
import { CloudRain, CloudLightning, AlertTriangle, CheckCircle, Info, Thermometer, Wind } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  location: string;
  locationLocal: string;
  riskLevel: "low" | "medium" | "high" | "none";
  riskScore: number;
  conditions: string[];
  conditionKeys: string[];
  temperature: number;
  humidity: number;
  windSpeed: number;
  explanation: string;
}

// Coordinates for covered locations
const LOCATIONS = [
  { name: "Nighoj", nameMarathi: "निघोज", nameHindi: "निघोज", lat: 18.9833, lon: 74.0333 },
  { name: "Manchar", nameMarathi: "मंचर", nameHindi: "मंचर", lat: 18.9647, lon: 73.9442 },
  { name: "Shirur City", nameMarathi: "शिरूर", nameHindi: "शिरूर", lat: 18.8263, lon: 74.3792 },
  { name: "Ralegan Therpal", nameMarathi: "राळेगण थेरपळ", nameHindi: "रालेगण थेरपल", lat: 18.9214, lon: 74.5833 },
  { name: "Supa", nameMarathi: "सुपा", nameHindi: "सुपा", lat: 18.8667, lon: 74.0833 },
];

// Rule-based weighted scoring system for outage prediction
const calculateRiskScore = (
  weatherCode: number,
  precipitation: number,
  windSpeed: number,
  temperature: number,
  humidity: number = 0
): { score: number; conditions: string[]; conditionKeys: string[] } => {
  let score = 0;
  const conditions: string[] = [];
  const conditionKeys: string[] = [];

  // Thunderstorm detection (WMO codes 95-99) - 40 points
  if (weatherCode >= 95) {
    score += 40;
    conditions.push("Thunderstorm");
    conditionKeys.push("weather.thunderstorm");
  }

  // Heavy Rainfall - 25 points
  if (precipitation > 10) {
    score += 25;
    conditions.push("Heavy Rain");
    conditionKeys.push("weather.heavyRain");
  } else if (precipitation > 2) {
    score += 12;
    conditions.push("Moderate Rain");
    conditionKeys.push("weather.moderateRain");
  }

  // High Winds - 30 points for >50km/h, 18 points for >30km/h
  if (windSpeed > 50) {
    score += 30;
    conditions.push("Dangerous Winds");
    conditionKeys.push("weather.strongWinds");
  } else if (windSpeed > 30) {
    score += 18;
    conditions.push("Strong Winds");
    conditionKeys.push("weather.strongWinds");
  }

  // Extreme Heat - 25 points for >44°C
  if (temperature > 44) {
    score += 25;
    conditions.push("Extreme Heat");
    conditionKeys.push("weather.extremeHeat");
  } else if (temperature > 40) {
    score += 15;
    conditions.push("High Temperature");
    conditionKeys.push("weather.highTemp");
  }

  // Humidity + Heat Combination - 10 points
  if (humidity > 85 && temperature > 35) {
    score += 10;
    conditions.push("Humidity Stress");
    conditionKeys.push("weather.highHumidity");
  }

  return { score: Math.min(score, 95), conditions, conditionKeys };
};

const getRiskLevel = (score: number): "none" | "low" | "medium" | "high" => {
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  if (score >= 15) return "low";
  return "none";
};

const WeatherPredictionBanner = () => {
  const { t, language } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const results: WeatherData[] = [];

      for (const location of LOCATIONS) {
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        const current = data.current;

        const weatherCode = current.weather_code;
        const precipitation = current.precipitation || 0;
        const windSpeed = current.wind_speed_10m || 0;
        const temperature = current.temperature_2m || 0;

        const { score, conditions, conditionKeys } = calculateRiskScore(
          weatherCode,
          precipitation,
          windSpeed,
          temperature,
          current.relative_humidity_2m || 0
        );

        const riskLevel = getRiskLevel(score);

        // Generate simple explanation based on conditions
        let explanation = "";
        if (conditions.length > 0) {
          explanation = conditions.join(" + ");
        }

        results.push({
          location: location.name,
          locationLocal: language === "hi" ? location.nameHindi : location.nameMarathi,
          riskLevel,
          riskScore: score,
          conditions,
          conditionKeys,
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          explanation,
        });
      }

      // Sort by risk score (highest first)
      results.sort((a, b) => b.riskScore - a.riskScore);
      setWeatherData(results);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to load weather predictions");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTranslatedConditions = (conditionKeys: string[]) => {
    return conditionKeys.map((key) => t(key)).join(", ");
  };

  const highRiskLocations = weatherData.filter((w) => w.riskLevel === "high");
  const mediumRiskLocations = weatherData.filter((w) => w.riskLevel === "medium");
  const lowRiskLocations = weatherData.filter((w) => w.riskLevel === "low");
  const hasWarnings = highRiskLocations.length > 0 || mediumRiskLocations.length > 0;

  if (isLoading) {
    return (
      <div className="govt-card mb-6">
        <div className="p-4 text-center">
          <div className="animate-pulse flex items-center justify-center gap-2">
            <CloudRain className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">{t("weather.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail for weather prediction
  }

  return (
    <div className="govt-card mb-6 overflow-hidden">
      <div className="govt-card-header bg-secondary flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          <span>{t("weather.title")}</span>
        </div>
        <span className="text-xs opacity-80 bg-secondary-foreground/10 px-2 py-1 rounded">
          {t("weather.aiPowered") || "AI Prediction"}
        </span>
      </div>

      <div className="p-4">
        {/* Disclaimer */}
        <div className="bg-accent/50 p-3 rounded-lg mb-4 flex items-start gap-2">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong>{t("weather.disclaimerNote")}</strong> {t("weather.disclaimer")}
          </p>
        </div>

        {hasWarnings ? (
          <div className="space-y-3">
            {/* High Risk Alerts */}
            {highRiskLocations.map((loc) => (
              <div
                key={loc.location}
                className={`p-3 sm:p-4 rounded-xl ${getRiskColor("high")} flex items-start sm:items-center gap-3`}
              >
                <CloudLightning className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1 sm:mt-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-base sm:text-lg">⚠ {t("weather.highRisk")}</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs sm:text-sm">
                      {language === "en" ? loc.location : loc.locationLocal}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm opacity-90">
                    {t("weather.possibleOutage")} {getTranslatedConditions(loc.conditionKeys)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" /> {loc.temperature}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3" /> {loc.windSpeed} km/h
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Medium Risk Alerts */}
            {mediumRiskLocations.map((loc) => (
              <div
                key={loc.location}
                className={`p-3 sm:p-4 rounded-xl ${getRiskColor("medium")} flex items-start sm:items-center gap-3`}
              >
                <CloudRain className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-1 sm:mt-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-base sm:text-lg">⚠ {t("weather.mediumRisk")}</span>
                    <span className="px-2 py-0.5 bg-black/10 rounded text-xs sm:text-sm">
                      {language === "en" ? loc.location : loc.locationLocal}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    {t("weather.mayAffect")} {getTranslatedConditions(loc.conditionKeys)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" /> {loc.temperature}°C
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3" /> {loc.windSpeed} km/h
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Low Risk - Compact display */}
            {lowRiskLocations.length > 0 && (
              <div className="p-3 rounded-xl bg-accent/30 text-accent-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">{t("weather.lowRisk")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowRiskLocations.map((loc) => (
                    <span
                      key={loc.location}
                      className="px-2 py-1 bg-accent/50 rounded text-sm"
                    >
                      {language === "en" ? loc.location : loc.locationLocal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-success/10 text-success flex items-center gap-3">
            <CheckCircle className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-bold text-lg">{t("weather.noWarnings")}</p>
              <p className="text-sm opacity-80">{t("weather.normalConditions")}</p>
            </div>
          </div>
        )}

        {/* Risk Level Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">{t("weather.riskLevels")}</p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm">
              <CloudLightning className="h-4 w-4" /> {t("weather.high")}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning/20 text-warning text-sm">
              <CloudRain className="h-4 w-4" /> {t("weather.medium")}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm">
              <CheckCircle className="h-4 w-4" /> {t("weather.normal")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPredictionBanner;
