import { Replay } from "../interfaces/replay.model";
import { baseFormMapping } from "./baseFormMapping.ts";
import { baseNameMapping } from "./baseNameMapping.ts";

export const parseReplayLog = (
  replayLog: string,
  showdownName: string,
  replay: Replay,
  moveMap: Map<string, Map<string, number>>
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
      else if (line.substring(0, 8) === "|switch|") {
        if (isGettingLeads) {
          setLeads(isPlayerOne, line, replay, leadCount);
          if (leadCount[0] === 4) isGettingLeads = false;
        } else setUsed(isPlayerOne, line, replay);
      } else if (line.substring(0, 14) === "|-terastallize") {
        setTerastal(line, isPlayerOne, replay);
      } else if (line.substring(0, 6) === "|move|") {
        moveMap = recordMove(line, isPlayerOne, replay, moveMap);
      } else if (line.substring(0, 5) === "|win|") {
        let winner = line.split("|")[2];
        if (winner === showdownName) replay.win = true;
      }
      rightIndex++;
      leftIndex = rightIndex;
    }
    return moveMap;
  }
  console.log(replay);
};

const checkPlayerOne = (playerName: string, showdownName: string): boolean => {
  return playerName === showdownName ? true : false;
};

const setLeads = (isPlayerOne: boolean, line: string, replay: Replay, leadCount: number[]) => {
  if (isPlayerOne && line.substring(0, 10) === "|switch|p1") {
    appendLeadArray(line, false, replay, leadCount, "|switch|p1");
  } else if (!isPlayerOne && line.substring(0, 10) === "|switch|p1") {
    appendLeadArray(line, true, replay, leadCount, "|switch|p1");
  } else if (isPlayerOne && line.substring(0, 10) === "|switch|p2") {
    appendLeadArray(line, true, replay, leadCount, "|switch|p2");
  } else if (!isPlayerOne && line.substring(0, 10) === "|switch|p2") {
    appendLeadArray(line, false, replay, leadCount, "|switch|p2");
  }
};

const appendLeadArray = (
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

const setUsed = (isPlayerOne: boolean, moveString: string, replay: Replay) => {
  const moveStringArray: string[] = moveString.split("|");
  const switchString: string = moveStringArray[2].slice(0, 2);
  const pokemonName: string = moveStringArray[3].split(",")[0];

  if ((isPlayerOne && switchString === "p1") || (!isPlayerOne && switchString === "p2")) {
    replay.used.push(pokemonName);
  } else if ((isPlayerOne && switchString === "p2") || (!isPlayerOne && switchString === "p1")) {
    replay.opponentUsed.push(pokemonName);
  }
};

const setTerastal = (line: string, isPlayerOne: boolean, replay: Replay) => {
  let lineArray = line.split("|");
  let pokemon: string = lineArray[2];
  let player = pokemon.split(":")[0].substring(0, 2);
  let pokemonName = pokemon.split(":")[1].trim();
  let tera: string = lineArray[3];

  if ((isPlayerOne && player === "p1") || (!isPlayerOne && player === "p2"))
    replay.terastallize = `${pokemonName}|${tera}`;
  else if ((isPlayerOne && player === "p2") || (!isPlayerOne && player === "p1"))
    replay.opponentTerastallize = `${pokemonName}|${tera}`;
};

const recordMove = (
  line: string,
  isPlayerOne: boolean,
  replay: Replay,
  moveMap: Map<string, Map<string, number>>
): Map<string, Map<string, number>> => {
  const moveLine: string[] = line.split("|");
  const player: string = moveLine[2].substring(0, 2);

  if ((isPlayerOne && player === "p1") || (!isPlayerOne && player === "p2")) {
    const unmappedName: string = moveLine[2].split(":")[1].trim();
    const pokemonName: string = baseNameMapping[unmappedName] || unmappedName;
    if (moveMap.has(pokemonName)) {
      const move: string = moveLine[3];
      const pokemonMoveUsedMap: Map<string, number> = moveMap.get(pokemonName)!;
      if (pokemonMoveUsedMap.has(move)) {
        const moveUse: number = pokemonMoveUsedMap.get(move)! + 1;
        pokemonMoveUsedMap.set(move, moveUse);
      } else {
        pokemonMoveUsedMap.set(move, 1);
      }
    } else {
      const move: string = moveLine[3];
      const pokemonMoveUsedMap: Map<string, number> = new Map();
      pokemonMoveUsedMap.set(move, 1);
      moveMap.set(pokemonName, pokemonMoveUsedMap);
    }
  }
  return moveMap;
};

export const getReplayId = (url: string): string => {
  const urlParts = url.split("/");
  return urlParts[3].split("?")[0];
};
