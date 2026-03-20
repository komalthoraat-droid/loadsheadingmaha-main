import { Zap, User, Shield, Menu, Info, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-secondary text-secondary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold leading-tight">
                {t("header.title")}
              </h1>
              <p className="text-sm opacity-90">{t("header.subtitle")}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-xl bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-secondary text-secondary-foreground border-l-secondary-foreground/10 flex flex-col gap-6">
                <SheetHeader className="text-left mt-4 border-b border-secondary-foreground/10 pb-4">
                  <SheetTitle className="text-xl font-bold text-secondary-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Menu
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4">
                  <Link
                    to="/"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-foreground/10 transition-colors font-medium text-lg"
                  >
                    <Home className="h-5 w-5 opacity-70" />
                    Home
                  </Link>

                  <Link
                    to="/about"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-foreground/10 transition-colors font-medium text-lg"
                  >
                    <Info className="h-5 w-5 opacity-70" />
                    About
                  </Link>

                  <Link
                    to="/engineer/login"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-foreground/10 transition-colors font-medium text-lg"
                  >
                    <User className="h-5 w-5 opacity-70" />
                    Engineer Login
                  </Link>

                  <Link
                    to="/approval/login"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-foreground/10 transition-colors font-medium text-lg border border-primary/20"
                  >
                    <Shield className="h-5 w-5 text-primary" />
                    Authority Login
                  </Link>
                </div>

                <div className="mt-auto pt-4 border-t border-secondary-foreground/10 border-solid">
                  <div className="mb-2 text-sm text-secondary-foreground/70 font-medium">Language Preference</div>
                  <div className="flex items-center p-3 rounded-xl bg-background text-foreground shadow-sm">
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
