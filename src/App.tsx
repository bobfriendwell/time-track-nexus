
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TimeEntryProvider } from "./contexts/TimeEntryContext";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import TimeEntry from "./pages/TimeEntry";
import TimeAnalysis from "./pages/TimeAnalysis";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <TimeEntryProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Entry Point */}
                <Route path="/" element={<Index />} />
                
                {/* Public Routes */}
                <Route element={<ProtectedRoute requireAuth={false} />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/time-entry" element={<TimeEntry />} />
                  <Route path="/analysis" element={<TimeAnalysis />} />
                </Route>
                
                {/* Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
                
                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TimeEntryProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
