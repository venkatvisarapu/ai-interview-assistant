import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;



export const extractTextFromFile = async (file) => {
  const fileType = file.type;
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async (event) => {
      try {
        let text = '';
        if (fileType === 'application/pdf') {
          const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(event.target.result) }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ') + ' ';
          }
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          text = result.value;
        }
        resolve(text);
      } catch (error) {
        console.error("File Processing Error:", error);
        reject('Could not read the file. It might be corrupted or protected.');
      }
    };
    reader.onerror = () => reject('Failed to read the file.');
    reader.readAsArrayBuffer(file);
  });
};