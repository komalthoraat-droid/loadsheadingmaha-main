import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, LogIn, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const EngineerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/engineer/dashboard");
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

      // Check if user is an engineer
      const { data: engineer, error: engineerError } = await supabase
        .from("engineers")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (engineerError || !engineer) {
        await supabase.auth.signOut();
        throw new Error("You are not registered as an engineer");
      }

      // Check if engineer is approved
      if (!engineer.is_approved) {
        await supabase.auth.signOut();
        throw new Error("Your account is pending approval from the Approval Authority. Please wait for approval.");
      }

      toast({
        title: "Login Successful",
        description: `Welcome, ${engineer.name}!`,
      });

      navigate("/engineer/dashboard");
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
            <div className="govt-card-header flex items-center justify-center gap-3">
              <Zap className="h-6 w-6" />
              Engineer Login / अभियंता लॉगिन
            </div>
            
            <form onSubmit={handleLogin} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">
                  Email / ईमेल
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@example.com"
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
                {isLoading ? "Logging in..." : "Login / लॉगिन"}
              </Button>
            </form>
          </div>

          <p className="text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/engineer/signup" className="text-primary font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default EngineerLogin;
