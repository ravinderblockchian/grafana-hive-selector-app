const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const distPanelDir = path.resolve(__dirname, '../dist-panel');

// Create dist-panel directory if it doesn't exist
if (!fs.existsSync(distPanelDir)) {
  fs.mkdirSync(distPanelDir, { recursive: true });
}

// Copy panel-module.js to dist-panel/module.js and fix publicPath
const panelModuleSrc = path.join(distDir, 'panel-module.js');
const panelModuleDest = path.join(distPanelDir, 'module.js');
if (fs.existsSync(panelModuleSrc)) {
  let moduleContent = fs.readFileSync(panelModuleSrc, 'utf8');
  // Fix publicPath to use panel plugin ID instead of app plugin ID
  moduleContent = moduleContent.replace(
    /public\/plugins\/[^/]+\//g,
    'public/plugins/mindking-custom-dropdown-panel/'
  );
  fs.writeFileSync(panelModuleDest, moduleContent, 'utf8');
  console.log('✓ Copied panel-module.js to dist-panel/module.js (publicPath fixed)');
} else {
  console.warn('⚠ panel-module.js not found in dist/');
}

// Copy panel-plugin.json to dist-panel/plugin.json
const panelPluginJsonSrc = path.join(distDir, 'panel-plugin.json');
const panelPluginJsonDest = path.join(distPanelDir, 'plugin.json');
if (fs.existsSync(panelPluginJsonSrc)) {
  fs.copyFileSync(panelPluginJsonSrc, panelPluginJsonDest);
  console.log('✓ Copied panel-plugin.json to dist-panel/plugin.json');
} else {
  console.warn('⚠ panel-plugin.json not found in dist/');
}

// Copy panel-img directory to dist-panel/img
const panelImgSrc = path.join(distDir, 'panel-img');
const panelImgDest = path.join(distPanelDir, 'img');
if (fs.existsSync(panelImgSrc)) {
  // Remove existing img directory if it exists
  if (fs.existsSync(panelImgDest)) {
    fs.rmSync(panelImgDest, { recursive: true, force: true });
  }
  // Copy directory
  fs.cpSync(panelImgSrc, panelImgDest, { recursive: true });
  console.log('✓ Copied panel-img to dist-panel/img');
} else {
  console.warn('⚠ panel-img directory not found in dist/');
}

// Copy LICENSE and CHANGELOG if they exist
const licenseSrc = path.join(distDir, 'LICENSE');
const licenseDest = path.join(distPanelDir, 'LICENSE');
if (fs.existsSync(licenseSrc)) {
  fs.copyFileSync(licenseSrc, licenseDest);
  console.log('✓ Copied LICENSE to dist-panel/');
}

const changelogSrc = path.join(distDir, 'CHANGELOG.md');
const changelogDest = path.join(distPanelDir, 'CHANGELOG.md');
if (fs.existsSync(changelogSrc)) {
  fs.copyFileSync(changelogSrc, changelogDest);
  console.log('✓ Copied CHANGELOG.md to dist-panel/');
}

console.log('✓ Panel plugin files organized in dist-panel/');

