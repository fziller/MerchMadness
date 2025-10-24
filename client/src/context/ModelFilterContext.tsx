import { createContext, useContext, useReducer } from "react";

export const ModelTypes = ["Longsleeve", "Shortsleeve"];
export const ModelColors = ["black", "white", "orange"];
type ModelType = (typeof ModelTypes)[number];

export interface ModelState {
  color: string;
  type: ModelType;
}

const initialState: ModelState = {
  color: "",
  type: "",
};

export enum ModelActionType {}

type Action =
  | { type: "SET_MANY"; payload: Partial<ModelState> }
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_TYPE"; payload: ModelType }
  | { type: "RESET" }
  | { type: "CLEAR_KEY"; payload: keyof ModelState };

function reducer(state: ModelState, action: Action): ModelState {
  switch (action.type) {
    case "SET_COLOR":
      return { ...state, color: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_MANY":
      return { ...state, ...action.payload };
    case "CLEAR_KEY": {
      const key = action.payload;
      const empty: Partial<ModelState> = {
        color: "",
        type: "",
      };
      return { ...state, [key]: empty[key as keyof typeof empty] };
    }
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const Ctx = createContext<{
  state: ModelState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export const ModelFilterProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
};

export const useModelFilter = () => useContext(Ctx);
