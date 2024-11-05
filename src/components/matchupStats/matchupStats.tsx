import React, { useEffect, useState, useMemo } from "react";
import { Replay } from "../../interfaces/replay.model";

const MatchupStats = ({ replayEntries, usageMap, spriteMap }) => {
  // Map is <pokemonName, [numberOfGames, numberOfOpponentWins]
  //   const pokemonMap: Map<string, [number, number]> = new Map<string, [number, number]>();
  const [opponentPokemonMap, updatePokemonMap] = useState<Map<string, [number, number]>>(new Map());

  const getSpritePath = (pokemonName: string): string => {
    const filename = spriteMap[pokemonName.toLowerCase()];
    return filename ? `/sprites/${filename}` : "/sprites/default.png";
  };

  const loadMatchupStats = () => {
    const pokemonMap: Map<string, [number, number]> = new Map();
    replayEntries.forEach((replay: Replay) => {
      replay.opponentUsed.forEach((pokemonName: string) => {
        const winLoss: [number, number] = pokemonMap.get(pokemonName) || [0, 0];
        winLoss[0] += 1;
        if (!replay.win) winLoss[1] += 1;
        pokemonMap.set(pokemonName, winLoss);
      });
    });
    // Remove pokemon that appeared fewer than 3 times. These mons will not be considered in matchup
    // stats since sample data is too low. Can raise number if needed
    for (const [pokemonName, value] of pokemonMap.entries()) {
      if (value[0] < 3) pokemonMap.delete(pokemonName);
    }
    updatePokemonMap(pokemonMap);
    console.log(opponentPokemonMap);
  };

  useEffect(() => {
    loadMatchupStats();
  }, [replayEntries]);

  const buildHighestAttendence: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    const sortedEntries: [string, [number, number]][] = Array.from(
      opponentPokemonMap.entries()
    ).sort((a, b) => b[1][0] - a[1][0]); // Sort from highest to lowest

    let opponentPokemonArray: [string, [number, number]][] = [];

    if (sortedEntries.length >= 6) {
      for (let i = 0; i < 6; i++) opponentPokemonArray.push(sortedEntries[i]);
    } else {
      opponentPokemonArray = sortedEntries;
    }

    for (let i = 0; i < opponentPokemonArray.length; i++) {
      const appearences: number = opponentPokemonArray[i][1][0];
      elements.push(
        <div key={opponentPokemonArray[i][0]} className="pokemon-matchup-container">
          <img src={getSpritePath(opponentPokemonArray[i][0])} alt={opponentPokemonArray[i][0]} />
          <p>
            Seen in {appearences} of {replayEntries.length} games
            {((appearences / replayEntries.length) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return elements;
  }, [opponentPokemonMap, replayEntries]);

  const buildLowestAttendence: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    const sortedEntries: [string, [number, number]][] = Array.from(
      opponentPokemonMap.entries()
    ).sort((a, b) => a[1][0] - b[1][0]); // Sort from lowest to highest

    let opponentPokemonArray: [string, [number, number]][] = [];

    if (sortedEntries.length >= 6) {
      for (let i = 0; i < 6; i++) opponentPokemonArray.push(sortedEntries[i]);
    } else {
      opponentPokemonArray = sortedEntries;
    }

    for (let i = 0; i < opponentPokemonArray.length; i++) {
      const appearances: number = opponentPokemonArray[i][1][0];
      elements.push(
        <div key={opponentPokemonArray[i][0]} className="pokemon-matchup-container">
          <img src={getSpritePath(opponentPokemonArray[i][0])} alt={opponentPokemonArray[i][0]} />
          <p>
            Seen in {appearances} of {replayEntries.length} games
            {((appearances / replayEntries.length) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return elements;
  }, [opponentPokemonMap, replayEntries]);

  return (
    <div className="matchup-stats-container">
      <div>Best Matchups</div>
      <div>Worst Matchups</div>
      <div>
        <h2>Highest Attendence</h2>
        <div className="matchup-stats">{buildHighestAttendence}</div>
      </div>
      <div>
        <h2>Lowest Attendence</h2>
        <div className="matchup-stats">{buildLowestAttendence}</div>
      </div>
      <div>Matchup Selection</div>
    </div>
  );
};

export default MatchupStats;
