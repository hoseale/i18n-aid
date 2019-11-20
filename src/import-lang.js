
import path from 'path'
import _ from 'lodash'
import { readFileSync, writeFileSync } from 'fs';
import { tsvParseRows } from 'd3-dsv';
import { getAllMessages, getLangsDir, traverse } from './utils'
import config from '../config/config';

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
      let index = temp.indexOf(' ')
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
  messagesToImport = _.pickBy(messagesToImport, (message, key) => allMessages.hasOwnProperty(key));


  const keysByFiles = _.groupBy(Object.keys(messagesToImport), key => key.split('.')[0]);
  const messagesByFiles = _.mapValues(keysByFiles, (keys, file) => {
    const rst = {};
    _.forEach(keys, key => {
      _.setWith(rst, key.substr(file.length + 1), messagesToImport[key], Object);
    });
    return rst;
  });

  _.forEach(messagesByFiles, (messages, file) => {
    writeMessagesToFile(messages, file, lang);
  });
}

function writeMessagesToFile(messages, file, lang) {
  const srcMessages = require(path.resolve(getLangsDir(), 'zh_CN', file)).default;
  const dstFile = path.resolve(getLangsDir(), lang, file);
  const oldDstMessages = require(dstFile).default;
  const rst = {};
  traverse(srcMessages, (message, key) => {
    _.setWith(rst, key, _.get(messages, key) || _.get(oldDstMessages, key), Object);
  });
  writeFileSync(dstFile + config.fileType, 'export default ' + JSON.stringify(rst, null, 2));
}

export default importMessages
