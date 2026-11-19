import React, { useState } from 'react';
import { institutions } from '@/data/seed';
import { useAppStore } from '@/stores/appStore';
import {
  Search,
  MoreVertical,
  Stethoscope,
  Cpu,
  Sprout,
  Landmark,
  GraduationCap,
  Star,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import type { Institution } from '@/types/models';

export const ConcoursScreen: React.FC<{
  onSelectInstitution: (inst: Institution) => void;
}> = ({ onSelectInstitution }) => {
  const { attempts, setShowSkylerModal } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const SECTORS = [
    {
      id: 'health',
      title: 'Health',
      desc: 'Medicine, Pharmacy, Nursing, MLS...',
      icon: Stethoscope,
      bg: 'bg-[#EAFBF9]',
      iconColor: 'text-[#00B8B0]',
      cardBg: 'bg-white',
    },
    {
      id: 'engineering',
      title: 'Engineering',
      desc: 'Civil, Computer, Telecom, Polytech...',
      icon: Cpu,
      bg: 'bg-[#FFF8E7]',
      iconColor: 'text-[#FF8A00]',
      cardBg: 'bg-white',
    },
    {
      id: 'agriculture',
      title: 'Agriculture',
      desc: 'Agro, Forestry, Vet Medicine...',
      icon: Sprout,
      bg: 'bg-[#EBFDF9]',
      iconColor: 'text-[#10B981]',
      cardBg: 'bg-white',
    },
    {
      id: 'administration',
      title: 'Administration',
      desc: 'Public Service, ENAM, Customs...',
      icon: Landmark,
      bg: 'bg-[#F5F0FF]',
      iconColor: 'text-[#8B5CF6]',
      cardBg: 'bg-white',
    },
    {
      id: 'teaching',
      title: 'Teaching',
      desc: 'Education, Pedagogy, ENS, ENSET...',
      icon: GraduationCap,
      bg: 'bg-[#FFF3E8]',
      iconColor: 'text-[#FF8A00]',
      cardBg: 'bg-white',
    },
  ];

  const FILTER_PILLS = ['All', 'Health', 'Engineering', 'Agriculture', 'Administration', 'Teaching'];

  const filteredInstitutions = institutions.filter((inst) => {
    if (selectedFilter !== 'All') {
      if (selectedFilter === 'Health' && inst.familyId !== 'health') return false;
      if (selectedFilter === 'Engineering' && inst.familyId !== 'engineering') return false;
      if (selectedFilter === 'Agriculture' && inst.familyId !== 'agri-vet') return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.shortName.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q) ||
        inst.programmes.some((p) => p.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header matching 9-_Concours_b4435dcd.png */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-extrabold text-xl text-[#173A43]">
          Explore Concours
        </h1>
        <button className="p-2 rounded-full text-[#55737B] hover:text-[#173A43]">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#55737B] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by institution, field or exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#D5EAE9] text-xs text-[#173A43] placeholder-[#55737B]/70 focus:outline-none focus:border-[#00B8B0] shadow-xs"
        />
      </div>

      {/* Filter Horizontal Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_PILLS.map((pill) => {
          const isSelected = selectedFilter === pill;
          return (
            <button
              key={pill}
              onClick={() => setSelectedFilter(pill)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#00B8B0] text-white border-[#00B8B0] shadow-xs'
                  : 'bg-white text-[#173A43] border-[#D5EAE9] hover:bg-[#F5FAFA]'
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* Popular Sectors Section */}
      <div className="space-y-2.5">
        <h2 className="font-display font-bold text-xs text-[#173A43] px-1">
          Popular Sectors
        </h2>

        <div className="space-y-2">
          {SECTORS.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                onClick={() => {
                  setSelectedFilter(sec.title);
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] hover:border-[#00B8B0] transition-all cursor-pointer shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${sec.bg} ${sec.iconColor} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs text-[#173A43] group-hover:text-[#00B8B0] transition-colors">
                      {sec.title}
                    </h3>
                    <p className="text-[11px] text-[#55737B]">
                      {sec.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#55737B] group-hover:text-[#00B8B0] group-hover:translate-x-0.5 transition-all" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Opportunities Section matching 9-_Concours_b4435dcd.png */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display font-bold text-xs text-[#173A43]">
            Featured Opportunities
          </h2>
          <span className="text-xs font-semibold text-[#00B8B0] hover:underline cursor-pointer">
            See all
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredInstitutions.map((inst) => (
            <div
              key={inst.id}
              onClick={() => onSelectInstitution(inst)}
              className="p-3.5 rounded-2xl bg-white border border-[#D5EAE9] hover:border-[#00B8B0] transition-all cursor-pointer shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00B8B0]/15 text-[#00B8B0] flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs text-[#173A43] group-hover:text-[#00B8B0] transition-colors">
                    {inst.name}
                  </h3>
                  <div className="text-[11px] text-[#55737B] flex items-center gap-2 mt-0.5">
                    <span>{inst.city}</span>
                    <span>•</span>
                    <span className="font-medium text-[#087F7A]">
                      {inst.programmes[0] || 'Entrance Exam'}
                    </span>
                    <span>•</span>
                    <span>{inst.examDate ? '2027' : 'Annual'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#FF8A00] fill-current" />
                <ChevronRight className="w-4 h-4 text-[#55737B]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
