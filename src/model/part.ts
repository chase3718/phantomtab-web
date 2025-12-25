import { Id } from '../utils/id';
import Measure from './measure';

export default class Part {
	public id: string;
	public name: string;
	public instrument: string;
	public measures: Measure[];

	constructor(measures: Measure[] = [new Measure()], instrument: string = 'Piano', name: string = 'New Part') {
		this.id = Id.next();
		this.measures = measures;
		this.name = name;
		this.instrument = instrument;
	}

	addMeasure(measure: Measure = new Measure()): void {
		const lastMeasure = this.measures[this.measures.length - 1];
		lastMeasure.setNext(measure);
		this.measures.push(measure);
	}

	insertMeasureAt(index: number, measure: Measure = new Measure()): void {
		if (index < 0 || index > this.measures.length) {
			throw new Error('Index out of bounds');
		}

		if (index === this.measures.length) {
			this.addMeasure(measure);
			return;
		}

		const currentMeasure = this.measures[index];
		const previousMeasure = currentMeasure.previous;

		if (previousMeasure) {
			previousMeasure.setNext(measure);
		}
		measure.setNext(currentMeasure);
		this.measures.splice(index, 0, measure);
	}

	removeLastMeasure(): Measure | undefined {
		if (this.measures.length === 0) {
			return undefined;
		}
		const lastMeasure = this.measures.pop()!;
		const newLastMeasure = this.measures[this.measures.length - 1];
		if (newLastMeasure) {
			newLastMeasure.setNext(null);
		}
		return lastMeasure;
	}

	removeMeasureAt(index: number): Measure {
		if (index < 0 || index >= this.measures.length) {
			throw new Error('Index out of bounds');
		}
		const measureToRemove = this.measures[index];
		const previousMeasure = measureToRemove.previous;
		const nextMeasure = measureToRemove.next;
		if (previousMeasure) {
			previousMeasure.setNext(nextMeasure);
		}
		if (nextMeasure) {
			nextMeasure.setPrevious(previousMeasure);
		}
		this.measures.splice(index, 1);
		return measureToRemove;
	}

	public toString(): string {
		const measures = this.measures.map((measure) => `  Measure ID: ${measure.id}`).join('\n');
		return `Part: ${this.name} (${this.instrument})\nMeasures:\n${measures}`;
	}
}
