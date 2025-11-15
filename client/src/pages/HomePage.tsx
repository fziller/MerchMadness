import {
  ShirtMotiv,
  TagShirtBrand,
  TagShirtColor,
  TagShirtSize,
} from "@/components/filter/FilterEnums";
import FilterPanel from "@/components/FilterPanel";
import LogModal from "@/components/LogModal";
import ModelSelection from "@/components/ModelSelection";
import ModelSelectionFilterPanel from "@/components/ModelSelectionFilterPanel";
import ModelUploadModal from "@/components/ModelUploadModal";
import { Button } from "@/components/ui/button";
import UserManagementModal from "@/components/UserManagementModal";
import { ModelFilterProvider } from "@/context/ModelFilterContext";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ShirtActionType, useShirtFilter } from "@/hooks/useShirtFilter";
import type { Model } from "@db/schema";
import { useState } from "react";

export default function HomePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [showModelFilters, setShowModelFilters] = useState(true);
  const [showShirtFilters, setShowShirtFilters] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showModelLogs, setShowModelLogs] = useState(false);
  const [showMergeLogs, setShowMergeLogs] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState<
    "model" | "shirt" | null
  >(null);

  const { state: shirtState, dispatch: shirtDispatch } = useShirtFilter();

  const toggleModelFilters = () => {
    setShowModelFilters((prev) => !prev);
    setShowShirtFilters(false); // Close other filter panel
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
    <ModelFilterProvider>
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
                  <ModelSelectionFilterPanel
                    onClose={() => setShowModelFilters(false)}
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
                onSelectedModelsChange={(models) => setSelectedModels(models)}
              />
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
                      onClick={() => setShowUserManagementModal(true)}
                    >
                      User Management
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowModelLogs(true)}
                    >
                      Logs - Model import
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowMergeLogs(true)}
                    >
                      Logs - Image merge
                    </Button>
                  </>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Upload Modals */}
        {showUploadModal === "model" && (
          <ModelUploadModal onClose={() => setShowUploadModal(null)} />
        )}
        {showUserManagementModal && (
          <UserManagementModal
            onClose={() => setShowUserManagementModal(false)}
          />
        )}
        {showModelLogs && (
          <LogModal type={"model"} onClose={() => setShowModelLogs(false)} />
        )}
        {showMergeLogs && (
          <LogModal type={"merge"} onClose={() => setShowMergeLogs(false)} />
        )}
      </div>
    </ModelFilterProvider>
  );
}
