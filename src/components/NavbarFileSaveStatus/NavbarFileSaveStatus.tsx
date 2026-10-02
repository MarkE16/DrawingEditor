// Components
import Tooltip from "@/components/Tooltip/Tooltip";

// Icons
import CloudUpload from "../icons/CloudUpload/CloudUpload";
import Checkmark from "../icons/Checkmark/Checkmark";
import Close from "../icons/Close/Close";

type NavbarFileSaveStatusProps = {
	status: "saved" | "saving" | "error";
};

function NavbarFileSaveStatus({ status }: NavbarFileSaveStatusProps) {
	if (status === "saving") {
		return (
			<Tooltip text="Saving file...">
				<CloudUpload
					className="text-gray-400"
					aria-label="saving-indicator"
				/>
			</Tooltip>
		);
	}
	if (status === "saved") {
		return (
			<Tooltip text="File saved!">
				<Checkmark
					className="text-green-500"
					aria-label="saved-indicator"
				/>
			</Tooltip>
		);
	}

	return (
		<Tooltip text="Error saving file. See console for details.">
			<Close
				className="text-red-500"
				aria-label="save-failed-indicator"
			/>
		</Tooltip>
	);
}

export default NavbarFileSaveStatus;
