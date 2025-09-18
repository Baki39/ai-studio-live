import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { NavHeader } from "@/components/layout/nav-header";
import { AvatarProvider } from "@/contexts/AvatarContext";
import Index from "./pages/Index";
import CreateAvatar from "./pages/CreateAvatar";
import PodcastLive from "./pages/PodcastLive";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <AvatarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NavHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create-avatar" element={<CreateAvatar />} />
              <Route path="/podcast-live" element={<PodcastLive />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AvatarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
