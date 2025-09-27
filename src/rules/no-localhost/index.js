module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow hardcoded "localhost" in favor of environment variables',
      category: 'Best Practices',
      recommended: true
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowInTests: {
            type: 'boolean',
            default: false
          },
          allowInComments: {
            type: 'boolean',
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noLocalhost:
        'Avoid hardcoded "localhost". Use environment variables instead.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const allowInTests = options.allowInTests || false;
    const allowInComments = options.allowInComments !== false;

    const filename = context.getFilename();
    const isTestFile =
      /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename) ||
      /(__tests__|test|spec)\//.test(filename);

    function checkStringValue(node, value) {
      if (
        typeof value === 'string' &&
        value.toLowerCase().includes('localhost')
      ) {
        // Skip if it's a test file and allowInTests is true
        if (isTestFile && allowInTests) {
          return;
        }

        context.report({
          node,
          messageId: 'noLocalhost'
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkStringValue(node, node.value);
        }
      },

      TemplateLiteral(node) {
        // Check template literal for localhost
        const templateValue = node.quasis
          .map((quasi) => quasi.value.raw)
          .join('${...}'); // Placeholder for expressions

        if (templateValue.toLowerCase().includes('localhost')) {
          if (isTestFile && allowInTests) {
            return;
          }

          context.report({
            node,
            messageId: 'noLocalhost'
          });
        }
      },

      Property(node) {
        // Check object property keys for localhost
        if (
          node.key &&
          node.key.type === 'Literal' &&
          typeof node.key.value === 'string'
        ) {
          checkStringValue(node.key, node.key.value);
        }

        // Check string values in object properties
        if (
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string'
        ) {
          checkStringValue(node.value, node.value.value);
        }
      },

      // Handle comments if allowInComments is false
      Program() {
        if (!allowInComments) {
          const sourceCode = context.getSourceCode();
          const comments = sourceCode.getAllComments();

          comments.forEach((comment) => {
            if (comment.value.toLowerCase().includes('localhost')) {
              if (isTestFile && allowInTests) {
                return;
              }

              context.report({
                node: comment,
                messageId: 'noLocalhost'
              });
            }
          });
        }
      }
    };
  }
};
