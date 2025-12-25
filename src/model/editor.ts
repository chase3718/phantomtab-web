import type { Score } from '../model/score';

export default class Editor {
	public score: Score;
	public selectedId: string | null = null;

	constructor(score: Score) {
		this.score = score;
	}
}
