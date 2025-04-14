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
import { useEffect, useRef, useState } from "react";
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
  // Can be accessed with ref.current.value!
  const [formData, setFormData] = useState<ModelData>({});
  const { uploadModelDocument } = useModels();
  const [modelFileName, setModelFileName] = useState<string>("");
  const [isBack, setIsBack] = useState<boolean>(false);
  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  console.log({ models });
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...formData,
      color: "black",
      isBack: false,
    });
  }, []);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Model</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="space-y-2 ">
            <label className="font-semibold ml-2">{"Color"}</label>
            <DropdownFilter
              key={"color"}
              options={["black", "white", "orange"]}
              selectedOption={"black"}
              onSelectOption={(value) => {
                setFormData({ ...formData, color: value });
              }}
              label={"Color"}
            />
            <div className="gap-2 flex items-center mt-50">
              <div className="flex items-center">
                <label className="font-semibold ml-2 flex-1">
                  {"Backprint usage"}
                </label>
              </div>
              <div className="flex-1">
                <Checkbox
                  checked={isBack}
                  onCheckedChange={() =>
                    setIsBack((prev) => {
                      return !prev;
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Model - Image</Label>
            <div className="flex-row flex items-center gap-5">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("file", file, "fileName", file.name);
                    setModelFileName(file.name);

                    uploadModelDocument.mutate({
                      formData: {
                        ...formData,
                        image: file,
                        resultName: file.name,
                        direction: isBack ? "back" : "front",
                      },
                    });
                  }
                }}
                required
              />
            </div>
          </div>
          {modelFileName && (
            <div>
              <Label>Model - Automation</Label>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadModelDocument.mutate({
                      formData: {
                        ...formData,
                        image: file,
                        resultName: modelFileName,
                        isAutomation: true,
                        direction: isBack ? "back" : "front",
                      },
                    });
                  }
                }}
                required
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            {/*TODO Should delete the uploaded files already*/}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={uploadModelDocument.isPending}
              onClick={onClose}
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
