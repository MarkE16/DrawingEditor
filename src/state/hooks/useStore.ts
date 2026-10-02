// Lib
import { useStoreWithEqualityFn } from "zustand/traditional";
import useStoreContext from "./useStoreContext";

// Types
import type { SliceStores } from "@/types";

/**
 * A custom hook that retrieves a property of the Zustand store.
 *
 * **Note**: Selecting multiple properties from the store is not recommended,
 * as whenever a property changes, the component will re-render even if
 * the component does not use the changed property.
 *
 * If only one property
 * is needed, select that property. If multiple properties are needed,
 * ensure to pass the `useShallow` hook to the `useStore` hook and return
 * an object with the properties needed. This will prevent unnecessary
 * re-renders.
 *
 * Optionally, you can pass an equality function to compare the previous
 * and current state. If the equality function returns `true`, the component
 * will not re-render.
 * @param selector A function that accepts the store state
 * and returns property of the store to retrieve.
 * @param equalityFn An optional function that compares the previous and current state.
 * @returns A property of the store.
 */
export default function useStore<T>(
	selector: (state: SliceStores) => T,
	equalityFn?: (a: T, b: T) => boolean
): T {
	const store = useStoreContext();
	return useStoreWithEqualityFn(store, selector, equalityFn);
}
