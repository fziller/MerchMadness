import ContentCard from "@/components/ContentCard";
import { Label } from "@/components/ui/label";
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
        {models && models.length > 0 ? (
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
        ) : (
          <div className="flex items-center justify-center my-20 flex-col">
            <text className="flex text-2xl">{"No models found."}</text>
            <text className="flex text-2xl">
              {"Log into Admin panel and upload a model first"}
            </text>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelectTab;
