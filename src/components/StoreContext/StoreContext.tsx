// Lib
import { createContext, useEffect, useRef } from "react";
import { initializeEditorStore } from "@/state/store";

// Types
import type { ReactNode } from "react";

type InitStore = ReturnType<typeof initializeEditorStore>;

type StoreProviderProps = Readonly<{
	store?: InitStore;
	children: ReactNode;
}>;

const StoreContext = createContext<InitStore | undefined>(undefined);

function StoreProvider({ store, children }: StoreProviderProps): ReactNode {
	const storeRef = useRef<InitStore>(store ?? initializeEditorStore());

	useEffect(() => {
		const persist = storeRef.current.persist;
		if (!persist.hasHydrated()) {
			persist.rehydrate();
		}
	}, []);

	return (
		<StoreContext.Provider value={storeRef.current}>
			{children}
		</StoreContext.Provider>
	);
}

export { StoreContext, StoreProvider };
