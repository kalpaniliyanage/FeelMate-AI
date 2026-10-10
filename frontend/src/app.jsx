
import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import "./app.css";

/* ---------------- MOOD IMAGES ---------------- */

const moodOptions = [
  {
    name: "Happy",
    emoji: "😊",
    image:
      "https://i.pinimg.com/736x/78/2e/20/782e200017ad244f41d1fd772e6c4cc8.jpg",
  },
  {
    name: "Sad",
    emoji: "😔",
    image:
      "https://i.pinimg.com/736x/e5/a0/ff/e5a0fffdac36e5b665d9d604e63c45cb.jpg",
  },
  {
    name: "Angry",
    emoji: "😠",
    image:
      "https://i.pinimg.com/1200x/02/86/e3/0286e3544295724fefb42ace7a841b30.jpg",
  },
  {
    name: "Anxious",
    emoji: "😟",
    image:
      "https://i.pinimg.com/736x/19/d5/1c/19d51c836aa925f39d23b683245456d6.jpg",
  },
  {
    name: "Tired",
    emoji: "😴",
    image:
      "https://i.pinimg.com/736x/af/20/1e/af201ea911ae70292d2e01e42b6675b9.jpg",
  },
  {
    name: "Neutral",
    emoji: "😌",
    image:
      "https://i.pinimg.com/736x/f0/b7/05/f0b7059253da85c2ffb3569345c3b3b7.jpg",
  },
];

const moodNamesSi = {
  Happy: "සතුටුයි",
  Sad: "දුකයි",
  Angry: "තරහයි",
  Anxious: "කනස්සල්ල",
  Tired: "මහන්සියි",
  Neutral: "සාමාන්‍යයි",
};

const expressionToMood = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  fearful: "Anxious",
  disgusted: "Angry",
  surprised: "Neutral",
  neutral: "Neutral",
};

