import { describe, it, expect } from 'vitest';
import Part from '../model/part';
import Measure from '../model/measure';
import { Score } from '../model/score';

const makeScore = (parts = 2, measures = 2) => {
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

describe('Part', () => {
	it('inserts a measure and preserves links', () => {
		const part = new Part();
		const first = part.measures[0];
		const inserted = new Measure();

		part.insertMeasureAt(0, inserted);

		expect(part.measures[0]).toBe(inserted);
		expect(part.measures[1]).toBe(first);
		expect(inserted.getNext()).toBe(first);
		expect(first.getPrevious()).toBe(inserted);
	});

	it('removes a measure and relinks neighbors', () => {
		const part = new Part();
		const m2 = new Measure();
		part.addMeasure(m2);
		const m3 = new Measure();
		part.addMeasure(m3);

		const removed = part.removeMeasureAt(1);

		expect(removed).toBe(m2);
		expect(part.measures.length).toBe(2);
		expect(part.measures[0].getNext()).toBe(m3);
		expect(m3.getPrevious()).toBe(part.measures[0]);
	});
});

describe('Score', () => {
	it('adds measures across all parts', () => {
		const score = makeScore(2, 1);
		score.addMeasure();
		expect(score.getMeasureCount()).toBe(2);
		score.getParts().forEach((p) => expect(p.measures.length).toBe(2));
	});

	it('inserts measure at index for every part', () => {
		const score = makeScore(2, 2);
		const beforeIds = score.getParts().map((p) => p.measures[1].id);

		score.insertMeasureAt(1);

		expect(score.getMeasureCount()).toBe(3);
		score.getParts().forEach((p, idx) => {
			expect(p.measures[2].id).toBe(beforeIds[idx]);
			expect(p.measures[1].getNext()).toBe(p.measures[2]);
			expect(p.measures[2].getPrevious()).toBe(p.measures[1]);
		});
	});

	it('removes a measure at index and returns removed instances', () => {
		const score = makeScore(2, 3);
		const removed = score.removeMeasureAt(1);
		expect(removed).toHaveLength(2);
		expect(score.getMeasureCount()).toBe(2);
		score.getParts().forEach((p) => {
			expect(p.measures[0].getNext()).toBe(p.measures[1]);
			expect(p.measures[1].getPrevious()).toBe(p.measures[0]);
		});
	});

	it('adds a part and normalizes measure count', () => {
		const score = makeScore(1, 3);
		const newPart = new Part(); // starts with 1 measure
		score.addPart(newPart);
		expect(score.getParts()).toHaveLength(2);
		expect(newPart.measures.length).toBe(3);
	});
});
