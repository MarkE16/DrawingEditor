import { Pencil as LucidePencil } from "lucide-react";
import type { ComponentProps } from "react";

const Pen = (props: ComponentProps<"svg">) => (
	<LucidePencil
		size="1em"
		{...props}
	/>
);

export default Pen;
