import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import DropdownFilter from "./filter/DropdownFilter";
import {
  ModelEvent,
  ModelGender,
  ModelGenre,
  TagModelEvent,
  TagModelGender,
  TagModelGenre,
  TagModelHeight,
  TagModelWidth,
  TagShirtBrand,
  TagShirtColor,
  TagShirtSize,
} from "./filter/FilterEnums";
import MultiSelectFilter from "./filter/MultiSelectFilter";
import { RangeSliderFilter } from "./filter/RangeSliderFilter";
import SingleSelectFilter from "./filter/SingleSelectFilter";

type UploadModalProps = {
  type: "model" | "shirt";
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

type ShirtData = {
  name?: string;
  image?: object;
  height?: number;
  size: string[];
  color: string[];
  brand: string;
};

export default function UploadModal({ type, onClose }: UploadModalProps) {
  // TODO Replace with a useRef hook as we do not need to rerender the view when the input changes!!!!
  // Can be accessed with ref.current.value!
  const [formData, setFormData] = useState<ModelData | ShirtData>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const nameRef = useRef<HTMLInputElement>(null);

  console.log("formData for upload", { formData });

  useEffect(() => {
    if (type === "model") {
      setFormData({
        ...formData,
        gender: undefined,
        height: TagModelHeight.min,
        width: TagModelWidth.min,
        event: [],
        genre: [],
      });
    }
    if (type === "shirt") {
      setFormData({
        ...formData,
        size: [],
        color: [],
      });
    }
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          form.append("image", value);
        } else {
          form.append(key, String(value));
        }
      });
      form.append("name", nameRef?.current?.value ?? "");

      const response = await fetch(`/api/${type}s`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}s`] });
      toast({
        title: "Success",
        description: `${type} uploaded successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input name="name" required type="text" ref={nameRef} />
          </div>

          {type === "model" ? (
            <>
              {/* Gender Selection */}
              <SingleSelectFilter
                key={TagModelGender.key}
                selectedOption={formData.gender}
                options={TagModelGender.options}
                onSelectOption={(value) => {
                  setFormData({
                    ...formData,
                    gender: value.toString() as ModelGender,
                  });
                }}
                label={TagModelGender.label}
              />
              <RangeSliderFilter
                key={TagModelHeight.key}
                label={TagModelHeight.label}
                min={TagModelHeight.min}
                max={TagModelHeight.max}
                startValue={TagModelHeight.min}
                selectedValue={formData.height}
                onValueChange={(changedValue) =>
                  setFormData({
                    ...formData,
                    height: changedValue,
                  })
                }
              />
              <RangeSliderFilter
                key={TagModelWidth.key}
                label={TagModelWidth.label}
                min={TagModelWidth.min}
                max={TagModelWidth.max}
                startValue={TagModelWidth.min}
                selectedValue={formData.width}
                onValueChange={(changedValue) =>
                  setFormData({
                    ...formData,
                    width: changedValue,
                  })
                }
              />
              <MultiSelectFilter
                key={TagModelEvent.key}
                label={TagModelEvent.label}
                options={TagModelEvent.options}
                selectedOptions={formData.event}
                onSelectOption={(selectedOptions) => {
                  setFormData({
                    ...formData,
                    event: selectedOptions as ModelEvent[],
                  });
                }}
              />
              <MultiSelectFilter
                key={TagModelGenre.key}
                label={TagModelGenre.label}
                options={TagModelGenre.options}
                selectedOptions={formData.genre}
                onSelectOption={(selectedOptions) => {
                  setFormData({
                    ...formData,
                    genre: selectedOptions as ModelGenre[],
                  });
                }}
              />
            </>
          ) : (
            <>
              <MultiSelectFilter
                key={TagShirtSize.key}
                selectedOptions={formData.size}
                options={TagShirtSize.options}
                onSelectOption={(selectedOptions) => {
                  setFormData({ ...formData, size: selectedOptions });
                }}
                label={TagShirtSize.label}
              />
              <MultiSelectFilter
                key={TagShirtColor.key}
                selectedOptions={formData.color}
                options={TagShirtColor.options}
                onSelectOption={(selectedOptions) => {
                  setFormData({ ...formData, color: selectedOptions });
                }}
                label={TagShirtColor.label}
              />
              <DropdownFilter
                key={TagShirtBrand.key}
                options={TagShirtBrand.options}
                selectedOption={formData.brand}
                onSelectOption={(value) => {
                  setFormData({ ...formData, brand: value });
                }}
                label={TagShirtBrand.label}
              />
            </>
          )}

          <div className="space-y-2">
            <Label>Image</Label>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                }
              }}
              accept="image/*"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
