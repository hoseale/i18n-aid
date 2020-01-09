# i18n-aid

国际化辅助工具，可以同步字段、导出未翻译字段、导入翻译

### Installation

npm install i18n-aid -g

### Usage

* 同步中文字段到英文翻译文件，并保留已经翻译字段：aid init en_US
* 导出未翻译字段, 默认导出文件放在根目录下：aid export en_US
* 导入英文翻译文件（tsv格式）：aid import en_US ./export_en_US.tsv

### 文件目录

![文件目录](https://github.com/HoseaLE/image/raw/master/i18n-aid-cate.jpg)

### 文件内容例子

index.ts

```javascript

import pageOne from './pageOne';
import pageTwo from './pageTwo';

export default {
  pageOne,
  pageTwo
};

```

pageOne.ts

```javascript

export default {
  pageOneView: {
    hello: '你好'
  },
  pageOneMod: {
    success: '成功'
  }
}

```

导出文案文件en_US_export.tsv
	
	pageOne.pageOneView.hello 你好
	pageOne.pageOneMod.success 成功

### 说明
*  翻译文件默认根目录为lang, 翻译文件类型默认为ts; 另外支出js、json类型，需要添加配置文件
*  中文文件必需放在zh_CN文件里，文件名称不能错
*  导入的翻译文件类型为tsv

### 可在根目录下添加配置文件 i18nAid.config.json 

    {
      "src": "./local",
      "fileType": ".js"
    }
