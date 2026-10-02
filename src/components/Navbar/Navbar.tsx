// Lib
import logo from "@/assets/icons/IdeaDrawnNewLogo.png";
import { useRef, useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import useStore from "@/state/hooks/useStore";
import LayersStore from "@/state/stores/LayersStore";
import ElementsStore from "@/state/stores/ElementsStore";
import { detectOperatingSystem, redrawCanvas } from "@/lib/utils";
import useCanvasRef from "@/state/hooks/useCanvasRef";

// Icons
import Fullscreen from "@/components/icons/Fullscreen/Fullscreen";
import { default as ImageIcon } from "@/components/icons/Image/Image";
import Export from "@/components/icons/Export/Export";
import FloppyDisk from "@/components/icons/FloppyDisk/FloppyDisk";
import Close from "@/components/icons/Close/Close";
import ZoomOut from "../icons/ZoomOut/ZoomOut";
import ZoomIn from "../icons/ZoomIn/ZoomIn";
import Rotate from "../icons/Rotate/Rotate";
import FolderOpen from "../icons/FolderOpen/FolderOpen";

// Types
import type {
	ChangeEvent,
	ComponentProps,
	ReactElement,
	ReactNode
} from "react";

// Components
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarTrigger,
	MenubarMenu,
	MenubarPortal,
	MenubarShortcut
} from "@/components/ui/menubar";
import NavbarFileSaveStatus from "../NavbarFileSaveStatus/NavbarFileSaveStatus";
import ImageElementStore from "@/state/stores/ImageElementStore";
import useStoreContext from "@/state/hooks/useStoreContext";
import Undo from "../icons/Undo/Undo";
import Redo from "../icons/Redo/Redo";

