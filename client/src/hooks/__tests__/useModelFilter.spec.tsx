import { act, renderHook } from "@testing-library/react";
import { ModelActionType, useModelFilter } from "../useModelFilter";

describe("useModelFilter", () => {
  const defaultState = {
    event: [],
    gender: [],
    genre: [],
    height: undefined,
    width: undefined,
  };
  it("initializes with default state", () => {
    const { result } = renderHook(() => useModelFilter());
    expect(result.current.state).toEqual(defaultState);
  });

  it("updates gender state when dispatch is called", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({
        type: ModelActionType.SET_GENDER,
        payload: "male",
      });
    });
    expect(result.current.state.gender).toBe("male");
  });

  it("updates width state when dispatch is called", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({ type: ModelActionType.SET_WIDTH, payload: 12 });
    });
    expect(result.current.state.width).toBe(12);
  });

  it("updates height state when dispatch is called", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({
        type: ModelActionType.SET_HEIGHT,
        payload: 24,
      });
    });
    expect(result.current.state.height).toBe(24);
  });

  it("updates genre state when dispatch is called", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({
        type: ModelActionType.SET_GENRE,
        payload: ["action", "fantasy"],
      });
    });
    expect(result.current.state.genre).toStrictEqual(["action", "fantasy"]);
  });

  it("updates event state when dispatch is called", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({
        type: ModelActionType.SET_EVENT,
        payload: ["event1", "event2"],
      });
    });
    expect(result.current.state.event).toStrictEqual(["event1", "event2"]);
  });

  it("resets state when reset action is dispatched", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({
        type: ModelActionType.SET_GENDER,
        payload: "male",
      });
      result.current.dispatch({ type: ModelActionType.RESET, payload: [] });
    });
    expect(result.current.state).toEqual(defaultState);
  });
});
