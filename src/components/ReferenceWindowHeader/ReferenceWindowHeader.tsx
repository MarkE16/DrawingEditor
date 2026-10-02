// Lib
import { useEffect, useRef } from "react";
import useStore from "@/state/hooks/useStore";

// Types
import type {
	Dispatch,
	SetStateAction,
	ReactNode,
	MouseEvent as ReactMouseEvent
} from "react";
import type { Vector } from "@/types";

// Icons
import Close from "@/components/icons/Close/Close";
import { updateVector2 } from "@/lib/utils";

type ReferenceWindowHeaderProps = Readonly<{
	isPinned: boolean;
	setPosition: Dispatch<SetStateAction<Vector<2>>>;
	children: ReactNode;
}>;

function ReferenceWindowHeader({
	isPinned,
	setPosition,
	children
}: ReferenceWindowHeaderProps): ReactNode {
	const toggleReferenceWindow = useStore(
		(state) => state.toggleReferenceWindow
	);

	const isDraggingWindow = useRef<boolean>(false);
	const headerRef = useRef<HTMLHeadingElement>(null);
	const clientPosition = useRef<Vector<2>>([0, 0]);

	function handleMouseDown(e: ReactMouseEvent) {
		isDraggingWindow.current = !isPinned;

		updateVector2(clientPosition.current, e.clientX, e.clientY);
	}

	useEffect(() => {
		function handleMouseUp() {
			isDraggingWindow.current = false;
		}

		function handleMouseMove(e: MouseEvent) {
			const header = headerRef.current;
			if (!isDraggingWindow.current || !header) return;

			const x = e.clientX;
			const y = e.clientY;
			const [prevClientX, prevClientY] = clientPosition.current;

			const dx = x - prevClientX;
			const dy = y - prevClientY;

			setPosition((prev) => {
				const nextX = Math.min(
					Math.max(prev[0] + dx, 0),
					window.innerWidth - header.offsetWidth
				);
				const nextY = Math.min(
					Math.max(prev[1] + dy, 0),
					window.innerHeight - header.offsetHeight
				);
				return [nextX, nextY];
			});

			updateVector2(clientPosition.current, x, y);
		}

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [setPosition]);

	const toggleReferenceWindowState = (e: ReactMouseEvent) => {
		e.stopPropagation();
		toggleReferenceWindow();
	};

	return (
		<header
			className="flex justify-between items-center border-b border-white p-[10px] h-[35px] cursor-move"
			ref={headerRef}
			onMouseDown={handleMouseDown}
		>
			<h5 className="font-bold">{children}</h5>
			<button
				data-testid="close-ref-window"
				onClick={toggleReferenceWindowState}
			>
				<Close />
			</button>
		</header>
	);
}

export default ReferenceWindowHeader;
