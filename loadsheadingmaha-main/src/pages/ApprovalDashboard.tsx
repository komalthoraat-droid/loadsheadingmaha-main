import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogOut, Check, X, Clock, User, ShieldAlert, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PendingEngineer {
  id: string;
  name: string;
  user_id: string;
  is_approved: boolean;
  created_at: string;
  substation_name: string;
  email: string;
}

interface LightProblem {
  id: string;
  user_name: string;
  mobile: string;
  substation_name: string;
  village_name: string;
  description: string;
  photo_url: string | null;
  status: string;
  created_at: string;
}

const ApprovalDashboard = () => {
  const [pendingEngineers, setPendingEngineers] = useState<PendingEngineer[]>([]);
  const [lightProblems, setLightProblems] = useState<LightProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/approval/login");
        return;
      }

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .limit(1);

      if (!roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        navigate("/approval/login");
        return;
      }

      await Promise.all([fetchPendingEngineers(), fetchLightProblems()]);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/approval/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchPendingEngineers = async () => {
    // Fetch all engineers with their substation info
    const { data: engineers, error } = await supabase
      .from("engineers")
      .select(`
        id,
        name,
        user_id,
        is_approved,
        created_at,
        assigned_substation_id,
        substations (name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching engineers:", error);
      return;
    }

    const engineersWithDetails = await Promise.all(
      (engineers || []).map(async (eng: any) => ({
        id: eng.id,
        name: eng.name,
        user_id: eng.user_id,
        is_approved: eng.is_approved,
        created_at: eng.created_at,
        substation_name: eng.substations?.name || "Unknown",
        email: eng.user_id.substring(0, 8) + "..."
      }))
    );

    setPendingEngineers(engineersWithDetails);
  };

  const fetchLightProblems = async () => {
    const { data: problems, error } = await (supabase as any)
      .from("light_problems")
      .select(`
        id,
        user_name,
        mobile,
        description,
        photo_url,
        status,
        created_at,
        substations (name),
        villages (name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching light problems:", error);
      return;
    }

    const mappedProblems = (problems || []).map((p: any) => ({
      id: p.id,
      user_name: p.user_name,
      mobile: p.mobile,
      description: p.description,
      photo_url: p.photo_url,
      status: p.status,
      created_at: p.created_at,
      substation_name: p.substations?.name || "Unknown",
      village_name: p.villages?.name || "Unknown"
    }));

    setLightProblems(mappedProblems);
  };

  const handleApprove = async (engineerId: string, userId: string) => {
    setProcessingId(engineerId);
    try {
      const { error: updateError } = await supabase
        .from("engineers")
        .update({ is_approved: true })
        .eq("id", engineerId);

      if (updateError) throw updateError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: "engineer" as any })
        .eq("user_id", userId);

      toast({
        title: "Engineer Approved!",
        description: "The engineer can now log in and manage schedules.",
      });

      fetchPendingEngineers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve engineer",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (engineerId: string, userId: string) => {
    setProcessingId(engineerId);
    try {
      const { error: deleteError } = await supabase
        .from("engineers")
        .delete()
        .eq("id", engineerId);

      if (deleteError) throw deleteError;

      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      toast({
        title: "Engineer Rejected",
        description: "The signup request has been rejected.",
      });

      fetchPendingEngineers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject engineer",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleProblemStatusUpdate = async (problemId: string, status: string) => {
    setProcessingId(problemId);
    try {
      const { error } = await (supabase as any)
        .from("light_problems")
        .update({ status })
        .eq("id", problemId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Report marked as ${status}.`,
      });

      fetchLightProblems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/approval/login");
  };

  const pendingEngineerCount = pendingEngineers.filter(e => !e.is_approved).length;
  const pendingProblemCount = lightProblems.filter(p => p.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Approval Authority Dashboard</h1>
                <p className="text-sm opacity-80">मंजूरी अधिकारी डॅशबोर्ड</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="flex flex-col sm:grid sm:w-full sm:grid-cols-2 max-w-[400px] h-auto sm:h-10 mx-auto bg-muted p-1">
            <TabsTrigger value="reports" className="w-full data-[state=active]:bg-destructive data-[state=active]:text-white transition-colors py-2 mb-1 sm:mb-0">
              <ShieldAlert className="w-4 h-4 mr-2" />
              Light Problems ({pendingProblemCount})
            </TabsTrigger>
            <TabsTrigger value="engineers" className="w-full data-[state=active]:bg-primary data-[state=active]:text-white transition-colors py-2">
              <User className="w-4 h-4 mr-2" />
              Engineers ({pendingEngineerCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <div className="govt-card">
              <div className="govt-card-header bg-destructive text-white flex items-center justify-between">
                <span>Light Problem Reports / वीज समस्या अहवाल</span>
              </div>

              <div className="p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                  </div>
                ) : lightProblems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-lg text-muted-foreground">No reports found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reporter / वार्ताहर</TableHead>
                          <TableHead>Location / ठिकाण</TableHead>
                          <TableHead>Description / वर्णन</TableHead>
                          <TableHead>Photo</TableHead>
                          <TableHead>Date / तारीख</TableHead>
                          <TableHead>Status / स्थिती</TableHead>
                          <TableHead className="text-right">Actions / कृती</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lightProblems.map((problem) => (
                          <TableRow key={problem.id}>
                            <TableCell>
                              <div className="font-medium">{problem.user_name}</div>
                              <div className="text-sm text-muted-foreground">{problem.mobile}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{problem.village_name}</div>
                              <div className="text-sm text-muted-foreground">{problem.substation_name}</div>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={problem.description}>
                              {problem.description}
                            </TableCell>
                            <TableCell>
                              {problem.photo_url ? (
                                <a href={problem.photo_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:underline">
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  View
                                </a>
                              ) : (
                                <span className="text-muted-foreground text-sm">N/a</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(problem.created_at).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell>
                              {problem.status === 'Verified' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                                  <Check className="h-3 w-3" /> Verified
                                </span>
                              ) : problem.status === 'Rejected' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-medium">
                                  <X className="h-3 w-3" /> Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                                  <Clock className="h-3 w-3" /> Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {problem.status === 'Pending' && (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => handleProblemStatusUpdate(problem.id, 'Verified')}
                                    disabled={processingId === problem.id}
                                    className="bg-success hover:bg-success/90"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Verify
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleProblemStatusUpdate(problem.id, 'Rejected')}
                                    disabled={processingId === problem.id}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engineers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="govt-card p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-warning/20 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Pending Approval</p>
                    <p className="text-3xl font-bold text-warning">{pendingEngineerCount}</p>
                  </div>
                </div>
              </div>

              <div className="govt-card p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-success/20 p-3 rounded-full">
                    <Check className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Approved Engineers</p>
                    <p className="text-3xl font-bold text-success">
                      {pendingEngineers.filter(e => e.is_approved).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="govt-card p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary/20 p-3 rounded-full">
                    <User className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Registrations</p>
                    <p className="text-3xl font-bold text-secondary">{pendingEngineers.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="govt-card">
              <div className="govt-card-header">
                Engineer Registration Requests / अभियंता नोंदणी विनंत्या
              </div>

              <div className="p-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                  </div>
                ) : pendingEngineers.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-lg text-muted-foreground">No engineer registrations yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name / नाव</TableHead>
                          <TableHead>Substation / सबस्टेशन</TableHead>
                          <TableHead>Status / स्थिती</TableHead>
                          <TableHead>Date / तारीख</TableHead>
                          <TableHead className="text-right">Actions / कृती</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingEngineers.map((engineer) => (
                          <TableRow key={engineer.id}>
                            <TableCell className="font-medium">{engineer.name}</TableCell>
                            <TableCell>{engineer.substation_name}</TableCell>
                            <TableCell>
                              {engineer.is_approved ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                                  <Check className="h-3 w-3" />
                                  Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                                  <Clock className="h-3 w-3" />
                                  Pending
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(engineer.created_at).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell className="text-right">
                              {!engineer.is_approved && (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(engineer.id, engineer.user_id)}
                                    disabled={processingId === engineer.id}
                                    className="bg-success hover:bg-success/90"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(engineer.id, engineer.user_id)}
                                    disabled={processingId === engineer.id}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Public Homepage
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ApprovalDashboard;

