import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import type { Shirt } from "@db/schema";

type ShirtSelectionProps = {
  onSelect: (shirt: Shirt | null) => void;
  selected: Shirt | null;
};

export default function ShirtSelection({ onSelect, selected }: ShirtSelectionProps) {
  const { data: shirts } = useQuery<Shirt[]>({
    queryKey: ["/api/shirts"],
  });

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
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-2 gap-2">
            {shirts?.map((shirt) => (
              <div
                key={shirt.id}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                  selected?.id === shirt.id ? "border-primary" : "border-transparent"
                }`}
                onClick={() => onSelect(shirt)}
              >
                <img
                  src={shirt.imageUrl}
                  alt={shirt.name}
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
