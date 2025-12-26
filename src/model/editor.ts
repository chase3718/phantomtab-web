import type { Score } from '../model/score';
import type { PartLayout } from '../types';
import type Beat from './beat';
import { STAFF_HEIGHT, STAFF_LINE_SPACING } from '../views/editor/components/score/constants';

export default class Editor {
	public score: Score;
	public selectedId: string | null = null;
	public measureLayouts: Array<Array<Beat | null>> = [];
	public measureWidths: number[] = [];
	public partLayouts: Map<string, PartLayout> = new Map();
	private unsubscribeMeasuresChanged?: () => void;
	private unsubscribePartsChanged?: () => void;

	constructor(score: Score) {
		this.score = score;
		// Keep layouts in sync with score mutations
		this.unsubscribeMeasuresChanged = this.score.on('measuresChanged', this.handleMeasuresChanged);
		this.unsubscribePartsChanged = this.score.on('partsChanged', this.handlePartsChanged);
		// Seed initial layouts in a single pass
		this.computeLayouts();
	}

	public dispose(): void {
		this.unsubscribeMeasuresChanged?.();
		this.unsubscribePartsChanged?.();
	}

	private handleMeasuresChanged = (event: { action: 'add' | 'insert' | 'remove'; index: number; count: number }) => {
		// Recompute only affected measure layouts
		this.computeMeasuresRange(event.index, event.count);
		// Always recompute all part layouts when measures change, as note positions may affect vertical space
		this.computePartLayouts();
	};

	private handlePartsChanged = () => {
		// Parts structure changed; recompute all layouts to stay in sync
		this.computeLayouts();
	};

	computeMeasureLayouts(): Array<Array<Beat | null>> {
		const measureCount = this.score.parts[0]?.measures.length ?? 0;
		const layouts: Array<Array<Beat | null>> = Array.from({ length: measureCount }, (_, idx) =>
			this.computeMeasureLayout(idx)
		);
		this.measureLayouts = layouts;
		return layouts;
	}

