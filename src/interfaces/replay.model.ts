export interface Replay {
  url: string;
  replayLog: string;
  opponentTeam: string[];
  lead: [string, string];
  used: string[];
  opponentLead: [string, string];
  opponentUsed: string[];
  win?: boolean;
}
