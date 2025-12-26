import type { Clef, Key, TimeSignature } from '../types';
import { Id } from '../utils/id';
import Voice from './voice';
import Beat from './beat';
import type Part from './part';

export default class Measure {
	public id: string;
	public key: Key;
	public timeSignature: TimeSignature;
	public voices: Voice[];
	public next: Measure | null = null;
	public previous: Measure | null = null;
	public clef: Clef = 'treble';
	public parent: Part | null = null;
	public measureLayout: Array<Array<Beat> | null> = [];

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
			const beats = this.createRandomBeats(timeSignature);
			const defaultVoice = new Voice(beats);
			this.voices = [defaultVoice];
		}
		// Set parent references for voices
		for (const voice of this.voices) {
			voice.parent = this;
		}
		this.computeMeasureLayout();
	}

	private createRandomBeats(timeSignature: TimeSignature): Beat[] {
		const totalDuration = timeSignature.numerator / timeSignature.denominator;
		const beatDurations = [0.25, 0.5, 1, 1.5, 2]; // Common beat durations in whole notes
		const beats: Beat[] = [];
		let accumulatedDuration = 0;
		let prev: Beat | null = null;

		// Note generation helpers
		const steps: Array<'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'> = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
		const octaves = [3, 4, 5];
		const alters: Array<-2 | -1 | 0 | 1 | 2> = [-1, 0, 1];

		const durationToType = (dur: number): 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'thirty-second' => {
			if (dur >= 1) return 'whole';
			if (dur >= 0.5) return 'half';
			if (dur >= 0.25) return 'quarter';
			if (dur >= 0.125) return 'eighth';
			if (dur >= 0.0625) return 'sixteenth';
			return 'thirty-second';
		};

		while (accumulatedDuration < totalDuration) {
			// Randomly select a beat duration that doesn't exceed the total
			const possibleDurations = beatDurations.filter((dur) => accumulatedDuration + dur <= totalDuration);
			const duration = possibleDurations[Math.floor(Math.random() * possibleDurations.length)];

			// Generate random note
			const note = {
				pitch: {
					step: steps[Math.floor(Math.random() * steps.length)],
					octave: octaves[Math.floor(Math.random() * octaves.length)],
					alter: alters[Math.floor(Math.random() * alters.length)],
				},
				type: durationToType(duration),
				dots: 0,
			};

			const beat: Beat = new Beat(duration, note, [], prev, null);
			if (prev) prev.next = beat;
			beats.push(beat);
			prev = beat;
			accumulatedDuration += duration;
		}
		return beats;
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

	private computeMeasureLayout(): void {
		const num32ndNotes = (32 / this.timeSignature.denominator) * this.timeSignature.numerator;
		const layout: Array<Array<Beat> | null> = Array(num32ndNotes).fill(null);

		// Merge all voice layouts into a single layout
		for (const voice of this.voices) {
			for (const beat of voice.beats) {
				const beatLocation = Math.round(beat.placeInMeasure * 32);
				if (beatLocation >= 0 && beatLocation < num32ndNotes) {
					if (layout[beatLocation] === null) {
						layout[beatLocation] = [beat];
					} else {
						layout[beatLocation]!.push(beat);
					}
				}
			}
		}
		this.measureLayout = layout;
	}

	public updateMeasureLayout(): void {
		this.computeMeasureLayout();
		// Update voice layouts as well (but don't recurse back here)
		for (const voice of this.voices) {
			voice.computeMeasureLayout();
		}
	}
}