	computeMeasureLayout(measureIndex: number): Array<Beat | null> {
		if (measureIndex < 0) return [];
		const firstPart = this.score.parts[0];
		if (!firstPart || measureIndex >= firstPart.measures.length) {
			return [];
		}
		const num32ndNotes =
			(32 / firstPart.measures[measureIndex].timeSignature.denominator) *
			firstPart.measures[measureIndex].timeSignature.numerator;
		const layout: Array<Beat | null> = Array(num32ndNotes).fill(null);

		this.score.parts.forEach((part) => {
			const measure = part.measures[measureIndex];
			measure.voices.forEach((voice) => {
				voice.beats.forEach((beat) => {
					const beatLocation = beat.placeInMeasure * 32;
					if (layout[beatLocation] === null) {
						layout[beatLocation] = beat;
					}
				});
			});
		});
		this.measureLayouts[measureIndex] = layout;
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

						if (pos && pos >= 5) {
							topHeight = Math.max(topHeight, (pos - 4) * (STAFF_LINE_SPACING / 2) + 10);
						} else if (pos && pos <= -5) {
							bottomHeight = Math.max(bottomHeight, (-pos - 4) * (STAFF_LINE_SPACING / 2) + 10);
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
		return layout;
	}

	computePartLayouts(partsToRecompute?: Set<string>): Array<number> {
		const partLayouts: Map<string, PartLayout> = new Map();
		this.score.parts.forEach((part) => {
			if (partsToRecompute && !partsToRecompute.has(part.id)) {
				// Preserve existing layout for parts not in the recompute set
				const existing = this.partLayouts.get(part.id);
				if (existing) {
					partLayouts.set(part.id, existing);
					return;
				}
				// If no existing layout, fall through to compute it
			}
			let topHeight = 20;
			let bottomHeight = 20;
			part.measures.forEach((measure) => {
				measure.voices.forEach((voice) => {
					voice.beats.forEach((beat) => {
						if (beat.note) {
							const pos = beat.getNotePosisition(measure.clef);

							if (pos && pos >= 5) {
								topHeight = Math.max(topHeight, (pos - 4) * (STAFF_LINE_SPACING / 2) + 10);
							} else if (pos && pos <= -5) {
								bottomHeight = Math.max(bottomHeight, (-pos - 4) * (STAFF_LINE_SPACING / 2) + 10);
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
		return Array.from(partLayouts.values()).map((layout) => layout.total);
	}

	/**
	 * Compute both measure layouts and part layouts in a single pass over the score
	 * to keep caches consistent and avoid duplicate iteration.
	 */
	computeLayouts(): void {
		const firstPart = this.score.parts[0];
		const measureCount = firstPart?.measures.length ?? 0;
		// Initialize measure layouts with correct lengths per measure using first part's time signatures
		const measureLayouts: Array<Array<Beat | null>> = Array.from({ length: measureCount }, (_, mIdx) => {
			if (!firstPart) return [];
			const ts = firstPart.measures[mIdx].timeSignature;
			const num32ndNotes = (32 / ts.denominator) * ts.numerator;
			return Array(num32ndNotes).fill(null);
		});

		const measureWidths: number[] = Array(measureCount).fill(0);

		const partLayouts: Map<string, PartLayout> = new Map();

		// Iterate parts/measures once, updating both structures
		for (let pIdx = 0; pIdx < this.score.parts.length; pIdx++) {
			const part = this.score.parts[pIdx];
			let topHeight = 20;
			let bottomHeight = 20;

			for (let mIdx = 0; mIdx < part.measures.length; mIdx++) {
				const measure = part.measures[mIdx];
				for (let vIdx = 0; vIdx < measure.voices.length; vIdx++) {
					const voice = measure.voices[vIdx];
					for (let bIdx = 0; bIdx < voice.beats.length; bIdx++) {
						const beat = voice.beats[bIdx];
						// Mark beat positions in measure layout
						const beatLocation = Math.round(beat.placeInMeasure * 32);
						if (
							measureLayouts[mIdx] &&
							beatLocation >= 0 &&
							beatLocation < measureLayouts[mIdx].length &&
							measureLayouts[mIdx][beatLocation] === null
						) {
							measureLayouts[mIdx][beatLocation] = beat;
						}

						// Update part vertical extents
						if (beat.note) {
							const pos = beat.getNotePosisition(measure.clef);
							if (pos && pos >= 5) {
								topHeight = Math.max(topHeight, (pos - 4) * (STAFF_LINE_SPACING / 2) + 10);
							} else if (pos && pos <= -5) {
								bottomHeight = Math.max(bottomHeight, (-pos - 4) * (STAFF_LINE_SPACING / 2) + 10);
							}
						}
					}
				}
			}

			partLayouts.set(part.id, {
				top: topHeight,
				bottom: bottomHeight,
				total: STAFF_HEIGHT + topHeight + bottomHeight,
			});
		}

		// Compute widths once based on populated measureLayouts
		for (let mIdx = 0; mIdx < measureLayouts.length; mIdx++) {
			const layout = measureLayouts[mIdx];
			let sum = 0;
			for (let i = 0; i < layout.length; i++) {
				sum += layout[i] !== null ? 20 : 2;
			}
			measureWidths[mIdx] = sum;
		}

		this.measureLayouts = measureLayouts;
		this.measureWidths = measureWidths;
		this.partLayouts = partLayouts;
	}

	/**
	 * Recompute measure layouts for a specific range of indices and update cached widths.
	 */
	computeMeasuresRange(startIndex: number, count: number): void {
		const firstPart = this.score.parts[0];
		if (!firstPart) return;
		const endIndex = Math.min(firstPart.measures.length, startIndex + count);
		for (let mIdx = startIndex; mIdx < endIndex; mIdx++) {
			const ts = firstPart.measures[mIdx].timeSignature;
			const num32ndNotes = (32 / ts.denominator) * ts.numerator;
			const layout: Array<Beat | null> = Array(num32ndNotes).fill(null);
			// Aggregate beats across all parts for this measure index
			for (let pIdx = 0; pIdx < this.score.parts.length; pIdx++) {
				const part = this.score.parts[pIdx];
				const measure = part.measures[mIdx];
				if (!measure) continue;
				for (let vIdx = 0; vIdx < measure.voices.length; vIdx++) {
					const voice = measure.voices[vIdx];
					for (let bIdx = 0; bIdx < voice.beats.length; bIdx++) {
						const beat = voice.beats[bIdx];
						const beatLocation = Math.round(beat.placeInMeasure * 32);
						if (beatLocation >= 0 && beatLocation < num32ndNotes && layout[beatLocation] === null) {
							layout[beatLocation] = beat;
						}
					}
				}
			}
			this.measureLayouts[mIdx] = layout;
			// Update width cache
			let sum = 0;
			for (let i = 0; i < layout.length; i++) {
				sum += layout[i] !== null ? 20 : 2;
			}
			this.measureWidths[mIdx] = sum;
		}
	}

	getMeasureLayout(measureIndex: number): Array<Beat | null> {
		return this.measureLayouts[measureIndex];
	}

	getMeasureWidth(measureIndex: number): number {
		const cached = this.measureWidths[measureIndex];
		if (typeof cached === 'number') return cached;
		const layout = this.getMeasureLayout(measureIndex);
		if (!layout) return 0;
		let sum = 0;
		for (let i = 0; i < layout.length; i++) sum += layout[i] !== null ? 20 : 2;
		this.measureWidths[measureIndex] = sum;
		return sum;
	}
}
