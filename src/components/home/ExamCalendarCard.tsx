import React, { useState } from 'react';
import { institutions } from '@/data/seed';
import { Calendar, Clock, AlertTriangle, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  dateStr: string;
  daysRemaining: number;
  type: 'gce' | 'concours';
  badge?: string;
  institution?: string;
  location?: string;
}

export const ExamCalendarCard: React.FC<{
  onSelectInstitution?: (institutionId: string) => void;
}> = ({ onSelectInstitution }) => {
  const [filter, setFilter] = useState<'all' | 'gce' | 'concours'>('all');

  // Today reference (2026/2027 session)
  const now = new Date('2026-10-21');

  const calculateDays = (dateStr: string) => {
    const target = new Date(dateStr);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const GCE_EVENTS: EventItem[] = [
    {
      id: 'gce-reg',
      title: 'GCE Registration Closes',
      dateStr: '2027-01-15',
      daysRemaining: calculateDays('2027-01-15'),
      type: 'gce',
      badge: 'Critical Deadline',
    },
    {
      id: 'gce-practicals',
      title: 'GCE Science Practicals (Physics, Chem, Bio)',
      dateStr: '2027-04-19',
      daysRemaining: calculateDays('2027-04-19'),
      type: 'gce',
      badge: 'Practicals',
    },
    {
      id: 'gce-written',
      title: 'Official GCE Written Papers Start',
      dateStr: '2027-05-10',
      daysRemaining: calculateDays('2027-05-10'),
      type: 'gce',
      badge: 'Board Timetable',
    },
    {
      id: 'gce-results',
      title: 'GCE Results Publication',
      dateStr: '2027-07-28',
      daysRemaining: calculateDays('2027-07-28'),
      type: 'gce',
      badge: 'Official Release',
    },
  ];

  const CONCOURS_EVENTS: EventItem[] = institutions.flatMap((inst) => {
    const events: EventItem[] = [];
    if (inst.applicationDeadline) {
      events.push({
        id: `${inst.id}-deadline`,
        title: `${inst.shortName} Application Deadline`,
        dateStr: inst.applicationDeadline,
        daysRemaining: calculateDays(inst.applicationDeadline),
        type: 'concours',
        badge: 'Deadline',
        institution: inst.name,
        location: inst.city,
      });
    }
    if (inst.examDate) {
      events.push({
        id: `${inst.id}-exam`,
        title: `${inst.shortName} Entrance Exam`,
        dateStr: inst.examDate,
        daysRemaining: calculateDays(inst.examDate),
        type: 'concours',
        badge: 'Exam Day',
        institution: inst.name,
        location: inst.city,
      });
    }
    return events;
  });

  const allEvents = [...GCE_EVENTS, ...CONCOURS_EVENTS].sort(
    (a, b) => a.daysRemaining - b.daysRemaining
  );

  const displayedEvents = allEvents.filter((e) => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#D5EAE9] shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-xs text-[#173A43]">
              Official Exam & Concours Calendar
            </h3>
            <p className="text-[11px] text-[#55737B]">
              Key dates for Cameroon GCE Board & University Entrance Exams
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex p-0.5 rounded-full bg-[#F5FAFA] border border-[#D5EAE9] text-[10px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
              filter === 'all' ? 'bg-[#00B8B0] text-white shadow-xs' : 'text-[#55737B]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('gce')}
            className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
              filter === 'gce' ? 'bg-[#00B8B0] text-white shadow-xs' : 'text-[#55737B]'
            }`}
          >
            GCE
          </button>
          <button
            onClick={() => setFilter('concours')}
            className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
              filter === 'concours' ? 'bg-[#00B8B0] text-white shadow-xs' : 'text-[#55737B]'
            }`}
          >
            Concours
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
        {displayedEvents.slice(0, 5).map((ev) => {
          const isGce = ev.type === 'gce';
          const isUrgent = ev.daysRemaining <= 60 && ev.daysRemaining > 0;

          return (
            <div
              key={ev.id}
              className="p-2.5 rounded-2xl bg-[#F5FAFA] hover:bg-[#EAFBF9] border border-[#D5EAE9] flex items-center justify-between text-xs transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-display font-bold shrink-0 ${
                    isGce
                      ? 'bg-[#00B8B0]/15 text-[#087F7A]'
                      : 'bg-[#FF8A00]/15 text-[#D97200]'
                  }`}
                >
                  <span className="text-[11px] leading-none">
                    {new Date(ev.dateStr).toLocaleString('en', { month: 'short' })}
                  </span>
                  <span className="text-xs leading-none mt-0.5">
                    {new Date(ev.dateStr).getDate()}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="font-display font-bold text-xs text-[#173A43] group-hover:text-[#00B8B0] transition-colors leading-tight">
                    {ev.title}
                  </div>
                  <div className="text-[10px] text-[#55737B] flex items-center gap-1.5">
                    {ev.location && <span>{ev.location} •</span>}
                    <span>{ev.dateStr}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUrgent
                      ? 'bg-[#FF8A00]/15 text-[#FF8A00] animate-pulse'
                      : 'bg-white border border-[#D5EAE9] text-[#55737B]'
                  }`}
                >
                  {ev.daysRemaining > 0 ? `In ${ev.daysRemaining}d` : 'Today'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
