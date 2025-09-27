// globals: describe, it
const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  }
});

describe('no-param-defaults', () => {
  it('should disallow default values in function parameters', () => {
    ruleTester.run('no-param-defaults', rule, {
      valid: [
        // Functions without defaults
        'function greet(name) { return `Hello ${name || "Guest"}`; }',
        'const add = (a, b) => { return (a || 0) + (b || 0); };',
        'function process(data) { data = data || {}; return data; }',

        // No parameters
        'function noParams() { return true; }',

        // With allowInArrowFunctions option
        {
          code: 'const greet = (name = "Guest") => `Hello ${name}`;',
          options: [{ allowInArrowFunctions: true }]
        },

        // With allowInMethods option
        {
          code: `const obj = {
            greet(name = "Guest") { return \`Hello \${name}\`; }
          };`,
          options: [{ allowInMethods: true }]
        },

        // With allowInConstructors option
        {
          code: `class User {
            constructor(name = "Anonymous") { this.name = name; }
          }`,
          options: [{ allowInConstructors: true }]
        },

        // With allowSimpleDefaults option
        {
          code: 'function test(flag = false, count = 0, name = "", data = null) {}',
          options: [{ allowSimpleDefaults: true }]
        },

        // With allowForLastParam option
        {
          code: 'function process(id, options = {}) { return {id, options}; }',
          options: [{ allowForLastParam: true }]
        },

        // With exemptedParamNames option
        {
          code: 'function api(endpoint, options = {}) { return fetch(endpoint, options); }',
          options: [{ exemptedParamNames: ['options'] }]
        },

        // Empty arrays and objects with allowSimpleDefaults
        {
          code: 'function configure(items = [], config = {}) { return {items, config}; }',
          options: [{ allowSimpleDefaults: true }]
        }
      ],

      invalid: [
        // Basic default parameters
        {
          code: 'function greet(name = "Guest") { return `Hello ${name}`; }',
          errors: [
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // Multiple defaults
        {
          code: 'function calculate(a = 1, b = 2) { return a + b; }',
          errors: [
            {
              messageId: 'noDefaults'
            },
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // Arrow function with defaults
        {
          code: 'const multiply = (x = 1, y = 1) => x * y;',
          errors: [
            {
              messageId: 'noDefaultsArrow'
            },
            {
              messageId: 'noDefaultsArrow'
            }
          ]
        },

        // Object method with defaults
        {
          code: `const calculator = {
            add(a = 0, b = 0) { return a + b; }
          };`,
          errors: [
            {
              messageId: 'noDefaultsMethod'
            },
            {
              messageId: 'noDefaultsMethod'
            }
          ]
        },

        // Class method with defaults
        {
          code: `class Calculator {
            multiply(a = 1, b = 1) { return a * b; }
          }`,
          errors: [
            {
              messageId: 'noDefaultsMethod'
            },
            {
              messageId: 'noDefaultsMethod'
            }
          ]
        },

        // Constructor with defaults
        {
          code: `class User {
            constructor(name = "Anonymous") { this.name = name; }
          }`,
          errors: [
            {
              messageId: 'noDefaultsConstructor'
            }
          ]
        },

        // Complex default values (not simple)
        {
          code: 'function process(config = {enabled: true}) { return config; }',
          options: [{ allowSimpleDefaults: true }],
          errors: [
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // Function call as default (not simple)
        {
          code: 'function setup(logger = console.log) { logger("setup"); }',
          options: [{ allowSimpleDefaults: true }],
          errors: [
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // Object destructuring with defaults
        {
          code: 'function config({host = "localhost", port = 3000}) { return {host, port}; }',
          errors: [
            {
              messageId: 'noDefaults'
            },
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // Array destructuring with defaults
        {
          code: 'function coords([x = 0, y = 0]) { return {x, y}; }',
          errors: [
            {
              messageId: 'noDefaults'
            },
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // AllowForLastParam but non-last param has default
        {
          code: 'function process(name = "default", options) { return {name, options}; }',
          options: [{ allowForLastParam: true }],
          errors: [
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // ExemptedParamNames but other params have defaults
        {
          code: 'function api(endpoint, timeout = 5000, options = {}) { }',
          options: [{ exemptedParamNames: ['options'] }],
          errors: [
            {
              messageId: 'noDefaults'
            }
          ]
        },

        // Arrow function not allowed even with allowInMethods
        {
          code: 'const func = (param = "default") => param;',
          options: [{ allowInMethods: true }],
          errors: [
            {
              messageId: 'noDefaultsArrow'
            }
          ]
        }
      ]
    });
  });
});