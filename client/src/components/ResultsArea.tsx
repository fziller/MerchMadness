import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Model, Shirt, CombinedImage } from "@db/schema";

type ResultsAreaProps = {
  model: Model | null;
  shirt: Shirt | null;
};

export default function ResultsArea({ model, shirt }: ResultsAreaProps) {
  const { data: combinedImages } = useQuery<CombinedImage[]>({
    queryKey: ["/api/combined"],
    enabled: !!model && !!shirt,
  });

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "combined-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent>
        {!model || !shirt ? (
          <div className="text-center text-muted-foreground">
            Select both a model and a shirt to see results
          </div>
        ) : (
          <div className="space-y-4">
            {combinedImages?.map((combined) => (
              <div key={combined.id} className="relative group">
                <img
                  src={combined.resultUrl}
                  alt="Combined result"
                  className="w-full h-auto rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(combined.resultUrl)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
