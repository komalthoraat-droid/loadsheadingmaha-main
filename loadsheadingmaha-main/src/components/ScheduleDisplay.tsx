import { Clock, Zap, ZapOff, AlertCircle, Calendar } from "lucide-react";
import { format, parse } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  schedule_date: string;
  remarks?: string;
  updated_at: string;
}

interface ScheduleDisplayProps {
  schedule: Schedule | null;
  villageName: string;
  isLoading: boolean;
}

const ScheduleDisplay = ({ schedule, villageName, isLoading }: ScheduleDisplayProps) => {
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="info-section animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-12 bg-muted rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="info-section text-center">
        <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
        <p className="text-xl font-semibold text-foreground mb-2">
          {t("schedule.noSchedule")}
        </p>
      </div>
    );
  }

  // Parse times
  const now = new Date();

  // Check if power is currently off
  const currentTimeStr = format(now, "HH:mm:ss");
  const isPowerOff = currentTimeStr >= schedule.start_time && currentTimeStr <= schedule.end_time;

  const formatDisplayTime = (timeStr: string) => {
    const time = parse(timeStr, "HH:mm:ss", new Date());
    return format(time, "h:mm a");
  };

  const getPowerStatus = () => {
    if (isPowerOff) {
      const labels: Record<string, string> = {
        en: "LIGHT GONE (POWER CUT)",
        mr: "वीज बंद",
        hi: "बिजली बंद",
      };
      return labels[language] || labels.en;
    } else {
      const labels: Record<string, string> = {
        en: "LIGHT IS ON",
        mr: "वीज चालू",
        hi: "बिजली चालू",
      };
      return labels[language] || labels.en;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`text-center p-6 rounded-2xl ${isPowerOff ? 'bg-danger/10 border-2 border-danger' : 'bg-success/10 border-2 border-success'}`}>
        <div className="flex items-center justify-center gap-3 mb-3">
          {isPowerOff ? (
            <>
              <ZapOff className="h-12 w-12 text-danger animate-pulse-slow" />
              <span className="status-power-off">{getPowerStatus()}</span>
            </>
          ) : (
            <>
              <Zap className="h-12 w-12 text-success" />
              <span className="status-power-on">{getPowerStatus()}</span>
            </>
          )}
        </div>
        <p className="text-lg text-muted-foreground">{villageName}</p>
      </div>

      {/* Schedule Details */}
      <div className="govt-card">
        <div className="govt-card-header flex items-center gap-2">
          <Clock className="h-6 w-6" />
          {t("schedule.title")}
        </div>
        <div className="p-6 text-center">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-danger/10 px-6 py-4 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">{t("schedule.from")}</p>
              <p className="time-display">{formatDisplayTime(schedule.start_time)}</p>
            </div>
            <span className="text-2xl text-muted-foreground">→</span>
            <div className="bg-success/10 px-6 py-4 rounded-xl">
              <p className="text-sm text-muted-foreground mb-1">{t("schedule.to")}</p>
              <p className="time-display">{formatDisplayTime(schedule.end_time)}</p>
            </div>
          </div>

          {schedule.remarks && (
            <div className="mt-6 p-4 bg-warning/20 rounded-xl border border-warning/30">
              <p className="text-foreground font-medium">
                📝 {t("schedule.remarks")}: {schedule.remarks}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {t("schedule.updatedAt")}: {format(new Date(schedule.updated_at), "dd MMM yyyy, h:mm a")}
        </span>
      </div>
    </div>
  );
};

export default ScheduleDisplay;
