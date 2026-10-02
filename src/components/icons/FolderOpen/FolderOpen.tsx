import { FolderOpen as LucideFolderOpen } from "lucide-react";
import type { ComponentProps } from "react";

const FolderOpen = (props: ComponentProps<"svg">) => (
	<LucideFolderOpen
		size="1em"
		{...props}
	/>
);

export default FolderOpen;
