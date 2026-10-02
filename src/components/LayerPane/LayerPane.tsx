// Lib
import { memo } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";

// Icons
import Plus from "@/components/icons/Plus/Plus";

// Types
import type { ReactNode } from "react";

// Components
import LayerInfo from "@/components/LayerInfo/LayerInfo";
import ColorWheel from "@/components/ColorWheel/ColorWheel";
import Tooltip from "@/components/Tooltip/Tooltip";

const MemoizedLayerInfo = memo(LayerInfo);
const MemoizedColorWheel = memo(ColorWheel);

const MAX_LAYERS = 65;

function LayerPane(): ReactNode {
	const { layers, createLayer } = useStore(
		useShallow((state) => ({
			layers: state.layers,
			createLayer: state.createLayer
		}))
	);
	const totalLayers = layers.length;

	const onNewLayer = () => {
		if (totalLayers < MAX_LAYERS) {
			createLayer();
		}
	};
	const newLayerButtonCss =
		"inline-flex justify-center p-1 text-lg bg-[rgb(36,36,36)] hover:bg-accent rounded-t-[5px] border border-[rgb(56,55,55)] disabled:bg-[#242424] disabled:text-gray-500";

	const newLayerButton =
		totalLayers >= MAX_LAYERS ? (
			<Tooltip
				text="Maximum number of layers reached"
				position="left"
				arrow
			>
				<button
					aria-label="Create Layer"
					className={newLayerButtonCss}
					disabled={true}
				>
					<Plus />
				</button>
			</Tooltip>
		) : (
			<button
				aria-label="Create Layer"
				className={newLayerButtonCss}
				disabled={false}
				onClick={onNewLayer}
			>
				<Plus />
			</button>
		);

	return (
		<aside className="flex flex-col h-full w-[225px] p-[0.5em] bg-[rgb(36,36,36)] border border-[rgb(56,55,55)]">
			<MemoizedColorWheel />

			{newLayerButton}
			<div
				className="h-full overflow-y-auto"
				aria-label="Layer List"
			>
				{layers.map((layer, i) => (
					<MemoizedLayerInfo
						{...layer}
						key={layer.id}
						canMoveUp={i > 0}
						canMoveDown={i < totalLayers - 1}
					/>
				))}
			</div>
		</aside>
	);
}

export default LayerPane;
