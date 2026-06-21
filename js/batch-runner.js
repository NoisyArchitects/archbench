import { project, FLOWS, NODES, activeFlow, activeStep, unifiedBatchLog, setActiveFlow, setActiveStep, setUnifiedBatchLog } from "../graph.js";
import { stopAutoPlay, exitFlow, renderFlowStep, updateArchitectureHealthUI, switchTab } from "../graph.js";
import { saveAuditRun } from "./db.js";
import { generateArchitectureHealthReport } from "./reports/health-engine.js";
import { showToast } from "./utils.js";

let batchChecklist, btnStartBatch, btnStopBatch, flowPanel, helpHint;

let isBatchRunning = false;
let batchQueue = [];
let batchQueueIndex = 0;
let batchTimer = null;

export function initBatchRunner() {
    batchChecklist = document.getElementById("batch-checklist");
    btnStartBatch = document.getElementById("btn-start-batch");
    btnStopBatch = document.getElementById("btn-stop-batch");
    flowPanel = document.getElementById("flow-playback");
    helpHint = document.getElementById("help-hint");

    if (btnStartBatch) {
        btnStartBatch.addEventListener("click", startBatchRun);
    }
    if (btnStopBatch) {
        btnStopBatch.addEventListener("click", stopBatchRun);
    }

    populateBatchChecklist();
}

export function populateBatchChecklist() {
    if (!batchChecklist) return;
    batchChecklist.innerHTML = "";
    FLOWS.forEach(flow => {
        const item = document.createElement("label");
        item.className = "batch-checkbox-item";
        item.dataset.flow = flow.id;
        item.innerHTML = `
            <input type="checkbox" value="${flow.id}" checked>
            <span class="flow-btn-dot" style="background:${flow.color}; width: 8px; height: 8px; display: inline-block; border-radius: 50%; margin-right: 4px;"></span>
            <span>${flow.title}</span>
        `;
        batchChecklist.appendChild(item);
    });
}

function startBatchRun() {
    const checkedBoxes = batchChecklist.querySelectorAll("input[type='checkbox']:checked");
    const selectedFlowIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedFlowIds.length === 0) {
        showToast("Please select at least one flow!");
        return;
    }

    stopAutoPlay();
    isBatchRunning = true;
    batchQueue = selectedFlowIds;
    batchQueueIndex = 0;
    
    setUnifiedBatchLog({
        title: "Unified Architecture Simulation Audit",
        version: project.version || "1.0",
        timestamp: new Date().toISOString(),
        flowsSimulated: selectedFlowIds.map(fid => {
            const f = FLOWS.find(flow => flow.id === fid);
            return f ? f.title : fid;
        }),
        steps: []
    });

    if (btnStartBatch) btnStartBatch.style.display = "none";
    if (btnStopBatch) btnStopBatch.style.display = "block";
    
    const statusMsg = document.getElementById("batch-status-msg");
    if (statusMsg) statusMsg.textContent = "Preparing batch run...";

    // Disable checkboxes during run
    batchChecklist.querySelectorAll("input[type='checkbox']").forEach(cb => {
        cb.disabled = true;
    });

    // Reset all list items styling
    batchChecklist.querySelectorAll(".batch-checkbox-item").forEach(item => {
        item.classList.remove("active", "completed");
    });

    runNextFlowInBatch();
}

