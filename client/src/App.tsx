import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreShell } from "@/components/StoreShell";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import React, { useEffect, useState } from "react";
import { consumeOAuthReturnRoute, getPendingOAuthReturnRoute, hasOAuthCallbackResponse } from "@/lib/oauthReturn";
import { normalizeHashRoute } from "@/lib/searchRouting";
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
import CustomerOrdersPage from "./pages/CustomerOrdersPage";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function useSearchAwareHashLocation() {
  const [location, navigate] = useHashLocation();
  return [normalizeHashRoute(location), navigate] as [string, typeof navigate];
}

function OAuthReturnGuard({ children }: { children: React.ReactNode }) {
  const [isHandlingReturn, setIsHandlingReturn] = useState(
    () => Boolean(supabase && (getPendingOAuthReturnRoute() || hasOAuthCallbackResponse())),
  );

  useEffect(() => {
    const supabaseClient = supabase;
    if (!supabaseClient || (!getPendingOAuthReturnRoute() && !hasOAuthCallbackResponse())) {
      setIsHandlingReturn(false);
      return;
    }

    let active = true;
    let fallbackTimer: number | undefined;

    const restoreDestination = async (session: { user?: { id?: string } } | null) => {
      if (!active || isRestoring) return;
      isRestoring = true;
      // Se a query de destino se perder no redirecionamento, o fragmento ainda
      // é um callback válido. Clientes voltam ao perfil e administradores são
      // identificados logo em seguida pela consulta de papel.
      let destination = consumeOAuthReturnRoute() ?? "/perfil";
      if (session?.user?.id) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          destination = "/admin";
        }
      }

      if (!active) return;
      window.location.hash = `#${destination}`;
      window.requestAnimationFrame(() => {
        if (active) setIsHandlingReturn(false);
      });
    };

    let isRestoring = false;

    void supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) void restoreDestination(data.session);
    });

    const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (session) void restoreDestination(session);
    });

    fallbackTimer = window.setTimeout(() => {
      if (!active) return;
      consumeOAuthReturnRoute();
      window.location.hash = "#/";
      setIsHandlingReturn(false);
    }, 8000);

    return () => {
      active = false;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      data.subscription.unsubscribe();
    };
  }, []);

  if (!isHandlingReturn) return <>{children}</>;

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#08090c] px-6 text-center text-white"
      aria-live="polite"
    >
      <section className="max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-10 shadow-2xl">
        <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-emerald-300/25 border-t-emerald-300" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">IAGO MODAS</p>
        <h1 className="mt-3 text-xl font-semibold">Concluindo seu login</h1>
        <p className="mt-2 text-sm leading-6 text-white/65">Aguarde um instante enquanto abrimos sua conta com segurança.</p>
      </section>
    </main>
  );
}

function StoreRoutes() {
  return (
    <WouterRouter hook={useSearchAwareHashLocation}>
      <OAuthReturnGuard>
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
              <Route path={"/sacola"} component={CheckoutPage} />
              <Route path={"/finalizar-pedido"} component={CheckoutPage} />
              <Route path={"/perfil"} component={CustomerProfilePage} />
              <Route path={"/pedidos"} component={CustomerOrdersPage} />
              <Route path={"/404"} component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </StoreShell>
        </Switch>
      </OAuthReturnGuard>
    </WouterRouter>
  );
}

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
