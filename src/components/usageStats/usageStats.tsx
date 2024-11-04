import React, { useEffect, useMemo, useState } from "react";
import "./usageStats.css";
import { LeadNode } from "../../interfaces/leadNode";

const UsageStats = ({ replayEntries, team, usageMap, spriteMap }) => {
  const [mostCommonLeadTree, updateCommonLeadTree] = useState<LeadNode>({});
  const [mostSuccessfulLeadTree, updateSuccessfulLeadTree] = useState<LeadNode>({});
  const [commonLeadArray, updateCommonLeadArray] = useState<[string, number][]>([]);
  const [successfulLeadArray, updateSuccessfulLeadArray] = useState<[string, number][]>([]);

  useEffect(() => {
    const newCommonLeadArray: [string, number][] = [];
    const newSuccessfulLeadArray: [string, number][] = [];

    buildLeadArray(mostCommonLeadTree, newCommonLeadArray);
    buildLeadArray(mostSuccessfulLeadTree, newSuccessfulLeadArray);

    updateCommonLeadArray(newCommonLeadArray);
    updateSuccessfulLeadArray(newSuccessfulLeadArray);
  }, [mostCommonLeadTree, mostSuccessfulLeadTree]);

  useEffect(() => {
    updateLeadPairStats();
  }, [replayEntries]);

  const getSpritePath = (pokemonName: string): string => {
    const filename = spriteMap[pokemonName.toLowerCase()];
    return filename ? `/sprites/${filename}` : "/sprites/default.png";
  };

  const buildUsageWinStats: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (const [pokemonName, usageData] of usageMap.entries()) {
      elements.push(
        <div key={pokemonName} className="pokemon-usage-stats-container">
          <img src={getSpritePath(pokemonName)} alt={pokemonName} />
          <p>
            won {usageData.used[1]} of {usageData.used[0]} games
          </p>
          <p>{((usageData.used[1] / usageData.used[0]) * 100).toFixed(2)}%</p>
        </div>
      );
    }
    return elements;
  }, [usageMap]);

  const buildUsageTeraStats: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (const [pokemonName, usageData] of usageMap.entries()) {
      elements.push(
        <div key={pokemonName} className="pokemon-usage-stats-container">
          <img src={getSpritePath(pokemonName)} alt={pokemonName} />
          {usageData.tera[0] > 0 && (
            <p>
              won {usageData.tera[1]} of {usageData.tera[0]} games using tera
            </p>
          )}
          {usageData.tera[0] > 0 ? (
            <p>{((usageData.tera[1] / usageData.tera[0]) * 100).toFixed(2)}%</p>
          ) : (
            <p>Did not Terastallize</p>
          )}
        </div>
      );
    }
    return elements;
  }, [usageMap]);

  const updateLeadPairStats = () => {
    const leadWinMap = new Map(); // key={[Mon1Name, Mon2Name]}val={used, wins}

    for (const replay of replayEntries) {
      const sortLeadArray = replay.lead.sort();
      const leadString = `${sortLeadArray[0]}|${sortLeadArray[1]}`;
      const winCount = replay.win ? 1 : 0;
      const [usedCount, totalWins] = leadWinMap.get(leadString) || [0, 0];

      leadWinMap.set(leadString, [usedCount + 1, totalWins + winCount]);
    }

    for (const [leadPair, pairStats] of leadWinMap.entries()) {
      const usageCount: number = pairStats[0];
      const winPercentage: number = pairStats[1] / usageCount;

      updateCommonLeadTree((currentTree) => insertLead(currentTree, [leadPair, usageCount]));
      updateSuccessfulLeadTree((currentTree) => insertLead(currentTree, [leadPair, winPercentage]));
    }
  };

  const insertLead = (rootNode: LeadNode | null, lead: [string, number]): LeadNode => {
    if (
      rootNode === undefined ||
      rootNode === null ||
      rootNode.val === undefined ||
      rootNode.val === null
    ) {
      return { val: lead[1], lead: lead[0] };
    } else {
      if (lead[1] <= rootNode.val!) {
        rootNode.left = insertLead(rootNode.left || null, lead);
      } else if (lead[1] > rootNode.val!) {
        rootNode.right = insertLead(rootNode.right || null, lead);
      }
    }
    return rootNode;
  };

  const buildLeadArray = (rootNode: LeadNode | null, leadArray: [string, number][]) => {
    if (
      rootNode === undefined ||
      rootNode === null ||
      rootNode.val === undefined ||
      rootNode.val === null
    )
      return rootNode;
    else {
      buildLeadArray(rootNode.left || null, leadArray);
      buildLeadArray(rootNode.right || null, leadArray);
      leadArray.push([rootNode.lead!, rootNode.val!]);
    }
  };

  const buildCommonLeadPairStats: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    updateLeadPairStats();

    for (const lead of commonLeadArray) {
      const pair = lead[0].split("|");
      elements.push(
        <div key={`${lead[0]}`} className="pokemon-usage-stats-container">
          <img src={getSpritePath(pair[0])} alt={pair[0]} />
          <img src={getSpritePath(pair[1])} alt={pair[1]} />
          <p>lead {lead[1]} times</p>
        </div>
      );
    }
    return elements;
  }, [usageMap, commonLeadArray]);

  const buildUsageLeadWinStats: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (const [pokemonName, usageData] of usageMap.entries()) {
      elements.push(
        <div key={pokemonName} className="pokemon-usage-stats-container">
          <img src={getSpritePath(pokemonName)} alt={pokemonName} />
          {usageData.lead[0] > 0 && (
            <p>
              won {usageData.lead[1]} of {usageData.lead[0]} games using lead
            </p>
          )}
          {usageData.lead[0] > 0 ? (
            <p>{((usageData.lead[1] / usageData.lead[0]) * 100).toFixed(2)}%</p>
          ) : (
            <p>Did not Lead</p>
          )}
        </div>
      );
    }
    return elements;
  }, [usageMap]);

  const buildBestLeadPairStats: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (const lead of successfulLeadArray) {
      const pair = lead[0].split("|");
      elements.push(
        <div key={`${lead[0]}`} className="pokemon-usage-stats-container">
          <img src={getSpritePath(pair[0])} alt={pair[0]} />
          <img src={getSpritePath(pair[1])} alt={pair[1]} />
          <p>has a winrate of {(lead[1] * 100).toFixed(2)}%</p>
        </div>
      );
    }
    return elements;
  }, [usageMap, successfulLeadArray]);

  return (
    <div className="usage-stats-container">
      <h2>Usage and Win% Stats</h2>
      <div>{buildUsageWinStats}</div>

      <h2>Usage of Tera and Win% Stats</h2>
      <div>{buildUsageTeraStats}</div>

      <h2>Most Common Lead Pairs</h2>
      <div>{buildCommonLeadPairStats}</div>

      <h2>Lead and Win% Stats</h2>
      <div>{buildUsageLeadWinStats}</div>

      <h2>Best Lead Pairs</h2>
      <div>{buildBestLeadPairStats}</div>
    </div>
  );
};

export default UsageStats;
