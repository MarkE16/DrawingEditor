// Lib
import { useState, memo } from "react";
import cn from "@/lib/tailwind-utils";
import useStore from "@/state/hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import LayersStore from "@/state/stores/LayersStore";

// Icons
import ArrowUp from "@/components/icons/ArrowUp/ArrowUp";
import ArrowDown from "@/components/icons/ArrowDown/ArrowDown";
import Eye from "@/components/icons/Eye/Eye";
import Pen from "@/components/icons/Pen/Pen";
import Trashcan from "@/components/icons/Trashcan/Trashcan";
import Checkmark from "@/components/icons/Checkmark/Checkmark";

// Types
import type { ReactNode } from "react";
import type { Layer } from "@/types";

// Components
import LayerPreview from "@/components/LayerPreview/LayerPreview";
import Tooltip from "@/components/Tooltip/Tooltip";
import ElementsStore from "@/state/stores/ElementsStore";
import { redrawCanvas } from "@/lib/utils";

type LayerInfoProps = Readonly<
	Layer & {
		canMoveUp: boolean;
		canMoveDown: boolean;
	}
>;

const MemoizedLayerPreview = memo(LayerPreview);

function LayerInfo({
	name,
	id,
	active,
	hidden,
	canMoveUp,
	canMoveDown
}: LayerInfoProps): ReactNode {
	const {
		toggleLayer,
		toggleVisibility,
		moveLayerUp,
		moveLayerDown,
		removeLayer,
		renameLayer,
		deleteElement
	} = useStore(
		useShallow((state) => ({
			toggleVisibility: state.toggleLayerVisibility,
			toggleLayer: state.toggleLayer,
			moveLayerDown: state.moveLayerDown,
			moveLayerUp: state.moveLayerUp,
			renameLayer: state.renameLayer,
			removeLayer: state.removeLayer,
			deleteElement: state.deleteElement
		}))
	);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editedName, setEditedName] = useState<string>(name);
	const editingTooltipText =
		isEditing && !editedName.length
			? "Layer name cannot be empty."
			: isEditing
				? "Done"
				: "Rename";

	const onToggle = () => {
		toggleLayer(id);
	};

	const onToggleVisibility = () => {
		toggleVisibility(id);
		redrawCanvas(true);
	};

	const onDelete = () => {
		if (!window.confirm("Are you sure you want to delete " + name + "?"))
			return;

		removeLayer(id);

		LayersStore.removeLayer([id]);

		const deletedIds = deleteElement((element) => element.layerId === id);

		ElementsStore.removeElement(deletedIds);
	};

	const onMoveLayer = (dir: "up" | "down") => {
		if (dir === "up") {
			moveLayerUp(id);
		} else {
			moveLayerDown(id);
		}
		redrawCanvas(true);
	};

	const onRename = () => {
		setIsEditing((prev) => !prev);

		if (isEditing) {
			if (!editedName.length) {
				console.error("Layer name cannot be empty.");
				setEditedName(name);
				return;
			}

			renameLayer({ id, newName: editedName });
			return;
		}
	};

	const visibilityTooltipText = hidden ? "Show" : "Hide";

	return (
		<label
			htmlFor={"layer-" + id}
			className={cn(
				"flex items-center w-full max-w-full h-[2.6rem] py-[0.2rem] px-[0.5rem] whitespace-nowrap border border-[rgb(56,55,55)] last:rounded-b-[5px]",
				"group",
				{
					"bg-accent": active,
					"bg-[rgb(36,36,36)]": !active
				}
			)}
			aria-label="Layer Info"
		>
			<input
				type="radio"
				id={"layer-" + id}
				name="layer"
				checked={active}
				onChange={onToggle}
				className="hidden"
			/>
			<div className="flex flex-col">
				<Tooltip
					text="Move Up"
					position="left"
				>
					<button
						className="block opacity-100 text-base m-0 p-0 bg-transparent rounded-full disabled:opacity-50 hover:bg-[rgba(255,255,255,0.1)]"
						aria-label="Move Layer Up"
						onClick={() => onMoveLayer("up")}
						disabled={!canMoveUp}
					>
						<ArrowUp />
					</button>
				</Tooltip>
				<Tooltip
					text="Move Down"
					position="left"
				>
					<button
						className="block opacity-100 text-base m-0 p-0 bg-transparent rounded-full disabled:opacity-50 hover:bg-[rgba(255,255,255,0.1)]"
						onClick={() => onMoveLayer("down")}
						aria-label="Move Layer Down"
						disabled={!canMoveDown}
					>
						<ArrowDown />
					</button>
				</Tooltip>
			</div>

			<MemoizedLayerPreview id={id} />

			<div className="flex flex-row items-center justify-between w-full min-w-0">
				{isEditing ? (
					<input
						type="text"
						aria-label="Edit Layer Name"
						placeholder={name}
						value={editedName}
						className="mx-[5px] outline-none w-full border-none border-b border-b-[#c1c1c1] bg-transparent focus:border-b-white placeholder:text-[rgb(218,218,218)]"
						/**
						We add this keydown event so that we prevent the keydown event attached on the
						window object from firing (for listening to keyboard shortcuts related to tools)
						when we are editing the layer name.
					  */
						onKeyDown={(e) => {
							e.stopPropagation();

							if (e.key === "Enter" && isEditing) {
								onRename();
							} else if (e.key === "Escape" && isEditing) {
								setIsEditing(false);
							}
						}}
						onChange={(e) => {
							setEditedName(e.target.value);
						}}
						onBlur={onRename}
					/>
				) : (
					<div className="flex flex-col mx-[10px] w-full overflow-hidden">
						<span
							className="text-white font-bold text-[1em] whitespace-nowrap overflow-hidden text-ellipsis w-full leading-[1.2]"
							aria-label="Layer Name"
							onDoubleClick={onRename}
						>
							{name}
						</span>
					</div>
				)}
				<div>
					<Tooltip text={editingTooltipText}>
						<button
							className={cn(
								"hidden bg-transparent text-lg py-0 px-[0.2em] border-none rounded-full transition-opacity disabled:opacity-50 group-hover:inline group-focus:inline hover:bg-[rgba(255,255,255,0.1)]",
								{
									block: isEditing
								}
							)}
							onClick={onRename}
							disabled={!editedName.length}
							aria-label="Rename Layer"
						>
							{isEditing ? <Checkmark /> : <Pen />}
						</button>
					</Tooltip>
					{!isEditing && (
						<>
							{/* if we cannot move up or down, then there should be only one layer; we don't want to be able to delete the layer in this case. */}
							{(canMoveUp || canMoveDown) && (
								<Tooltip text="Delete">
									<button
										className="hidden bg-transparent text-lg py-0 px-[0.2em] border-none rounded-full transition-opacity disabled:opacity-50 group-hover:inline group-focus:inline hover:bg-[rgba(255,255,255,0.1)]"
										onClick={onDelete}
										aria-label="Delete Layer"
									>
										<Trashcan />
									</button>
								</Tooltip>
							)}

							<Tooltip text={visibilityTooltipText}>
								<button
									onClick={onToggleVisibility}
									data-testid={`toggle-${id}`}
									role="switch"
									aria-checked={hidden}
									aria-label="Toggle Layer Visibility"
									className="hidden bg-transparent text-lg py-0 px-[0.2em] border-none rounded-full transition-opacity disabled:opacity-50 group-hover:inline group-focus:inline hover:bg-[rgba(255,255,255,0.1)]"
								>
									<Eye lineCross={hidden} />
								</button>
							</Tooltip>
						</>
					)}
				</div>
			</div>
		</label>
	);
}

export default LayerInfo;
