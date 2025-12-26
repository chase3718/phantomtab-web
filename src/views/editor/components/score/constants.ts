// Staff rendering constants
export const STAFF_LINE_SPACING = 10; // pixels between staff lines
export const STAFF_HEIGHT = STAFF_LINE_SPACING * 5; // 5 lines, 4 spaces
export const BEAT_PADDING = 0; // padding between beats in pixels
export const BASE_BEAT_UNIT_WIDTH = 40; // base width for a quarter note (0.25 duration)
export const MIN_BEAT_VISUAL_WIDTH = 18; // minimum visual width per beat in pixels
export const BEAT_COUNT_OVERHEAD = 0; // extra pixels added per beat to encourage wider dense measures

export const CLEF_WIDTH = 35;
export const CLEF_LEFT_MARGIN = 12; // extra space before clef on first measure
export const TIME_SIG_WIDTH = 30;
export const TIME_SIG_HEIGHT = STAFF_LINE_SPACING * 2; // height for time signature rendering
export const KEY_TO_TIME_MARGIN = 20; // space between key signature and time signature
export const KEY_SIGNATURE_WIDTH_MOD = 20; // additional width per accidental in key signature
export const MEASURE_START_OFFSET = 0; // offset from measure start to content
export const BEAT_CONTENT_OFFSET = 0; // additional offset for beat content rendering
export const CONTENT_END_PADDING = 0; // padding after beat content

// Optical spacing helpers
export const OPTICAL_ACCIDENTAL_PADDING = 10;
export const OPTICAL_LEDGER_PADDING = 6;
export const OPTICAL_EXTRA_NOTE_FACTOR = 0.1; // multiplier per extra note in chord

// SMuFL glyph sizing (Bravura specific)
export const CLEF_FONT_SIZE = 40; // Larger size for clefs
export const TIME_SIG_FONT_SIZE = 38; // Size for time signature numbers
export const KEY_SIG_FONT_SIZE = 40; // Size for key signature accidentals
