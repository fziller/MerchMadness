import ContentCard from "@/components/ContentCard";
import { useUser } from "@/hooks/use-user";
import { Model, Shirt } from "@db/schema";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import MergeTab from "./tabs/MergeTab";
import UploadImageTab from "./tabs/UploadImageTab";

export default function WizardPage() {
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { user, logout } = useUser();

  const { data: shirts } = useQuery<Shirt[]>({
    queryKey: ["/api/shirts"],
  });
  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  console.log({ models });

  const handleComplete = () => {
    logout();
    // Handle form completion logic here
  };
  const tabChanged = ({
    prevIndex,
    nextIndex,
  }: {
    prevIndex: number;
    nextIndex: number;
  }) => {
    console.log("prevIndex", prevIndex);
    console.log("nextIndex", nextIndex);
  };
  console.log("we have found shirts", shirts);
  return (
    <div className="space-y-2 items-center justify-center flex-row">
      {/* <Button onClick={() => logout()}>Logout</Button> add style */}
      <FormWizard
        shape="circle"
        color="#611122"
        onComplete={handleComplete}
        onTabChange={tabChanged}
      >
        <FormWizard.TabContent title="Upload shirt pictures" icon="ti-user">
          {/* Add your form inputs and components for the frst step */}
          <UploadImageTab
            shirts={shirts}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Select model" icon="ti-settings">
          <h1>Model Select</h1>
          <div className="space-y-2">
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
                {models &&
                  models.map((model) => (
                    <ContentCard
                      content={model}
                      selectedContent={selectedModels}
                      setSelectedContent={setSelectedModels}
                    />
                  ))}
              </div>
            </ScrollArea>
          </div>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Combine and load results" icon="ti-check">
          <MergeTab
            models={selectedModels.map(
              (model) => models?.find((m) => m.imageUrl === model) as Model
            )}
            shirts={shirts}
            color={selectedColor}
          />
        </FormWizard.TabContent>
      </FormWizard>
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
      `}</style>
    </div>
  );
}
