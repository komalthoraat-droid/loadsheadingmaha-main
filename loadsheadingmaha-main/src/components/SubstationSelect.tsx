import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Substation {
  id: string;
  name: string;
}

interface SubstationSelectProps {
  substations: Substation[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Translation key mapping for substation names
const SUBSTATION_TRANSLATION_KEYS: Record<string, string> = {
  "shirur substation": "substation.shirur",
  "junnar substation": "substation.junnar",
  "nighoj substation": "substation.nighoj",
  "manchar substation": "substation.manchar",
  "ralegan therpal substation": "substation.ralegan",
  "supa substation": "substation.supa",
  "shirur": "substation.shirur",
  "junnar": "substation.junnar",
  "nighoj": "substation.nighoj",
  "manchar": "substation.manchar",
  "ralegan therpal": "substation.ralegan",
  "ralegan": "substation.ralegan",
  "supa": "substation.supa",
};

const SubstationSelect = ({ substations, value, onChange, disabled }: SubstationSelectProps) => {
  const { t } = useLanguage();

  const getTranslatedName = (name: string): string => {
    const key = name.toLowerCase().trim();
    // Direct lookup first
    if (SUBSTATION_TRANSLATION_KEYS[key]) {
      return t(SUBSTATION_TRANSLATION_KEYS[key]);
    }
    // Try stripping " substation" suffix
    const withoutSuffix = key.replace(/\s*substation\s*$/, "").trim();
    if (SUBSTATION_TRANSLATION_KEYS[withoutSuffix]) {
      return t(SUBSTATION_TRANSLATION_KEYS[withoutSuffix]);
    }
    // Partial match fallback
    const match = Object.keys(SUBSTATION_TRANSLATION_KEYS).find(k => key.includes(k) || k.includes(withoutSuffix));
    if (match) {
      return t(SUBSTATION_TRANSLATION_KEYS[match]);
    }
    return name;
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Building2 className="h-5 w-5 text-primary" />
        {t("select.substation")}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="dropdown-large focus-visible-ring">
          <SelectValue placeholder={t("select.substationPlaceholder")} />
        </SelectTrigger>
        <SelectContent className="bg-card border-2 border-border z-50">
          {substations.map((substation) => (
            <SelectItem 
              key={substation.id} 
              value={substation.id}
              className="text-lg py-3 cursor-pointer hover:bg-accent"
            >
              {getTranslatedName(substation.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SubstationSelect;
