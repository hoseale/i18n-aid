'use strict';

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

const { writeFileSync } = require('fs');
const path$1 = require('path');
const _$1 = require('lodash');

/**
 * 同步键值，并且保留已经翻译的文案
 * 
*/
function initMessages(lang) {
  const allMessages = getAllMessages();
  const targetMessages = getAllMessages(lang);
  const effectiveMessages = _$1.pickBy(targetMessages, (message, key) => allMessages.hasOwnProperty(key));
  const extraMessages = _$1.pickBy(allMessages, (message, key) => !effectiveMessages.hasOwnProperty(key));
 
  const messagesToImport = Object.assign({}, effectiveMessages, extraMessages);

  const keysByFiles = _$1.groupBy(Object.keys(messagesToImport), key => key.split('.')[0]);
  const messagesByFiles = _$1.mapValues(keysByFiles, (keys, file) => {
    const rst = {};
    _$1.forEach(keys, key => {
      _$1.setWith(rst, key.substr(file.length + 1), messagesToImport[key], Object);
    });
    return rst;
  });

  _$1.forEach(messagesByFiles, (messages, file) => {
    writeMessagesToFile(messages, file, lang);
  });
}

function writeMessagesToFile(messages, file, lang) {
  const srcMessages = require(path$1.resolve(getLangsDir(), 'zh_CN', file)).default;
  const dstFile = path$1.resolve(getLangsDir(), lang, file);
  const rst = {};
  traverse(srcMessages, (message, key) => {
    _$1.setWith(rst, key, _$1.get(messages, key), Object);
  });
  writeFileSync(dstFile + '.ts', 'export default ' + JSON.stringify(rst, null, 2));
}

const { writeFileSync: writeFileSync$1 } = require('fs');
const path$2 = require('path');
const { tsvFormatRows } = require('d3-dsv');

function exportMessages(file, lang) {
  const allMessages = getAllMessages();
  const existingTranslations = getAllMessages(lang, (message, key) => allMessages[key] !== message);
  const messagesToTranslate = Object.keys(allMessages)
    .filter(key => !existingTranslations.hasOwnProperty(key))
    .map(key => {
      let message = allMessages[key];
      message = JSON.stringify(message).slice(1, -1);
      return [key, message];
    });

  if (messagesToTranslate.length === 0) {
    console.log('所有字段都已经翻译.');
    return;
  }

  const content = tsvFormatRows(messagesToTranslate);
  writeFileSync$1(file, content);
  console.log(`导出 ${messagesToTranslate.length} 条未翻译字段.`);
}

const { readFileSync, writeFileSync: writeFileSync$2 } = require('fs');
const path$3 = require('path');
const { tsvParseRows, tsvParse } = require('d3-dsv');
const _$2 = require('lodash');

function getMessagesToImport(file) {
  const content = readFileSync(file).toString();
  const messages = tsvParseRows(content, ([key, value]) => {
    try {
      value = JSON.parse(`"${value}"`);
    } catch (e) {
      throw new Error(`Illegal message: ${value}`);
    }

    if (value === 'undefined') {
      let temp = key;
      let index = temp.indexOf(' ');
      key = temp.slice(0, index);
      value = temp.slice(index).trim();
    }
    return [key, value];
  });
  const rst = {};
  const duplicateKeys = new Set();
  messages.forEach(([key, value]) => {
    if (rst.hasOwnProperty(key)) {
      duplicateKeys.add(key);
    }
    rst[key] = value;
  });
  if (duplicateKeys.size > 0) {
    const errorMessage = 'Duplicate messages detected: \n' + [...duplicateKeys].join('\n');
    console.error(errorMessage);
    process.exit(1);
  }
  return rst;
}

function importMessages(file, lang) {
  let messagesToImport = getMessagesToImport(file);

  const allMessages = getAllMessages();
  messagesToImport = _$2.pickBy(messagesToImport, (message, key) => allMessages.hasOwnProperty(key));


  const keysByFiles = _$2.groupBy(Object.keys(messagesToImport), key => key.split('.')[0]);
  const messagesByFiles = _$2.mapValues(keysByFiles, (keys, file) => {
    const rst = {};
    _$2.forEach(keys, key => {
      _$2.setWith(rst, key.substr(file.length + 1), messagesToImport[key], Object);
    });
    return rst;
  });

  _$2.forEach(messagesByFiles, (messages, file) => {
    writeMessagesToFile$1(messages, file, lang);
  });
}

function writeMessagesToFile$1(messages, file, lang) {
  const srcMessages = require(path$3.resolve(getLangsDir(), 'zh_CN', file)).default;
  const dstFile = path$3.resolve(getLangsDir(), lang, file);
  const oldDstMessages = require(dstFile).default;
  const rst = {};
  traverse(srcMessages, (message, key) => {
    _$2.setWith(rst, key, _$2.get(messages, key) || _$2.get(oldDstMessages, key), Object);
  });
  writeFileSync$2(dstFile + '.ts', 'export default ' + JSON.stringify(rst, null, 2));
}

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  }
});

var index = {
  init: initMessages,
  ep: exportMessages,
  im: importMessages
};

module.exports = index;
