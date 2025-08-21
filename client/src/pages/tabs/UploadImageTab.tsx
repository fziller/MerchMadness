import ContentCard from "@/components/ContentCard";
import DropdownFilter from "@/components/filter/DropdownFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useShirts from "@/hooks/useShirts";
import { Shirt } from "@db/schema";
import { Trash } from "lucide-react";

interface UploadImageTabProps {
  shirts?: Shirt[];
  selectedColor: string | undefined;
  setSelectedColor: (color: string | undefined) => void;
}

const UploadImageTab: React.FC<UploadImageTabProps> = (props) => {
  const { shirts, selectedColor, setSelectedColor } = props;
  const { uploadShirt, deleteSingleShirt } = useShirts();

  console.log("Shirts", shirts);
  return (
    <div className="justify-center items-center">
      <div>
        <h1>Select the shirt color and upload shirt images</h1>

        {shirts && shirts?.length > 0 && (
          <Button
            className="mt-5"
            variant="destructive"
            onClick={() => shirts?.map((s) => deleteSingleShirt.mutate(s.id))}
          >
            <Trash size={20} />
            <span>Delete shirt images</span>
          </Button>
        )}
      </div>
      <div className="flex flew-row justify-between gap-10 mx-10 mt-5">
        <div className="flex-1 justify-center min-w-96 gap-4">
          <label className="font-bold">Shirt Color</label>
          <DropdownFilter
            key={"color"}
            options={["black", "white", "orange"]}
            onSelectOption={(option) => setSelectedColor(option)}
            selectedOption={selectedColor}
            label={"Shirt Color"}
            isError={!selectedColor}
          />
        </div>
        <div className="flex-1 gap-4">
          <label className="font-bold">Upload Images</label>
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
      </div>
      <div className="space-y-2">
        <ScrollArea className="min-h-[200px] mt-5 p-2">
          <Card>
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
            </div>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default UploadImageTab;
