import { queryClient } from "@/lib/queryClient";
import { Model, Shirt } from "@db/schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";

interface PostCombinationMutationProps {
  model: Model;
  shirt: Shirt;
  onSuccess?: (resultUrl: string) => void;
}

interface DeleteCombinationMutationProps {
  id: string;
}

const useCombination = () => {
  const deleteCombination = useMutation({
    mutationFn: async ({ id }: DeleteCombinationMutationProps) => {
      const response = await fetch(`/api/combined/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/combined"] });
      toast({
        title: "Combination deleted successfully!",
        description: "",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error deleting combination!",
        description: err.message,
      });
    },
  });

  const postCombination = useMutation({
    mutationFn: async ({ model, shirt }: PostCombinationMutationProps) => {
      const response = await fetch(`/api/combined`, {
        method: "POST",
        body: JSON.stringify({ model, shirt }),
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
      queryClient.invalidateQueries({
        queryKey: [`/api/combined`],
        refetchType: "all",
      });
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

  return { deleteCombination, postCombination };
};

export default useCombination;
