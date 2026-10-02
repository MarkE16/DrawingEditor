import { Move as LucideMove } from "lucide-react";
import type { ComponentProps } from "react";

const Move = (props: ComponentProps<"svg">) => (
	<LucideMove
		size="1em"
		{...props}
	/>
);

export default Move;
