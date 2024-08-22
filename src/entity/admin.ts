import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Pretify } from "../module/type";

@Entity()
export class Admin {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("varchar", { unique: true })
	username: string;

	@Column("varchar")
	email: string;

	@Column("varchar")
	password: string;

	constructor(value: Omit<Pretify<Admin>, "id" | "created_at" | "updated_at">) {
		Object.assign(this, value);
	}
}
