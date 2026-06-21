import { AI_PROMPTS } from "./constants.js";
import { showToast, renderMarkdownToHtml } from "./utils.js";
import { generateKnowledgePackMarkdown } from "./reports/generators.js";

// DOM references (resolved dynamically on initialization)
let btnAiSettings, btnClearChat, aiChatHistory, aiQuickTemplates, aiChatInput, btnAiSend;
let aiSettingsDrawer, btnCloseSettings, aiProviderSelect, btnSaveSettings, aiInjectContext;
let sectionGemini, sectionOpenai, sectionOllama;
let inputGeminiKey, inputGeminiModel, inputGeminiUrl;
let inputOpenaiKey, inputOpenaiModel, inputOpenaiUrl;
let inputOllamaUrl, inputOllamaModel;

let chatHistoryLog = [];

export function initAIEngine() {
    // Resolve DOM elements
    btnAiSettings = document.getElementById("btn-ai-settings");
    btnClearChat = document.getElementById("btn-clear-chat");
    aiChatHistory = document.getElementById("ai-chat-history");
    aiQuickTemplates = document.getElementById("ai-quick-templates");
    aiChatInput = document.getElementById("ai-chat-input");
    btnAiSend = document.getElementById("btn-ai-send");
    aiSettingsDrawer = document.getElementById("ai-settings-drawer");
    btnCloseSettings = document.getElementById("btn-close-settings");
    aiProviderSelect = document.getElementById("ai-provider-select");
    btnSaveSettings = document.getElementById("btn-save-settings");
    aiInjectContext = document.getElementById("ai-inject-context");

    sectionGemini = document.getElementById("section-gemini");
    sectionOpenai = document.getElementById("section-openai");
    sectionOllama = document.getElementById("section-ollama");

    inputGeminiKey = document.getElementById("ai-gemini-key");
    inputGeminiModel = document.getElementById("ai-gemini-model");
    inputGeminiUrl = document.getElementById("ai-gemini-url");
    inputOpenaiKey = document.getElementById("ai-openai-key");
    inputOpenaiModel = document.getElementById("ai-openai-model");
    inputOpenaiUrl = document.getElementById("ai-openai-url");
    inputOllamaUrl = document.getElementById("ai-ollama-url");
    inputOllamaModel = document.getElementById("ai-ollama-model");

    // Wire up event listeners
    if (btnAiSettings) {
        btnAiSettings.addEventListener("click", () => {
            if (aiSettingsDrawer) aiSettingsDrawer.classList.add("open");
        });
    }
    if (btnCloseSettings) {
        btnCloseSettings.addEventListener("click", () => {
            if (aiSettingsDrawer) aiSettingsDrawer.classList.remove("open");
        });
    }
    if (btnSaveSettings) {
        btnSaveSettings.addEventListener("click", () => {
            saveAISettings();
        });
    }
    if (aiProviderSelect) {
        aiProviderSelect.addEventListener("change", () => {
            updateProviderSectionsVisibility();
        });
    }
    if (btnClearChat) {
        btnClearChat.addEventListener("click", () => {
            if (confirm("Clear chat history?")) {
                initChatHistory();
            }
        });
    }

    if (aiChatInput) {
        // Auto-growing textarea for chat input
        aiChatInput.addEventListener("input", () => {
            aiChatInput.style.height = "auto";
            aiChatInput.style.height = Math.min(100, aiChatInput.scrollHeight) + "px";
        });

        // Key press handlers (Enter to send, Shift+Enter for new line)
        aiChatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (btnAiSend) btnAiSend.click();
            }
        });
    }

    if (btnAiSend) {
        btnAiSend.addEventListener("click", () => {
            try {
                if (!aiChatInput) return;
                const text = aiChatInput.value.trim();
                if (!text) return;
                
                let finalPrompt = text;
                if (aiInjectContext && aiInjectContext.checked) {
                    const mdContext = generateKnowledgePackMarkdown();
                    finalPrompt = `User question: ${text}\n\n=== CURRENT ARCHITECTURE SPECIFICATION ===\n${mdContext}`;
                }
                
                aiChatInput.value = "";
                aiChatInput.style.height = "34px";
                sendChatMessage(finalPrompt, text);
            } catch (err) {
                console.error("AI Send click error:", err);
                appendMessage("error", `⚠️ UI Event Error: ${err.message}`);
            }
        });
    }

    // Initial load & render
    loadAISettings();
    initChatHistory();
    populateAIGrid();
}

