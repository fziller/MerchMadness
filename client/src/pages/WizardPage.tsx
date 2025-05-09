import { useUser } from "@/hooks/use-user";
import useCombination from "@/hooks/useCombination";
import useShirts from "@/hooks/useShirts";
import { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import MergeTab from "./tabs/MergeTab";
import ModelSelectTab from "./tabs/ModelSelectTab";
import UploadImageTab from "./tabs/UploadImageTab";

export default function WizardPage() {
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { deleteSingleShirt } = useShirts();
  const { deleteCombination } = useCombination();
  const { logout } = useUser();

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

  const handleComplete = () => {
    logout();
    shirts?.map((s) => deleteSingleShirt.mutate(s.id));
    combinedImages?.map((c) =>
      deleteCombination.mutate({ id: c.id.toString() })
    );
  };

  return (
    <div className="space-y-2 items-center justify-center flex-row">
      <FormWizard
        shape="circle"
        color="#611122"
        onComplete={handleComplete}
        onTabChange={() => {}}
        finishButtonText="Clean up & logout"
      >
        <FormWizard.TabContent title="Upload shirt pictures" icon="ti-settings">
          <UploadImageTab
            shirts={shirts}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Select model" icon="ti-user">
          <ModelSelectTab
            models={models}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
          />
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Combine and load results" icon="ti-check">
          <MergeTab
            models={
              selectedModels.length === 0
                ? models
                : selectedModels.map(
                    (model) =>
                      models?.find((m) => m.imageUrl === model) as Model
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
