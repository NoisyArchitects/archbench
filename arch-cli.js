#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ─── COMMANDS ────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];

if (!command || command !== 'validate') {
    console.log("Usage: node arch-cli.js validate <file_path.md>");
    process.exit(1);
}

const filePath = args[1];
if (!filePath) {
    console.error("Error: Missing file path parameter.");
    console.log("Usage: node arch-cli.js validate <file_path.md>");
    process.exit(1);
}

// Read spec file
let specContent;
try {
    specContent = fs.readFileSync(path.resolve(filePath), 'utf8');
} catch (err) {
    console.error(`Error: Could not read file '${filePath}': ${err.message}`);
    process.exit(1);
}

function parseMarkdownToProject(md) {
    const lines = md.split(/\r?\n/);
    const projectData = {
        title: "Untitled Project",
        version: "1.0",
        description: "",
        nodes: [],
        connections: [],
        flows: [],
        layers: null
    };

    let currentSection = ""; // "metadata", "description", "layers", "trust_boundary", "nodes", "connections", "flows"
    let currentNode = null;
    let currentFlow = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue;

        if (line.startsWith("# ") && currentSection === "") {
            projectData.title = line.substring(2).trim();
            currentSection = "metadata";
            continue;
        }

        if (line.startsWith("## ")) {
            const secName = line.substring(3).trim().toLowerCase();
            if (secName.includes("description")) {
                currentSection = "description";
            } else if (secName.includes("layer")) {
                currentSection = "layers";
                projectData.layers = [];
            } else if (secName.includes("boundary")) {
                currentSection = "trust_boundary";
                projectData.trustBoundary = { x: 1000, y: 670, w: 1120, h: 950, label: "Trust Boundary", note: "" };
            } else if (secName.includes("node") || secName.includes("system")) {
                currentSection = "nodes";
            } else if (secName.includes("connection")) {
                currentSection = "connections";
            } else if (secName.includes("flow")) {
                currentSection = "flows";
            } else {
                currentSection = "";
            }
            continue;
        }

        if (currentSection === "description") {
            if (projectData.description) {
                projectData.description += "\n" + line;
            } else {
                projectData.description = line;
            }
            continue;
        }

        if (currentSection === "metadata") {
            if (line.toLowerCase().startsWith("version:")) {
                projectData.version = line.split(":")[1].trim();
            }
            continue;
        }

        if (currentSection === "layers") {
            const match = line.match(/^-\s*\*\*([^*]+)\*\*:\s*([^(]+)(?:\(\s*y:\s*(\d+),\s*h:\s*(\d+)\))?/);
            if (match) {
                const id = match[1].trim();
                const label = match[2].trim();
                const y = match[3] ? parseInt(match[3]) : 150;
                const h = match[4] ? parseInt(match[4]) : 400;
                projectData.layers.push({ id, label, y, h, cls: id });
            }
            continue;
        }

        if (currentSection === "trust_boundary") {
            const match = line.match(/^-\s*\*\*([^*]+)\*\*:\s*(.*)/);
            if (match) {
                const key = match[1].trim().toLowerCase();
                const val = match[2].trim();
                if (key === "title") {
                    projectData.trustBoundary.label = val;
                } else if (key === "note") {
                    projectData.trustBoundary.note = val;
                } else if (key === "geometry") {
                    const geo = {};
                    val.split(",").forEach(part => {
                        const kv = part.split(":");
                        if (kv.length === 2) {
                            geo[kv[0].trim().toLowerCase()] = parseInt(kv[1].trim());
                        }
                    });
                    projectData.trustBoundary.x = geo.x || 1000;
                    projectData.trustBoundary.y = geo.y || 670;
                    projectData.trustBoundary.w = geo.w || 1120;
                    projectData.trustBoundary.h = geo.h || 950;
                }
            }
            continue;
        }

        if (currentSection === "nodes") {
            if (line.startsWith("### ")) {
                const match = line.substring(4).match(/^([^(]+)(?:\(([^)]+)\))?/);
                if (match) {
                    const id = match[1].trim();
                    const category = match[2] ? match[2].trim() : "Service";
                    currentNode = {
                        id,
                        category,
                        title: id,
                        icon: "⚙️",
                        color: "hsl(200,80%,58%)",
                        x: 100, y: 100,
                        desc: "",
                        sections: []
                    };
                    projectData.nodes.push(currentNode);
                }
                continue;
            }

            if (currentNode) {
                const match = line.match(/^\*\s*\*\*([^*:]+):\*\*\s*(.*)/);
                if (match) {
                    const key = match[1].trim().toLowerCase();
                    const val = match[2].trim();
                    if (key === "title") {
                        currentNode.title = val;
                    } else if (key === "icon") {
                        currentNode.icon = val;
                    } else if (key === "color") {
                        currentNode.color = val;
                    } else if (key === "x") {
                        currentNode.x = parseInt(val);
                    } else if (key === "y") {
                        currentNode.y = parseInt(val);
                    } else if (key === "description") {
                        currentNode.desc = val;
                    } else if (key === "flow") {
                        currentNode.flow = val.split("→").map(s => s.trim());
                    } else {
                        currentNode.sections.push({
                            label: match[1].trim(),
                            items: val.split(",").map(s => s.trim())
                        });
                    }
                } else if (line.startsWith("> **[")) {
                    const calloutMatch = line.match(/^>\s*\*\*\[([^\]]+)\]\*\*\s*(.*)/);
                    if (calloutMatch) {
                        currentNode.callout = {
                            type: calloutMatch[1].trim(),
                            text: calloutMatch[2].trim()
                        };
                    }
                }
            }
            continue;
        }

        if (currentSection === "connections") {
            if (line.startsWith("|") && !line.includes("---|")) {
                const parts = line.split("|").map(s => s.trim()).filter(s => s !== "");
                if (parts[0].toLowerCase() === "from" || parts[0] === "---") continue;
                if (parts.length >= 2) {
                    const from = parts[0];
                    const to = parts[1];
                    const label = parts[2] || "";
                    const type = parts[3] || "request";
                    projectData.connections.push([from, to, label, type]);
                }
            }
            continue;
        }

        if (currentSection === "flows") {
            if (line.startsWith("### ")) {
                const match = line.substring(4).match(/^([^(]+)(?:\(([^)]+)\))?/);
                if (match) {
                    const id = match[1].trim();
                    const title = match[2] ? match[2].trim() : id;
                    currentFlow = {
                        id,
                        title,
                        subtitle: "",
                        color: "hsl(210,85%,62%)",
                        steps: []
                    };
                    projectData.flows.push(currentFlow);
                }
                continue;
            }

            if (currentFlow) {
                if (line.startsWith("*") && !line.startsWith("* **")) {
                    currentFlow.subtitle = line.replace(/^\*\s*/, "").replace(/\*$/, "").trim();
                } else if (line.startsWith("- **Color:**")) {
                    currentFlow.color = line.split(":")[1].replace(/\*/g, "").trim();
                } else {
                    const stepMatch = line.match(/^\d+\.\s*\*\*([^*]+)\*\*\s*\[([^\]]+)\]:\s*(.*)/);
                    if (stepMatch) {
                        const node = stepMatch[1].trim();
                        const label = stepMatch[2].trim();
                        const detail = stepMatch[3].trim();
                        currentFlow.steps.push({
                            node,
                            label,
                            detail,
                            data: ""
                        });
                    } else if (line.startsWith("* Data:") || line.startsWith("  * Data:")) {
                        const dataVal = line.split("Data:")[1].trim();
                        if (currentFlow.steps.length > 0) {
                            currentFlow.steps[currentFlow.steps.length - 1].data = dataVal;
                        }
                    }
                }
            }
            continue;
        }
    }

    return projectData;
}

