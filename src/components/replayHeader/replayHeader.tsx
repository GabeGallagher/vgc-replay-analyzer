import React from "react";
import './replayHeader.css'

interface ReplayHeaderProps {
    setView: (view: string) => void;
}

const ReplayHeader: React.FC<ReplayHeaderProps> = ({setView}) => {
  return (
    <div className="replay-header-container">
      <h2 onClick={() => setView("replayList")}>Replays</h2>
      <h2 onClick={() => setView("usageStats")}>Usage Stats</h2>
      <h2 onClick={() => setView("matchupStats")}>Matchup Stats</h2>
      <h2 onClick={() => setView("moveUsage")}>Move Usage</h2>
    </div>
  );
};

export default ReplayHeader;
