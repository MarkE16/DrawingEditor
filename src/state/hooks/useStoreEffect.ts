import { useEffect } from "react";
import { shallow } from "zustand/shallow";
import { SliceStores } from "@/types";
import useStoreContext from "./useStoreContext";

/**
 * A custom hook that allows you to subscribe to a specific state slice in the store
 * and perform side effects when such state changes.
 * @param selector A selector function.
 * @param effect An effect function that will be called when the selected state changes.
 * The effect can take the previous and current values of the selected state and perform side effects
 * based on those values.
 * @returns void
 */
function useStoreEffect<T>(
	selector: (state: SliceStores) => T,
	effect: (curr: T, prev: T) => void
) {
	const store = useStoreContext();

	useEffect(() => {
		const unsubscribe = store.subscribe(selector, effect, {
			equalityFn: shallow
		});

		return unsubscribe;
	}, [store, selector, effect]);
}

export default useStoreEffect;
