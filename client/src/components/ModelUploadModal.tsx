import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useModels from "@/hooks/useModels";
import { Model } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownFilter from "./filter/DropdownFilter";
import { ModelGender } from "./filter/FilterEnums";
import { Checkbox } from "./ui/checkbox";

type UploadModalProps = {
  onClose: () => void;
};

type ModelData = {
  name?: string;
  image: File;
  isBack: boolean;
  color: string;
  gender: ModelGender | undefined;
};

export default function UploadModal({ onClose }: UploadModalProps) {
  // TODO Replace with a useRef hook as we do not need to rerender the view when the input changes!!!!

  const { uploadModelDocument } = useModels();

  const [formData, setFormData] = useState<ModelData>({});
  const [modelFileName, setModelFileName] = useState<string>("");

  const [modelFile, setModelFile] = useState<File | null>(null);
  const [automationFile, setAutomationFile] = useState<File | null>(null);
  const [selectedColor, setSelectedColor] = useState<
    "black" | "white" | "orange" | undefined
  >(undefined);
  const [printDirection, setPrintDirection] = useState<
    "front" | "back" | undefined
  >(undefined);

  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  useEffect(() => {
    setFormData({
      ...formData,
      color: "black",
    });
  }, []);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Model</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="flex space-y-2 flex-col">
            <Label>Model file</Label>
            <text className="text-xs text-muted-foreground">
              This needs to be a Photoshop file containing the model + layers.
            </text>
            <div className="flex-row flex items-center gap-5">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setModelFileName(file.name);
                    setModelFile(file);
                  }
                }}
                required
              />
            </div>
          </div>
          {modelFile && (
            <div className="space-y-2">
              <div className="flex space-y-2 flex-col">
                <Label>Model - Automation</Label>
                <text className="text-xs text-muted-foreground">
                  This is the automation file linked to the model.
                </text>
              </div>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAutomationFile(file);
                  }
                }}
                required
              />
            </div>
          )}
          {modelFile && automationFile && (
            <div className="space-y-2 ">
              <div className="flex space-y-2 flex-col">
                <Label>Shirt color</Label>
                <text className="text-xs text-muted-foreground">
                  The color of the shirt of the model.
                </text>
              </div>
              <DropdownFilter
                key={"color"}
                options={["black", "white", "orange"]}
                selectedOption={selectedColor}
                onSelectOption={(value) => {
                  setSelectedColor(value);
                  setFormData({ ...formData, color: value });
                }}
                label={"Color"}
              />
            </div>
          )}

          {modelFile && automationFile && selectedColor && (
            <div className="gap-2 flex flex-col">
              <div className="flex space-y-2 flex-col">
                <Label>Shirt print direction</Label>
                <text className="text-xs text-muted-foreground">
                  Depending if model shows front or back.
                </text>
              </div>
              <div className="flex flex-row gap-20">
                <div className="flex flex-row items-center justify-start gap-2">
                  <text className="text-sm">Backprint</text>
                  <Checkbox
                    checked={printDirection === "back"}
                    onCheckedChange={() => setPrintDirection("back")}
                  />
                </div>
                <div className="flex flex-row items-center justify-end gap-2">
                  <text className="text-sm">Frontprint</text>
                  <Checkbox
                    checked={printDirection === "front"}
                    onCheckedChange={() => setPrintDirection("front")}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {/*TODO Should delete the uploaded files already*/}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                modelFile === undefined ||
                automationFile === undefined ||
                selectedColor === undefined ||
                printDirection === undefined ||
                uploadModelDocument.isPending
              }
              onClick={() => {
                // After we press save, we start by uploading the model file
                // plus converting it to an jpg to show.
                uploadModelDocument.mutate({
                  formData: {
                    ...formData,
                    model: { image: modelFile, resultName: modelFile?.name },
                    automation: {
                      image: automationFile,
                      resultName: automationFile?.name,
                      isAutomation: true,
                    },
                    direction: printDirection,
                  },
                });

                onClose();
              }}
            >
              {uploadModelDocument.isPending ? (
                <ClipLoader
                  loading={uploadModelDocument.isPending}
                  color="black"
                />
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
