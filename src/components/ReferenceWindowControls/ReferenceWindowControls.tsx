// Lib
import { useRef } from "react";

// Components
import Tooltip from "@/components/Tooltip/Tooltip";

// Icons
import Pin from "@/components/icons/Pin/Pin";
import Flip from "@/components/icons/Flip/Flip";
import Rotate from "@/components/icons/Rotate/Rotate";
import ZoomOut from "@/components/icons/ZoomOut/ZoomOut";
import ZoomIn from "@/components/icons/ZoomIn/ZoomIn";

// Types
import type { Dispatch, SetStateAction, ReactNode } from "react";

type ReferenceWindowControlsProps = Readonly<{
	scale: number;
	pinned: boolean;
	setScale: Dispatch<SetStateAction<number>>;
	imageAvailable: boolean;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
	setFlipped: Dispatch<SetStateAction<boolean>>;
	setPinned: Dispatch<SetStateAction<boolean>>;
	setRotationDegrees: Dispatch<SetStateAction<number>>;
}>;

function ReferenceWindowControls({
	scale,
	pinned,
	setScale,
	imageAvailable,
	setImageURL,
	setFlipped,
	setPinned,
	setRotationDegrees
}: ReferenceWindowControlsProps): ReactNode {
	const fileInput = useRef<HTMLInputElement>(null);
	const buttonCss =
		"bg-transparent border-none text-white rounded-[10px] p-[5px] text-[0.9em] mx-[2px] cursor-pointer hover:bg-[rgba(255,255,255,0.1)] first:ml-0 last:mr-0 disabled:text-[rgba(255,255,255,0.5)] disabled:cursor-not-allowed disabled:hover:bg-transparent";

	const onReplaceImage = () => {
		if (fileInput.current) {
			fileInput.current.click();
		}
	};

	const onFileChange = () => {
		if (fileInput.current) {
			const file = fileInput.current.files?.[0];

			if (!file) return;

			if (!file.type.match(/\*?.(png|jpg|jpeg)/)) {
				alert("Invalid file type.");
				return;
			}

			if (file) {
				setImageURL(URL.createObjectURL(file));
			}
		}
	};

	const onFlip = () => {
		setFlipped((flipped) => !flipped);
	};

	const onRotate = () => {
		setRotationDegrees((degrees) => (degrees + 90) % 360);
	};

	const onPin = () => {
		setPinned((pinned) => !pinned);
	};

	const updateScale = (_for: "increase" | "decrease") => {
		setScale((prev) => {
			if (_for === "increase") {
				return Math.min(prev + 10, 100);
			}
			return Math.max(prev - 10, 1);
		});
	};

	return (
		<section
			className="p-[10px] h-[70px] border-t border-white [&>*]:w-full"
			id="reference-window-controls"
			data-testid="reference-window-controls"
		>
			<input
				disabled={!imageAvailable}
				type="range"
				min="1"
				max="100"
				step="1"
				value={scale}
				onChange={(e) => setScale(+e.target.value)}
				data-testid="scale-slider"
			/>
			<section
				id="reference-window-controls-button-group"
				className="flex justify-between items-center"
			>
				<aside>
					<Tooltip
						text="Zoom In"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable || scale === 100}
							className={buttonCss}
							onClick={() => updateScale("increase")}
							data-testid="zoom-in"
						>
							<ZoomIn />
						</button>
					</Tooltip>
					<Tooltip
						text="Zoom Out"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable || scale === 1}
							className={buttonCss}
							onClick={() => updateScale("decrease")}
							data-testid="zoom-out"
						>
							<ZoomOut />
						</button>
					</Tooltip>
					<Tooltip
						text={pinned ? "Unpin" : "Pin"}
						position="bottom"
						arrow={false}
					>
						<button
							onClick={onPin}
							className={buttonCss}
							data-testid="pin"
						>
							<Pin />
						</button>
					</Tooltip>
					<Tooltip
						text="Flip Horizontally"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable}
							className={buttonCss}
							onClick={onFlip}
							data-testid="flip"
						>
							<Flip />
						</button>
					</Tooltip>
					<Tooltip
						text="Rotate 90 Degrees"
						position="bottom"
						arrow={false}
					>
						<button
							disabled={!imageAvailable}
							className={buttonCss}
							onClick={onRotate}
							data-testid="rotate"
						>
							<Rotate />
						</button>
					</Tooltip>
				</aside>
				<aside>
					<button onClick={onReplaceImage}>Replace Image</button>
				</aside>
			</section>

			<input
				ref={fileInput}
				type="file"
				accept="image/*"
				onChange={onFileChange}
				data-testid="ref-window-file-input"
				style={{ display: "none" }}
			/>
		</section>
	);
}

export default ReferenceWindowControls;
