import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { useGlobalRealtimeSubscriptions } from "@/hooks/useRealtimeSubscriptions";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Campaigns from "./pages/Campaigns";
import Contacts from "./pages/Contacts";
import Search from "./pages/Search";
import GlobalInbox from "./pages/GlobalInbox";
import Templates from "./pages/Templates";
import Requests from "./pages/Requests";
import Placeholders from "./pages/Placeholders";
import Members from "./pages/Members";
import Roles from "./pages/Roles";
import WorkspaceSettings from "./pages/WorkspaceSettings";
import ProfileSettings from "./pages/ProfileSettings";
import CampaignDetail from "./pages/CampaignDetail";
import Agent from "./pages/Agent";
import Automation from "./pages/Automation";
import Reports from "./pages/Reports";
import CampaignHub from "./pages/CampaignHub";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  // Commented out real-time subscriptions for now
  // useGlobalRealtimeSubscriptions();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* All Routes - No Authentication */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/hub" element={<CampaignHub />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/search" element={<Search />} />
              <Route path="/inbox" element={<GlobalInbox />} />
              <Route path="/message-queue" element={<GlobalInbox />} />
              <Route path="/global-inbox" element={<GlobalInbox />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/placeholders" element={<Placeholders />} />
              <Route path="/company-profile" element={<Members />} />
              <Route path="/members" element={<Members />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/workspace-settings" element={<WorkspaceSettings />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
