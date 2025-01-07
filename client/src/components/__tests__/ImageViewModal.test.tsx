import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ImageViewModal from "@/components/ImageViewModal";
import type { MetaData } from "@/components/filter/FilterEnums";

describe("ImageViewModal", () => {
  const mockProps = {
    imageUrl: "/uploads/test-image.jpg",
    title: "Test Image",
    metadata: {
      gender: "male",
      height: 180,
      width: 75,
      genre: ["casual"],
      event: ["summer"],
    } as MetaData,
    onClose: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with all required props", () => {
    render(<ImageViewModal {...mockProps} />);
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByAltText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockProps.imageUrl);
  });

  it("displays metadata as filter badges", () => {
    render(<ImageViewModal {...mockProps} />);
    
    expect(screen.getByText(/Gender:/)).toBeInTheDocument();
    expect(screen.getByText(/Height:/)).toBeInTheDocument();
    expect(screen.getByText(/Genre:/)).toBeInTheDocument();
    expect(screen.getByText(/Event:/)).toBeInTheDocument();
  });

  it("calls onClose when dialog is dismissed", () => {
    render(<ImageViewModal {...mockProps} />);
    
    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it("calls onDelete with confirmation when delete button is clicked", () => {
    global.confirm = vi.fn(() => true);
    
    render(<ImageViewModal {...mockProps} />);
    
    const deleteButton = screen.getByRole("button", { name: "" }); // Button with trash icon
    fireEvent.click(deleteButton);
    
    expect(global.confirm).toHaveBeenCalledWith("Are you sure you want to delete this image?");
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it("does not call onDelete when delete confirmation is canceled", () => {
    global.confirm = vi.fn(() => false);
    
    render(<ImageViewModal {...mockProps} />);
    
    const deleteButton = screen.getByRole("button", { name: "" });
    fireEvent.click(deleteButton);
    
    expect(global.confirm).toHaveBeenCalled();
    expect(mockProps.onDelete).not.toHaveBeenCalled();
  });

  it("handles image urls with and without /uploads prefix", () => {
    const { rerender } = render(<ImageViewModal {...mockProps} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/test-image.jpg");

    rerender(<ImageViewModal {...mockProps} imageUrl="test-image.jpg" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/test-image.jpg");
  });
});
