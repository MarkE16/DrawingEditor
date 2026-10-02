// Components
import {
	ColorField as AriaColorField,
	Label,
	Input
} from "react-aria-components";

// Types
import type {
	ChangeEvent,
	ReactNode,
	KeyboardEvent,
	PropsWithChildren
} from "react";

type ColorFieldProps = PropsWithChildren & {
	label: string;
	value?: string;
	onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
};

function ColorField({
	label,
	value,
	onChange,
	...props
}: ColorFieldProps): ReactNode {
	const stopPropagation = (e: KeyboardEvent) => e.stopPropagation();
	return (
		<AriaColorField
			className="flex flex-col text-[var(--text-color)]"
			{...props}
		>
			<Label>{label}</Label>
			<Input
				type="text"
				value={value}
				className="p-[0.286rem] m-0 border border-solid border-[#000000] rounded-md bg-[var(--field-background)] text-[1.143rem] text-[var(--field-text-color)] w-full max-w-[12ch] box-border data-[focused]:outline-2 data-[focused]:outline-solid data-[focused]:outline-[var(--focus-ring-color)] data-[focused]:outline-offset-[-1px]"
				onChange={onChange}
				onKeyDown={stopPropagation}
			/>
		</AriaColorField>
	);
}

export default ColorField;
