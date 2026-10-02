import {
	describe,
	it,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach
} from "vitest";
import ElementsStore from "@/state/stores/ElementsStore";
import { CanvasElement } from "@/types";

describe("ElementsStore functionality", () => {
	const elements: CanvasElement[] = [
		{
			id: "123",
			layerId: "1234-5678-9012",
			type: "circle",
			color: "#000000",
			inverted: false,
			path: [],
			opacity: 1,
			strokeWidth: 5,
			drawType: "fill",
			width: 100,
			height: 100,
			x: 100,
			y: 100
		},
		{
			id: "456",
			layerId: "1234-5678-9012",
			type: "rectangle",
			color: "#000000",
			inverted: false,
			path: [],
			opacity: 1,
			strokeWidth: 5,
			drawType: "fill",
			width: 50,
			height: 50,
			x: 50,
			y: 50
		}
	];

	beforeAll(async () => {
		ElementsStore.openStore();
	});

	beforeEach(async () => {
		await ElementsStore.addElements(elements);
	});

	afterEach(async () => {
		await ElementsStore.clearStore();
	});

	afterAll(() => {
		ElementsStore.closeStore();
	});

	it("should initally return entries", () => {
		const asEntries = elements.map((el) => [el.id, el]);

		expect(ElementsStore.getElements()).resolves.toEqual(asEntries);
	});

	it("should add items", async () => {
		const newElements: CanvasElement[] = [
			{
				id: "246",
				layerId: "1234-5678-9012",
				type: "circle",
				color: "#000000",
				inverted: false,
				path: [],
				opacity: 1,
				strokeWidth: 5,
				drawType: "fill",
				width: 100,
				height: 100,
				x: 100,
				y: 100
			},
			{
				id: "135",
				layerId: "1234-5678-9012",
				type: "rectangle",
				color: "#000000",
				inverted: false,
				path: [],
				opacity: 1,
				strokeWidth: 5,
				drawType: "fill",
				width: 50,
				height: 50,
				x: 50,
				y: 50
			}
		];
		await ElementsStore.addElements(newElements);

		const expected = [...elements, ...newElements].map((el) => [el.id, el]);

		const entries = await ElementsStore.getElements();

		for (const entry of entries) {
			expect(
				expected.some(
					([id, val]) =>
						id === entry[0] && JSON.stringify(entry[1]) === JSON.stringify(val)
				)
			).toBe(true);
		}
	});

	it("should get a single item", async () => {
		expect(ElementsStore.getElement("123")).resolves.toEqual(elements[0]);
	});

	it("should not find an unknown item", () => {
		expect(ElementsStore.getElement("121342523")).resolves.toBeUndefined();
	});

	it("should delete items", async () => {
		await ElementsStore.removeElement(["123", "456"]);

		expect(ElementsStore.getElements()).resolves.toEqual([]);
	});

	it("should clear the store", async () => {
		await ElementsStore.clearStore();

		expect(ElementsStore.getElements()).resolves.toEqual([]);
	});
});
