import { useRef } from "react";
import useStoreEffect from "./useStoreEffect";
import useStoreContext from "./useStoreContext";

import type { SliceStores } from "../../types";
import type { RefObject } from "react";

/**
 * A custom hook that listens for changes to the store and returns the newest state.
 * Use this hook when you need to listen to a piece of state that does not
 * need the component to re-render when the state changes.
 * @param selector A selector function.
 * @returns The subscribed state.
 */
function useStoreSubscription<T>(
	selector: (state: SliceStores) => T
): RefObject<T> {
	const store = useStoreContext();

	const state = useRef(selector(store.getState()));

	useStoreEffect(selector, (newState) => {
		state.current = newState;
	});

	return state;
}

export default useStoreSubscription;
