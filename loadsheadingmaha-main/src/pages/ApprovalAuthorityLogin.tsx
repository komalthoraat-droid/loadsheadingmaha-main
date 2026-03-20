import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";



const ApprovalAuthorityLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is approval admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .limit(1);

        if (roleData && roleData.length > 0) {
          navigate("/approval/dashboard");
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Check if user has approval_admin role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .limit(1);

      if (roleError || !roleData || roleData.length === 0) {
        await supabase.auth.signOut();
        throw new Error("You are not authorized as Approval Authority");
      }

      toast({
        title: "Login Successful",
        description: "Welcome, Approval Authority!",
      });

      navigate("/approval/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-sm hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="govt-card">
            <div className="govt-card-header flex items-center justify-center gap-3 bg-primary">
              <Shield className="h-6 w-6" />
              Approval Authority Login
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-6">
              <div className="bg-accent/50 p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground">
                  This login is reserved for the Super Approval Authority only.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ही लॉगिन फक्त मंजूरी अधिकाऱ्यांसाठी आहे.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">
                  Email / ईमेल
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="authority@example.com"
                  required
                  className="dropdown-large"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg">
                  Password / पासवर्ड
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="dropdown-large"
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-large bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                <LogIn className="h-5 w-5 mr-2" />
                {isLoading ? "Logging in..." : "Authority Login / अधिकारी लॉगिन"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApprovalAuthorityLogin;
