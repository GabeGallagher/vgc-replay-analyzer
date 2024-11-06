import React, { useEffect, useState, useMemo, useRef } from "react";
import "./matchupStats.css";
import { Replay } from "../../interfaces/replay.model";
import { loadPokedex } from "../../services/pokedex.ts";

const MatchupStats = ({ replayEntries, usageMap, spriteMap }) => {
  // opponentPokemonMap is <pokemonName, [numberOfGames, numberOfOpponentWins]
  const [opponentPokemonMap, updatePokemonMap] = useState<Map<string, [number, number]>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPokemon, setFilteredPokemon] = useState<string[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  const [showAbove, setShowAbove] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    loadPokedex().then(setPokemonList);
  }, []);

  useEffect(() => {
    const filtered = pokemonList.filter((pokemonName) => {
      pokemonName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredPokemon(filtered);
  }, [searchTerm]);

  useEffect(() => {
    if (inputRef.current && dropdownRef.current) {
      const inputRect = inputRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - inputRect.bottom;
      const spaceAbove = inputRect.top;

      setShowAbove(spaceBelow < dropdownRect.height && spaceAbove > spaceBelow);
    }
  }, [searchTerm, filteredPokemon]);

  const handlePokemonSelect = (pokemonName: string) => {
    setSelectedPokemon(pokemonName);
    setSearchTerm("");
    setFilteredPokemon([]);
  };

  /* Builds a list of up to 6 pokemon against whom player has the most wins. List is sorted from
  most wins against to least wins, as long as the pokemon was seen at least 3 times. List not
  intended to be sorted by win percentage. All these design decisions may be changed later, but are
  intended behavior, not bugs*/
  const buildBestMatchups: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    const sortedEntries: [string, [number, number]][] = Array.from(
      opponentPokemonMap.entries()
    ).sort((a, b) => b[1][1] - a[1][1]); // Sort from highest to lowest games won

    let opponentPokemonArray: [string, [number, number]][] = [];

    if (sortedEntries.length >= 6) {
      for (let i = 0; i < 6; i++) opponentPokemonArray.push(sortedEntries[i]);
    } else {
      opponentPokemonArray = sortedEntries;
    }

    for (let i = 0; i < opponentPokemonArray.length; i++) {
      const winCount: number = opponentPokemonArray[i][1][0] - opponentPokemonArray[i][1][1];
      elements.push(
        <div key={opponentPokemonArray[i][0]} className="pokemon-matchup-container">
          <img src={getSpritePath(opponentPokemonArray[i][0])} alt={opponentPokemonArray[i][0]} />
          <p>
            Won {winCount} of {opponentPokemonArray[i][1][0]} games
            {((winCount / opponentPokemonArray[i][1][0]) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return elements;
  }, [opponentPokemonMap, replayEntries]);

  const buildWorstMatchups: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    const sortedEntries: [string, [number, number]][] = Array.from(
      opponentPokemonMap.entries()
    ).sort((a, b) => a[1][1] - b[1][1]); // Sort from lowest to highest games won

    let opponentPokemonArray: [string, [number, number]][] = [];

    if (sortedEntries.length >= 6) {
      for (let i = 0; i < 6; i++) opponentPokemonArray.push(sortedEntries[i]);
    } else {
      opponentPokemonArray = sortedEntries;
    }

    for (let i = 0; i < opponentPokemonArray.length; i++) {
      const lossCount: number = opponentPokemonArray[i][1][1];
      elements.push(
        <div key={opponentPokemonArray[i][0]} className="pokemon-matchup-container">
          <img src={getSpritePath(opponentPokemonArray[i][0])} alt={opponentPokemonArray[i][0]} />
          <p>
            Lost {lossCount} of {opponentPokemonArray[i][1][0]} games
            {((lossCount / opponentPokemonArray[i][1][0]) * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return elements;
  }, [opponentPokemonMap, replayEntries]);

  const buildHighestAttendence: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    const sortedEntries: [string, [number, number]][] = Array.from(
      opponentPokemonMap.entries()
    ).sort((a, b) => b[1][0] - a[1][0]); // Sort from highest to lowest games appeared

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
    ).sort((a, b) => a[1][0] - b[1][0]); // Sort from lowest to highest games appeared

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
      <div>
        <h2>Best Matchups</h2>
        <div className="matchup-stats">{buildBestMatchups}</div>
      </div>

      <div>
        <h2>Worst Matchups</h2>
        <div className="matchup-stats">{buildWorstMatchups}</div>
      </div>

      <div>
        <h2>Highest Attendence</h2>
        <div className="matchup-stats">{buildHighestAttendence}</div>
      </div>

      <div>
        <h2>Lowest Attendence</h2>
        <div className="matchup-stats">{buildLowestAttendence}</div>
      </div>

      <div>
        <h2>Matchup Selection</h2>
        <div className="dropdown-container">
          <input
            type="text"
            placeholder="Search Pokemon"
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <div ref={dropdownRef} className={`dropdown-list ${showAbove ? "above" : "below"}`}>
              {filteredPokemon.map((pokemon, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handlePokemonSelect(pokemon)}
                >
                  {pokemon}
                </div>
              ))}
            </div>
          )}
          {selectedPokemon && (
            <div className="pokemon-sprite">
              <img src={getSpritePath(selectedPokemon)} alt={selectedPokemon} />
              <p>{selectedPokemon}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchupStats;
