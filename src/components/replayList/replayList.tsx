import React, { useEffect, useRef, useState } from "react";
import "./replayList.css";
import { getReplayLog } from "../../services/replay.ts";
import { Replay } from "../../interfaces/replay.model.ts";
import { baseFormMapping } from "../../services/baseFormMapping.ts";

interface ReplayListProps {
  showdownName: string;
  spriteMap: { [name: string]: string };
  updateReplayEntries: (entries: Replay[]) => void;
}

const ReplayList: React.FC<ReplayListProps> = ({
  showdownName,
  spriteMap,
  updateReplayEntries,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [replayEntries, setReplayEntries] = useState<Replay[]>([]);

  useEffect(() => {
    updateReplayEntries(replayEntries);
  }, [replayEntries, updateReplayEntries]);

  const loadReplay = async () => {
    const url = inputRef.current?.value.split("?")[0];
    if (url && typeof url === "string") {
      const replayLog = await getReplayLog(url);
      const opponentTeam = parseOpponentPokemon(replayLog, showdownName);
      const win = parseWinner(replayLog, showdownName);

      const newReplayEntry: Replay = {
        url,
        opponentTeam,
        replayLog,
        win,
      };

      setReplayEntries((prevEntries) => [...prevEntries, newReplayEntry]);

      if (inputRef.current) inputRef.current.value = "";
      console.log(`Added replay: ${url}`);
    } else {
      console.error("invalid url input");
    }
  };

  const parseOpponentPokemon = (
    replayLog: string,
    showdownName: string
  ): string[] => {
    const log = replayLog.split("\n");
    let playerOne = log[0]
      .split("|j|")
      .filter((part) => part !== "")[0]
      .slice(1)
      .trim();
    const isPlayerOne: boolean = playerOne === showdownName ? true : false;
    const opponentPokemonString: string = isPlayerOne
      ? "|poke|p2|"
      : "|poke|p1|";

    const opponentPokemon: string[] = [];
    for (let i = 0; i < log.length; i++) {
      let count = 0;
      if (count >= 6) break;
      if (log[i].includes(opponentPokemonString)) {
        const lineArray = log[i].split("|")[3];
        let pokemonName = lineArray.split(",")[0];
        pokemonName = baseFormMapping[pokemonName] || pokemonName;
        opponentPokemon.push(pokemonName);
        count++;
      }
    }

    console.log(opponentPokemon);
    return opponentPokemon;
  };

  const parseWinner = (replayLog: string, showdownName: string): boolean => {
    const log = replayLog.split("\n");
    for (let i = 0; i < log.length; i++) {
      if (log[i].includes("|win|")) {
        const winner = log[i].split("|win|").filter((part) => part !== "")[0];
        if (winner === showdownName) return true;
        return false;
      }
    }
    return false;
  };

  const getSpritePath = (pokemonName: string): string => {
    const filename = spriteMap[pokemonName.toLowerCase()];
    return filename ? `/sprites/${filename}` : "/sprites/default.png";
  };

  return (
    <div className="replay-entries-container">
      <div className="header-container">
        <div className="result-header">Result</div>
        <div className="replay-links-header">Replay Links</div>
        <div className="opposing-team-header">Opposing Team</div>
        <div>Notes</div>
      </div>

      {replayEntries.map((entry, index) => (
        <div key={index} className="replay-entry">
          <div className="result">{entry.win === true ? "W" : "L"}</div>
          <div className="replay-links">{entry.url}</div>
          <div className="opposing-team">
            {entry.opponentTeam.map((pokemon, index) => (
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
