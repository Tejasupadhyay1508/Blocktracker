import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Paper,
  Typography,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

const OPENROUTER_API_KEY =
  process.env.REACT_APP_OPENROUTER_API_KEY ||
  "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";

// function Chatbot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     setMessages([...messages, { user: true, text: input }]);
//     setLoading(true);
//     try {
//       const res = await axios.post("/api/bot", { message: input });
//       setMessages((prev) => [...prev, { user: false, text: res.data.response }]);
//     } catch {
//       setMessages((prev) => [...prev, { user: false, text: "Error: Could not contact bot." }]);
//     }
//     setInput("");
//     setLoading(false);
//   };

//   return (
//     <Paper elevation={3} sx={{ p: 2, mt: 2, maxWidth: 400, mx: "auto" }}>
//       <Typography variant="h6">Crypto Chatbot</Typography>
//       <Box sx={{ maxHeight: 250, overflowY: "auto", mb: 2 }}>
//         {messages.map((msg, i) => (
//           <Typography key={i} align={msg.user ? "right" : "left"} sx={{ color: msg.user ? "blue" : "green" }}>
//             {msg.text}
//           </Typography>
//         ))}
//       </Box>
//       <Box display="flex" gap={1}>
//         <TextField
//           size="small"
//           fullWidth
//           variant="outlined"
//           placeholder="Ask about crypto..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           disabled={loading}
//         />
//         <Button variant="contained" onClick={sendMessage} disabled={loading}>
const styles = {
  fixedChat: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 360,
    zIndex: 1000,
    boxShadow: "0 12px 60px rgba(16, 20, 40, 0.45)",
    borderRadius: 20,
  },
  embeddedChat: {
    position: "relative",
    width: "100%",
    borderRadius: 24,
    background: "rgba(24, 24, 36, 0.9)",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(120deg, #3a80e9 0%, #7ecbff 100%)",
    padding: "12px 18px",
    borderRadius: "20px 20px 0 0",
    color: "#fff",
  },
  chatBody: {
    background: "#0f111d",
    minHeight: 220,
    maxHeight: 320,
    overflowY: "auto",
    padding: "12px 16px",
  },
  userMsg: {
    textAlign: "right",
    color: "#7ecbff",
    margin: "8px 0",
    fontWeight: 500,
  },
  botMsg: {
    textAlign: "left",
    color: "#f5f6ff",
    margin: "8px 0",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 12,
    background: "#181824",
    borderRadius: "0 0 20px 20px",
    alignItems: "center",
  },
  suggestionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "0 16px 16px",
    background: "#0f111d",
  },
};

function Chatbot({ onClose, variant = "floating", context = "" }) {
  const [messages, setMessages] = useState([
    { user: false, text: "Hi 👋! Ask me anything about cryptocurrency." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const containerStyles =
    variant === "embedded" ? styles.embeddedChat : styles.fixedChat;
  const cannedPrompts = [
    "Summarize Bitcoin's price trend this week",
    "What is driving Ethereum volume today?",
    "Compare SOL vs ADA fundamentals",
  ];

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async (providedMessage) => {
    const textToSend = (providedMessage ?? input).trim();
    if (!textToSend) return;
    setMessages((msg) => [...msg, { user: true, text: textToSend }]);
    if (!providedMessage) {
      setInput("");
    }
    setLoading(true);
    try {
      const chartContext = context
        ? {
            role: "system",
            content: `Chart context: ${context}`,
          }
        : null;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "allenai/olmo-3.1-32b-think:free",
          messages: [
            {
              role: "system",
              content:
                "You are Chart Bot, an expert crypto analyst. Respond with concise, insight-rich answers grounded in the supplied chart context when available.",
            },
            ...(chartContext ? [chartContext] : []),
            {
              role: "user",
              content: textToSend,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              (typeof window !== "undefined" && window.location.origin) ||
              "http://localhost:3000",
            "X-Title": "BlockTracker Chart Bot",
          },
        }
      );

      const aiReply =
        response.data?.choices?.[0]?.message?.content?.trim() ||
        "No response from the AI.";
      setMessages((msg) => [...msg, { user: false, text: aiReply }]);
    } catch (error) {
      console.error("OpenRouter error:", error.response?.data || error.message);
      setMessages((msg) => [
        ...msg,
        { user: false, text: "Sorry, I couldn't connect." },
      ]);
    }
    setLoading(false);
  };

  const handleSuggestion = (prompt) => {
    sendMessage(prompt);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box component={Paper} sx={containerStyles}>
      <Box sx={styles.chatHeader}>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
            AI Crypto Copilot
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#e6f1ff" }}>
            Get chart-aware answers in seconds
          </Typography>
        </Box>
        {variant === "floating" && onClose && (
          <IconButton size="small" onClick={handleClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <Box sx={styles.chatBody} ref={chatRef}>
        {messages.map((msg, i) =>
          <Typography key={i} sx={msg.user ? styles.userMsg : styles.botMsg}>{msg.text}</Typography>
        )}
      </Box>
      <Box sx={styles.suggestionWrap}>
        {cannedPrompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            size="small"
            onClick={() => handleSuggestion(prompt)}
            sx={{
              background: "rgba(58,128,233,0.15)",
              color: "#7ecbff",
              borderColor: "#3a80e9",
              "&:hover": { background: "rgba(58,128,233,0.3)" },
            }}
            variant="outlined"
          />
        ))}
      </Box>
      <Box sx={styles.inputRow}>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Type a message…"
          fullWidth
          value={input}
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          onChange={(e) => setInput(e.target.value)}
          sx={{
            "& .MuiInputBase-root": { color: "#fff" },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#3a80e9" }
          }}
        />
        <IconButton onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          <SendIcon sx={{ color: "#3a80e9" }} />
        </IconButton>
      </Box>
    </Box>
  );
}


export default Chatbot;
