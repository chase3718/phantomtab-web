import { Id } from '../utils/id';
import Measure from './measure';

export default class Part {
	public readonly id: string;
	public readonly name: string;
	public readonly instrument: string;
	public readonly measures: Measure[];

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
		console.log(`Added measure ${measure.id} to part ${this.id}`);
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
		const previousMeasure = currentMeasure.getPrevious();

		if (previousMeasure) {
			previousMeasure.setNext(measure);
		}
		measure.setNext(currentMeasure);
		this.measures.splice(index, 0, measure);
		console.log(`Inserted measure ${measure.id} at index ${index} in part ${this.id}`);
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
		console.log(`Removed measure ${lastMeasure.id} from part ${this.id}`);
		return lastMeasure;
	}

	removeMeasureAt(index: number): Measure {
		if (index < 0 || index >= this.measures.length) {
			throw new Error('Index out of bounds');
		}
		const measureToRemove = this.measures[index];
		const previousMeasure = measureToRemove.getPrevious();
		const nextMeasure = measureToRemove.getNext();
		if (previousMeasure) {
			previousMeasure.setNext(nextMeasure);
		}
		if (nextMeasure) {
			nextMeasure.setPrevious(previousMeasure);
		}
		this.measures.splice(index, 1);
		console.log(`Removed measure ${measureToRemove.id} at index ${index} from part ${this.id}`);
		return measureToRemove;
	}

	public toString(): string {
		const measures = this.measures.map((measure) => `  Measure ID: ${measure.id}`).join('\n');
		return `Part: ${this.name} (${this.instrument})\nMeasures:\n${measures}`;
	}
}
