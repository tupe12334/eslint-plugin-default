module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce default values for function parameters to prevent runtime errors',
      category: 'Defaults',
      recommended: false
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          requireForPrimitives: {
            type: 'boolean',
            description: 'Require defaults for primitive parameters (string, number, boolean)'
          },
          requireForObjects: {
            type: 'boolean',
            description: 'Require defaults for object parameters and destructuring'
          },
          requireForArrays: {
            type: 'boolean',
            description: 'Require defaults for array parameters and destructuring'
          },
          requireForFunctions: {
            type: 'boolean',
            description: 'Require defaults for function parameters'
          },
          exemptFirstParam: {
            type: 'boolean',
            description: 'Exempt the first parameter from requiring defaults'
          },
          exemptLastParam: {
            type: 'boolean',
            description: 'Exempt the last parameter from requiring defaults (common for callbacks)'
          },
          minParamCount: {
            type: 'integer',
            minimum: 1,
            description: 'Minimum number of parameters required before applying this rule'
          },
          exemptedParamNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Parameter names to exempt from requiring defaults'
          },
          requireDefaultForDestructuring: {
            type: 'boolean',
            description: 'Require default object/array when using destructuring parameters'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingDefault: 'Parameter "{{paramName}}" should have a default value to prevent runtime errors.',
      missingDestructuringDefault: 'Destructuring parameter should have a default {{type}} to prevent runtime errors.',
      suggestPrimitive: 'Consider adding a default value like: {{paramName}} = {{suggestion}}',
      suggestObject: 'Consider adding a default object: {{paramName}} = {}',
      suggestArray: 'Consider adding a default array: {{paramName}} = []',
      suggestFunction: 'Consider adding a default function: {{paramName}} = () => {}'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const {
      requireForPrimitives = true,
      requireForObjects = false,
      requireForArrays = false,
      requireForFunctions = false,
      exemptFirstParam = false,
      exemptLastParam = false,
      minParamCount = 1,
      exemptedParamNames = [],
      requireDefaultForDestructuring = true
    } = options;

    function getParameterName(param) {
      switch (param.type) {
        case 'Identifier':
          return param.name;
        case 'ObjectPattern':
          return 'object destructuring';
        case 'ArrayPattern':
          return 'array destructuring';
        case 'RestElement':
          return param.argument.name;
        default:
          return 'parameter';
      }
    }

    function isExemptedParam(paramName, index, totalParams) {
      // Check if param name is in exempted list
      if (exemptedParamNames.includes(paramName)) {
        return true;
      }

      // Check position-based exemptions
      if (exemptFirstParam && index === 0) {
        return true;
      }

      if (exemptLastParam && index === totalParams - 1) {
        return true;
      }

      return false;
    }

    function shouldRequireDefault(param, paramType) {
      switch (paramType) {
        case 'primitive':
          return requireForPrimitives;
        case 'object':
          return requireForObjects;
        case 'array':
          return requireForArrays;
        case 'function':
          return requireForFunctions;
        default:
          return false;
      }
    }

    function getParameterType(param) {
      switch (param.type) {
        case 'ObjectPattern':
          return 'object';
        case 'ArrayPattern':
          return 'array';
        case 'Identifier':
          // For identifiers, we assume primitive unless context suggests otherwise
          // In a real implementation, we might use type information if available
          return 'primitive';
        default:
          return 'primitive';
      }
    }

    function getSuggestion(paramType, paramName) {
      switch (paramType) {
        case 'object':
          return '{}';
        case 'array':
          return '[]';
        case 'function':
          return '() => {}';
        case 'primitive':
        default:
          // Suggest based on common parameter names
          if (paramName.toLowerCase().includes('count') || paramName.toLowerCase().includes('index')) {
            return '0';
          }
          if (paramName.toLowerCase().includes('name') || paramName.toLowerCase().includes('title')) {
            return '""';
          }
          if (paramName.toLowerCase().includes('enabled') || paramName.toLowerCase().includes('active')) {
            return 'false';
          }
          return 'null';
      }
    }

    function checkParameter(param, index, params) {
      // Skip rest parameters - they don't need defaults
      if (param.type === 'RestElement') {
        return;
      }

      // Skip if already has default (AssignmentPattern)
      if (param.type === 'AssignmentPattern') {
        // Check if destructuring parameter has default object/array
        if (requireDefaultForDestructuring &&
            (param.left.type === 'ObjectPattern' || param.left.type === 'ArrayPattern')) {
          // This is already handled - param.right contains the default
          return;
        }
        return;
      }

      const paramName = getParameterName(param);
      const paramType = getParameterType(param);

      // Check if this parameter is exempted
      if (isExemptedParam(paramName, index, params.length)) {
        return;
      }

      // Check if we should require a default for this parameter type
      if (!shouldRequireDefault(param, paramType)) {
        return;
      }

      // Special handling for destructuring
      if (param.type === 'ObjectPattern' || param.type === 'ArrayPattern') {
        if (requireDefaultForDestructuring) {
          context.report({
            node: param,
            messageId: 'missingDestructuringDefault',
            data: {
              type: param.type === 'ObjectPattern' ? 'object' : 'array'
            }
          });
        }

        // Also check individual destructured properties if requireForPrimitives is true
        if (requireForPrimitives && param.type === 'ObjectPattern') {
          param.properties.forEach(prop => {
            if (prop.type === 'Property' && prop.value.type === 'Identifier') {
              // Check if this destructured property has a default
              const hasDefault = prop.value.type === 'AssignmentPattern';
              if (!hasDefault) {
                context.report({
                  node: prop.value,
                  messageId: 'missingDefault',
                  data: {
                    paramName: prop.value.name
                  }
                });
              }
            }
          });
        }

        if (requireForPrimitives && param.type === 'ArrayPattern') {
          param.elements.forEach((element) => {
            if (element && element.type === 'Identifier') {
              context.report({
                node: element,
                messageId: 'missingDefault',
                data: {
                  paramName: element.name
                }
              });
            }
          });
        }
        return;
      }

      // Report missing default for regular parameters
      const suggestion = getSuggestion(paramType, paramName);
      context.report({
        node: param,
        messageId: 'missingDefault',
        data: {
          paramName,
          suggestion
        }
      });
    }

    function checkFunction(node) {
      const params = node.params;

      // Skip if function doesn't meet minimum parameter count
      if (params.length < minParamCount) {
        return;
      }

      params.forEach((param, index) => {
        checkParameter(param, index, params);
      });
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      MethodDefinition(node) {
        if (node.value && node.value.type === 'FunctionExpression') {
          checkFunction(node.value);
        }
      }
    };
  }
};