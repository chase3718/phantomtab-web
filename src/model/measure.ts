import type { Clef, Key, TimeSignature } from '../types';
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
	public clef: Clef = 'treble';

	constructor(
		key: Key = 0,
		timeSignature: TimeSignature = { numerator: 4, denominator: 4 },
		voices?: Voice[],
		previous: Measure | null = null,
		next: Measure | null = null,
		clef: Clef = 'treble'
	) {
		this.id = Id.next();
		this.key = key;
		this.timeSignature = timeSignature;
		this.previous = previous;
		this.next = next;
		this.clef = clef;

		if (previous) {
			previous.next = this;
		}
		if (next) {
			next.previous = this;
		}

		if (voices && voices.length > 0) {
			this.voices = voices;
		} else {
			// Create a single default voice with four even beats deterministically
			const beats = this.createEvenBeats(timeSignature, 4);
			const defaultVoice = new Voice(beats);
			this.voices = [defaultVoice];
		}
	}

	private createEvenBeats(timeSignature: TimeSignature, slots: number): Beat[] {
		const totalDuration = timeSignature.numerator / timeSignature.denominator;
		const beatDuration = totalDuration / slots;
		const beats: Beat[] = [];
		let prev: Beat | null = null;
		for (let i = 0; i < slots; i++) {
			const beat: Beat = new Beat(beatDuration, null, [], prev, null);
			if (prev) prev.next = beat;
			beats.push(beat);
			prev = beat;
		}
		return beats;
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
		const expected = this.getExpectedDuration();
		return this.voices.every((voice) => Math.abs(voice.getTotalDuration() - expected) < 0.0001);
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

	getNext(): Measure | null {
		return this.next;
	}

	getPrevious(): Measure | null {
		return this.previous;
	}

	setKey(newKey: Key): void {
		this.key = newKey;
	}

	setTimeSignature(newTimeSignature: TimeSignature): void {
		this.timeSignature = newTimeSignature;
	}
}
