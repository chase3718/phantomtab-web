import type { Score } from '../model/score';

export default class Editor {
	private score: Score;
	private selectedBeatId: string | null = null;

	constructor(score: Score) {
		this.score = score;
	}

	setSelectedBeat(beatId: string | null): void {
		this.selectedBeatId = beatId;
	}

	getSelectedBeat(): string | null {
		return this.selectedBeatId;
	}

	getScore(): Score {
		return this.score;
	}
}
