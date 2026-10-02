import { Eye as LucideEye, EyeOff as LucideEyeOff } from "lucide-react";
import type { ComponentProps } from "react";

const Eye = ({
	lineCross = false,
	...props
}: { lineCross: boolean } & ComponentProps<"svg">) =>
	lineCross ? (
		<LucideEyeOff
			size="1em"
			{...props}
		/>
	) : (
		<LucideEye
			size="1em"
			{...props}
		/>
	);

export default Eye;
