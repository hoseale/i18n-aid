const path = require('path');
const _ = require('lodash');
const { readdirSync } = require('fs');

/**
 * 获取语言资源的根目录
 */
function getLangsDir() {
  return path.resolve('.', './lang');
}
/**
 * 深度优先遍历对象中的所有 string 属性
 */
function traverse(obj, cb) {
  function traverseInner(obj, cb, path) {
    _.forEach(obj, (val, key) => {
      if (typeof val === 'string') {
        cb(val, [...path, key].join('.'));
      } else if (typeof val === 'object' && val !== null) {
        traverseInner(val, cb, [...path, key]);
      }
    });
  }

  traverseInner(obj, cb, []);
}

/**
 * 获取所有文案
 */
function getAllMessages(lang = 'zh_CN', filter = () => true) {
  const srcLangDir = path.resolve(getLangsDir(), lang);
  let files = readdirSync(srcLangDir);
  files = files.filter(file => file.endsWith('.ts') && file !== 'index.ts').map(file => path.resolve(srcLangDir, file));
  const allMessages = files.map(file => {
    const { default: messages } = require(file);
    const fileNameWithoutExt = path.basename(file).split('.')[0];
    const flattenedMessages = {};

    traverse(messages, (message, path) => {
      const key = fileNameWithoutExt + '.' + path;
      if (filter(message, key)) {
        flattenedMessages[key] = message;
      }
    });

    return flattenedMessages;
  });

  return Object.assign({}, ...allMessages);
}

export {
  getLangsDir,
  traverse,
  getAllMessages
}
