import { NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import path from "path";
import os from "os";
import fs from "fs";

export async function POST(req: Request) {
  try {
    const { text, voice = "en-US-GuyNeural" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text parameter is required" }, { status: 400 });
    }

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tempAudioPath = path.join(os.tmpdir(), `tts-${id}.mp3`);
    const tempSubPath = `${tempAudioPath}.json`;

    const tts = new EdgeTTS({
      voice,
      lang: "en-US",
      outputFormat: "audio-24khz-96kbitrate-mono-mp3",
      saveSubtitles: true,
      timeout: 15000,
    });

    await tts.ttsPromise(text, tempAudioPath);

    let audioBuffer: Buffer;
    let wordBoundaries: Array<{ word: string; startMs: number; durationMs: number }> = [];

    if (fs.existsSync(tempAudioPath)) {
      audioBuffer = fs.readFileSync(tempAudioPath);
      try {
        fs.unlinkSync(tempAudioPath);
      } catch (e) {
        // ignore
      }
    } else {
      throw new Error("Failed to generate audio file");
    }

    if (fs.existsSync(tempSubPath)) {
      try {
        const subData = JSON.parse(fs.readFileSync(tempSubPath, "utf-8"));
        if (Array.isArray(subData)) {
          wordBoundaries = subData.map((item: any) => ({
            word: item.part || "",
            startMs: typeof item.start === "number" ? item.start : 0,
            durationMs: typeof item.end === "number" && typeof item.start === "number" ? item.end - item.start : 0,
          }));
        }
        fs.unlinkSync(tempSubPath);
      } catch (e) {
        // ignore
      }
    }

    const audioBase64 = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;

    return NextResponse.json({ audioBase64, wordBoundaries });
  } catch (error: any) {
    console.error("node-edge-tts API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate speech" }, { status: 500 });
  }
}
