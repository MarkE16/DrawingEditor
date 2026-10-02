// Lib
import { useState, memo, useRef } from "react";
import cn from "@/lib/tailwind-utils";

// Components
import ReferenceWindowHeader from "@/components/ReferenceWindowHeader/ReferenceWindowHeader";
import ReferenceWindowContent from "@/components/ReferenceWindowContent/ReferenceWindowContent";
import ReferenceWindowControls from "@/components/ReferenceWindowControls/ReferenceWindowControls";

// Types
import type { CSSProperties, ReactNode } from "react";
import { Vector } from "@/types";
import { updateVector2 } from "@/lib/utils";

const MemoizedReferenceWindowHeader = memo(ReferenceWindowHeader);
const MemoizedReferenceWindowContent = memo(ReferenceWindowContent);
const MemoizedReferenceWindowControls = memo(ReferenceWindowControls);

function ReferenceWindow(): ReactNode {
	const [imageURL, setImageURL] = useState<string | undefined>(undefined);
	const [flipped, setFlipped] = useState<boolean>(false);
	const [minimal, setMinimal] = useState<boolean>(false);
	const [pinned, setPinned] = useState<boolean>(false);
	const [rotationDegrees, setRotationDegrees] = useState<number>(0);
	// 50 is considered 1x. In the controls, the scale is divided by 50 to get the actual scale.
	// Therefore, 50 / 50 is 1.
	const [scale, setScale] = useState<number>(50);
	const windowRef = useRef<HTMLDivElement>(null);

	const [position, setPosition] = useState<Vector<2>>(() => {
		const pos: Vector<2> = [0, 0];
		if (typeof window !== "undefined") {
			const { innerWidth, innerHeight } = window;

			const windowRefCurrent = windowRef.current;

			if (windowRefCurrent) {
				const { offsetWidth, offsetHeight } = windowRefCurrent;

				updateVector2(
					pos,
					(innerWidth - offsetWidth) / 2,
					(innerHeight - offsetHeight) / 2
				);
			} else {
				updateVector2(pos, innerWidth / 2, innerHeight / 2);
			}
		}
		return pos;
	});
	const positionX = position[0];
	const positionY = position[1];

	const styles: CSSProperties = !pinned
		? {
				left: positionX,
				top: positionY
			}
		: {
				left: 0,
				top: 0
			};

	// CSS variables for calculations
	const headerHeight = "35px";
	const controlsHeight = "70px";
	const controlsPadding = "10px";

	const className = cn(
		"fixed min-w-[300px] max-w-[60vw] min-h-[40px] max-h-full bg-[rgb(36,36,36)] border border-[rgb(56,55,55)] rounded-[5px] z-[100] overflow-hidden",
		{
			"relative border-none top-0 left-0 resize-none max-w-[300px]": pinned,
			resize: !pinned
		}
	);

	return (
		<div
			className={className}
			data-testid="reference-window"
			ref={windowRef}
			style={{
				...styles,
				height: pinned ? "100vh" : "auto",
				// Using CSS variable calculations since they're dynamic
				minHeight: `calc(${headerHeight} + ${controlsHeight} + ${controlsPadding} + 10px)`
			}}
		>
			<MemoizedReferenceWindowHeader
				setPosition={setPosition}
				isPinned={pinned}
			>
				Reference Window
			</MemoizedReferenceWindowHeader>
			<MemoizedReferenceWindowContent
				imageURL={imageURL}
				flipped={flipped}
				scale={scale}
				minimal={minimal}
				rotationDegrees={rotationDegrees}
				setImageURL={setImageURL}
				setMinimal={setMinimal}
			/>
			{!minimal && (
				<MemoizedReferenceWindowControls
					scale={scale}
					pinned={pinned}
					setScale={setScale}
					imageAvailable={Boolean(imageURL)}
					setImageURL={setImageURL}
					setFlipped={setFlipped}
					setPinned={setPinned}
					setRotationDegrees={setRotationDegrees}
				/>
			)}
		</div>
	);
}

export default ReferenceWindow;
