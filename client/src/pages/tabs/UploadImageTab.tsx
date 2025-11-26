import DropdownFilter from "@/components/filter/DropdownFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import WizardShirtImageColumn from "@/components/WizardShirtImageColumn";
import useShirts from "@/hooks/useShirts";
import { Shirt } from "@db/schema";
import { Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface UploadImageTabProps {
  shirts?: Shirt[];
  selectedShirts: number[];
  setSelectedShirts: React.Dispatch<React.SetStateAction<number[]>>;
  selectedColor: string | undefined;
  setSelectedColor: (color: string | undefined) => void;
}

const UploadImageTab: React.FC<UploadImageTabProps> = (props) => {
  const {
    shirts,
    selectedColor,
    setSelectedColor,
    selectedShirts,
    setSelectedShirts,
  } = props;

  // states
  const [backShirts, setBackShirts] = useState<Shirt[]>([]);
  const [frontShirts, setFrontShirts] = useState<Shirt[]>([]);
  const [otherShirts, setOtherShirts] = useState<Shirt[]>([]);

  // hooks
  const { uploadShirt, deleteSingleShirt } = useShirts();

  const countSelectedInGroup = (group: Shirt[], selectedIds: number[]) =>
    group.filter((shirt) => selectedIds.includes(shirt.id)).length;

  // memos
  const frontPrintTitle = useMemo(() => {
    const total = frontShirts.length;
    const selectedCount = countSelectedInGroup(frontShirts, selectedShirts);

    return `Front Print (${selectedCount}/${total} selected)`;
  }, [frontShirts, selectedShirts]);

  const backPrintTitle = useMemo(() => {
    const total = backShirts.length;
    const selectedCount = countSelectedInGroup(backShirts, selectedShirts);

    return `Back Print (${selectedCount}/${total} selected)`;
  }, [backShirts, selectedShirts]);

  const otherPrintTitle = useMemo(() => {
    const total = otherShirts.length;
    const selectedCount = countSelectedInGroup(otherShirts, selectedShirts);

    return `Other Prints (${selectedCount}/${total} selected)`;
  }, [otherShirts, selectedShirts]);

  useEffect(() => {
    if (shirts && shirts?.length > 0) {
      setBackShirts(
        shirts.filter(
          (s) => s.name.includes("_back") && s.color === selectedColor
        )
      );
      setFrontShirts(
        shirts.filter(
          (s) => s.name.includes("_front") && s.color === selectedColor
        )
      );
      setOtherShirts(
        shirts.filter(
          (s) =>
            !s.name.includes("_back") &&
            !s.name.includes("_front") &&
            s.color === selectedColor
        )
      );
    } else {
      setBackShirts([]);
      setFrontShirts([]);
      setOtherShirts([]);
    }
  }, [shirts, selectedColor]);

  return (
    <div className="justify-center items-center">
      <div>
        {shirts && shirts?.length > 0 && (
          <Button
            className="mt-5"
            variant="destructive"
            onClick={() => shirts?.map((s) => deleteSingleShirt.mutate(s.id))}
          >
            <Trash size={20} />
            <span>Delete all shirt images</span>
          </Button>
        )}
      </div>
      <div className="flex flex-col justify-between gap-6 mx-10 mt-5">
        <div className="flex flex-col justify-center gap-2">
          <label className="font-bold">Color</label>
          <text className="text-xs text-muted-foreground">
            Determine shirt color for upload. This color will be used for model
            selection.
          </text>
          <DropdownFilter
            key={"color"}
            options={["black", "white", "orange"]}
            onSelectOption={(option) => setSelectedColor(option)}
            selectedOption={selectedColor}
            label={"Shirt Color"}
            hasError={!selectedColor ? "Please select a color" : undefined}
          />
        </div>
        {selectedColor && (
          <div className="flex-1 gap-4">
            <div className="flex flex-col gap-2 pb-2">
              <label className="font-bold">Upload Images</label>
              <text className="text-xs text-muted-foreground">
                Choose images to upload. Should be of selected color. Files
                ending with `_front` will be counted as Frontprints, files
                ending with `_back` will be counted as Backprints.
              </text>
            </div>
            <Input
              accept="image/*"
              className={`${
                shirts && shirts?.length === 0 && "border-red-400 text-red-400"
              }`}
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                for (let index = 0; index < files.length; index++) {
                  uploadShirt.mutateAsync({
                    formData: { image: files[index] },
                    name: files[index].name,
                    color: selectedColor,
                  });
                }
              }}
              placeholder="Upload Shirt Image"
              required
              title="Upload Shirt Image"
              type="file"
            />
            {shirts && shirts?.length === 0 && (
              <text className="text-red-400">
                Make sure to upload at least one picture.
              </text>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <ScrollArea className="min-h-[200px] mt-5 p-2">
          <Card>
            <div className="flex flex-row justify-between items-start py-2">
              {frontShirts && frontShirts?.length > 0 && (
                <WizardShirtImageColumn
                  title={frontPrintTitle}
                  shirts={frontShirts}
                  showSelectAll
                  setSelectedContent={setSelectedShirts}
                  selectedContent={selectedShirts}
                  onDelete={deleteSingleShirt.mutate}
                  badges={selectedColor ? [selectedColor] : []}
                />
              )}
              {frontShirts && frontShirts?.length > 0 && backShirts && (
                <div className="w-px bg-border mx-4 my-4 self-stretch" />
              )}
              {backShirts && backShirts?.length > 0 && (
                <WizardShirtImageColumn
                  title={backPrintTitle}
                  shirts={backShirts}
                  showSelectAll
                  setSelectedContent={setSelectedShirts}
                  selectedContent={selectedShirts}
                  onDelete={deleteSingleShirt.mutate}
                  badges={selectedColor ? [selectedColor] : []}
                />
              )}
              {otherShirts &&
                otherShirts?.length > 0 &&
                (backShirts || frontShirts) && (
                  <div className="w-px bg-border mx-4 my-4 self-stretch" />
                )}
              {otherShirts && otherShirts?.length > 0 && (
                <WizardShirtImageColumn
                  title={otherPrintTitle}
                  setSelectedContent={setSelectedShirts}
                  selectedContent={selectedShirts}
                  shirts={otherShirts}
                  onDelete={deleteSingleShirt.mutate}
                />
              )}
            </div>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default UploadImageTab;
