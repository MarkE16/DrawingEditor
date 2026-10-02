import {
	describe,
	expect,
	vi,
	it,
	beforeEach,
	beforeAll,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import LayerPane from "../../components/LayerPane/LayerPane";
import { SliceStores } from "../../types";
import { renderWithProviders } from "../test-utils";

// Essential so that when the component is rendered,
// the usePageContext hook doesn't throw an error (since it's not in the browser)
vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const preloadedState: Partial<SliceStores> = {
	width: 400,
	height: 400,
	mode: "move",
	scale: 1,
	dpi: 1,
	position: { x: 0, y: 0 },
	layers: [
		{ name: "Layer 1", id: "1", active: true, hidden: false },
		{ name: "Layer 2", id: "2", active: false, hidden: false }
	],
	color: "#000000",
	strokeWidth: 5
};

describe("LayerPane functionality", () => {
	let originalConfirm: (message?: string) => boolean;

	beforeAll(() => {
		originalConfirm = window.confirm;

		// Mock the window.confirm function so that it doesn't actually show a dialog. We do this because we can't interact with the dialog in a test.
		// (The dialog is used in the component to confirm deletion of a layer)
		window.confirm = () => true;
	});

	beforeEach(() => {
		renderWithProviders(<LayerPane />, { preloadedState });
	});

	afterAll(() => {
		// Restore the original window.confirm function
		window.confirm = originalConfirm;

		vi.restoreAllMocks();
	});

	it("should render the LayerPane component", () => {
		expect(screen.getByText("Layer 1")).toBeInTheDocument();
		expect(screen.getByText("Layer 2")).toBeInTheDocument();
	});

	it("should render the LayerPane component with active layer", () => {
		// Get the active layer by grabbing the label element

		const [layer1, layer2] = screen.getAllByLabelText("Layer Info");

		expect(layer1).toHaveClass("bg-[#d1836a]");
		expect(layer2).not.toHaveClass("bg-[#d1836a]");
	});

	it("should switch active layer on click", () => {
		const [layer1, layer2] = screen.getAllByLabelText("Layer Info");

		expect(layer1).toHaveClass("bg-[#d1836a]");
		expect(layer2).not.toHaveClass("bg-[#d1836a]");

		fireEvent.click(layer2);

		expect(layer1).not.toHaveClass("bg-[#d1836a]");
		expect(layer2).toHaveClass("bg-[#d1836a]");
	});

	it("should add a new layer when clicking the add layer button", () => {
		const button = screen.getByLabelText("Create Layer");
		const layerList = screen.getByLabelText("Layer List");
		const layer1 = screen.queryByText("Layer 1");
		const layer2 = screen.queryByText("Layer 2");

		expect(layer1).toBeInTheDocument();
		expect(layer2).toBeInTheDocument();
		expect(layerList.children).toHaveLength(2);

		fireEvent.click(button);

		const newLayer = screen.queryByText("New Layer"); // new layers are named "New Layer" by default

		expect(newLayer).toBeInTheDocument();
		expect(layerList.children).toHaveLength(3);
	});

	it("should prevent adding a new layer when there are 65 layers", () => {
		let button = screen.getByLabelText("Create Layer");
		const layerList = screen.getByLabelText("Layer List");

		expect(layerList.children).toHaveLength(2);

		// Add 63 layers
		for (let i = 0; i < 63; i++) {
			expect(button).not.toBeDisabled();
			fireEvent.click(button);
		}

		button = screen.getByLabelText("Create Layer");

		expect(layerList.children).toHaveLength(65);
		expect(button).toBeDisabled();

		// Try to add another layer
		fireEvent.click(button);

		// The layer list should still have 65 layers
		expect(layerList.children).toHaveLength(65);
	});

	it("should delete a layer when available; should not delete if not available", () => {
		const layer1 = screen.queryByText("Layer 1");
		const layer2 = screen.queryByText("Layer 2");
		const layerList = screen.getByLabelText("Layer List");

		expect(layerList.children).toHaveLength(2);
		expect(layer1).toBeInTheDocument();
		expect(layer2).toBeInTheDocument();

		const [deleteLayer1Button] = screen.getAllByLabelText(/Delete Layer/i);

		expect(deleteLayer1Button).not.toBeNull();

		// Deleting the first layer.
		fireEvent.click(deleteLayer1Button);

		const layer1Deleted = screen.queryByText("Layer 1");
		expect(layer1Deleted).toBeNull();
		expect(layerList.children).toHaveLength(1);
		expect(layer2).toBeInTheDocument();

		const [, deleteLayer2Button] = screen.queryAllByLabelText(/Delete Layer/i);

		// Trying to delete the second layer. Since there is only one layer left, it should not be deleted, so the delete button should not be available.
		expect(deleteLayer2Button).toBeUndefined();
	});

	it("should rename the layer", () => {
		const [layer1RenameButton] = screen.getAllByLabelText(/Rename Layer/i);

		expect(layer1RenameButton).not.toBeNull();

		fireEvent.click(layer1RenameButton);

		const [layer1InputAfterClick] =
			screen.getAllByLabelText(/Edit Layer Name/i);

		expect(layer1InputAfterClick).not.toBeNull();
		expect(layer1RenameButton).not.toBeDisabled(); // This button changes to a "confirm" button when renaming. Since we haven't changed the name yet, it should not be disabled.

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "This is a new name" }
		});

		fireEvent.click(layer1RenameButton); // Click the check button to confirm the name change

		const [layer1NameAfterChange] = screen.getAllByLabelText("Layer Name");

		expect(layer1NameAfterChange).toHaveTextContent("This is a new name");
	});

	it("should not allow a rename if field is empty", () => {
		const [layer1RenameButton] = screen.getAllByLabelText(/Rename Layer/);

		fireEvent.click(layer1RenameButton);

		const [layer1InputAfterClick] =
			screen.getAllByLabelText(/Edit Layer Name/i);

		expect(layer1RenameButton).not.toBeDisabled(); // This button changes to a "confirm" button when renaming. Since we haven't changed the name yet, it should not be disabled.

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "" }
		});

		expect(layer1RenameButton).toBeDisabled(); // The button should be disabled since the input is empty.
	});

	it("should rename when pressing enter", () => {
		const [layer1Name] = screen.getAllByLabelText("Layer Name");
		const [layer1RenameButton] = screen.getAllByLabelText(/Rename Layer/i);

		expect(layer1Name).toBeInTheDocument();
		expect(layer1RenameButton).toBeInTheDocument();

		fireEvent.click(layer1RenameButton);

		const [layer1InputAfterClick] =
			screen.queryAllByLabelText(/Edit Layer Name/i);

		expect(layer1InputAfterClick).toBeInTheDocument();
		expect(layer1RenameButton).not.toBeDisabled();

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "This is a new name" }
		});

		fireEvent.keyDown(layer1InputAfterClick, { key: "Enter" });

		const [layer1NameAfterChange] = screen.getAllByLabelText("Layer Name");

		expect(layer1NameAfterChange).toHaveTextContent("This is a new name");
	});

	it("should exit renaming when pressing escape while not modifiying the name", () => {
		const [layer1Name] = screen.getAllByLabelText("Layer Name");
		const [layer1RenameButton] = screen.queryAllByLabelText(/Rename Layer/i);
		const [layer1Input] = screen.queryAllByLabelText(/Edit Layer Name/i);

		expect(layer1Name).not.toBeUndefined();
		expect(layer1Name).toHaveTextContent("Layer 1");
		expect(layer1RenameButton).not.toBeUndefined();
		expect(layer1Input).toBeUndefined();

		fireEvent.click(layer1RenameButton);

		const [layer1InputAfterClick] =
			screen.queryAllByLabelText(/Edit Layer Name/i);

		expect(layer1InputAfterClick).not.toBeUndefined();
		expect(layer1RenameButton).not.toBeDisabled();

		// Let's change the name, but then cancel it
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "Name not saved" }
		});

		fireEvent.keyDown(layer1InputAfterClick, { key: "Escape" });

		const layer1NameAfterChange = screen.getByText(/Layer 1/i);

		expect(layer1NameAfterChange).toHaveTextContent("Layer 1");
	});

	it("should toggle layer visibility", () => {
		const [toggleButton1] = screen.getAllByLabelText(
			/Toggle Layer Visibility/i
		);

		expect(toggleButton1).not.toBeNull();

		// Layer is visible by default
		expect(toggleButton1).toHaveAttribute("aria-checked", "false");

		fireEvent.click(toggleButton1);
		expect(toggleButton1).toHaveAttribute("aria-checked", "true");

		fireEvent.click(toggleButton1);
		expect(toggleButton1).toHaveAttribute("aria-checked", "false");
	});

	it("should move a layer down", () => {
		const container = screen.getByLabelText("Layer List");
		const [layer1, layer2] = screen.getAllByLabelText("Layer Info");
		const [downLayer1Button] = screen.getAllByLabelText("Move Layer Down");

		expect(downLayer1Button).not.toBeNull();
		expect(downLayer1Button).not.toBeDisabled();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(downLayer1Button);

		expect([...container.children]).toEqual([layer2, layer1]);
	});

	it("should move a layer up", () => {
		const container = screen.getByLabelText("Layer List");
		const [layer1, layer2] = screen.getAllByLabelText("Layer Info");
		const [, upLayer2Button] = screen.getAllByLabelText("Move Layer Up");

		expect(upLayer2Button).not.toBeNull();
		expect(upLayer2Button).not.toBeDisabled();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(upLayer2Button);

		expect([...container.children]).toEqual([layer2, layer1]);
	});

	it("should not move a layer up if it's already at the top", () => {
		const container = screen.getByLabelText("Layer List");
		const [layer1, layer2] = screen.getAllByLabelText("Layer Info");
		const [upLayer1Button] = screen.getAllByLabelText("Move Layer Up");

		expect(upLayer1Button).not.toBeNull();
		expect(upLayer1Button).toBeDisabled();
		expect([...container.children]).toEqual([layer1, layer2]);
	});

	it("should not move a layer down if it's already at the bottom", () => {
		const container = screen.getByLabelText("Layer List");
		const [layer1, layer2] = screen.getAllByLabelText("Layer Info");
		const [, downLayer2Button] = screen.getAllByLabelText("Move Layer Down");

		expect(downLayer2Button).not.toBeNull();
		expect(downLayer2Button).toBeDisabled();
		expect([...container.children]).toEqual([layer1, layer2]);
	});

	it("should not move the layer at all if there is one layer", () => {
		const container = screen.getByLabelText("Layer List");
		const [layer1] = screen.getAllByLabelText("Layer Info");
		const [upLayer1Button, downLayer1Button] =
			screen.getAllByLabelText(/Move Layer (Up|Down)/i);
		const [, deleteLayer2Button] = screen.getAllByLabelText(/Delete Layer/i);

		expect(upLayer1Button).not.toBeNull();
		expect(downLayer1Button).not.toBeNull();

		// We have 2 layers by default, so let's remove one
		fireEvent.click(deleteLayer2Button);

		expect([...container.children]).toEqual([layer1]);

		// Now, we should not be able to move the layer up or down
		expect(upLayer1Button).toBeDisabled();
		expect(downLayer1Button).toBeDisabled();
	});
});
