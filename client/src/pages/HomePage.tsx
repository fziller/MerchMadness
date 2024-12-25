import {
  ModelEvent,
  ModelGender,
  ModelGenre,
  TagModelHeight,
  TagModelWidth,
} from "@/components/filter/FilterEnums";
import FilterPanel from "@/components/FilterPanel";
import ModelSelection from "@/components/ModelSelection";
import ResultsArea from "@/components/ResultsArea";
import ShirtSelection from "@/components/ShirtSelection";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/UploadModal";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { Model, Shirt } from "@db/schema";
import { useState } from "react";

export default function HomePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedShirt, setSelectedShirt] = useState<Shirt | null>(null);
  const [showModelFilters, setShowModelFilters] = useState(false);
  const [showShirtFilters, setShowShirtFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<
    "model" | "shirt" | null
  >(null);
  const [modelFilters, setModelFilters] = useState<any>(null);
  const [shirtFilters, setShirtFilters] = useState<any>(null);

  const [modelGenre, setModelGenre] = useState<ModelGenre[]>([]);
  const [modelEvent, setModelEvent] = useState<ModelEvent[]>([]);
  const [modelGender, setModelGender] = useState<ModelGender>(ModelGender.MALE);
  const [heightFilter, setHeightFilter] = useState<number>(100);
  const [widthFilter, setWidthFilter] = useState<number>(50);

  const handleModelFilters = () => {
    setModelFilters({
      gender: modelGender,
      height: heightFilter,
      width: widthFilter,
      genre: modelGenre,
      event: modelEvent,
    });
  };

  const handleShirtFilters = () => {
    setShirtFilters({});
  };

  const toggleModelFilters = () => {
    setShowModelFilters((prev) => !prev);
    setShowShirtFilters(false); // Close other filter panel
  };

  const toggleShirtFilters = () => {
    setShowShirtFilters((prev) => !prev);
    setShowModelFilters(false); // Close other filter panel
  };

  const handleModelSelection = (model: Model | null) => {
    setSelectedModel(model);
    if (model) {
      alert(
        `Selected model with filters: ${JSON.stringify(modelFilters || {})}`
      );
    }
  };

  const handleShirtSelection = (shirt: Shirt | null) => {
    setSelectedShirt(shirt);
    if (shirt) {
      alert(
        `Selected shirt with filters: ${JSON.stringify(shirtFilters || {})}`
      );
    }
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
                  onApplyFilters={handleModelFilters}
                  title="Model Filters"
                  onClose={() => setShowModelFilters(false)}
                  multiFilterConfig={{
                    singleSelect: [
                      {
                        label: "Gender",
                        options: Object.values(ModelGender),
                        key: "gender",
                        onSelectOption: (option) => setModelGender(option),
                        selectedOption: modelGender,
                      },
                    ],
                    multiSelect: [
                      {
                        label: "Genre",
                        options: Object.values(ModelGenre),
                        key: "genre",
                        selectedOptions: modelGenre,
                        onSelectOption: (option) => setModelGenre(option),
                      },
                      {
                        label: "Event",
                        options: Object.values(ModelEvent),
                        key: "event",
                        selectedOptions: modelEvent,
                        onSelectOption: (option) => setModelEvent(option),
                      },
                    ],
                    rangeSlider: [
                      {
                        ...TagModelHeight,
                        startValue: heightFilter,
                        onValueChange: (value) => setHeightFilter(value),
                      },

                      {
                        ...TagModelWidth,
                        startValue: widthFilter,
                        onValueChange: (value) => setWidthFilter(value),
                      },
                    ],
                  }}
                />
              )}
              {showShirtFilters && (
                <FilterPanel
                  title="Shirt Filters"
                  onApplyFilters={handleShirtFilters}
                  onClose={() => setShowShirtFilters(false)}
                />
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            <ModelSelection
              onSelect={handleModelSelection}
              selected={selectedModel}
              onToggleFilters={toggleModelFilters}
              modelFilters={modelFilters}
            />
            <ShirtSelection
              onSelect={handleShirtSelection}
              selected={selectedShirt}
              onToggleFilters={toggleShirtFilters}
            />
            <ResultsArea model={selectedModel} shirt={selectedShirt} />
          </div>
        </main>

        {/* Right side menu */}
        <aside className="w-64 border-l bg-card p-4">
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Actions</h2>
            <div className="space-y-2">
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowUploadModal("model")}
                >
                  Upload Model
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowUploadModal("shirt")}
                >
                  Upload Shirt
                </Button>
                {user?.isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => console.log("Admin panel")}
                  >
                    User Management
                  </Button>
                )}
              </>
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
