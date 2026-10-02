import { Hand as LucideHand } from "lucide-react";
import type { ComponentProps } from "react";

const Hand = (props: ComponentProps<"svg">) => (
	<LucideHand
		size="1em"
		{...props}
	/>
);

export default Hand;
