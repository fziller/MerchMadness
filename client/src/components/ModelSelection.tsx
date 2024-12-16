import { useQuery } from "@tanstack/react-query";
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
import { SlidersHorizontal } from "lucide-react";
import type { Model } from "@db/schema";

type ModelSelectionProps = {
  onSelect: (model: Model | null) => void;
  selected: Model | null;
};

export default function ModelSelection({ onSelect, selected }: ModelSelectionProps) {
  const { data: models } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Select onValueChange={(value) => {
            const selectedModel = models?.find(m => m.gender === value) || null;
            onSelect(selectedModel);
          }}>
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
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 gap-2">
            {models?.map((model) => (
              <div
                key={model.id}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                  selected?.id === model.id ? "border-primary" : "border-transparent"
                }`}
                onClick={() => onSelect(model)}
              >
                <img
                  src={model.imageUrl}
                  alt={model.name}
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
