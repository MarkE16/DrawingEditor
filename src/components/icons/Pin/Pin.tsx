import { MapPin as LucideMapPin } from "lucide-react";
import type { ComponentProps } from "react";

const Pin = (props: ComponentProps<"svg">) => (
	<LucideMapPin
		size="1em"
		{...props}
	/>
);

export default Pin;
