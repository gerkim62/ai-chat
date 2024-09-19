const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const restartButton = document.getElementById("restart-button");
const downloadButton = document.getElementById("download-button");
const settingsButton = document.getElementById("settings-button");
const placeholderMessage = document.getElementById("placeholder-message");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

const apiKey = "sk-OsMMq65tXdfOIlTUYtocSL7NCsmA7CerN77OkEv29dODg1EA"; // For testing purposes
const apiUrl = "https://api.gptgod.online/v1/chat/completions";

function loadChatHistory() {
  if (chatHistory.length === 0) {
    placeholderMessage.style.display = "block";
  } else {
    placeholderMessage.style.display = "none";
    chatHistory.forEach((chat) => addMessage(chat.content, chat.isUser));
  }
}

function addMessage(content, isUser) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.classList.add(isUser ? "user-message" : "ai-message");
  messageElement.textContent = content;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  placeholderMessage.style.display = "none"; // Hide placeholder when a message is added
}

function addErrorMessage(content) {
  const errorElement = document.createElement("div");
  errorElement.classList.add("error");
  errorElement.textContent = content;
  chatMessages.appendChild(errorElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function restartChat() {
  if (confirm("Are you sure you want to restart the chat?")) {
    chatHistory = [];
    localStorage.removeItem("chatHistory");
    chatMessages.innerHTML = "";
    placeholderMessage.style.display = "block"; // Show placeholder after restart
  }
}

function downloadChat() {
  const chatContent = chatHistory
    .map((entry) => (entry.isUser ? "You" : "AI") + ": " + entry.content)
    .join("\n");
  const blob = new Blob([chatContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat-history.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    addMessage(message, true);
    chatHistory.push({ content: message, isUser: true });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    messageInput.value = "";
    const loadingMessage = document.createElement("div");
    loadingMessage.classList.add("loading");
    loadingMessage.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Typing...';
    chatMessages.appendChild(loadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         
          model: "gpt-4",
          messages: chatHistory.map((chat) => ({
            role: chat.isUser ? "user" : "assistant",
            content: chat.content,
          })),
        }),
      });

      chatMessages.removeChild(loadingMessage);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      addMessage(aiResponse, false);
      chatHistory.push({ content: aiResponse, isUser: false });
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Error:", error);
      chatMessages.removeChild(loadingMessage);
      addErrorMessage("Oops! Something went wrong. Please try again.");
    }
  }
}

loadChatHistory();

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

restartButton.addEventListener("click", restartChat);
downloadButton.addEventListener("click", downloadChat);
settingsButton.addEventListener("click", () => {
  alert("Settings clicked, but not implemented yet!");
});
