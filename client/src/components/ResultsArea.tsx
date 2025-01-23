import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCombination from "@/hooks/useCombination";
import useDownloadFiles from "@/hooks/useDownloadFiles";
import type { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import ImageViewModal from "./ImageViewModal";

type ResultsAreaProps = {
  models: Model[] | null;
  shirts: Shirt[] | null;
};

export default function ResultsArea({ models, shirts }: ResultsAreaProps) {
  const { data: combinedImages } = useQuery<CombinedImage[]>({
    queryKey: ["/api/combined"],
    enabled: !!models && !!shirts,
  });

  const [combinations, setCombinations] = useState<
    {
      model: Model;
      shirt: Shirt;
    }[]
  >([]);

  const { postCombination, deleteCombination } = useCombination();
  const { zipAndDownload, downloadFile } = useDownloadFiles();
  const [selectedImage, setSelectedImage] = useState<CombinedImage | null>();

  useEffect(() => {
    const combineImages = async ({
      model,
      shirt,
    }: {
      model: Model;
      shirt: Shirt;
    }) => {
      await postCombination.mutateAsync({
        model,
        shirt,
      });
    };
    if (!combinations.length) return;
    combineImages(combinations[0]).then(() => {
      setCombinations((prev) => prev.slice(1));
    });
  }, [combinations]);

  const handleCombine = async () => {
    const combs: { model: Model; shirt: Shirt }[] = [];
    shirts &&
      models &&
      shirts.map(async (shirt) => {
        models.map(async (model) => {
          combs.push({
            model,
            shirt,
          });
        });
      });
    setCombinations(combs);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Results</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={async () => await handleCombine()}
            disabled={combinations.length > 0}
          >
            {"Combine (" +
              Number(shirts?.length) * Number(models?.length) +
              ")"}
          </Button>
          <Button
            variant="outline"
            disabled={combinedImages?.length === 0}
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
              combinedImages?.map((combined) =>
                deleteCombination.mutate({ id: combined.id.toString() })
              );
            }}
          >
            {"Clear (" + combinedImages?.length + ")"}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(combined);
                  }}
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
              <div className="h-auto cursor-pointer rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/50 aspect-square flex items-center justify-center bg-muted/50 relative group">
                <span className="text-sm text-muted-foreground justify-center items-center flex flex-col">
                  <ClipLoader
                    loading={postCombination.isPending}
                    color="blue"
                  />
                  <div className="items-center mt-2">Creating image ...</div>
                </span>
              </div>
            )}
            {selectedImage && (
              <ImageViewModal
                imageUrl={
                  selectedImage.imageUrl.startsWith("/uploads")
                    ? selectedImage.imageUrl
                    : `/uploads/${selectedImage.imageUrl}`
                }
                title={selectedImage.id.toString()}
                onClose={() => setSelectedImage(null)}
                onDelete={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this combination?"
                    )
                  ) {
                    deleteCombination.mutate({
                      id: selectedImage.id.toString(),
                    });
                    setSelectedImage(null);
                  }
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
