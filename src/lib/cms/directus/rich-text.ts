import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'h2',
  'h3',
  'h4',
  'p',
  'ul',
  'ol',
  'li',
  'a',
  'strong',
  'em',
  'blockquote',
  'pre',
  'code',
  'br',
] as const;

export const sanitizeBlogHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: [...allowedTags],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attributes) => {
        const { target, ...safeAttributes } = attributes;
        const safeTarget = target === '_blank' || target === '_self'
          ? target
          : undefined;
        return {
          tagName,
          attribs: {
            ...safeAttributes,
            ...(safeTarget ? { target: safeTarget } : {}),
            ...(safeTarget === '_blank' ? { rel: 'noopener noreferrer' } : {}),
          },
        };
      },
    },
  });
