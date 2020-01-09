import config from '../config/config';
import path from 'path';
import _ from 'lodash';
import fs from 'fs-extra';

const { readdirSync, ensureDirSync } = fs;

/**
 * 获取语言资源的根目录
 */
function getLangsDir() {
  return config.src
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

// 根据文件类型获取文件内容
function getFileContent(path) {
  return '.json' === config.fileType ? require(path) : require(path).default;
}

/**
 * 获取所有文案
 */
function getAllMessages(lang = 'zh_CN', filter = () => true) {
  const srcLangDir = path.resolve(getLangsDir(), lang);
  ensureDirSync(srcLangDir);
  let files = readdirSync(srcLangDir);
  files = files.filter(file => file.endsWith(config.fileType) && file !== `index${config.fileType}`).map(file => path.resolve(srcLangDir, file));
  const allMessages = files.map(file => {
    let messages = getFileContent(file);
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
  getAllMessages,
  getFileContent
}
