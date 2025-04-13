import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useCombination from "@/hooks/useCombination";
import useDownloadFiles from "@/hooks/useDownloadFiles";
import { CombinedImage, Model, Shirt } from "@db/schema";
import { useQuery } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";

interface MergeTabProps {
  models?: Model[];
  shirts?: Shirt[];
  color: string;
}

const MergeTab: React.FC<MergeTabProps> = (props) => {
  const { models, shirts, color } = props;

  const { postCombination, deleteCombination } = useCombination();
  const { downloadFile } = useDownloadFiles();

  const { data: combinedImages } = useQuery<CombinedImage[]>({
    queryKey: ["/api/combined"],
    enabled: !!models && !!shirts,
  });

  return (
    <div>
      <h1>Finish and merge</h1>
      <div className="space-y-2 flex-row gap-5">
        <Button
          onClick={() =>
            models &&
            models.map((model) =>
              shirts?.map((shirt) => {
                console.log("model", model, "shirt", shirt);
                postCombination.mutateAsync({
                  model: models?.find(
                    (m) => m.imageUrl === model.imageUrl
                  ) as Model,
                  shirt,
                  color,
                  motiv: "Large",
                });
              })
            )
          }
        >
          <span>Merge</span>
        </Button>
        <Button
          onClick={() =>
            combinedImages?.map((image) =>
              deleteCombination.mutateAsync({
                id: image.id.toString(),
              })
            )
          }
        >
          <span>Delete all</span>
        </Button>
        <Card>
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
                        // setSelectedImage(combined);
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
