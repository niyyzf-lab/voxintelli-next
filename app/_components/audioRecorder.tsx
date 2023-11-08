import { FC, useEffect, useRef, useState } from "react";

interface AudioRecorderProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const AudioRecorder: FC<AudioRecorderProps> = ({
  isRecording,
  setIsRecording,
}) => {
  const [transcript, setTranscript] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the SpeechRecognition instance
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.lang = "zh-CN";
      recognitionInstance.interimResults = true;
      recognitionInstance.maxAlternatives = 1; // Improve accuracy by limiting alternatives
      recognitionRef.current = recognitionInstance;
    }
  }, []);

  // Handle recognition results and restart the recognition if stopped
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        if (event.results[current].isFinal) {
          setTranscript(
            (prevTranscript) => prevTranscript + transcriptResult + " "
          );
          restartSilenceTimer();
        }
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };

      recognition.onerror = (event) => {
        // Handle errors, such as "no-speech" or "audio-capture", to improve recognition rates
      };
    }
  }, [isRecording]);

  // Start and stop recognition based on isRecording state
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      if (isRecording) {
        setTranscript("");
        recognition.start();
        restartSilenceTimer();
      } else {
        recognition.stop();
      }
    }
  }, [isRecording]);

  // Restart the silence timer whenever a result is received
  const restartSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const recognition = recognitionRef.current;
      if (recognition && isRecording) {
        recognition.stop();
        setIsRecording(false);
      }
    }, 10000); // Stop if no speech for 5 seconds
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.stop();
      }
      clearSilenceTimer();
    };
  }, []);

  return (
    <div>
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? "停止录音" : "开始录音"}
      </button>
      <p>识别文本：</p>
      <p>{transcript}</p>
    </div>
  );
};

export default AudioRecorder;
