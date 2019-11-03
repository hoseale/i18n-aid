

import init from './src/init-lang';
import ep from './src/export-lang';
import im from './src/import-lang';

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs'
  }
});

export default {
  init,
  ep,
  im
}
