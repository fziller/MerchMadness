import { act, renderHook } from "@testing-library/react-hooks";
import { useShirtFilter } from "../useShirtFilter";

describe("useShirtFilter", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useShirtFilter());
    expect(result.current.state).toEqual({
      size: [],
      color: [],
      brand: "",
    });
  });

  it("updates state when dispatch is called", () => {
    const { result } = renderHook(() => useShirtFilter());
    act(() => {
      result.current.dispatch({ type: "SET_SIZE", payload: ["small"] });
    });
    expect(result.current.state.size).toEqual(["small"]);
  });

  it("resets state when reset action is dispatched", () => {
    const { result } = renderHook(() => useShirtFilter());
    act(() => {
      result.current.dispatch({ type: "SET_SIZE", payload: ["small"] });
      result.current.dispatch({ type: "RESET" });
    });
    expect(result.current.state).toEqual({
      size: [],
      color: [],
      brand: "",
    });
  });
});
