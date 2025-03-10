import {
  ModelEvent,
  ModelGender,
  ModelGenre,
  ShirtMotiv,
  TagModelHeight,
  TagModelWidth,
  TagShirtBrand,
  TagShirtColor,
  TagShirtSize,
} from "@/components/filter/FilterEnums";
import FilterPanel from "@/components/FilterPanel";
import ModelSelection from "@/components/ModelSelection";
import ResultsArea from "@/components/ResultsArea";
import ShirtSelection from "@/components/ShirtSelection";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/UploadModal";
import UserManagementModal from "@/components/UserManagementModal";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ModelActionType, useModelFilter } from "@/hooks/useModelFilter";
import { ShirtActionType, useShirtFilter } from "@/hooks/useShirtFilter";
import type { Model, Shirt } from "@db/schema";
import { useState } from "react";

export default function HomePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [selectedShirts, setSelectedShirts] = useState<Shirt[] | null>(null);
  const [showModelFilters, setShowModelFilters] = useState(false);
  const [showShirtFilters, setShowShirtFilters] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<
    "model" | "shirt" | null
  >(null);

  const { state: shirtState, dispatch: shirtDispatch } = useShirtFilter();
  const { state: modelState, dispatch: modelDispatch } = useModelFilter();

  const toggleModelFilters = () => {
    setShowModelFilters((prev) => !prev);
    setShowShirtFilters(false); // Close other filter panel
  };

  const toggleShirtFilters = () => {
    setShowShirtFilters((prev) => !prev);
    setShowModelFilters(false); // Close other filter panel
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
                  onResetFilters={() =>
                    modelDispatch({ type: ModelActionType.RESET, payload: "" })
                  }
                  title="Model Filters"
                  onClose={() => setShowModelFilters(false)}
                  multiFilterConfig={{
                    singleSelect: [
                      {
                        label: "Gender",
                        options: Object.values(ModelGender),
                        key: "gender",
                        onSelectOption: (option) =>
                          modelDispatch({
                            type: ModelActionType.SET_GENDER,
                            payload: option,
                          }),
                        selectedOption: modelState.gender,
                      },
                    ],
                    multiSelect: [
                      {
                        label: "Genre",
                        options: Object.values(ModelGenre),
                        key: "genre",
                        selectedOptions: modelState.genre,
                        onSelectOption: (option) =>
                          modelDispatch({
                            type: ModelActionType.SET_GENRE,
                            payload: option,
                          }),
                      },
                      {
                        label: "Event",
                        options: Object.values(ModelEvent),
                        key: "event",
                        selectedOptions: modelState.genre,
                        onSelectOption: (option) =>
                          modelDispatch({
                            type: ModelActionType.SET_EVENT,
                            payload: option,
                          }),
                      },
                    ],
                    rangeSlider: [
                      {
                        ...TagModelHeight,
                        startValue: TagModelHeight.min,
                        selectedValue: modelState.height,
                        onValueChange: (value) =>
                          modelDispatch({
                            type: ModelActionType.SET_HEIGHT,
                            payload: value ?? TagModelHeight.min,
                          }),
                      },
                      {
                        ...TagModelWidth,
                        startValue: TagModelWidth.min,
                        selectedValue: modelState.width,
                        onValueChange: (value) =>
                          modelDispatch({
                            type: ModelActionType.SET_WIDTH,
                            payload: value ?? TagModelWidth.min,
                          }),
                      },
                    ],
                  }}
                />
              )}
              {showShirtFilters && (
                <FilterPanel
                  title="Shirt Filters"
                  // onApplyFilters={() => handleShirtFilters()}
                  onClose={() => setShowShirtFilters(false)}
                  onResetFilters={() =>
                    shirtDispatch({
                      type: ShirtActionType.RESET,
                      payload: "",
                    })
                  }
                  multiFilterConfig={{
                    multiSelect: [
                      {
                        ...TagShirtSize,
                        label: TagShirtSize.label,
                        key: TagShirtSize.key,
                        selectedOptions: shirtState.size,
                        onSelectOption: (option) =>
                          shirtDispatch({
                            type: ShirtActionType.SET_SIZE,
                            payload: option,
                          }),
                      },
                      {
                        ...TagShirtColor,
                        label: TagShirtColor.label,
                        key: TagShirtColor.key,
                        selectedOptions: shirtState.color,
                        onSelectOption: (option) =>
                          shirtDispatch({
                            type: ShirtActionType.SET_COLOR,
                            payload: option,
                          }),
                      },
                    ],
                    dropdown: [
                      {
                        ...TagShirtBrand,
                        label: TagShirtBrand.label,
                        key: TagShirtBrand.key,
                        selectedOption: shirtState.brand,
                        onSelectOption: (option) => {
                          shirtDispatch({
                            type: ShirtActionType.SET_BRAND,
                            payload: option,
                          });
                        },
                      },
                    ],
                    singleSelect: [
                      {
                        label: "Motiv",
                        options: Object.values(ShirtMotiv),
                        key: "motiv",
                        onSelectOption: (option) =>
                          shirtDispatch({
                            type: ShirtActionType.SET_MOTIV,
                            payload: option,
                          }),
                        selectedOption: shirtState.motiv,
                      },
                    ],
                  }}
                />
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 max-w-4xxl mx-auto">
            <ModelSelection
              onToggleFilters={toggleModelFilters}
              modelFilters={modelState}
              onSelectedModelsChange={(models) => setSelectedModels(models)}
              onRemoveFilterFromSelection={(metadata) => {
                modelDispatch({
                  type: ModelActionType.ALL,
                  payload: metadata,
                });
              }}
            />
            <ShirtSelection
              onToggleFilters={toggleShirtFilters}
              shirtFilter={shirtState}
              onSelectedShirtsChange={(shirts) => setSelectedShirts(shirts)}
              onRemoveFilterFromSelection={(metadata) => {
                shirtDispatch({
                  type: ShirtActionType.SET_BRAND,
                  payload: (metadata.brand as string) ?? "",
                });

                shirtDispatch({
                  type: ShirtActionType.SET_COLOR,
                  payload: (metadata.color as string[]) ?? [],
                });

                shirtDispatch({
                  type: ShirtActionType.SET_SIZE,
                  payload: (metadata.brand as string[]) ?? [],
                });
              }}
            />
            <ResultsArea models={selectedModels} shirts={selectedShirts} />
          </div>
        </main>
        {/* Right side menu */}
        {(user?.isAdmin || user?.username === "admin") && (
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
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowUserManagementModal(true)}
                  >
                    User Management
                  </Button>
                </>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Upload Modals */}
      {showUploadModal && (
        <UploadModal
          type={showUploadModal}
          onClose={() => setShowUploadModal(null)}
        />
      )}
      {showUserManagementModal && (
        <UserManagementModal
          onClose={() => setShowUserManagementModal(false)}
        />
      )}
    </div>
  );
}
