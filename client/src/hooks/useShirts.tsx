import { deleteShirt } from "@/services/shirts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

const useShirts = () => {
  const queryClient = useQueryClient();

  const deleteSingleShirt = useMutation({
    mutationFn: deleteShirt,
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/shirts"]);
      toast({
        title: "Shirt deleted successfully!",
        description: "",
        kind: "success",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error deleting shirt!",
        description: err.message,
        kind: "error",
      });
    },
  });

  return { deleteSingleShirt };
};

export default useShirts;
