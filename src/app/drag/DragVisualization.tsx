"use client";
// components/DragVisualization.tsx
import React, { useState, useRef, useEffect } from "react";
import useDragDetector from "./useDragDetector";

interface DisplayInfo {
  direction: number;
  speed: number;
  position: { x: number; y: number };
}

const DragVisualization: React.FC = () => {
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({
    direction: 0,
    speed: 0,
    position: { x: 0.5, y: 0.5 },
  });
  const [useRAF, setUseRAF] = useState<boolean>(true);
  const [velocityScale, setVelocityScale] = useState<number>(0.1);
  const [decelerationFactor, setDecelerationFactor] = useState<number>(0.95);
  const [maxSpeed, setMaxSpeed] = useState<number>(1);
  const [areaSize, setAreaSize] = useState({ width: 300, height: 200 });

  const handleStateChange = (newState: DisplayInfo) => {
    setDisplayInfo({
      direction: newState.direction,
      speed: newState.speed,
      position: newState.position,
    });
  };

  const { eventHandlers, startAnimation, stopAnimation, containerRef } =
    useDragDetector(
      handleStateChange,
      useRAF,
      velocityScale,
      decelerationFactor,
      maxSpeed
    );

  useEffect(() => {
    stopAnimation();
    startAnimation();
  }, [
    useRAF,
    velocityScale,
    decelerationFactor,
    maxSpeed,
    startAnimation,
    stopAnimation,
  ]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setAreaSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
      >
        드래그 감지 데모
      </h2>
      <div
        ref={containerRef}
        {...eventHandlers}
        style={{
          width: "100%",
          height: "200px",
          border: "2px solid #333",
          position: "relative",
          overflow: "hidden",
          cursor: "move",
          margin: "0 auto",
          touchAction: "none", // 모바일에서 스크롤 방지
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "0",
            height: "0",
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: "20px solid red",
            left: `${displayInfo.position.x * 100}%`,
            top: `${displayInfo.position.y * 100}%`,
            transform: `translate(-50%, -50%) rotate(${displayInfo.direction}deg)`,
            transition: "transform 0.1s linear",
          }}
        />
      </div>
      <div>
        <p>
          방향: <span>{displayInfo.direction.toFixed(2)}</span>°
        </p>
        <p>
          속도: <span>{displayInfo.speed.toFixed(4)}</span>
        </p>
        <p>
          위치: X: <span>{displayInfo.position.x.toFixed(4)}</span>, Y:{" "}
          <span>{displayInfo.position.y.toFixed(4)}</span>
        </p>
        <p>
          영역 크기: {areaSize.width} x {areaSize.height} 픽셀
        </p>
      </div>
      <div style={{ marginTop: "10px" }}>
        <label style={{ marginRight: "16px" }}>
          <input
            type="radio"
            name="animationType"
            value="raf"
            checked={useRAF}
            onChange={() => setUseRAF(true)}
          />{" "}
          requestAnimationFrame
        </label>
        <label>
          <input
            type="radio"
            name="animationType"
            value="interval"
            checked={!useRAF}
            onChange={() => setUseRAF(false)}
          />{" "}
          setInterval
        </label>
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>
          속도 스케일:
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={velocityScale}
            onChange={(e) => setVelocityScale(parseFloat(e.target.value))}
            style={{ width: "200px", marginLeft: "10px" }}
          />
          {velocityScale.toFixed(2)}
        </label>
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>
          감속 강도:
          <input
            type="range"
            min="0.7"
            max="0.999"
            step="0.001"
            value={decelerationFactor}
            onChange={(e) => setDecelerationFactor(parseFloat(e.target.value))}
            style={{ width: "200px", marginLeft: "10px" }}
          />
          {decelerationFactor.toFixed(3)}
        </label>
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>
          최대 속도:
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={maxSpeed}
            onChange={(e) => setMaxSpeed(parseFloat(e.target.value))}
            style={{ width: "200px", marginLeft: "10px" }}
          />
          {maxSpeed.toFixed(1)}
        </label>
      </div>
    </div>
  );
};

export default DragVisualization;
