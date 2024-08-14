import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Pretify } from "../type";

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

	constructor(value: Omit<Pretify<User>, "id" | "created_at" | "updated_at">) {
		Object.assign(this, value);
	}
}
