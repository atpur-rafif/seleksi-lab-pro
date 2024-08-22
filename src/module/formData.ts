import busboy from "busboy";
import { Request, RouterError } from "./router";
import internal from "stream";
import { FormFile } from "./formFile";

export class FormDataParser {
	private formFile: FormFile;
	private forcedFile: Set<string>;
	private forcedArray: Set<string>;

	constructor({
		formFile,
		forceField,
	}: {
		formFile: FormFile;
		forceField?: {
			array?: string[];
			file?: string[];
		};
	}) {
		this.formFile = formFile;

		this.forcedArray = new Set(forceField?.array);
		this.forcedFile = new Set(forceField?.file);
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

	async parse(request: Request) {
		try {
			const promised: Promise<Error | void>[] = [];
			const bb = busboy({ headers: request.headers });
			const data = {};

			const addPromise = (promise: Promise<void>) => {
				promised.push(
					new Promise((resolve, _) => {
						promise.then(resolve).catch((e) => {
							bb.emit("close");
							resolve(e);
						});
					}),
				);
			};

			const dataPromise = new Promise<void>((resolve) => {
				bb.on("close", resolve);
			});
			bb.on("field", (...param) => {
				addPromise(this.registerField(data, ...param));
			});
			bb.on("file", (...param) => {
				addPromise(this.registerFile(data, ...param));
			});
			request.pipe(bb);

			let resolved: (Error | void)[] = [];
			promised.push(dataPromise);
			while (resolved.length !== promised.length) {
				resolved = await Promise.all(promised);
				resolved.map((e) => {
					if (e) throw e;
				});
			}

			return data;
		} catch (error) {
			if (error instanceof RouterError) throw error;
			throw new RouterError(
				"Error parsing the body (Only support multipart/formdata encoding)",
				400,
			);
		}
	}
}
