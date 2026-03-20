import { Zap, Info, CheckCircle, Shield, Wifi, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const About = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto mt-6">
                    <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
                        <Home className="h-4 w-4 mr-1" />
                        Back to Home
                    </Link>
                    <div className="govt-card p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                            <Info className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold">{t("about.title")}</h1>
                        </div>

                        <p className="text-base text-foreground/90 mb-8 leading-relaxed">
                            {t("about.description")}
                        </p>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30">
                                <Shield className="h-6 w-6 text-primary shrink-0" />
                                <span className="text-base font-medium">{t("about.feature1")}</span>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30">
                                <CheckCircle className="h-6 w-6 text-primary shrink-0" />
                                <span className="text-base font-medium">{t("about.feature2")}</span>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30">
                                <Phone className="h-6 w-6 text-primary shrink-0" />
                                <span className="text-base font-medium">{t("about.feature3")}</span>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30">
                                <Wifi className="h-6 w-6 text-primary shrink-0" />
                                <span className="text-base font-medium">{t("about.feature4")}</span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-accent/20 border border-accent/30 rounded-xl flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <p className="text-sm font-medium text-foreground/80 italic pt-1">
                                {t("about.advisory")}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default About;
