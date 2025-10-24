import { useUser } from "@/hooks/use-user";
import useCombination from "@/hooks/useCombination";
import useShirts from "@/hooks/useShirts";
import { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import MergeTab from "./tabs/MergeTab";
import ModelSelectTab from "./tabs/ModelSelectTab";
import UploadImageTab from "./tabs/UploadImageTab";
import { Button } from "@/components/ui/button";

export default function WizardPage() {
  // states
  const [selectedColor, setSelectedColor] = useState<
    "black" | "white" | "orange" | undefined
  >(undefined);
  const [selectedType, setSelectedType] = useState<
    "longsleeve" | "shortsleeve" | undefined
  >(undefined);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [canGoNextToModelUpload, setCanGoNextToModelUpload] = useState(false);
  const [canGoNextToMerge, setCanGoNextToMerge] = useState(false);

  // hooks
  const { deleteSingleShirt } = useShirts();
  const { deleteCombination } = useCombination();
  const { logout } = useUser();

  // queries
  const { data: shirts } = useQuery<Shirt[]>({
    queryKey: ["/api/shirts"],
  });
  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  const { data: combinedImages } = useQuery<CombinedImage[]>({
    queryKey: ["/api/combined"],
    enabled: !!models && !!shirts,
  });

  // effects
  useEffect(() => {
    if (selectedColor !== undefined && shirts && shirts?.length > 0) {
      setCanGoNextToModelUpload(true);
    } else {
      setCanGoNextToModelUpload(false);
    }
  }, [selectedColor, shirts]);

  useEffect(() => {
    if (models && models.length > 0) {
      setCanGoNextToMerge(true);
    } else {
      setCanGoNextToMerge(false);
    }
  }, [models]);

  const handleComplete = () => {
    logout();
    shirts?.map((s) => deleteSingleShirt.mutate(s.id));
    combinedImages?.map((c) =>
      deleteCombination.mutate({ id: c.id.toString() })
    );
  };

  console.log("selectedModels", selectedModels);
  console.log(
    "models per filter",
    models
      ?.filter((m) => m.color === selectedColor)
      ?.filter((m) => m.type === selectedType)
  );
  return (
    <div className="space-y-2 items-center justify-center flex-row">
      <FormWizard
        shape="circle"
        color="#611122"
        onComplete={handleComplete}
        onTabChange={() => {}}
        finishButtonText="Clean up & logout"
      >
        <FormWizard.TabContent
          title="Upload shirt pictures"
          icon="ti-settings"
          isValid={true}
        >
          <UploadImageTab
            shirts={shirts}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </FormWizard.TabContent>
        <FormWizard.TabContent
          title="Select model"
          icon="ti-user"
          isValid={canGoNextToModelUpload}
        >
          <ModelSelectTab
            models={models}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        </FormWizard.TabContent>
        <FormWizard.TabContent
          title="Combine and load results"
          icon="ti-check"
          isValid={canGoNextToMerge}
        >
          <MergeTab
            models={
              selectedModels.length === 0
                ? models
                    ?.filter((m) => m.color === selectedColor)
                    ?.filter((m) => m.type === selectedType)
                : selectedModels.map(
                    (model) => models?.find((m) => m.id === model) as Model
                  )
            }
            shirts={shirts}
            color={selectedColor}
            combinedImages={combinedImages}
          />
        </FormWizard.TabContent>
      </FormWizard>

      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
      `}</style>
    </div>
  );
}
