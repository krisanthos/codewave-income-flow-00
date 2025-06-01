
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// ✌️ Pages import with style 🥀
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Privacy from "./pages/Privacy";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import UserDetail from "./pages/UserDetail";
import Profile from "./pages/Profile"; // ✌️ New profile page 💔
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ✌️ App component with all the magic ❤️‍🩹
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} /> {/* ✌️ Profile route 🥀 */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin-auth" element={<AdminAuth />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-user/:id" element={<UserDetail />} />
            {/* ✌️ ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE 💔 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
