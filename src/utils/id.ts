class IdGenerator {
	private current: number;

	constructor(start = 0) {
		this.current = start;
	}

	next(): string {
		this.current += 1;
		return this.current.toString();
	}
}

export const Id = new IdGenerator();
export { IdGenerator };
