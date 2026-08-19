import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreShell } from "@/components/StoreShell";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import React, { useEffect } from "react";
import { consumeOAuthReturnRoute, getPendingOAuthReturnRoute } from "@/lib/oauthReturn";
import { supabase } from "@/lib/supabase";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StoreProvider } from "./contexts/StoreContext";
import CategoryPage from "./pages/CategoryPage";
import AdminPage from "./pages/AdminPage";
import CheckoutPage from "./pages/CheckoutPage";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import SearchPage from "./pages/SearchPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function OAuthReturnHandler() {
  useEffect(() => {
    if (!supabase || !getPendingOAuthReturnRoute()) return;
    let active = true;

    const restoreDestination = () => {
      if (!active) return;
      const target = consumeOAuthReturnRoute();
      if (target) window.location.hash = `#${target}`;
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) restoreDestination();
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) restoreDestination();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}

function StoreRoutes() {
  return (
    <WouterRouter hook={useHashLocation}>
      <OAuthReturnHandler />
      <ScrollToTop />
    <Switch>
      <Route path={"/admin"} component={AdminPage} />
      <StoreShell>
        <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/categoria/:slug"} component={CategoryPage} />
        <Route path={"/produto/:slug"} component={ProductPage} />
        <Route path={"/buscar"} component={SearchPage} />
        <Route path={"/checkout"} component={CheckoutPage} />
        <Route path={"/perfil"} component={CustomerProfilePage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
        </Switch>
      </StoreShell>
    </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <StoreProvider>
            <Toaster />
            <StoreRoutes />
          </StoreProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
