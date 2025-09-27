module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'disallow default values in function parameters to enforce explicit handling',
      category: 'Defaults',
      recommended: false
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowInArrowFunctions: {
            type: 'boolean',
            description: 'Allow defaults in arrow functions (common for functional programming)'
          },
          allowInMethods: {
            type: 'boolean',
            description: 'Allow defaults in object methods and class methods'
          },
          allowInConstructors: {
            type: 'boolean',
            description: 'Allow defaults in class constructors'
          },
          allowSimpleDefaults: {
            type: 'boolean',
            description: 'Allow simple defaults (null, undefined, 0, "", false, [])'
          },
          allowForLastParam: {
            type: 'boolean',
            description: 'Allow defaults only for the last parameter (options pattern)'
          },
          exemptedParamNames: {
            type: 'array',
            items: { type: 'string' },
            description: 'Parameter names allowed to have defaults'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noDefaults: 'Default parameter values are not allowed. Handle defaults explicitly in function body.',
      noDefaultsArrow: 'Default values in arrow functions are not allowed. Use explicit conditionals instead.',
      noDefaultsMethod: 'Default values in methods are not allowed. Handle defaults in the method body.',
      noDefaultsConstructor: 'Default values in constructors are not allowed. Initialize in constructor body.',
      suggestExplicit: 'Consider explicit handling: if ({{paramName}} === undefined) { {{paramName}} = {{defaultValue}}; }'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const {
      allowInArrowFunctions = false,
      allowInMethods = false,
      allowInConstructors = false,
      allowSimpleDefaults = false,
      allowForLastParam = false,
      exemptedParamNames = []
    } = options;

    function isSimpleDefault(defaultNode) {
      if (!allowSimpleDefaults) return false;

      switch (defaultNode.type) {
        case 'Literal':
          return defaultNode.value === null ||
                 defaultNode.value === 0 ||
                 defaultNode.value === '' ||
                 defaultNode.value === false;
        case 'Identifier':
          return defaultNode.name === 'undefined';
        case 'ArrayExpression':
          return defaultNode.elements.length === 0;
        case 'ObjectExpression':
          return defaultNode.properties.length === 0;
        default:
          return false;
      }
    }

    function getDefaultValueString(defaultNode) {
      switch (defaultNode.type) {
        case 'Literal':
          return JSON.stringify(defaultNode.value);
        case 'Identifier':
          return defaultNode.name;
        case 'ArrayExpression':
          return '[]';
        case 'ObjectExpression':
          return '{}';
        default:
          return 'defaultValue';
      }
    }

    function getFunctionType(node, parent) {
      if (node.type === 'ArrowFunctionExpression') {
        return 'arrow';
      }

      if (parent) {
        if (parent.type === 'MethodDefinition') {
          return parent.kind === 'constructor' ? 'constructor' : 'method';
        }
        if (parent.type === 'Property' && parent.method) {
          return 'method';
        }
      }

      return 'function';
    }

    function shouldAllowDefault(functionType, paramName, isLastParam, defaultNode) {
      // Check exempted parameter names
      if (exemptedParamNames.includes(paramName)) {
        return true;
      }

      // Check last parameter allowance
      if (allowForLastParam && isLastParam) {
        return true;
      }

      // Check simple defaults
      if (isSimpleDefault(defaultNode)) {
        return true;
      }

      // Check function type specific allowances
      switch (functionType) {
        case 'arrow':
          return allowInArrowFunctions;
        case 'method':
          return allowInMethods;
        case 'constructor':
          return allowInConstructors;
        default:
          return false;
      }
    }

    function getMessageId(functionType) {
      switch (functionType) {
        case 'arrow':
          return 'noDefaultsArrow';
        case 'method':
          return 'noDefaultsMethod';
        case 'constructor':
          return 'noDefaultsConstructor';
        default:
          return 'noDefaults';
      }
    }

    function checkFunction(node, parent = null) {
      const functionType = getFunctionType(node, parent);
      const params = node.params;

      params.forEach((param, index) => {
        if (param.type === 'AssignmentPattern') {
          const paramName = param.left.type === 'Identifier'
            ? param.left.name
            : 'parameter';
          const isLastParam = index === params.length - 1;
          const defaultValue = getDefaultValueString(param.right);

          if (!shouldAllowDefault(functionType, paramName, isLastParam, param.right)) {
            context.report({
              node: param,
              messageId: getMessageId(functionType),
              data: {
                paramName,
                defaultValue
              }
            });
          }
        }

        // Also check nested patterns (destructuring with defaults)
        if (param.type === 'ObjectPattern') {
          param.properties.forEach(prop => {
            if (prop.type === 'Property' && prop.value.type === 'AssignmentPattern') {
              const propName = prop.key.name || 'property';
              const defaultValue = getDefaultValueString(prop.value.right);

              if (!exemptedParamNames.includes(propName) &&
                  !isSimpleDefault(prop.value.right)) {
                context.report({
                  node: prop.value,
                  messageId: getMessageId(functionType),
                  data: {
                    paramName: propName,
                    defaultValue
                  }
                });
              }
            }
          });
        }

        if (param.type === 'ArrayPattern') {
          param.elements.forEach((element, elemIndex) => {
            if (element && element.type === 'AssignmentPattern') {
              const elemName = element.left.name || `element${elemIndex}`;
              const defaultValue = getDefaultValueString(element.right);

              if (!exemptedParamNames.includes(elemName) &&
                  !isSimpleDefault(element.right)) {
                context.report({
                  node: element,
                  messageId: getMessageId(functionType),
                  data: {
                    paramName: elemName,
                    defaultValue
                  }
                });
              }
            }
          });
        }
      });
    }

    return {
      FunctionDeclaration(node) {
        checkFunction(node);
      },
      FunctionExpression(node) {
        checkFunction(node, node.parent);
      },
      ArrowFunctionExpression(node) {
        checkFunction(node, node.parent);
      },
      MethodDefinition(node) {
        if (node.value && node.value.type === 'FunctionExpression') {
          checkFunction(node.value, node);
        }
      }
    };
  }
};