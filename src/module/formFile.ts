import busboy from "busboy";
import internal from "stream";

export abstract class FormFile {
	abstract save(
		name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	): Promise<string>;
	abstract delete(name: string): Promise<void>;
}

export class FormFileIgnore extends FormFile {
	async delete(_: string): Promise<void> {}
	async save(
		_1: string,
		stream: internal.Readable,
		_2: busboy.FileInfo,
	): Promise<string> {
		stream.on("data", () => {});
		return "null";
	}
}
