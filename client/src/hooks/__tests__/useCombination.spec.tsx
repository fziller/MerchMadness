import { queryClient } from "@/setupTests";
import { Model, Shirt } from "@db/schema";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import nock from "nock";
import { vi } from "vitest";
import useCombination from "../useCombination";

describe("useCombination", () => {
  const mockModel = {
    id: 123,
    name: "Test Model",
    imageUrl: "test.jpg",
  } as Model;
  const mockShirt = {
    id: 456,
    name: "Test Shirt",
    imageUrl: "test.jpg",
  } as Shirt;

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("calls postcombination", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCombination({ onSuccess }), {
      wrapper,
    });
    const expectation = nock("http://localhost:3000")
      .post("/api/combined")
      .reply(200, {
        answer: 42,
      });
    await result.current.postCombination.mutateAsync({
      model: mockModel,
      shirt: mockShirt,
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
