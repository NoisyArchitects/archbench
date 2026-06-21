import { NODES, FLOWS, nodeEls, trustEl, unifiedBatchLog } from "../graph.js";
import { panToNode, drawConnections, switchTab, updateExecutionLogUI } from "../graph.js";

// State
export let activeFlow = null;
export let activeStep = -1;
export function setActiveFlow(val) { activeFlow = val; }
export function setActiveStep(val) { activeStep = val; }
let isAutoPlaying = false;
let autoTimer = null;

// DOM references (resolved on init)
let fpBadge, fpLabel, fpDetail, fpCounter, fpProgress, fpData, fpPrev, fpNext, fpPlay, fpClose;
let svgLayer, flowPanel, helpHint;

export function initFlowEngine() {
    fpBadge = document.getElementById("fp-step-badge");
    fpLabel = document.getElementById("fp-step-label");
    fpDetail = document.getElementById("fp-step-detail");
    fpCounter = document.getElementById("fp-step-counter");
    fpProgress = document.getElementById("fp-progress-fill");
    fpData = document.getElementById("fp-step-data");
    fpPrev = document.getElementById("fp-prev");
    fpNext = document.getElementById("fp-next");
    fpPlay = document.getElementById("fp-play");
    fpClose = document.getElementById("fp-close");
    svgLayer = document.getElementById("connections-svg");
    flowPanel = document.getElementById("flow-playback");
    helpHint = document.getElementById("help-hint");

    // Event listeners
    if (fpClose) fpClose.addEventListener("click", exitFlow);
    if (fpPrev) fpPrev.addEventListener("click", prevStep);
    if (fpNext) fpNext.addEventListener("click", nextStep);
    if (fpPlay) fpPlay.addEventListener("click", toggleAutoPlay);
}

export function startFlow(flowId) {
    // We cannot reassign import unifiedBatchLog directly, but we can assume it might be reset by the caller
    // or we can import the setter and set it to null
    // Let's import setUnifiedBatchLog from graph.js!
    import("../graph.js").then(module => {
        if (typeof module.setUnifiedBatchLog === "function") {
            module.setUnifiedBatchLog(null);
        }
    });

    const flow = FLOWS.find(f => f.id === flowId);
    if (!flow) return;

    // Stop any auto play
    stopAutoPlay();

    // Set active flow
    activeFlow = flow;
    activeStep = 0;

    // Update flow bar button states
    document.querySelectorAll(".flow-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.flow === flowId);
    });

    // Expand sidebar and switch to simulator tab
    if (flowPanel) flowPanel.classList.remove("collapsed", "hidden");
    switchTab("simulator");

    // Hide help hint and legend during flow
    if (helpHint) helpHint.style.display = "none";

    // Render first step
    renderFlowStep();
}

export function exitFlow() {
    stopAutoPlay();
    activeFlow = null;
    activeStep = -1;

    // Reset button states
    document.querySelectorAll(".flow-btn").forEach(b => b.classList.remove("active"));

    // Clear all flow states from nodes
    Object.values(nodeEls).forEach(el => {
        el.classList.remove("flow-dimmed", "flow-active", "flow-current", "flow-completed");
    });

    // Clear step badges
    NODES.forEach(n => {
        const badge = document.getElementById(`badge-${n.id}`);
        if (badge) { 
            badge.classList.remove("visible", "current"); 
            badge.textContent = ""; 
        }
    });

    // Reset trust boundary
    if (trustEl) trustEl.classList.remove("flow-highlight");

    // Reset connection states
    clearFlowConnections();

    // Redraw connections clean
    drawConnections();

    // Reset panel to Simulator tab if not batch log reviewing
    if (!unifiedBatchLog && typeof switchTab === "function") switchTab("simulator");
}

export function nextStep() {
    if (!activeFlow) return;
    if (activeStep < activeFlow.steps.length - 1) {
        activeStep++;
        renderFlowStep();
    } else if (isAutoPlaying) {
        stopAutoPlay();
    }
}

export function prevStep() {
    if (!activeFlow || activeStep <= 0) return;
    activeStep--;
    renderFlowStep();
}

export function toggleAutoPlay() {
    if (isAutoPlaying) {
        stopAutoPlay();
    } else {
        isAutoPlaying = true;
        if (fpPlay) {
            fpPlay.classList.add("playing");
            const playIcon = fpPlay.querySelector(".play-icon");
            const pauseIcon = fpPlay.querySelector(".pause-icon");
            if (playIcon) playIcon.style.display = "none";
            if (pauseIcon) pauseIcon.style.display = "block";
        }
        autoAdvance();
    }
}

export function stopAutoPlay() {
    isAutoPlaying = false;
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    if (fpPlay) {
        fpPlay.classList.remove("playing");
        const playIcon = fpPlay.querySelector(".play-icon");
        const pauseIcon = fpPlay.querySelector(".pause-icon");
        if (playIcon) playIcon.style.display = "block";
        if (pauseIcon) pauseIcon.style.display = "none";
    }
}

