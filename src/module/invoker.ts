export class PathInvoker<T extends any[]> {
	invokees: [string, (...params: T) => Promise<void>][] = [];

	definePath(path: string, invokee: (...params: T) => Promise<void>) {
		this.invokees.push([path, invokee]);
	}

	async invoke(targetPath: string, ...params: T) {
		for (const [path, invokee] of this.invokees) {
			const targetSplitted = targetPath.split("/");
			const pathSplitted = path.split("/");
			if (targetSplitted.length !== pathSplitted.length) continue;

			let match = true;
			for (let i = 0; i < pathSplitted.length; ++i) {
				if (pathSplitted[i] === "*") continue;
				if (pathSplitted[i] === targetSplitted[i]) continue;
				match = false;
			}
			if (!match) continue;

			await invokee(...params);
			return true;
		}

		return false;
	}
}
