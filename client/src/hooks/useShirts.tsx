import { deleteShirt } from "@/services/shirts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

const useShirts = () => {
  const queryClient = useQueryClient();

  const deleteSingleShirt = useMutation({
    mutationFn: (id: number) => deleteShirt(id),
    onSuccess: () => {
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
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shirts"] });
    },
  });

  const uploadShirt = useMutation({
    mutationFn: async ({
      formData,
      name,
      color,
    }: {
      formData: FormData;
      name: string;
      color: string;
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
      form.append("color", color ?? "");

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
