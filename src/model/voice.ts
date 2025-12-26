import { Id } from '../utils/id';
import Beat from './beat';
import type Measure from './measure';

export default class Voice {
	public id: string;
	public beats: Beat[];
	public parent: Measure | null = null;
	public measureLayout: Array<Beat | null> = [];

	constructor(beats?: Beat[]) {
		this.id = Id.next();

		if (beats && beats.length > 0) {
			this.beats = beats;
		} else {
			// Default to a single beat with quarter note duration
			this.beats = [new Beat(0.25)];
		}
		this.reflowBeats();
		// Set parent references for beats
		for (const beat of this.beats) {
			beat.parent = this;
		}
		this.computeMeasureLayout();
	}

	/**
	 * Get the total duration of all beats in this voice
	 */
	getTotalDuration(): number {
		return this.beats.reduce((sum, beat) => sum + beat.duration, 0);
	}

	/**
	 * Check if this voice fills the expected duration
	 */
	isFilled(expectedDuration: number): boolean {
		return Math.abs(this.getTotalDuration() - expectedDuration) < 0.0001;
	}

	addBeat(beat: Beat = new Beat(0.25)): void {
		beat.parent = this;
		this.beats.push(beat);
		this.reflowBeats();
		this.computeMeasureLayout();
		// Propagate layout update to parent measure
		if (this.parent) {
			this.parent.updateMeasureLayout();
		}
	}

	insertBeatAt(index: number, beat: Beat = new Beat(0.25)): void {
		if (index < 0 || index > this.beats.length) {
			throw new Error('Index out of bounds');
		}
		beat.parent = this;
		this.beats.splice(index, 0, beat);
		this.reflowBeats();
		this.computeMeasureLayout();
		// Propagate layout update to parent measure
		if (this.parent) {
			this.parent.updateMeasureLayout();
		}
	}

	removeBeatAt(index: number): Beat | undefined {
		if (index < 0 || index >= this.beats.length) {
			return undefined;
		}
		const [removed] = this.beats.splice(index, 1);
		if (removed) removed.parent = null;
		this.reflowBeats();
		this.computeMeasureLayout();
		// Propagate layout update to parent measure
		if (this.parent) {
			this.parent.updateMeasureLayout();
		}
		return removed;
	}

	removeLastBeat(): Beat | undefined {
		if (this.beats.length === 0) {
			return undefined;
		}
		const removed = this.beats.pop();
		if (removed) removed.parent = null;
		this.reflowBeats();
		this.computeMeasureLayout();
		// Propagate layout update to parent measure
		if (this.parent) {
			this.parent.updateMeasureLayout();
		}
		return removed;
	}

	getBeatIndex(beatId: string): number {
		return this.beats.findIndex((beat) => beat.id === beatId);
	}

	private reflowBeats(): void {
		let position = 0;
		for (let i = 0; i < this.beats.length; i++) {
			const current = this.beats[i];
			const prev = i > 0 ? this.beats[i - 1] : null;
			const next = i < this.beats.length - 1 ? this.beats[i + 1] : null;
			current.previous = prev;
			current.next = next;
			current.placeInMeasure = position;
			position += current.duration;
		}
	}

	public computeMeasureLayout(): void {
		if (!this.parent) {
			this.measureLayout = [];
			return;
		}
		const ts = this.parent.timeSignature;
		const num32ndNotes = (32 / ts.denominator) * ts.numerator;
		const layout: Array<Beat | null> = Array(num32ndNotes).fill(null);

		for (const beat of this.beats) {
			const beatLocation = Math.round(beat.placeInMeasure * 32);
			if (beatLocation >= 0 && beatLocation < num32ndNotes && layout[beatLocation] === null) {
				layout[beatLocation] = beat;
			}
		}
		this.measureLayout = layout;
	}

	public updateMeasureLayout(): void {
		this.computeMeasureLayout();
	}
}
