import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import ActiveFilters from "./ActiveFilters";

type ImageViewModalProps = {
  imageUrl: string;
  title: string;
  metadata: { [key: string]: string | number | string[] };
  onClose: () => void;
  onDelete: () => void;
};

export default function ImageViewModal({
  imageUrl,
  title,
  metadata,
  onClose,
  onDelete,
}: ImageViewModalProps) {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      onDelete();
    }
  };
  console.log("Rendering ImageViewModal", { imageUrl, title, metadata });

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
          <div className="mb-4">
            <ActiveFilters filters={metadata} />
          </div>
          <img
            src={
              imageUrl.startsWith("/uploads")
                ? imageUrl
                : `/uploads/${imageUrl}`
            }
            alt={title}
            className="w-full h-auto rounded-lg"
            style={{ maxHeight: "80vh", objectFit: "contain" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
