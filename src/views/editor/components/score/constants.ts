// Staff rendering constants
export const STAFF_LINE_SPACING = 10; // pixels between staff lines
export const STAFF_HEIGHT = STAFF_LINE_SPACING * 4; // 5 lines, 4 spaces
export const BEAT_PADDING = 10; // padding between beats in pixels
export const MIN_BEAT_VISUAL_WIDTH = 18; // minimum visual width per beat in pixels
export const BEAT_COUNT_OVERHEAD = 6; // extra pixels added per beat to encourage wider dense measures

// Horizontal layout tuning
export const CLEF_WIDTH = 35;
export const CLEF_LEFT_MARGIN = 12; // extra space before clef on first measure
export const TIME_SIG_WIDTH = 30;
export const KEY_TO_TIME_MARGIN = 20; // space between key signature and time signature
export const KEY_SIGNATURE_WIDTH_MOD = 20; // additional width per accidental in key signature
export const MEASURE_START_OFFSET = 4; // offset from measure start to content
export const BEAT_CONTENT_OFFSET = 10; // additional offset for beat content rendering
export const CONTENT_END_PADDING = 3; // padding after beat content

// Optical spacing helpers
export const OPTICAL_ACCIDENTAL_PADDING = 10;
export const OPTICAL_LEDGER_PADDING = 6;
export const OPTICAL_EXTRA_NOTE_FACTOR = 0.1; // multiplier per extra note in chord

// SMuFL glyph sizing (Bravura specific)
export const CLEF_FONT_SIZE = 80; // Larger size for clefs
export const TIME_SIG_FONT_SIZE = 50; // Size for time signature numbers
export const KEY_SIG_FONT_SIZE = 40; // Size for key signature accidentals
