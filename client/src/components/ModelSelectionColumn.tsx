import { Model } from "@db/schema";
import ContentCard from "./ContentCard";
import { MetaData } from "./filter/FilterEnums";
import ImageViewModal from "./ImageViewModal";

interface ModelSelectionColumnProps {
  selectedImage: Model | null;
  setSelectedImage: (model: Model | null) => void;
  selectedModelIds: number[];
  setSelectedModelIds: (ids: number[]) => void;
  filteredModels: Model[];
  onDelete: (id: number) => void;
  title: string;
}

const ModelSelectionColumn: React.FC<ModelSelectionColumnProps> = (props) => {
  const {
    title,
    selectedImage,
    setSelectedImage,
    selectedModelIds,
    setSelectedModelIds,
    filteredModels,
    onDelete,
  } = props;
  return (
    <div className="flex flex-col items-center">
      <label className="font-bold items-center">{title}</label>
      <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
        {filteredModels?.map((model) => {
          {
            selectedImage && (
              <ImageViewModal
                imageUrl={selectedImage.imageUrl}
                title={selectedImage.name}
                metadata={selectedImage.metadata as MetaData}
                onClose={() => setSelectedImage(null)}
                onDelete={() => {
                  onDelete(selectedImage.id);
                }}
              />
            );
          }
          return (
            <ContentCard
              key={model.imageUrl}
              content={model}
              selectedContent={selectedModelIds}
              setSelectedContent={setSelectedModelIds}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(model);
              }}
              onDeleteClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm("Are you sure you want to delete this model?")
                ) {
                  onDelete(model.id);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelectionColumn;
