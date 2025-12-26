import type { Score } from '../model/score';
import type { PartLayout } from '../types';
import { STAFF_HEIGHT, STAFF_LINE_SPACING } from '../views/editor/components/score/constants';

export default class Editor {
	public score: Score;
	public selectedId: string | null = null;
	public measureLayouts: Array<Array<number>> = [];
	public partLayouts: Map<string, PartLayout> = new Map();
	private unsubscribeMeasuresChanged?: () => void;
	private unsubscribePartsChanged?: () => void;

	constructor(score: Score) {
		this.score = score;
		// Keep layouts in sync with score mutations
		this.unsubscribeMeasuresChanged = this.score.on('measuresChanged', this.handleMeasuresChanged);
		this.unsubscribePartsChanged = this.score.on('partsChanged', this.handlePartsChanged);
		// Seed initial layouts so renders only read cached widths
		this.computeMeasureLayouts();
		this.computePartLayouts();
	}

	public dispose(): void {
		this.unsubscribeMeasuresChanged?.();
		this.unsubscribePartsChanged?.();
	}

	private handleMeasuresChanged = (event: { action: 'add' | 'insert' | 'remove'; index: number; count: number }) => {
		switch (event.action) {
			case 'add': {
				for (let i = 0; i < event.count; i++) {
					this.computeMeasureLayout(event.index + i);
				}
				this.computeMeasureLayouts();
				break;
			}
			case 'insert': {
				const placeholders = Array.from({ length: event.count }, () => [] as number[]);
				this.measureLayouts.splice(event.index, 0, ...placeholders);
				for (let i = 0; i < event.count; i++) {
					this.computeMeasureLayout(event.index + i);
				}
				this.computeMeasureLayouts();
				break;
			}
			case 'remove': {
				this.measureLayouts.splice(event.index, event.count);
				this.computeMeasureLayouts();
				break;
			}
		}
	};

	private handlePartsChanged = () => {
		// Parts structure changed; recompute all layouts to stay in sync
		this.computeMeasureLayouts();
		this.computePartLayouts();
	};

	computeMeasureLayouts(): Array<Array<number>> {
		const measureCount = this.score.parts[0]?.measures.length ?? 0;
		const layouts: Array<Array<number>> = Array.from({ length: measureCount }, (_, idx) =>
			this.computeMeasureLayout(idx)
		);
		this.measureLayouts = layouts;
		console.log('Computed measure layouts:', layouts);
		return layouts;
	}

	computeMeasureLayout(measureIndex: number): Array<number> {
		if (measureIndex < 0) return [];
		const firstPart = this.score.parts[0];
		if (!firstPart || measureIndex >= firstPart.measures.length) {
			return [];
		}
		const num32ndNotes =
			(32 / firstPart.measures[measureIndex].timeSignature.denominator) *
			firstPart.measures[measureIndex].timeSignature.numerator;
		const layout: Array<number> = Array(num32ndNotes).fill(0);

		this.score.parts.forEach((part) => {
			const measure = part.measures[measureIndex];
			measure.voices.forEach((voice) => {
				voice.beats.forEach((beat) => {
					const beatLocation = beat.placeInMeasure * 32;
					layout[beatLocation] = 1;
				});
			});
		});
		this.measureLayouts[measureIndex] = layout;
		console.log(`Computed layout for measure ${measureIndex}:`, layout);
		return layout;
	}

	computePartLayout(partId: string): PartLayout | null {
		const part = this.score.parts.find((p) => p.id === partId);
		if (!part) {
			return null;
		}
		let topHeight = 20;
		let bottomHeight = 20;
		part.measures.forEach((measure) => {
			measure.voices.forEach((voice) => {
				voice.beats.forEach((beat) => {
					if (beat.note) {
						const pos = beat.getNotePosisition(measure.clef);

						if (pos && pos >= 4) {
							topHeight = Math.max(bottomHeight, (pos - 3.5) * STAFF_LINE_SPACING);
						} else if (pos && pos <= -4) {
							bottomHeight = Math.max(topHeight, (pos + 3.5) * -STAFF_LINE_SPACING);
						}
					}
				});
			});
		});
		const layout: PartLayout = {
			top: topHeight,
			bottom: bottomHeight,
			total: STAFF_HEIGHT + topHeight + bottomHeight,
		};
		this.partLayouts.set(part.id, layout);
		console.log(`Computed layout for part ${partId}:`, layout);
		return layout;
	}

	computePartLayouts(): Array<number> {
		const partLayouts: Map<string, PartLayout> = new Map();
		this.score.parts.forEach((part) => {
			let topHeight = 20;
			let bottomHeight = 20;
			part.measures.forEach((measure) => {
				measure.voices.forEach((voice) => {
					voice.beats.forEach((beat) => {
						if (beat.note) {
							const pos = beat.getNotePosisition(measure.clef);

							if (pos && pos >= 4) {
								topHeight = Math.max(bottomHeight, (pos - 3.5) * STAFF_LINE_SPACING);
							} else if (pos && pos <= -4) {
								bottomHeight = Math.max(topHeight, (pos + 3.5) * -STAFF_LINE_SPACING);
							}
						}
					});
				});
			});
			partLayouts.set(part.id, {
				top: topHeight,
				bottom: bottomHeight,
				total: STAFF_HEIGHT + topHeight + bottomHeight,
			});
		});

		this.partLayouts = partLayouts;
		console.log('Computed part layouts:', partLayouts);
		return Array.from(partLayouts.values()).map((layout) => layout.total);
	}

	getMeasureLayout(measureIndex: number): Array<number> {
		return this.measureLayouts[measureIndex];
	}

	getMeasureWidth(measureIndex: number): number {
		const layout = this.getMeasureLayout(measureIndex);
		if (!layout) {
			return 0;
		}
		return layout.reduce((sum, val) => sum + (val === 1 ? 20 : 2), 0); // Example widths
	}
}
