import { deleteShirt } from "@/services/shirts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

const useShirts = () => {
  const queryClient = useQueryClient();

  const deleteSingleShirt = useMutation({
    mutationFn: deleteShirt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shirts"] });
      toast({
        title: "Shirt deleted successfully!",
        description: "",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error deleting shirt!",
        description: err.message,
      });
    },
  });

  const uploadShirt = useMutation({
    mutationFn: async ({
      formData,
      name,
    }: {
      formData: FormData;
      name: string;
      onClose?: () => void;
    }) => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          form.append("image", value);
        } else {
          form.append(key, String(value));
        }
      });
      form.append("name", name ?? "");

      const response = await fetch(`/api/shirts`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (_, { onClose }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/shirts`] });
      toast({
        title: "Success",
        description: `Shirt uploaded successfully`,
      });
      onClose?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return { deleteSingleShirt, uploadShirt };
};

export default useShirts;
