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
import { ModelEvent, ModelGender, ModelGenre } from "./filter/FilterEnums";
import { Checkbox } from "./ui/checkbox";

type UploadModalProps = {
  onClose: () => void;
};

type ModelData = {
  name?: string;
  image?: object;
  height: number;
  width: number;
  gender: ModelGender | undefined;
  event: ModelEvent[];
  genre: ModelGenre[];
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

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData({
      ...formData,
      gender: undefined,
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadModelDocument.mutateAsync({
      formData,
      name: nameRef.current?.value ?? "",
      onClose,
    });
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Model</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" required type="text" ref={nameRef} />
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
                    console.log(isBack);
                    const result = uploadModelDocument.mutate({
                      formData: {
                        ...formData,
                        image: file,
                        resultName: file.name,
                        direction: isBack ? "back" : "front",
                      },
                      name: nameRef.current?.value ?? "",
                    });
                  }
                }}
                required
              />
              <Checkbox
                checked={isBack}
                onCheckedChange={() => setIsBack(!isBack)}
              />
              <label>{"Backprint usage"}</label>
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
                    const result = uploadModelDocument.mutate({
                      formData: {
                        ...formData,
                        image: file,
                        resultName: modelFileName,
                        isAutomation: true,
                      },
                      name: nameRef.current?.value ?? "",
                      isAutomation: true,
                      resultName: modelFileName,
                    });
                    console.log("Front automation result", { result });
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