function runNextFlowInBatch() {
    if (!isBatchRunning) return;

    if (batchQueueIndex >= batchQueue.length) {
        finishBatchRun();
        return;
    }

    const flowId = batchQueue[batchQueueIndex];
    const flow = FLOWS.find(f => f.id === flowId);
    if (!flow) {
        batchQueueIndex++;
        runNextFlowInBatch();
        return;
    }

    // Highlight active flow checklist item
    const itemEl = batchChecklist.querySelector(`.batch-checkbox-item[data-flow="${flowId}"]`);
    if (itemEl) {
        itemEl.classList.add("active");
        itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Start flow on graph
    setActiveFlow(flow);
    setActiveStep(0);
    
    // Show panel & switch to simulator tab
    if (flowPanel) flowPanel.classList.remove("collapsed", "hidden");
    switchTab("simulator");
    if (helpHint) helpHint.style.display = "none";

    const statusMsg = document.getElementById("batch-status-msg");
    if (statusMsg) statusMsg.textContent = `Simulating: ${flow.title}...`;

    renderFlowStep();
    advanceBatchStep();
}

function advanceBatchStep() {
    if (!isBatchRunning || !activeFlow) return;

    // Record step
    const s = activeFlow.steps[activeStep];
    const nodeObj = NODES.find(n => n.id === s.node);
    
    const stepsList = [...unifiedBatchLog.steps];
    stepsList.push({
        seq: stepsList.length + 1,
        flow: activeFlow.title,
        flowStep: activeStep + 1,
        node: nodeObj ? nodeObj.title : s.node,
        action: s.label,
        details: s.detail,
        data: s.data || "N/A"
    });
    
    const updatedLog = { ...unifiedBatchLog, steps: stepsList };
    setUnifiedBatchLog(updatedLog);

    batchTimer = setTimeout(() => {
        if (activeStep < activeFlow.steps.length - 1) {
            setActiveStep(activeStep + 1);
            renderFlowStep();
            advanceBatchStep();
        } else {
            // Completed this flow!
            const itemEl = batchChecklist.querySelector(`.batch-checkbox-item[data-flow="${activeFlow.id}"]`);
            if (itemEl) {
                itemEl.classList.remove("active");
                itemEl.classList.add("completed");
            }

            batchQueueIndex++;
            runNextFlowInBatch();
        }
    }, 1500);
}

export function stopBatchRun() {
    isBatchRunning = false;
    if (batchTimer) { clearTimeout(batchTimer); batchTimer = null; }

    if (batchChecklist) {
        batchChecklist.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.disabled = false;
        });
    }

    if (btnStartBatch) btnStartBatch.style.display = "block";
    if (btnStopBatch) btnStopBatch.style.display = "none";
    
    const statusMsg = document.getElementById("batch-status-msg");
    if (statusMsg) statusMsg.textContent = "Batch audit stopped.";

    setUnifiedBatchLog(null);
    exitFlow();
    updateArchitectureHealthUI();
}

function finishBatchRun() {
    isBatchRunning = false;
    if (batchTimer) { clearTimeout(batchTimer); batchTimer = null; }

    if (batchChecklist) {
        batchChecklist.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.disabled = false;
        });
    }

    if (btnStartBatch) btnStartBatch.style.display = "block";
    if (btnStopBatch) btnStopBatch.style.display = "none";
    
    const statusMsg = document.getElementById("batch-status-msg");
    if (statusMsg) statusMsg.textContent = "Batch simulation complete! Log compiled.";

    exitFlow();

    saveAuditRun(unifiedBatchLog).then(() => {
        updateArchitectureHealthUI();
        switchTab("health");
        showToast("Batch audit complete! Health Report generated & saved to local history.");
    }).catch(err => {
        console.error("History persistence error:", err);
        updateArchitectureHealthUI();
        switchTab("health");
        showToast("Batch audit complete! Health Report generated.");
    });
}

