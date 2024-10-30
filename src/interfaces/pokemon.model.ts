// models/Pokemon.ts
export interface Pokemon {
    name: string;
    ability: string;
    tera: string;
    nature: string;
    moves: [string, string, string, string];
  }
  