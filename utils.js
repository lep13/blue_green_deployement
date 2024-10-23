const path = require("path");
const bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));

const outDir = path.resolve("./dist/" || process.env.OUT_DIR);
const configPath = path.join(outDir, "config.json");
const blogPath = path.join(outDir, "blog.json");

const defaultConfigPath = path.resolve(`${__dirname}/default/config.json`);
const defaultBlogPath = path.resolve(`${__dirname}/default/blog.json`);

/**
 * Tries to read file from out dir,
 * if not present returns default file contents
 */
async function getFileWithDefaults(file, defaultFile) {
  try {
    await fs.accessAsync(file, fs.constants.F_OK);
  } catch (err) {
    const defaultData = await fs.readFileAsync(defaultFile);
    return JSON.parse(defaultData);
  }
  const data = await fs.readFileAsync(file);
  return JSON.parse(data);
}

// async function getConfig() {
//   return getFileWithDefaults(configPath, defaultConfigPath);
// }

async function getConfig() {
  // Always load the default config first
  const defaultData = await fs.readFileAsync(defaultConfigPath, "utf-8");
  const defaultConfig = JSON.parse(defaultData);

  // Check if the dist config exists, if not use default
  let configExists = false;
  try {
    await fs.accessAsync(configPath, fs.constants.F_OK);
    configExists = true;
  } catch (err) {
    configExists = false;
  }

  if (configExists) {
    // If dist config exists, merge it with default config
    const configData = await fs.readFileAsync(configPath, "utf-8");
    const distConfig = JSON.parse(configData);

    // Merge dist config with default config to apply any changes
    return [Object.assign({}, defaultConfig, distConfig)];
  }

  // If dist config doesn't exist, return default config
  return [defaultConfig];
}

async function getBlog() {
  return getFileWithDefaults(blogPath, defaultBlogPath);
}

module.exports = {
  outDir,
  getConfig,
  getBlog
};
