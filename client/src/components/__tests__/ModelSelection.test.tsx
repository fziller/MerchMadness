import ModelSelection from "@/components/ModelSelection";
import type { Model } from "@db/schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Mock the hooks and components we don't want to test
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock data
const mockModels: Model[] = [
  {
    id: 1,
    name: "Test Model 1",
    imageUrl: "/uploads/test1.jpg",
    metadata: {
      gender: "male",
      height: 180,
      width: 75,
      genre: ["casual"],
      event: ["summer"],
    },
  },
  {
    id: 2,
    name: "Test Model 2",
    imageUrl: "/uploads/test2.jpg",
    metadata: {
      gender: "female",
      height: 170,
      width: 65,
      genre: ["formal"],
      event: ["winter"],
    },
  },
];

describe("ModelSelection", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ModelSelection
          onToggleFilters={vi.fn()}
          modelFilters={{}}
          onSelectedModelsChange={vi.fn()}
          onRemoveFilterFromSelection={vi.fn()}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Mock fetch for useQuery
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockModels),
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("renders without crashing", () => {
    renderComponent();
    expect(screen.getByText("Select Model")).toBeInTheDocument();
  });

  it.only("displays models from the API", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByAltText("Test Model 1")).toBeInTheDocument();
      expect(screen.getByAltText("Test Model 2")).toBeInTheDocument();
    });
  });

  it("opens image modal when clicking on an image", async () => {
    renderComponent();
    await waitFor(() => {
      const firstImage = screen.getByAltText("Test Model 1");
      fireEvent.click(firstImage);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("calls onToggleFilters when filter button is clicked", async () => {
    const onToggleFilters = vi.fn();
    renderComponent({ onToggleFilters });

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);
    expect(onToggleFilters).toHaveBeenCalled();
  });

  it("handles model deletion", async () => {
    const user = userEvent.setup();
    global.fetch = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockModels),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ message: "Model deleted successfully" }),
        })
      );

    global.confirm = vi.fn(() => true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByAltText("Test Model 1")).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByRole("button");
    const deleteButton = deleteButtons.find((button) =>
      button.querySelector("svg")
    );

    await user.click(deleteButton!);

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this model?"
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("filters models based on provided filters", async () => {
    const filters = {
      gender: "male",
      height: 180,
    };

    renderComponent({ modelFilters: filters });

    await waitFor(() => {
      const filteredModel = screen.getByAltText("Test Model 1");
      expect(filteredModel).toBeInTheDocument();
      expect(screen.queryByAltText("Test Model 2")).not.toBeInTheDocument();
    });
  });
});
