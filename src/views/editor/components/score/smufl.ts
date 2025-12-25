/**
 * SMuFL (Standard Music Font Layout) codepoints for Bravura font
 * Reference: https://w3c.github.io/smufl/latest/tables/
 */

export const SMuFL = {
	// Staff lines
	staffLine: '\uE014',

	// Note heads
	noteheadWhole: '\uE0A2',
	noteheadHalf: '\uE0A3',
	noteheadBlack: '\uE0A4',
	noteheadDoubleWhole: '\uE0A0',

	// Stems
	stem: '\uE210',
	stemSprechgesang: '\uE211',

	// Flags
	flag8thUp: '\uE240',
	flag8thDown: '\uE241',
	flag16thUp: '\uE242',
	flag16thDown: '\uE243',
	flag32ndUp: '\uE244',
	flag32ndDown: '\uE245',
	flag64thUp: '\uE246',
	flag64thDown: '\uE247',

	// Accidentals
	accidentalFlat: '\uE260',
	accidentalNatural: '\uE261',
	accidentalSharp: '\uE262',
	accidentalDoubleSharp: '\uE263',
	accidentalDoubleFlat: '\uE264',

	// Clefs
	gClef: '\uE050',
	fClef: '\uE062',
	cClef: '\uE05C',

	// Time signatures (individual digits)
	timeSig0: '\uE080',
	timeSig1: '\uE081',
	timeSig2: '\uE082',
	timeSig3: '\uE083',
	timeSig4: '\uE084',
	timeSig5: '\uE085',
	timeSig6: '\uE086',
	timeSig7: '\uE087',
	timeSig8: '\uE088',
	timeSig9: '\uE089',

	// Barlines
	barlineSingle: '\uE030',
	barlineDouble: '\uE031',
	barlineFinal: '\uE032',

	// Ledger
	legerLine: '\uE022',

	// Rests
	restWhole: '\uE4E3',
	restHalf: '\uE4E4',
	restQuarter: '\uE4E5',
	rest8th: '\uE4E6',
	rest16th: '\uE4E7',
	rest32nd: '\uE4E8',
	rest64th: '\uE4E9',

	// Articulations
	articAccentAbove: '\uE4A0',
	articStaccatoAbove: '\uE4A2',
	articTenutoAbove: '\uE4A4',
	articMarcatoAbove: '\uE4AC',

	// Dynamics
	dynamicPiano: '\uE520',
	dynamicMezzo: '\uE521',
	dynamicForte: '\uE522',
	dynamicSforzando: '\uE524',
} as const;

export type SMuFLGlyph = (typeof SMuFL)[keyof typeof SMuFL];
