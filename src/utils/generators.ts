import { NodeData, ConnectionData, Flow, BatchLog } from '../types';
import { generateArchitectureHealthReport } from './health-engine';
import { calculateArchitectureQualityScore } from './metrics';

export function generateExecutionLogJSON(
    flow: Flow | null,
    currentStepIndex: number,
    nodes: NodeData[]
) {
    if (!flow) return null;
    const logSteps = flow.steps.slice(0, currentStepIndex + 1).map((s, idx) => {
        const nodeObj = nodes.find(n => n.id === s.node);
        return {
            step: idx + 1,
            node: nodeObj ? nodeObj.title : s.node,
            action: s.label,
            details: s.detail,
            data: s.data || "N/A"
        };
    });
    return {
        flow: flow.title,
        version: "1.0",
        timestamp: new Date().toISOString(),
        steps: logSteps
    };
}

export function generateExecutionLogMarkdown(
    flow: Flow | null,
    currentStepIndex: number,
    nodes: NodeData[],
    projectVersion: string = "1.0"
) {
    if (!flow) return "No active simulation flow.";
    const log = generateExecutionLogJSON(flow, currentStepIndex, nodes);
    if (!log) return "No active simulation flow.";
    let md = `# Simulation Execution Log: ${log.flow}\n\n`;
    md += `* **Timestamp:** ${log.timestamp}\n`;
    md += `* **Ecosystem Version:** ${projectVersion}\n\n`;
    md += `## Executed Steps\n\n`;
    md += `| Step | System Node | Action / Label | Data / Payload |\n`;
    md += `|---|---|---|---|\n`;
    log.steps.forEach(s => {
        md += `| ${s.step} | **${s.node}** | ${s.action} | \`${s.data}\` |\n`;
    });
    md += `\n\n### Step Details\n\n`;
    log.steps.forEach(s => {
        md += `#### Step ${s.step}: ${s.node}\n`;
        md += `* **Action:** ${s.action}\n`;
        md += `* **Description:** ${s.details}\n`;
        md += `* **Data Transferred:** \`${s.data}\`\n\n`;
    });
    return md;
}

export function generateKnowledgePackJSON(
    title: string,
    version: string,
    nodes: NodeData[],
    connections: ConnectionData[],
    flows: Flow[],
    activeFlow: Flow | null,
    activeStepIndex: number,
    unifiedBatchLog: BatchLog | null,
    historyCache: { auditRuns: any[]; architectureSnapshots: any[]; healthHistory: any[] }
) {
    return {
        metadata: {
            project: title || "Untitled Project",
            document: "Architecture Knowledge Pack",
            version: version || "1.0",
            exportedAt: new Date().toISOString()
        },
        nodes: nodes.map(n => ({
            id: n.id,
            title: n.title,
            category: n.category,
            description: n.desc || n.description,
            structure: n.sections || [],
            flowNotes: n.flow || null,
            callout: n.callout || null
        })),
        connections: connections.map(([from, to, label, type]) => ({
            from,
            to,
            label,
            type: type === "request" ? "Request Flow (Solid)" : (type === "data" ? "Data Flow (Dashed)" : "Future Evolution (Dotted)")
        })),
        flows: flows.map(f => ({
            id: f.id,
            title: f.title,
            subtitle: f.subtitle,
            steps: f.steps.map((s, idx) => ({
                step: idx + 1,
                node: s.node,
                action: s.label,
                description: s.detail,
                data: s.data
            }))
        })),
        activeSimulationLog: activeFlow ? generateExecutionLogJSON(activeFlow, activeStepIndex, nodes) : null,
        unifiedBatchLog: unifiedBatchLog || null,
        architectureHealthReport: unifiedBatchLog ? generateArchitectureHealthReport(unifiedBatchLog, nodes, connections) : null,
        history: {
            auditRuns: historyCache.auditRuns || [],
            snapshots: historyCache.architectureSnapshots || [],
            healthHistory: historyCache.healthHistory || []
        }
    };
}

