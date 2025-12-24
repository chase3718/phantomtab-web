import { describe, it, expect } from 'vitest';
import { Score } from '../model/score';
import Part from '../model/part';
import { CommandHistory } from '../commands/CommandHistory';
import {
	AddMeasureCommand,
	InsertMeasureCommand,
	RemoveMeasureCommand,
	AddPartCommand,
	RemovePartCommand,
} from '../commands';

const makeScore = (parts = 1, measures = 1) => {
	const partsArr: Part[] = [];
	for (let i = 0; i < parts; i++) {
		const part = new Part();
		for (let m = 1; m < measures; m++) {
			part.addMeasure();
		}
		partsArr.push(part);
	}
	return new Score('Test', partsArr);
};

describe('Measure commands', () => {
	it('AddMeasureCommand executes and undoes', () => {
		const score = makeScore(1, 1);
		const cmd = new AddMeasureCommand(score);
		cmd.execute();
		expect(score.getMeasureCount()).toBe(2);
		cmd.undo();
		expect(score.getMeasureCount()).toBe(1);
	});

	it('InsertMeasureCommand inserts at index and undoes', () => {
		const score = makeScore(1, 2);
		const secondId = score.getParts()[0].measures[1].id;
		const cmd = new InsertMeasureCommand(score, 1);
		cmd.execute();
		expect(score.getMeasureCount()).toBe(3);
		expect(score.getParts()[0].measures[2].id).toBe(secondId);
		cmd.undo();
		expect(score.getMeasureCount()).toBe(2);
	});

	it('RemoveMeasureCommand removes and restores same measure instances on undo', () => {
		const score = makeScore(2, 2);
		const original = score.getParts().map((p) => p.measures[1]);
		const cmd = new RemoveMeasureCommand(score, 1);
		cmd.execute();
		expect(score.getMeasureCount()).toBe(1);
		cmd.undo();
		expect(score.getMeasureCount()).toBe(2);
		score.getParts().forEach((p, idx) => {
			expect(p.measures[1]).toBe(original[idx]);
		});
	});
});

describe('Part commands', () => {
	it('AddPartCommand adds a part and undo removes it', () => {
		const score = makeScore(1, 2);
		const newPart = new Part();
		const cmd = new AddPartCommand(score, newPart);
		cmd.execute();
		expect(score.getParts()).toHaveLength(2);
		cmd.undo();
		expect(score.getParts()).toHaveLength(1);
	});

	it('RemovePartCommand removes by id and undo restores the same part', () => {
		const score = makeScore(2, 2);
		const targetId = score.getParts()[0].id;
		const cmd = new RemovePartCommand(score, targetId);
		cmd.execute();
		expect(score.getParts()).toHaveLength(1);
		cmd.undo();
		expect(score.getParts()).toHaveLength(2);
		expect(score.getParts()[0].id === targetId || score.getParts()[1].id === targetId).toBe(true);
	});
});

describe('CommandHistory', () => {
	it('tracks undo/redo through execution flow', () => {
		const history = new CommandHistory();
		const score = makeScore(1, 1);
		const add = new AddMeasureCommand(score);
		const insert = new InsertMeasureCommand(score, 1);

		history.execute(add);
		expect(score.getMeasureCount()).toBe(2);
		expect(history.canUndo()).toBe(true);
		expect(history.canRedo()).toBe(false);

		history.execute(insert);
		expect(score.getMeasureCount()).toBe(3);
		expect(history.getUndoDescription()).toContain('Insert measure');

		history.undo();
		expect(score.getMeasureCount()).toBe(2);
		expect(history.canRedo()).toBe(true);

		history.redo();
		expect(score.getMeasureCount()).toBe(3);
		expect(history.getHistory().length).toBe(2);
	});
});
