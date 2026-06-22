# ArchBench (Architecture Workbench)

ArchBench is a local-first, open-source Architecture IDE and system design workbench. It allows software engineers, architects, founders, and AI agents to design, visualize, simulate, audit, and document complex system architectures using interactive visual canvases and Markdown-based specifications.

ArchBench is designed to be fully self-contained and private: **your code, your architecture diagram, your API keys, and your IndexedDB timeline history remain strictly on your local machine.**

---

## 🌐 Try It Instantly (No Install)

You can launch and use ArchBench immediately in your browser with zero setup:
👉 **[Launch ArchBench Web App](https://archbench.netlify.app/)**

*Even though it is hosted on the web, it remains completely local-first. All diagram layouts, configuration specs, API credentials, and version comparison timelines are stored securely in your browser's local IndexedDB and never leave your machine.*

---

## 🌟 Core Philosophy

* **Local First:** Fast, offline-first interface using local specifications and browser storage.
* **Bring Your Own LLM:** Connect Gemini, Claude, OpenAI, OpenRouter, or local models via Ollama.
* **Bring Your Own Project:** Drag-and-drop or load arbitrary directory trees.
* **Data Ownership:** Your diagrams, logs, and audit timelines stay in your browser's IndexedDB.
* **Open Source:** Released under the permissive MIT license.

---

## 🚀 Key Features

### 1. Interactive Visual Canvas
A modern, responsive canvas powered by React Flow featuring custom layouts, zones, security trust boundaries, and interactive node elements. Hovering or selecting a node dynamically highlights all of its active connections, data flows, and paths with a glowing HSL theme color.

### 2. Architecture as Code (AAC)
Define your architecture declaratively in a single file (`architecture.md`). Specify services, entry points, infrastructure databases, external APIs, and active flow traces. ArchBench parses this specification and instantly renders the diagram.

### 3. Trace Flow Simulator
Step through operational sequences, API requests, and data cycles visually. Select a flow and step forward or backward to see animated data packets traverse nodes and see execution details in real-time.

### 4. Interactive Terminal Shell
An in-app, architecture-aware command console powered by `xterm.js`. Run utility commands directly in the browser:
* `arch parse` — Validate syntax and connections.
* `arch simulate <flow>` — Load and step a trace sequence.
* `arch audit` — Run coupling analysis, architectural reviews, and security boundary audits.
* `arch compare` — Query local IndexedDB snapshot version history.

### 5. Multi-Path Onboarding Wizard
Easily onboard new or existing projects:
* **Analyze Existing Project:** Point to a local directory tree. ArchBench scans for an existing `architecture.md` file, or runs a folder structure heuristic auto-scanner to scaffold a system diagram (auto-detecting frontend/API/DB layout).
* **Design New Project:** Enter a text prompt describing your concept, and scaffold modules, connections, and flows using AI.

---

## 📦 Directory Structure

* [index.html](index.html) — Static application shell.
* [src/App.tsx](src/App.tsx) — Main entry layout and polling state synchronizer.
* [src/components/ReactFlowCanvas.tsx](src/components/ReactFlowCanvas.tsx) — React Flow canvas wrapper, selection state hooks, and background grid rendering.
* [src/components/CustomEdge.tsx](src/components/CustomEdge.tsx) — Custom path generation, glowing animations, and flow indicators.
* [src/components/Sidebar.tsx](src/components/Sidebar.tsx) — Dynamic tab manager (AI auditing, playback simulator, terminal shell, and version comparison).
* [src/store/useProjectStore.ts](src/store/useProjectStore.ts) — Zustand global state store.
* [src/utils/parser.ts](src/utils/parser.ts) — Markdown parser converting `architecture.md` into React Flow components.
* [docs/](docs) — Authoring schemas, prompt parameters, and spec templates.
* [samples/](samples) — Built-in project models for testing.

---

## 🖥️ Native Desktop App (Upcoming)

We are actively developing a native desktop application for ArchBench (targeting macOS, Linux, and Windows) to allow offline-first file-system integration, background file watchers, and direct terminal shell hooks. 

If you are excited about the desktop release, want to request features, or have feedback:
* Vote or comment in our **[GitHub Discussions](https://github.com/NoisyArchitects/archbench/discussions)**
* Open a **[GitHub Issue](https://github.com/NoisyArchitects/archbench/issues)**
* Reach out to the maintainers at **[Noisy Architects](https://github.com/NoisyArchitects)**

---

## 🛠️ Installation & Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Download & Install
Clone the repository and install the dependencies:
```bash
git clone https://github.com/NoisyArchitects/archbench.git
cd archbench
npm install
```

### 2. Run the Development Server
Launch the application locally in development mode with hot-reloading:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Local Heuristics & Live Watch (Optional)
To use the local CLI validation tool or watch served spec files directly from your workspace, run the in-app server:
```bash
node arch-cli.js validate samples/demo.md
```

### 4. Build for Production
Create an optimized, minified bundle:
```bash
npm run build
```

---

## 🤝 Community & Contributing

We welcome contributions, bug reports, and suggestions from developers of all backgrounds.

Please review our community files:
* **License:** [LICENSE](LICENSE) (MIT Licensed)
* **Code of Conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for behavior guidelines.
