export interface Replay {
  url: string;
  replayLog: string;
  opponentTeam: string[];
  lead: [string, string];
  used: string[];
  terastallize?: string;
  opponentLead: [string, string];
  opponentUsed: string[];
  opponentTerastallize?: string;
  win: boolean;
}
