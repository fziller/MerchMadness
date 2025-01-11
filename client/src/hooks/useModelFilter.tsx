import { useReducer } from "react";

export enum ModelActionType {
  SET_WIDTH = "SET_WIDTH",
  SET_HEIGHT = "SET_HEIGHT",
  SET_GENRE = "SET_GENRE",
  SET_EVENT = "SET_EVENT",
  SET_GENDER = "SET_GENDER",
  RESET = "RESET",
  ALL = "ALL",
}

export interface ModelState {
  width?: number;
  height?: number;
  genre: string[];
  event: string[];
  gender: string[];
}

export interface ModelAction {
  type: ModelActionType;
  payload: string | string[] | number | ModelState;
}

export const useModelFilter = () => {
  const initialState: ModelState = {
    width: undefined,
    height: undefined,
    genre: [],
    event: [],
    gender: [],
  };

  const modelReducer = (state: ModelState, action: ModelAction) => {
    switch (action.type) {
      case ModelActionType.SET_WIDTH:
        return {
          ...state,
          width: action.payload as number,
        };
      case ModelActionType.SET_HEIGHT:
        return {
          ...state,
          height: action.payload as number,
        };
      case ModelActionType.SET_GENRE:
        return {
          ...state,
          genre: action.payload as string[],
        };
      case ModelActionType.SET_EVENT:
        return {
          ...state,
          event: action.payload as string[],
        };
      case ModelActionType.SET_GENDER:
        return {
          ...state,
          gender: action.payload as string[],
        };
      case ModelActionType.ALL:
        return {
          ...state,
          width: action.payload.width,
          height: action.payload.height,
          genre: action.payload.genre,
          event: action.payload.event,
          gender: action.payload.gender,
        };
      case ModelActionType.RESET:
        return {
          ...state,
          initialState,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(modelReducer, initialState);

  return { dispatch, ModelActionType, state };
};
