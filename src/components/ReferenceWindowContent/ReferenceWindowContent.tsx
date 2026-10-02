// Lib
import { useState } from "react";

// Types
import cn from "@/lib/tailwind-utils";
import type {
	ReactNode,
	DragEvent,
	Dispatch,
	SetStateAction,
	CSSProperties,
	KeyboardEvent
} from "react";

type ReferenceWindowContentProps = Readonly<{
	imageURL: string | undefined;
	flipped: boolean;
	scale: number;
	minimal: boolean;
	rotationDegrees: number;
	setImageURL: Dispatch<SetStateAction<string | undefined>>;
	setMinimal: Dispatch<SetStateAction<boolean>>;
}>;

function ReferenceWindowContent({
	imageURL,
	flipped,
	scale,
	rotationDegrees,
	minimal,
	setImageURL,
	setMinimal
}: ReferenceWindowContentProps): ReactNode {
	const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
	function onDragOver(e: DragEvent) {
		e.preventDefault();
		setIsDraggingOver(true);
	}

	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		setIsDraggingOver(false);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		setIsDraggingOver(false);

		const files = e.dataTransfer.files;

		if (!files.length) return;

		const file = files[0];

		if (!file.type.match(/\*?.(png|jpg|jpeg)/)) {
			alert("Invalid file type.");
			return;
		}

		setImageURL(URL.createObjectURL(file));
	}

	const handleMinimalChangeOnClick = () => {
		setMinimal((minimal) => !minimal);
	};

	const handleMinimalChangeOnKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			setMinimal((minimal) => !minimal);
		}
	};

	const onImageLoad = () => {
		if (imageURL) {
			URL.revokeObjectURL(imageURL);
		}
	};

	const imageStyles: CSSProperties = {
		transform: `rotate(${rotationDegrees}deg) scaleX(${flipped ? -1 : 1}) scale(${scale / 50})`
	};

	return (
		<section
			className={cn(
				"flex justify-center items-center m-[5px] border border-[rgb(56,55,55)] rounded-[5px] overflow-hidden text-sm",
				{
					"border-dashed border-white": isDraggingOver,
					"h-[calc(100%-50px)]": minimal,
					"h-[calc(100%-120px)]": !minimal
				}
			)}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
			data-testid="reference-window-content"
		>
			{imageURL ? (
				<img
					style={imageStyles}
					className="max-w-full max-h-full h-full object-contain cursor-pointer"
					id="reference-image"
					tabIndex={0}
					src={imageURL}
					alt="Reference"
					onLoad={onImageLoad}
					onClick={handleMinimalChangeOnClick}
					onKeyDown={handleMinimalChangeOnKeyDown}
				/>
			) : (
				<p>Drop an image here to use as a reference.</p>
			)}
		</section>
	);
}

export default ReferenceWindowContent;
