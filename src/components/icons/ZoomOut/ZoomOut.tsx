import { ZoomOut as LucideZoomOut } from "lucide-react";
import type { ComponentProps } from "react";

const ZoomOut = (props: ComponentProps<"svg">) => (
	<LucideZoomOut
		size="1em"
		{...props}
	/>
);

export default ZoomOut;
