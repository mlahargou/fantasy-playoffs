'use client';

import PlayerSelect from './PlayerSelect';

interface Player {
  id: string;
  name: string;
  team: string;
}

interface PlayerSelectionsProps {
  qb: Player | null;
  wr: Player | null;
  rb: Player | null;
  te: Player | null;
  setQb: (player: Player | null) => void;
  setWr: (player: Player | null) => void;
  setRb: (player: Player | null) => void;
  setTe: (player: Player | null) => void;
  disabled: boolean;
}

export default function PlayerSelections({
  qb, wr, rb, te,
  setQb, setWr, setRb, setTe,
  disabled
}: PlayerSelectionsProps) {
  return (
    <div className="grid gap-6">
      <PlayerSelect
        position="QB"
        label="Quarterback"
        value={qb}
        onChange={setQb}
        disabled={disabled}
      />
      <PlayerSelect
        position="WR"
        label="Wide Receiver"
        value={wr}
        onChange={setWr}
        disabled={disabled}
      />
      <PlayerSelect
        position="RB"
        label="Running Back"
        value={rb}
        onChange={setRb}
        disabled={disabled}
      />
      <PlayerSelect
        position="TE"
        label="Tight End"
        value={te}
        onChange={setTe}
        disabled={disabled}
      />
    </div>
  );
}

