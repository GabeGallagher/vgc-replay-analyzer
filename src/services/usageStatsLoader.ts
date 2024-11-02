import { Pokemon } from "../interfaces/pokemon.model";
import { PokemonUsage } from "../interfaces/pokemonUsage.model";
import { Replay } from "../interfaces/replay.model";
import { baseNameMapping } from "./baseNameMapping.ts";

export const loadUsageStats = (
  replayEntries: Replay[],
  team: Pokemon[]
): Map<string, PokemonUsage> => {
  const pokemonMap = new Map<string, PokemonUsage>();

  team.forEach((pokemon) => {
    pokemonMap.set(pokemon.name, {
      used: [0, 0],
      tera: [0, 0],
      lead: [0, 0],
    });
  });

  replayEntries.forEach((replay) => {
    const { used, lead, terastallize, win } = replay;

    used.forEach((pokemonName) => {
      const pokemonUsage = pokemonMap.get(pokemonName)!;
      pokemonUsage.used![0]++;
      if (win) {
        pokemonUsage.used![1]++;
      }
    });

    lead.forEach((pokemonName) => {
      const pokemonUsage = pokemonMap.get(pokemonName)!;
      pokemonUsage.lead![0]++;
      if (win) {
        pokemonUsage.lead![1]++;
      }
    });

    let teraName = "";
    if (terastallize) {
      teraName = baseNameMapping[terastallize.split("|")[0]] || terastallize;
    }
    const pokemonUsage = pokemonMap.get(teraName)!;
    pokemonUsage.tera![0]++;
    if (win) {
      pokemonUsage.tera![1]++;
    }
  });
  return pokemonMap;
};
