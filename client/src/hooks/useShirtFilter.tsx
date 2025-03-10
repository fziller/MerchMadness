import { useReducer } from "react";

export enum ShirtActionType {
  SET_SIZE = "SET_SIZE",
  SET_COLOR = "SET_COLOR",
  SET_BRAND = "SET_BRAND",
  SET_MOTIV = "SET_MOTIV",
  RESET = "RESET",
}

export interface ShirtState {
  size: string[];
  color: string[];
  brand: string;
  motiv: string;
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
    motiv: "",
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
      case ShirtActionType.SET_MOTIV:
        return {
          ...state,
          motiv: action.payload as string,
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
