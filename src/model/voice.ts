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
		this.reflowBeats();
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
		this.reflowBeats();
	}

	insertBeatAt(index: number, beat: Beat = new Beat(0.25)): void {
		if (index < 0 || index > this.beats.length) {
			throw new Error('Index out of bounds');
		}
		this.beats.splice(index, 0, beat);
		this.reflowBeats();
	}

	removeBeatAt(index: number): Beat | undefined {
		if (index < 0 || index >= this.beats.length) {
			return undefined;
		}
		const [removed] = this.beats.splice(index, 1);
		this.reflowBeats();
		return removed;
	}

	removeLastBeat(): Beat | undefined {
		if (this.beats.length === 0) {
			return undefined;
		}
		const removed = this.beats.pop();
		this.reflowBeats();
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
}
