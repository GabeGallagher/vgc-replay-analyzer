import React, { useRef, useState } from "react";
import "./replayList.css";
import { Pokemon } from "../../interfaces/pokemon.model";
import { getReplayLog } from "../../services/replay.ts";

interface ReplayUrlEntry {
  url: string;
  showButton: boolean;
}

interface ReplayListProps {
  showdownName: string;
  spriteMap: { [name: string]: string };
}

const ReplayList: React.FC<ReplayListProps> = ({ showdownName, spriteMap }) => {
  const [replayUrls, setReplayUrls] = useState<ReplayUrlEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [opponentPokemonList, setOpponentPokemonList] = useState<string[]>([]);
  const [replayLogs, setReplayLogs] = useState<string[]>([]);

  const loadReplay = async () => {
    const url = inputRef.current?.value.split("?")[0];
    if (url && typeof url === "string") {
      setReplayUrls((prevUrls) => [
        ...prevUrls.map((entry) => ({
          ...entry,
          showButton: false,
        })),
        { url, showButton: true },
      ]);
      if (inputRef.current) inputRef.current.value = "";

      const replayLog = await getReplayLog(url);
      setReplayLogs((prevLogs) => [...prevLogs, replayLog]);
      parseOpponentPokemon(replayLog, showdownName);

      console.log(`Added replay: ${url}`);
    } else {
      console.error("invalid url input");
    }
  };

  const parseOpponentPokemon = (replayLog: string, showdownName: string) => {
    const log = replayLog.split("\n");
    let playerOne = log[0].split("|j|")[0].slice(1).trim();
    let playerTwo = log[1].split("|j|")[0].slice(1).trim();
    const isPlayerOne: boolean = playerOne === showdownName ? true : false;
    const opponentPokemonString: string = isPlayerOne
      ? "|poke|p2|"
      : "|poke|p1|";

    for (let i = 0; i < log.length; i++) {
      let count = 0;
      if (count >= 6) break;
      if (log[i].includes(opponentPokemonString)) {
        const lineArray = log[i].split("|")[3];
        const pokemon = lineArray.split(",")[0];
        setOpponentPokemonList((prevOpponentPokemonList) => [
          ...prevOpponentPokemonList,
          pokemon,
        ]);
        count++;
      }
    }

    console.log(opponentPokemonList);
  };

  const getSpritePath = (pokemonName: string): string => {
    const filename = spriteMap[pokemonName.toLowerCase()];
    return filename ? `/sprites/${filename}` : "/sprites/default.png";
  };

  return (
    <div className="replay-entries-container">
      <div className="header-container">
        <div className="game-links-header">Game Links</div>
        <div className="opposing-team-header">Opposing Team</div>
        <div>Notes</div>
      </div>
      {replayUrls.map((entry, index) => (
        <div key={index} className="replay-entry">
          <div className="game-links">{entry.url}</div>
          <div className="opposing-team">
            {opponentPokemonList.map((pokemon, index) => (
              <div key={index}>
                <img src={getSpritePath(pokemon)} alt={pokemon} />
              </div>
            ))}
          </div>
          <input type="text" placeholder="Notes" />
        </div>
      ))}
      <div className="replay-upload">
        <input
          type="text"
          placeholder="Enter Replay"
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadReplay();
          }}
        />
        <button onClick={() => loadReplay()}>Add Replay</button>
      </div>
    </div>
  );
};

export default ReplayList;
