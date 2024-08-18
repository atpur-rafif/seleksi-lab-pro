import busboy from "busboy";
import { Request, RouterError } from "./router";
import internal from "stream";
import { FormFile } from "./formFile";

type FormDataResult = object;
export class FormDataParser {
	private req: Request;
	private bb: busboy.Busboy;
	private data: FormDataResult;
	private fileField: Set<string>;
	private formFile: FormFile;

	constructor(request: Request, formFile: FormFile) {
		this.req = request;
		this.data = {};
		this.fileField = new Set();
		this.formFile = formFile;
		try {
			this.bb = busboy({ headers: request.headers });
		} catch (error) {
			throw new RouterError("Invalid body type", 400);
		}
	}

	private registerField(name: string, value: string, info: busboy.FieldInfo) {
		if (this.data[name] === undefined) {
			this.data[name] = value;
			return;
		}

		if (!Array.isArray(this.data[name])) this.data[name] = [this.data[name]];
		if (Array.isArray(this.data[name])) this.data[name].push(value);
	}

	private async registerFile(
		name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	) {
		this.data[name] = await this.formFile.save(name, stream, info);
		this.fileField.add(name);
	}

	getFileField() {
		return this.fileField;
	}

	async parse() {
		const promised = [];

		const dataPromise = new Promise<void>((resolve) => {
			this.bb.on("close", resolve);
		});
		this.bb.on("field", (...param) => this.registerField(...param));
		this.bb.on("file", (...param) =>
			promised.push(this.registerFile(...param)),
		);
		this.req.pipe(this.bb);

		let resolved = [];
		promised.push(dataPromise);
		while (resolved.length !== promised.length) {
			resolved = await Promise.all(promised);
		}

		await dataPromise;
		return this.data;
	}
}
