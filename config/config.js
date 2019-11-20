import fs from 'fs-extra'
const configJson = fs.readJsonSync('./i18nAid.config.json', { throws: false });

export default {
  src: './lang',
  fileType: '.ts', 
  ...configJson
}