import { type Shirt } from "@db/schema";

export async function deleteShirt(id: number): Promise<void> {
  const response = await fetch(`/api/shirts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function uploadShirt(formData: FormData): Promise<Shirt> {
  const response = await fetch("/api/shirts", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