function validateProjectData(spec) {
    if (!spec.nodes || !Array.isArray(spec.nodes)) {
        throw new Error("Missing 'nodes' array.");
    }
    if (!spec.connections || !Array.isArray(spec.connections)) {
        throw new Error("Missing 'connections' array.");
    }
    if (!spec.flows || !Array.isArray(spec.flows)) {
        throw new Error("Missing 'flows' array.");
    }
    
    const nodeIds = new Set(spec.nodes.map(n => n.id));
    
    spec.nodes.forEach((n, idx) => {
        if (!n.id) throw new Error(`Node at index ${idx} is missing an 'id'.`);
        if (!n.category) throw new Error(`Node '${n.id}' is missing a 'category'.`);
        if (n.x === undefined || isNaN(n.x)) n.x = 100 + idx * 100;
        if (n.y === undefined || isNaN(n.y)) n.y = 100;
    });
    
    spec.connections.forEach((c, idx) => {
        if (!Array.isArray(c) || c.length < 2) {
            throw new Error(`Connection at index ${idx} is invalid. Format: [from, to, label, type]`);
        }
        if (!nodeIds.has(c[0])) {
            throw new Error(`Connection at index ${idx} references non-existent node '${c[0]}'.`);
        }
        if (!nodeIds.has(c[1])) {
            throw new Error(`Connection at index ${idx} references non-existent node '${c[1]}'.`);
        }
    });
    
    spec.flows.forEach((f, idx) => {
        if (!f.id) throw new Error(`Flow at index ${idx} is missing an 'id'.`);
        if (!f.steps || !Array.isArray(f.steps)) {
            throw new Error(`Flow '${f.id}' is missing a 'steps' array.`);
        }
        f.steps.forEach((s, sIdx) => {
            if (!s.node) throw new Error(`Step ${sIdx + 1} in flow '${f.id}' is missing a target 'node'.`);
            if (!nodeIds.has(s.node)) {
                throw new Error(`Step ${sIdx + 1} in flow '${f.id}' references non-existent node '${s.node}'.`);
            }
        });
    });
}

