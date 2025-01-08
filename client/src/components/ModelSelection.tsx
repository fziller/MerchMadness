import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { filterByType } from "@/lib/utils";
import type { Model } from "@db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ActiveFilters from "./ActiveFilters";
import ImageViewModal from "./ImageViewModal";
import { MetaData } from "./filter/FilterEnums";

type ModelSelectionProps = {
  onToggleFilters: () => void;
  modelFilters?: MetaData;
  onSelectedModelsChange: (selectedModels: Model[]) => void;
  onRemoveFilterFromSelection: (metadata: MetaData) => void;
};

export default function ModelSelection({
  onToggleFilters,
  modelFilters,
  onSelectedModelsChange,
  onRemoveFilterFromSelection,
}: ModelSelectionProps) {
  const [selectedImage, setSelectedImage] = useState<Model | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [changeFilterValue, setChangeFilterValue] = useState(false);

  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  const [filteredModels, setFilteredModels] = useState<Model[]>(models || []);
  const [selectedModels, setSelectedModels] = useState<string[]>([]); // Stores the ids of the selected models

  console.log("selectedModels", selectedModels);

  // Effect to show the updated list of models in the modelselection as well as changing the selected models.
  useEffect(() => {
    const modelsAfterChange = models
      ? !modelFilters
        ? models
        : models.filter((model) => filterByType(modelFilters, model))
      : [];
    setFilteredModels(modelsAfterChange);
    // If we have models selected, we only want to use the selected ones.
    if (selectedModels.length > 0) {
      onSelectedModelsChange(
        modelsAfterChange.filter((model) =>
          selectedModels.includes(model.imageUrl)
        )
      );
      // If no model is selected, we assume to take every model we see.
    } else {
      onSelectedModelsChange(modelsAfterChange);
    }
  }, [models, modelFilters, changeFilterValue, selectedModels]);

  const deleteMutation = useMutation({
    mutationFn: async (modelId: number) => {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() =>
              selectedModels.length === filteredModels.length
                ? setSelectedModels([])
                : setSelectedModels(models?.map((model) => model.imageUrl))
            }
          >
            <Checkbox
              className="h-4 w-4"
              checked={
                selectedModels.length > 0 &&
                selectedModels.length === filteredModels.length
              }
            />
            Select All
          </Button>
          <div className="space-y-4 ml-4 w-full">
            <ActiveFilters
              filters={modelFilters}
              onRemove={(key) => {
                modelFilters && delete modelFilters[key];
                setChangeFilterValue(!changeFilterValue);
                onRemoveFilterFromSelection(modelFilters || {});
              }}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onToggleFilters} // Fixed onClick handler
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {/* 18rem = 288px (https://tailwindcss.com/docs/width) */}
          <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
            {filteredModels?.map((model) => {
              {
                selectedImage && (
                  <ImageViewModal
                    imageUrl={selectedImage.imageUrl}
                    title={selectedImage.name}
                    metadata={selectedImage.metadata as MetaData}
                    onClose={() => setSelectedImage(null)}
                    onDelete={() => {
                      deleteMutation.mutate(selectedImage.id);
                      setSelectedImage(null);
                    }}
                  />
                );
              }
              return (
                <div
                  key={model.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 group p-2 ${
                    selectedModels.includes(model.imageUrl)
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <div
                    className="relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(model);
                    }}
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedModels.includes(model.imageUrl)) {
                          setSelectedModels(
                            selectedModels.filter((id) => id !== model.imageUrl)
                          );
                        } else {
                          setSelectedModels([
                            ...selectedModels,
                            model.imageUrl,
                          ]);
                        }
                      }}
                    >
                      <Checkbox
                        id={`model-${model.id}-2`}
                        checked={selectedModels.includes(model.imageUrl)}
                        onCheckedChange={() => {
                          if (selectedModels.includes(model.imageUrl)) {
                            setSelectedModels(
                              selectedModels.filter(
                                (id) => id !== model.imageUrl
                              )
                            );
                          } else {
                            setSelectedModels([
                              ...selectedModels,
                              model.imageUrl,
                            ]);
                          }
                        }}
                      />
                    </Button>
                    {model.imageUrl ? (
                      <img
                        src={
                          model.imageUrl.startsWith("/uploads")
                            ? model.imageUrl
                            : `/uploads/${model.imageUrl}`
                        }
                        alt={model.name}
                        className="w-full h-64 object-contain bg-white"
                        onClick={() => setSelectedImage(model)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <p>No Image</p>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this model?"
                          )
                        ) {
                          deleteMutation.mutate(model.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {selectedImage && (
          <ImageViewModal
            imageUrl={
              selectedImage.imageUrl.startsWith("/uploads")
                ? selectedImage.imageUrl
                : `/uploads/${selectedImage.imageUrl}`
            }
            title={selectedImage.name}
            metadata={selectedImage.metadata as MetaData}
            onClose={() => setSelectedImage(null)}
            onDelete={() => {
              if (
                window.confirm("Are you sure you want to delete this shirt?")
              ) {
                deleteMutation.mutate(selectedImage.id);
                setSelectedImage(null);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
