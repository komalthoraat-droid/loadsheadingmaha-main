import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap, UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

interface Substation {
  id: string;
  name: string;
}

const EngineerSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [substationId, setSubstationId] = useState("");
  const [substations, setSubstations] = useState<Substation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password || !substationId) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // 2. Create engineer profile with is_approved = false
      const { error: engineerError } = await supabase
        .from("engineers")
        .insert({
          user_id: authData.user.id,
          name: name.trim(),
          assigned_substation_id: substationId,
          is_approved: false, // Requires approval from authority
        });

      if (engineerError) throw engineerError;

      // 3. Create user role as pending_engineer
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          role: "pending_engineer" as any,
        });

      if (roleError) {
        console.log("Role creation note:", roleError);
      }

      toast({
        title: "Account Created!",
        description: "Your account is pending approval from the Approval Authority. You will be able to log in once approved.",
      });

      navigate("/engineer/login");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account",
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

      {/* Signup Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="govt-card">
            <div className="govt-card-header flex items-center justify-center gap-3">
              <Zap className="h-6 w-6" />
              Engineer Signup / अभियंता नोंदणी
            </div>
            
            <form onSubmit={handleSignup} className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg">
                  Full Name / पूर्ण नाव
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="dropdown-large"
                />
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
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="dropdown-large"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-lg">
                  Assigned Substation / नियुक्त सबस्टेशन
                </Label>
                <Select value={substationId} onValueChange={setSubstationId}>
                  <SelectTrigger className="dropdown-large">
                    <SelectValue placeholder="-- Select Substation --" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 border-border z-50">
                    {substations.map((substation) => (
                      <SelectItem 
                        key={substation.id} 
                        value={substation.id}
                        className="text-lg py-3"
                      >
                        {substation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-large bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {isLoading ? "Creating Account..." : "Create Account / खाते तयार करा"}
              </Button>
            </form>
          </div>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/engineer/login" className="text-primary font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default EngineerSignup;
