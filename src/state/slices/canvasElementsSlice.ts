import type { StateCreator } from "zustand";
import { v4 as uuid } from "uuid";
import type {
	CanvasElement,
	SliceStores,
	CanvasElementsStore,
	CanvasElementType
} from "@/types";

type Predicate<A> = (arg: A) => boolean;

export const createCanvasElementsSlice: StateCreator<
	SliceStores,
	[],
	[],
	CanvasElementsStore
> = (set, get) => {
	function createElement(
		type: CanvasElementType,
		properties?: Partial<CanvasElement>
	) {
		if (type === "text" && !properties?.text) {
			throw new Error(
				"Cannot create text element without additional text properties."
			);
		}

		const id = uuid();
		const { shapeMode, strokeWidth, opacity, getActiveLayer } = get();

		const layer = getActiveLayer();

		const element = {
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			color: "#000000",
			type,
			inverted: false,
			path: [],
			id,
			layerId: layer.id,
			...properties, // Override the default properties with the provided properties, if any.
			drawType: shapeMode,
			strokeWidth: Math.max(1, strokeWidth),
			opacity: type === "eraser" ? 1 : opacity
		};

		set((state) => ({
			elements: [...state.elements, element as CanvasElement]
		}));

		return element;
	}

	function changeElementProperties(
		callback: (el: CanvasElement) => CanvasElement,
		predicate: Predicate<CanvasElement>
	) {
		const elements = get().elements;
		const newElements = elements.map((element) => {
			if (predicate(element)) {
				const { width, height, ...rest } = callback(element);

				if (width < 1 || height < 1) {
					console.error("Width and height must be at least 1.");
				}

				return {
					...rest,
					width: Math.max(1, width),
					height: Math.max(1, height)
				};
			}
			return element;
		});
		set({
			elements: newElements
		});
	}

	function deleteElement(predicate: Predicate<CanvasElement>) {
		const deletedIds: string[] = [];
		set((state) => ({
			elements: state.elements.filter((element) => {
				if (predicate(element)) {
					deletedIds.push(element.id);
					return false; // Filter out the element
				}
				return true; // Keep the element
			})
		}));

		return deletedIds;
	}

	function setElements(elements: CanvasElement[]) {
		set({ elements });
	}

	function copyElement(predicate: Predicate<CanvasElement>) {
		const elements = get().elements;
		const copiedElements = elements.filter((element) => predicate(element));
		set({ copiedElements });
	}

	function pasteElement() {
		const { elements, copiedElements } = get();
		const newElements = copiedElements.map((element) => {
			return {
				...element,
				id: uuid(),
				x: element.x + 10,
				y: element.y + 10
			};
		});
		set({
			copiedElements: newElements,
			elements: [...elements, ...newElements]
		});
	}

	return {
		elements: [],
		copiedElements: [],
		createElement,
		changeElementProperties,
		deleteElement,
		setElements,
		copyElement,
		pasteElement
	};
};
