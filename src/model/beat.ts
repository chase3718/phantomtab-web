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
		notes: Note[],
		articulations: Articulation[],
		previous: Beat | null = null,
		next: Beat | null = null
	) {
		this.id = Id.next();
		this.duration = duration;
		this.notes = notes;
		this.articulations = articulations;
		this.previous = previous;
		this.next = next;
	}
}
