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
import useShirts from "@/hooks/useShirts";
import { useEffect, useRef, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import DropdownFilter from "./filter/DropdownFilter";
import {
  ModelEvent,
  ModelGender,
  ModelGenre,
  ShirtMotiv,
  TagModelEvent,
  TagModelGender,
  TagModelGenre,
  TagModelHeight,
  TagModelWidth,
  TagShirtBrand,
  TagShirtColor,
  TagShirtMotiv,
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
  motiv: ShirtMotiv | undefined;
};

export default function UploadModal({ type, onClose }: UploadModalProps) {
  // TODO Replace with a useRef hook as we do not need to rerender the view when the input changes!!!!
  // Can be accessed with ref.current.value!
  const [formData, setFormData] = useState<ModelData | ShirtData>({});
  const { uploadModelDocument } = useModels();
  const { uploadShirt } = useShirts();

  const nameRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    type === "model"
      ? uploadModelDocument.mutateAsync({
          formData,
          name: nameRef.current?.value ?? "",
          onClose,
        })
      : uploadShirt.mutateAsync({
          formData,
          name: nameRef.current?.value ?? "",
          onClose,
        });
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
              {/* TODO Temporary filter for showcase different shirt merges */}
              <SingleSelectFilter
                key={TagShirtMotiv.key}
                selectedOption={formData.motiv}
                options={TagShirtMotiv.options}
                onSelectOption={(value) => {
                  setFormData({
                    ...formData,
                    motiv: value.toString() as ModelGender,
                  });
                }}
                label={TagShirtMotiv.label}
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
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadModelDocument.isPending || uploadShirt.isPending}
            >
              {uploadModelDocument.isPending || uploadShirt.isPending ? (
                <ClipLoader
                  loading={
                    uploadModelDocument.isPending || uploadShirt.isPending
                  }
                  color="black"
                />
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
