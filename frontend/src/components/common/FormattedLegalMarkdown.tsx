import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedLegalMarkdownProps {
  content: string;
  className?: string;
}

export default function FormattedLegalMarkdown({
  content,
  className = '',
}: FormattedLegalMarkdownProps) {
  if (!content) return null;

  return (
    <div className={`prose-legal text-gray-800 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight mt-4 mb-2 pb-1.5 border-b border-gray-200 flex items-center gap-2"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-base sm:text-lg font-bold text-gray-900 tracking-tight mt-3.5 mb-2 pb-1 border-b border-gray-100"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-sm sm:text-base font-bold text-gray-900 mt-3 mb-1.5"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-xs sm:text-sm font-semibold text-gray-900 mt-2.5 mb-1"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed mb-3 last:mb-0" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-950" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1.5 text-xs sm:text-sm text-gray-800" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-xs sm:text-sm text-gray-800 font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1 marker:text-blue-600 marker:font-bold" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-600 bg-blue-50/60 pl-3.5 pr-3 py-2 my-3 rounded-r-xl text-xs sm:text-sm text-gray-700 italic space-y-1"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className && !String(children).includes('\n');
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 font-mono text-[11px] sm:text-xs text-blue-700 font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 my-3 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto border border-gray-800">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-3 rounded-xl border border-gray-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-bold" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="py-2.5 px-3 font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="py-2 px-3 border-b border-gray-100 text-gray-700" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3.5 border-t border-gray-200" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