export function generateKnowledgePackMarkdown(
    title: string,
    version: string,
    nodes: NodeData[],
    connections: ConnectionData[],
    flows: Flow[],
    activeFlow: Flow | null,
    activeStepIndex: number,
    unifiedBatchLog: BatchLog | null,
    historyCache: { auditRuns: any[]; architectureSnapshots: any[]; healthHistory: any[] }
) {
    const pack = generateKnowledgePackJSON(title, version, nodes, connections, flows, activeFlow, activeStepIndex, unifiedBatchLog, historyCache);
    let md = `# Architecture Context & Knowledge Pack\n\n`;
    md += `*Generated automatically by Architecture Workbench on ${pack.metadata.exportedAt}*\n\n`;
    md += `---\n\n`;
    
    md += `## 1. System Nodes & Responsibilities\n\n`;
    pack.nodes.forEach(n => {
        md += `### ${n.title} (${n.category})\n`;
        md += `${n.description || ''}\n\n`;
        if (n.structure && n.structure.length > 0) {
            n.structure.forEach(s => {
                if (s.label) md += `* **${s.label}:**\n`;
                s.items.forEach(item => {
                    md += `  * ${item.replace('~', '').replace('*', '')}\n`;
                });
            });
        }
        if (n.callout) {
            md += `> **[${n.callout.type.toUpperCase()}]** ${n.callout.text}\n\n`;
        }
        md += `\n`;
    });
    
    md += `## 2. System Connections & Data Streams\n\n`;
    md += `| Source System | Target System | Interaction / Stream | Type |\n`;
    md += `|---|---|---|---|\n`;
    pack.connections.forEach(c => {
        md += `| ${c.from} | ${c.to} | ${c.label} | ${c.type} |\n`;
    });
    md += `\n\n`;
    
    md += `## 3. Standard Simulation Flows\n\n`;
    pack.flows.forEach(f => {
        md += `### Flow: ${f.title}\n`;
        md += `*${f.subtitle}*\n\n`;
        f.steps.forEach(s => {
            md += `* **Step ${s.step} [${s.node}]:** ${s.action}\n`;
            md += `  * *Details:* ${s.description}\n`;
            md += `  * *Data:* \`${s.data || ''}\`\n`;
        });
        md += `\n`;
    });
    
    if (pack.activeSimulationLog) {
        md += `## 4. Current Recorded Execution Log\n\n`;
        md += `The simulator recorded an active run of **${pack.activeSimulationLog.flow}**:\n\n`;
        md += `| Step | System Node | Action / Label | Data / Payload |\n`;
        md += `|---|---|---|---|\n`;
        pack.activeSimulationLog.steps.forEach(s => {
            md += `| ${s.step} | **${s.node}** | ${s.action} | \`${s.data}\` |\n`;
        });
    }

    if (pack.unifiedBatchLog) {
        md += `\n\n---\n\n`;
        md += `## 5. Unified Audit Log\n\n`;
        md += `The simulator recorded a batch audit trail of the following workflows: ${pack.unifiedBatchLog.flowsSimulated.join(", ")}\n\n`;
        md += `| Seq | Flow Scenario | System Node | Action / Label | Data / Payload |\n`;
        md += `|---|---|---|---|---|\n`;
        pack.unifiedBatchLog.steps.forEach((s, idx) => {
            md += `| ${idx + 1} | **${s.flow}** | **${s.node}** | ${s.action} | \`${s.details}\` |\n`;
        });

        if (pack.architectureHealthReport) {
            const report = pack.architectureHealthReport;
            md += `\n\n---\n\n`;
            md += `## 6. Architecture Health Report\n\n`;
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
        }
    }
    
    if (pack.history && pack.history.auditRuns && pack.history.auditRuns.length > 0) {
        md += `\n\n---\n\n`;
        md += `## 7. Local Architecture Audit History\n\n`;
        md += `Total audit runs stored in local history: **${pack.history.auditRuns.length}**\n\n`;
        md += `| Run ID | Timestamp | Version | Flows | Steps | Quality Score |\n`;
        md += `|---|---|---|---|---|---|\n`;
        pack.history.auditRuns.forEach(run => {
            const dateStr = new Date(run.timestamp).toLocaleString();
            const score = run.architectureHealthReport ? calculateArchitectureQualityScore(run.architectureHealthReport) : 0;
            md += `| \`${run.id}\` | ${dateStr} | ${run.architectureVersion} | ${run.flowsExecuted.length} | ${run.architectureHealthReport?.summary?.totalSteps || 0} | **${score}/100** |\n`;
        });
        
        md += `\n\n### Architecture Evolution Timeline\n\n`;
        pack.history.snapshots.forEach((snap, idx) => {
            const dateStr = new Date(snap.timestamp).toLocaleString();
            const healthRec = pack.history.healthHistory.find(h => h.id === "health_" + snap.id.split("_")[1]);
            const score = healthRec ? calculateArchitectureQualityScore(pack.history.auditRuns.find(r => r.id === "run_" + snap.id.split("_")[1])?.architectureHealthReport || null as any) : "N/A";
            md += `* **Audit #${idx + 1} (${dateStr}):** Nodes: **${snap.nodeCount}**, Connections: **${snap.connectionCount}**, SPOFs: **${healthRec ? healthRec.spofCount : "N/A"}**, Quality Score: **${score}/100**\n`;
        });
    }

    return md;
}
