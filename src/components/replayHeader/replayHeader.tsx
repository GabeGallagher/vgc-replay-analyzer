import React, { useState } from "react";
import "./replayHeader.css";
import UsageStats from "../usageStats/usageStats.tsx";
import { loadUsageStats } from "../../services/usageStatsLoader.ts";
import ReplayList from "../replayList/replayList.tsx";
import MatchupStats from "../matchupStats/matchupStats.tsx";
import MoveUsage from "../moveUsage/moveUsage.tsx";
import { Replay } from "../../interfaces/replay.model.ts";

const ReplayHeader = ({ team, spriteMap, showdownName }) => {
  const [view, setView] = useState<string>("replayList");
  const [replayEntries, setReplayEntries] = useState<Replay[]>([]);
  let usageMap = new Map();

  const handleViewChange = (view: string) => {
    switch (view) {
      case "replayList":
        setView("replayList");
        break;

      case "usageStats":
        usageMap = loadUsageStats(replayEntries, team);
        setView("usageStats");
        break;

      case "matchupStats":
        setView("matchupStats");
        break;

      case "moveUsage":
        setView("moveUsage");
        break;

      default:
        console.error(`Invalid view: ${view}`);
        break;
    }
  };

  const updateReplayEntries = (entries: Replay[]) => {
    setReplayEntries(entries);
  };

  return (
    <div>
      <div className="replay-header-container">
        <h2 onClick={() => handleViewChange("replayList")}>Replays</h2>
        <h2 onClick={() => handleViewChange("usageStats")}>Usage Stats</h2>
        <h2 onClick={() => handleViewChange("matchupStats")}>Matchup Stats</h2>
        <h2 onClick={() => handleViewChange("moveUsage")}>Move Usage</h2>
      </div>
      {view === "replayList" && team.length > 0 && (
        <ReplayList
          showdownName={showdownName}
          spriteMap={spriteMap}
          updateReplayEntries={updateReplayEntries}
          replayEntries={replayEntries}
        />
      )}
      {view === "matchupStats" && (
        <MatchupStats replayEntries={replayEntries} />
      )}
      {view === "moveUsage" && <MoveUsage replayEntries={replayEntries} />}
      {view === "usageStats" && (
        <UsageStats
          replayEntries={replayEntries}
          team={team}
          usageMap={usageMap}
        />
      )}
    </div>
  );
};

export default ReplayHeader;
