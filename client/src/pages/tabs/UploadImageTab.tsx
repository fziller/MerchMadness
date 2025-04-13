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
      <h1>Select the shirt color and upload shirt images</h1>
      <div className="space-y-2">
        <Button
          onClick={() => shirts?.map((s) => deleteSingleShirt.mutate(s.id))}
        >
          Delete all images
        </Button>
        <div className="items-center justify-center">
          <DropdownFilter
            key={"color"}
            options={["black", "white", "red"]}
            onSelectOption={(option) => setSelectedColor(option)}
            selectedOption={selectedColor}
            label={"Color"}
          />
        </div>
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
    </div>
  );
};

export default UploadImageTab;
