import React, { useState } from 'react';
import { Supplement, DailySupplementLog } from '../types';
import { generateSupplementMatrix, formatDisplayDate } from '../utils/dateUtils';
import { Flame, Pill, Calendar, Award, CheckCircle2, Droplets, Moon } from 'lucide-react';

interface SupplementHeatmapProps {
  supplementLogs: Record<string, DailySupplementLog>;
  supplements: Supplement[];
  title?: string;
}

export const SupplementHeatmap: React.FC<SupplementHeatmapProps> = ({
  supplementLogs,
  supplements,
  title = 'Vitamin & Supplement Intake Heatmap',
}) => {
  const [weeksSpan, setWeeksSpan] = useState<number>(26);
  const [selectedFilterId, setSelectedFilterId] = useState<string>(''); // empty string = all combined

  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    level: number;
    takenCount: number;
    totalCount: number;
    percentage: number;
    takenNames: string[];
    missedNames: string[];
    waterGlasses: number;
    sleepHours: number;
    x: number;
    y: number;
  } | null>(null);

  const { weeks, monthLabels } = React.useMemo(() => {
    return generateSupplementMatrix(supplementLogs, supplements, weeksSpan, selectedFilterId || undefined);
  }, [supplementLogs, supplements, weeksSpan, selectedFilterId]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    let perfectDays = 0;
    let activeDays = 0;
    let totalDoses = 0;

    Object.values(supplementLogs).forEach((log) => {
      if (log.takenSupplementIds && log.takenSupplementIds.length > 0) {
        activeDays++;
        totalDoses += log.takenSupplementIds.length;
        if (log.takenSupplementIds.length >= supplements.length && supplements.length > 0) {
          perfectDays++;
        }
      }
    });

    return { perfectDays, activeDays, totalDoses };
  }, [supplementLogs, supplements]);

  const getCellColor = (level: number) => {
    if (level === 0) {
      return 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500';
    }
    if (level === 1) {
      return 'bg-teal-100 dark:bg-teal-950 border-teal-300 dark:border-teal-800 hover:border-teal-500 dark:hover:border-teal-400';
    }
    if (level === 2) {
      return 'bg-teal-300 dark:bg-teal-800 border-teal-400 dark:border-teal-600 hover:border-teal-600 dark:hover:border-teal-300';
    }
    if (level === 3) {
      return 'bg-teal-500 dark:bg-teal-600 border-teal-600 dark:border-teal-400 hover:border-teal-700 dark:hover:border-teal-200';
    }
    return 'bg-teal-600 dark:bg-teal-400 border-teal-700 dark:border-teal-300 shadow-sm dark:shadow-[0_0_8px_rgba(45,212,191,0.6)] hover:border-white';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const selectedSupplementName = supplements.find((s) => s.id === selectedFilterId)?.name;

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl relative backdrop-blur-sm mb-6 transition-colors duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
              <Pill className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {title}
            </h2>
            {selectedSupplementName && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                {selectedSupplementName}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual adherence matrix for your daily vitamins, minerals & cognitive health routine
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedFilterId}
            onChange={(e) => setSelectedFilterId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
          >
            <option value="">✨ All 7 Vitamins Combined</option>
            {supplements.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setWeeksSpan(16)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                weeksSpan === 16 ? 'bg-teal-600 text-white font-medium shadow-sm' : 'hover:text-teal-600 dark:hover:text-white'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setWeeksSpan(26)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                weeksSpan === 26 ? 'bg-teal-600 text-white font-medium shadow-sm' : 'hover:text-teal-600 dark:hover:text-white'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setWeeksSpan(52)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                weeksSpan === 52 ? 'bg-teal-600 text-white font-medium shadow-sm' : 'hover:text-teal-600 dark:hover:text-white'
              }`}
            >
              1Y
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/60 flex-wrap">
        <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
          <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span><strong>{stats.perfectDays}</strong> 100% Perfect Days</span>
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span><strong>{stats.totalDoses}</strong> Total Doses Taken</span>
        </span>
        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
          <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span><strong>{stats.activeDays}</strong> Active Days</span>
        </span>
      </div>

      {/* Heatmap Matrix Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-block min-w-full">
          {/* Month Labels Header */}
          <div className="flex text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 pl-7 select-none">
            {weeks.map((_, wIndex) => {
              const labelObj = monthLabels.find((m) => m.index === wIndex);
              return (
                <div key={wIndex} className="w-[15px] sm:w-[17px] mr-[3px] text-left shrink-0">
                  {labelObj ? (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{labelObj.label}</span>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid: 7 Rows (Sun to Sat) */}
          <div className="flex">
            {/* Day Labels on left */}
            <div className="flex flex-col justify-between pr-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none py-0.5">
              {dayLabels.map((lbl, idx) => (
                <div key={idx} className="h-[15px] sm:h-[17px] leading-[15px] sm:leading-[17px] text-right">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-[3px] shrink-0">
                  {week.days.map((day, dIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dIndex}
                          className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] rounded-[3px] opacity-0"
                        />
                      );
                    }

                    return (
                      <div
                        key={dIndex}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            date: day.date,
                            level: day.level,
                            takenCount: day.takenCount,
                            totalCount: day.totalCount,
                            percentage: day.percentage,
                            takenNames: day.takenNames,
                            missedNames: day.missedNames,
                            waterGlasses: day.waterGlasses,
                            sleepHours: day.sleepHours,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] rounded-[3px] border cursor-pointer heatmap-cell transition-all ${getCellColor(
                          day.level
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-3">
        <span className="text-slate-500 dark:text-slate-400 text-xs">
          Hover over any day square to see vitamins taken, hydration, and sleep
        </span>

        {/* Intensity Legend */}
        <div className="flex items-center gap-1.5 text-[11px] select-none">
          <span>0%</span>
          <div className="w-3 h-3 rounded-[2px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
          <div className="w-3 h-3 rounded-[2px] bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-800"></div>
          <div className="w-3 h-3 rounded-[2px] bg-teal-300 dark:bg-teal-800 border border-teal-400 dark:border-teal-600"></div>
          <div className="w-3 h-3 rounded-[2px] bg-teal-500 dark:bg-teal-600 border border-teal-600 dark:border-teal-400"></div>
          <div className="w-3 h-3 rounded-[2px] bg-teal-600 dark:bg-teal-400 border border-teal-700 dark:border-teal-300 shadow-sm dark:shadow-[0_0_6px_rgba(45,212,191,0.8)]"></div>
          <span>100% Taken</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-3 w-64 text-left transition-all backdrop-blur-md"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y - 8}px`,
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {formatDisplayDate(hoveredCell.date)}
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                hoveredCell.percentage === 100
                  ? 'bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700'
                  : hoveredCell.percentage > 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500'
              }`}
            >
              {hoveredCell.takenCount}/{hoveredCell.totalCount} ({hoveredCell.percentage}%)
            </span>
          </div>

          {hoveredCell.takenNames.length > 0 ? (
            <div className="space-y-1 mb-2">
              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider">
                ✓ Taken:
              </div>
              <div className="flex flex-wrap gap-1">
                {hoveredCell.takenNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-2">No supplements logged this day</p>
          )}

          {hoveredCell.missedNames.length > 0 && hoveredCell.takenNames.length > 0 && (
            <div className="space-y-1 mb-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                ✕ Missed:
              </div>
              <div className="flex flex-wrap gap-1">
                {hoveredCell.missedNames.slice(0, 4).map((name, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(hoveredCell.waterGlasses > 0 || hoveredCell.sleepHours > 0) && (
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 font-mono">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>{hoveredCell.waterGlasses} glasses</span>
              </span>
              <span className="flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>{hoveredCell.sleepHours}h sleep</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
