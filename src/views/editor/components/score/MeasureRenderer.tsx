import { useMemo } from 'react';
import { useEditor } from '../../../../hooks/useEditor';
import StaffLines from './StaffLines';
import type Measure from '../../../../model/measure';
import Barlines from './Barlines';

export default function MeasureRenderer({
	measure,
	index,
	yOffset,
}: {
	measure: Measure;
	index: number;
	yOffset: number;
}) {
	const { editor } = useEditor();
	// Width is derived from cached layout; memoize to avoid repeated reduces on re-render
	const width = useMemo(() => editor.getMeasureWidth(index), [editor, index, measure.voices, measure.timeSignature]);

	return (
		<svg className="Score__PartView__measure" width={width} height={'100%'}>
			<StaffLines yOffset={yOffset} width={width} />
			<Barlines yOffset={yOffset} measureWidth={width} isLastMeasure={!measure.next} />
		</svg>
	);
}
