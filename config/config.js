import fs from 'fs-extra';
import _ from 'lodash';

const path = require('path');
const cwd = process.cwd();
const configJson = fs.readJsonSync(path.resolve(cwd, './i18nAid.config.json'), { throws: false });

export default {
  fileType: '.ts', 
  ...configJson,
  src:  path.resolve(cwd, (_.get(configJson, 'src') || './lang')),
}