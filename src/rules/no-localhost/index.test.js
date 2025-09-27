// globals: describe, it
const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs'
  }
});

describe('no-localhost', () => {
  it('should pass all test cases', () => {
    ruleTester.run('no-localhost', rule, {
      valid: [
        // Using environment variables instead
        'const url = process.env.API_URL;',
        'const host = process.env.HOST || "127.0.0.1";',
        'fetch(process.env.BASE_URL + "/api");',

        // Non-localhost strings
        'const url = "https://example.com";',
        'const host = "production.myapp.com";',

        // Variables without localhost
        'const host = getHost();',
        'const url = config.apiUrl;',

        // Comments with localhost (allowed by default)
        '// Connect to localhost for development',
        '/* localhost setup instructions */',

        // Template literals without localhost
        'const url = `https://${domain}/api`;',

        // Object properties without localhost
        'const config = { host: process.env.HOST, port: 3000 };'
      ],

      invalid: [
        {
          code: 'const url = "http://localhost:3000";',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'const host = "localhost";',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'fetch("http://LOCALHOST:8080/api");',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'const url = `http://localhost:${port}`;',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'const config = { host: "localhost", port: 3000 };',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'const endpoints = { api: "http://localhost:3000/api" };',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'axios.get("http://localhost/users");',
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'const baseUrl = "https://localhost:8443";',
          errors: [{ messageId: 'noLocalhost' }]
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

    // Test files should be allowed when allowInTests is true
    ruleTesterWithOptions.run('no-localhost', rule, {
      valid: [
        {
          code: 'const url = "http://localhost:3000";',
          filename: 'api.test.js',
          options: [{ allowInTests: true }]
        },
        {
          code: 'const host = "localhost";',
          filename: 'components/Button.spec.js',
          options: [{ allowInTests: true }]
        },
        {
          code: 'fetch("http://localhost:8080");',
          filename: '__tests__/integration.js',
          options: [{ allowInTests: true }]
        }
      ],

      invalid: [
        {
          code: 'const url = "http://localhost:3000";',
          filename: 'api.test.js',
          options: [{ allowInTests: false }],
          errors: [{ messageId: 'noLocalhost' }]
        },
        {
          code: 'const host = "localhost";',
          filename: 'src/config.js',
          options: [{ allowInTests: true }],
          errors: [{ messageId: 'noLocalhost' }]
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

    ruleTesterWithOptions.run('no-localhost', rule, {
      valid: [
        {
          code: '// Connect to localhost for development\nconst host = process.env.HOST;',
          options: [{ allowInComments: true }]
        }
      ],

      invalid: [
        {
          code: '// Connect to localhost for development\nconst host = process.env.HOST;',
          options: [{ allowInComments: false }],
          errors: [{ messageId: 'noLocalhost' }]
        }
      ]
    });
  });
});