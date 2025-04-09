import ContentCard from "@/components/ContentCard";
import DropdownFilter from "@/components/filter/DropdownFilter";
import { Input } from "@/components/ui/input";
import useShirts from "@/hooks/useShirts";
import { Shirt } from "@db/schema";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";

export default function WizardPage() {
  const [selectedColor, setSelectedColor] = useState("black");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const { uploadShirt, deleteSingleShirt } = useShirts();

  const { data: shirts } = useQuery<Shirt[]>({
    queryKey: ["/api/shirts"],
  });
  const { data: models } = useQuery<Shirt[]>({
    queryKey: ["/api/models"],
  });
  const handleComplete = () => {
    console.log("Form completed!");
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
    <>
      <FormWizard
        shape="circle"
        color="#611122"
        onComplete={handleComplete}
        onTabChange={tabChanged}
      >
        <FormWizard.TabContent title="Select color" icon="ti-user">
          {/* Add your form inputs and components for the frst step */}
          <h1>Color selection</h1>
          <div className="items-center justify-center">
            <DropdownFilter
              key={"color"}
              options={["black", "white", "red"]}
              onSelectOption={(option) => setSelectedColor(option)}
              selectedOption={selectedColor}
              label={"Color"}
            />
          </div>
        </FormWizard.TabContent>
        <FormWizard.TabContent title="Upload shirt pictures" icon="ti-user">
          {/* Add your form inputs and components for the frst step */}
          <h1>Batch upload from Image</h1>
          <div className="space-y-2">
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
                {shirts &&
                  shirts.map((shirt) => (
                    <ContentCard
                      content={shirt}
                      selectedContent={[]}
                      setSelectedContent={() => console.log("selected")}
                      onDeleteClick={(e) => {
                        e.stopPropagation();
                        deleteSingleShirt.mutate(shirt.id);
                      }}
                    />
                  ))}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    for (let index = 0; index < files.length; index++) {
                      uploadShirt.mutateAsync({
                        formData: { image: files[index] },
                        name: files[index].name,
                      });
                    }
                  }}
                  multiple
                  required
                />
              </div>
            </ScrollArea>
          </div>
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
          <h1>Finish and merge</h1>
        </FormWizard.TabContent>
      </FormWizard>
      {/* add style */}
      <style>{`
        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
      `}</style>
    </>
  );
}
