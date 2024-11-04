import React, { useMemo } from "react";

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
          {moveName} {moveCount} {((moveCount / moveTotal) * 100).toFixed(2)}%
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
          {pokemonName}
          <div className="moves-container">{buildMoveList(moveData)}</div>
        </div>
      );
    }
    return elements;
  }, [moveMap]);

  return (
    <div>
      <h2>Move Usage Works!</h2>
      <div>{buildPokemonMoveContainer}</div>
    </div>
  );
};

export default MoveUsage;
