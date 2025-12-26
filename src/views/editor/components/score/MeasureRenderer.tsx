import { useMemo } from 'react';
import { useEditor } from '../../../../hooks/useEditor';
import StaffLines from './StaffLines';
import type Measure from '../../../../model/measure';
import Barlines from './Barlines';
import { BeatsRenderer } from './BeatsRenderer';

function MeasureRenderer({ measure, index, yOffset }: { measure: Measure; index: number; yOffset: number }) {
	const { editor } = useEditor();
	const measureLayout = editor.measureLayouts[index];
	// Width is derived from cached layout; use cached width and depend on index/editor
	const width = useMemo(() => editor.getMeasureWidth(index), [editor, index, measureLayout]);

	return (
		<svg className="Score__PartView__measure" width={width} height={'100%'}>
			<StaffLines yOffset={yOffset} width={width} />
			<Barlines yOffset={yOffset} measureWidth={width} isLastMeasure={!measure.next} />
			<BeatsRenderer measure={measure} yOffset={yOffset} />
		</svg>
	);
}

export default MeasureRenderer;
