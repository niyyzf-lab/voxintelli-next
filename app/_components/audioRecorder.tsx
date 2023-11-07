"use client";
import { Button } from "@nextui-org/react";
import Api2d from "api2d";
import React, { useRef, useState } from "react";
import { AiOutlineAudio } from "react-icons/ai";

interface SpeechToTextOptions {
  file: File;
  language: string;
  moderation: boolean;
  moderation_stop: boolean;
  apiKey: string;
}

const AudioRecorder: React.FC = () => {
  const [audioURL, setAudioURL] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const toggleRecording = async () => {
    setIsRecording((currentStatus) => !currentStatus);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    setAudioURL("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      });

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing the microphone", error);
    }
  };

  const stopRecording = async () => {
    mediaRecorderRef.current?.stop();
  };

  const handleAudioUpload = async () => {
    if (!audioURL) return;
    try {
      const audioBlob = await urlToBlob(audioURL);
      const audioFile = new File([audioBlob], "audio_recording.wav", {
        type: "audio/wav",
      });
      const response = await speechToText({
        file: audioFile,
        language: "zh-CN",
        moderation: false,
        moderation_stop: false,
        apiKey: "fk204878-8B2CVJYFsTZkxlwk20qCKyAsyr7KwVem",
      });
      console.log(response);
    } catch (error) {
      console.error("Speech to text failed", error);
    }
  };

  async function urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  }

  async function speechToText(options: SpeechToTextOptions): Promise<any> {
    const { file, language, moderation, moderation_stop, apiKey } = options;
    const api = new Api2d(apiKey, "https://openai.api2d.net", 60000);
    return api.speechToText({
      file: file,
      language: language,
      moderation: moderation,
      moderation_stop: moderation_stop,
    });
  }

  return (
    <div>
      <Button
        color={!isRecording ? "success" : "danger"}
        onClick={toggleRecording}
        className="record-button"
      >
        {isRecording ? "Stop" : "Start"} Recording
        <AiOutlineAudio />
      </Button>
      {audioURL && (
        <Button color="primary" onClick={handleAudioUpload}>
          Upload and Transcribe
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;
