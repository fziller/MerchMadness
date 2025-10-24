import { useUser } from "@/hooks/use-user";
import { Model, Shirt } from "@db/schema";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";

interface ContentCardProps {
  content: Model | Shirt;
  onClick?: (element: React.MouseEvent) => void;
  onDeleteClick?: (element: React.MouseEvent) => void;
  selectedContent: number[];
  setSelectedContent: (selectedContent: number[]) => void;
  badges?: string[];
}

const ContentCard: React.FC<ContentCardProps> = (props) => {
  const {
    content,
    onDeleteClick,
    selectedContent,
    setSelectedContent,
    onClick,
    badges = [],
  } = props;
  const { user } = useUser();

  // states
  const [badgesToShow, setBadgesToShow] = useState<string[]>(badges);

  useEffect(() => {
    const b = [...badges];
    if ((content as Model).direction) {
      b.push((content as Model).direction);
    }
    if ((content as Model).type) {
      b.push((content as Model).type);
    }
    setBadgesToShow(b);
  }, [badges, content]);

  return (
    <div
      key={content.id}
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 group p-2 ${
        selectedContent?.includes(content.id)
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
            if (selectedContent.includes(content.id)) {
              setSelectedContent(
                selectedContent.filter((id) => id !== content.id)
              );
            } else {
              setSelectedContent([...selectedContent, content.id]);
            }
          }}
        >
          <Checkbox
            id={`model-${content.id}-2`}
            checked={selectedContent.includes(content.id)}
            onCheckedChange={() => {}}
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

        <div className="absolute top-4 right-4 flex gap-2">
          {
            // Only admins should be allowed to delete or shirts
            (user?.isAdmin || user?.username === "admin") && (
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => onDeleteClick?.(e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )
          }
          {badgesToShow && badgesToShow?.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1 pointer-events-auto">
              {badgesToShow.map((b, i) => (
                <Badge
                  key={i}
                  variant={"secondary"}
                  className="text-[10px] leading-none px-2 py-1"
                >
                  {b}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
