import path from 'path'
import _ from 'lodash'
import { writeFileSync } from 'fs'
import { getAllMessages, getLangsDir, traverse, getFileContent } from './utils';
import config from '../config/config';

/**
 * 同步键值，并且保留已经翻译的文案
 * 
*/
function initMessages(lang) {
  const allMessages = getAllMessages();
  const targetMessages = getAllMessages(lang);
  // 有效的key值
  const effectiveMessages = _.pickBy(targetMessages, (message, key) => allMessages.hasOwnProperty(key));
  // 新增的key值
  const extraMessages = _.pickBy(allMessages, (message, key) => !effectiveMessages.hasOwnProperty(key));

  const messagesToImport = Object.assign({}, effectiveMessages, extraMessages)
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
  const srcMessages = getFileContent(path.resolve(getLangsDir(), 'zh_CN', file));
  const dstFile = path.resolve(getLangsDir(), lang, file);
  const rst = {};
  traverse(srcMessages, (message, key) => {
    _.setWith(rst, key, _.get(messages, key), Object);
  });
  const content = '.json' === config.fileType ? JSON.stringify(rst, null, 2) : 'export default ' + JSON.stringify(rst, null, 2);
  writeFileSync(dstFile + config.fileType, content);
}

export default initMessages