import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App.tsx';
import { ScoreProvider } from './context/ScoreContext.tsx';
import { EditorProvider } from './context/editorContext.tsx';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ScoreProvider>
			<EditorProvider>
				<App />
			</EditorProvider>
		</ScoreProvider>
	</StrictMode>
);
