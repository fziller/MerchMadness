import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import type { Model } from "@db/schema";
import { useToast } from "@/hooks/use-toast";
import ImageViewModal from "./ImageViewModal";

type ModelSelectionProps = {
  onSelect: (model: Model | null) => void;
  selected: Model | null;
  onToggleFilters: () => void; // Changed to non-optional
};

export default function ModelSelection({
  onSelect,
  selected,
  onToggleFilters,
}: ModelSelectionProps) {
  const [selectedImage, setSelectedImage] = useState<Model | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (modelId: number) => {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Select
            onValueChange={(value) => {
              const selectedModel =
                models?.find((m) => m.gender === value) || null;
              onSelect(selectedModel);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={onToggleFilters} // Fixed onClick handler
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 gap-2">
            {models?.map((model) => {
              {
                selectedImage && (
                  <ImageViewModal
                    imageUrl={selectedImage.imageUrl}
                    title={selectedImage.name}
                    onClose={() => setSelectedImage(null)}
                    onDelete={() => {
                      deleteMutation.mutate(selectedImage.id);
                      setSelectedImage(null);
                    }}
                  />
                );
              }
              return (
                <div
                  key={model.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 group ${
                    selected?.id === model.id
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <div
                    className="relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(model);
                    }}
                  >
                    {model.imageUrl ? (
                      <img
                        src={
                          model.imageUrl.startsWith("/uploads")
                            ? model.imageUrl
                            : `/uploads/${model.imageUrl}`
                        }
                        alt={model.name}
                        className="w-full h-40 object-cover"
                        onClick={() => setSelectedImage(model)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <p>No Image</p>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this model?",
                          )
                        ) {
                          deleteMutation.mutate(model.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        {selectedImage && (
          <ImageViewModal
            imageUrl={
              selectedImage.imageUrl.startsWith("/uploads")
                ? selectedImage.imageUrl
                : `/uploads/${selectedImage.imageUrl}`
            }
            title={selectedImage.name}
            onClose={() => setSelectedImage(null)}
            onDelete={() => {
              if (
                window.confirm("Are you sure you want to delete this shirt?")
              ) {
                deleteMutation.mutate(selectedImage.id);
                setSelectedImage(null);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
