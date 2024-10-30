// services/pokepasteService.ts
export const getPokepaste = async (url: string): Promise<string> => {
    const parts = url.split('/').filter(part => part !== '');
    const pasteCode = `/${parts[parts.length - 1]}`;
    
    try {
      const response = await fetch(pasteCode);
      return response.ok ? await response.text() : '';
    } catch (error) {
      console.error('Error fetching Pokepaste:', error);
      return '';
    }
  };
  