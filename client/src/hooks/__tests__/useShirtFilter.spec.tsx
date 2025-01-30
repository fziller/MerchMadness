import { act, renderHook } from "@testing-library/react";
import { ShirtActionType, useShirtFilter } from "../useShirtFilter";

describe("useShirtFilter", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useShirtFilter());
    expect(result.current.state).toEqual({
      size: [],
      color: [],
      brand: "",
    });
  });

  it("updates size state when dispatch is called", () => {
    const { result } = renderHook(() => useShirtFilter());
    act(() => {
      result.current.dispatch({
        type: ShirtActionType.SET_SIZE,
        payload: ["small"],
      });
    });
    expect(result.current.state.size).toEqual(["small"]);
  });

  it("updates color state when dispatch is called", () => {
    const { result } = renderHook(() => useShirtFilter());
    act(() => {
      result.current.dispatch({
        type: ShirtActionType.SET_COLOR,
        payload: ["red", "blue"],
      });
    });
    expect(result.current.state.color).toEqual(["red", "blue"]);
  });

  it("updates brand state when dispatch is called", () => {
    const { result } = renderHook(() => useShirtFilter());
    act(() => {
      result.current.dispatch({
        type: ShirtActionType.SET_BRAND,
        payload: "BERND BRAND",
      });
    });
    expect(result.current.state.brand).toEqual("BERND BRAND");
  });

  it("resets state when reset action is dispatched", () => {
    const { result } = renderHook(() => useShirtFilter());
    act(() => {
      result.current.dispatch({
        type: ShirtActionType.SET_SIZE,
        payload: ["small"],
      });
      result.current.dispatch({ type: ShirtActionType.RESET, payload: [] });
    });
    expect(result.current.state).toEqual({
      size: [],
      color: [],
      brand: "",
    });
  });
});
