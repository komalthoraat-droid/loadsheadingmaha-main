import { useState, useEffect } from "react";
import { CloudRain, CloudLightning, Thermometer, Wind, Droplets, Info, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

interface VillagePredictionProps {
  villageName: string;
  villageId: string;
}

// Coordinates mapping for villages
const VILLAGE_COORDINATES: Record<string, { lat: number; lon: number; translationKey: string }> = {
  "nighoj": { lat: 18.9833, lon: 74.0333, translationKey: "village.nighoj" },
  "manchar": { lat: 18.9647, lon: 73.9442, translationKey: "village.manchar" },
  "shirur": { lat: 18.8263, lon: 74.3792, translationKey: "village.shirur" },
  "shirur city": { lat: 18.8263, lon: 74.3792, translationKey: "village.shirur" },
  "ralegan therpal": { lat: 18.9214, lon: 74.5833, translationKey: "village.ralegan" },
  "ralegan": { lat: 18.9214, lon: 74.5833, translationKey: "village.ralegan" },
  "supa": { lat: 18.8667, lon: 74.0833, translationKey: "village.supa" },
};

interface WeatherInfo {
  temperature: number;
  windSpeed: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
}

interface PredictionResult {
  probability: number;
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  factorKeys: string[];
  weather: WeatherInfo;
}

// Rule-based weighted scoring for outage probability
const calculateOutageProbability = (
  weatherCode: number,
  precipitation: number,
  windSpeed: number,
  temperature: number,
  humidity: number
): { probability: number; factors: string[]; factorKeys: string[] } => {
  let probability = 0;
  const factors: string[] = [];
  const factorKeys: string[] = [];

  // Thunderstorm detection (WMO codes 95-99) - highest risk
  if (weatherCode >= 95) {
    probability += 45;
    factors.push("Thunderstorm");
    factorKeys.push("weather.thunderstorm");
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    probability += 15;
  }

  // Rain intensity scoring
  if (precipitation > 20) {
    probability += 35;
    factors.push("Heavy Rain");
    factorKeys.push("weather.heavyRain");
  } else if (precipitation > 10) {
    probability += 25;
    factors.push("Moderate Rain");
    factorKeys.push("weather.moderateRain");
  } else if (precipitation > 2) {
    probability += 10;
    factors.push("Light Rain");
    factorKeys.push("weather.lightRain");
  }

  // Wind speed scoring
  if (windSpeed > 60) {
    probability += 30;
    factors.push("Strong Winds");
    factorKeys.push("weather.strongWinds");
  } else if (windSpeed > 40) {
    probability += 20;
    factors.push("Strong Winds");
    factorKeys.push("weather.strongWinds");
  } else if (windSpeed > 25) {
    probability += 8;
  }

  // Extreme temperature scoring
  if (temperature > 44) {
    probability += 20;
    factors.push("Extreme Heat");
    factorKeys.push("weather.extremeHeat");
  } else if (temperature > 40) {
    probability += 12;
    factors.push("Extreme Heat");
    factorKeys.push("weather.extremeHeat");
  }

  // High humidity + moderate temp can cause transformer issues
  if (humidity > 90 && temperature > 35) {
    probability += 8;
  }

  // Cap at 95% - never show 100% certainty
  probability = Math.min(probability, 95);

  return { probability, factors, factorKeys };
};

const getRiskLevel = (probability: number): "low" | "medium" | "high" => {
  if (probability >= 60) return "high";
  if (probability >= 30) return "medium";
  return "low";
};

const VillagePrediction = ({ villageName, villageId }: VillagePredictionProps) => {
  const { t, language } = useLanguage();
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!villageName) {
      setPrediction(null);
      return;
    }

    const fetchPrediction = async () => {
      setIsLoading(true);
      
      // Find coordinates for the village
      const villageKey = villageName.toLowerCase();
      const coords = VILLAGE_COORDINATES[villageKey] || 
        Object.entries(VILLAGE_COORDINATES).find(([key]) => 
          villageKey.includes(key) || key.includes(villageKey)
        )?.[1];

      if (!coords) {
        // Default coordinates for unknown villages (Pune district center)
        const defaultCoords = { lat: 18.52, lon: 73.85 };
        await fetchWeatherAndPredict(defaultCoords.lat, defaultCoords.lon);
      } else {
        await fetchWeatherAndPredict(coords.lat, coords.lon);
      }
    };

    const fetchWeatherAndPredict = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!response.ok) throw new Error("Weather fetch failed");

        const data = await response.json();
        const current = data.current;

        const weather: WeatherInfo = {
          temperature: current.temperature_2m || 0,
          windSpeed: current.wind_speed_10m || 0,
          humidity: current.relative_humidity_2m || 0,
          precipitation: current.precipitation || 0,
          weatherCode: current.weather_code || 0,
        };

        const { probability, factors, factorKeys } = calculateOutageProbability(
          weather.weatherCode,
          weather.precipitation,
          weather.windSpeed,
          weather.temperature,
          weather.humidity
        );

        setPrediction({
          probability,
          riskLevel: getRiskLevel(probability),
          factors,
          factorKeys,
          weather,
        });
      } catch (error) {
        console.error("Prediction error:", error);
        setPrediction(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();
  }, [villageName, villageId]);

  if (!villageName) return null;

  const getProgressColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive";
      case "medium": return "bg-warning";
      default: return "bg-success";
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive/10 border-destructive/30";
      case "medium": return "bg-warning/10 border-warning/30";
      default: return "bg-success/10 border-success/30";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high": return <CloudLightning className="h-6 w-6 text-destructive" />;
      case "medium": return <CloudRain className="h-6 w-6 text-warning" />;
      default: return <Zap className="h-6 w-6 text-success" />;
    }
  };

  const getTranslatedFactors = (factorKeys: string[]) => {
    return factorKeys.map((key) => t(key)).join(", ");
  };

  if (isLoading) {
    return (
      <div className="govt-card mt-4">
        <div className="p-4">
          <div className="animate-pulse flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">{t("weather.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className={`govt-card mt-4 border-2 ${getRiskBgColor(prediction.riskLevel)}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getRiskIcon(prediction.riskLevel)}
            <h3 className="font-bold text-lg">{t("prediction.title")}</h3>
          </div>
          <span className="text-xs font-bold tracking-widest uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">
            {t("weather.aiPowered") || "AI Prediction"}
          </span>
        </div>

        {/* Probability Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("prediction.probability")}</span>
            <span className={`text-2xl font-bold ${
              prediction.riskLevel === "high" ? "text-destructive" :
              prediction.riskLevel === "medium" ? "text-warning" : "text-success"
            }`}>
              {prediction.probability}%
            </span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor(prediction.riskLevel)}`}
              style={{ width: `${prediction.probability}%` }}
            />
          </div>
        </div>

        {/* Risk Factors */}
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground">{t("prediction.factors")}:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {prediction.factorKeys.length > 0 ? (
              prediction.factorKeys.map((key, idx) => (
                <span 
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm ${
                    prediction.riskLevel === "high" ? "bg-destructive/20 text-destructive" :
                    prediction.riskLevel === "medium" ? "bg-warning/20 text-warning" : 
                    "bg-success/20 text-success"
                  }`}
                >
                  {t(key)}
                </span>
              ))
            ) : (
              <span className="text-sm text-success">{t("prediction.noFactors")}</span>
            )}
          </div>
        </div>

        {/* Weather Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-sm bg-secondary/50 p-2 rounded">
            <Thermometer className="h-4 w-4 text-primary" />
            <span>{prediction.weather.temperature}°C</span>
          </div>
          <div className="flex items-center gap-1 text-sm bg-secondary/50 p-2 rounded">
            <Wind className="h-4 w-4 text-primary" />
            <span>{prediction.weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1 text-sm bg-secondary/50 p-2 rounded">
            <Droplets className="h-4 w-4 text-primary" />
            <span>{prediction.weather.humidity}%</span>
          </div>
        </div>

        {/* Advisory */}
        <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{t("prediction.advisory")}</p>
        </div>
      </div>
    </div>
  );
};

export default VillagePrediction;
