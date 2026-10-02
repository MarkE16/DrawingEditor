import {
	expect,
	describe,
	it,
	vi,
	beforeAll,
	afterEach,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../../components/Navbar/Navbar";
import { renderWithProviders } from "../test-utils";

describe("Navbar functionality", () => {
	let originalRequestFullscreen: typeof HTMLElement.prototype.requestFullscreen;
	let originalExitFullscreen: typeof document.exitFullscreen;
	const fullscreenElementMock = vi.fn().mockReturnValue(null);

	beforeAll(() => {
		Object.defineProperty(document, "fullscreenElement", {
			get: fullscreenElementMock,
			configurable: true
		});

		originalRequestFullscreen = HTMLElement.prototype.requestFullscreen;
		HTMLElement.prototype.requestFullscreen = vi.fn();
		document.exitFullscreen = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		HTMLElement.prototype.requestFullscreen = originalRequestFullscreen;
		document.exitFullscreen = originalExitFullscreen;
		vi.restoreAllMocks();
	});

	it("should render the Navbar component", () => {
		renderWithProviders(<Navbar />);
		const TABS = ["File", "Edit", "View", "Filter", "Admin"];
		const exportLink = screen.getByTestId("export-link");

		for (const tab of TABS) {
			expect(screen.getByText(tab)).not.toBeNull();
		}

		expect(exportLink).toBeInTheDocument();
		expect(exportLink).not.toBeVisible();
	});

	it("should open a dropdown for the File option", async () => {
		renderWithProviders(<Navbar />);
		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const dropdown = screen.getByRole("menu");

		expect(dropdown).toBeInTheDocument();
		expect(dropdown).toBeVisible();

		const options = screen.getAllByRole("menuitem", {
			name: /Save File|Export File/i
		});

		expect(options).toHaveLength(2);
		expect(options[0]).toHaveTextContent("Save File");
		expect(options[1]).toHaveTextContent("Export File");
	});

	it("should save the file when clicking Save File from File menu", async () => {
		renderWithProviders(<Navbar />);
		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const saveFileOption = screen.getByText("Save File");

		await userEvent.click(saveFileOption);

		await vi.waitFor(() => {
			expect(screen.getByLabelText("saved-indicator")).toBeInTheDocument();
		});
	});

	it("should show an error if failed to save", async () => {
		renderWithProviders(<Navbar />, {
			preloadedState: { layers: [] }
		});

		const alertSpy = vi.spyOn(window, "alert");
		const error = new Error("No layers to save. This is a bug.");

		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const saveFileOption = screen.getByText("Save File");

		await userEvent.click(saveFileOption);

		await vi.waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith(
				"Error saving file. Reason: " + error.message
			);
		});
	});

	it("should perform a save when using CTRL S", async () => {
		renderWithProviders(<Navbar />);
		fireEvent.keyDown(document, { key: "s", ctrlKey: true });

		await vi.waitFor(() => {
			expect(screen.getByLabelText("saved-indicator")).toBeInTheDocument();
		});
	});

	it("should export file when clicking Export File from File menu", async () => {
		renderWithProviders(<Navbar />);
		const exportLink = screen.getByTestId("export-link");
		const clickSpy = vi.spyOn(exportLink, "click");
		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const exportFileOption = screen.getByText("Export File");

		await userEvent.click(exportFileOption);

		await vi.waitFor(() => {
			expect(clickSpy).toHaveBeenCalled();
		});
	});

	it("should toggle full screen from the View menu", async () => {
		renderWithProviders(<Navbar />);
		const requestFullscreenSpy = vi.spyOn(
			HTMLElement.prototype,
			"requestFullscreen"
		);
		const exitFullscreenSpy = vi.spyOn(document, "exitFullscreen");
		const viewTab = screen.getByRole("menuitem", { name: "View" });

		await userEvent.click(viewTab);

		let fullScreenOption = screen.getByText("Toggle Full Screen");

		await userEvent.click(fullScreenOption);

		// Toggle it.
		expect(requestFullscreenSpy).toHaveBeenCalled();

		// Toggle it back.
		// Note: We need to pretend that the document is in full screen mode.
		// So, we need to mock the getter of `document.fullscreenElement`.
		Object.defineProperty(document, "fullscreenElement", {
			get: fullscreenElementMock.mockReturnValue(true),
			configurable: true
		});

		await userEvent.click(viewTab);

		fullScreenOption = screen.getByText("Toggle Full Screen");
		await userEvent.click(fullScreenOption);

		expect(exitFullscreenSpy).toHaveBeenCalled();
	});
});
