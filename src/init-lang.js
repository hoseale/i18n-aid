import path from 'path'
import _ from 'lodash'
import { writeFileSync } from 'fs'
import { getAllMessages, getLangsDir, traverse } from './utils';
import config from '../config/config';

/**
 * 同步键值，并且保留已经翻译的文案
 * 
*/
function initMessages(lang) {
  const allMessages = getAllMessages();
  const targetMessages = getAllMessages(lang);
  const effectiveMessages = _.pickBy(targetMessages, (message, key) => allMessages.hasOwnProperty(key));
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
  const srcMessages = require(path.resolve(getLangsDir(), 'zh_CN', file)).default;
  const dstFile = path.resolve(getLangsDir(), lang, file);
  const rst = {};
  traverse(srcMessages, (message, key) => {
    _.setWith(rst, key, _.get(messages, key), Object);
  });
  writeFileSync(dstFile + config.fileType, 'export default ' + JSON.stringify(rst, null, 2));
}

export default initMessages