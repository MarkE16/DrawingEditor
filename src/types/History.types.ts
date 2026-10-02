import { CanvasElement } from "./index";

export type HistoryAction =
	| {
			type: "add_element";
			properties: Partial<CanvasElement>;
	  }
	| {
			type: "move_element";
			properties: {
				layerId: string;
				dx: number;
				dy: number;
			};
	  };
