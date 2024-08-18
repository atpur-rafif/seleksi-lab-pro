import { createServer } from "node:http";
import { PathInvoker } from "./invoker";

type RequestResponse = typeof createServer extends (
	config: any,
	callback: (req: infer Req, res: infer Res) => any,
) => any
	? [Req, Res]
	: never;
type Request = RequestResponse[0];
type Response = RequestResponse[1];

export class RouterError extends Error {
	statusCode: number;

	constructor(message: string = "Unknown error", statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
	}
}

type ExtendedResponse = Response & {
	send(data: object | string): void;
};

export class Router {
	private invoker: PathInvoker<[Request, ExtendedResponse]> = new PathInvoker();

	private makeRoute(method: string, path: string) {
		return `${method}${path}`;
	}

	private extendResponse(res: Response): ExtendedResponse {
		return Object.assign(res, {
			send: (data: object | string) => {
				let raw: string = "";
				if (typeof data === "object") raw = JSON.stringify(data);
				else if (typeof data === "string") raw = data;
				res.write(raw);
				res.end();
			},
		});
	}

	defineRoute(
		method: string,
		path: string,
		invokee: (...params: [Request, ExtendedResponse]) => Promise<void>,
	) {
		this.invoker.definePath(this.makeRoute(method, path), invokee);
	}

	async run(method: string, targetPath: string, req: Request, res: Response) {
		try {
			const status = await this.invoker.invoke(
				this.makeRoute(method, targetPath),
				req,
				this.extendResponse(res),
			);
			if (!status) throw new RouterError("Not Found", 404);
		} catch (e) {
			const error = e instanceof RouterError ? e : new RouterError();
			res.statusCode = error.statusCode;
			res.write(JSON.stringify({ error: error.message }));
			res.end();
		}
	}
}
