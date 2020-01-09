

import init from './init-lang';
import ep from './export-lang';
import im from './import-lang';
import program from 'commander';
import pkg from '../package.json';

const path = require('path');

require("@babel/register");
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  }
});

function start() {
  program
  .version(pkg.version)
  .usage('<command> [options]');
  program.command('init <lang>')
    .description("init en_US 同步键值，已翻译的不会被覆盖")
    .alias('i')
    .action(function(lang){
      console.log(lang,'lang')
      init(lang);
    });

  program.command('export <lang> [filePath]')
  .description("export en_US ./export_en_US.tsv 导出为未翻译的内容，一般先同步键值再导出")
  .alias('ep')
  .action(function(lang, filePath){
    const fpath = filePath || path.resolve('.', `./export_${lang}.tsv`);
    ep(fpath, lang);
  });

  program.command('import <lang> <filePath>')
  .description("import en_US ./en_US.tsv  导入翻译的文件，支持tsv文件类型")
  .alias('im')
  .action(function(lang, filePath){
    im(filePath, lang);
  });

  program.parse(process.argv);
  if(program.args.length==0){
    //这里是处理默认没有输入参数或者命令的时候，显示help信息
    program.help();
  }
}

export default start;
