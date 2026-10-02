// Lib
import useStore from "@/state/hooks/useStore";

// Types
import type { ReactNode } from "react";

// Components
import CanvasPane from "@/components/CanvasPane/CanvasPane";
import LeftToolbar from "@/components/LeftToolbar/LeftToolbar";
import LayerPane from "@/components/LayerPane/LayerPane";
import ReferenceWindow from "@/components/ReferenceWindow/ReferenceWindow";

function Main(): ReactNode {
	const refereceWindowEnabled = useStore(
    (state) => state.referenceWindowEnabled
  );

	return (
		<main
			id="main-content"
			data-testid="main-content"
			className="flex h-[calc(100vh-3rem)]"
		>
			<LeftToolbar />

			<CanvasPane  />

			{/* Reference window */}
			{refereceWindowEnabled && <ReferenceWindow />}
			{/* Right side pane */}
			<LayerPane />
		</main>
	);
}

export default Main;
