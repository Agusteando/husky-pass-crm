declare module 'svg-to-pdfkit' {
  export interface SvgToPdfOptions {
    width?: number
    height?: number
    preserveAspectRatio?: string
    assumePt?: boolean
    fontCallback?: (family: string, bold: boolean, italic: boolean, options?: unknown) => string
    imageCallback?: (link: string) => string
    warningCallback?: (message: string) => void
  }

  export default function SVGtoPDF(
    doc: unknown,
    svg: string,
    x: number,
    y: number,
    options?: SvgToPdfOptions
  ): void
}
