import { useReducer, useEffect } from "react";

export enum ModelActionType {
  SET_WIDTH = "SET_WIDTH",
  SET_HEIGHT = "SET_HEIGHT",
  SET_GENRE = "SET_GENRE",
  SET_EVENT = "SET_EVENT",
  SET_GENDER = "SET_GENDER",
  RESET = "RESET",
  SET_COLOR = "SET_COLOR",
  SET_TYPE = "SET_TYPE",
  SET_MANY = "SET_MANY", // better name than ALL
}

export type ModelType = (typeof ModelTypes)[number];

export interface ModelState {
  width?: number;
  height?: number;
  genre: string[];
  event: string[];
  gender: string[];
  color: string[];
  type: ModelType;
}

// Make action payloads precise, not a giant union
type ModelAction =
  | { type: ModelActionType.SET_WIDTH; payload: number | undefined }
  | { type: ModelActionType.SET_HEIGHT; payload: number | undefined }
  | { type: ModelActionType.SET_GENRE; payload: string[] }
  | { type: ModelActionType.SET_EVENT; payload: string[] }
  | { type: ModelActionType.SET_GENDER; payload: string[] }
  | { type: ModelActionType.SET_COLOR; payload: string[] }
  | { type: ModelActionType.SET_TYPE; payload: ModelType }
  | { type: ModelActionType.SET_MANY; payload: Partial<ModelState> }
  | { type: ModelActionType.RESET };

const initialState: ModelState = {
  width: undefined,
  height: undefined,
  genre: [],
  event: [],
  gender: [],
  color: [],
  type: "Longsleeve",
};

function modelReducer(state: ModelState, action: ModelAction): ModelState {
  switch (action.type) {
    case ModelActionType.SET_TYPE:
      return { ...state, type: action.payload };
    case ModelActionType.SET_COLOR:
      return { ...state, color: action.payload };
    case ModelActionType.SET_WIDTH:
      return { ...state, width: action.payload };
    case ModelActionType.SET_HEIGHT:
      return { ...state, height: action.payload };
    case ModelActionType.SET_GENRE:
      return { ...state, genre: action.payload };
    case ModelActionType.SET_EVENT:
      return { ...state, event: action.payload };
    case ModelActionType.SET_GENDER:
      return { ...state, gender: action.payload };
    case ModelActionType.SET_MANY:
      // Merge partials; covers color/type too
      return { ...state, ...action.payload };
    case ModelActionType.RESET:
      // <-- this is the real reset
      return initialState;
    default:
      return state;
  }
}

export const useModelFilter = () => {
  const [state, dispatch] = useReducer(modelReducer, initialState);

  // optional: prove updates happen
  // useEffect(() => { console.log("model state changed:", state); }, [state]);

  return { dispatch, ModelActionType, state };
};
