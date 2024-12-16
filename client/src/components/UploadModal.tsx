import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type UploadModalProps = {
  type: 'model' | 'shirt';
  onClose: () => void;
};

export default function UploadModal({ type, onClose }: UploadModalProps) {
  const [formData, setFormData] = useState(new FormData());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/${type}s`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}s`] });
      toast({
        title: "Success",
        description: `${type} uploaded successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFormData = new FormData();
      newFormData.append('image', file);
      setFormData(newFormData);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    const metadata = formData.get('metadata') 
      ? JSON.parse(formData.get('metadata') as string) 
      : {};
    
    metadata[key] = value;
    formData.set('metadata', JSON.stringify(metadata));
    setFormData(new FormData(formData));
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              name="name"
              onChange={(e) => formData.set('name', e.target.value)}
              required
            />
          </div>

          {type === 'model' ? (
            <>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  onValueChange={(value) => formData.set('gender', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  onChange={(e) => handleMetadataChange('height', e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Size</Label>
                <Select
                  onValueChange={(value) => handleMetadataChange('size', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  onChange={(e) => handleMetadataChange('price', e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Image</Label>
            <Input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
