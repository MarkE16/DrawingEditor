// Lib
import { useRef, useState, useEffect } from "react";
import cn from "@/lib/tailwind-utils";

// Types
import type { ReactNode } from "react";

type ScaleIndicatorProps = Readonly<{
	scale: number;
}>;

type Timer = ReturnType<typeof setTimeout>;

function ScaleIndicator({ scale }: ScaleIndicatorProps): ReactNode {
	const timeoutRef = useRef<Timer>(null);
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		setVisible(true);
		timeoutRef.current = setTimeout(() => setVisible(false), 2000);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [scale]);

	return (
		<div
			className={cn(
				"absolute left-2.5 bottom-2.5 p-1.5 z-10 bg-black rounded-md",
				"transition-opacity duration-150 pointer-events-none",
				{ "opacity-100": visible, "opacity-20": !visible }
			)}
		>
			{scale.toFixed(1)}x
		</div>
	);
}

export default ScaleIndicator;
