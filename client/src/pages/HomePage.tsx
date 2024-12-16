import { useState } from "react";
import type { Model, Shirt } from "@db/schema";
import { useUser } from "@/hooks/use-user";
import ModelSelection from "@/components/ModelSelection";
import ShirtSelection from "@/components/ShirtSelection";
import ResultsArea from "@/components/ResultsArea";
import AdminPanel from "@/components/AdminPanel";
import FilterPanel from "@/components/FilterPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedShirt, setSelectedShirt] = useState<Shirt | null>(null);

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

      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-80 border-r bg-card p-4 overflow-y-auto">
          <div className="space-y-6">
            <FilterPanel onApplyFilters={(filters) => {
              console.log('Applied filters:', filters);
              // TODO: Implement filter logic
            }} />
            {user?.isAdmin && <AdminPanel />}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            <ModelSelection
              onSelect={setSelectedModel}
              selected={selectedModel}
            />
            <ShirtSelection
              onSelect={setSelectedShirt}
              selected={selectedShirt}
            />
            <ResultsArea
              model={selectedModel}
              shirt={selectedShirt}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
