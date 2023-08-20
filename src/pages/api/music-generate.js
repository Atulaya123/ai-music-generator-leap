import { Leap } from "@leap-ai/sdk";

export default async function handler(req, res) {
  const leap = new Leap(process.env.LEAP_API_KEY);

  try {
    const { prompt } = req.body;

    // Submit music generation
    const { data, error } = await leap.music.submitMusicGenerationJob({
      prompt: prompt,
      duration: 16,
      mode: "music",
    });

    console.log("SUBMIT ", data, error);

    // Check if the music is generated or not
    const { data: output, error: err } = await leap.music.listMusicGenerationJobs();

    console.log("OUTPUT ", output[output.length - 1], err);

    let song = output[output.length - 1];

    // Check if the music is generated or not
    while (song.state !== "finished") {
      // Wait every 15 seconds
      await new Promise((resolve) => setTimeout(resolve, 15000));

      if (song.state === "failed") {
        res.status(500).json({ error: "AI song generation failed" });
      }

      const { data: output, error: err } = await leap.music.listMusicGenerationJobs();
      console.log("OUTPUT ", output[output.length - 1], err);
      song = output[output.length - 1];
    }

    res.status(200).json({ music: song?.media_uri });
  } catch (error) {
    console.error("AI song generation failed:", error);
    res.status(500).json({ error: "AI song generation failed" });
  }
}