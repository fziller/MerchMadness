import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import JSZip from "jszip";
import { Download } from "lucide-react";

type ResultsAreaProps = {
  models: Model[] | null;
  shirts: Shirt[] | null;
};

export default function ResultsArea({ models, shirts }: ResultsAreaProps) {
  const { data: combinedImages } = useQuery<CombinedImage[]>({
    queryKey: ["/api/combined"],
    enabled: !!models && !!shirts,
  });

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "combined-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TODO This one needs to handle the combination, which is the photoshop script part.
  const handleCombine = () => {
    alert(
      `Combining model images ${models
        ?.map((m) => m.name)
        .join(", ")} with shirts ${shirts?.map((s) => s.name).join(", ")}...`
    );
  };

  const handleDownloadAll = async () => {
    await handleZipFiles();
  };

  const handleZipFiles = async () => {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    if (!imagesFolder) {
      throw new Error("Failed to create zip folder");
    }
    // TODO This needs to be replaced with the actually combined images
    if (!models) return;
    for (const model in models) {
      await fetch(models[model].imageUrl)
        .then(async (response) => {
          const ab = response.arrayBuffer();
          // TODO File extension needs to be changed (configurable?)
          imagesFolder.file(`${models[model].id}.jpg`, ab);
        })
        .catch((error) => {
          console.log("Fetch images", error);
        });
    }

    const zipContent = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(zipContent);
    const link = document.createElement("a");
    link.href = url;
    link.download = "selected_images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Results</CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleCombine}>Combine</Button>
          <Button
            variant="outline"
            onClick={async () => await handleDownloadAll()}
          >
            Download All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!models || models.length === 0 || !shirts || shirts.length === 0 ? (
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
                  onClick={async () => await handleDownload(combined.resultUrl)}
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
