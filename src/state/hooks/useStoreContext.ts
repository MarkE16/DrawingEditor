import { StoreContext } from "@/components/StoreContext/StoreContext";
import { useContext } from "react";

/**
 * Retrieves the Zustand store from the StoreContext.
 * @returns The Zustand store.
 */
function useStoreContext() {
	const context = useContext(StoreContext);

	if (!context) {
		throw new Error("useStoreContext must be used within a StoreProvider.");
	}

	return context;
}

export default useStoreContext;