function loadAISettings() {
    if (!aiProviderSelect) return;
    const provider = localStorage.getItem("archbench_ai_provider") || "gemini";
    aiProviderSelect.value = provider;

    // Gemini
    if (inputGeminiKey) inputGeminiKey.value = localStorage.getItem("archbench_gemini_key") || "";
    if (inputGeminiModel) inputGeminiModel.value = localStorage.getItem("archbench_gemini_model") || "gemini-2.5-flash";
    if (inputGeminiUrl) inputGeminiUrl.value = localStorage.getItem("archbench_gemini_url") || "https://generativelanguage.googleapis.com";

    // OpenAI
    if (inputOpenaiKey) inputOpenaiKey.value = localStorage.getItem("archbench_openai_key") || "";
    if (inputOpenaiModel) inputOpenaiModel.value = localStorage.getItem("archbench_openai_model") || "gpt-4o";
    if (inputOpenaiUrl) inputOpenaiUrl.value = localStorage.getItem("archbench_openai_url") || "https://api.openai.com/v1";

    // Ollama
    if (inputOllamaUrl) inputOllamaUrl.value = localStorage.getItem("archbench_ollama_url") || "http://localhost:11434";
    if (inputOllamaModel) inputOllamaModel.value = localStorage.getItem("archbench_ollama_model") || "qwen2.5:coder";

    const inject = localStorage.getItem("archbench_ai_inject_context");
    if (inject !== null && aiInjectContext) {
        aiInjectContext.checked = inject === "true";
    }

    updateProviderSectionsVisibility();
}

function saveAISettings() {
    if (!aiProviderSelect) return;
    localStorage.setItem("archbench_ai_provider", aiProviderSelect.value);
    
    // Gemini
    if (inputGeminiKey) localStorage.setItem("archbench_gemini_key", inputGeminiKey.value.trim());
    if (inputGeminiModel) localStorage.setItem("archbench_gemini_model", inputGeminiModel.value.trim() || "gemini-2.5-flash");
    if (inputGeminiUrl) localStorage.setItem("archbench_gemini_url", inputGeminiUrl.value.trim() || "https://generativelanguage.googleapis.com");

    // OpenAI
    if (inputOpenaiKey) localStorage.setItem("archbench_openai_key", inputOpenaiKey.value.trim());
    if (inputOpenaiModel) localStorage.setItem("archbench_openai_model", inputOpenaiModel.value.trim() || "gpt-4o");
    if (inputOpenaiUrl) localStorage.setItem("archbench_openai_url", inputOpenaiUrl.value.trim() || "https://api.openai.com/v1");

    // Ollama
    if (inputOllamaUrl) localStorage.setItem("archbench_ollama_url", inputOllamaUrl.value.trim() || "http://localhost:11434");
    if (inputOllamaModel) localStorage.setItem("archbench_ollama_model", inputOllamaModel.value.trim() || "qwen2.5:coder");

    if (aiInjectContext) {
        localStorage.setItem("archbench_ai_inject_context", aiInjectContext.checked);
    }

    showToast("AI configuration saved successfully!");
    if (aiSettingsDrawer) {
        aiSettingsDrawer.classList.remove("open");
    }
    
    // Re-render chat welcoming flow if key just changed
    initChatHistory();
}

function updateProviderSectionsVisibility() {
    if (!aiProviderSelect) return;
    const val = aiProviderSelect.value;
    if (sectionGemini) sectionGemini.style.display = val === "gemini" ? "flex" : "none";
    if (sectionOpenai) sectionOpenai.style.display = val === "openai" ? "flex" : "none";
    if (sectionOllama) sectionOllama.style.display = val === "ollama" ? "flex" : "none";
}

