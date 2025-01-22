import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCombination from "@/hooks/useCombination";
import useDownloadFiles from "@/hooks/useDownloadFiles";
import type { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
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

  const { postCombination, deleteCombination } = useCombination();
  const { zipAndDownload, downloadFile } = useDownloadFiles();

  const [images, setImages] = useState<{ resultUrl: string }[]>([]);

  // TODO The image view is not properly rerendered if we have more than one image.
  // Ideally, it will show one picture after another, but it waits until the full badge is finished.
  const handleCombine = async () => {
    shirts &&
      models &&
      shirts.map(async (shirt) => {
        models.map(async (model) => {
          const resultUrl = await postCombination.mutateAsync({
            model,
            shirt,
          });
          setImages((prev) => [...prev, { resultUrl }]);
        });
      });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Results</CardTitle>
        <div className="flex gap-2">
          <Button onClick={async () => await handleCombine()}>
            {"Combine (" +
              Number(shirts?.length) * Number(models?.length) +
              ")"}
          </Button>
          <Button
            variant="outline"
            onClick={async () =>
              await zipAndDownload(
                combinedImages?.map((image) => {
                  return { resultUrl: image.imageUrl };
                }) || []
              )
            }
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
        {combinedImages?.length === 0 && !postCombination.isPending ? (
          <div className="text-center text-muted-foreground">
            Select both a model and a shirt to see results
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
            {combinedImages?.map((combined) => (
              <div className="relative group">
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => downloadFile(combined.imageUrl)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <img
                  src={combined.imageUrl}
                  alt="Combined result"
                  className="w-full h-auto rounded-lg"
                />

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        "Are you sure you want to delete this combined image?"
                      )
                    ) {
                      deleteCombination.mutate({ id: combined.id.toString() });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {postCombination.isPending && (
              <div className="cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/50 aspect-square flex items-center justify-center bg-muted/50 relative group">
                <span className="text-sm text-muted-foreground justify-center items-center flex flex-col">
                  <ClipLoader
                    loading={postCombination.isPending}
                    color="blue"
                  />
                  <div className="items-center mt-2">Creating image ...</div>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
