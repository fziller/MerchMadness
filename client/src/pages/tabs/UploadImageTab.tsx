import ContentCard from "@/components/ContentCard";
import DropdownFilter from "@/components/filter/DropdownFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useShirts from "@/hooks/useShirts";
import { Shirt } from "@db/schema";

interface UploadImageTabProps {
  shirts?: Shirt[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

const UploadImageTab: React.FC<UploadImageTabProps> = (props) => {
  const { shirts, selectedColor, setSelectedColor } = props;
  const { uploadShirt, deleteSingleShirt } = useShirts();
  return (
    <div>
      <div className="flex-row flex justify-between items-center">
        <h1>Select the shirt color and upload shirt images</h1>

        {shirts && shirts?.length > 0 && (
          <Button
            onClick={() => shirts?.map((s) => deleteSingleShirt.mutate(s.id))}
          >
            Delete all images
          </Button>
        )}
      </div>
      <div className="items-center align-middle justify-center">
        <div className="items-center justify-center mt-2 w-1/2">
          <DropdownFilter
            key={"color"}
            options={["black", "white", "red"]}
            onSelectOption={(option) => setSelectedColor(option)}
            selectedOption={selectedColor}
            label={"Color"}
          />
        </div>
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
            </div>
          </ScrollArea>
        </div>
        <div className="w-1/2 items-center">
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
      </div>
    </div>
  );
};

export default UploadImageTab;
