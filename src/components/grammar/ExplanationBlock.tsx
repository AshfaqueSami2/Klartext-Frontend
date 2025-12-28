'use client';

import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  AlertTriangle,
  Table2,
  MessageSquareQuote,
  Scale,
  Type
} from 'lucide-react';
import { ExplanationBlock as ExplanationBlockType, GrammarExample } from '@/types/grammar.types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ExplanationBlockProps {
  block: ExplanationBlockType;
  index: number;
  showGerman?: boolean;
}

export function ExplanationBlock({ block, index, showGerman = false }: ExplanationBlockProps) {
  const content = showGerman && block.contentDe ? block.contentDe : block.content;
  const title = showGerman && block.titleDe ? block.titleDe : block.title;

  const blockStyles: Record<string, { icon: React.ReactNode; className: string }> = {
    text: {
      icon: <Type className="w-5 h-5" />,
      className: 'border-l-4 border-l-primary bg-card'
    },
    table: {
      icon: <Table2 className="w-5 h-5" />,
      className: 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
    },
    example: {
      icon: <MessageSquareQuote className="w-5 h-5" />,
      className: 'border-l-4 border-l-violet-500 bg-violet-50/50 dark:bg-violet-950/20'
    },
    tip: {
      icon: <Lightbulb className="w-5 h-5 text-emerald-600" />,
      className: 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      className: 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
    },
    comparison: {
      icon: <Scale className="w-5 h-5" />,
      className: 'border-l-4 border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20'
    }
  };

  const style = blockStyles[block.type] || blockStyles.text;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={cn("p-6 rounded-xl", style.className)}>
        {/* Header */}
        {title && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center">
              {style.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">{content}</p>
        </div>

        {/* Table Data */}
        {block.type === 'table' && block.tableData && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-100/50 dark:bg-blue-900/30">
                  {block.tableData.headers.map((header, i) => (
                    <th key={i} className="px-4 py-3 text-left font-semibold text-foreground border-b-2 border-blue-200 dark:border-blue-800">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 border-b border-blue-100 dark:border-blue-900 text-muted-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Examples */}
        {block.type === 'example' && block.examples && block.examples.length > 0 && (
          <div className="mt-4 space-y-3">
            {block.examples.map((example, i) => (
              <ExampleItem key={i} example={example} index={i} />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function ExampleItem({ example, index }: { example: GrammarExample; index: number }) {
  return (
    <div className="p-4 rounded-lg bg-background/60 border border-violet-200 dark:border-violet-800">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 space-y-2">
          {/* German */}
          <div>
            <span className="text-xs text-muted-foreground font-medium">🇩🇪 German</span>
            <p className="text-foreground font-medium">{example.german}</p>
          </div>
          {/* English */}
          <div>
            <span className="text-xs text-muted-foreground font-medium">🇬🇧 English</span>
            <p className="text-muted-foreground">{example.english}</p>
          </div>
          {/* Breakdown */}
          {example.breakdown && (
            <div className="pt-2 border-t border-violet-100 dark:border-violet-900">
              <span className="text-xs text-muted-foreground font-medium">📝 Breakdown</span>
              <p className="text-sm text-muted-foreground/80 italic">{example.breakdown}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
