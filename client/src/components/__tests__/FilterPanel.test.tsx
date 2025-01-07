import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import FilterPanel from "@/components/FilterPanel";
import { ModelGender, ModelEvent, ModelGenre } from "@/components/filter/FilterEnums";

describe("FilterPanel", () => {
  const mockProps = {
    onApplyFilters: vi.fn(),
    onResetFilters: vi.fn(),
    onClose: vi.fn(),
    title: "Test Filters",
    multiFilterConfig: {
      singleSelect: [
        {
          label: "Gender",
          options: Object.values(ModelGender),
          key: "gender",
          onSelectOption: vi.fn(),
          selectedOption: undefined,
        },
      ],
      multiSelect: [
        {
          label: "Genre",
          options: Object.values(ModelGenre),
          key: "genre",
          selectedOptions: [],
          onSelectOption: vi.fn(),
        },
        {
          label: "Event",
          options: Object.values(ModelEvent),
          key: "event",
          selectedOptions: [],
          onSelectOption: vi.fn(),
        },
      ],
      rangeSlider: [
        {
          label: "Height",
          min: 150,
          max: 200,
          startValue: 150,
          selectedValue: undefined,
          onValueChange: vi.fn(),
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the provided title", () => {
    render(<FilterPanel {...mockProps} />);
    expect(screen.getByText("Test Filters")).toBeInTheDocument();
  });

  it("renders all filter types from the config", () => {
    render(<FilterPanel {...mockProps} />);
    
    // Check single select
    expect(screen.getByText("Gender")).toBeInTheDocument();
    
    // Check multi select
    expect(screen.getByText("Genre")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
    
    // Check range slider
    expect(screen.getByText("Height")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<FilterPanel {...mockProps} />);
    
    const closeButton = screen.getByRole("button", { name: "" }); // X icon button
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("calls onApplyFilters when Apply Filters button is clicked", () => {
    render(<FilterPanel {...mockProps} />);
    
    const applyButton = screen.getByRole("button", { name: "Apply Filters" });
    fireEvent.click(applyButton);
    
    expect(mockProps.onApplyFilters).toHaveBeenCalled();
  });

  it("calls onResetFilters and resets all filters when Reset button is clicked", () => {
    render(<FilterPanel {...mockProps} />);
    
    const resetButton = screen.getByRole("button", { name: "Reset" });
    fireEvent.click(resetButton);
    
    expect(mockProps.onResetFilters).toHaveBeenCalled();
    expect(mockProps.multiFilterConfig.singleSelect[0].onSelectOption).toHaveBeenCalledWith(undefined);
    expect(mockProps.multiFilterConfig.multiSelect[0].onSelectOption).toHaveBeenCalledWith([]);
    expect(mockProps.multiFilterConfig.rangeSlider[0].onValueChange).toHaveBeenCalledWith(undefined);
  });

  it("updates filter values when selections are made", () => {
    render(<FilterPanel {...mockProps} />);
    
    // Test single select
    const genderSelect = screen.getByText("Gender").closest("div")?.querySelector("button");
    fireEvent.click(genderSelect!);
    const maleOption = screen.getByText(ModelGender.MALE);
    fireEvent.click(maleOption);
    
    expect(mockProps.multiFilterConfig.singleSelect[0].onSelectOption).toHaveBeenCalledWith(ModelGender.MALE);

    // Test multi select
    const genreSelect = screen.getByText("Genre").closest("div")?.querySelector("button");
    fireEvent.click(genreSelect!);
    const casualOption = screen.getByText(ModelGenre.CASUAL);
    fireEvent.click(casualOption);
    
    expect(mockProps.multiFilterConfig.multiSelect[0].onSelectOption).toHaveBeenCalled();
  });
});
