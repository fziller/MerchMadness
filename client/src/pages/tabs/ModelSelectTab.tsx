import DropdownFilter from "@/components/filter/DropdownFilter";
import { ScrollArea } from "@/components/ui/scroll-area";
import WizardShirtImageColumn from "@/components/WizardShirtImageColumn";
import { Model } from "@db/schema";
import { useEffect, useState } from "react";

interface ModelSelectTabProps {
  models?: Model[];
  selectedModels: number[];
  setSelectedModels: React.Dispatch<React.SetStateAction<number[]>>;
  selectedColor: string | undefined;
  setSelectedColor: (color: string | undefined) => void;
  selectedType: string | undefined;
  setSelectedType: (type: string | undefined) => void;
}

const ModelSelectTab: React.FC<ModelSelectTabProps> = (props) => {
  const {
    models,
    selectedModels,
    setSelectedModels,
    selectedColor,
    setSelectedColor,
    selectedType,
    setSelectedType,
  } = props;

  // states
  const [frontPrintModels, setFrontPrintModels] = useState<Model[]>([]);
  const [backPrintModels, setBackPrintModels] = useState<Model[]>([]);

  // effects
  useEffect(() => {
    if (models) {
      const frontPrints = models
        .filter((model) => model.direction === "front")
        ?.filter((model) => {
          console.log("model.color", model.color, selectedColor);
          return model.color === selectedColor;
        })
        ?.filter((model) => {
          console.log(
            "model.type",
            model.type,
            selectedType,
            model.type === selectedType
          );
          return model.type === selectedType;
        });
      const backPrints = models
        .filter((model) => model.direction === "back")
        ?.filter((model) => model.color === selectedColor)
        ?.filter((model) => model.type === selectedType);
      setFrontPrintModels(frontPrints);
      setBackPrintModels(backPrints);
    } else {
      setFrontPrintModels([]);
      setBackPrintModels([]);
    }
  }, [models, selectedColor, selectedType]);

  return (
    <div>
      <div className="flex flex-col justify-center gap-2">
        <label className="font-bold">Color</label>
        <text className="text-xs text-muted-foreground">
          Choose color from uploaded pictures. Changing color here also changes
          selected shirt color.
        </text>
        <DropdownFilter
          key={"color"}
          options={["black", "white", "orange"]}
          onSelectOption={(option) => {
            setSelectedColor(option);
            setSelectedModels([]);
          }}
          selectedOption={selectedColor}
          label={"Shirt Color"}
          hasError={
            !selectedColor
              ? "Select the matching color for the motiv."
              : undefined
          }
        />
      </div>
      <div className="flex flex-col justify-center gap-2 w-full">
        <label className="font-bold">Sleeve Type</label>
        <text className="text-xs text-muted-foreground">
          Select the sleeve type for merging uploaded images with specific
          models. Merging images with models is only possible if models are
          visible in the selection. The system automatically distinguishes
          between back-and frontprint.
        </text>
        <DropdownFilter
          key={"type"}
          options={["longsleeve", "shortsleeve"]}
          onSelectOption={(option) => {
            setSelectedModels([]);
            setSelectedType(option);
          }}
          selectedOption={selectedType}
          label={"type"}
          hasError={!selectedType ? "Select a type" : undefined}
        />
      </div>
      <h1>Model Select</h1>
      <div className="space-y-2">
        {models && models.length > 0 ? (
          <ScrollArea className="h-[600px]">
            <div className="flex flex-row">
              {frontPrintModels.length > 0 && (
                <WizardShirtImageColumn
                  onDelete={(id) => {
                    console.log("onDelete", id);
                  }}
                  shirts={frontPrintModels}
                  title="Front Print"
                  badges={[selectedColor ? selectedColor : ""]}
                  selectedContent={selectedModels}
                  setSelectedContent={setSelectedModels}
                  showSelectAll
                />
              )}
              <div className="w-px bg-border mx-4 my-4 self-stretch" />
              {frontPrintModels.length > 0 && (
                <WizardShirtImageColumn
                  onDelete={(id) => {
                    console.log("onDelete", id);
                  }}
                  shirts={backPrintModels}
                  title="Back Print"
                  badges={[selectedColor ? selectedColor : ""]}
                  selectedContent={selectedModels}
                  setSelectedContent={setSelectedModels}
                  showSelectAll
                />
              )}
            </div>
            {/* <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
              {models &&
                models.map((model) => (
                  <ContentCard
                    content={model}
                    selectedContent={selectedModels}
                    setSelectedContent={setSelectedModels}
                  />
                ))}
            </div> */}
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center my-20 flex-col">
            <text className="flex text-2xl">{"No models found."}</text>
            <text className="flex text-2xl">
              {"Log into Admin panel and upload a model first"}
            </text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelectTab;
