import type { Key, TimeSignature } from '../types';
import { Id } from '../utils/id';
import Voice from './voice';
import Beat from './beat';

export default class Measure {
	public id: string;
	public key: Key;
	public timeSignature: TimeSignature;
	public voices: Voice[];
	public next: Measure | null = null;
	public previous: Measure | null = null;

	constructor(
		key: Key = 0,
		timeSignature: TimeSignature = { numerator: 4, denominator: 4 },
		voices?: Voice[],
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

		if (voices && voices.length > 0) {
			this.voices = voices;
		} else {
			// Create a single default voice with random beats
			const measureDuration = timeSignature.numerator / timeSignature.denominator;
			const defaultVoice = new Voice(this.generateRandomBeats(measureDuration));
			this.voices = [defaultVoice];
		}
	}

	/**
	 * Generate random beat durations that sum to the total measure duration
	 */
	private generateRandomBeats(totalDuration: number, maxAttempts: number = 10): Array<Beat> {
		const possibleDurations = [1, 0.5, 0.25, 0.125]; // whole, half, quarter, eighth notes
		const MIN = 0.125;
		const EPS = 1e-6;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const numBeats = Math.max(2, Math.min(6, Math.floor(Math.random() * 5) + 2)); // 2-6 beats
			const durations: number[] = [];
			let remaining = totalDuration;
			let valid = true;

			for (let i = 0; i < numBeats - 1; i++) {
				const beatsLeft = numBeats - i; // including this beat
				const maxForBeat = remaining - (beatsLeft - 1) * MIN;
				const validDurations = possibleDurations.filter((d) => d >= MIN - EPS && d <= maxForBeat + EPS);

				if (validDurations.length === 0) {
					valid = false;
					break;
				}

				const dur = validDurations[Math.floor(Math.random() * validDurations.length)];
				durations.push(dur);
				remaining -= dur;
			}

			if (!valid) continue;

			const lastBeat = remaining;
			const isValidLast = possibleDurations.some((d) => Math.abs(d - lastBeat) < EPS);

			if (isValidLast) {
				durations.push(lastBeat);
				return durations.map((duration) => new Beat(duration));
			}
		}

		// Fallback: four equal quarter notes
		const quarter = totalDuration / 4;
		return [new Beat(quarter), new Beat(quarter), new Beat(quarter), new Beat(quarter)];
	}

	/**
	 * Get all beats from all voices (flattened)
	 */
	getAllBeats() {
		return this.voices.flatMap((voice) => voice.beats);
	}

	/**
	 * Get beats from a specific voice by index
	 */
	getVoiceBeats(voiceIndex: number) {
		if (voiceIndex < 0 || voiceIndex >= this.voices.length) {
			return [];
		}
		return this.voices[voiceIndex].beats;
	}

	/**
	 * Get the total duration of all beats in the measure
	 */
	getTotalDuration(): number {
		return this.voices.reduce((sum, voice) => sum + voice.getTotalDuration(), 0) / this.voices.length;
	}

	/**
	 * Get the expected duration of the measure based on time signature
	 */
	getExpectedDuration(): number {
		return this.timeSignature.numerator / this.timeSignature.denominator;
	}

	/**
	 * Check if all voices are complete (filled to measure duration)
	 */
	isComplete(): boolean {
		return this.voices.every((voice) => Math.abs(voice.getTotalDuration() - this.getExpectedDuration()) < 0.0001);
	}

	/**
	 * Get the index of a beat across all voices
	 */
	getBeatIndex(beatId: string): { voiceIndex: number; beatIndex: number } | null {
		for (let voiceIndex = 0; voiceIndex < this.voices.length; voiceIndex++) {
			const beatIndex = this.voices[voiceIndex].beats.findIndex((beat) => beat.id === beatId);
			if (beatIndex !== -1) {
				return { voiceIndex, beatIndex };
			}
		}
		return null;
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
}
