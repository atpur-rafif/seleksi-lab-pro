import { RouterError } from "./router";

type Field =
	| {
			type: "string" | "number";
	  }
	| {
			type: "array";
			item: Field;
	  }
	| {
			type: "object";
			schema: Schema;
	  };

type Schema = {
	[key: string]: Field & {
		optional?: boolean;
	};
};

type TypeFromSchema<T extends Schema> = {
	[K in keyof T as T[K]["optional"] extends true ? never : K]: TypeFromField<
		T[K]
	>;
} & {
	[K in keyof T as T[K]["optional"] extends true ? K : never]?: TypeFromField<
		T[K]
	>;
} extends infer U extends object
	? { [K in keyof U]: U[K] }
	: never;

type TypeFromField<T extends Field> = T extends { type: "string" }
	? string
	: T extends { type: "number" }
		? number
		: T extends { type: "array" }
			? TypeFromField<T["item"]>[]
			: T extends { type: "object" }
				? TypeFromSchema<T["schema"]>
				: never;

export class Validator<T extends Field> {
	private field: T;

	constructor(schema: T) {
		this.field = schema;
	}

	private throwError(datatype: string, key: string) {
		throw new RouterError(
			`Expected ${datatype}${key ? ` for field '${key}'` : ""}!`,
			400,
		);
	}

	private validateField<T extends Field>(key: string, value: any, field: T) {
		let result: any = value;
		switch (field.type) {
			case "string":
				if (typeof value !== "string") this.throwError(field.type, key);
				break;
			case "number":
				if (typeof value === "string") value = parseInt(value);
				if (typeof value !== "number" || Number.isNaN(value))
					this.throwError(field.type, key);
				break;
			case "array":
				if (!Array.isArray(value)) this.throwError(field.type, key);
				for (const [index, item] of value.entries()) {
					const newKey = `${key}[${index}]`;
					this.validateField(newKey, item, field.item);
				}
				break;
			case "object":
				if (typeof value !== "object") this.throwError(field.type, key);

				result = {};
				for (const [objectKey, objectField] of Object.entries(field.schema)) {
					const item = value[objectKey];
					if (objectField.optional && !item) continue;

					const newKey = key ? `${key}.${objectKey}` : objectKey;
					if (!item) throw new RouterError(`Empty '${newKey}' field`, 400);

					this.validateField(newKey, item, objectField);
					result[objectKey] = item;
				}

				break;
		}

		return result as TypeFromField<T>;
	}

	validate(data: object) {
		return this.validateField("", data, this.field) as TypeFromField<T>;
	}
}
