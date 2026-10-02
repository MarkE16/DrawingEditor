import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/tests/test-utils";

import { Page } from "@/pages/index/index.page";
import { SliceStores } from "@/types";

describe("Page", () => {
	const mockState: Partial<SliceStores> = {
		layers: [
			{
				id: "123",
				name: "Layer 1",
				active: true,
				hidden: false
			}
		]
	};

	beforeEach(() => {
		renderWithProviders(<Page />, { preloadedState: mockState });
	});

	it("should render the page", () => {
		expect(screen.getByTestId("nav-bar")).toBeInTheDocument();
		expect(screen.getByTestId("main-content")).toBeInTheDocument();
	});

	it("should open the reference window from the View menu", async () => {
		const viewTab = screen.getByRole("menuitem", { name: "View" });
		await userEvent.click(viewTab);

		const referenceWindowOption = screen.getByText("Reference Window");
		await userEvent.click(referenceWindowOption);

		const referenceWindow = screen.getByTestId("reference-window");
		expect(referenceWindow).toBeInTheDocument();
	});

	it("should close the reference window from the close button", async () => {
		const viewTab = screen.getByRole("menuitem", { name: "View" });
		await userEvent.click(viewTab);

		const referenceWindowOption = screen.getByText("Reference Window");
		await userEvent.click(referenceWindowOption);

		let referenceWindow = screen.queryByTestId("reference-window");
		expect(referenceWindow).toBeInTheDocument();

		expect(referenceWindowOption).not.toBeInTheDocument();

		// Close it.
		const closeRefWindow = screen.getByTestId("close-ref-window");
		await userEvent.click(closeRefWindow);

		referenceWindow = screen.queryByTestId("reference-window");
		expect(referenceWindow).not.toBeInTheDocument();
	});
});
