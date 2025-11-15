import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModelFilter } from "@/context/ModelFilterContext";
import useModels from "@/hooks/useModels";
import { filterByType } from "@/lib/utils";
import type { Model } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import ActiveFilters from "./ActiveFilters";
import { MetaData } from "./filter/FilterEnums";
import ImageViewModal from "./ImageViewModal";
import ModelSelectionColumn from "./ModelSelectionColumn";

type ModelSelectionProps = {
  onToggleFilters: () => void;
  onSelectedModelsChange: (selectedModels: Model[]) => void;
};

export default function ModelSelection({
  onSelectedModelsChange,
}: ModelSelectionProps) {
  // hooks
  const { deleteModel } = useModels();
  const { data: models, refetch: refetchModels } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  const { state: modelFilters } = useModelFilter();

  // states
  const [selectedImage, setSelectedImage] = useState<Model | null>(null);
  const [changeFilterValue, setChangeFilterValue] = useState(false);
  const [filteredModels, setFilteredModels] = useState<Model[]>(models || []);
  const [selectedModels, setSelectedModels] = useState<number[]>([]); // Stores the ids of the selected models
  const [frontPrintModels, setFrontPrintModels] = useState<Model[]>([]);
  const [backPrintModels, setBackPrintModels] = useState<Model[]>([]);

  // effects
  // Effect to show the updated list of models in the modelselection as well as changing the selected models.
  useEffect(() => {
    if (models === undefined) return;
    // Check first if we have models for frontPrint.
    const frontModels = models.filter((model) => model.direction === "front");
    if (frontModels.length > 0) {
      const colorFilteredModels = frontModels.filter((m) => {
        return modelFilters?.color ? m.color === modelFilters?.color : true;
      });
      setFrontPrintModels(
        colorFilteredModels.filter((m) => {
          return modelFilters?.type ? m.type === modelFilters?.type : true;
        })
      );
    } else {
      setFrontPrintModels([]);
    }

    const backModels = models.filter((model) => model.direction === "back");
    if (backModels.length > 0) {
      const colorFilteredModels = backModels.filter((m) => {
        return modelFilters?.color ? m.color === modelFilters?.color : true;
      });
      setBackPrintModels(
        colorFilteredModels.filter((m) => {
          return modelFilters?.type ? m.type === modelFilters?.type : true;
        })
      );
    } else {
      setBackPrintModels([]);
    }

    const modelsAfterChange = models
      ? !modelFilters
        ? models
        : models.filter((model) => filterByType(modelFilters, model))
      : [];
    setFilteredModels(modelsAfterChange);
    // If we have models selected, we only want to use the selected ones.
    if (selectedModels.length > 0) {
      onSelectedModelsChange(
        modelsAfterChange.filter((model) => selectedModels.includes(model.id))
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
        <div className="flex justify-between items-center gap-5">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() =>
              selectedModels.length === filteredModels.length
                ? setSelectedModels([])
                : setSelectedModels(models?.map((model) => model.id))
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
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
            onClick={() =>
              selectedModels.map((model) =>
                deleteModel.mutate(
                  models?.find((m) => m.imageUrl === model)?.id
                )
              )
            }
          >
            <Trash size={20} />
            <span>Delete All</span>
          </Button>
          <div className="space-y-4 ml-4 w-full">
            <ActiveFilters
              filters={modelFilters}
              onRemove={(key) => {
                modelFilters && delete modelFilters[key];
                setChangeFilterValue(!changeFilterValue);
                // onRemoveFilterFromSelection(modelFilters || {});
              }}
            />
          </div>
        </div>

        <ScrollArea className="h-full">
          {/* 18rem = 288px (https://tailwindcss.com/docs/width) */}
          <div className="flex flex-row justify-between">
            <ModelSelectionColumn
              title="Front Prints"
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              selectedModelIds={selectedModels}
              setSelectedModelIds={setSelectedModels}
              filteredModels={frontPrintModels}
              onDelete={(id) => {
                deleteModel.mutate(id);
                setSelectedImage(null);
              }}
            />
            <div className="w-px bg-border mx-4 my-4 self-stretch" />
            <ModelSelectionColumn
              title="Back Prints"
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              selectedModelIds={selectedModels}
              setSelectedModelIds={setSelectedModels}
              filteredModels={backPrintModels}
              onDelete={(id) => {
                deleteModel.mutate(id);
                setSelectedImage(null);
              }}
            />
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
