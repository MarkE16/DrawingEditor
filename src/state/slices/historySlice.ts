import type { StateCreator } from "zustand";
import type { SliceStores, HistoryAction, HistoryStore } from "@/types";

const HISTORY_ENTRY_LIMIT = 20;

export const createHistorySlice: StateCreator<
	SliceStores,
	[],
	[],
	HistoryStore
> = (set, get) => {
	function applyChanges(
		action: HistoryAction,
		actionPerformed: "undo" | "redo" = "undo"
	) {
		const { scale } = get();
		const { changeElementProperties, createElement, deleteElement } = get();
		switch (action.type) {
			case "add_element": {
				const { type, ...rest } = action.properties;
				if (!type) {
					throw new Error("Element type is required for add_element action");
				}

				if (actionPerformed === "undo") {
					// We're doing the inverse, so we remove the element.
					deleteElement((element) => element.id === action.properties.id);
				} else {
					createElement(type, rest);
				}
				break;
			}
			case "move_element": {
				const { layerId, dx, dy } = action.properties;

				changeElementProperties(
					(state) => {
						if (actionPerformed === "undo") {
							// We need to move the element back to its original position.
							if (state.type === "brush" || state.type === "eraser") {
								return {
									...state,
									path: state.path.map((point) => [
										point[0] - dx / scale,
										point[1] - dy / scale
									])
								};
							}
							return {
								...state,
								x: state.x - dx / scale,
								y: state.y - dy / scale
							};
						}

						// We need to move the element to its new position.
						if (state.type === "brush" || state.type === "eraser") {
							return {
								...state,
								path: state.path.map((point) => [
									point[0] + dx / scale,
									point[1] + dy / scale
								])
							};
						}
						return {
							...state,
							x: state.x + dx / scale,
							y: state.y + dy / scale
						};
					},
					(element) => element.layerId === layerId
				);
				break;
			}
		}
	}

	function pushHistory(action: HistoryAction) {
		const totalElements = get().elements.length;
		if (action.type === "move_element" && totalElements === 0) {
			// Do not push history for move_element if there are no elements.
			// Silently ignore the action.
			return;
		}
		set((state) => ({
			undoStack: [action, ...state.undoStack].slice(0, HISTORY_ENTRY_LIMIT),
			redoStack: []
		}));
	}

	function undo() {
		const { undoStack, redoStack } = get();

		if (!undoStack.length) return; // Nothing to undo

		const lastAction = undoStack[0];

		applyChanges(lastAction, "undo");

		set({
			undoStack: undoStack.slice(1),
			redoStack: [lastAction, ...redoStack]
		});
	}

	function redo() {
		const { redoStack, undoStack } = get();
		if (!redoStack.length) return; // Nothing to redo

		const lastAction = redoStack[0];

		applyChanges(lastAction, "redo");

		set({
			undoStack: [lastAction, ...undoStack],
			redoStack: redoStack.slice(1)
		});
	}

	function canUndo() {
		return get().undoStack.length > 0;
	}

	function canRedo() {
		return get().redoStack.length > 0;
	}

	function clearHistory() {
		set({
			undoStack: [],
			redoStack: []
		});
	}

	return {
		undoStack: [],
		redoStack: [],
		pushHistory,
		undo,
		redo,
		canUndo,
		canRedo,
		clearHistory
	};
};
