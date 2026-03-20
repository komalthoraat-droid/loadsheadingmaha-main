import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubstationSelect from "@/components/SubstationSelect";
import VillageSelect from "@/components/VillageSelect";
import ScheduleDisplay from "@/components/ScheduleDisplay";
import CustomerCare from "@/components/CustomerCare";
import WeatherPredictionBanner from "@/components/WeatherPredictionBanner";
import OutagePredictionCard from "@/components/OutagePredictionCard";
import { Zap, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Substation {
  id: string;
  name: string;
}

interface Village {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  schedule_date: string;
  remarks: string | null;
  updated_at: string;
}

const Index = () => {
  const { t } = useLanguage();
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedSubstation, setSelectedSubstation] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedVillageName, setSelectedVillageName] = useState("");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  // Translation map for village names
  const VILLAGE_KEYS: Record<string, string> = {
    "nighoj": "village.nighoj",
    "manchar": "village.manchar",
    "shirur city": "village.shirur",
    "shirur": "village.shirur",
    "ralegan therpal": "village.ralegan",
    "ralegan": "village.ralegan",
    "supa": "village.supa",
    "dhawan vasti": "village.dhawanvasti",
    "shirsule": "village.shirsule",
    "tukai mala": "village.tukaimala",
    "tukaimala": "village.tukaimala",
  };

  const getTranslatedVillageName = (name: string): string => {
    const key = name.toLowerCase().trim();
    if (VILLAGE_KEYS[key]) return t(VILLAGE_KEYS[key]);
    const match = Object.keys(VILLAGE_KEYS).find(k => key.includes(k) || k.includes(key));
    return match ? t(VILLAGE_KEYS[match]) : name;
  };

  // Fetch substations on mount
  useEffect(() => {
    const fetchSubstations = async () => {
      const { data } = await supabase
        .from("substations")
        .select("id, name")
        .order("name");

      if (data) {
        setSubstations(data);
      }
    };

    fetchSubstations();
  }, []);

  // Fetch villages when substation changes
  useEffect(() => {
    const fetchVillages = async () => {
      if (!selectedSubstation) {
        setVillages([]);
        setSelectedVillage("");
        setShowSchedule(false);
        return;
      }

      const { data } = await supabase
        .from("villages")
        .select("id, name")
        .eq("substation_id", selectedSubstation)
        .order("name");

      if (data) {
        setVillages(data);
      }
      setSelectedVillage("");
      setShowSchedule(false);
    };

    fetchVillages();
  }, [selectedSubstation]);

  // Fetch schedule when village changes
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedVillage) {
        setSchedule(null);
        setShowSchedule(false);
        return;
      }

      setIsLoading(true);
      setShowSchedule(true);

      const today = format(new Date(), "yyyy-MM-dd");

      const { data } = await supabase
        .from("load_shedding_schedules")
        .select("*")
        .eq("village_id", selectedVillage)
        .eq("schedule_date", today)
        .maybeSingle();

      // Get village name
      const village = villages.find(v => v.id === selectedVillage);
      setSelectedVillageName(village?.name || "");

      setSchedule(data);
      setIsLoading(false);
    };

    fetchSchedule();
  }, [selectedVillage, villages]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center py-4 md:py-8 lg:py-12">
            <div className="inline-flex items-center justify-center bg-primary/10 p-3 md:p-4 rounded-full mb-4">
              <Zap className="h-8 w-8 md:h-12 md:w-12 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-3 leading-tight tracking-tight">
              {t("hero.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/report-issue"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-destructive hover:bg-destructive/90 text-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 font-semibold text-base sm:text-lg hover:shadow-lg transition-all"
              >
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 mr-2 shrink-0" />
                <span>{t("hero.reportButton")}</span>
              </Link>
            </div>
          </div>

          {/* Selection Form */}
          <div className="govt-card mt-2 sm:mt-6">
            <div className="govt-card-header text-lg sm:text-xl">
              {t("select.title")}
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <SubstationSelect
                substations={substations}
                value={selectedSubstation}
                onChange={setSelectedSubstation}
              />

              <VillageSelect
                villages={villages}
                value={selectedVillage}
                onChange={setSelectedVillage}
                disabled={!selectedSubstation}
              />
            </div>
          </div>

          {/* Schedule Display */}
          {showSchedule && (
            <ScheduleDisplay
              schedule={schedule}
              villageName={getTranslatedVillageName(selectedVillageName)}
              isLoading={isLoading}
            />
          )}

          {/* AI Prediction for Selected Village - Backend Powered */}
          {selectedVillage && (
            <OutagePredictionCard
              villageId={selectedVillage}
              villageName={selectedVillageName}
            />
          )}

          {/* Weather Prediction Banner */}
          <WeatherPredictionBanner />

          {/* Customer Care */}
          <CustomerCare />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
