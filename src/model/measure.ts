import type { Key, TimeSignature } from '../types';
import { Id } from '../utils/id';
import Beat from './beat';

export default class Measure {
	public id: string;
	public key: Key;
	public timeSignature: TimeSignature;
	public beats: Beat[];
	private next: Measure | null = null;
	private previous: Measure | null = null;

	constructor(
		key: Key = 0,
		timeSignature: TimeSignature = { numerator: 4, denominator: 4 },
		beats?: Beat[],
		previous: Measure | null = null,
		next: Measure | null = null
	) {
		this.id = Id.next();
		this.key = key;
		this.timeSignature = timeSignature;
		this.previous = previous;
		this.next = next;

		if (previous) {
			previous.next = this;
		}
		if (next) {
			next.previous = this;
		}

		if (beats && beats.length > 0) {
			this.beats = beats;
		} else {
			// Create quarter note beats to fill the measure
			const quarterNoteDuration = 1 / 4; // quarter note in whole notes
			const numBeats = timeSignature.numerator; // for 4/4 time, this creates 4 beats
			this.beats = Array.from({ length: numBeats }, () => new Beat(quarterNoteDuration, [], []));
		}
	}

	getBeatIndex(beatId: string): number {
		return this.beats.findIndex((beat) => beat.id === beatId);
	}

	setNext(measure: Measure | null): void {
		this.next = measure;
		if (measure) {
			measure.previous = this;
		}
	}

	setPrevious(measure: Measure | null): void {
		this.previous = measure;
		if (measure) {
			measure.next = this;
		}
	}

	getNext(): Measure | null {
		return this.next;
	}

	getPrevious(): Measure | null {
		return this.previous;
	}
}
