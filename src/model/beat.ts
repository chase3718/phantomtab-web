import type { Articulation, Clef, Note } from '../types';
import { Id } from '../utils/id';
import type Voice from './voice';

export default class Beat {
	public id: string;
	public duration: number; // Duration in whole notes
	public note: Note | null;
	public placeInMeasure: number;
	public articulations: Articulation[];
	public next: Beat | null = null;
	public previous: Beat | null = null;
	public parent: Voice | null = null;

	constructor(
		duration: number = 0.25,
		note: Note | null = null,
		articulations: Articulation[] = [],
		previous: Beat | null = null,
		next: Beat | null = null
	) {
		this.id = Id.next();
		this.duration = duration;
		this.note = note;
		this.articulations = articulations;
		this.previous = previous;
		this.next = next;

		// Set up bidirectional links
		if (previous) {
			previous.next = this;
			this.placeInMeasure = previous.placeInMeasure + previous.duration;
		} else {
			this.placeInMeasure = 0;
		}

		if (next) {
			next.previous = this;
		}
	}

	/**
	 * @param clef
	 * @returns number | null
	 * Returns the number of staff positions from the center line (or center space if even lines) of the clef.
	 */

	getNotePosisition(clef: Clef = 'treble'): number | null {
		if (!this.note) {
			return null;
		}

		const noteOffset = noteOffsets[this.note.pitch.step];
		const octaveOffset = (this.note.pitch.octave - 4) * 7; // Each octave has 7 staff positions
		const clefOffset = getClefOffset(clef);
		return noteOffset + octaveOffset + clefOffset;
	}

	setDuration(newDuration: number): void {
		this.duration = newDuration;
	}
}

const noteOffsets = {
	C: 0,
	D: 1,
	E: 2,
	F: 3,
	G: 4,
	A: 5,
	B: 6,
};

const clefOffsets = {
	treble: -6,
	bass: -6,
	alto: 0,
	tenor: -2,
} as const;

function getClefOffset(clef: Clef): number {
	// String clefs use fixed offsets
	if (typeof clef === 'string') {
		return clefOffsets[clef] ?? 0;
	}
	// CClef centers on the provided line (1..5). Alto (line 3) maps to offset 0.
	// Moving the C clef up a line decreases offset by 2; down a line increases by 2.
	// Formula: offset = (3 - line) * 2
	const line = Math.min(5, Math.max(1, clef.line));
	return (3 - line) * 2;
}
