import {
	STAFF_HEIGHT,
	STAFF_LINE_SPACING,
	OPTICAL_ACCIDENTAL_PADDING,
	OPTICAL_LEDGER_PADDING,
	OPTICAL_EXTRA_NOTE_FACTOR,
	CLEF_WIDTH,
	TIME_SIG_WIDTH,
	KEY_SIGNATURE_WIDTH_MOD,
	BEAT_PADDING,
	MIN_BEAT_VISUAL_WIDTH,
	BEAT_COUNT_OVERHEAD,
	CLEF_LEFT_MARGIN,
	KEY_TO_TIME_MARGIN,
	MEASURE_START_OFFSET,
	BEAT_CONTENT_OFFSET,
	CONTENT_END_PADDING,
} from './constants';
import type Measure from '../../../../model/measure';
import type Beat from '../../../../model/beat';
import type { Note } from '../../../../types';

/**
 * Converts a pitch (step and octave) to a staff position
 * Default staff is treble clef:
 * - B4 is on the middle line (position 0)
 * - C5 is one space above (position 1)
 * - C4 is one ledger line below (position -6)
 *
 * Staff lines (from top to bottom): F5(4), D5(2), B4(0), G4(-2), E4(-4)
 */
export const pitchToStaffPosition = (step: string, octave: number): number => {
	// Position of each note within its octave, with B4 at position 0
	const stepPositions: { [key: string]: number } = {
		C: 0, // C is 1 semitone above B
		D: 1, // D is 2 semitones above B
		E: 2, // E is 3 semitones above B
		F: 3, // F is 4 semitones above B
		G: 4, // G is 5 semitones below B
		A: 5, // A is 6 semitones below B
		B: 6, // B is the reference
	};
	// Each octave difference changes position by 7 (one full staff cycle)
	// Octave 4 has B4 at position 0
	const octaveOffset = (octave - 4) * 7;
	const normalizedStep = step.toUpperCase();
	const stepPosition = stepPositions[normalizedStep];

	if (stepPosition === undefined) {
		console.warn(`Unknown pitch step '${step}' encountered; rendering skipped for safety.`);
		return Number.NaN;
	}

	const basePosition = stepPosition - 6;
	return basePosition + octaveOffset;
};

/**
 * Converts a staff position to a Y coordinate
 */
export const staffPositionToY = (staffPosition: number): number => {
	return STAFF_HEIGHT / 2 - staffPosition * (STAFF_LINE_SPACING / 2);
};

/**
 * Calculate the required height for a measure based on its notes
 * Returns { height, yOffset } where yOffset is the top padding needed
 */
export const calculateMeasureHeight = (measure: Measure): { height: number; yOffset: number } => {
	// Initialize with staff bounds (staff spans from -4 to 4 in staff position terms)
	let minStaffPosition = -4; // lowest staff line position
	let maxStaffPosition = 4; // highest staff line position

	// Iterate through all voices and their beats
	measure.voices.forEach((voice) => {
		voice.beats.forEach((beat) => {
			beat.notes.forEach((note) => {
				const position = pitchToStaffPosition(note.pitch.step, note.pitch.octave);
				minStaffPosition = Math.min(minStaffPosition, position);
				maxStaffPosition = Math.max(maxStaffPosition, position);
			});
		});
	});

	// Calculate padding needed above and below the staff
	// Negative positions go above the staff, positive go below
	const topPadding = Math.max(0, -4 - minStaffPosition) * (STAFF_LINE_SPACING / 2);
	const bottomPadding = Math.max(0, maxStaffPosition - 4) * (STAFF_LINE_SPACING / 2);

	const totalHeight = STAFF_HEIGHT + topPadding + bottomPadding;
	const yOffset = topPadding;

	return { height: totalHeight, yOffset };
};

const hasAccidental = (note: Note): boolean => !!note.pitch.alter;
const hasLedger = (note: Note): boolean => Math.abs(pitchToStaffPosition(note.pitch.step, note.pitch.octave)) > 4;

/**
 * Compute a beat's visual width with optical padding for accidentals, ledger lines, and chord density.
 */
export const getBeatVisualWidth = (beat: Beat, unitWidth: number = 100): number => {
	const baseWidth = Math.max(beat.duration * unitWidth, MIN_BEAT_VISUAL_WIDTH);
	const anyAccidental = beat.notes.some(hasAccidental);
	const anyLedger = beat.notes.some(hasLedger);
	const chordExtra = Math.max(0, beat.notes.length - 1) * OPTICAL_EXTRA_NOTE_FACTOR * baseWidth;
	const opticalPadding = (anyAccidental ? OPTICAL_ACCIDENTAL_PADDING : 0) + (anyLedger ? OPTICAL_LEDGER_PADDING : 0);

	return baseWidth + chordExtra + opticalPadding;
};

/**
 * Returns layout header widths and x position for measure content.
 * Automatically includes key/time widths on the first measure or when they change.
 */
export function getMeasureLayout(measure: Measure) {
	const isFirstMeasure = measure.previous === null;
	const prev = measure.previous ?? undefined;

	const clefWidth = isFirstMeasure ? CLEF_WIDTH : 0;
	const clefLeftMargin = isFirstMeasure ? CLEF_LEFT_MARGIN : 0;

	const keyChanged = isFirstMeasure || (prev && prev.key !== measure.key);
	const keySigWidth = keyChanged ? Math.min(Math.abs(measure.key), 7) * KEY_SIGNATURE_WIDTH_MOD : 0;

	const timeChanged =
		isFirstMeasure ||
		(prev &&
			(prev.timeSignature.numerator !== measure.timeSignature.numerator ||
				prev.timeSignature.denominator !== measure.timeSignature.denominator));
	const timeSigWidth = timeChanged ? TIME_SIG_WIDTH : 0;

	// Calculate x position where beat content starts
	const headerMargin = timeSigWidth > 0 && keySigWidth > 0 ? KEY_TO_TIME_MARGIN : 0;
	const contentStartX =
		MEASURE_START_OFFSET + clefLeftMargin + clefWidth + keySigWidth + timeSigWidth + headerMargin + BEAT_CONTENT_OFFSET;

	return { clefLeftMargin, clefWidth, keySigWidth, timeSigWidth, contentStartX };
}

/**
 * Computes a single measure's base width including headers and content.
 * This is used by ScoreView to derive max widths across parts by measure index.
 */
export function computeMeasureBaseWidth(measure: Measure): number {
	const { contentStartX } = getMeasureLayout(measure);

	// Calculate beat content width
	const allBeats = measure.getAllBeats();
	const beatWidthSum = allBeats.reduce((acc, beat) => {
		const w = getBeatVisualWidth(beat);
		return acc + (Number.isFinite(w) ? w : 0);
	}, 0);

	const paddingWidth = (allBeats.length - 1) * BEAT_PADDING;
	const densityOverhead = allBeats.length * BEAT_COUNT_OVERHEAD;
	const contentWidth = beatWidthSum + paddingWidth + densityOverhead;

	// Total measure width (contentStartX already includes BEAT_CONTENT_OFFSET)
	const totalWidth = contentStartX + contentWidth + CONTENT_END_PADDING;
	return totalWidth;
}
