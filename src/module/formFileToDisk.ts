import { createWriteStream, mkdirSync } from "fs";
import { resolve as resolveUrl } from "url";
import { resolve as resolvePath } from "path";
import busboy from "busboy";
import internal from "stream";
import { FormFile } from "./formFile";

type Callback = (name: string, info: busboy.FileInfo) => void;
export class FormFileToDisk extends FormFile {
	baseUrl: string;
	directory: string;
	onFile?: Callback;
	constructor(baseUrl: string, directory: string, onFile?: Callback) {
		super();
		this.baseUrl = baseUrl;
		this.directory = directory;
		this.onFile = onFile;
		mkdirSync(directory, { recursive: true });
	}

	generateRandom() {
		return Math.random().toString(36).substring(2);
	}

	async save(
		name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	): Promise<string> {
		if (this.onFile) this.onFile(name, info);
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
