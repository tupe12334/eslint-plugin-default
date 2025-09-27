const noLocalhostRule = require('./rules/no-localhost');
const noHardcodedUrlsRule = require('./rules/no-hardcoded-urls');
const requireParamDefaultsRule = require('./rules/require-param-defaults');
const noDefaultParamsRule = require('./rules/no-default-params');
const packageJson = require('../package.json');

const plugin = {
  meta: {
    name: packageJson.name,
    version: packageJson.version
  },
  rules: {
    'no-localhost': noLocalhostRule,
    'no-hardcoded-urls': noHardcodedUrlsRule,
    'require-param-defaults': requireParamDefaultsRule,
    'no-default-params': noDefaultParamsRule
  }
};

// Add configs after plugin is defined to avoid circular reference
plugin.configs = {
  recommended: {
    plugins: {
      default: plugin
    },
    rules: {
      'default/no-localhost': 'error',
      'default/no-hardcoded-urls': 'error',
      'default/no-default-params': 'error'
    }
  },
  strict: {
    plugins: {
      default: plugin
    },
    rules: {
      'default/no-localhost': 'error',
      'default/no-hardcoded-urls': 'error',
      'default/no-default-params': 'error'
    }
  }
};

module.exports = plugin;