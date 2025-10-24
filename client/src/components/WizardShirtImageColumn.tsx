import { Shirt } from "@db/schema";
import ContentCard from "./ContentCard";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useMemo } from "react";

interface WizardShirtImageColumnProps {
  onDelete?: (id: number) => void;
  shirts: Shirt[];
  title: string;
  selectedContent?: number[];
  setSelectedContent?: (selectedContent: number[]) => void;
  badges?: string[];
  showSelectAll?: boolean;
}
const WizardShirtImageColumn: React.FC<WizardShirtImageColumnProps> = (
  props
) => {
  const {
    onDelete,
    shirts,
    title,
    selectedContent,
    setSelectedContent,
    showSelectAll = false,
    badges,
  } = props;

  const {
    columnIds,
    selectedInColumnCount,
    allSelected,
    noneSelected,
    checkboxState,
  } = useMemo(() => {
    const columnIds = shirts.map((s) => s.id);
    const selectedInColumnCount = columnIds.filter((id) =>
      selectedContent?.includes(id)
    ).length;
    const allSelected =
      shirts.length > 0 && selectedInColumnCount === shirts.length;
    const noneSelected = selectedInColumnCount === 0;

    // shadcn Checkbox supports boolean | "indeterminate"
    const checkboxState: boolean | "indeterminate" = allSelected
      ? true
      : noneSelected
      ? false
      : "indeterminate";

    return {
      columnIds,
      selectedInColumnCount,
      allSelected,
      noneSelected,
      checkboxState,
    };
  }, [shirts, selectedContent]);

  const toggleSelectAll = () => {
    if (!setSelectedContent) return;

    if (allSelected) {
      // Deselect only this column’s shirts, keep others
      const toRemove = new Set(columnIds);
      setSelectedContent(
        selectedContent?.filter((id) => !toRemove.has(id)) ?? []
      );
    } else {
      // Select union: keep existing + add this column’s shirts
      const union = new Set([...(selectedContent ?? []), ...columnIds]);
      setSelectedContent(Array.from(union));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-row items-center gap-8 justify-center">
        <label className="font-bold">{title}</label>
        {showSelectAll && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => toggleSelectAll()}
          >
            <Checkbox className="h-4 w-4" checked={allSelected} />
            Select All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,18rem)] gap-2">
        {shirts &&
          shirts.map((shirt) => (
            <ContentCard
              badges={badges}
              content={shirt}
              selectedContent={selectedContent ?? []}
              setSelectedContent={(content) => setSelectedContent?.(content)}
              onDeleteClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(shirt.id);
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default WizardShirtImageColumn;
