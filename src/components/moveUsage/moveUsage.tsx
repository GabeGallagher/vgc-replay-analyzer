import React, { useMemo } from "react";
import "./moveUsage.css";

const MoveUsage = ({ moveMap }) => {
  const buildMoveList = (moveData: Map<string, number>): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let moveTotal: number = 0;

    for (const moveCount of moveData.values()) {
      moveTotal += moveCount;
    }

    for (const [moveName, moveCount] of moveData.entries()) {
      elements.push(
        <div key={moveName} className="move">
          <div className="move-name">{moveName}</div>
          <div className="move-count">{moveCount}</div>
          <div className="move-percent">{((moveCount / moveTotal) * 100).toFixed(2)}%</div>
        </div>
      );
    }
    return elements;
  };

  const buildPokemonMoveContainer: JSX.Element[] = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (const [pokemonName, moveData] of moveMap.entries()) {
      elements.push(
        <div key={pokemonName} className="moves-container-header">
          <div className="pokemon-name">{pokemonName}</div>
          <div className="moves-container">{buildMoveList(moveData)}</div>
        </div>
      );
    }
    return elements;
  }, [moveMap]);

  return (
    <div>
      <h2>Move Usage Works!</h2>
      <div className="moves-container-parent">{buildPokemonMoveContainer}</div>
    </div>
  );
};

export default MoveUsage;
