'use client';

import { Entry } from '../types';

export interface Filters {
   email: string;
   qb: string;
   wr: string;
   rb: string;
   te: string;
}

interface LeaderboardFiltersProps {
   entries: Entry[];
   filters: Filters;
   onFilterChange: (filters: Filters) => void;
}

function FilterSelect({
   label,
   value,
   options,
   onChange
}: {
   label: string;
   value: string;
   options: string[];
   onChange: (value: string) => void;
}) {
   return (
      <div className="flex flex-col gap-1">
         <label className="text-xs text-slate-400 uppercase tracking-wide">{label}</label>
         <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
         >
            <option value="">All</option>
            {options.map((option) => (
               <option key={option} value={option}>
                  {option}
               </option>
            ))}
         </select>
      </div>
   );
}

export default function LeaderboardFilters({ entries, filters, onFilterChange }: LeaderboardFiltersProps) {
   // Get unique values for each filter
   const uniqueEmails = [...new Set(entries.map(e => e.email))].sort();
   const uniqueQBs = [...new Set(entries.map(e => e.qb_name))].sort();
   const uniqueWRs = [...new Set(entries.map(e => e.wr_name))].sort();
   const uniqueRBs = [...new Set(entries.map(e => e.rb_name))].sort();
   const uniqueTEs = [...new Set(entries.map(e => e.te_name))].sort();

   const hasActiveFilters = Object.values(filters).some(v => v !== '');

   const clearFilters = () => {
      onFilterChange({ email: '', qb: '', wr: '', rb: '', te: '' });
   };

   return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Filters</h3>
            {hasActiveFilters && (
               <button
                  onClick={clearFilters}
                  className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
               >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear all
               </button>
            )}
         </div>
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FilterSelect
               label="Email"
               value={filters.email}
               options={uniqueEmails}
               onChange={(email) => onFilterChange({ ...filters, email })}
            />
            <FilterSelect
               label="QB"
               value={filters.qb}
               options={uniqueQBs}
               onChange={(qb) => onFilterChange({ ...filters, qb })}
            />
            <FilterSelect
               label="WR"
               value={filters.wr}
               options={uniqueWRs}
               onChange={(wr) => onFilterChange({ ...filters, wr })}
            />
            <FilterSelect
               label="RB"
               value={filters.rb}
               options={uniqueRBs}
               onChange={(rb) => onFilterChange({ ...filters, rb })}
            />
            <FilterSelect
               label="TE"
               value={filters.te}
               options={uniqueTEs}
               onChange={(te) => onFilterChange({ ...filters, te })}
            />
         </div>
      </div>
   );
}

