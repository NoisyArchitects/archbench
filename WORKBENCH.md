# ArcBench Developer & Agent Workbench Guide

This document describes the structure of the ArcBench workspace and details the environment for both human developers and external AI agents.

---

## 1. Directory Structure

The project directory contains the following layout:

* **[index.html](file:///Users/rish/Desktop/traceauth/archbench/index.html)**: The UI cockpit and visual simulation renderer.
* **[graph.js](file:///Users/rish/Desktop/traceauth/archbench/graph.js)**: Core runtime parsing, SVG rendering, history tracking, and onboarding logic.
* **[graph.css](file:///Users/rish/Desktop/traceauth/archbench/graph.css)**: Glassmorphic theme definitions and wizard styles.
* **[docs/](file:///Users/rish/Desktop/traceauth/archbench/docs/)**: Specification kit guides, schemas, examples, and agent instructions.
  * **[agent_prompt.md](file:///Users/rish/Desktop/traceauth/archbench/docs/agent_prompt.md)**: Standardized instructions for LLM spec generation.
  * **[architecture.schema.md](file:///Users/rish/Desktop/traceauth/archbench/docs/architecture.schema.md)**: Technical spec format guidelines.
* **[samples/](file:///Users/rish/Desktop/traceauth/archbench/samples/)**: Sample target projects.
  * **[trace.js](file:///Users/rish/Desktop/traceauth/archbench/samples/trace.js)**: Seed project pre-loaded globally.
  * **[trace.md](file:///Users/rish/Desktop/traceauth/archbench/samples/trace.md)**: Canonical specification file for the TRACE project.
* **[PROJECT_RULES.md](file:///Users/rish/Desktop/traceauth/archbench/PROJECT_RULES.md)**: Rules for modifying the architecture specifications.

---

## 2. Dynamic Change Detection & Project Refresh

ArcBench features **Live Watch** support to sync modifications made by external agents or editors back to the browser canvas:

1. **Serve Locally**: Serve the directory using any local web server (e.g. `npx http-server` or `python -m http.server`).
2. **Toggle Watch**: Click the `👁️ Live Watch` toggle button in the top-bar interface of the web app.
3. **Automatic Refresh**: The workbench will periodically query the project source (such as `samples/trace.md` or `architecture.md`). When changes are written to disk, ArcBench automatically parses the updates and hot-reloads the visual canvas.

---

## 3. Command Line Auditing

You can run terminal-based spec validation using the Node.js CLI tool:

```bash
node arch-cli.js validate samples/trace.md
```

This will run validation audits and output coupling anomalies, SPOFs, or reference errors without needing to open a browser.