export function generateBatchLogMarkdown(batchLog) {
    if (!batchLog) return "No active batch log.";
    let md = `# Unified Architecture Simulation Audit & Health Report\n\n`;
    md += `* **Timestamp:** ${batchLog.timestamp}\n`;
    md += `* **Ecosystem Version:** ${batchLog.version}\n`;
    md += `* **Flows Audited:** ${batchLog.flowsSimulated.join(", ")}\n\n`;

    const report = generateArchitectureHealthReport(batchLog);
    if (report) {
        md += `## 1. Architecture Health Report\n\n`;

        md += `### Ecosystem Summary\n\n`;
        md += `* Flows Executed: **${report.summary.flowsExecuted}**\n`;
        md += `* Total Steps: **${report.summary.totalSteps}**\n`;
        md += `* Unique Nodes Activated: **${report.summary.uniqueNodesActivated}**\n`;
        md += `* Connections Traversed: **${report.summary.connectionsTraversed}**\n\n`;

        md += `### Most Active Nodes\n\n`;
        md += `* **Most Used Node:** ${report.mostActiveNode.title} (${report.mostActiveNode.count} activations)\n\n`;
        md += `| Rank | System Node | Activations |\n`;
        md += `|---|---|---|\n`;
        report.ranking.forEach((n, idx) => {
            md += `| ${idx + 1} | **${n.title}** | ${n.count} |\n`;
        });

        md += `\n### Least Active Nodes\n\n`;
        report.leastActiveNodes.forEach(n => {
            md += `* **${n.title}**: ${n.count} activations\n`;
        });

        md += `\n### Critical Dependencies\n\n`;
        report.criticalDeps.forEach(dep => {
            md += `* **${dep.title}** appeared in **${dep.percentage}%** of flows\n`;
        });

        md += `\n### Flow Complexity Analysis\n\n`;
        md += `| Flow Scenario | Steps | Nodes | Complexity |\n`;
        md += `|---|---|---|---|\n`;
        report.flowComplexity.forEach(fc => {
            md += `| ${fc.flow} | ${fc.stepCount} | ${fc.nodeCount} | **${fc.complexity}** |\n`;
        });

        md += `\n### Trust Boundary Analysis\n\n`;
        md += `* Secure Backend zone entered by **${report.trustBoundary.flowsCrossingBoundary} / ${report.summary.flowsExecuted}** flows.\n`;
        md += `* Total Boundary Entries: **${report.trustBoundary.boundaryEntries}**\n`;
        md += `* Total Boundary Exits: **${report.trustBoundary.boundaryExits}**\n\n`;

        md += `### Database Impact Analysis\n\n`;
        md += `* Total Database Operations: **${report.databaseImpact.dbTouchCount}** (Reads: **${report.databaseImpact.dbReads}**, Writes: **${report.databaseImpact.dbWrites}**)\n\n`;
        md += `| Flow Scenario | Database Queries |\n`;
        md += `|---|---|\n`;
        report.databaseImpact.dbFlowActivity.forEach(act => {
            md += `| ${act.flow} | ${act.count} |\n`;
        });

        md += `\n### Analytics Coverage\n\n`;
        md += `* **${report.analyticsCoverage.flowsFeedingAnalytics} of ${report.summary.flowsExecuted}** flows feed Analytics Engine.\n`;
        if (report.analyticsCoverage.bypassingFlows.length > 0) {
            md += `* **Bypassed by:** ${report.analyticsCoverage.bypassingFlows.join(", ")}\n`;
        }

        md += `\n### Architecture Observations\n\n`;
        report.observations.forEach(obs => {
            md += `* ${obs}\n`;
        });

        md += `\n### Architecture Risk Indicators\n\n`;
        if (report.risks.length > 0) {
            report.risks.forEach(risk => {
                md += `* **[${risk.severity.toUpperCase()}] ${risk.title}**: ${risk.desc}\n`;
            });
        } else {
            md += `* No risks detected.\n`;
        }
        md += `\n---\n\n`;
    }

    md += `## 2. Unified Audit Trail\n\n`;
    md += `| Seq | Flow Scenario | System Node | Action / Label | Data / Payload |\n`;
    md += `|---|---|---|---|---|\n`;
    batchLog.steps.forEach(s => {
        md += `| ${s.seq} | **${s.flow}** | **${s.node}** | ${s.action} | \`${s.data}\` |\n`;
    });
    md += `\n\n### Detailed Step Audit Trail\n\n`;
    batchLog.steps.forEach(s => {
        md += `#### Step ${s.seq}: [${s.flow}] ${s.node}\n`;
        md += `* **Action:** ${s.action}\n`;
        md += `* **Description:** ${s.details}\n`;
        md += `* **Data Transferred:** \`${s.data}\`\n\n`;
    });
    return md;
}
