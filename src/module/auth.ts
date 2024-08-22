import { adminRepository } from "../entity/repository";
import { Request, RouterError } from "./router";
import jwt from "jsonwebtoken";

type AuthType = { name: string; type: string };
class Auth {
	static round: number = 10;

	sign(data: AuthType) {
		return jwt.sign(data, "secret");
	}

	decode(token: string) {
		try {
			return jwt.verify(token, "secret") as AuthType;
		} catch (error) {
			return null;
		}
	}

	get(req: Request) {
		const [type, token] = req.headers["authorization"].split(" ");
		if (!type) throw new RouterError("Invalid authorization type", 400);
		const decoded = this.decode(token);
		if (!decoded) throw new RouterError("Invalid authorization token", 400);
		return decoded;
	}

	async getAdmin(req: Request) {
		const { name, type } = this.get(req);
		if (!type) throw new RouterError("Invalid account type", 400);

		const admin = await adminRepository.findOneBy({ username: name });
		if (!admin) throw new RouterError("Admin account not found", 400);

		return admin;
	}
}

export const auth = new Auth();
