import type { Articulation, Note } from '../types';
import { Id } from '../utils/id';

export default class Beat {
	public readonly id: string;
	public readonly duration: number; // Duration in whole notes
	public readonly notes: Note[];
	public readonly articulations: Articulation[];
	public readonly next: Beat | null = null;
	public readonly previous: Beat | null = null;

	constructor(
		duration: number,
		notes?: Note[],
		articulations?: Articulation[],
		previous: Beat | null = null,
		next: Beat | null = null
	) {
		this.id = Id.next();
		this.duration = duration;

		// Default to a C note (middle C) if no notes provided
		if (!notes || notes.length === 0) {
			const noteType = this.getNoteTypeFromDuration(duration);
			this.notes = [
				{
					pitch: { step: 'C', octave: 4, alter: 0 },
					type: noteType,
					dots: 0,
				},
			];
		} else {
			this.notes = notes;
		}

		this.articulations = articulations || [];
		this.previous = previous;
		this.next = next;
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

	getWidth(unitWidth: number = 100): number {
		return this.duration * unitWidth;
	}
}
