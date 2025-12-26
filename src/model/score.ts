import { Id } from '../utils/id';
import Part from './part';
import Measure from './measure';

type ScoreEvents = {
	measuresChanged: { action: 'add' | 'insert' | 'remove'; index: number; count: number };
	partsChanged: { action: 'add' | 'remove'; index: number; count: number };
};

export class Score {
	public id: string;
	public title: string;
	public parts: Part[];
	private listeners: {
		measuresChanged: Set<(payload: ScoreEvents['measuresChanged']) => void>;
		partsChanged: Set<(payload: ScoreEvents['partsChanged']) => void>;
	} = {
		measuresChanged: new Set(),
		partsChanged: new Set(),
	};

	constructor(title: string = 'Untitled', parts: Part[] = [new Part()]) {
		this.id = Id.next();
		this.title = title;
		this.parts = parts;
		// Set parent references for parts
		for (const part of this.parts) {
			part.parent = this;
		}
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

	public on<K extends keyof ScoreEvents>(event: K, handler: (payload: ScoreEvents[K]) => void): () => void {
		const set = this.listeners[event] as Set<(payload: ScoreEvents[K]) => void>;
		set.add(handler);
		return () => set.delete(handler);
	}

	private emit<K extends keyof ScoreEvents>(event: K, payload: ScoreEvents[K]): void {
		const set = this.listeners[event] as Set<(payload: ScoreEvents[K]) => void>;
		set.forEach((handler) => handler(payload));
	}

	public addMeasure(): void {
		const measureCount = this.getMeasureCount();
		for (const part of this.parts) {
			part.addMeasure();
		}
		this.emit('measuresChanged', { action: 'add', index: measureCount, count: 1 });
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
		this.emit('measuresChanged', { action: 'insert', index, count: 1 });
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
		const removed = this.parts.map((part) => part.removeMeasureAt(index));
		this.emit('measuresChanged', { action: 'remove', index, count: 1 });
		return removed;
	}

	public addPart(part: Part = new Part()): void {
		if (this.parts.length === 0) {
			// No existing parts; use the provided part as-is
			part.parent = this;
			this.parts.push(part);
			this.emit('partsChanged', { action: 'add', index: 0, count: 1 });
			return;
		}

		// Clone measure shapes (key/time) from the first part so the new part matches signatures
		const templateMeasures = this.parts[0].measures;
		const clonedMeasures: Measure[] = [];
		let prev: Measure | null = null;
		for (const tmpl of templateMeasures) {
			// Chain previous/next links so measure.previous is correctly set
			const m: Measure = new Measure(tmpl.key, tmpl.timeSignature, undefined, prev, null);
			clonedMeasures.push(m);
			prev = m;
		}

		const newPart = new Part(clonedMeasures, part.instrument, part.name);
		newPart.parent = this;
		this.parts.push(newPart);
		this.emit('partsChanged', { action: 'add', index: this.parts.length - 1, count: 1 });
	}

	public removePart(partId: string): void {
		const index = this.parts.findIndex((p) => p.id === partId);
		if (index >= 0) {
			const removed = this.parts.splice(index, 1)[0];
			if (removed) removed.parent = null;
			this.emit('partsChanged', { action: 'remove', index, count: 1 });
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