function autoAdvance() {
    if (!isAutoPlaying || !activeFlow) return;
    autoTimer = setTimeout(() => {
        if (activeStep < activeFlow.steps.length - 1) {
            activeStep++;
            renderFlowStep();
            autoAdvance();
        } else {
            stopAutoPlay();
        }
    }, 2800);
}

export function renderFlowStep() {
    if (!activeFlow) return;
    const flow = activeFlow;
    const step = flow.steps[activeStep];
    const totalSteps = flow.steps.length;

    // ── Update playback panel ──
    if (fpBadge) {
        fpBadge.textContent = activeStep + 1;
        fpBadge.style.background = `linear-gradient(135deg, ${flow.color}, color-mix(in srgb, ${flow.color} 70%, white))`;
    }
    if (fpLabel) fpLabel.textContent = step.label;
    if (fpDetail) fpDetail.textContent = step.detail;
    if (fpCounter) fpCounter.textContent = `${activeStep + 1} / ${totalSteps}`;
    if (fpProgress) fpProgress.style.width = ((activeStep + 1) / totalSteps * 100) + "%";

    if (fpData) {
        if (step.data) {
            fpData.textContent = step.data;
            fpData.classList.add("visible");
        } else {
            fpData.classList.remove("visible");
        }
    }

    // Button states
    if (fpPrev) fpPrev.disabled = activeStep === 0;
    if (fpNext) fpNext.disabled = activeStep === totalSteps - 1;

    // ── Collect nodes in this flow ──
    const flowNodeIds = [...new Set(flow.steps.map(s => s.node))];

    // ── Apply node states ──
    NODES.forEach(n => {
        const el = nodeEls[n.id];
        if (!el) return;
        const badge = document.getElementById(`badge-${n.id}`);
        const isInFlow = flowNodeIds.includes(n.id);

        // Reset
        el.classList.remove("flow-dimmed", "flow-active", "flow-current", "flow-completed");
        if (badge) {
            badge.classList.remove("visible", "current");
            badge.textContent = "";
        }

        if (!isInFlow) {
            el.classList.add("flow-dimmed");
            return;
        }

        // Find this node's step indices in the flow
        const nodeSteps = [];
        flow.steps.forEach((s, i) => { if (s.node === n.id) nodeSteps.push(i); });

        // Find the relevant step for this node relative to current
        const activeNodeStep = nodeSteps.filter(i => i <= activeStep);

        if (activeNodeStep.length > 0) {
            const lastActiveIdx = activeNodeStep[activeNodeStep.length - 1];
            if (lastActiveIdx === activeStep) {
                el.classList.add("flow-current");
                if (badge) {
                    badge.textContent = lastActiveIdx + 1;
                    badge.style.background = `linear-gradient(135deg, ${n.color}, color-mix(in srgb, ${n.color} 60%, white))`;
                    badge.classList.add("visible", "current");
                }
            } else {
                el.classList.add("flow-active", "flow-completed");
                if (badge) {
                    badge.textContent = lastActiveIdx + 1;
                    badge.style.background = n.color;
                    badge.classList.add("visible");
                }
            }
        } else {
            // Future step — show as active but not yet reached
            el.classList.add("flow-active");
            el.style.opacity = "0.4";
            setTimeout(() => { if (el.classList.contains("flow-active")) el.style.opacity = ""; }, 10);
        }
    });

    // ── Apply connection states ──
    applyFlowToConnections();

    // ── Trust boundary highlight ──
    if (trustEl) trustEl.classList.toggle("flow-highlight", !!step.trustHighlight);

    // ── Pan camera to current node ──
    panToNode(step.node, true);

    // ── Update active execution log in background ──
    if (typeof updateExecutionLogUI === "function") updateExecutionLogUI();
}

export function applyFlowToConnections() {
    if (!activeFlow || !svgLayer) return;
    const flow = activeFlow;

    // Build list of active edges: consecutive steps form edges
    const activeEdges = [];
    const prevEdges = [];
    for (let i = 0; i < activeStep; i++) {
        prevEdges.push([flow.steps[i].node, flow.steps[i+1].node]);
    }
    if (activeStep > 0) {
        activeEdges.push([flow.steps[activeStep-1].node, flow.steps[activeStep].node]);
    }

    svgLayer.querySelectorAll(".conn-line,.conn-arrow,.conn-label,.conn-dot").forEach(el => {
        const f = el.dataset.from, t = el.dataset.to;

        // Check if this connection matches any flow edge (in either direction)
        const isActive = activeEdges.some(([a,b]) => (f===a&&t===b)||(f===b&&t===a));
        const isPrev   = prevEdges.some(([a,b]) => (f===a&&t===b)||(f===b&&t===a));

        el.classList.remove("flow-dimmed","flow-active","flow-active-prev");

        if (isActive) {
            el.classList.add("flow-active");
        } else if (isPrev) {
            el.classList.add("flow-active-prev");
        } else {
            el.classList.add("flow-dimmed");
        }
    });
}

export function clearFlowConnections() {
    if (!svgLayer) return;
    svgLayer.querySelectorAll(".conn-line,.conn-arrow,.conn-label,.conn-dot").forEach(el => {
        el.classList.remove("flow-dimmed","flow-active","flow-active-prev");
    });
}
