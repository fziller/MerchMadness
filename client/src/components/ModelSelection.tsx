import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelState } from "@/hooks/useModelFilter";
import useModels from "@/hooks/useModels";
import { filterByType } from "@/lib/utils";
import type { Model } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import ActiveFilters from "./ActiveFilters";
import ContentCard from "./ContentCard";
import ImageViewModal from "./ImageViewModal";
import { MetaData } from "./filter/FilterEnums";

type ModelSelectionProps = {
  onToggleFilters: () => void;
  modelFilters?: ModelState;
  onSelectedModelsChange: (selectedModels: Model[]) => void;
  onRemoveFilterFromSelection: (metadata: ModelState) => void;
};

export default function ModelSelection({
  onToggleFilters,
  modelFilters,
  onSelectedModelsChange,
  onRemoveFilterFromSelection,
}: ModelSelectionProps) {
  const [selectedImage, setSelectedImage] = useState<Model | null>(null);
  const [changeFilterValue, setChangeFilterValue] = useState(false);
  const { deleteModel } = useModels();

  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  const [filteredModels, setFilteredModels] = useState<Model[]>(models || []);
  const [selectedModels, setSelectedModels] = useState<string[]>([]); // Stores the ids of the selected models

  console.log("selectedModels", { selectedModels, filteredModels });

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
                      deleteModel.mutate(selectedImage.id);
                      setSelectedImage(null);
                    }}
                  />
                );
              }
              return (
                <ContentCard
                  key={model.imageUrl}
                  content={model}
                  selectedContent={selectedModels}
                  setSelectedContent={setSelectedModels}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(model);
                  }}
                  onDeleteClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        "Are you sure you want to delete this model?"
                      )
                    ) {
                      deleteModel.mutate(model.id);
                    }
                  }}
                />
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
                deleteModel.mutate(selectedImage.id);
                setSelectedImage(null);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
