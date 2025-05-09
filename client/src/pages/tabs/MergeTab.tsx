import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import useCombination from "@/hooks/useCombination";
import useDownloadFiles from "@/hooks/useDownloadFiles";
import { CombinedImage, Model, Shirt } from "@db/schema";
import { Download, DownloadCloud, Merge, Trash, Trash2 } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";

interface MergeTabProps {
  models?: Model[];
  shirts?: Shirt[];
  combinedImages?: CombinedImage[];
  color: string;
}

const MergeTab: React.FC<MergeTabProps> = (props) => {
  const { models, shirts, color, combinedImages } = props;

  const { postCombination, deleteCombination } = useCombination();
  const { downloadFile, zipAndDownload } = useDownloadFiles();

  const mergeOnClick = () => {
    shirts?.map((shirt) => {
      if (shirt.imageUrl.includes("_front")) {
        const frontModels = models
          ?.filter((model) => model.direction === "front")

          .filter((model) => model.color === color);
        if (!frontModels || frontModels.length === 0) {
          toast({
            title: "Error",
            description:
              "Could not find a matching model. Make to select the right color or upload a new model.",
          });
        }
        if (frontModels && frontModels?.length > 0) {
          frontModels.map((model) => {
            postCombination.mutateAsync({
              model,
              shirt,
              color,
            });
          });
        }
      }
      if (shirt.imageUrl.includes("_back")) {
        const backModels = models
          ?.filter((model) => model.direction === "back")

          .filter((model) => model.color === color);
        if (!backModels || backModels.length === 0) {
          toast({
            title: "Error",
            description:
              "Could not find a matching model. Make to select the right color or upload a new model.",
          });
        }
        if (backModels && backModels?.length > 0) {
          backModels.map((model) => {
            postCombination.mutateAsync({
              model,
              shirt,
              color,
            });
          });
        }
      }
    });
  };

  return (
    <div className="items-center">
      <h1>Merge and finish</h1>
      <div>
        <div className="flex flex-row items-center justify-center gap-5 mb-3 mt-5">
          <Button
            disabled={!models || !shirts || postCombination.isPending}
            onClick={mergeOnClick}
          >
            <div className="flex flex-row items-center space-x-2">
              <Merge size={20} />
              <span>Merge</span>
            </div>
          </Button>
          {combinedImages && combinedImages.length > 0 && (
            <Button
              disabled={postCombination.isPending}
              variant={"secondary"}
              onClick={() =>
                zipAndDownload(
                  combinedImages?.map((image) => {
                    return { resultUrl: image.imageUrl };
                  }) || []
                )
              }
            >
              <div className="flex flex-row items-center space-x-2">
                <DownloadCloud size={20} />
                <span>Download all</span>
              </div>
            </Button>
          )}
          <Button
            disabled={postCombination.isPending}
            variant={"destructive"}
            onClick={() =>
              combinedImages?.map((image) =>
                deleteCombination.mutateAsync({
                  id: image.id.toString(),
                })
              )
            }
          >
            <div className="flex flex-row items-center space-x-2">
              <Trash size={20} />
              <span>Delete all</span>
            </div>
          </Button>
        </div>
        <Card className="mt-5">
          <CardContent>
            {combinedImages?.length === 0 && !postCombination.isPending ? (
              <div className="text-center text-muted-foreground items-center justify-center">
                Press `Merge` to combine Models and Shirts
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
                          deleteCombination.mutate({
                            id: combined.id.toString(),
                          });
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
                      <div className="items-center mt-2">
                        Creating image ...
                      </div>
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MergeTab;