console.log(`🤖 Auditing architecture spec file: ${filePath}`);
try {
    const spec = parseMarkdownToProject(specContent);
    validateProjectData(spec);
    
    console.log("\n✅ ARCHITECTURE SPECIFICATION IS VALID!");
    console.log(`- Project Title: ${spec.title}`);
    console.log(`- Version: ${spec.version}`);
    console.log(`- Nodes: ${spec.nodes.length} components detected`);
    console.log(`- Connections: ${spec.connections.length} links parsed`);
    console.log(`- Simulation Flows: ${spec.flows.length} pathways validated`);
    
    const nodeIds = new Set(spec.nodes.map(n => n.id));
    const crossings = [];
    let couplingIssues = 0;
    
    spec.connections.forEach(conn => {
        const fromNode = spec.nodes.find(n => n.id === conn[0]);
        const toNode = spec.nodes.find(n => n.id === conn[1]);
        if (fromNode && toNode) {
            if (fromNode.category === 'Entry Point' && toNode.category === 'Infrastructure') {
                crossings.push(`⚠️ WARNING: Direct crossing found from Entry Point '${fromNode.id}' to Infrastructure Store '${toNode.id}'! Bypasses logical service layer.`);
                couplingIssues++;
            }
        }
    });

    if (crossings.length > 0) {
        console.log("\n🔍 Structural Integrity Report:");
        crossings.forEach(c => console.log(c));
    } else {
        console.log("\n🛡️ Layer isolation: 100% compliant. No boundary crossings detected.");
    }
    
    process.exit(0);
} catch (err) {
    console.error(`\n❌ VALIDATION AUDIT FAILED!`);
    console.error(`Reason: ${err.message}`);
    process.exit(1);
}
