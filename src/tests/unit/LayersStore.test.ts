import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import LayersStore from "@/state/stores/LayersStore";

describe("LayersStore functionality", () => {
	const layers = [
		{
			id: "layer-123",
			name: "Layer 1",
			active: true,
			hidden: false,
			position: 0
		},
		{
			id: "layer-456",
			name: "Layer 2",
			active: false,
			hidden: false,
			position: 1
		}
	];

	beforeAll(async () => {
		LayersStore.openStore();
	});

	afterEach(async () => {
		await LayersStore.clearStore();
	});

	afterAll(() => {
		LayersStore.closeStore();
	});

	it("should initally return entries", async () => {
		await LayersStore.upsertLayers(layers);

		const entries = await LayersStore.getLayers();

		for (const [index, [id, entry]] of entries.entries()) {
			expect(id).toBe(entry.id);
			expect(entry.name).toMatch(/Layer \d/);
			expect(entry.position).toBe(index);
			expect(entry.active).toBe(index === 0);
		}
	});

	it("should get a single layer", async () => {
		await LayersStore.upsertLayers(layers);
		const layer = await LayersStore.getLayer("layer-123");

		expect(layer).toHaveProperty("id", "layer-123");
		expect(layer).toHaveProperty("name", "Layer 1");
		expect(layer).toHaveProperty("position", 0);
	});

	it("should add layers", async () => {
		const newLayers = [
			{
				id: "layer-789",
				name: "Layer 3",
				active: false,
				hidden: false,
				position: 2
			},
			{
				id: "layer-101",
				name: "Layer 4",
				active: false,
				hidden: false,
				position: 3
			}
		];

		await LayersStore.upsertLayers([...layers, ...newLayers]);

		let entry = await LayersStore.getLayer("layer-789");
		expect(entry).toHaveProperty("id", "layer-789");
		expect(entry).toHaveProperty("name", "Layer 3");
		expect(entry).toHaveProperty("position", 2);

		entry = await LayersStore.getLayer("layer-101");
		expect(entry).toHaveProperty("id", "layer-101");
		expect(entry).toHaveProperty("name", "Layer 4");
		expect(entry).toHaveProperty("position", 3);
	});

	it("should not find a layer that doesn't exist", () => {
		expect(LayersStore.getLayer("non-existent-id")).resolves.toBeUndefined();
	});

	it("should delete layers", async () => {
		await LayersStore.upsertLayers(layers);
		await LayersStore.removeLayer(["layer-123", "layer-456"]);

		expect(LayersStore.getLayers()).resolves.toEqual([]);
	});

	it("should clear the store", async () => {
		await LayersStore.upsertLayers(layers);
		await LayersStore.clearStore();

		expect(LayersStore.getLayers()).resolves.toEqual([]);
	});
});
