"use client";
import { Avatar, Button, Textarea } from "@nextui-org/react";
import axios from "axios";
import { useState } from "react";
const apiKey = "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";

type Message = {
  role: string;
  content: string;
};

export default function Home() {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const onChat = async (text: string) => {
    let list = messageList?.length ? [...messageList] : [];
    list.push({ role: "user", content: text });
    var data = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: list,
    });
    var config = {
      method: "post",
      url: "https://zwb.life/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };
    setMessageList(list);
    console.log(list);
    axios(config)
      .then(function (response) {
        const data_str = response.data.choices[0].message.content;
        console.log(data_str);
        list.push({ role: "system", content: data_str });
        setMessageList(list);
        console.log(list);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const onTextToSpeech = () => {
    var data = JSON.stringify({
      model: "tts-1",
      input: "今天天气真好",
      voice: "alloy",
    });

    var config = {
      method: "post",
      url: "https://zwb.life/v1/audio/speech",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      responseType: "blob", // This specifies that the response should be a blob
      data: data,
    };

    axios(config)
      .then(function (response) {
        var blob = new Blob([response.data], { type: "audio/mp3" });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "test.mp3";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div className=" flex justify-center items-center h-screen w-full bg-black flex-col p-20">
      <div className=" bg-white flex-1 w-full rounded-xl px-4">
        <ul className=" flex flex-col gap-2">
          {messageList.map((item, INDEX) => {
            return (
              <li
                className={
                  item.role === "system"
                    ? "bg-red-500 flex flex-row-reverse items-center"
                    : "flex items-center"
                }
                key={INDEX}
              >
                <Avatar name={item.role} className="w-10 h-10"></Avatar>
                <Textarea
                  className={item.role !== "system" ? " bg-black" : ""}
                  value={item.content}
                />
              </li>
            );
          })}
        </ul>
        <input onChange={(e) => setInputValue(e.target.value)}></input>
        <Button onClick={() => onChat(inputValue)}>发生</Button>
        <Button onClick={onTextToSpeech}>转语音</Button>
      </div>
    </div>
  );
}
