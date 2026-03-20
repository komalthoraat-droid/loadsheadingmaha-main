import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Village {
  id: string;
  name: string;
}

interface VillageSelectProps {
  villages: Village[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Translation key mapping for village names
const VILLAGE_TRANSLATION_KEYS: Record<string, string> = {
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

const VillageSelect = ({ villages, value, onChange, disabled }: VillageSelectProps) => {
  const { t } = useLanguage();

  const getTranslatedName = (name: string): string => {
    const key = name.toLowerCase().trim();
    // Direct lookup
    if (VILLAGE_TRANSLATION_KEYS[key]) {
      return t(VILLAGE_TRANSLATION_KEYS[key]);
    }
    // Partial match fallback
    const match = Object.keys(VILLAGE_TRANSLATION_KEYS).find(k => key.includes(k) || k.includes(key));
    if (match) {
      return t(VILLAGE_TRANSLATION_KEYS[match]);
    }
    return name;
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Home className="h-5 w-5 text-primary" />
        {t("select.village")}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="dropdown-large focus-visible-ring">
          <SelectValue placeholder={disabled ? t("select.firstSelectSubstation") : t("select.villagePlaceholder")} />
        </SelectTrigger>
        <SelectContent className="bg-card border-2 border-border z-50">
          {villages.map((village) => (
            <SelectItem 
              key={village.id} 
              value={village.id}
              className="text-lg py-3 cursor-pointer hover:bg-accent"
            >
              {getTranslatedName(village.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VillageSelect;
