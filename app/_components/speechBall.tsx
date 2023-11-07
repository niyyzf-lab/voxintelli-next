"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SpeechBall = () => {
  const [volume, setVolume] = useState(0);
  const volumeThreshold = 20; // 声音的最小阈值
  const maxVolumeForScale = 200; // 对应最大变化幅度的音量值
  const maxScale = 1.25; // 最大缩放比例，原始大小的1.5倍

  let audioContext: AudioContext | null = null;
  let lastVolume = 0; // 用于存储上一帧的音量值
  const smoothingFactor = 0.8; // 平滑因子，决定了平滑的程度（0-1）

  useEffect(() => {
    async function setupAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 512;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const getVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          let average = sum / dataArray.length;

          // 应用简单的低通滤波器来平滑音量值
          const smoothedVolume =
            lastVolume * smoothingFactor + average * (1 - smoothingFactor);
          lastVolume = smoothedVolume; // 更新上一音量值

          // 如果音量超过阈值，则计算球体的缩放比例
          if (smoothedVolume > volumeThreshold) {
            const volumeAboveThreshold = smoothedVolume - volumeThreshold;
            const volumeRatio = Math.min(
              volumeAboveThreshold / maxVolumeForScale,
              1
            );
            const scaleChange = 1 + volumeRatio * (maxScale - 1);
            setVolume(scaleChange);
          }
        };

        const animate = () => {
          getVolume();
          requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error("Error accessing the microphone", error);
      }
    }

    setupAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const ballVariants = {
    animate: {
      scale: volume, // 使用计算后的音量调整球体的缩放
    },
  };

  return (
    <motion.div
      variants={ballVariants}
      animate="animate"
      style={{
        width: 350,
        height: 350,
        borderRadius: "50%",
        backgroundColor: "white",
        margin: "auto",
      }}
    />
  );
};

export default SpeechBall;
