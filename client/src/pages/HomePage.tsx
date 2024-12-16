import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import ModelSelection from "@/components/ModelSelection";
import ShirtSelection from "@/components/ShirtSelection";
import ResultsArea from "@/components/ResultsArea";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedShirt, setSelectedShirt] = useState(null);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (!result.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Image Combiner</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.username}</span>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <ModelSelection
              onSelect={setSelectedModel}
              selected={selectedModel}
            />
          </div>
          <div className="md:col-span-3">
            <ShirtSelection
              onSelect={setSelectedShirt}
              selected={selectedShirt}
            />
          </div>
          <div className="md:col-span-6">
            <ResultsArea
              model={selectedModel}
              shirt={selectedShirt}
            />
          </div>
        </div>

        {user?.isAdmin && (
          <div className="mt-8">
            <AdminPanel />
          </div>
        )}
      </main>
    </div>
  );
}
