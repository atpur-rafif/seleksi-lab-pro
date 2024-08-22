import { Request, RouterError } from "./router";

export class JsonParser {
	async parse(request: Request) {
		if (request.headers["content-type"] !== "application/json")
			throw new RouterError("Only support application/json");
		try {
			const chunks = [];
			for await (const chunk of request) {
				chunks.push(Buffer.from(chunk));
			}
			const payload = Buffer.concat(chunks).toString("utf-8");
			return JSON.parse(payload);
		} catch (error) {
			throw new RouterError("Error parsing json", 400);
		}
	}
}
