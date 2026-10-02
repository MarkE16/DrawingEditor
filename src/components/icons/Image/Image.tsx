import { Image as LucideImage } from "lucide-react";
import type { ComponentProps } from "react";

const Image = (props: ComponentProps<"svg">) => (
	<LucideImage
		size="1em"
		{...props}
	/>
);

export default Image;
