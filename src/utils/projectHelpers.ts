import { Project } from '../types';
import { parseMarkdownToProject } from './parser';
import { DEFAULT_PROJECT_MD } from '../constants/demoSpec';

export const DEFAULT_PROJECT_ID = "demo-sample";

export function getCustomProjects(): Project[] {
    try {
        const data = localStorage.getItem("archbench_projects");
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to load projects from localStorage", e);
        return [];
    }
}

export function saveCustomProjects(projects: Project[]): void {
    try {
        localStorage.setItem("archbench_projects", JSON.stringify(projects));
    } catch (e) {
        console.error("Failed to save projects to localStorage", e);
    }
}

export function getAvailableProjects(): Project[] {
    const custom = getCustomProjects();
    const list: Project[] = [];

    // Always include the built-in public demo project as default
    try {
        const builtIn = parseMarkdownToProject(DEFAULT_PROJECT_MD);
        builtIn.id = DEFAULT_PROJECT_ID;
        list.push(builtIn);
    } catch (e) {
        console.error("Failed to parse built-in demo project:", e);
    }

    custom.forEach(p => {
        if (p.id !== DEFAULT_PROJECT_ID) {
            list.push(p);
        }
    });

    return list;
}
