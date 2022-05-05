import {EditorView} from '@codemirror/view';
import {createTheme} from '../../core';

export const lightTheme = createTheme({
  id: 'oneLight',
  editorTheme: [EditorView.theme({}, {dark: false})],
  properties: {
    darkMode: false,
    label: 'Light',
    previewBackground: '#0d6985',
    terminal: {
      main: '#ffffff',
      text: '#000000',
    },
  },
});
