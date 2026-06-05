declare module 'svg-to-pdfkit' {
  import type PDFDocument from 'pdfkit'

  interface SvgToPdfOptions {
    assumePt?: boolean
    preserveAspectRatio?: string
    width?: number
    height?: number
    fontCallback?: (family: string, bold: boolean, italic: boolean, fontOptions?: unknown) => string | PDFKit.Mixins.PDFFontSource
    imageCallback?: (href: string) => string | Buffer | undefined
  }

  export default function SVGtoPDF(doc: typeof PDFDocument | PDFKit.PDFDocument, svg: string, x: number, y: number, options?: SvgToPdfOptions): void
}
