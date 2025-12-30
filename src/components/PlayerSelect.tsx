'use client';

import { useState, useEffect, useRef } from 'react';

interface Player {
   id: string;
   name: string;
   team: string;
   position: string;
}

interface PlayerSelectProps {
   position: 'QB' | 'WR' | 'RB' | 'TE';
   label: string;
   value: Player | null;
   onChange: (player: Player | null) => void;
}

export default function PlayerSelect({ position, label, value, onChange }: PlayerSelectProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [search, setSearch] = useState('');
   const [players, setPlayers] = useState<Player[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const fetchPlayers = async () => {
         setLoading(true);
         setError(null);
         try {
            const response = await fetch(`/api/players?position=${position}&search=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setPlayers(data.players || []);
         } catch {
            setError('Failed to load players');
            setPlayers([]);
         } finally {
            setLoading(false);
         }
      };

      const debounce = setTimeout(fetchPlayers, 300);
      return () => clearTimeout(debounce);
   }, [position, search]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleSelect = (player: Player) => {
      onChange(player);
      setIsOpen(false);
      setSearch('');
   };

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setSearch('');
   };

   const positionColors = {
      QB: 'from-red-500/20 to-red-600/10 border-red-500/30',
      WR: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
      RB: 'from-green-500/20 to-green-600/10 border-green-500/30',
      TE: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
   };

   const positionAccents = {
      QB: 'bg-red-500',
      WR: 'bg-blue-500',
      RB: 'bg-green-500',
      TE: 'bg-amber-500',
   };

   return (
      <div className="relative" ref={dropdownRef}>
         <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
            {label}
         </label>

         <div
            className={`relative cursor-pointer rounded-xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-200 ${positionColors[position]} ${isOpen ? 'ring-2 ring-white/20 shadow-xl' : 'hover:shadow-lg hover:border-white/20'
               }`}
            onClick={() => {
               setIsOpen(true);
               setTimeout(() => inputRef.current?.focus(), 50);
            }}
         >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${positionAccents[position]}`} />

            {value ? (
               <div className="flex items-center justify-between p-4 pl-5">
                  <div>
                     <span className="font-bold text-white text-lg">{value.name}</span>
                     <span className="ml-3 text-sm font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                        {value.team}
                     </span>
                  </div>
                  <button
                     onClick={handleClear}
                     className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
            ) : (
               <div className="p-4 pl-5 text-slate-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Select {position}...
               </div>
            )}
         </div>

         {isOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-600/50 bg-slate-800/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-3 border-b border-slate-700/50">
                  <input
                     ref={inputRef}
                     type="text"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder={`Search ${position}s...`}
                     className="w-full px-4 py-2.5 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
                  />
               </div>

               <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                     <div className="p-6 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-400 border-t-transparent mb-2" />
                        <p>Loading players...</p>
                     </div>
                  ) : error ? (
                     <div className="p-6 text-center text-red-400">{error}</div>
                  ) : players.length === 0 ? (
                     <div className="p-6 text-center text-slate-400">No players found</div>
                  ) : (
                     players.map((player) => (
                        <div
                           key={player.id}
                           onClick={() => handleSelect(player)}
                           className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-slate-700/30 last:border-0 flex items-center justify-between group"
                        >
                           <span className="font-medium text-white group-hover:text-white/90">{player.name}</span>
                           <span className="text-sm font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                              {player.team}
                           </span>
                        </div>
                     ))
                  )}
               </div>
            </div>
         )}
      </div>
   );
}

