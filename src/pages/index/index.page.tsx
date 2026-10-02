// Lib
import { useEffect } from "react";
import LayersStore from "@/state/stores/LayersStore";
import ElementsStore from "@/state/stores/ElementsStore";
import { initializeEditorStore } from "@/state/store";
import useInitialEditorState from "@/state/hooks/useInitialEditorState";

// Components
import Navbar from "@/components/Navbar/Navbar";
import Main from "@/components/Main/Main";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import { StoreProvider } from "@/components/StoreContext/StoreContext";
import { CanvasReferenceProvider } from "@/components/CanvasReferenceProvider/CanvasReferenceProvider";
import ImageElementStore from "@/state/stores/ImageElementStore";

// The <head> tags
// eslint-disable-next-line
export const documentProps = {
	title: "IdeaDrawn", // <title>
	desc: "A drawing canvas editor on the browser" // <meta name="description">
};

function Page() {
	const state = useInitialEditorState();
	useEffect(() => {
		async function checkStoragePersistency() {
			if (!navigator.storage?.persist) return;

			const isPersisted = await navigator.storage.persisted();

			if (!isPersisted) {
				const isPersisting = await navigator.storage.persist();

				if (isPersisting) {
					console.log("Storage is now persisted.");
				} else {
					console.error("Storage was not persisted.");
				}
			} else {
				console.log("Storage is already persisted.");
			}
		}

		// Check if the database persists.
		checkStoragePersistency();

		LayersStore.openStore();
		ElementsStore.openStore();
		ImageElementStore.openStore();
	}, []);

	return (
		<StoreProvider store={initializeEditorStore(state)}>
			<CanvasReferenceProvider>
				<ErrorBoundary>
					<Navbar />

					<Main />
				</ErrorBoundary>
			</CanvasReferenceProvider>
		</StoreProvider>
	);
}

export { Page };
