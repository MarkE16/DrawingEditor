import { Save as LucideSave } from "lucide-react";
import type { ComponentProps } from "react";

const FloppyDisk = (props: ComponentProps<"svg">) => (
	<LucideSave
		size="1em"
		{...props}
	/>
);

export default FloppyDisk;
