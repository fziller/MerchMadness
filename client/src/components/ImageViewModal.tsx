import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type ImageViewModalProps = {
  imageUrl: string;
  title: string;
  onClose: () => void;
  onDelete: () => void;
};

export default function ImageViewModal({
  imageUrl,
  title,
  onClose,
  onDelete,
}: ImageViewModalProps) {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      onDelete();
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {title}
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}