module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded URLs in favor of environment variables',
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
          },
          allowedProtocols: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: []
          },
          allowedDomains: {
            type: 'array',
            items: {
              type: 'string'
            },
            default: []
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noHardcodedUrl: 'Avoid hardcoded URLs. Use environment variables like process.env.API_URL instead.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const allowInTests = options.allowInTests || false;
    const allowInComments = options.allowInComments !== false;
    const allowedProtocols = options.allowedProtocols || [];
    const allowedDomains = options.allowedDomains || [];

    const filename = context.getFilename();
    const isTestFile = /\.(test|spec)\.(js|ts|jsx|tsx)$/.test(filename) ||
                      /(__tests__|test|spec)\//.test(filename);

    // URL regex pattern to match http(s), ftp, ws(s), etc.
    const urlPattern = /^(https?|ftp|ftps|ws|wss):\/\/[^\s]+$/i;

    // More comprehensive URL pattern that catches partial URLs too
    const partialUrlPattern = /(https?|ftp|ftps|ws|wss):\/\/[^\s"'`]+/gi;

    function isAllowedUrl(url) {
      try {
        const parsedUrl = new URL(url);

        // Check if protocol is allowed
        const protocol = parsedUrl.protocol.slice(0, -1); // Remove trailing ':'
        if (allowedProtocols.includes(protocol)) {
          return true;
        }

        // Check if domain is allowed
        if (allowedDomains.includes(parsedUrl.hostname)) {
          return true;
        }

        return false;
      } catch {
        // If URL parsing fails, check string-based patterns
        for (const domain of allowedDomains) {
          if (url.includes(domain)) {
            return true;
          }
        }
        return false;
      }
    }

    function checkStringValue(node, value) {
      if (typeof value !== 'string') return;

      // Check for complete URLs
      if (urlPattern.test(value)) {
        if (isAllowedUrl(value)) return;

        // Skip if it's a test file and allowInTests is true
        if (isTestFile && allowInTests) {
          return;
        }

        context.report({
          node,
          messageId: 'noHardcodedUrl'
        });
        return;
      }

      // Check for partial URLs within the string
      const matches = value.match(partialUrlPattern);
      if (matches) {
        for (const match of matches) {
          if (isAllowedUrl(match)) continue;

          if (isTestFile && allowInTests) {
            continue;
          }

          context.report({
            node,
            messageId: 'noHardcodedUrl'
          });
          break; // Report only once per string
        }
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          checkStringValue(node, node.value);
        }
      },

      TemplateLiteral(node) {
        // Check template literal for URLs
        const templateValue = node.quasis
          .map((quasi) => quasi.value.raw)
          .join('${...}'); // Placeholder for expressions

        // Only check if the template contains what looks like a complete URL
        if (urlPattern.test(templateValue) || partialUrlPattern.test(templateValue)) {
          if (isTestFile && allowInTests) {
            return;
          }

          // Additional check: if template contains expressions, it might be constructing URLs dynamically
          // We'll be more lenient with templates that use variables
          const hasExpressions = node.expressions.length > 0;
          if (hasExpressions) {
            // Only flag if it contains a clear protocol at the start
            if (/^(https?|ftp|ftps|ws|wss):\/\//.test(templateValue)) {
              context.report({
                node,
                messageId: 'noHardcodedUrl'
              });
            }
          } else {
            // No expressions, treat like a regular string
            checkStringValue(node, templateValue);
          }
        }
      },

      Property(node) {
        // Check object property keys for URLs
        if (node.key && node.key.type === 'Literal' && typeof node.key.value === 'string') {
          checkStringValue(node.key, node.key.value);
        }

        // Check string values in object properties
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          checkStringValue(node.value, node.value.value);
        }
      },

      // Handle comments if allowInComments is false
      Program() {
        if (!allowInComments) {
          const sourceCode = context.getSourceCode();
          const comments = sourceCode.getAllComments();

          comments.forEach((comment) => {
            if (partialUrlPattern.test(comment.value)) {
              if (isTestFile && allowInTests) {
                return;
              }

              context.report({
                node: comment,
                messageId: 'noHardcodedUrl'
              });
            }
          });
        }
      }
    };
  }
};