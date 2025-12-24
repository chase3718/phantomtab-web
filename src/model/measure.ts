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
			// Generate random beat durations that add up to the measure duration
			const measureDuration = timeSignature.numerator / timeSignature.denominator; // duration in whole notes
			this.beats = this.generateRandomBeats(measureDuration);
		}
	}

	/**
	 * Generate random beat durations that sum to the total measure duration
	 */
	private generateRandomBeats(totalDuration: number): Beat[] {
		const minBeatDuration = 1 / 8; // eighth note (minimum)
		const maxBeatDuration = 1 / 2; // half note (maximum)
		const numBeats = Math.max(2, Math.min(6, Math.floor(Math.random() * 5) + 2)); // 2-6 beats

		// Generate random durations that sum to totalDuration
		const durations: number[] = [];
		let remainingDuration = totalDuration;

		for (let i = 0; i < numBeats - 1; i++) {
			// For all but the last beat, generate a random duration
			const maxForThisBeat = Math.min(maxBeatDuration, remainingDuration - (numBeats - i - 1) * minBeatDuration);
			const minForThisBeat = Math.max(minBeatDuration, remainingDuration - (numBeats - i - 1) * maxBeatDuration);

			if (minForThisBeat > maxForThisBeat) {
				// Fallback if constraints are too tight
				durations.push(remainingDuration / (numBeats - i));
			} else {
				const randomDuration = minForThisBeat + Math.random() * (maxForThisBeat - minForThisBeat);
				durations.push(randomDuration);
				remainingDuration -= randomDuration;
			}
		}

		// Last beat gets whatever is left to ensure exact total
		durations.push(remainingDuration);

		return durations.map((duration) => new Beat(duration, [], []));
	}

	/**
	 * Get the total duration of all beats in the measure
	 */
	getTotalDuration(): number {
		return this.beats.reduce((sum, beat) => sum + beat.duration, 0);
	}

	/**
	 * Get the expected duration of the measure based on time signature
	 */
	getExpectedDuration(): number {
		return this.timeSignature.numerator / this.timeSignature.denominator;
	}

	/**
	 * Check if the beats add up to the full measure duration
	 */
	isComplete(): boolean {
		return Math.abs(this.getTotalDuration() - this.getExpectedDuration()) < 0.0001; // small epsilon for floating point
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
