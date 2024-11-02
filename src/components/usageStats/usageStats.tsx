import React, { useCallback, useEffect, useState } from "react";
import { PokemonUsage } from "../../interfaces/pokemonUsage.model.ts";
import { Pokemon } from "../../interfaces/pokemon.model.ts";
import { baseNameMapping } from "../../services/baseNameMapping.ts";

const UsageStats = ({ replayEntries, team, usageMap }) => {
  const [usedPokemon, updateUsedPokemon] = useState<PokemonUsage[]>([]);

  return <h1>UsageStats Works!</h1>;
};

export default UsageStats;
