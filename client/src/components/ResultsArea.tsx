import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCombination from "@/hooks/useCombination";
import useDownloadFiles from "@/hooks/useDownloadFiles";
import type { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

type ResultsAreaProps = {
  models: Model[] | null;
  shirts: Shirt[] | null;
};

export default function ResultsArea({ models, shirts }: ResultsAreaProps) {
  const { data: combinedImages } = useQuery<CombinedImage[]>({
    queryKey: ["/api/combined"],
    enabled: !!models && !!shirts,
  });

  const { postCombination } = useCombination();
  const { zipAndDownload, downloadFile } = useDownloadFiles();

  const [images, setImages] = useState<{ resultUrl: string }[]>([]);

  console.log("ResultArea", { models, shirts, images });

  const handleCombine = async () => {
    shirts &&
      shirts.map(async (shirt) => {
        const result = await postCombination.mutateAsync({
          modelId: "123",
          shirt,
          onSuccess: (resultUrl) => {
            setImages((prev) => [...prev, { resultUrl }]);
          },
        });
        console.log({ result });
      });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Results</CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleCombine}>Combine</Button>
          <Button
            variant="outline"
            onClick={async () => await zipAndDownload(images)}
          >
            Download All
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImages([]);
            }}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {images?.length === 0 && !postCombination.isPending ? (
          <div className="text-center text-muted-foreground">
            Select both a model and a shirt to see results
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
            {images?.map((combined) => (
              <div className="relative group">
                <img
                  src={combined.resultUrl}
                  alt="Combined result"
                  className="w-full h-auto rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => downloadFile(combined.resultUrl)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <ClipLoader loading={postCombination.isPending} color="blue" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
