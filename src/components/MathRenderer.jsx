import React from 'react';
import katex from 'katex';

/**
 * Parses a string containing LaTeX equations delimited by $...$ (inline)
 * or $$...$$ (display mode) and renders them using KaTeX.
 * Also cleans unparsed raw LaTeX commands in text mode like \underline{\hspace{...}}.
 */
export default function MathRenderer({ content, className = '' }) {
  if (!content) return null;

  const sanitizeText = (txt) => {
    if (typeof txt !== 'string') return '';
    return txt
      .replace(/\\underline\{\\hspace\{[^}]+\}\}/g, '__________')
      .replace(/\\underline\{[^}]+\}/g, '__________')
      .replace(/\\hspace\{[^}]+\}/g, '    ');
  };

  const renderMathContent = (text) => {
    if (typeof text !== 'string') return text;

    // Pattern for $$...$$ or $...$
    const parts = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          value: sanitizeText(text.substring(lastIndex, matchIndex)),
        });
      }

      const raw = match[0];
      const isDisplay = raw.startsWith('$$');
      const math = isDisplay ? raw.slice(2, -2) : raw.slice(1, -1);

      parts.push({
        type: 'math',
        value: math,
        displayMode: isDisplay,
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        value: sanitizeText(text.substring(lastIndex)),
      });
    }

    return parts.map((part, idx) => {
      if (part.type === 'text') {
        return (
          <span key={idx}>
            {part.value.split('\n').map((line, lIdx, arr) => (
              <React.Fragment key={lIdx}>
                {line}
                {lIdx < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      }

      try {
        const html = katex.renderToString(part.value, {
          displayMode: part.displayMode,
          throwOnError: false,
          output: 'htmlAndMathml',
        });
        return (
          <span
            key={idx}
            className={part.displayMode ? 'block my-3 overflow-x-auto py-1 text-center' : 'inline-block px-1'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        return <code key={idx} className="text-amber-400 font-mono text-xs">{part.value}</code>;
      }
    });
  };

  return <div className={`math-renderer leading-relaxed ${className}`}>{renderMathContent(content)}</div>;
}
