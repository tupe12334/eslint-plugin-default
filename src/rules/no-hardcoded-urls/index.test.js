// globals: describe, it
const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs'
  }
});

describe('no-hardcoded-urls', () => {
  it('should pass all test cases', () => {
    ruleTester.run('no-hardcoded-urls', rule, {
      valid: [
        // Using environment variables instead
        'const url = process.env.API_URL;',
        'const endpoint = process.env.BASE_URL + "/api";',
        'fetch(process.env.API_ENDPOINT);',

        // Configuration-based URLs
        'const url = config.apiUrl;',
        'const endpoint = getApiUrl();',

        // Non-URL strings
        'const message = "Hello world";',
        'const path = "/api/users";',
        'const filename = "data.json";',

        // Comments with URLs (allowed by default)
        '// Visit https://example.com for docs',
        '/* API endpoint: http://api.example.com */',

        // Template literals with only variables
        'const url = `${process.env.BASE_URL}/api`;',
        'const endpoint = `${protocol}://${host}:${port}`;'
      ],

      invalid: [
        {
          code: 'const url = "https://api.example.com";',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const endpoint = "http://localhost:3000/api";',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'fetch("https://jsonplaceholder.typicode.com/posts");',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const wsUrl = "ws://websocket.example.com";',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const ftpUrl = "ftp://files.example.com/data";',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const config = { api: "https://api.service.com" };',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const urls = ["https://api1.com", "https://api2.com"];',
          errors: [
            { messageId: 'noHardcodedUrl' },
            { messageId: 'noHardcodedUrl' }
          ]
        },
        {
          code: 'const message = "Please visit https://example.com for more info";',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const url = `https://api.example.com/v1`;',
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'axios.defaults.baseURL = "https://api.myapp.com";',
          errors: [{ messageId: 'noHardcodedUrl' }]
        }
      ]
    });
  });

  it('should respect allowInTests option', () => {
    const ruleTesterWithOptions = new RuleTester({
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'commonjs'
      }
    });

    ruleTesterWithOptions.run('no-hardcoded-urls', rule, {
      valid: [
        {
          code: 'const testUrl = "https://api.example.com/test";',
          filename: 'api.test.js',
          options: [{ allowInTests: true }]
        },
        {
          code: 'fetch("http://localhost:3000");',
          filename: 'integration.spec.js',
          options: [{ allowInTests: true }]
        },
        {
          code: 'const mockEndpoint = "https://jsonplaceholder.typicode.com";',
          filename: '__tests__/api.js',
          options: [{ allowInTests: true }]
        }
      ],

      invalid: [
        {
          code: 'const url = "https://api.example.com";',
          filename: 'api.test.js',
          options: [{ allowInTests: false }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const prodUrl = "https://production.api.com";',
          filename: 'src/config.js',
          options: [{ allowInTests: true }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        }
      ]
    });
  });

  it('should respect allowedProtocols option', () => {
    const ruleTesterWithOptions = new RuleTester({
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'commonjs'
      }
    });

    ruleTesterWithOptions.run('no-hardcoded-urls', rule, {
      valid: [
        {
          code: 'const ftpUrl = "ftp://files.company.com";',
          options: [{ allowedProtocols: ['ftp'] }]
        },
        {
          code: 'const wsUrl = "ws://websocket.internal.com";',
          options: [{ allowedProtocols: ['ws', 'wss'] }]
        }
      ],

      invalid: [
        {
          code: 'const httpUrl = "http://api.example.com";',
          options: [{ allowedProtocols: ['ftp'] }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const httpsUrl = "https://secure.api.com";',
          options: [{ allowedProtocols: ['ws'] }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        }
      ]
    });
  });

  it('should respect allowedDomains option', () => {
    const ruleTesterWithOptions = new RuleTester({
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'commonjs'
      }
    });

    ruleTesterWithOptions.run('no-hardcoded-urls', rule, {
      valid: [
        {
          code: 'const docUrl = "https://docs.github.com";',
          options: [{ allowedDomains: ['docs.github.com'] }]
        },
        {
          code: 'const cdnUrl = "https://cdn.jsdelivr.net/package";',
          options: [{ allowedDomains: ['cdn.jsdelivr.net', 'unpkg.com'] }]
        }
      ],

      invalid: [
        {
          code: 'const apiUrl = "https://api.example.com";',
          options: [{ allowedDomains: ['docs.github.com'] }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        },
        {
          code: 'const serviceUrl = "https://service.company.com";',
          options: [{ allowedDomains: ['cdn.jsdelivr.net'] }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        }
      ]
    });
  });

  it('should respect allowInComments option', () => {
    const ruleTesterWithOptions = new RuleTester({
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'commonjs'
      }
    });

    ruleTesterWithOptions.run('no-hardcoded-urls', rule, {
      valid: [
        {
          code: '// Documentation: https://docs.example.com\nconst config = {};',
          options: [{ allowInComments: true }]
        }
      ],

      invalid: [
        {
          code: '// API endpoint: https://api.example.com\nconst config = {};',
          options: [{ allowInComments: false }],
          errors: [{ messageId: 'noHardcodedUrl' }]
        }
      ]
    });
  });
});