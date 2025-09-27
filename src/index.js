const noLocalhostRule = require('./rules/no-localhost');
const noHardcodedUrlsRule = require('./rules/no-hardcoded-urls');

const plugin = {
  meta: {
    name: 'eslint-plugin-default',
    version: '1.0.0'
  },
  rules: {
    'no-localhost': noLocalhostRule,
    'no-hardcoded-urls': noHardcodedUrlsRule
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
      'default/no-hardcoded-urls': 'error'
    }
  },
  strict: {
    plugins: {
      default: plugin
    },
    rules: {
      'default/no-localhost': 'error',
      'default/no-hardcoded-urls': 'error'
    }
  }
};

module.exports = plugin;