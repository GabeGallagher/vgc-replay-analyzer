// services/spriteMapService.ts
export const loadSpriteMap = async (): Promise<{ [name: string]: string }> => {
  try {
    const response = await fetch("/spriteMap.json");
    return response.ok ? await response.json() : {};
  } catch (error) {
    console.error("Error loading sprite map:", error);
    return {};
  }
};
