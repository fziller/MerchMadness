import { act, renderHook } from "@testing-library/react-hooks";
import { useModelFilter } from "../useModelFilter";

describe("useModelFilter", () => {
  it("initializes with default state", () => {
    const { result } = renderHook(() => useModelFilter());
    expect(result.current.state).toEqual({
      // default state values
    });
  });

  it("updates state when dispatch is called", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({ type: "SET_GENDER", payload: "male" });
    });
    expect(result.current.state.gender).toBe("male");
  });

  it("resets state when reset action is dispatched", () => {
    const { result } = renderHook(() => useModelFilter());
    act(() => {
      result.current.dispatch({ type: "SET_GENDER", payload: "male" });
      result.current.dispatch({ type: "RESET" });
    });
    expect(result.current.state).toEqual({
      // default state values
    });
  });
});
