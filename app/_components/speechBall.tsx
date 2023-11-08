"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// 将 isEnabled 作为一个 prop 传入，允许父组件控制这个状态
const SpeechBall = ({ isEnabled = false }) => {
  // 默认值设置为 false
  const [volume, setVolume] = useState(0);
  const volumeThreshold = 20; // 声音的最小阈值
  const maxVolumeForScale = 200; // 对应最大变化幅度的音量值
  const maxScale = 1.25; // 最大缩放比例，原始大小的1.25倍

  let audioContext: AudioContext | null = null;
  let lastVolume = 0; // 用于存储上一帧的音量值
  const smoothingFactor = 0.8; // 平滑因子，决定了平滑的程度（0-1）

  useEffect(() => {
    async function setupAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
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

          // 如果功能启用且音量超过阈值，则计算球体的缩放比例
          if (isEnabled && smoothedVolume > volumeThreshold) {
            const volumeAboveThreshold = smoothedVolume - volumeThreshold;
            const volumeRatio = Math.min(
              volumeAboveThreshold / maxVolumeForScale,
              1
            );
            const scaleChange = 1 + volumeRatio * (maxScale - 1);
            setVolume(scaleChange);
          } else if (!isEnabled || smoothedVolume <= volumeThreshold) {
            // 如果功能禁用或音量低于阈值，随时间逐渐减小球体的大小
            setVolume((prevVolume) =>
              Math.max(prevVolume * smoothingFactor, 1)
            );
          }
        };

        const animate = () => {
          getVolume();
          requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error("访问麦克风时出错", error);
      }
    }

    setupAudio();

    // 清理函数，在组件卸载时关闭音频上下文
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isEnabled]); // 依赖项中包含 isEnabled，这样当 prop 更新时，useEffect 会重新运行

  // 动画变体，用于根据音量调整球体的缩放
  const ballVariants = {
    animate: {
      scale: volume, // 使用计算后的音量调整球体的缩放
    },
  };

  // 渲染函数，返回球体的可视化表示
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
