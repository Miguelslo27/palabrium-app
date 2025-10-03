declare module 'sanitize-html' {
  interface SanitizeHtmlOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    [key: string]: unknown;
  }

  interface SanitizeHtmlFn {
    (input: string, options?: SanitizeHtmlOptions): string;
    defaults: {
      allowedTags: string[];
      allowedAttributes: Record<string, string[]>;
      [key: string]: unknown;
    };
  }

  const sanitizeHtml: SanitizeHtmlFn;
  export default sanitizeHtml;
}
