import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import JobsList from "./pages/JobsList";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import SetPassword from "./pages/auth/SetPassword";
import CreateUser from "./pages/CreateUser";
import JobSeekerDashboard from "./pages/dashboard/JobSeekerDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import JobSeekerSettings from "./pages/settings/JobSeekerSettings";
import Profile from "./pages/Profile";
import PostJob from "./pages/PostJob";
import NotFound from "./pages/NotFound";
import FirebaseLogin from "./pages/auth/FirebaseLogin";
import SmartResumeAI from "./pages/SmartResumeAI";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/create-user" element={<Layout><CreateUser /></Layout>} />
            <Route path="/google-jobs" element={<Layout><JobsList /></Layout>} />
            <Route path="/google-jobs/:id" element={<Layout><JobDetails /></Layout>} />
            <Route path="/dashboard" element={<Layout><JobSeekerDashboard /></Layout>} />
            <Route path="/employer-dashboard" element={<Layout><EmployerDashboard /></Layout>} />
            <Route path="/admin-dashboard" element={<Layout><AdminDashboard /></Layout>} />
            <Route path="/settings" element={<Layout><JobSeekerSettings /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/post-job" element={<Layout><PostJob /></Layout>} />
            <Route path="/firebase-login" element={<FirebaseLogin />} />
            <Route path="/smart-resume-ai" element={<Layout><SmartResumeAI /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
