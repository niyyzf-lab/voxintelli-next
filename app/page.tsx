"use client";
import { useEffect, useState } from "react";
import AudioRecorder from "./_components/audioRecorder";
import SpeechBall from "./_components/speechBall";

export default function Home() {
  // 状态用于追踪是否正在录音
  const [isRecording, setIsRecording] = useState(false);

  // 将 isRecording 状态和 setIsRecording 方法传递给 AudioRecorder 和 SpeechBall
  useEffect(() => {
    console.log(isRecording);
  }, [isRecording]);
  return (
    <div className="flex justify-center items-center h-screen w-full bg-black flex-col p-20">
      <SpeechBall isEnabled={isRecording} />
      <AudioRecorder
        isRecording={isRecording}
        setIsRecording={setIsRecording}
      />
    </div>
  );
}
