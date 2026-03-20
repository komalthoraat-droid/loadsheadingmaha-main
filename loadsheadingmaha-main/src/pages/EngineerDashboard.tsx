import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Zap, LogOut, Save, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import CustomerCare from "@/components/CustomerCare";
import { format } from "date-fns";

interface Engineer {
  id: string;
  name: string;
  assigned_substation_id: string;
}

interface Village {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  village_id: string;
  start_time: string;
  end_time: string;
  remarks: string | null;
}

const EngineerDashboard = () => {
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [substationName, setSubstationName] = useState("");
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/engineer/login");
        return;
      }

      // Get engineer profile
      const { data: engineerData, error: engineerError } = await supabase
        .from("engineers")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (engineerError || !engineerData) {
        toast({
          title: "Access Denied",
          description: "You are not registered as an engineer",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate("/engineer/login");
        return;
      }

      setEngineer(engineerData);

      // Get substation name
      const { data: substation } = await supabase
        .from("substations")
        .select("name")
        .eq("id", engineerData.assigned_substation_id)
        .single();

      if (substation) {
        setSubstationName(substation.name);
      }

      // Get villages for this substation
      const { data: villagesData } = await supabase
        .from("villages")
        .select("id, name")
        .eq("substation_id", engineerData.assigned_substation_id)
        .order("name");

      if (villagesData) {
        setVillages(villagesData);
      }

      setIsLoading(false);
    };

    initDashboard();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/engineer/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/engineer/login");
  };

  const toggleVillage = (villageId: string) => {
    setSelectedVillages(prev =>
      prev.includes(villageId)
        ? prev.filter(id => id !== villageId)
        : [...prev, villageId]
    );
  };

  const selectAllVillages = () => {
    if (selectedVillages.length === villages.length) {
      setSelectedVillages([]);
    } else {
      setSelectedVillages(villages.map(v => v.id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!engineer || selectedVillages.length === 0 || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select at least one village and fill time fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: { user } } = await supabase.auth.getUser();

      // Upsert schedules for all selected villages
      const schedulesToUpsert = selectedVillages.map(villageId => ({
        substation_id: engineer.assigned_substation_id,
        village_id: villageId,
        schedule_date: today,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        remarks: remarks || null,
        updated_by: user?.id,
      }));

      // In Supabase, upsert based on unique constraint (village_id, schedule_date)
      const { error } = await supabase
        .from("load_shedding_schedules")
        .upsert(schedulesToUpsert, { onConflict: "village_id,schedule_date" });

      if (error) throw error;

      toast({
        title: "Schedules Saved!",
        description: `Load shedding schedules have been created/updated for ${selectedVillages.length} villages`,
      });

      // Clear form after success
      setSelectedVillages([]);
      setStartTime("");
      setEndTime("");
      setRemarks("");

    } catch (error: any) {
      toast({
        title: "Error Saving",
        description: error.message || "Failed to save schedules",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-16 w-16 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold">Engineer Dashboard</h1>
                <p className="text-sm opacity-90">{engineer?.name}</p>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-transparent border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Assigned Substation */}
          <div className="info-section">
            <p className="text-muted-foreground text-sm mb-1">Assigned Substation</p>
            <p className="text-xl font-bold text-foreground">{substationName}</p>
          </div>

          {/* Schedule Form */}
          <form onSubmit={handleSave}>
            <div className="govt-card">
              <div className="govt-card-header flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Create Power Cut Schedule ({format(new Date(), "dd MMM yyyy")})
              </div>

              <div className="p-6 space-y-6">

                {/* Multi-Village Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">Select Affected Villages / गावे निवडा *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllVillages}
                      className="text-primary hover:text-primary/90"
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      {selectedVillages.length === villages.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {villages.map(village => (
                      <div
                        key={village.id}
                        onClick={() => toggleVillage(village.id)}
                        className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${selectedVillages.includes(village.id)
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "bg-background border-input text-foreground hover:bg-muted"
                          }`}
                      >
                        {village.name}
                      </div>
                    ))}
                  </div>
                  {selectedVillages.length === 0 && (
                    <p className="text-sm text-destructive mt-1">Please select at least one village.</p>
                  )}
                </div>

                {selectedVillages.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-3 rounded-lg border border-primary/20">
                      <AlertTriangle className="h-5 w-5" />
                      Creating bulk schedule for {selectedVillages.length} selected village(s).
                    </div>

                    {/* Time Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-lg">
                          Start Time / सुरुवात
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          className="dropdown-large bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-lg">
                          End Time / शेवट
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          className="dropdown-large bg-background"
                        />
                      </div>
                    </div>

                    {/* Remarks / Reason */}
                    <div className="space-y-2">
                      <Label htmlFor="remarks" className="text-lg">
                        Reason / कारण (Optional)
                      </Label>
                      <Textarea
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="e.g. Maintenance work, Fault repair, Emergency load shedding..."
                        className="min-h-[100px] text-lg bg-background"
                      />
                    </div>

                    {/* Save Button */}
                    <Button
                      type="submit"
                      className="w-full btn-large bg-primary hover:bg-primary/90"
                      disabled={isSaving}
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {isSaving ? "Saving..." : "Publish Schedule / वेळापत्रक प्रकाशित करा"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>

          {/* Customer Care */}
          <CustomerCare />
        </div>
      </main>
    </div>
  );
};

export default EngineerDashboard;
