import type { Articulation, Note } from '../types';
import { Id } from '../utils/id';

export default class Beat {
	public id: string;
	public duration: number; // Duration in whole notes
	public notes: Note[];
	public placeInMeasure: number;
	public articulations: Articulation[];
	public next: Beat | null = null;
	public previous: Beat | null = null;

	constructor(
		duration: number = 0.25,
		notes?: Note[],
		articulations?: Articulation[],
		previous: Beat | null = null,
		next: Beat | null = null
	) {
		this.id = Id.next();
		this.duration = duration;

		// Default to a random note between C4 and C6 if no notes provided
		if (!notes || notes.length === 0) {
			const noteType = this.getNoteTypeFromDuration(duration);
			const randomNote = this.getRandomNote(noteType);
			this.notes = [randomNote];
		} else {
			this.notes = notes;
		}

		this.articulations = articulations || [];
		this.previous = previous;
		this.next = next;

		// Calculate place in measure based on previous beats
		if (previous) {
			this.placeInMeasure = previous.placeInMeasure + previous.duration;
		} else {
			this.placeInMeasure = 0;
		}
	}

	private getRandomNote(noteType: Note['type']): Note {
		const steps: Array<'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'> = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
		const randomStep = steps[Math.floor(Math.random() * steps.length)];
		const randomOctave = 4 + Math.floor(Math.random() * 2); // 4 or 5

		return {
			pitch: { step: randomStep, octave: randomOctave, alter: 0 },
			type: noteType,
			dots: 0,
		};
	}

	private getNoteTypeFromDuration(
		duration: number
	): 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth' | 'thirty-second' {
		if (duration >= 1) return 'whole';
		if (duration >= 0.5) return 'half';
		if (duration >= 0.25) return 'quarter';
		if (duration >= 0.125) return 'eighth';
		if (duration >= 0.0625) return 'sixteenth';
		return 'thirty-second';
	}

	getWidth(unitWidth: number = 250): number {
		return durationToWidthMap[this.duration] * unitWidth;
	}

	setDuration(newDuration: number): void {
		this.duration = newDuration;
	}
}

const durationToWidthMap: { [key: number]: number } = {
	1: 1, // whole note
	0.5: 0.5, // half note
	0.25: 0.25, // quarter note
	0.125: 0.125, // eighth note
	0.0625: 0.1, // sixteenth note
	0.03125: 0.1, // thirty-second note
};
