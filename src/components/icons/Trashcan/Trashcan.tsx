import { Trash2 as LucideTrash2 } from "lucide-react";
import type { ComponentProps } from "react";

const Trashcan = (props: ComponentProps<"svg">) => (
	<LucideTrash2
		size="1em"
		{...props}
	/>
);

export default Trashcan;
