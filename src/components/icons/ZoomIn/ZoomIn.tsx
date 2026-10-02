import { ZoomIn as LucideZoomIn } from "lucide-react";
import type { ComponentProps } from "react";

const ZoomIn = (props: ComponentProps<"svg">) => (
	<LucideZoomIn
		size="1em"
		{...props}
	/>
);

export default ZoomIn;
