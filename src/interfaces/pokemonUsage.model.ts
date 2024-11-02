export interface PokemonUsage {
  used: [number, number]; // [timesUsed, timesWon]
  tera: [number, number]; // [timesTera, timesTeraWon]
  lead: [number, number]; // [timesLead, timesLeadWon]
}
