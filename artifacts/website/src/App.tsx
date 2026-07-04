import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "@/context/AdminContext";
import { PrayerProvider } from "@/context/PrayerContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Media from "@/pages/media";
import About from "@/pages/about";
import Give from "@/pages/give";
import Contact from "@/pages/contact";
import Events from "@/pages/events";
import Prayer from "@/pages/prayer";
import Resources from "@/pages/resources";
import Admin from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/media" component={Media} />
      <Route path="/events" component={Events} />
      <Route path="/prayer" component={Prayer} />
      <Route path="/resources" component={Resources} />
      <Route path="/about" component={About} />
      <Route path="/give" component={Give} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <PrayerProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </PrayerProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;