function Navbar(): ReactNode {
	const {
		prepareForExport,
		prepareForSave,
		toggleReferenceWindow,
		performZoom,
		centerCanvas,
		setZoom,
		resetLayersAndElements,
		createElement,
		changeDimensions,
		clearHistory,
		undo,
		redo,
		canUndo,
		canRedo
	} = useStore(
		useShallow((state) => ({
			prepareForExport: state.prepareForExport,
			prepareForSave: state.prepareForSave,
			toggleReferenceWindow: state.toggleReferenceWindow,
			performZoom: state.performZoom,
			centerCanvas: state.centerCanvas,
			setZoom: state.setZoom,
			resetLayersAndElements: state.resetLayersAndElements,
			createElement: state.createElement,
			changeDimensions: state.changeDimensions,
			clearHistory: state.clearHistory,
			undo: state.undo,
			redo: state.redo,
			canUndo: state.undoStack.length > 0,
			canRedo: state.redoStack.length > 0
		}))
	);
	const { ref } = useCanvasRef();
	const store = useStoreContext();
	const downloadRef = useRef<HTMLAnchorElement>(null);
	const openFileRef = useRef<HTMLInputElement>(null);
	const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">(
		"saved"
	);
	const menuTabs = ["File", "Edit", "View", "Filter", "Admin"];

	type MenuOptions = {
		[key: string]: {
			text: string;
			action: (() => void) | (() => Promise<void>);
			icon?: (props: ComponentProps<"svg">) => ReactElement;
			shortcut?: string;
			disabled?: boolean;
		}[];
	};

	const handleSaveFile = useCallback(async () => {
		try {
			setSaveStatus("saving");
			const { layers, elements } = prepareForSave();

			if (layers.length === 0) {
				throw new Error("No layers to save. This is a bug.");
			}

			const promises = [];

			promises.push(
				LayersStore.upsertLayers(
					layers.map((layer, i) => ({
						...layer,
						position: i
					}))
				),
				ElementsStore.addElements(elements),
				ImageElementStore.saveImages()
			);

			await Promise.all(promises);

			setSaveStatus("saved");
		} catch (e) {
			alert("Error saving file. Reason: " + (e as Error).message);
		}
	}, [prepareForSave]);

	const handleExportFile = async () => {
		if (!downloadRef.current) throw new Error("Download ref not found");
		if (!ref) {
			alert("Canvas ref not found.");
			return;
		}

		try {
			const blob = await prepareForExport(ref);

			const url = URL.createObjectURL(blob);

			const a = downloadRef.current;
			a.href = url;
			a.download = "canvas.png";
			a.click();

			URL.revokeObjectURL(url);
		} catch (e) {
			alert("Error exporting file. Reason: " + (e as Error).message);
		}
	};

	function getMiddleOfCanvas() {
		if (!ref) {
			throw new Error("Canvas ref does not exist.");
		}

		const { left, top, width, height } = ref.getBoundingClientRect();

		return {
			middleX: (left + width) / 2,
			middleY: (top + height) / 2
		};
	}

	function increaseZoom() {
		const { middleX, middleY } = getMiddleOfCanvas();
		performZoom(middleX, middleY, -50);
		redrawCanvas();
	}

	function decreaseZoom() {
		const { middleX, middleY } = getMiddleOfCanvas();
		performZoom(middleX, middleY, 50);
		redrawCanvas();
	}

	const toggleFullScreen = () => {
		const doc = window.document;
		const docEl = doc.documentElement;

		if (doc.fullscreenElement) {
			doc.exitFullscreen();
		} else {
			docEl.requestFullscreen();
		}
	};

	function resetCanvasView() {
		if (!ref) {
			throw new Error("Canvas ref does not exist.");
		}
		centerCanvas(ref);
		setZoom(1);
		redrawCanvas();
	}

	const openFile = useCallback(() => {
		if (!openFileRef.current) {
			throw new Error("Download ref does not exist.");
		}

		openFileRef.current.click();
	}, []);

	async function handleOpeningFile(e: ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];

		if (!file) {
			alert("No file was inputted.");
			return;
		}

		if (!ref) {
			throw new Error("Canvas ref not found.");
		}

		const shouldLoad = window.confirm(
			"Loading this file will erase all current data. Proceed?"
		);
		if (shouldLoad) {
			// Erase everything...
			await LayersStore.clearStore();
			await ElementsStore.clearStore();
			await ImageElementStore.clearStore();
			store.persist.clearStorage();
			resetLayersAndElements(); // Reset the Zustand state.

			// Upload the image.
			const image = new Image();

			image.onload = function () {
				URL.revokeObjectURL(image.src);

				changeDimensions({
					width: image.naturalWidth,
					height: image.naturalHeight
				});
				const element = createElement("image", {
					width: image.naturalWidth,
					height: image.naturalHeight
				});
				ImageElementStore.putImage(element.id, image);
				centerCanvas(ref);
				redrawCanvas();
				clearHistory();
			};

			image.src = URL.createObjectURL(file);
		}
	}

	function handleUndo() {
		undo();
		redrawCanvas();
	}

	function handleRedo() {
		redo();
		redrawCanvas();
	}

	const menuOptions: MenuOptions = {
		File: [
			{
				text: "Open File",
				action: openFile,
				icon: FolderOpen,
				shortcut: "O"
			},
			{
				text: "Save File",
				action: handleSaveFile,
				icon: FloppyDisk,
				shortcut: "S"
			},
			{
				text: "Export File",
				action: handleExportFile,
				icon: Export
			}
		],
		Edit: [
			{
				text: "Undo",
				action: handleUndo,
				shortcut: "Z",
				icon: Undo,
				disabled: !canUndo
			},
			{
				text: "Redo",
				action: handleRedo,
				shortcut: "Shift+Z",
				icon: Redo,
				disabled: !canRedo
			}
		],
		View: [
			/**
		 * TODO: This button is a temporary fallback for resetting the canvas for when it goes off screen. The better solution
  		is to prevent the canvas from going off screen, but the math is currently unknown for how to do that at the moment. This
   	is a temporary solution.
		 */
			{
				text: "Reset Canvas View",
				action: resetCanvasView,
				icon: Rotate
			},
			{
				text: "Zoom In",
				action: increaseZoom,
				icon: ZoomIn,
				shortcut: "Plus"
			},
			{
				text: "Zoom Out",
				action: decreaseZoom,
				icon: ZoomOut,
				shortcut: "Minus"
			},
			{
				text: "Reference Window",
				action: toggleReferenceWindow,
				icon: ImageIcon
			},
			{
				text: "Toggle Full Screen",
				action: toggleFullScreen,
				icon: Fullscreen
			}
		]
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "s" && e.ctrlKey) {
				e.preventDefault();
				handleSaveFile();
			} else if (e.key === "o" && e.ctrlKey) {
				e.preventDefault();
				openFile();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleSaveFile, openFile]);

	return (
		<header data-testid="nav-bar">
			<nav className="flex items-center p-[0.2rem] min-h-[3rem] h-[3rem] border-b border-b-accent w-full whitespace-nowrap">
				<img
					className="w-[3rem] h-[3rem] mr-2"
					src={logo}
					alt="logo"
				/>

				<Menubar className="flex items-center mr-2">
					{menuTabs.map((tab) => {
						const options = menuOptions[tab];
						let content;
						if (!options || options.length === 0) {
							content = (
								<MenubarItem>
									<span className="mr-[2px]">
										<Close />
									</span>
									No options available
								</MenubarItem>
							);
						} else {
							const shortcutKey =
								detectOperatingSystem() === "MacOS" ? "⌘" : "Ctrl";
							content = options.map((option) => {
								return (
									<MenubarItem
										key={option.text}
										onClick={option.action}
										disabled={option.disabled}
									>
										{option.icon && (
											<span className="mr-[2px]">
												<option.icon />
											</span>
										)}
										{option.text}
										{option.shortcut && (
											<MenubarShortcut>
												{shortcutKey}+{option.shortcut}
											</MenubarShortcut>
										)}
									</MenubarItem>
								);
							});
						}
						return (
							<MenubarMenu key={tab}>
								<MenubarTrigger className="text-[1.1em] font-medium text-[#fdfdfd] cursor-pointer">
									{tab}
								</MenubarTrigger>
								<MenubarPortal>
									<MenubarContent
										className="z-[1000] min-w-[200px] bg-[#242424] rounded-md border border-[#3e3e3e] p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,23,24,0.35),0px_10px_20px_-15px_rgba(22,23,24,0.2)]"
										align="start"
									>
										{content}
									</MenubarContent>
								</MenubarPortal>
							</MenubarMenu>
						);
					})}
				</Menubar>

				<NavbarFileSaveStatus status={saveStatus} />
			</nav>

			<a
				type="file"
				ref={downloadRef}
				style={{ display: "none" }}
				data-testid="export-link"
			/>
			<input
				type="file"
				ref={openFileRef}
				onChange={handleOpeningFile}
				style={{ display: "none" }}
			/>
		</header>
	);
}

export default Navbar;
