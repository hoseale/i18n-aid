const { writeFileSync } = require('fs');
const path = require('path');
const { tsvFormatRows } = require('d3-dsv');
import { getAllMessages } from './utils'

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
  writeFileSync(file, content);
  console.log(`导出 ${messagesToTranslate.length} 条未翻译字段.`);
}

function exportAllMessages(file, lang) {
  const allMessages = getAllMessages();
  const messagesForLang = getAllMessages(lang);
  const rows = Object.keys(allMessages).map(key => {
    let message = allMessages[key];
    message = JSON.stringify(message).slice(1, -1);
    return [key, message, messagesForLang[key] || ''];
  });

  const content = tsvFormatRows(rows);
  writeFileSync(file, content);
  console.log(`导出 ${rows.length} 条未翻译字段.`);
}

export default exportMessages