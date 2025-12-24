import { useEffect, useRef, useState } from 'react';
import Two from 'two.js';
import type Part from '../../../model/part';
import { renderMeasure, type BeatHitRegion } from './renderMeasure';

type Props = {
	part: Part;
	measureWidth?: number;
	staffHeight?: number;
	version?: number; // used to force re-render when measures change
	selectedBeatId?: string;
	onMeasureClick?: (measureIndex: number) => void;
	onBeatClick?: (measureIndex: number, beatId: string) => void;
};

export default function StaffView({
	part,
	measureWidth = 240,
	staffHeight = 60,
	version,
	selectedBeatId,
	onMeasureClick,
	onBeatClick,
}: Props) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const twoRef = useRef<Two | null>(null);
	const [hoveredBeat, setHoveredBeat] = useState<{ measureIdx: number; beatIdx: number } | null>(null);

	// Store hit regions for all beats across all measures
	const hitRegionsRef = useRef<BeatHitRegion[]>([]);

	useEffect(() => {
		const container = containerRef.current!;
		const totalWidth = part.measures.length * measureWidth;
		const two = new Two({
			type: Two.Types.svg,
			width: totalWidth,
			height: staffHeight,
			autostart: false,
		}).appendTo(container);
		twoRef.current = two;

		hitRegionsRef.current = [];

		// Draw each measure as a group
		part.measures.forEach((measure, measureIdx) => {
			const offsetX = measureIdx * measureWidth;
			const regions = renderMeasure({
				two,
				measure,
				measureIdx,
				measureWidth,
				staffHeight,
				offsetX,
				selectedBeatId,
			});
			hitRegionsRef.current.push(...regions);
		});

		two.update();

		return () => {
			container.innerHTML = '';
			twoRef.current = null;
		};
	}, [part.measures.length, measureWidth, staffHeight, version]);

	// Mouse interaction
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		let raf = 0;
		let lastHovered: { measureIdx: number; beatIdx: number } | null = null;

		const hitTest = (clientX: number, clientY: number) => {
			const rect = el.getBoundingClientRect();
			const x = clientX - rect.left;
			const y = clientY - rect.top;
			const hit = hitRegionsRef.current.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
			return hit ? { measureIdx: hit.measureIdx, beatIdx: hit.beatIdx } : null;
		};

		const onMove = (e: PointerEvent) => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				const hit = hitTest(e.clientX, e.clientY);
				if (hit?.measureIdx !== lastHovered?.measureIdx || hit?.beatIdx !== lastHovered?.beatIdx) {
					lastHovered = hit;
					setHoveredBeat(hit);
				}
			});
		};

		const onLeave = () => {
			if (lastHovered !== null) {
				lastHovered = null;
				setHoveredBeat(null);
			}
		};

		const onClick = (e: MouseEvent) => {
			const hit = hitTest(e.clientX, e.clientY);
			if (hit) {
				const beatId = part.measures[hit.measureIdx].beats[hit.beatIdx].id;
				onBeatClick?.(hit.measureIdx, beatId);
			} else {
				// Click on measure background (not on a beat)
				const rect = el.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const measureIdx = Math.floor(x / measureWidth);
				if (measureIdx >= 0 && measureIdx < part.measures.length) {
					onMeasureClick?.(measureIdx);
				}
			}
		};

		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('click', onClick);

		return () => {
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('click', onClick);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [part.measures.length, measureWidth, onMeasureClick, onBeatClick]);

	return (
		<div>
			<div ref={containerRef} style={{ width: part.measures.length * measureWidth, height: staffHeight }} />
			{hoveredBeat && (
				<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
					Hovering: Measure {hoveredBeat.measureIdx + 1}, Beat {hoveredBeat.beatIdx + 1}
				</div>
			)}
		</div>
	);
}
