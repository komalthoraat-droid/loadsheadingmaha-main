import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import EngineerLogin from "./pages/EngineerLogin";
import EngineerSignup from "./pages/EngineerSignup";
import EngineerDashboard from "./pages/EngineerDashboard";
import ApprovalAuthorityLogin from "./pages/ApprovalAuthorityLogin";
import ApprovalDashboard from "./pages/ApprovalDashboard";
import AdminSetup from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";
import ReportIssue from "./pages/ReportIssue";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/engineer/login" element={<EngineerLogin />} />
            <Route path="/engineer/signup" element={<EngineerSignup />} />
            <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
            <Route path="/approval/login" element={<ApprovalAuthorityLogin />} />
            <Route path="/approval/dashboard" element={<ApprovalDashboard />} />
            <Route path="/admin-setup-x7k9" element={<AdminSetup />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
