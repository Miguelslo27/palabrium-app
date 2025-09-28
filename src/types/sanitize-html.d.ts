declare module 'sanitize-html' {
  interface SanitizeHtmlFn {
    (input: string, options?: any): string;
    defaults: any;
  }

  const sanitizeHtml: SanitizeHtmlFn;
  export default sanitizeHtml;
}
