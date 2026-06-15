import Webcam from "react-webcam";
import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const webcamRef = useRef(null);
  const outputRef = useRef(null);
  const socketRef = useRef(null);

  const [backgroundCaptured, setBackgroundCaptured] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    socketRef.current = io("http://127.0.0.1:5000");

    socketRef.current.on("processed_frame", (data) => {
      if (outputRef.current) {
        outputRef.current.src = data;
      }
    });

    return () => socketRef.current.disconnect();
  }, []);

  const setBackground = () => {
    let count = 3;

    setCountdown(count);

    const timer = setInterval(() => {
      count--;

      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);

        const image = webcamRef.current?.getScreenshot();

        if (image) {
          socketRef.current.emit("set_background", image);

          setTimeout(() => {
            setBackgroundCaptured(true);
          }, 500);
        }

        setCountdown(null);
      }
    }, 1000);
  };

  const sendFrame = () => {
    if (!backgroundCaptured) return;
    if (!webcamRef.current) return;

    const image = webcamRef.current.getScreenshot();

    if (!image) return;

    socketRef.current.emit("frame", image);
  };

  useEffect(() => {
    const interval = setInterval(sendFrame, 80);

    return () => clearInterval(interval);
  }, [backgroundCaptured]);

  return (
    <div
      className="
        min-h-screen
        text-white
        flex
        flex-col
        items-center
        relative
        overflow-hidden
      "
      style={{
        background:
          "radial-gradient(circle at top, #312e81 0%, #020617 50%, #000000 100%)",
      }}
    >
      {/* Header */}
      <div className="text-center mt-4">
        <h1 className="text-5xl font-extrabold drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
          🪄 Harry Potter Invisible Cloak
        </h1>

        <p className="text-slate-400 mt-3">
          Turn a red cloth invisible using OpenCV + React + Flask
        </p>
      </div>

      {/* Status */}
      <div className="mt-5">
        {!backgroundCaptured ? (
          <div className="bg-red-500 px-5 py-2 rounded-full">
            🔴 Background Not Captured
          </div>
        ) : (
          <div className="bg-green-500 px-5 py-2 rounded-full">
            ✅ Background Captured Successfully
          </div>
        )}
      </div>

      {/* Countdown */}
      {countdown && (
        <div className="mt-6 text-center">
          <div className="text-8xl font-bold text-purple-400 animate-pulse">
            {countdown}
          </div>

          <p className="text-slate-300 mt-2">
            Move out of the camera view...
          </p>
        </div>
      )}

      {/* Capture Button */}
      {!backgroundCaptured && (
        <button
          onClick={setBackground}
          className="mt-5 px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-lg"
        >
          Capture Background
        </button>
      )}

      {/* BEFORE CAPTURE */}
      {!backgroundCaptured && (
        <div className="mt-8 flex justify-center items-start gap-8">
          {/* Instructions */}
          <div
            className="
              bg-white/10
              backdrop-blur-lg
              border
              border-white/20
              p-6
              rounded-3xl
              shadow-2xl
              w-[350px]
            "
          >
            <h2 className="text-2xl font-bold mb-4">
              📜 Instructions
            </h2>

            <ul className="space-y-4 text-slate-200">
              <li>1️⃣ Keep the scene empty</li>
              <li>2️⃣ Click Capture Background</li>
              <li>3️⃣ Move away during countdown</li>
              <li>4️⃣ Bring a red cloth</li>
              <li>5️⃣ Watch the magic happen ✨</li>
            </ul>
          </div>

          {/* Camera Preview */}
          <div
            className="
              bg-white/10
              backdrop-blur-lg
              border
              border-white/20
              p-4
              rounded-3xl
              shadow-2xl
            "
          >
            <h3 className="text-xl font-semibold mb-3 text-center">
              📷 Camera Preview
            </h3>

            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-xl"
              width={550}
            />
          </div>
        </div>
      )}

      {/* AFTER CAPTURE */}
      {backgroundCaptured && (
        <div className="mt-8 mb-8 flex justify-center">
          {/* Hidden webcam for continuous frame capture */}
          <div
  style={{
    position: "absolute",
    left: "-9999px",
    top: "0"
  }}
>
  <Webcam
    ref={webcamRef}
    screenshotFormat="image/jpeg"
    width={550}
  />
</div>

          <div
            className="
              bg-white/10
              backdrop-blur-lg
              border
              border-white/20
              p-4
              rounded-3xl
              shadow-2xl
              w-fit
            "
          >
            <h3 className="text-2xl font-bold mb-4 text-center">
              🪄 Invisible Cloak Activated
            </h3>

            <img
              ref={outputRef}
              width="650"
              className="rounded-xl"
              alt="Invisible Cloak Output"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full max-w-6xl border-t border-slate-800 mt-10 mb-6"></div>

      <div className="text-slate-500 mb-8 text-center">
        ⚡  &nbsp; Made with love By Aman Dwivedi &nbsp; ⚡ 
      </div>
    </div>
  );
}

export default App;