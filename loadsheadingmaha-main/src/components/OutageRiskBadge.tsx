/**
 * Outage Risk Badge Component
 * 
 * Displays a colored badge indicating the current outage risk level:
 * 🟢 Low Risk (0-30%)
 * 🟡 Medium Risk (31-60%)
 * 🔴 High Risk (61-100%)
 */

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Zap, AlertTriangle, ShieldCheck } from "lucide-react";

interface OutageRiskBadgeProps {
  riskLevel: "Low" | "Medium" | "High";
  riskPercent: number;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
}

const OutageRiskBadge = ({ 
  riskLevel, 
  riskPercent, 
  showPercent = true,
  size = "md" 
}: OutageRiskBadgeProps) => {
  const { t } = useLanguage();

  const getBadgeConfig = () => {
    switch (riskLevel) {
      case "High":
        return {
          className: "bg-red-600 border-red-700",
          dotColor: "bg-red-300 shadow-[0_0_8px_rgba(252,165,165,0.8)]",
          icon: <AlertTriangle className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />,
          label: t("risk.high"),
        };
      case "Medium":
        return {
          className: "bg-amber-500 border-amber-600",
          dotColor: "bg-amber-200 shadow-[0_0_8px_rgba(253,230,138,0.8)]",
          icon: <Zap className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />,
          label: t("risk.medium"),
        };
      default:
        return {
          className: "bg-[#2E7D32] border-[#1B5E20]",
          dotColor: "bg-[#76FF03] shadow-[0_0_10px_rgba(118,255,3,0.6)]",
          icon: <ShieldCheck className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />,
          label: t("risk.low"),
        };
    }
  };

  const config = getBadgeConfig();
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1.5",
    md: "text-sm px-4 py-1.5 gap-2",
    lg: "text-lg px-6 py-2.5 gap-3"
  };

  const dotSizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-5 w-5"
  };

  return (
    <div 
      className={`
        ${config.className} 
        ${sizeClasses[size]} 
        flex items-center rounded-full text-white font-bold 
        shadow-lg border-b-2 transition-all duration-300
      `}
    >
      <div className="flex items-center justify-center opacity-90">
        {config.icon}
      </div>
      
      <div className={`${dotSizes[size]} rounded-full ${config.dotColor} animate-pulse`} />
      
      <span className="tracking-tight">
        {config.label}
        {showPercent && (
          <span className="ml-1 opacity-90">({riskPercent}%)</span>
        )}
      </span>
    </div>
  );
};

export default OutageRiskBadge;
