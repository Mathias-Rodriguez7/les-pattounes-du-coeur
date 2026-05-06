import * as pdfjsLib from 'pdfjs-dist';

// 👇 IMPORTANT (Vite friendly)
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default pdfjsLib;
