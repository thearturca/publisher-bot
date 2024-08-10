import { Dispatch, useReducer } from "react";

type SetStateAction<T> = T | ((prev: T) => T);

type STATE<T> = [T, Dispatch<SetStateAction<Partial<T>>>];

function isCallback<T>(action: SetStateAction<T>): action is (prev: T) => T {
      return typeof action === "function";
}

const stateReducer = <T>(state: T, action: SetStateAction<Partial<T>>) => ({
      ...state,
      ...(isCallback(action) ? action(state) : action),
});

export const useStore = <T>(initial: T): STATE<T> => {
      return useReducer(stateReducer<T>, initial);
};
