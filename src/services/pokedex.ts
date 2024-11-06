export const loadPokedex = async (): Promise<string[]> => {
  try {
    const response = await fetch("/Pokedex.json");
    return response.ok ? await response.json() : {};
  } catch (error) {
    console.error("Error loading pokemon name list: ", error);
    return [];
  }
};
