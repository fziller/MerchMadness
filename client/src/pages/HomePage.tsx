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
  const [showModelFilters, setShowModelFilters] = useState(false);
  const [showShirtFilters, setShowShirtFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<'model' | 'shirt' | null>(null);
  
  const handleModelFilters = (filters: any) => {
    console.log('Applied model filters:', filters);
    // TODO: Implement filter logic
  };

  const handleShirtFilters = (filters: any) => {
    console.log('Applied shirt filters:', filters);
    // TODO: Implement filter logic
  };

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
        <h1 className="text-2xl font-bold">Impericon Image Combiner</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.username}</span>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left sidebar for filters */}
        {(showModelFilters || showShirtFilters) && (
          <aside className="w-80 border-r bg-card p-4 overflow-y-auto">
            <div className="space-y-6">
              {showModelFilters && (
                <FilterPanel 
                  title="Model Filters"
                  onApplyFilters={handleModelFilters}
                  onClose={() => setShowModelFilters(false)}
                  filterConfig={{
                    booleanFilter: { label: "Available", key: "available" },
                    multiSelect: { 
                      label: "Gender",
                      options: ["Male", "Female"],
                      key: "gender"
                    },
                    slider: {
                      label: "Height",
                      min: 150,
                      max: 200,
                      key: "height"
                    }
                  }}
                />
              )}
              {showShirtFilters && (
                <FilterPanel
                  title="Shirt Filters"
                  onApplyFilters={handleShirtFilters}
                  onClose={() => setShowShirtFilters(false)}
                  filterConfig={{
                    booleanFilter: { label: "In Stock", key: "inStock" },
                    multiSelect: { 
                      label: "Size",
                      options: ["XS", "S", "M", "L", "XL"],
                      key: "size"
                    },
                    slider: {
                      label: "Price",
                      min: 0,
                      max: 100,
                      key: "price"
                    }
                  }}
                />
              )}
            </div>
          </aside>
        )}

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

        {/* Right side menu */}
        <aside className="w-64 border-l bg-card p-4">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Actions</h2>
            <div className="space-y-2">
              {user?.isAdmin && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowUploadModal('model')}
                  >
                    Upload Model
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowUploadModal('shirt')}
                  >
                    Upload Shirt
                  </Button>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Upload Modals */}
      {showUploadModal && (
        <UploadModal
          type={showUploadModal}
          onClose={() => setShowUploadModal(null)}
        />
      )}
    </div>
  );
}
