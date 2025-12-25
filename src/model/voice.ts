import { Id } from '../utils/id';
import Beat from './beat';

export default class Voice {
	public id: string;
	public beats: Beat[];

	constructor(beats?: Beat[]) {
		this.id = Id.next();

		if (beats && beats.length > 0) {
			this.beats = beats;
		} else {
			// Default to a single beat with quarter note duration
			this.beats = [new Beat(0.25)];
		}
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
		this.beats.push(beat);
	}

	insertBeatAt(index: number, beat: Beat = new Beat(0.25)): void {
		if (index < 0 || index > this.beats.length) {
			throw new Error('Index out of bounds');
		}
		this.beats.splice(index, 0, beat);
	}

	removeBeatAt(index: number): Beat | undefined {
		if (index < 0 || index >= this.beats.length) {
			return undefined;
		}
		return this.beats.splice(index, 1)[0];
	}

	removeLastBeat(): Beat | undefined {
		if (this.beats.length === 0) {
			return undefined;
		}
		return this.beats.pop();
	}

	getBeatIndex(beatId: string): number {
		return this.beats.findIndex((beat) => beat.id === beatId);
	}
}
