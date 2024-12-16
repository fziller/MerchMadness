import { Switch, Route, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";

function App() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!user && location !== "/auth") {
    setLocation("/auth");
    return null;
  }

  // Redirect to home if logged in and trying to access auth page
  if (user && location === "/auth") {
    setLocation("/");
    return null;
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route>
        {/* 404 fallback */}
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
            <p className="text-muted-foreground">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
