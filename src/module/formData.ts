import busboy from "busboy";
import { Request, RouterError } from "./router";
import internal from "stream";
import { FormFile } from "./formFile";

export class FormDataParser {
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
		data: object,
		name: string,
		value: string,
		_: busboy.FieldInfo,
	) {
		if (this.forcedFile.has(name))
			throw new RouterError(`Expected file for field '${name}'`, 400);

		if (data[name] === undefined) {
			if (this.forcedArray.has(name)) data[name] = [value];
			else data[name] = value;
			return;
		}

		if (!Array.isArray(data[name])) data[name] = [data[name]];
		if (Array.isArray(data[name])) data[name].push(value);
	}

	private async registerFile(
		data: object,
		name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	) {
		data[name] = await this.formFile.save(name, stream, info);
	}

	private wrapPromise(promise: Promise<void>): Promise<Error | void> {
		return new Promise((resolve, _) => {
			promise.then(resolve).catch((e) => resolve(e));
		});
	}

	async parse(request: Request) {
		const promised: Promise<Error | void>[] = [];
		const bb = busboy({ headers: request.headers });
		const data = {};

		const dataPromise = new Promise<void>((resolve) => {
			bb.on("close", resolve);
		});
		bb.on("field", (...param) => {
			promised.push(this.wrapPromise(this.registerField(data, ...param)));
		});
		bb.on("file", (...param) => {
			promised.push(this.wrapPromise(this.registerFile(data, ...param)));
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
		return data;
	}
}
