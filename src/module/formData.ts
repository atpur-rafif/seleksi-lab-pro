import busboy from "busboy";
import { Request, RouterError } from "./router";
import internal from "stream";
import { FormFile } from "./formFile";

type FormDataResult = object;
export class FormDataParser {
	private data: FormDataResult;
	private fileField: Set<string>;
	private formFile: FormFile;

	private forcedFile: Set<string>;
	private forcedArray: Set<string>;

	constructor(
		formFile: FormFile,
		forceField?: {
			array?: string[];
			file?: string[];
		},
	) {
		this.data = {};
		this.fileField = new Set();
		this.formFile = formFile;

		this.forcedArray = new Set(forceField.array);
		this.forcedFile = new Set(forceField.file);
		try {
		} catch (error) {
			throw new RouterError(
				"Error parsing the body (Only support multipart/formdata encoding)",
				400,
			);
		}
	}

	private async registerField(
		name: string,
		value: string,
		_: busboy.FieldInfo,
	) {
		if (this.forcedFile.has(name))
			throw new RouterError(`Expected file for field '${name}'`, 400);

		if (this.data[name] === undefined) {
			if (this.forcedArray.has(name)) this.data[name] = [value];
			else this.data[name] = value;
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

	private wrapPromise(promise: Promise<void>): Promise<Error | void> {
		return new Promise((resolve, _) => {
			promise.then(resolve).catch((e) => resolve(e));
		});
	}

	async parse(request: Request) {
		const promised: Promise<Error | void>[] = [];
		const bb = busboy({ headers: request.headers });

		const dataPromise = new Promise<void>((resolve) => {
			bb.on("close", resolve);
		});
		bb.on("field", (...param) => {
			promised.push(this.wrapPromise(this.registerField(...param)));
		});
		bb.on("file", (...param) => {
			promised.push(this.wrapPromise(this.registerFile(...param)));
		});
		request.pipe(bb);

		let resolved = [];
		promised.push(dataPromise);
		while (resolved.length !== promised.length) {
			resolved = await Promise.all(promised);
			resolved.map((e) => {
				if (e) throw e;
			});
		}

		await dataPromise;
		return this.data;
	}
}
