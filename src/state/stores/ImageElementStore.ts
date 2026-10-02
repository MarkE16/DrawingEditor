import BaseStore from "./BaseStore";

type ImageEntry = { id: string; blob: Blob };

/** A class for storing the images of any canvas elements that are images. This class is to be used alongside the CanvasElementSlice in the Zustand store. */
export default class ImageElementStore extends BaseStore {
	protected static override storeName: string = "images";
	public static images: Map<string, HTMLImageElement> = new Map();

	public static putImage(imageId: string, image: HTMLImageElement) {
		this.images.set(imageId, image);
	}

	public static getImage(imageId: string) {
		return this.images.get(imageId);
	}

	public static deleteImage(imageId: string) {
		this.images.delete(imageId);
	}

	public static async saveImages() {
		const promises: Promise<ImageEntry>[] = [];

		for (const [id, image] of this.images.entries()) {
			promises.push(
				new Promise((resolve) => {
					const cvas = document.createElement("canvas");
					cvas.width = image.naturalWidth;
					cvas.height = image.naturalHeight;

					const ctx = cvas.getContext("2d");
					ctx?.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
					cvas.toBlob((blob) => {
						if (!blob) {
							return;
						}

						resolve({
							id,
							blob
						});
					});
				})
			);
		}

		const result = await Promise.all(promises);
		return this.add(result);
	}

	public static async loadImages() {
		//eslint-disable-next-line
		const self = this;
		const entries = await this.get<ImageEntry>();
		const promises: Promise<void>[] = [];

		for (const [id, entry] of entries) {
			promises.push(
				new Promise<void>((resolve) => {
					const img = new Image();

					img.onload = function () {
						URL.revokeObjectURL(img.src);
						self.putImage(id, img);
						resolve();
					};

					img.src = URL.createObjectURL(entry.blob);
				})
			);
		}

		return Promise.all(promises);
	}

	public static openStore() {
		return this.open();
	}

	public static closeStore() {
		return this.close();
	}

	public static clearStore() {
		return this.remove();
	}
}
