import {
  ModelColors,
  ModelTypes,
  useModelFilter,
} from "@/context/ModelFilterContext";
import FilterPanel from "./FilterPanel";

interface ModelSelectionFilterPanel {
  onClose: () => void;
}

const ModelSelectionFilterPanel: React.FC<ModelSelectionFilterPanel> = (
  props
) => {
  const { onClose } = props;
  // hooks
  const { state: modelState, dispatch: modelDispatch } = useModelFilter();
  return (
    <FilterPanel
      onResetFilters={() => modelDispatch({ type: "RESET" })}
      title="Model Filters"
      onClose={() => onClose()}
      multiFilterConfig={{
        singleSelect: [
          {
            label: "Color",
            options: ModelColors,
            key: "Color",
            selectedOption: modelState.color,
            onSelectOption: (option) =>
              modelDispatch({
                type: "SET_COLOR",
                payload: option,
              }),
          },
          {
            label: "Type",
            options: ModelTypes,
            key: "type",
            onSelectOption: (option) =>
              modelDispatch({
                type: "SET_TYPE",
                payload: option,
              }),
            selectedOption: modelState.type,
          },
        ],
      }}
    />
  );
};

export default ModelSelectionFilterPanel;
