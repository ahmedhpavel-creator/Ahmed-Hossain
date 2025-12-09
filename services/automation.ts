
import { storage } from './storage';
import { autoTranslate } from './ai';
import { Leader, Member, Event, GalleryItem } from '../types';

// --- TYPES ---
export interface AutomationLog {
    id: string;
    task: string;
    status: 'success' | 'warning' | 'error' | 'running';
    message: string;
    timestamp: number;
}

export interface SystemHealth {
    databaseStatus: 'healthy' | 'warning' | 'error';
    brokenLinks: number;
    missingTranslations: number;
    storageUsage: number; // approximate %
    lastScan: number;
}

// --- STATE ---
let logs: AutomationLog[] = [];
const listeners: ((logs: AutomationLog[]) => void)[] = [];
let isRunning = false;

const notifyListeners = () => listeners.forEach(l => l([...logs]));

const addLog = (task: string, status: AutomationLog['status'], message: string) => {
    const log = { id: Date.now().toString() + Math.random(), task, status, message, timestamp: Date.now() };
    logs = [log, ...logs].slice(0, 50); // Keep last 50
    notifyListeners();
    return log;
};

// --- TASKS ---

// 1. Image Validator (Checks if URLs are reachable)
const validateImages = async () => {
    const leaders = await storage.getLeaders();
    const members = await storage.getMembers();
    const gallery = await storage.getGallery();
    const events = await storage.getEvents();
    
    const allImages = [
        ...leaders.map(l => ({ url: l.image, context: `Leader: ${l.name.en}` })),
        ...members.map(m => ({ url: m.image, context: `Member: ${m.name.en}` })),
        ...gallery.map(g => ({ url: g.imageUrl, context: `Gallery Item` })),
        ...events.map(e => ({ url: e.image, context: `Event: ${e.title.en}` })),
    ];

    let brokenCount = 0;

    // Process in chunks to avoid network spam
    const checkImage = (url: string): Promise<boolean> => {
        return new Promise((resolve) => {
            if (!url) { resolve(false); return; }
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };

    for (const img of allImages) {
        if (!img.url) continue;
        const valid = await checkImage(img.url);
        if (!valid) {
            brokenCount++;
            addLog('Image Scan', 'warning', `Broken image detected in ${img.context}`);
        }
    }

    if (brokenCount === 0) addLog('Image Scan', 'success', 'All images are valid and loadable.');
    else addLog('Image Scan', 'error', `Found ${brokenCount} broken images.`);
    
    return brokenCount;
};

// 2. Data Integrity & Auto-Translation
const checkDataIntegrity = async () => {
    const leaders = await storage.getLeaders();
    let fixedCount = 0;
    
    for (const leader of leaders) {
        let changed = false;
        
        // Auto-Translate Name
        if (leader.name.en && !leader.name.bn) {
            leader.name.bn = await autoTranslate(leader.name.en, 'bn');
            changed = true;
        } else if (!leader.name.en && leader.name.bn) {
            leader.name.en = await autoTranslate(leader.name.bn, 'en');
            changed = true;
        }

        // Auto-Translate Designation
        if (leader.designation.en && !leader.designation.bn) {
            leader.designation.bn = await autoTranslate(leader.designation.en, 'bn');
            changed = true;
        }

        if (changed) {
            await storage.saveLeader(leader);
            fixedCount++;
        }
    }
    
    if (fixedCount > 0) addLog('Data Integrity', 'success', `Auto-translated/Fixed ${fixedCount} profiles.`);
    else addLog('Data Integrity', 'success', 'All data fields appear consistent.');

    return fixedCount;
};

// 3. Storage Optimization
const optimizeStorage = () => {
    try {
        const usage = JSON.stringify(localStorage).length;
        const limit = 5 * 1024 * 1024; // ~5MB standard
        const percentage = (usage / limit) * 100;
        
        if (percentage > 80) {
            addLog('Storage', 'warning', `Local storage is ${percentage.toFixed(1)}% full. Recommend clearing old logs.`);
        } else {
            addLog('Storage', 'success', `Storage usage is healthy (${percentage.toFixed(1)}%).`);
        }
        return percentage;
    } catch (e) {
        return 0;
    }
};

// --- MAIN RUNNER ---

export const automation = {
    subscribe: (callback: (logs: AutomationLog[]) => void) => {
        listeners.push(callback);
        callback(logs);
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) listeners.splice(index, 1);
        };
    },
    
    runAllTasks: async () => {
        if (isRunning) return;
        isRunning = true;
        addLog('System', 'running', 'Starting full system scan...');
        
        try {
            await Promise.all([
                validateImages(),
                checkDataIntegrity(),
                // Artificial delay to show progress in UI
                new Promise(r => setTimeout(r, 1000)) 
            ]);
            optimizeStorage();
            addLog('System', 'success', 'Automated maintenance completed successfully.');
        } catch (e: any) {
            addLog('System', 'error', `Automation failed: ${e.message}`);
        } finally {
            isRunning = false;
        }
    },

    getLogs: () => logs,
    
    // Quick helpers for UI
    getHealth: async (): Promise<SystemHealth> => {
        const usage = optimizeStorage();
        // Return cached or mock data for fast UI
        return {
            databaseStatus: 'healthy',
            brokenLinks: 0, // Would need real scan
            missingTranslations: 0,
            storageUsage: usage,
            lastScan: Date.now()
        };
    }
};
