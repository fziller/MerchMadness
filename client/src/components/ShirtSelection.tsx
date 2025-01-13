import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ShirtState } from "@/hooks/useShirtFilter";
import { filterByType } from "@/lib/utils";
import { deleteShirt } from "@/services/shirts";
import type { Shirt } from "@db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ActiveFilters from "./ActiveFilters";
import ImageViewModal from "./ImageViewModal";
import { MetaData } from "./filter/FilterEnums";
import { Checkbox } from "./ui/checkbox";

type ShirtSelectionProps = {
  onToggleFilters: () => void; // Changed to non-optional
  shirtFilter: ShirtState;
  onSelectedShirtsChange: (selectedShirts: Shirt[]) => void;
  onRemoveFilterFromSelection: (metadata: MetaData) => void;
};

export default function ShirtSelection({
  onToggleFilters,
  shirtFilter,
  onSelectedShirtsChange,
  onRemoveFilterFromSelection,
}: ShirtSelectionProps) {
  const { data: shirts } = useQuery<Shirt[]>({
    queryKey: ["/api/shirts"],
  });
  const { user } = useUser();
  const [changeFilterValue, setChangeFilterValue] = useState(false);
  const [selectedShirts, setSelectedShirts] = useState<string[]>([]); // Stores the imageUrls of the selected models

  const deleteMutation = useMutation({
    mutationFn: deleteShirt,
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/shirts"]);
      toast({
        title: "Shirt deleted successfully!",
        description: "",
        kind: "success",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error deleting shirt!",
        description: err.message,
        kind: "error",
      });
    },
  });

  console.log("Shirts", shirtFilter);

  const [filteredShirts, setFilteredShirts] = useState<Shirt[]>(shirts || []);
  useEffect(() => {
    const shirtsAfterChange = shirts
      ? shirtFilter
        ? shirts.filter((shirt) => filterByType(shirtFilter, shirt))
        : shirts
      : [];
    setFilteredShirts(shirtsAfterChange);
    // If we have models selected, we only want to use the selected ones.
    if (selectedShirts.length > 0) {
      onSelectedShirtsChange(
        shirtsAfterChange.filter((shirt) =>
          selectedShirts.includes(shirt.imageUrl)
        )
      );
      // If no model is selected, we assume to take every model we see.
    } else {
      onSelectedShirtsChange(shirtsAfterChange);
    }
  }, [shirts, shirtFilter, changeFilterValue, selectedShirts]);

  const [selectedImage, setSelectedImage] = useState<Shirt | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Shirt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() =>
              selectedShirts.length === filteredShirts.length
                ? setSelectedShirts([])
                : setSelectedShirts(shirts?.map((shirt) => shirt.imageUrl))
            } // Fixed onClick handler
          >
            <Checkbox
              className="h-4 w-4"
              checked={
                selectedShirts.length > 0 &&
                selectedShirts.length === filteredShirts.length
              }
            />
            Select All
          </Button>
          <div className="space-y-4 ml-4 w-full">
            <ActiveFilters
              filters={shirtFilter}
              onRemove={(key) => {
                shirtFilter && delete shirtFilter[key];
                setChangeFilterValue(!changeFilterValue);
                onRemoveFilterFromSelection(shirtFilter);
              }}
            />
          </div>
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
          <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
            {!filteredShirts || filteredShirts.length === 0
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/50 aspect-square flex items-center justify-center bg-muted/50 relative group"
                    >
                      <span className="text-sm text-muted-foreground">
                        Shirt {i + 1}
                      </span>
                    </div>
                  ))
              : filteredShirts.map((shirt) => (
                  <div
                    key={shirt.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 p-2 group ${
                      selectedShirts.includes(shirt.imageUrl)
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <div className="relative">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedShirts.includes(shirt.imageUrl)) {
                            setSelectedShirts(
                              selectedShirts.filter(
                                (id) => id !== shirt.imageUrl
                              )
                            );
                          } else {
                            setSelectedShirts([
                              ...selectedShirts,
                              shirt.imageUrl,
                            ]);
                          }
                        }}
                      >
                        <Checkbox
                          id={`shirt-${shirt.id}-2`}
                          checked={selectedShirts.includes(shirt.imageUrl)}
                          onCheckedChange={() => {
                            if (selectedShirts.includes(shirt.imageUrl)) {
                              setSelectedShirts(
                                selectedShirts.filter(
                                  (id) => id !== shirt.imageUrl
                                )
                              );
                            } else {
                              setSelectedShirts([
                                ...selectedShirts,
                                shirt.imageUrl,
                              ]);
                            }
                          }}
                        />
                      </Button>
                      <img
                        src={
                          shirt.imageUrl.startsWith("/uploads")
                            ? shirt.imageUrl
                            : `/uploads/${shirt.imageUrl}`
                        }
                        alt={shirt.name}
                        className="w-full h-64 object-contain bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(shirt);
                        }}
                      />
                      {(user?.isAdmin || user?.username === "admin") && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this shirt?"
                              )
                            ) {
                              deleteMutation.mutate(shirt.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

            {selectedImage && (
              <ImageViewModal
                imageUrl={
                  selectedImage.imageUrl.startsWith("/uploads")
                    ? selectedImage.imageUrl
                    : `/uploads/${selectedImage.imageUrl}`
                }
                title={selectedImage.name}
                metadata={selectedImage.metadata as MetaData}
                onClose={() => setSelectedImage(null)}
                onDelete={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this shirt?"
                    )
                  ) {
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
