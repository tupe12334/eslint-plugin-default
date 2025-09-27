// globals: describe, it
const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  }
});

describe('require-param-defaults', () => {
  it('should enforce default values for function parameters', () => {
    ruleTester.run('require-param-defaults', rule, {
      valid: [
        // Functions with defaults
        'function greet(name = "Guest") { return `Hello ${name}`; }',
        'const add = (a = 0, b = 0) => a + b;',
        'function process(data = {}) { return data; }',

        // No parameters
        'function noParams() { return true; }',

        // Rest parameters (should be allowed)
        'function varArgs(first = "default", ...rest) { return [first, rest]; }',

        // With exemptFirstParam option
        {
          code: 'function process(id, name = "default") { return {id, name}; }',
          options: [{ exemptFirstParam: true }]
        },

        // With exemptLastParam option
        {
          code: 'function async(data = {}, callback) { callback(data); }',
          options: [{ exemptLastParam: true }]
        },

        // With minParamCount option
        {
          code: 'function single(param) { return param; }',
          options: [{ minParamCount: 2 }]
        },

        // With exemptedParamNames option
        {
          code: 'function process(id, name = "default") { return {id, name}; }',
          options: [{ exemptedParamNames: ['id'] }]
        },

        // Object destructuring with defaults
        'function config({host = "localhost", port = 3000} = {}) { return {host, port}; }',

        // Array destructuring with defaults
        'function coords([x = 0, y = 0] = []) { return {x, y}; }',

        // Disabled requireForPrimitives
        {
          code: 'function test(param) { return param; }',
          options: [{ requireForPrimitives: false }]
        }
      ],

      invalid: [
        // Basic missing defaults
        {
          code: 'function greet(name) { return `Hello ${name}`; }',
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'name' }
            }
          ]
        },

        // Multiple parameters missing defaults
        {
          code: 'function add(a, b) { return a + b; }',
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'a' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'b' }
            }
          ]
        },

        // Arrow function missing defaults
        {
          code: 'const multiply = (x, y) => x * y;',
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'x' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'y' }
            }
          ]
        },

        // Object method missing defaults
        {
          code: `const obj = {
            process(data) { return data; }
          };`,
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'data' }
            }
          ]
        },

        // Class method missing defaults
        {
          code: `class Calculator {
            add(a, b) { return a + b; }
          }`,
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'a' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'b' }
            }
          ]
        },

        // Object destructuring without default object
        {
          code: 'function config({host, port}) { return {host, port}; }',
          options: [{ requireForObjects: true, requireDefaultForDestructuring: true }],
          errors: [
            {
              messageId: 'missingDestructuringDefault',
              data: { type: 'object' }
            }
          ]
        },

        // Object destructuring properties without defaults
        {
          code: 'function config({host, port} = {}) { return {host, port}; }',
          options: [{ requireForPrimitives: true }],
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'host' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'port' }
            }
          ]
        },

        // Array destructuring without default array
        {
          code: 'function coords([x, y]) { return {x, y}; }',
          options: [{ requireForArrays: true, requireDefaultForDestructuring: true }],
          errors: [
            {
              messageId: 'missingDestructuringDefault',
              data: { type: 'array' }
            }
          ]
        },

        // Function parameter without default
        {
          code: 'function async(callback) { callback(); }',
          options: [{ requireForFunctions: true }],
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'callback' }
            }
          ]
        },

        // ExemptFirstParam but second param missing default
        {
          code: 'function process(id, name) { return {id, name}; }',
          options: [{ exemptFirstParam: true }],
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'name' }
            }
          ]
        },

        // ExemptLastParam but first param missing default
        {
          code: 'function async(data, callback) { callback(data); }',
          options: [{ exemptLastParam: true }],
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'data' }
            }
          ]
        },

        // MinParamCount with enough params
        {
          code: 'function process(a, b, c) { return [a, b, c]; }',
          options: [{ minParamCount: 2 }],
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'a' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'b' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'c' }
            }
          ]
        },

        // ExemptedParamNames but other params missing defaults
        {
          code: 'function process(id, name, age) { return {id, name, age}; }',
          options: [{ exemptedParamNames: ['id'] }],
          errors: [
            {
              messageId: 'missingDefault',
              data: { paramName: 'name' }
            },
            {
              messageId: 'missingDefault',
              data: { paramName: 'age' }
            }
          ]
        }
      ]
    });
  });
});