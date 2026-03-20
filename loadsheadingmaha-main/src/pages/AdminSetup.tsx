import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus } from "lucide-react";

const ADMIN_EMAIL = "thoratatharva257@gmail.com";

const AdminSetup = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if admin already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password,
      });

      if (existingUser.user) {
        // User exists, check if role is set
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", existingUser.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          toast({
            title: "Admin Already Configured",
            description: "Super Admin account is already set up!",
          });
          await supabase.auth.signOut();
          navigate("/approval/login");
          return;
        }

        // Add admin role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: existingUser.user.id,
            role: "admin",
          });

        if (roleError) throw roleError;

        toast({
          title: "Admin Role Added",
          description: "Super Admin role has been assigned!",
        });
        await supabase.auth.signOut();
        navigate("/approval/login");
        return;
      }
    } catch {
      // User doesn't exist, create new
    }

    try {
      // Create new admin user
      const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Add approval_admin role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "admin",
          });

        if (roleError) throw roleError;

        toast({
          title: "Super Admin Created!",
          description: `Account created for ${ADMIN_EMAIL}. You can now login.`,
        });

        await supabase.auth.signOut();
        navigate("/approval/login");
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="govt-card">
          <div className="govt-card-header flex items-center justify-center gap-3 bg-destructive">
            <Shield className="h-6 w-6" />
            One-Time Admin Setup
          </div>

          <form onSubmit={handleSetup} className="p-6 space-y-6">
            <div className="bg-destructive/10 p-4 rounded-xl text-center border border-destructive/30">
              <p className="text-sm font-medium text-destructive">
                ⚠️ This page creates the Super Admin account.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Delete this route after setup is complete.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-lg">Admin Email</Label>
              <Input
                value={ADMIN_EMAIL}
                disabled
                className="dropdown-large bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg">
                Set Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 chars)"
                required
                className="dropdown-large"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lg">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="dropdown-large"
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-large bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              {isLoading ? "Setting up..." : "Create Super Admin Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
