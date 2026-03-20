/**
 * Outage Prediction Card Component
 * 
 * Displays comprehensive outage risk prediction including:
 * - Risk badge with percentage
 * - Contributing weather factors
 * - Current weather conditions
 * - Disclaimer text
 * 
 * Uses the backend API for predictions (not frontend-only calculations)
 */

import { 
  CloudRain, 
  CloudLightning, 
  Thermometer, 
  Wind, 
  Droplets, 
  Info, 
  Zap,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOutagePrediction, OutagePrediction, RiskFactor } from "@/hooks/useOutagePrediction";
import OutageRiskBadge from "./OutageRiskBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface OutagePredictionCardProps {
  villageId: string | null;
  villageName: string;
}

const OutagePredictionCard = ({ villageId, villageName }: OutagePredictionCardProps) => {
  const { t } = useLanguage();
  const { prediction, isLoading, error, refetch } = useOutagePrediction(villageId);

  // Don't render if no village selected
  if (!villageId) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="govt-card mt-6">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-full rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="govt-card mt-6 border-2 border-destructive/20 bg-destructive/5 overflow-hidden">
        <div className="bg-destructive/10 p-3 flex items-center gap-2 text-destructive border-b border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold uppercase tracking-wider text-sm">{t("prediction.error")}</span>
        </div>
        <div className="p-6">
          <p className="text-sm text-foreground/80 mb-4">{error}</p>
          <Button 
            variant="default" 
            size="sm" 
            onClick={refetch}
            className="rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("prediction.retry")}
          </Button>
        </div>
      </div>
    );
  }

  // No prediction available
  if (!prediction) return null;

  // Get colors based on risk level
  const getColors = () => {
    switch (prediction.risk_level) {
      case "High":
        return {
          main: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive/30",
          badge: "bg-destructive text-white",
          progress: "bg-destructive"
        };
      case "Medium":
        return {
          main: "text-amber-600",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          badge: "bg-amber-500 text-white",
          progress: "bg-amber-500"
        };
      default:
        return {
          main: "text-emerald-600",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          badge: "bg-emerald-600 text-white",
          progress: "bg-[#0047AB]" // Dark blue like screenshot
        };
    }
  };

  const colors = getColors();

  // Get icon based on risk level
  const getRiskIcon = () => {
    switch (prediction.risk_level) {
      case "High":
        return <CloudLightning className="h-8 w-8 text-destructive" />;
      case "Medium":
        return <CloudRain className="h-8 w-8 text-amber-500" />;
      default:
        return <Zap className="h-8 w-8 text-emerald-500" />;
    }
  };

  // Translate factor names
  const getFactorTranslation = (factor: string): string => {
    const factorMap: Record<string, string> = {
      "Thunderstorm Activity": t("weather.thunderstorm"),
      "Heavy Rainfall": t("weather.heavyRain"),
      "Moderate Rainfall": t("weather.moderateRain"),
      "Dangerous Wind Speed": t("weather.strongWinds"),
      "Strong Winds": t("weather.strongWinds"),
      "Moderate Winds": t("weather.moderateWinds"),
      "Extreme Heat": t("weather.extremeHeat"),
      "High Temperature": t("weather.highTemp"),
      "High Humidity Stress": t("weather.highHumidity"),
    };
    return factorMap[factor] || factor;
  };

  return (
    <div className="govt-card mt-8 overflow-hidden border-none shadow-xl ring-1 ring-black/5 bg-emerald-50/30">
      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-black tracking-tight text-slate-800">
            {t("prediction.title")}
          </h2>
        </div>

        {/* Risk Badge (Large) */}
        <div className="flex justify-start">
          <OutageRiskBadge 
            riskLevel={prediction.risk_level} 
            riskPercent={prediction.outage_risk_percent}
            size="lg"
          />
        </div>

        {/* Probability and Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-700">{t("prediction.probability")}</span>
            <span className={`text-4xl font-extrabold ${colors.main}`}>
              {prediction.outage_risk_percent}%
            </span>
          </div>
          
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${colors.progress}`}
              style={{ width: `${prediction.outage_risk_percent}%` }}
            />
          </div>
        </div>

        {/* Main Reason Banner */}
        <div className="bg-slate-400/20 p-4 rounded-xl border border-slate-400/10 shadow-sm backdrop-blur-sm">
          <p className="text-center font-bold text-slate-800 text-lg">
            {prediction.reason}
          </p>
        </div>

        {/* Weather Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-slate-400/20 p-4 rounded-xl border border-slate-400/10">
            <Thermometer className="h-6 w-6 text-orange-600 shrink-0" />
            <span className="text-lg font-bold text-slate-800">{prediction.weather.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-400/20 p-4 rounded-xl border border-slate-400/10">
            <Wind className="h-6 w-6 text-slate-600 shrink-0" />
            <span className="text-lg font-bold text-slate-800">{prediction.weather.windSpeed.toFixed(0)} km/h</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-400/20 p-4 rounded-xl border border-slate-400/10">
            <Droplets className="h-6 w-6 text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-slate-800">{prediction.weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-400/20 p-4 rounded-xl border border-slate-400/10">
            <CloudRain className="h-6 w-6 text-slate-600 shrink-0" />
            <span className="text-lg font-bold text-slate-800">{prediction.weather.rainProbability}% {t("weather.rainChance")}</span>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{prediction.cached ? "⚡ " : ""}{t("prediction.lastUpdated")}: {new Date(prediction.prediction_time).toLocaleTimeString()}</span>
            <button 
              onClick={refetch}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              title={t("prediction.refresh")}
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
          
          <div className="text-[10px] font-bold tracking-widest uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-600">
            {t("weather.aiPowered")}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/50 flex gap-3 items-start">
          <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-slate-600 font-medium">
            {t("prediction.disclaimer")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OutagePredictionCard;
