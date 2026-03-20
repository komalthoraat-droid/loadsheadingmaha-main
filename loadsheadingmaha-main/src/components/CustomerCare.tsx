import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CustomerCare = () => {
  const { t } = useLanguage();

  return (
    <div className="care-banner">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Phone className="h-6 w-6 text-primary" />
        <div className="text-center sm:text-left">
          <p className="text-muted-foreground text-sm">
            {t("care.title")}
          </p>
          <a 
            href="tel:18002123435"
            className="text-2xl font-bold text-primary hover:underline"
          >
            📞 1800 212 3435
          </a>
          <p className="text-xs text-muted-foreground mt-1">({t("care.tollFree")})</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;
