import { FileUp as LucideFileUp } from "lucide-react";
import type { ComponentProps } from "react";

const Export = (props: ComponentProps<"svg">) => (
	<LucideFileUp
		size="1em"
		{...props}
	/>
);

export default Export;
