import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { toast } from "./use-toast";

const useModels = () => {
  const uploadModelDocument = useMutation({
    mutationFn: async ({
      formData,
      name,
      onClose,
    }: {
      formData: FormData;
      name: string;
      onClose: () => void;
    }) => {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          form.append("image", value);
        } else {
          console.log("Appending", key, value);
          form.append(key, String(value));
        }
      });
      form.append("name", name ?? "");
      console.log("form", form);

      const response = await fetch(`/api/models`, {
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
      queryClient.invalidateQueries({ queryKey: [`/api/models`] });
      toast({
        title: "Success",
        description: `Model uploaded successfully`,
      });
      onClose?.();
      console.log("OnSuccess triggered");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteModel = useMutation({
    mutationFn: async (modelId: number) => {
      const response = await fetch(`/api/models/${modelId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
  return { uploadModelDocument, deleteModel };
};

export default useModels;
