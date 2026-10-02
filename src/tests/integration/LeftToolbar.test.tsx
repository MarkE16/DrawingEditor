// Lib
import { expect, it, describe, beforeEach, afterEach, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import { MODES } from "../../state/store";

// Components
import LeftToolbar from "../../components/LeftToolbar/LeftToolbar";

describe("Left Toolbar functionality", () => {
	beforeEach(() => {
		renderWithProviders(<LeftToolbar />);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it("should render the component", async () => {
		const container = screen.getByTestId("left-toolbar-container");

		expect(container.children).toHaveLength(MODES.length);

		for (const mode of MODES) {
			const button = screen.getByTestId(`tool-${mode.name}`);

			expect(button).toBeInTheDocument();
		}
	});

	it("should properly change to all existing modes", () => {
		const firstMode = screen.getByTestId(`tool-${MODES[0].name}`);

		// First mode should be active by default
		expect(firstMode).not.toBeNull();
		expect(firstMode).toHaveClass("bg-[#d1836a]");

		// Click on all the other modes
		for (let i = 1; i < MODES.length; i++) {
			const mode = screen.getByTestId(`tool-${MODES[i].name}`);
			const previousMode = screen.getByTestId(`tool-${MODES[i - 1].name}`);

			expect(mode).not.toBeNull();
			expect(previousMode).not.toBeNull();

			if (MODES[i].name === "undo" || MODES[i].name === "redo") {
				// These aren't necessarily modes that we can change to; they're just actions. So, we skip them.
				break;
			}
			expect(mode).not.toHaveClass("bg-[#d1836a]");
			expect(previousMode).toHaveClass("bg-[#d1836a]");

			fireEvent.click(mode);

			expect(mode).toHaveClass("bg-[#d1836a]");
			expect(previousMode).not.toHaveClass("bg-[#d1836a]");
		}
	});
});
