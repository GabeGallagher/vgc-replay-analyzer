// components/Home.tsx
import React, { useState, useEffect } from "react";
import { Pokemon } from "../../interfaces/pokemon.model.ts";
import { loadSpriteMap } from "../../services/spriteMap.ts";
import { getPokepaste } from "../../services/pokepaste.ts";
import "./home.css";
import ReplayHeader from "../replayHeader/replayHeader.tsx";

const Home: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [spriteMap, setSpriteMap] = useState<{ [name: string]: string }>({});
  const [showdownName, setShowdownName] = useState<string>("");

  useEffect(() => {
    loadSpriteMap().then(setSpriteMap);
  }, []);

  const loadPaste = async (url: string) => {
    const htmlString = await getPokepaste(url);
    parsePokepasteHtml(htmlString);
  };

  const parsePokepasteHtml = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    setTeamName(doc.querySelector("h1")?.textContent?.trim() || "Untitled");

    const pokemonElements = Array.from(doc.querySelectorAll("article"));

    const newPokemonList = pokemonElements.map((article) =>
      parsePokemon(article.textContent || "")
    );
    setPokemonList(newPokemonList);
  };

  const parsePokemon = (article: string): Pokemon => {
    const parts = article.split(/[\n\t]+/).filter((part) => part !== "");
    return {
      name: parts[0].split(" @ ")[0].trim(),
      ability: parts[1].split(":")[1].trim(),
      tera: parts[3].split(":")[1].trim(),
      nature: parts[5].split(" ")[0],
      moves: [
        parts[6].slice(1).trim(),
        parts[7].slice(1).trim(),
        parts[8].slice(1).trim(),
        parts[9].slice(1).trim(),
      ],
    };
  };

  const getSpritePath = (pokemonName: string): string => {
    const filename = spriteMap[pokemonName.toLowerCase()];
    return filename ? `/sprites/${filename}` : "/sprites/default.png";
  };

  return (
    <div>
      <div>
        Showdown Name:
        <input
          type="text"
          className="showdown-name"
          value={showdownName}
          onChange={(e) => setShowdownName(e.target.value)}
        />
      </div>
      <div>
        Team Pokepaste:
        <input type="text" id="urlInput" />
        <button
          onClick={() =>
            loadPaste(
              (document.getElementById("urlInput") as HTMLInputElement).value
            )
          }
        >
          Load Paste
        </button>
      </div>
      <h2>{teamName}</h2>
      <div className="team-container">
        {pokemonList.map((pokemon, index) => (
          <div key={index}>
            <img src={getSpritePath(pokemon.name)} alt={pokemon.name} />
          </div>
        ))}
      </div>
      {pokemonList.length > 0 && (
        <ReplayHeader
          team={pokemonList}
          spriteMap={spriteMap}
          showdownName={showdownName}
        />
      )}
    </div>
  );
};

export default Home;
