import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { metrics } = useProjectContext();

  const cards = [
    {
      id: 'today',
      title: "Today's Tasks",
      value: metrics.totalTasksToday,
      subtext: `${metrics.completedToday} done today`,
      icon: Clock,
      color: 'text-[#61afef]',
      iconColor: 'text-[#61afef]',
      borderColor: 'border-[#282c34]',
    },
    {
      id: 'completed',
      title: 'Completed Today',
      value: metrics.completedToday,
      subtext: `Total ${metrics.completedTasksTotal} tasks done`,
      icon: CheckCircle2,
      color: 'text-[#98c379]',
      iconColor: 'text-[#98c379]',
      borderColor: 'border-[#282c34]',
    },
    {
      id: 'overdue',
      title: 'Overdue Attention',
      value: metrics.overdueTasks,
      subtext: metrics.overdueTasks > 0 ? 'Requires immediate action' : 'All clear & on track',
      icon: AlertTriangle,
      color: metrics.overdueTasks > 0 ? 'text-[#e06c75]' : 'text-[#abb2bf]',
      iconColor: metrics.overdueTasks > 0 ? 'text-[#e06c75]' : 'text-[#5c6370]',
      borderColor: metrics.overdueTasks > 0 ? 'border-[#e06c75]/40 bg-[#e06c75]/5' : 'border-[#282c34]',
    },
    {
      id: 'progress',
      title: 'Overall Momentum',
      value: `${metrics.overallProgressPercentage}%`,
      subtext: `${metrics.totalActiveProjects} active projects`,
      icon: Target,
      color: 'text-[#c678dd]',
      iconColor: 'text-[#c678dd]',
      borderColor: 'border-[#282c34]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-4 rounded-xl border bg-[#1e2227] transition-all hover:border-[#3e4451] ${card.borderColor}`}
          >
            <div className="flex items-center justify-between text-[#5c6370] mb-2 font-mono">
              <span className="text-xs font-medium tracking-tight text-[#abb2bf]">{card.title}</span>
              <Icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-mono text-[#5c6370] truncate">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
