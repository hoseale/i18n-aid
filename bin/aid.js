#!/usr/bin/env node
const program = require('commander');
const package = require('../package.json');
const cm = require('../bundle');
const path = require('path');

program
    .version(package.version)
    .usage('<command> [options]');
program.command('init <lang>')
    .description("init en_US 同步键值，已翻译的不会被覆盖")
    .alias('i')
    .action(function(lang){
      console.log(lang,'lang')
      cm.init(lang);
    });

program.command('export <lang> [filePath]')
  .description("export en_US ./export_en_US.tsv 导出为未翻译的内容，一般先同步键值再导出")
  .alias('ep')
  .action(function(lang, filePath){
    const fpath = filePath || path.resolve('.', `./export_${lang}.tsv`);
    cm.ep(fpath, lang);
  });

program.command('import <lang> <filePath>')
  .description("import en_US ./en_US.tsv  导入翻译的文件，支持tsv文件类型")
  .alias('im')
  .action(function(lang, filePath){
    cm.im(filePath, lang);
  });

program.parse(process.argv);
if(program.args.length==0){
    //这里是处理默认没有输入参数或者命令的时候，显示help信息
    program.help();
}
