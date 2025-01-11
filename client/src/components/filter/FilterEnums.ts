export enum ModelGenre {
  CORE = "Core",
  METAL = "Metal",
  ROCK = "Rock",
  INDIE = "Indie",
  HIPHOP = "HipHop",
}

export enum ModelGender {
  MALE = "Male",
  FEMALE = "Female",
}

export enum ModelEvent {
  CHRISTMAS = "Christmas",
  HALLOWEEN = "Halloween",
  NEWYEAR = "Newyear",
}
type RangeTag = {
  label: string;
  type: "rangeSlider";
  min: number;
  max: number;
  key: string;
};
type SelectTag = {
  label: string;
  type: "singleSelect" | "multiSelect" | "dropdown";
  options: any[];
  key: string;
};

export const TagModelGender: SelectTag = {
  label: "Gender",
  type: "singleSelect",
  options: [ModelGender.MALE, ModelGender.FEMALE],
  key: "gender",
};

export const TagModelEvent: SelectTag = {
  label: "Event",
  type: "multiSelect",
  options: [ModelEvent.NEWYEAR, ModelEvent.HALLOWEEN, ModelEvent.CHRISTMAS],
  key: "event",
};

export const TagModelGenre: SelectTag = {
  label: "Genre",
  type: "multiSelect",
  options: [
    ModelGenre.FASHION,
    ModelGenre.STREETWEAR,
    ModelGenre.CASUAL,
    ModelGenre.ADVENTURE,
    ModelGenre.CAMPING,
    ModelGenre.FUTURE,
    ModelGenre.BEACH,
  ],
  key: "genre",
};

export const TagModelHeight: RangeTag = {
  label: "Height",
  type: "rangeSlider",
  min: 150,
  max: 250,
  key: "height",
};

export const TagModelWidth: RangeTag = {
  label: "Width",
  type: "rangeSlider",
  min: 25,
  max: 75,
  key: "width",
};

export const TagShirtSize: SelectTag = {
  type: "multiSelect",
  label: "Size",
  options: ["XS", "S", "M", "L", "XL", "XXL"],
  key: "size",
};

export const TagShirtColor: SelectTag = {
  type: "multiSelect",
  label: "Color",
  options: [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Black",
    "White",
  ],
  key: "color",
};

export const TagShirtBrand: SelectTag = {
  type: "dropdown",
  label: "Brand",
  options: ["AWD", "Gildan", "Stanley"],
  key: "brand",
};
export function isEnumValue<T extends {}>(
  enumType: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(enumType).includes(value as T[keyof T]); // okay
}

export type FilterConfig = {
  booleanFilter?: {
    label: string;
    options: any[];
    key: string;
    value: boolean;
  }[];
  multiSelect?: {
    label: string;
    options: any[]; // TODO These should be properly typed, but actual functions in HomePage.tsx do not like those.
    selectedOptions: any[];
    onSelectOption: (selectedOptions: any) => void;
    key: string;
  }[];
  singleSelect?: {
    label: string;
    options: any[];
    selectedOption?: any;
    onSelectOption: (option: any) => void;
    key: string;
  }[];
  rangeSlider?: {
    label: string;
    min: number;
    max: number;
    key: string;
    startValue: number;
    selectedValue: number | undefined;
    onValueChange: (value: number | undefined) => void;
  }[];
  dropdown?: {
    label: string;
    options: any[];
    selectedOption?: any;
    onSelectOption: (option: any) => void;
    key: string;
  }[];
};

export interface MetaData {
  [key: string]: string | number | string[] | undefined;
}
