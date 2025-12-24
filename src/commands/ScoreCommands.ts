import type { Command } from './Command';
import type { Score } from '../model/score';
import Part from '../model/part';
import Measure from '../model/measure';
// Types intentionally relaxed to decouple from model wiring during early scaffolding

/**
 * Command to add a part to the score
 */
export class AddPartCommand implements Command {
	private score: Score;
	private part: Part;

	constructor(score: Score, part: Part = new Part()) {
		this.score = score;
		this.part = part;
	}

	execute(): void {
		this.score.addPart(this.part);
	}

	undo(): void {
		this.score.removePart(this.part.id);
	}

	getDescription(): string {
		return `Add part "${this.part.name}"`;
	}
}

/**
 * Command to remove a part from the score
 */
export class RemovePartCommand implements Command {
	private score: Score;
	private partId: string;
	private removedPart: Part | undefined;

	constructor(score: Score, partId: string) {
		this.score = score;
		this.partId = partId;
	}

	execute(): void {
		// Store the part before removal for undo
		this.removedPart = this.score.getPartById(this.partId);
		this.score.removePart(this.partId);
	}

	undo(): void {
		if (this.removedPart) {
			this.score.addPart(this.removedPart);
		}
	}

	getDescription(): string {
		return `Remove part "${this.partId}"`;
	}
}

/**
 * Command to add a measure to all parts
 */
export class AddMeasureCommand implements Command {
	private score: Score;
	private measureNumberAdded?: number;

	constructor(score: Score) {
		this.score = score;
	}

	execute(): void {
		this.measureNumberAdded = this.score.getMeasureCount() + 1;
		this.score.addMeasure();
	}

	undo(): void {
		// Remove the last measure using model API to maintain links
		const parts = this.score.getParts();
		for (const part of parts) {
			part.removeLastMeasure();
		}
	}

	getDescription(): string {
		return `Add measure ${this.measureNumberAdded}`;
	}
}

/**
 * Command to insert a measure at a specific index in all parts
 */
export class InsertMeasureCommand implements Command {
	private score: Score;
	private index: number;
	private measureFactory: () => Measure;

	constructor(score: Score, index: number, measure: Measure | null = null) {
		this.score = score;
		this.index = index;
		this.measureFactory = () => (measure ? new Measure(measure.key, measure.timeSignature) : new Measure());
	}

	execute(): void {
		this.score.insertMeasureAt(this.index, this.measureFactory);
	}

	undo(): void {
		// Remove the measure that was inserted at the given index
		this.score.removeMeasureAt(this.index);
	}

	getDescription(): string {
		return `Insert measure at position ${this.index + 1}`;
	}
}

/**
 * Command to remove a measure from all parts
 */
export class RemoveMeasureCommand implements Command {
	private score: Score;
	private index: number;
	private removedMeasures: Measure[];

	constructor(score: Score, index: number) {
		this.score = score;
		this.index = index;
		this.removedMeasures = [];
	}

	execute(): void {
		this.removedMeasures = this.score.removeMeasureAt(this.index);
	}

	undo(): void {
		if (this.removedMeasures.length === 0) return;
		this.score.insertMeasureAt(this.index, () => new Measure(), this.removedMeasures);
	}

	getDescription(): string {
		return `Remove measure at position ${this.index + 1}`;
	}
}

/**
 * Command to add a note to a measure
 */
export class AddNoteCommand implements Command {
	private score: Score;
	private partId: string;
	private measureNumber: number;
	private noteIndex: number;
	private note: unknown;
	private measure: unknown | undefined;

	constructor(score: Score, partId: string, measureNumber: number, note: unknown) {
		this.score = score;
		this.partId = partId;
		this.measureNumber = measureNumber;
		this.note = note;
		this.noteIndex = 0;
	}

	execute(): void {
		this.measure = (
			this.score as unknown as { getMeasure: (partId: string, measureNumber: number) => unknown }
		).getMeasure(this.partId, this.measureNumber);
		const m = this.measure as { elements: unknown[] } | undefined;
		if (m) {
			this.noteIndex = m.elements.length;
			m.elements.push(this.note);
		}
	}

	undo(): void {
		const m = this.measure as { elements: unknown[] } | undefined;
		if (m && this.noteIndex >= 0) {
			m.elements.splice(this.noteIndex, 1);
		}
	}

	getDescription(): string {
		return `Add note to measure ${this.measureNumber}`;
	}
}

/**
 * Command to remove a note from a measure
 */
export class RemoveNoteCommand implements Command {
	private score: Score;
	private partId: string;
	private measureNumber: number;
	private noteIndex: number;
	private removedNote: unknown | undefined;
	private measure: unknown | undefined;

	constructor(score: Score, partId: string, measureNumber: number, noteIndex: number) {
		this.score = score;
		this.partId = partId;
		this.measureNumber = measureNumber;
		this.noteIndex = noteIndex;
	}

	execute(): void {
		this.measure = (
			this.score as unknown as { getMeasure: (partId: string, measureNumber: number) => unknown }
		).getMeasure(this.partId, this.measureNumber);
		const m = this.measure as { elements: unknown[] } | undefined;
		if (m && this.noteIndex >= 0 && this.noteIndex < m.elements.length) {
			const element = m.elements[this.noteIndex];
			this.removedNote = element;
			m.elements.splice(this.noteIndex, 1);
		}
	}

	undo(): void {
		const m = this.measure as { elements: unknown[] } | undefined;
		if (m && this.removedNote !== undefined) {
			(m.elements as unknown[]).splice(this.noteIndex, 0, this.removedNote);
		}
	}

	getDescription(): string {
		return `Remove note from measure ${this.measureNumber}`;
	}
}
