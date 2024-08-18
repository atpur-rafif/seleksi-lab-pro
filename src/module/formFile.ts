import busboy from "busboy";
import { createWriteStream, mkdirSync } from "fs";
import internal from "stream";
import { resolve as resolveUrl } from "url";
import { resolve as resolvePath } from "path";

export abstract class FormFile {
	abstract save(
		name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	): Promise<string>;
	abstract delete(name: string): Promise<void>;
}

export class FormFileToDisk extends FormFile {
	baseUrl: string;
	directory: string;
	constructor(baseUrl: string, directory: string) {
		super();
		this.baseUrl = baseUrl;
		this.directory = directory;
		mkdirSync(directory, { recursive: true });
	}

	generateRandom() {
		return Math.random().toString(36).substring(2);
	}

	async save(
		_name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	): Promise<string> {
		const filename = `${this.generateRandom()}-${info.filename}`;
		const path = resolvePath(this.directory, filename);
		const disk = createWriteStream(path);
		stream.pipe(disk);
		await new Promise((resolve) => {
			disk.on("close", resolve);
		});
		return resolveUrl(this.baseUrl, filename);
	}

	async delete(_name: string): Promise<void> {}
}
