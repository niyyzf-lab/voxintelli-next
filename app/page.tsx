import AudioRecorder from "./_components/audioRecorder";
import SpeechBall from "./_components/speechBall";
export default function Home() {
  return (
    <div className=" flex justify-center items-center h-screen w-full bg-black flex-col p-20">
      <SpeechBall />
      <AudioRecorder />
    </div>
  );
}
