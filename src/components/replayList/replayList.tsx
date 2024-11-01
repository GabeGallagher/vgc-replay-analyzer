import React, { useEffect, useRef, useState } from "react";
import "./replayList.css";
import { getReplayLog } from "../../services/replay.ts";
import { Replay } from "../../interfaces/replay.model.ts";
import { baseFormMapping } from "../../services/baseFormMapping.ts";

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

  useEffect(() => {
    updateReplayEntries(replayEntries);
  }, [replayEntries, updateReplayEntries]);

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

      if (inputRef.current) inputRef.current.value = "";
      console.log(`Added replay: ${url}`);
    } else {
      console.error("invalid url input");
    }
  };

  const parseReplayLog = (
    replayLog: string,
    showdownName: string,
    replay: Replay
  ) => {
    let leftIndex: number = 0;
    let rightIndex: number = 0;
    let isPlayerOne: boolean = false;
    let opponentPlayerString: string = "";
    let isGettingLeads: boolean = false;
    let leadCount: number[] = [0];

    while (rightIndex < replayLog.length) {
      rightIndex++;
      let checkChar = `${replayLog[rightIndex]}`;
      if (checkChar === "\n") {
        let line = replayLog.slice(leftIndex, rightIndex);
        if (line.substring(0, 3) === "|j|" && opponentPlayerString === "") {
          isPlayerOne = checkPlayerOne(line.slice(4), showdownName);
          opponentPlayerString = isPlayerOne ? "|poke|p2|" : "|poke|p1|";
        } else if (line.substring(0, 9) === opponentPlayerString) {
          let pokemonName: string = line.split("|")[3].split(",")[0].trim();
          pokemonName = baseFormMapping[pokemonName] || pokemonName;
          replay.opponentTeam.push(pokemonName);
        } else if (line === "|start") isGettingLeads = true;
        else if (isGettingLeads && line.substring(0, 8) === "|switch|") {
          if (isPlayerOne && line.substring(0, 10) === "|switch|p1") {
            setLeads(line, false, replay, leadCount, "|switch|p1");
          } else if (!isPlayerOne && line.substring(0, 10) === "|switch|p1") {
            setLeads(line, true, replay, leadCount, "|switch|p1");
          } else if (isPlayerOne && line.substring(0, 10) === "|switch|p2") {
            setLeads(line, true, replay, leadCount, "|switch|p2");
          } else if (!isPlayerOne && line.substring(0, 10) === "|switch|p2") {
            setLeads(line, false, replay, leadCount, "|switch|p2");
          }
          if (leadCount[0] === 4) isGettingLeads = false;
        } else if (line.substring(0, 14) === "|-terastallize") {
          let lineArray = line.split("|");
          let pokemon: string = lineArray[2];
          let player = pokemon.split(":")[0].substring(0, 2);
          let pokemonName = pokemon.split(":")[1].trim();
          let tera: string = lineArray[3];

          if (
            (isPlayerOne && player === "p1") ||
            (!isPlayerOne && player === "p2")
          )
            replay.terastallize = `${pokemonName}|${tera}`;
          else if (
            (isPlayerOne && player === "p2") ||
            (!isPlayerOne && player === "p1")
          )
            replay.opponentTerastallize = `${pokemonName}|${tera}`;
        } else if (line.substring(0, 5) === "|win|") {
          let winner = line.split("|")[2];
          if (winner === showdownName) replay.win = true;
        }
        rightIndex++;
        leftIndex = rightIndex;
      }
    }
    console.log(replay);
  };

  const setLeads = (
    line: string,
    evalOpponent: boolean,
    replay: Replay,
    leadCount: number[],
    lead: string
  ) => {
    let pokemonName: string = line.split("|")[3].split(",")[0].trim();
    let indexMod: number = lead === "|switch|p1" ? 0 : 2;
    if (evalOpponent) {
      replay.opponentLead[leadCount[0] - indexMod] = pokemonName;
      replay.opponentUsed.push(pokemonName);
    } else {
      replay.lead[leadCount[0] - indexMod] = pokemonName;
      replay.used.push(pokemonName);
    }
    leadCount[0] = leadCount[0] + 1;
  };

  const checkPlayerOne = (
    playerName: string,
    showdownName: string
  ): boolean => {
    return playerName === showdownName ? true : false;
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
