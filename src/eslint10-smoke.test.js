// globals: describe, it, expect
// ESLint 10 removed these context methods; ESLint 9 (the dev dependency)
// still has them, so a rule calling one passes here and crashes for
// consumers. Wrap each rule's context so any use of a removed API throws.
const { Linter } = require('eslint');
const plugin = require('./index');

const REMOVED = new Set([
  'getAncestors',
  'getCwd',
  'getDeclaredVariables',
  'getFilename',
  'getPhysicalFilename',
  'getScope',
  'getSourceCode',
  'markVariableAsUsed',
  'parserOptions',
  'parserPath',
]);

const guard = (rule) => ({
  ...rule,
  create: (context) =>
    rule.create(
      new Proxy(context, {
        get(target, prop) {
          if (REMOVED.has(prop)) throw new TypeError(`context.${String(prop)} was removed in ESLint 10`);
          return Reflect.get(target, prop);
        },
      }),
    ),
});

const source = [
  'function f(a = 1) { return a; }',
  "fetch('http://localhost:3000');",
  '// see http://localhost:4000',
  "const u = 'https://example.com/api';",
  'f(u);',
].join('\n');

describe('ESLint 10 compatibility', () => {
  it('no rule uses a context API removed in ESLint 10', () => {
    const names = Object.keys(plugin.rules);
    const guarded = { rules: Object.fromEntries(Object.entries(plugin.rules).map(([n, r]) => [n, guard(r)])) };
    const rules = Object.fromEntries(names.map((n) => [`p/${n}`, 'error']));
    const config = [{ files: ['**/*.js'], plugins: { p: guarded }, rules }];
    const messages = new Linter().verify(source, config, { filename: 'src/a.js' });
    expect(messages.filter((m) => m.fatal)).toEqual([]);
    expect(messages.length).toBeGreaterThan(0);
  });
});
