import axios from "axios";
import FormData from "form-data";
export const sendAudioToOpenAI = async (audioFile: File) => {
  try {
    const formData = new FormData();
    formData.append("file", audioFile, audioFile.name);
    formData.append("model", "whisper-1");

    // Replace 'TOKEN' with your actual OpenAI API token
    const token = process.env.OPENAI_API_KEY;

    const response = await axios.post(
      "https://zwb.life/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Handle the response from the server
    console.log(response.data);
  } catch (error) {
    console.error("Error sending audio to OpenAI", error);
  }
};