const moodActivities = {
  Happy: {
    title: "Happy vibes 🌈",
    siTitle: "සතුටු මොහොතක් 🌈",
    description:
      "Enjoy upbeat music, comedy, or something that makes you smile.",
    siDescription:
      "සතුටු ගීතයක්, විහිළු වීඩියෝවක් හෝ ඔබට සතුට ගෙනෙන දෙයක් තෝරාගන්න.",
    activity:
      "Listen to a favourite song or write down one good thing from today.",
    siActivity:
      "ඔබ කැමති ගීතයක් අසන්න හෝ අද සිදු වූ හොඳ දෙයක් සටහන් කරන්න.",
    searches: [
      { label: "😊 Happy music", query: "happy uplifting music" },
      { label: "😂 English comedy", query: "English comedy funny videos" },
      { label: "🇱🇰 Sinhala comedy", query: "Sinhala comedy funny videos" },
    ],
    kind: "music",
  },
  Sad: {
    title: "A little comfort 💜",
    siTitle: "ඔබ වෙනුවෙන් පුංචි සැනසීමක් 💜",
    description:
      "Choose a comforting comedy, funny animals, gentle music, or a Dhamma sermon.",
    siDescription:
      "සිංහල හෝ ඉංග්‍රීසි විහිළු, සතුන්ගේ විනෝද වීඩියෝ, සන්සුන් සංගීතය හෝ ධර්ම දේශනාවක් තෝරාගන්න.",
    activity:
      "Write down what you need right now, take a short walk, or talk with someone you trust.",
    siActivity:
      "ඔබට දැන් අවශ්‍ය දේ ලියන්න, කෙටි ඇවිදීමක් කරන්න හෝ විශ්වාසවන්ත කෙනෙකු සමඟ කතා කරන්න.",
    searches: [
      { label: "🇱🇰 Sinhala comedy", query: "Sinhala comedy funny videos" },
      { label: "😂 English comedy", query: "English comedy funny videos" },
      { label: "🐼 Funny animals", query: "funny animal videos" },
      { label: "🙏 Sinhala Dhamma", query: "Sinhala Dhamma sermon" },
      { label: "🎵 Calming music", query: "calming relaxing music" },
    ],
    kind: "comfort",
  },
  Angry: {
    title: "Calm your mind 🌿",
    siTitle: "සිත සන්සුන් කරගමු 🌿",
    description:
      "Try relaxing music, guided relaxation, or a comfortable breathing exercise.",
    siDescription:
      "සන්සුන් සංගීතයක්, විවේකී වීඩියෝවක් හෝ සුවපහසු හුස්ම ගැනීමේ අභ්‍යාසයක් උත්සාහ කරන්න.",
    activity:
      "Pause the stressful task if possible, relax your shoulders, and breathe comfortably.",
    siActivity:
      "හැකි නම් පීඩනය ඇති කරන වැඩෙන් මොහොතකට ඉවත් වී උරහිස් සැහැල්ලු කර සුවපහසු ලෙස හුස්ම ගන්න.",
    searches: [
      { label: "🌿 Relaxing music", query: "relaxing music stress relief" },
      { label: "🌬️ Breathing", query: "gentle guided breathing exercise" },
      { label: "🙏 Sinhala Dhamma", query: "Sinhala Dhamma sermon peace" },
    ],
    kind: "breathing",
  },
  Anxious: {
    title: "A gentle moment 🌸",
    siTitle: "සන්සුන් මොහොතක් 🌸",
    description:
      "Try grounding, gentle breathing, or peaceful music. Stop if anything feels uncomfortable.",
    siDescription:
      "අවට දේවල් නිරීක්ෂණය කිරීම, සෙමින් හුස්ම ගැනීම හෝ සන්සුන් සංගීතය උත්සාහ කරන්න.",
    activity:
      "Notice five things you can see, four things you can feel, and three things you can hear.",
    siActivity:
      "ඔබට පෙනෙන දේවල් පහක්, ස්පර්ශයෙන් දැනෙන දේවල් හතරක් සහ ඇසෙන ශබ්ද තුනක් හඳුනාගන්න.",
    searches: [
      { label: "🌬️ Breathing exercise", query: "guided breathing exercise anxiety" },
      { label: "🌿 Grounding", query: "5 4 3 2 1 grounding exercise" },
      { label: "🎵 Relaxing music", query: "peaceful relaxing music" },
    ],
    kind: "breathing",
  },
  Tired: {
    title: "Rest and recharge ☁️",
    siTitle: "විවේක ගෙන නැවත ශක්තිමත් වෙමු ☁️",
    description:
      "Give yourself permission to pause. Try peaceful sounds or a gentle stretch.",
    siDescription:
      "මොහොතක් විවේක ගන්න. සන්සුන් ශබ්ද අසන්න හෝ සැහැල්ලුවෙන් ශරීරය දිගහරින්න.",
    activity:
      "Drink some water, rest your eyes, and take a short break if you can.",
    siActivity:
      "වතුර ටිකක් බොන්න, ඇස්වලට විවේකයක් දෙන්න, හැකි නම් කෙටි විවේකයක් ගන්න.",
    searches: [
      { label: "🎵 Peaceful music", query: "peaceful relaxing music" },
      { label: "🌿 Gentle stretching", query: "gentle stretching routine" },
      { label: "🌧️ Rain sounds", query: "relaxing rain sounds" },
    ],
    kind: "rest",
  },
  Neutral: {
    title: "A little time for yourself ☁️",
    siTitle: "ඔබ වෙනුවෙන් පුංචි විවේකයක් ☁️",
    description:
      "Enjoy music, light entertainment, a mindful activity, or a quiet moment.",
    siDescription:
      "සංගීතය, විනෝද වීඩියෝවක්, සිහියෙන් සිටීමේ අභ්‍යාසයක් හෝ නිහඬ විවේකයක් තෝරාගන්න.",
    activity:
      "Write a short journal entry, stretch gently, or enjoy a few minutes away from your screen.",
    siActivity:
      "කෙටි සටහනක් ලියන්න, සැහැල්ලුවෙන් ශරීරය දිගහරින්න හෝ තිරයෙන් මොහොතකට ඈත් වන්න.",
    searches: [
      { label: "🎵 Relaxing music", query: "relaxing music" },
      { label: "🇱🇰 Sinhala comedy", query: "Sinhala comedy funny videos" },
      { label: "🙏 Sinhala Dhamma", query: "Sinhala Dhamma sermon" },
    ],
    kind: "relax",
  },
};

