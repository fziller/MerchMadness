import ContentCard from "@/components/ContentCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Model } from "@db/schema";

interface ModelSelectTabProps {
  models?: Model[];
  selectedModels: string[];
  setSelectedModels: React.Dispatch<React.SetStateAction<string[]>>;
}

const ModelSelectTab: React.FC<ModelSelectTabProps> = (props) => {
  const { models, selectedModels, setSelectedModels } = props;
  return (
    <div>
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
    </div>
  );
};

export default ModelSelectTab;
