import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ImageViewModal from "./ImageViewModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Trash2 } from "lucide-react";
import type { Shirt } from "@db/schema";
import { useMutation } from "@tanstack/react-query";
import { deleteShirt } from "@/services/shirts";


type ShirtSelectionProps = {
  onSelect: (shirt: Shirt | null) => void;
  selected: Shirt | null;
  onToggleFilters: () => void; // Changed to non-optional
};

export default function ShirtSelection({
  onSelect,
  selected,
  onToggleFilters,
}: ShirtSelectionProps) {
  const { data: shirts } = useQuery<Shirt[]>({
    queryKey: ["/api/shirts"],
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShirt,
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/shirts'])
      toast({ title: 'Shirt deleted successfully!', description: '', kind: 'success' })
    },
    onError: (err: any) => {
      toast({ title: 'Error deleting shirt!', description: err.message, kind: 'error' })
    }
  });

  const [selectedImage, setSelectedImage] = useState<Shirt | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();


  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Shirt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onToggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-2 gap-2">
{!shirts || shirts.length === 0 ? (
            Array(6).fill(0).map((_, i) => (
              <div
                key={i}
                className="cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/50 aspect-square flex items-center justify-center bg-muted/50 relative group"
                onClick={() => onSelect(null)}
              >
                <span className="text-sm text-muted-foreground">
                  Shirt {i + 1}
                </span>
              </div>
            ))
          ) : (
            shirts.map((shirt) => (
              <div
                key={shirt.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 group ${
                  selected?.id === shirt.id ? "border-primary" : "border-transparent"
                }`}
                onClick={() => onSelect(shirt)}
              >
                <div className="relative">
                  <img
                    src={`/uploads/${shirt.imageUrl}`}
                    alt={shirt.name}
                    className="w-full h-64 object-contain bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(shirt);
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Are you sure you want to delete this shirt?")) {
                        deleteMutation.mutate(shirt.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {selectedImage && (
            <ImageViewModal
              imageUrl={`/uploads/${selectedImage.imageUrl}`}
              title={selectedImage.name}
              onClose={() => setSelectedImage(null)}
              onDelete={() => {
                if (window.confirm("Are you sure you want to delete this shirt?")) {
                  deleteMutation.mutate(selectedImage.id);
                  setSelectedImage(null);
                }
              }}
            />
          )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}