import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Pretify } from "../module/type";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar")
	username: string;

	@Column("varchar")
	email: string;

	@Column("integer")
	balance: number;

	@Column("varchar")
	password: string;

	constructor(value: Omit<Pretify<User>, "id" | "created_at" | "updated_at">) {
		Object.assign(this, value);
	}

	serialize() {
		const serialized = { ...this };
		delete serialized.password;
		return serialized;
	}
}
