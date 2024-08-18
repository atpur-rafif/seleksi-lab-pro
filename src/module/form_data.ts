import busboy from "busboy";
import { Request, RouterError } from "./router";
import internal from "stream";

type FormDataResult = object;
export class FormDataParser {
	private req: Request;
	private bb: busboy.Busboy;
	private data: FormDataResult;

	constructor(request: Request) {
		try {
			this.req = request;
			this.bb = busboy({ headers: request.headers });
			this.data = {};
		} catch (error) {
			throw new RouterError("Invalid body type", 400);
		}
	}

	private registerField(name: string, value: string, info: busboy.FieldInfo) {
		console.log(name, value, info);
		if (this.data[name] === undefined) {
			this.data[name] = value;
			return;
		}

		if (!Array.isArray(this.data[name])) this.data[name] = [this.data[name]];
		if (Array.isArray(this.data[name])) this.data[name].push(value);
	}

	private registerFile(
		name: string,
		stream: internal.Readable,
		info: busboy.FileInfo,
	) {
		stream.on("data", () => {});
		stream.on("end", () => {});
		console.log(name, info);
	}

	parse(): Promise<object> {
		let resolver: (data: object) => void;
		const promise = new Promise<object>((r) => {
			resolver = r;
		});

		this.bb.on("field", (...param) => this.registerField(...param));
		this.bb.on("file", (...param) => this.registerFile(...param));
		this.bb.on("close", () => {
			resolver(this.data);
		});

		this.req.pipe(this.bb);
		return promise;
	}
}
