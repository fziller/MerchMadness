import { useUser } from "@/hooks/use-user";
import { Model, Shirt } from "@db/schema";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface ContentCardProps {
  content: Model | Shirt;
  onClick?: (element: React.MouseEvent) => void;
  onDeleteClick?: (element: React.MouseEvent) => void;
  selectedContent: string[];
  setSelectedContent: React.Dispatch<React.SetStateAction<string[]>>;
}

const ContentCard: React.FC<ContentCardProps> = (props) => {
  const {
    content,
    onDeleteClick,
    selectedContent,
    setSelectedContent,
    onClick,
  } = props;
  const { user } = useUser();

  return (
    <div
      key={content.id}
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 group p-2 ${
        selectedContent?.includes(content.imageUrl)
          ? "border-primary"
          : "border-transparent"
      }`}
    >
      <div className="relative" onClick={onClick}>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (selectedContent.includes(content.imageUrl)) {
              setSelectedContent(
                selectedContent.filter((id) => id !== content.imageUrl)
              );
            } else {
              setSelectedContent((prev) => [...prev, content.imageUrl]);
            }
          }}
        >
          <Checkbox
            id={`model-${content.id}-2`}
            checked={selectedContent.includes(content.imageUrl)}
            onCheckedChange={() => {
              if (selectedContent.includes(content.imageUrl)) {
                setSelectedContent(
                  selectedContent.filter((id) => id !== content.imageUrl)
                );
              } else {
                setSelectedContent((prev) => [...prev, content.imageUrl]);
              }
            }}
          />
        </Button>
        {content.imageUrl ? (
          <img
            src={
              content.imageUrl.startsWith("/uploads")
                ? content.imageUrl
                : `/uploads/${content.imageUrl}`
            }
            alt={content.name}
            className="w-full h-64 object-contain bg-white"
            onClick={onClick}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <p>No Image</p>
          </div>
        )}

        {
          // Only admins should be allowed to delete or shirts
          (user?.isAdmin || user?.username === "admin") && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => onDeleteClick?.(e)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )
        }
      </div>
    </div>
  );
};

export default ContentCard;
