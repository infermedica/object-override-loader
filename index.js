const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {getOptions} = require('loader-utils');


const isYAMLFile = (fileExt) => /^\.ya?ml$/.test(fileExt);
const isJSONFile = (fileExt) => /^\.json/.test(fileExt);


function updateSourceObject(srcObject, overrideObject) {
  for (const srcKey of Object.keys(srcObject)) {
    if (overrideObject.hasOwnProperty(srcKey)) {
      if (typeof overrideObject[srcKey] === 'object') {
        updateSourceObject(srcObject[srcKey], overrideObject[srcKey]);
      } else {
        srcObject[srcKey] = overrideObject[srcKey];
      }
    }
  }
}


function parseContent(mode, source) {
  if (mode === 'yaml') {
    return typeof source === 'string' ? yaml.safeLoad(source) : source;
  }
  if (mode === 'json') {
    return typeof source === 'string' ? JSON.parse(source) : source;
  }
  return source;
}


function serializeContent(mode, source) {
  if (mode === 'yaml') {
    return yaml.safeDump(source);
  }
  if (mode === 'json') {
    return JSON.stringify(source);
  }
  return source;
}


module.exports = function (source) {
  try {
    const resourceObject = path.parse(this.resourcePath);
    const options = Object.assign({
      mode: 'yaml',
      insertFileNameAsPrefix: isYAMLFile(resourceObject.ext) || isJSONFile(resourceObject.ext),
      objectsDir: null
    }, getOptions(this));

    if (!options.objectsDir || !fs.existsSync(options.objectsDir)) {
      return source;
    }

    const overrides = {};
    fs.readdirSync(options.objectsDir).forEach((fileName) => {
      const filePath = path.join(options.objectsDir, fileName);
      const fileObject = path.parse(filePath);

      if (isYAMLFile(fileObject.ext) || isJSONFile(fileObject.ext)) {
        overrides[fileObject.name] = parseContent(
          isYAMLFile(fileObject.ext) ? 'yaml' : 'json',
          fs.readFileSync(filePath, 'utf8')
        );
      }
    });

    if (Object.keys(overrides).length === 0) {
      return source;
    }

    let content = {};
    if (options.insertFileNameAsPrefix) {
      content = {[resourceObject.name]: parseContent(options.mode, source)};
      updateSourceObject(content, overrides);
      content = content[resourceObject.name];
    } else {
      content = parseContent(options.mode, source);
      updateSourceObject(content, overrides);
    }

    return serializeContent(options.mode, content);
  } catch (err) {
    this.emitError(err);
    return source;
  }
};
