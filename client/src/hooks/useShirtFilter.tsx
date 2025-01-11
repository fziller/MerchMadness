import { useReducer } from "react";

export enum ShirtActionType {
  SET_SIZE = "SET_SIZE",
  SET_COLOR = "SET_COLOR",
  SET_BRAND = "SET_BRAND",
  RESET = "RESET",
}

export interface ShirtState {
  size: string[];
  color: string[];
  brand: string;
}

export interface ShirtAction {
  type: ShirtActionType;
  payload: string | string[];
}

export const useShirtFilter = () => {
  const initialState: ShirtState = {
    size: [],
    color: [],
    brand: "",
  };

  const shirtReducer = (state: ShirtState, action: ShirtAction) => {
    switch (action.type) {
      case ShirtActionType.SET_SIZE:
        return {
          ...state,
          size: action.payload as string[],
        };
      case ShirtActionType.SET_COLOR:
        return {
          ...state,
          color: action.payload as string[],
        };
      case ShirtActionType.SET_BRAND:
        return {
          ...state,
          brand: action.payload as string,
        };
      case ShirtActionType.RESET:
        return initialState;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(shirtReducer, initialState);

  return { dispatch, ShirtActionType, state };
};
