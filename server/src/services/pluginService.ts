import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PLUGINS_DIR = path.join(__dirname, '../../plugins');

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  events?: string[];
}

export interface PluginInstance {
  manifest: PluginManifest;
  handler: any;
}

class PluginService {
  private plugins: Map<string, PluginInstance> = new Map();

  constructor() {
    this.ensurePluginDir();
  }

  private ensurePluginDir() {
    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    }
  }

  async loadPlugins() {
    try {
      const files = await fs.promises.readdir(PLUGINS_DIR);
      for (const file of files) {
        const fullPath = path.join(PLUGINS_DIR, file);
        const stats = await fs.promises.stat(fullPath);

        if (stats.isDirectory()) {
          // Directory plugin
          await this.loadPluginFromDir(fullPath);
        } else if (file.endsWith('.js')) {
          // Single file plugin (simple)
          // Not supported for now, prefer directory structure
        }
      }
    } catch (error) {
      console.error('Error loading plugins:', error);
    }
  }

  async loadPluginFromDir(dirPath: string) {
    try {
      const manifestPath = path.join(dirPath, 'manifest.json');
      if (!fs.existsSync(manifestPath)) return;

      const manifestContent = await fs.promises.readFile(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);
      
      const entryPoint = path.join(dirPath, manifest.main);
      
      // Dynamic import
      // In production, consider using 'vm' module for sandboxing
      const module = require(entryPoint); // CommonJS for now as we compile to JS

      if (module && typeof module.default === 'function') {
        // Initialize plugin with dependencies
        const instance = module.default({ prisma });
        
        this.plugins.set(manifest.name, {
          manifest,
          handler: instance
        });

        console.log(`Plugin loaded: ${manifest.name} v${manifest.version}`);
      } else if (module && typeof module === 'function') {
         // Direct export
         const instance = module({ prisma });
         this.plugins.set(manifest.name, { manifest, handler: instance });
         console.log(`Plugin loaded: ${manifest.name} v${manifest.version}`);
      }

    } catch (error) {
      console.error(`Failed to load plugin from ${dirPath}:`, error);
    }
  }

  // Event bus integration
  async emit(event: string, data: any) {
    for (const [name, plugin] of this.plugins) {
      if (plugin.handler && typeof plugin.handler[event] === 'function') {
        try {
          await plugin.handler[event](data);
        } catch (error) {
          console.error(`Error in plugin ${name} for event ${event}:`, error);
        }
      }
    }
  }

  getLoadedPlugins() {
    return Array.from(this.plugins.values()).map(p => p.manifest);
  }
}

export default new PluginService();
