import { Id } from '../utils/id';
import Part from './part';
import Measure from './measure';

export class Score {
	public readonly id: string;
	public readonly title: string;
	public readonly parts: Part[];

	constructor(title: string = 'Untitled', parts: Part[] = [new Part()]) {
		this.id = Id.next();
		this.title = title;
		this.parts = parts;
	}

	public toString(): string {
		const parts = this.parts.map((part) => part.toString()).join('\n');
		return `Score: ${this.title}\nParts:\n${parts}`;
	}

	public shortString(): string {
		return `Score: ${this.title}, Parts: ${this.parts.length}`;
	}

	// Minimal API used by commands/context
	public getParts(): Part[] {
		return this.parts;
	}

	public getMeasureCount(): number {
		return this.parts.length > 0 ? this.parts[0].measures.length : 0;
	}

	public addMeasure(): void {
		for (const part of this.parts) {
			part.addMeasure();
		}
	}

	public insertMeasureAt(
		index: number,
		measureFactory: () => Measure = () => new Measure(),
		perPartMeasures?: Measure[]
	): void {
		if (this.parts.length === 0) return;
		const measureCount = this.parts[0].measures.length;
		if (index < 0 || index > measureCount) {
			throw new Error('Index out of bounds');
		}

		this.parts.forEach((part, partIndex) => {
			const measure = perPartMeasures?.[partIndex] ?? measureFactory();
			// Detach any existing links before inserting to avoid stale references
			measure.setPrevious(null);
			measure.setNext(null);
			part.insertMeasureAt(index, measure);
		});
	}

	public insertMeasuresAt(index: number, measures: Array<Measure> = [new Measure()]): void {
		if (measures.length === 0) {
			return;
		}
		let offset = 0;
		for (const measure of measures) {
			this.insertMeasureAt(index + offset, () => this.cloneMeasureShape(measure));
			offset++;
		}
	}

	public removeMeasureAt(index: number): Measure[] {
		if (this.parts.length === 0) return [];
		const measureCount = this.parts[0].measures.length;
		if (index < 0 || index >= measureCount) {
			throw new Error('Index out of bounds');
		}
		return this.parts.map((part) => part.removeMeasureAt(index));
	}

	public addPart(part: Part = new Part()): void {
		if (this.parts.length > 0) {
			while (part.measures.length !== this.parts[0].measures.length) {
				if (part.measures.length < this.parts[0].measures.length) {
					part.addMeasure();
				} else {
					part.removeLastMeasure();
				}
			}
		}
		this.parts.push(part);
	}

	public removePart(partId: string): void {
		const index = this.parts.findIndex((p) => p.id === partId);
		if (index >= 0) {
			this.parts.splice(index, 1);
		}
	}

	public getPartById(partId: string): Part | undefined {
		return this.parts.find((p) => p.id === partId);
	}

	public getMeasure(partId: string, measureNumber: number): Measure | undefined {
		const part = this.getPartById(partId);
		if (!part) return undefined;
		const idx = measureNumber - 1;
		return idx >= 0 && idx < part.measures.length ? part.measures[idx] : undefined;
	}

	private cloneMeasureShape(measure: Measure): Measure {
		return new Measure(measure.key, measure.timeSignature);
	}
}
