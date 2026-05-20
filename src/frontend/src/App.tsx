import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useAuth } from "./hooks/useAuth";
import { BatchDetailPage } from "./pages/BatchDetailPage";
import { BatchesPage } from "./pages/BatchesPage";
import { CertificatePage } from "./pages/CertificatePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { NewBatchPage } from "./pages/NewBatchPage";
import { TemplateBuilderPage } from "./pages/TemplateBuilderPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { VerifyPage } from "./pages/VerifyPage";
import { AuthLoginPage } from "./pages/AuthLoginPage";
import { AuthSignupPage } from "./pages/AuthSignupPage";

// ─── Auth Guard ────────────────────────────────────────────────────────────

function AuthGuardLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  const showProfileSetup = false;

  if (isLoading) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="rounded-2xl border border-border bg-card p-10 max-w-sm w-full shadow-card">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">
            Sign in required
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to access the dashboard and manage your certificates.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Go to login
            </Link>
            <Link
              to="/signup"
              className="w-full h-10 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <Outlet />
    </>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster richColors />
    </div>
  );
}

// ─── Routes ────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: AuthLoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: AuthSignupPage,
});

// Auth-protected layout route
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthGuardLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const templatesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/templates",
  component: TemplatesPage,
});

const templateNewRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/templates/new",
  component: () => <TemplateBuilderPage mode="create" />,
});

const templateEditRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/templates/$templateId/edit",
  component: () => {
    const { templateId } = templateEditRoute.useParams();
    return <TemplateBuilderPage mode="edit" templateId={templateId} />;
  },
});

const batchesRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/batches",
  component: BatchesPage,
});

const batchNewRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/batches/new",
  component: NewBatchPage,
});

const batchDetailRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/batches/$batchId",
  component: BatchDetailPage,
});

// Public routes
const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify",
  validateSearch: (search: Record<string, unknown>) => ({
    code: (search.code as string) ?? "",
  }),
  component: VerifyPage,
});

const certRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cert/$certId",
  component: CertificatePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  authRoute.addChildren([
    dashboardRoute,
    templatesRoute,
    templateNewRoute,
    templateEditRoute,
    batchesRoute,
    batchNewRoute,
    batchDetailRoute,
  ]),
  verifyRoute,
  certRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