const manualReplies = {
  Happy:
    "I'm glad you shared that! 🌻 Would you like happy music or something funny to watch?",
  Sad:
    "I'm here to listen. 💜 A comforting video, a little rest, journaling, or talking to someone you trust may help.",
  Angry:
    "That sounds difficult. 🌿 If possible, take a little space and breathe comfortably before responding.",
  Anxious:
    "Let's take one moment at a time. 🌷 Try a gentle breathing exercise or notice what's around you.",
  Tired:
    "You've been doing your best. ☁️ If you can, take a break, drink water, or rest for a while.",
  Neutral:
    "It's okay to feel neutral too. 💙 You can choose relaxing music, a mindful activity, or a little entertainment.",
};

const manualRepliesSi = {
  Happy: "ඔබ ඒ ගැන බෙදාගත්තාට සතුටුයි! 🌻 සතුටු ගීතයක් හෝ විනෝද වීඩියෝවක් බලමුද?",
  Sad: "මම ඔබට සවන් දෙන්නම්. 💜 සැනසිලිදායක වීඩියෝවක්, විවේකයක් හෝ විශ්වාසවන්ත කෙනෙකු සමඟ කතා කිරීම උදව් විය හැකියි.",
  Angry: "එය අපහසු අත්දැකීමක් වගේ. 🌿 හැකි නම් මොහොතකට ඉවත් වී සුවපහසු ලෙස හුස්ම ගන්න.",
  Anxious: "අපි එක මොහොතක් බැගින් යමු. 🌷 සෙමින් හුස්ම ගන්න හෝ අවට දේවල් නිරීක්ෂණය කරන්න.",
  Tired: "ඔබ ඔබේ උපරිමය කරනවා. ☁️ හැකි නම් විවේකයක් ගන්න, වතුර බොන්න හෝ ටිකක් නිදාගන්න.",
  Neutral: "සාමාන්‍ය හැඟීමක් තිබීමත් හොඳයි. 💙 සන්සුන් සංගීතයක් හෝ විනෝදජනක දෙයක් තෝරාගන්න.",
};

