export interface ParsedPDF {
  text: string;
  dataUrl: string;
  pageCount: number;
}

/**
 * 解析 PDF 文件，提取文本内容
 * 只能在客户端调用
 */
export async function parsePDF(file: File): Promise<ParsedPDF> {
  // 动态导入 pdfjs-dist，确保只在客户端运行
  const pdfjsLib = await import('pdfjs-dist');
  
  // 配置 PDF.js worker - 使用 unpkg CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  
  const arrayBuffer = await file.arrayBuffer();
  const dataUrl = await fileToDataUrl(file);
  
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  
  let fullText = '';
  
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return {
    text: fullText.trim(),
    dataUrl,
    pageCount,
  };
}

/**
 * 将文件转换为 Data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
