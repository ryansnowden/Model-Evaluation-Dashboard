import React from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle2, AlertOctagon, TrendingDown, Clock } from 'lucide-react';
import { MetricSummary } from '../types';

interface SummaryCardsProps {
  metricsV1: MetricSummary;
  metricsV2: MetricSummary;
  medianTimeV1: number;
  medianTimeV2: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metricsV1,
  metricsV2,
  medianTimeV1,
  medianTimeV2,
}) => {
  const cards = [
    {
      title: 'Precision Rate',
      description: 'Ability to avoid raising false alerts on benign events.',
      id: 'metric-precision',
      v1: metricsV1.precision,
      v2: metricsV2.precision,
      formatter: (val: number) => `${(val * 100).toFixed(1)}%`,
      icon: Target,
      color: 'indigo',
    },
    {
      title: 'Recall Rate (Sensitivity)',
      description: 'Ability to capture all true actionable anomaly events.',
      id: 'metric-recall',
      v1: metricsV1.recall,
      v2: metricsV2.recall,
      formatter: (val: number) => `${(val * 100).toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      title: 'False Positive Rate',
      description: 'Frequency of safe events triggering nuisance alarms.',
      id: 'metric-fpr',
      v1: metricsV1.fpr,
      v2: metricsV2.fpr,
      formatter: (val: number) => `${(val * 100).toFixed(1)}%`,
      icon: TrendingDown,
      color: 'rose',
      inverse: true, // Lower is better
    },
    {
      title: 'F1 Score (Harmonic Mean)',
      description: 'Combined measure of precision and recall balance.',
      id: 'metric-f1',
      v1: metricsV1.f1,
      v2: metricsV2.f2 || (2 * metricsV2.precision * metricsV2.recall) / (metricsV2.precision + metricsV2.recall || 1),
      formatter: (val: number) => `${(val * 100).toFixed(1)}%`,
      icon: AlertOctagon,
      color: 'amber',
    },
  ];

  const valueDiff = (v1: number, v2: number, inverse = false) => {
    const diff = v2 - v1;
    if (Math.abs(diff) < 0.0001) return { text: 'No change', sentiment: 'neutral' };
    const positiveIsGood = !inverse;
    if (diff > 0) {
      return {
        text: `+${(diff * 100).toFixed(1)}%`,
        sentiment: positiveIsGood ? 'positive' : 'negative',
      };
    } else {
      return {
        text: `${(diff * 100).toFixed(1)}%`,
        sentiment: positiveIsGood ? 'negative' : 'positive',
      };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="summary-metrics-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const diff = valueDiff(card.v1, card.v2, card.inverse);
        const isBetter =
          (card.v2 > card.v1 && !card.inverse) || (card.v2 < card.v1 && card.inverse);

        return (
          <motion.div
            key={card.title}
            id={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-medium tracking-wide uppercase text-slate-400 dark:text-slate-500">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              </div>

              <div className="flex items-baseline gap-4 mt-0.5">
                <div>
                  <div className="text-xs font-medium text-slate-400 dark:text-slate-500">Model V1</div>
                  <div className="text-lg font-display font-medium text-slate-600 dark:text-slate-400">
                    {card.formatter(card.v1)}
                  </div>
                </div>

                <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-800 self-center"></div>

                <div>
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Model V2</div>
                  <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                    {card.formatter(card.v2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal max-w-[170px]">
                {card.description}
              </p>
              {diff.sentiment !== 'neutral' ? (
                <span
                  className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                    diff.sentiment === 'positive'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                  }`}
                >
                  {diff.text}
                </span>
              ) : (
                <span className="text-xs font-mono px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                  --
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
