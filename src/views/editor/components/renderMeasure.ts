import type Two from 'two.js';
import type Measure from '../../../model/measure';

export type BeatHitRegion = {
	measureIdx: number;
	beatIdx: number;
	x: number;
	y: number;
	w: number;
	h: number;
};

export type RenderMeasureOptions = {
	two: Two;
	measure: Measure;
	measureIdx: number;
	measureWidth: number;
	staffHeight: number;
	offsetX: number;
	margin?: number;
	staffLines?: number;
	selectedBeatId?: string;
};

/**
 * Renders a single measure with staff lines, bars, and beats.
 * Returns an array of hit regions for beat interaction.
 */
export function renderMeasure(options: RenderMeasureOptions): BeatHitRegion[] {
	const {
		two,
		measure,
		measureIdx,
		measureWidth,
		staffHeight,
		offsetX,
		margin = 8,
		staffLines = 5,
		selectedBeatId,
	} = options;

	const hitRegions: BeatHitRegion[] = [];
	const staffTop = margin;
	const staffBottom = staffHeight - margin;
	const lineSpacing = (staffBottom - staffTop) / (staffLines - 1);

	const group = two.makeGroup();

	// Staff lines for this measure
	for (let i = 0; i < staffLines; i++) {
		const y = staffTop + i * lineSpacing;
		const line = two.makeLine(0, y, measureWidth, y);
		line.stroke = '#222';
		line.linewidth = 1;
		group.add(line);
	}

	// End bar (or double bar at start if first measure)
	if (measureIdx === 0 && !measure.getPrevious()) {
		// Double bar at start
		const bar1 = two.makeLine(0, staffTop, 0, staffBottom);
		bar1.stroke = '#222';
		bar1.linewidth = 2;
		group.add(bar1);
		const bar2 = two.makeLine(3, staffTop, 3, staffBottom);
		bar2.stroke = '#222';
		bar2.linewidth = 2;
		group.add(bar2);
	}

	if (measure.getNext() !== null) {
		// Single bar at end of measure
		const endBar = two.makeLine(measureWidth, staffTop, measureWidth, staffBottom);
		endBar.stroke = '#222';
		endBar.linewidth = 1;
		group.add(endBar);
	} else {
		// Double bar at end of last measure
		const bar1 = two.makeLine(measureWidth - 3, staffTop, measureWidth - 3, staffBottom);
		bar1.stroke = '#222';
		bar1.linewidth = 2;
		group.add(bar1);
		const bar2 = two.makeLine(measureWidth, staffTop, measureWidth, staffBottom);
		bar2.stroke = '#222';
		bar2.linewidth = 2;
		group.add(bar2);
	}

	// Lay out beats
	const beats = measure.beats;
	const total = beats.reduce((s, b) => s + b.duration, 0);
	const contentX = margin + 6;
	const contentW = measureWidth - margin * 2 - 8;

	let cursor = contentX;
	if (total > 0) {
		beats.forEach((beat, beatIdx) => {
			const w = (beat.duration / total) * contentW;
			const rect = two.makeRectangle(cursor + w / 2, (staffTop + staffBottom) / 2, w - 4, staffBottom - staffTop - 6);
			const isSelected = selectedBeatId && beat.id === selectedBeatId;
			if (isSelected) {
				rect.fill = 'rgba(56, 128, 255, 0.20)'; // highlight
				rect.stroke = '#3880ff';
				rect.linewidth = 2;
			} else {
				rect.noFill();
				rect.stroke = '#888';
				rect.linewidth = 1;
			}
			group.add(rect);

			// Store hit region in global space
			hitRegions.push({
				measureIdx,
				beatIdx,
				x: offsetX + cursor,
				y: staffTop,
				w,
				h: staffBottom - staffTop,
			});

			cursor += w;
		});
	}

	// Position the group
	group.translation.set(offsetX, 0);

	return hitRegions;
}