export function appendMessage(role, content, isHtml = false) {
    if (!aiChatHistory) return null;
    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-msg ${role}`;
    
    if (role === "system") {
        msgDiv.textContent = content;
    } else if (isHtml) {
        msgDiv.innerHTML = content;
    } else {
        msgDiv.innerHTML = renderMarkdownToHtml(content);
    }

    aiChatHistory.appendChild(msgDiv);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
    
    // Keep in memory
    chatHistoryLog.push({ role, content, isHtml });
    return msgDiv;
}

function appendTypingIndicator() {
    if (!aiChatHistory) return null;
    const indicatorDiv = document.createElement("div");
    indicatorDiv.className = "ai-msg ai typing";
    indicatorDiv.innerHTML = `
        <div class="ai-typing-indicator">
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
            <span class="ai-typing-dot"></span>
        </div>
    `;
    aiChatHistory.appendChild(indicatorDiv);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
    return indicatorDiv;
}

function hasActiveApiKeyConfigured() {
    const provider = localStorage.getItem("archbench_ai_provider") || "gemini";
    if (provider === "gemini") {
        return !!(localStorage.getItem("archbench_gemini_key") || "").trim();
    } else if (provider === "openai") {
        return !!(localStorage.getItem("archbench_openai_key") || "").trim();
    }
    return true; // Ollama does not require local keys
}

export function initChatHistory() {
    if (!aiChatHistory) return;
    aiChatHistory.innerHTML = "";
    chatHistoryLog = [];
    
    if (!hasActiveApiKeyConfigured()) {
        const setupCard = document.createElement("div");
        setupCard.className = "ai-setup-card";
        setupCard.innerHTML = `
            <div class="ai-setup-icon">🔑</div>
            <div class="ai-setup-title">Setup API Key Required</div>
            <div class="ai-setup-text">Real-time system analysis requires an active LLM API Key. Google Gemini and OpenAI are supported client-side. Keys are stored safely in local storage.</div>
            <button class="ai-setup-btn" id="btn-chat-trigger-settings">⚙️ Configure LLM Settings</button>
        `;
        aiChatHistory.appendChild(setupCard);
        
        const triggerSettingsBtn = setupCard.querySelector("#btn-chat-trigger-settings");
        if (triggerSettingsBtn) {
            triggerSettingsBtn.addEventListener("click", () => {
                if (aiSettingsDrawer) aiSettingsDrawer.classList.add("open");
            });
        }
    } else {
        appendMessage("system", "Welcome to the AI System Architect! Configure your LLM under Settings, click a template shortcut below, or ask a question about your architecture.");
    }
}

export function populateAIChips() {
    if (!aiQuickTemplates) return;
    aiQuickTemplates.innerHTML = "";
    Object.entries(AI_PROMPTS).forEach(([key, info]) => {
        const chip = document.createElement("button");
        chip.className = "ai-chip";
        chip.textContent = info.title;
        chip.addEventListener("click", () => {
            const mdContext = generateKnowledgePackMarkdown();
            const compiledPrompt = info.prompt(mdContext);
            sendChatMessage(compiledPrompt, `Shortcut: ${info.title}`);
        });
        aiQuickTemplates.appendChild(chip);
    });
}

async function sendChatMessage(promptText, displayQuery = null) {
    if (!hasActiveApiKeyConfigured()) {
        appendMessage("error", "⚠️ API Key is missing. Please click 'Settings' at the top of the AI panel to configure your Google Gemini or OpenAI credentials.");
        return;
    }

    const queryToDisplay = displayQuery || (promptText.length > 80 ? promptText.substring(0, 80) + "..." : promptText);
    
    // Add user bubble
    appendMessage("user", queryToDisplay);

    // Add typing indicator
    const typingIndicator = appendTypingIndicator();

    const provider = aiProviderSelect.value;
    let responseText = "";
    let errorOccurred = false;

    try {
        if (provider === "gemini") {
            const apiKey = inputGeminiKey.value.trim();
            const model = inputGeminiModel.value.trim() || "gemini-2.5-flash";
            let baseUrl = inputGeminiUrl.value.trim() || "https://generativelanguage.googleapis.com";
            
            if (!apiKey) {
                throw new Error("Gemini API Key is missing. Click 'Settings' to configure it.");
            }

            // Normalise baseUrl trailing slash
            if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

            const endpoint = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: promptText }]
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorJson = await response.json().catch(() => ({}));
                throw new Error(errorJson.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) {
                throw new Error("Empty response received from Gemini API.");
            }

        } else if (provider === "openai") {
            const apiKey = inputOpenaiKey.value.trim();
            const model = inputOpenaiModel.value.trim() || "gpt-4o";
            let baseUrl = inputOpenaiUrl.value.trim() || "https://api.openai.com/v1";

            if (!apiKey) {
                throw new Error("OpenAI API Key is missing. Click 'Settings' to configure it.");
            }

            if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
            const endpoint = `${baseUrl}/chat/completions`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "user", content: promptText }
                    ],
                    temperature: 0.2
                })
            });

            if (!response.ok) {
                const errorJson = await response.json().catch(() => ({}));
                throw new Error(errorJson.error?.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            responseText = data.choices?.[0]?.message?.content;
            if (!responseText) {
                throw new Error("Empty response received from OpenAI API.");
            }

        } else if (provider === "ollama") {
            let baseUrl = inputOllamaUrl.value.trim() || "http://localhost:11434";
            const model = inputOllamaModel.value.trim() || "qwen2.5:coder";

            if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
            const endpoint = `${baseUrl}/api/chat`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "user", content: promptText }
                    ],
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}. Ensure Ollama is running and OLLAMA_ORIGINS="*" serve is active.`);
            }

            const data = await response.json();
            responseText = data.message?.content;
            if (!responseText) {
                throw new Error("Empty response received from Ollama API.");
            }
        }
    } catch (err) {
        console.error("AI Error:", err);
        responseText = `⚠️ Error: ${err.message}`;
        errorOccurred = true;
    } finally {
        // Remove typing indicator bubble
        if (typingIndicator) typingIndicator.remove();
    }

    // Add assistant response
    if (errorOccurred) {
        appendMessage("error", responseText);
    } else {
        appendMessage("ai", responseText);
    }
}

export function populateAIGrid() {
    populateAIChips();
}
