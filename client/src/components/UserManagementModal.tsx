import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type UserManagementModalProps = {
  onClose: () => void;
};

interface User {
  id: number;
  username: string;
  password: string;
  isAdmin: boolean;
}

export default function UserManagementModal({
  onClose,
}: UserManagementModalProps) {
  const queryClient = useQueryClient();
  const [deletionWarning, setDeletionWarning] = useState<number | undefined>(
    undefined
  );

  const { data: users } = useQuery<User[]>({
    queryKey: [`/api/users`],
  });

  const updateUser = useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: number;
      payload: User;
    }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "POST",
        body: JSON.stringify(payload),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data, { userId, payload }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users`] });
      toast({
        title: "Success",
        description: `Successfully updated user ${payload.username}`,
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

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users`] });
      toast({
        title: "Success",
        description: `Successfully deleted user`,
      });
      setDeletionWarning(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <>
      <Dialog open onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Management</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>isAdmin</TableHead>
                <TableHead>Delete user</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell className="font-medium">*****</TableCell>
                    <TableCell className="font-medium">
                      <Checkbox
                        checked={user.isAdmin}
                        onCheckedChange={() =>
                          updateUser.mutate({
                            userId: user.id,
                            payload: { ...user, isAdmin: !user.isAdmin },
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Button
                        onClick={() => {
                          deletionWarning === user.id
                            ? deleteUser.mutate(user.id)
                            : setDeletionWarning(user.id);
                        }}
                        className={`${
                          deletionWarning === user.id
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-black hover:bg-gray-600"
                        }`}
                      >
                        {deletionWarning === user.id
                          ? "Confirm deletion"
                          : "Delete user"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