function App() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectingRef = useRef(false);
  const modelsLoadedRef = useRef(false);
  const recognitionRef = useRef(null);
  const candidateRef = useRef("");
  const candidateSinceRef = useRef(0);
  const stableCountRef = useRef(0);

  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [modelStatus, setModelStatus] = useState("Camera is off");
  const [emotionScores, setEmotionScores] = useState(null);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [mood, setMood] = useState("");
  const [activeActivity, setActiveActivity] = useState(null);
  const [videoChoice, setVideoChoice] = useState("");
  const [videoIdInput, setVideoIdInput] = useState("");
  const [videoError, setVideoError] = useState("");
  const [breathing, setBreathing] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [chat, setChat] = useState([
    {
      from: "ai",
      text: "Hi there! 💜 I'm FeelMate, your friendly wellness companion. Choose a mood, try an activity, or tell me what's on your mind.",
    },
  ]);

  const isSinhala = language === "si";
  const currentMood = moodOptions.find((item) => item.name === mood);
  const currentMoodImage = currentMood?.image || moodOptions[5].image;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isSinhala ? "si-LK" : "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function addAIReply(text) {
    setChat((old) => [...old, { from: "ai", text }]);
    if (autoVoice) speakText(text);
  }

  function stopCameraTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }

  async function startCamera() {
    setCameraError("");
    setEmotionScores(null);
    setDetectionComplete(false);
    candidateRef.current = "";
    candidateSinceRef.current = 0;
    stableCountRef.current = 0;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access requires localhost or HTTPS in a supported browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
      setModelStatus("Preparing face detection...");
    } catch (error) {
      console.error(error);
      setCameraError("Camera access failed. Please allow camera permission in your browser.");
      setModelStatus("Camera could not start.");
    }
  }

  function stopCamera() {
    stopCameraTracks();
    setModelStatus("Scanning stopped.");
  }

  useEffect(() => {
    if (!cameraOn || detectionComplete) return undefined;

    let cancelled = false;
    let timer;

    async function scan() {
      try {
        if (!modelsLoadedRef.current) {
          setModelStatus("Loading expression models...");
          await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
          await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
          await faceapi.nets.faceExpressionNet.loadFromUri("/models");
          modelsLoadedRef.current = true;
        }

        if (cancelled) return;
        setModelStatus("Scanning expression...");

        timer = window.setInterval(async () => {
          const video = videoRef.current;
          if (cancelled || !video || video.readyState < 2 || detectingRef.current) return;

          detectingRef.current = true;

          try {
            const result = await faceapi
              .detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 224,
                  scoreThreshold: 0.5,
                })
              )
              .withFaceLandmarks()
              .withFaceExpressions();

            if (cancelled) return;

            if (!result) {
              candidateRef.current = "";
              candidateSinceRef.current = 0;
              stableCountRef.current = 0;
              setModelStatus("Face not detected — look at the camera.");
              return;
            }

            const expressions = result.expressions;
            setEmotionScores({
              Happy: expressions.happy,
              Sad: expressions.sad,
              Angry: expressions.angry,
              Fearful: expressions.fearful,
              Disgusted: expressions.disgusted,
              Surprised: expressions.surprised,
              Neutral: expressions.neutral,
            });

            const [topExpression, topScore] = Object.entries(expressions).sort(
              (a, b) => b[1] - a[1]
            )[0];

            if (topScore < 0.55) {
              candidateRef.current = "";
              candidateSinceRef.current = 0;
              stableCountRef.current = 0;
              setModelStatus("Checking expression stability...");
              return;
            }

            const now = Date.now();

            if (candidateRef.current !== topExpression) {
              candidateRef.current = topExpression;
              candidateSinceRef.current = now;
              stableCountRef.current = 1;
              setModelStatus("Confirming expression...");
              return;
            }

            stableCountRef.current += 1;
            if (now - candidateSinceRef.current < 2000 || stableCountRef.current < 4) return;
            if (cancelled) return;

            const selectedMood = expressionToMood[topExpression] || "Neutral";
            const activity = moodActivities[selectedMood];

            window.clearInterval(timer);
            setMood(selectedMood);
            setActiveActivity(activity);
            setVideoChoice("");
            setVideoError("");
            setDetectionComplete(true);
            setModelStatus(`Scan complete: ${topExpression} expression prediction.`);

            const reply = isSinhala
              ? `${manualRepliesSi[selectedMood]}\n\n${activity.siActivity}`
              : `${manualReplies[selectedMood]}\n\n${activity.activity}`;

            addAIReply(reply);
            setBreathing(activity.kind === "breathing");
            stopCameraTracks();
          } catch (error) {
            console.error("Detection error:", error);
            setModelStatus("Detection error — check model files.");
          } finally {
            detectingRef.current = false;
          }
        }, 500);
      } catch (error) {
        console.error("Model loading error:", error);
        if (!cancelled) {
          setModelStatus("Could not load models.");
          setCameraError("Check that the required face model files are inside frontend/public/models/.");
        }
      }
    }

    scan();

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [cameraOn, detectionComplete]);

  function chooseMood(selectedMood) {
    const activity = moodActivities[selectedMood];
    setMood(selectedMood);
    setActiveActivity(activity);
    setVideoChoice("");
    setVideoError("");
    setBreathing(activity.kind === "breathing");

    const reply = isSinhala ? manualRepliesSi[selectedMood] : manualReplies[selectedMood];
    const activityText = isSinhala ? activity.siActivity : activity.activity;

    setChat((old) => [
      ...old,
      {
        from: "user",
        text: isSinhala
          ? `මගේ දැන් හැඟීම: ${moodNamesSi[selectedMood]} ${moodOptions.find((item) => item.name === selectedMood)?.emoji || ""}`
          : `I'm feeling ${selectedMood.toLowerCase()} ${moodOptions.find((item) => item.name === selectedMood)?.emoji || ""}`,
      },
      { from: "ai", text: `${reply}\n\n${activityText}` },
    ]);

    if (autoVoice) speakText(`${reply} ${activityText}`);
  }

  function openYouTubeSearch(query) {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function loadCustomVideo(event) {
    event.preventDefault();
    const input = videoIdInput.trim();
    const match = input.match(
      /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    const id = match ? match[1] : /^[A-Za-z0-9_-]{11}$/.test(input) ? input : "";

    if (!id) {
      setVideoError(
        isSinhala
          ? "නිවැරදි YouTube video link එකක් හෝ video ID එකක් ඇතුළත් කරන්න."
          : "Please enter a valid YouTube video link or 11-character video ID."
      );
      return;
    }

    setVideoChoice(id);
    setVideoError("");
    setVideoIdInput("");
  }

  
  async function sendMessage(event) {
    event.preventDefault();

    const userMessage = message.trim();

    if (!userMessage || isSending) return;

    // Keep the previous conversation for context.
    const previousChat = chat;

    setChat((old) => [
      ...old,
      { from: "user", text: userMessage },
    ]);

    setMessage("");
    setVoiceError("");
    setIsSending(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          language: language,
          history: previousChat.slice(-12).map((item) => ({
            role: item.from === "user" ? "user" : "assistant",
            content: item.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.error || "AI request failed."
        );
      }

      if (!data.reply || typeof data.reply !== "string") {
        throw new Error("The AI response was empty.");
      }

      addAIReply(data.reply);
    } catch (error) {
      console.error("FeelMate AI error:", error);

      addAIReply(
        isSinhala
          ? "සමාවෙන්න 💜 AI සේවාවට සම්බන්ධ වෙන්න බැරි වුණා. Backend server එක ක්‍රියාත්මකද, API key එක නිවැරදිව සකස් කරලා තියෙනවද කියලා පරීක්ෂා කරන්න."
          : "Sorry 💜 I couldn't connect to the AI service. Please check that your backend server is running and your API key is configured correctly."
      );
    } finally {
      setIsSending(false);
    }
  } 

  function startVoiceInput() {
    setVoiceError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser. Try Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isSinhala ? "si-LK" : "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setMessage((old) => (old ? `${old} ${spokenText}` : spokenText));
    };
    recognition.onerror = (event) => {
      setVoiceError(`Microphone error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setVoiceError("Could not start voice input. Please try again.");
    }
  }

  function toggleBreathing() {
    setBreathing((old) => !old);
  }

  function speakLastReply() {
    const lastReply = [...chat].reverse().find((item) => item.from === "ai");
    if (lastReply) speakText(lastReply.text);
  }

  const text = (en, si) => (isSinhala ? si : en);

  return (
    <main className={`app-shell theme-${theme}`} id="home">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">💜</span>
          <span>FeelMate<span className="brand-ai"> AI</span></span>
        </a>

        <div className="topbar-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((old) => (old === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          <button
            className={`language-button ${language === "en" ? "active" : ""}`}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
          <button
            className={`language-button ${language === "si" ? "active" : ""}`}
            onClick={() => setLanguage("si")}
          >
            සිංහල
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            {text("A LITTLE SPACE JUST FOR YOU ✨", "ඔබ වෙනුවෙන්ම පුංචි ඉඩක් ✨")}
          </span>
          <h1>
            {text("Your feelings", "ඔබේ හැඟීම්")}
            <br />
            <span className="gradient-text">
              {text("matter here.", "වැදගත් වේ.")}
            </span>
          </h1>
          <p>
            {text(
              "Check in with yourself, share what's on your mind, and find a small activity for this moment.",
              "ඔබට දැනෙන දේ හඳුනාගෙන, ඔබේ අදහස් බෙදාගෙන, මේ මොහොතට ගැළපෙන ක්‍රියාකාරකමක් තෝරාගන්න."
            )}
          </p>
          <a className="primary-link" href="#companion">
            {text("Meet your companion", "ආරම්භ කරමු")} →
          </a>
          <div className="hero-points">
            <span>💜 {text("Kindness", "කරුණාව")}</span>
            <span>🌿 {text("Mindfulness", "සිහිය")}</span>
            <span>✨ {text("Your space", "ඔබේ ඉඩ")}</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-image-wrap">
            <img
              src="https://i.pinimg.com/736x/f6/50/ea/f650ea9d5f58c302e574ef67adde00c7.jpg"
              alt="Peaceful nature and warm sunlight"
            />
            <div className="hero-image-overlay">
              <span>💜</span>
              <strong>{text("It's okay to feel.", "හැඟීම් දැනීම සාමාන්‍යයි.")}</strong>
              <small>{text("Take it one moment at a time.", "එක මොහොතක් බැගින් ඉදිරියට යමු.")}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard" id="companion">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{text("YOUR PERSONAL SPACE", "ඔබේ පුද්ගලික ඉඩ")}</span>
            <h2>{text("Let's check in 💗", "අපි ඔබ ගැන සොයා බලමු 💗")}</h2>
          </div>
          <p>{text("No judgement. Just kindness.", "විනිශ්යක් නැහැ. කරුණාව පමණයි.")}</p>
        </div>

        <div className="main-grid">
          <article className="panel camera-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-icon">📷</span>
                <h3>{text("Camera check-in", "කැමරා පරීක්ෂාව")}</h3>
              </div>
              <span className={`live-badge ${cameraOn ? "is-live" : ""}`}>
                {cameraOn ? "CAMERA ON" : "CAMERA OFF"}
              </span>
            </div>

            <div className="camera-view">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={cameraOn ? "video-visible" : "video-hidden"}
              />
              {!cameraOn && (
                <div className="camera-placeholder">
                  <span className="camera-emoji">🌸</span>
                  <strong>{text("Your private moment starts here", "ඔබේ පෞද්ගලික මොහොත මෙතැනින්")}</strong>
                  <small>
                    {detectionComplete
                      ? text("Scan finished. Start again whenever you like.", "පරීක්ෂාව අවසන්. කැමති විට නැවත ආරම්භ කරන්න.")
                      : text("Turn on your camera for a check-in.", "පරීක්ෂාව සඳහා කැමරාව ආරම්භ කරන්න.")}
                  </small>
                </div>
              )}
              {cameraOn && (
                <span className="camera-note">
                  {text("Scanning your expression…", "ඔබේ මුහුණේ ප්‍රකාශය නිරීක්ෂණය කරමින්…")}
                </span>
              )}
            </div>

            <p className="muted-text">
              {text(
                "Facial expression predictions are estimates, not proof of how you feel.",
                "මුහුණේ පෙනෙන ප්‍රකාශ පිළිබඳ ඇස්තමේන්තු පමණි. ඔබට ඇත්තටම දැනෙන දේ ඔබම හොඳින් දනී."
              )}
            </p>

            <div className="emotion-dashboard">
              <div className="emotion-title">
                <div>
                  <h4>{text("Expression analysis", "ප්‍රකාශ විශ්ලේෂණය")}</h4>
                  <p>{modelStatus}</p>
                </div>
                <span className={cameraOn ? "emotion-live" : "emotion-off"}>
                  {cameraOn ? "● SCANNING" : detectionComplete ? "✓ DONE" : "● OFF"}
                </span>
              </div>

              {emotionScores ? (
                Object.entries(emotionScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score]) => (
                    <div className="emotion-row" key={name}>
                      <div className="emotion-label">
                        <span>{name}</span>
                        <strong>{Math.round(score * 100)}%</strong>
                      </div>
                      <div className="emotion-track">
                        <div
                          className="emotion-fill"
                          style={{ width: `${Math.max(0, Math.min(100, score * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <p className="muted-text">
                  {text("Turn on the camera to see expression predictions.", "ප්‍රකාශ ඇස්තමේන්තු බැලීමට කැමරාව ආරම්භ කරන්න.")}
                </p>
              )}
            </div>

            {cameraError && <p className="error-text">{cameraError}</p>}
            <button
              className={cameraOn ? "secondary-button" : "primary-button"}
              onClick={cameraOn ? stopCamera : startCamera}
            >
              {cameraOn
                ? text("Stop scanning", "පරීක්ෂාව නවත්වන්න")
                : detectionComplete
                  ? text("Scan again", "නැවත පරීක්ෂා කරන්න")
                  : text("♡ Start emotion scan", "♡ ප්‍රකාශ පරීක්ෂාව ආරම්භ කරන්න")}
            </button>
          </article>

          <article className="panel mood-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-icon">🌈</span>
                <h3>{text("How are you feeling?", "දැන් ඔබට දැනෙන්නේ කොහොමද?")}</h3>
              </div>
            </div>
            <p className="muted-text">
              {text(
                "Choose what feels closest to you. You can change the camera's suggestion.",
                "ඔබට ගැළපෙන හැඟීම තෝරාගන්න. කැමරාවේ යෝජනාව වෙනස් කරන්නත් පුළුවන්."
              )}
            </p>

            <div className="mood-grid">
              {moodOptions.map((option) => (
                <button
                  type="button"
                  key={option.name}
                  className={`mood-option ${mood === option.name ? "selected" : ""}`}
                  onClick={() => chooseMood(option.name)}
                >
                  <img
                    className="mood-card-image"
                    src={option.image}
                    alt={`${option.name} mood`}
                    loading="lazy"
                  />
                  <span className="mood-emoji">{option.emoji}</span>
                  <strong>{isSinhala ? moodNamesSi[option.name] : option.name}</strong>
                </button>
              ))}
            </div>

            <div className="mood-response">
              <span className="response-sparkle">✦</span>
              <div>
                <strong>
                  {mood
                    ? text(`Your check-in: ${mood}`, `ඔබේ හැඟීම: ${moodNamesSi[mood]}` )
                    : text("Every feeling is welcome", "සෑම හැඟීමකටම ඉඩක් ඇත")}
                </strong>
                <p>
                  {mood
                    ? isSinhala
                      ? manualRepliesSi[mood]
                      : manualReplies[mood]
                    : text("Start by choosing a mood above.", "ඉහත හැඟීම් අතරින් එකක් තෝරාගන්න.")}
                </p>
              </div>
            </div>
          </article>
        </div>

        {activeActivity && (
          <article className="panel activity-panel">
            <span className="eyebrow">{text("YOUR WELLNESS ACTIVITY", "ඔබ වෙනුවෙන් ක්‍රියාකාරකමක්")}</span>
            <h3>{isSinhala ? activeActivity.siTitle : activeActivity.title}</h3>
            <img
              className="activity-mood-image"
              src={currentMoodImage}
              alt={text(`Image for ${mood} mood`, `${moodNamesSi[mood] || "ඔබේ"} හැඟීම සඳහා රූපය`)}
            />
            <p>{isSinhala ? activeActivity.siDescription : activeActivity.description}</p>

            <div className="youtube-section">
              <h4>{text("A video for your moment 💜", "ඔබට ගැළපෙන වීඩියෝවක් 💜")}</h4>

              {videoChoice ? (
                <div className="youtube-player">
                  <iframe
                    key={videoChoice}
                    src={`https://www.youtube-nocookie.com/embed/${videoChoice}?playsinline=1&rel=0`}
                    title="FeelMate wellness video"
                    allow="encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <div className="video-placeholder">
                  <span>▶️</span>
                  <p>{text("Choose a video search below or paste a YouTube link.", "පහතින් වීඩියෝවක් සොයන්න හෝ YouTube link එකක් ඇතුළත් කරන්න.")}</p>
                </div>
              )}

              <p className="muted-text">
                {text("Some videos may not allow embedding. If one fails, choose another search.", "සමහර වීඩියෝ මෙහි පෙන්වීමට අවසර නොදිය හැකියි. එවිට වෙනත් වීඩියෝවක් සොයන්න.")}
              </p>

              <h4>{text("Find another video", "වෙනත් වීඩියෝවක් සොයන්න")}</h4>
              <div className="video-options">
                {activeActivity.searches.map((item) => (
                  <button key={item.query} onClick={() => openYouTubeSearch(item.query)}>
                    {item.label}
                  </button>
                ))}
              </div>

              <form className="video-link-form" onSubmit={loadCustomVideo}>
                <label htmlFor="youtube-link">
                  {text("Paste a YouTube video link", "YouTube video link එක මෙතැනට දාන්න")}
                </label>
                <input
                  id="youtube-link"
                  value={videoIdInput}
                  onChange={(event) => setVideoIdInput(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <button className="primary-button" type="submit">
                  {text("Play video here", "වීඩියෝව මෙහි පෙන්වන්න")}
                </button>
              </form>
              {videoError && <p className="error-text">{videoError}</p>}
            </div>

            <div className="activity-suggestion">
              <h4>{text("A small practical activity 🌱", "කුඩා ප්‍රායෝගික ක්‍රියාවක් 🌱")}</h4>
              <p>{isSinhala ? activeActivity.siActivity : activeActivity.activity}</p>
            </div>

            <div className={`breathing-circle ${breathing ? "breathing-active" : ""}`}>
              <span>{breathing ? text("Breathe gently", "සුවපහසුවෙන් හුස්ම ගන්න") : "♡"}</span>
            </div>
            <button className="secondary-button" onClick={toggleBreathing}>
              {breathing
                ? text("Pause breathing exercise", "හුස්ම ගැනීමේ අභ්‍යාසය නවත්වන්න")
                : text("Start breathing exercise", "හුස්ම ගැනීම ආරම්භ කරන්න")}
            </button>

            <button
              className="text-button"
              onClick={() => {
                setActiveActivity(null);
                setVideoChoice("");
                setVideoError("");
                setBreathing(false);
              }}
            >
              {text("Close activity", "ක්‍රියාකාරකම වසන්න")}
            </button>
          </article>
        )}

        <div className="lower-grid">
          <article className="panel chat-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-icon">💬</span>
                <h3>{text("Talk to FeelMate", "FeelMate සමඟ කතා කරන්න")}</h3>
              </div>
              <div className="chat-actions">
                <button className="icon-button" onClick={speakLastReply} title="Read latest reply aloud">
                  🔊
                </button>
                <button
                  className="icon-button"
                  onClick={() => setAutoVoice((old) => !old)}
                  aria-pressed={autoVoice}
                >
                  {autoVoice ? "🔊 Auto voice on" : "🔈 Auto voice off"}
                </button>
              </div>
            </div>

            <p className="muted-text">
              {text("Share a thought. You don't need to find the perfect words.", "ඔබේ සිතේ ඇති දෙයක් කියන්න. නිවැරදි වචන සොයාගැනීමට අවශ්‍ය නැහැ.")}
            </p>

            <div className="chat-messages" aria-live="polite">
              {chat.map((item, index) => (
                <div key={`${index}-${item.from}`} className={`message-row ${item.from === "user" ? "user-row" : ""}`}>
                  {item.from === "ai" && <span className="chat-avatar">💜</span>}
                  <div className={`message-bubble ${item.from === "user" ? "user-bubble" : "ai-bubble"}`}>
                    {item.text}
                    {isSending && (
                      <div className="message-row">
                        <span className="chat-avatar">💜</span>
                        <div className="message-bubble ai-bubble">
                          {text("FeelMate is thinking... ⏳", "FeelMate පිළිතුරක් සකස් කරමින්... ⏳")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form className="chat-form" onSubmit={sendMessage}>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={text("Tell me what's on your mind...", "ඔබේ සිතේ ඇති දේ ලියන්න...")}
                aria-label="Your message"
              />
              <button
                type="button"
                className={`mic-button ${isListening ? "mic-active" : ""}`}
                onClick={startVoiceInput}
                aria-label="Speak your message"
              >
                {isListening ? "🔴" : "🎙️"}
              </button>
              <button
                  type="submit"
                  aria-label="Send message"
                  disabled={isSending || !message.trim()}
                >
                  {isSending ? "⏳" : "➤"}
                </button>
            </form>

            {isListening && <small className="voice-status">{text("Listening… speak now.", "සවන් දෙමින්... දැන් කතා කරන්න.")}</small>}
            {voiceError && <p className="error-text">{voiceError}</p>}
            <small className="disclaimer">
              {text(
                "FeelMate uses built-in replies, not a live AI service. It is not a diagnosis or a substitute for professional help.",
                "FeelMate භාවිතා කරන්නේ built-in පිළිතුරුය. මෙය රෝග විනිශ්චයක් හෝ වෛද්‍ය උපදෙසක් නොවේ."
              )}
            </small>
          </article>

          <article className="panel breathing-panel">
            <span className="panel-icon">🌿</span>
            <span className="eyebrow">{text("A MOMENT FOR YOU", "ඔබ වෙනුවෙන් මොහොතක්")}</span>
            <h3>{text("Take a gentle breath", "සුවපහසු හුස්මක් ගනිමු")}</h3>
            <p>{text("Give yourself a little pause. No rush, no pressure.", "කිසිම හදිසියක් නැහැ. ඔබට පහසු වේගයකින් හුස්ම ගන්න.")}</p>

            <div className={`breathing-circle ${breathing ? "breathing-active" : ""}`}>
              <span>{breathing ? text("Breathe", "හුස්ම ගන්න") : "♡"}</span>
            </div>

            <p className="breathing-hint">
              {breathing
                ? text("Breathe comfortably. Stop if uncomfortable.", "සුවපහසු ලෙස හුස්ම ගන්න. අපහසු නම් නවත්වන්න.")
                : text("Try a slow, comfortable breath.", "සෙමින්, සුවපහසු ලෙස හුස්ම ගැනීමට උත්සාහ කරන්න.")}
            </p>

            <button className="primary-button" onClick={toggleBreathing}>
              {breathing ? text("Pause exercise", "අභ්‍යාසය නවත්වන්න") : text("Start breathing", "හුස්ම ගැනීම ආරම්භ කරන්න")}
            </button>
          </article>
        </div>
      </section>

      <footer className="footer">
        <span>💜 FeelMate AI</span>
        <span>{text("You deserve care, too.", "ඔබත් සැලකිල්ල ලැබිය යුතු කෙනෙක්.")}</span>
      </footer>
    </main>
  );
}

export default App; 