// Lib
import { useCallback, useEffect } from "react";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import * as UTILS from "@/lib/utils";
import cn from "@/lib/tailwind-utils";

// Types
import type { Mode, ToolbarMode } from "@/types";
import type { ReactNode } from "react";

// Components
import Eraser from "@/components/icons/Eraser/Eraser";
import Shapes from "@/components/icons/Shapes/Shapes";
import EyeDropper from "@/components/icons/EyeDropper/EyeDropper";
import ZoomIn from "@/components/icons/ZoomIn/ZoomIn";
import ZoomOut from "@/components/icons/ZoomOut/ZoomOut";
import Move from "@/components/icons/Move/Move";
import Undo from "@/components/icons/Undo/Undo";
import Redo from "@/components/icons/Redo/Redo";
import Text from "@/components/icons/Text/Text";
import Tooltip from "@/components/Tooltip/Tooltip";
import Hand from "../icons/Hand/Hand";
import Brush from "../icons/Brush/Brush";

type ToolbarButtonProps = Readonly<
	ToolbarMode & {
		active: boolean;
	}
>;

const ICONS: Record<Mode, ReactNode> = {
	move: <Move />,
	brush: <Brush />,
	eraser: <Eraser />,
	shapes: <Shapes />,
	text: <Text />,
	eye_drop: <EyeDropper />,
	zoom_in: <ZoomIn />,
	zoom_out: <ZoomOut />,
	pan: <Hand />,
	undo: <Undo />,
	redo: <Redo />
};

function ToolbarButton({
	name,
	shortcut,
	active
}: ToolbarButtonProps): ReactNode {
	const { changeMode, undo, redo } = useStore(
		useShallow((state) => ({
			changeMode: state.changeMode,
			undo: state.undo,
			redo: state.redo
		}))
	);
	const { canUndo, canRedo } = useStore(
		useShallow((state) => ({
			canUndo: state.undoStack.length > 0,
			canRedo: state.redoStack.length > 0
		}))
	);
	const tooltip =
		UTILS.capitalize(name, {
			titleCase: true,
			delimiter: "_"
		}).replace("_", " ") + ` (${shortcut.toUpperCase()})`;

	const performAction = useCallback(() => {
		if (name === "undo") {
			undo();
			UTILS.redrawCanvas();
		} else if (name === "redo") {
			redo();
			UTILS.redrawCanvas();
		} else {
			changeMode(name);
		}
	}, [undo, redo, name, changeMode]);

	useEffect(() => {
		function handleShortcut(e: KeyboardEvent) {
			let chosenShortcut = "";

			if (e.ctrlKey) chosenShortcut += "ctrl+";
			if (e.shiftKey) chosenShortcut += "shift+";
			if (e.altKey) chosenShortcut += "alt+";

			// Handle the special case of "+" and "_" for zooming in and out
			if (e.key === "+" || e.key === "_") {
				chosenShortcut = e.key.toLowerCase();
			} else {
				chosenShortcut += e.key.toLowerCase();
			}

			if (chosenShortcut === shortcut) {
				performAction();
			}
		}

		window.addEventListener("keydown", handleShortcut);

		return () => {
			window.removeEventListener("keydown", handleShortcut);
		};
	}, [performAction, shortcut]);

	return (
		<Tooltip
			text={tooltip}
			position="right"
		>
			<button
				className={cn(
					"p-[0.2em] text-2xl w-full text-center cursor-pointer transition-colors duration-100",
					"inline-flex justify-center",
					"disabled:text-[#3b3b3b] disabled:cursor-not-allowed disabled:hover:bg-transparent",
					{
						"bg-transparent hover:bg-[#3b3b3b]": !active,
						"bg-accent border-[#d1603a]": active
					}
				)}
				data-modename={name}
				data-shortcut={shortcut}
				data-testid={`tool-${name}`}
				onClick={performAction}
				disabled={
					name === "undo" ? !canUndo : name === "redo" ? !canRedo : false
				}
			>
				{ICONS[name]}
			</button>
		</Tooltip>
	);
}

export default ToolbarButton;
