import type { Score } from '../model/score';

export default class Editor {
	private score: Score;
	private selectedId: string | null = null;

	constructor(score: Score) {
		this.score = score;
	}

	setSelectedId(id: string | null): void {
		this.selectedId = id;
	}

	getSelectedId(): string | null {
		return this.selectedId;
	}

	getScore(): Score {
		return this.score;
	}
}
