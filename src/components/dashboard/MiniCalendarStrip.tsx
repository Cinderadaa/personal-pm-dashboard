import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { getTodayDateString } from '../../utils/dateUtils';
import { ChevronRight } from 'lucide-react';

export const MiniCalendarStrip: React.FC = () => {
  const { tasks, setActiveView } = useProjectContext();
  const todayStr = getTodayDateString();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const isToday = dateStr === todayStr;

    return {
      dateStr,
      dayName,
      dayNumber,
      tasks: dayTasks,
      isToday,
    };
  });

  return (
    <div className="bg-[#1e2227] border border-[#282c34] rounded-xl p-5 shadow-xs text-[#abb2bf]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#abb2bf] font-mono tracking-tight flex items-center gap-2">
            <span>Upcoming Schedule</span>
          </h2>
          <p className="text-xs text-[#5c6370] mt-0.5 font-sans">
            7-day outlook across all commitments
          </p>
        </div>
        <button
          onClick={() => setActiveView('calendar')}
          className="text-xs font-mono text-[#5c6370] hover:text-[#61afef] flex items-center gap-1 transition-colors"
        >
          <span>Full Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7-day Strip */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          return (
            <div
              key={day.dateStr}
              onClick={() => setActiveView('calendar')}
              className={`p-2.5 rounded-lg border flex flex-col items-center justify-between text-center transition-all cursor-pointer font-mono ${
                day.isToday
                  ? 'bg-[#61afef]/15 text-[#61afef] border-[#61afef]/40 shadow-xs'
                  : 'bg-[#181a1f]/60 border-[#21252b] hover:border-[#3e4451] text-[#abb2bf]'
              }`}
            >
              <span className={`text-[10px] uppercase tracking-wider ${day.isToday ? 'text-[#61afef] font-bold' : 'text-[#5c6370]'}`}>
                {day.dayName}
              </span>
              <span className="text-base font-bold my-1">
                {day.dayNumber}
              </span>

              {/* Task indicators */}
              <div className="flex items-center gap-1 h-3">
                {day.tasks.length > 0 ? (
                  <span
                    className={`text-[10px] font-semibold px-1 rounded ${
                      day.isToday
                        ? 'bg-[#61afef] text-[#14161a]'
                        : 'bg-[#282c34] text-[#abb2bf]'
                    }`}
                  >
                    {day.tasks.length}
                  </span>
                ) : (
                  <span className={`w-1 h-1 rounded-full ${day.isToday ? 'bg-[#61afef]' : 'bg-[#282c34]'}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
