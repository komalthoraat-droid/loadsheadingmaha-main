import { Zap, Info, CheckCircle, Shield, Wifi, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">


      {/* Copyright */}
      <div className="py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-semibold">{t("footer.title")}</span>
          </div>
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} | {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
