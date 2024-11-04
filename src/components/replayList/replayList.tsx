import React, { useEffect, useRef, useState } from "react";
import "./replayList.css";
import { getReplayLog } from "../../services/replay.ts";
import { Replay } from "../../interfaces/replay.model.ts";
import { getReplayId, parseReplayLog } from "../../services/replayParser.ts";

interface ReplayListProps {
  showdownName: string;
  spriteMap: { [name: string]: string };
  updateReplayEntries: (entries: Replay[]) => void;
  replayEntries: Replay[];
}

const ReplayList: React.FC<ReplayListProps> = ({
  showdownName,
  spriteMap,
  updateReplayEntries,
  replayEntries,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      const storedReplays: Replay[] = JSON.parse(
        localStorage.getItem("replays") || "[]"
      );
      const newReplaysFromStorage: Replay[] = [];
      for (const replay of storedReplays) {
        const exists = replayEntries.some(
          (existingReplay) =>
            getReplayId(existingReplay.url) === getReplayId(replay.url)
        );
        if (!exists) newReplaysFromStorage.push(replay);
      }
      updateReplayEntries([...replayEntries, ...newReplaysFromStorage]);
      setIsLoaded(true);
      console.log(replayEntries);
    }
  }, [isLoaded, showdownName, spriteMap, updateReplayEntries, replayEntries]);

  const loadReplay = async () => {
    const url = inputRef.current?.value.split("?")[0];
    if (url && typeof url === "string") {
      let replayLog = await getReplayLog(url);

      const newReplayEntry: Replay = {
        url,
        replayLog,
        opponentTeam: [],
        lead: ["", ""],
        used: [],
        opponentLead: ["", ""],
        opponentUsed: [],
        win: false,
      };
      parseReplayLog(replayLog, showdownName, newReplayEntry);

      updateReplayEntries([...replayEntries, newReplayEntry]);

      const storedReplays = [...replayEntries, newReplayEntry];
      localStorage.setItem("replays", JSON.stringify(storedReplays));

      if (inputRef.current) inputRef.current.value = "";
      console.log(`Added replay: ${url}`);
      console.log(replayEntries);
    } else {
      console.error("invalid url input");
    }
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

      {replayEntries.map((replay, index) => (
        <div key={index} className="replay-entry">
          <div className="result">{replay.win === true ? "W" : "L"}</div>
          <div className="replay-links">{replay.url}</div>
          <div className="opposing-team">
            {replay.opponentTeam.map((pokemon, index) => (
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
