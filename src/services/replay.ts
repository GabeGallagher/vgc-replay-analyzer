export const getReplayLog = async (url: string): Promise<string> => {
  const logCode = url.split("?")[0];
  try {
    const response = await fetch(`${logCode}.log`);
    return response.ok ? await response.text() : "";
  } catch (error) {
    console.error("Error fetching replay log: ", error);
    return "";
  }
};
