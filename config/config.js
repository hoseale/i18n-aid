import fs from 'fs-extra';
const path = require('path');
const cwd = process.cwd();
const configJson = fs.readJsonSync('./i18nAid.config.json', { throws: false });

export default {
  fileType: '.ts', 
  ...configJson,
  src:  path.resolve(cwd, (configJson.src || './lang' )),
}