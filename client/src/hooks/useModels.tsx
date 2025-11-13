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
      // First iteration: upload model and file.
      Object.entries(formData).forEach(([key, value]) => {
        if (!(key === "model" || key === "automation")) {
          form.append(key, String(value));
        }
      });
      form.append("modelFile", formData.model.image);
      form.append("automationFile", formData.automation.image);
      form.append("resultName", formData.model.resultName);
      form.append("name", name ?? "");

      const response = await fetch(`/api/models`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      console.log("response", response);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response;
    },
    onSuccess: (_, { onClose }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/models`] });
      toast({
        title: "Success",
        description: `Model or automation uploaded successfully`,
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
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
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
    onSettled: (data) => {
      queryClient.refetchQueries({ queryKey: ["/api/models"] });
    },
  });
  return { uploadModelDocument, deleteModel };
};

export default useModels;
