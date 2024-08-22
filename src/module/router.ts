import { createServer } from "http";
import { PathInvoker } from "./invoker";
import { parse } from "url";

type RequestResponse = typeof createServer extends (
	config: any,
	callback: (req: infer Req, res: infer Res) => any,
) => any
	? [Req, Res]
	: never;
export type Request = RequestResponse[0];
export type Response = RequestResponse[1];

export class RouterError extends Error {
	statusCode: number;

	constructor(message: string = "Unknown error", statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
	}
}

type ExtendedRequest = Request & {
	pathname: string,
	param: Record<string, string>
}

type ExtendedResponse = Response & {
	send(data: object | string): void;
};

export class Router {
	private invoker: PathInvoker<[ExtendedRequest, ExtendedResponse]> = new PathInvoker();

	private makeRoute(method: string, path: string) {
		return `${method}${path}`;
	}

	private extendResponse(res: Response): ExtendedResponse {
		return Object.assign(res, {
			send: (data: object | string) => {
				let raw: string = "";
				if (typeof data === "object") {
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					raw = JSON.stringify(data);
				} else if (typeof data === "string") raw = data;
				res.write(raw);
				res.end();
			},
		});
	}

	private extendRequest(req: Request): ExtendedRequest {
		return Object.assign(req, {
			param: {},
			pathname: parse(req.url).pathname
		})
	}

	defineRoute<T>(
		method: string,
		path: string,
		invokee: (req: ExtendedRequest, res: ExtendedResponse, dep: T) => Promise<void>,
		dependency?: T,
	) {
		this.invoker.definePath(this.makeRoute(method, path), (req, res) =>
			invokee(req, res, dependency),
		);
	}

	async run(method: string, targetPath: string, req: Request, res: Response) {
		try {
			const status = await this.invoker.invoke(
				this.makeRoute(method, targetPath),
				this.extendRequest(req),
				this.extendResponse(res),
			);
			if (!status) throw new RouterError("Not Found", 404);
		} catch (e) {
			const isRouterError = e instanceof RouterError;
			if (!isRouterError) console.error(e);
			const error = isRouterError ? e : new RouterError();
			res.statusCode = error.statusCode;
			res.write(JSON.stringify({ status: "error", message: error.message }));
			res.end();
		}
	}
}
