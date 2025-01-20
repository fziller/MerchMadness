import { Shirt } from "@db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

const useCombination = () => {
  const queryClient = useQueryClient();

  const postCombination = useMutation({
    mutationFn: async ({
      modelId,
      shirt,
      onSuccess,
    }: {
      modelId: string;
      shirt: Shirt;
      onSuccess?: (resultUrl: string) => void;
    }) => {
      const response = await fetch(`/api/combined`, {
        method: "POST",
        body: JSON.stringify({ modelId, shirt }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data, { onSuccess }) => {
      console.log("Success!", { data });
      queryClient.invalidateQueries({ queryKey: [`/api/combined`] });
      toast({
        title: "Success",
        description: `Combination successful!`,
      });
      onSuccess?.(data.resultUrl);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return { postCombination };
};

export default useCombination;
