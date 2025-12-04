import fs from 'fs';
import process from 'process';
import os from 'os';
import path from 'path';
import { glob } from 'glob';
import { SOURCE_DIR } from './constants.ts';

export function isWSL() {
  if (process.platform !== 'linux') {
    return false;
  }

  if (os.release().toLowerCase().includes('microsoft')) {
    return true;
  }

  try {
    return fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

function loadJson(path: string) {
  const rawJson = fs.readFileSync(path, 'utf8');
  return JSON.parse(rawJson);
}

export function getPackageJson() {
  return loadJson(path.resolve(process.cwd(), 'package.json'));
}

export function getPluginJson() {
  return loadJson(path.resolve(process.cwd(), `${SOURCE_DIR}/plugin.json`));
}

export function getCPConfigVersion() {
  const cprcJson = path.resolve(process.cwd(), './.config', '.cprc.json');
  return fs.existsSync(cprcJson) ? loadJson(cprcJson).version : { version: 'unknown' };
}

export function hasReadme() {
  return fs.existsSync(path.resolve(process.cwd(), SOURCE_DIR, 'README.md'));
}

// Support bundling panel plugin by finding plugin.json file and module.[jt]sx? file.
export async function getEntries() {
  // Look for panel-plugin/src/plugin.json
  const panelPluginJson = await glob(`panel-plugin/src/plugin.json`, { absolute: true });
  
  if (panelPluginJson.length === 0) {
    throw new Error('Panel plugin not found at panel-plugin/src/plugin.json');
  }

  const plugins = await Promise.all(
    panelPluginJson.map((pluginJson) => {
      const folder = path.dirname(pluginJson);
      return glob(`${folder}/module.{ts,tsx,js,jsx}`, { absolute: true });
    })
  );

  return plugins.reduce<Record<string, string>>((result, modules) => {
    return modules.reduce((innerResult, module) => {
      // Use 'module' as entry name for panel plugin
      innerResult['module'] = module;
      return innerResult;
    }, result);
  }, {});
}
