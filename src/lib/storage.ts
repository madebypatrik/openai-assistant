import { promises as fs } from 'fs';
import { join } from 'path';
import { SessionData } from '../types/index.js';
import { appConfig } from './config.js';

export class StorageManager {
  private sessionsFile: string;

  constructor() {
    this.sessionsFile = join(appConfig.dataDir, 'sessions.json');
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(appConfig.dataDir, { recursive: true });
      
      try {
        await fs.access(this.sessionsFile);
      } catch {
        await fs.writeFile(this.sessionsFile, '[]', 'utf-8');
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  async getAllSessions(): Promise<SessionData[]> {
    try {
      const data = await fs.readFile(this.sessionsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getSession(fileName: string): Promise<SessionData | null> {
    const sessions = await this.getAllSessions();
    return sessions.find(s => s.fileName === fileName) || null;
  }

  async saveSession(session: SessionData): Promise<void> {
    const sessions = await this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.fileName === session.fileName);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...sessions[existingIndex], ...session };
    } else {
      sessions.push(session);
    }
    
    await fs.writeFile(this.sessionsFile, JSON.stringify(sessions, null, 2), 'utf-8');
  }

  async deleteSession(fileName: string): Promise<void> {
    const sessions = await this.getAllSessions();
    const filtered = sessions.filter(s => s.fileName !== fileName);
    await fs.writeFile(this.sessionsFile, JSON.stringify(filtered, null, 2), 'utf-8');
  }

  async updateLastAccessed(fileName: string): Promise<void> {
    const session = await this.getSession(fileName);
    if (session) {
      session.lastAccessed = new Date().toISOString();
      await this.saveSession(session);
    }
  }
}

