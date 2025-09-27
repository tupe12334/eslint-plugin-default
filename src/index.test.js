// globals: describe, it, expect
const plugin = require('./index');

describe('eslint-plugin-default', () => {
  it('should export plugin metadata', () => {
    expect(plugin.meta).toBeDefined();
    expect(plugin.meta.name).toBe('eslint-plugin-default');
    expect(plugin.meta.version).toBe('1.0.0');
  });

  it('should export all rules', () => {
    expect(plugin.rules).toBeDefined();
    expect(plugin.rules['no-localhost']).toBeDefined();
    expect(plugin.rules['no-hardcoded-urls']).toBeDefined();
    expect(plugin.rules['require-param-defaults']).toBeDefined();
    expect(plugin.rules['no-default-params']).toBeDefined();
  });

  it('should export recommended config', () => {
    expect(plugin.configs.recommended).toBeDefined();
    expect(plugin.configs.recommended.plugins).toBeDefined();
    expect(plugin.configs.recommended.plugins.default).toBe(plugin);
    expect(plugin.configs.recommended.rules).toBeDefined();
    expect(plugin.configs.recommended.rules['default/no-localhost']).toBe('error');
    expect(plugin.configs.recommended.rules['default/no-hardcoded-urls']).toBe('error');
    expect(plugin.configs.recommended.rules['default/no-default-params']).toBe('error');
  });

  it('should export strict config', () => {
    expect(plugin.configs.strict).toBeDefined();
    expect(plugin.configs.strict.plugins).toBeDefined();
    expect(plugin.configs.strict.plugins.default).toBe(plugin);
    expect(plugin.configs.strict.rules).toBeDefined();
    expect(plugin.configs.strict.rules['default/no-localhost']).toBe('error');
    expect(plugin.configs.strict.rules['default/no-hardcoded-urls']).toBe('error');
    expect(plugin.configs.strict.rules['default/no-default-params']).toBe('error');
  });

  it('should have valid rule implementations', () => {
    Object.entries(plugin.rules).forEach(([, rule]) => {
      expect(rule).toBeDefined();
      expect(rule.meta).toBeDefined();
      expect(rule.meta.type).toBeDefined();
      expect(rule.meta.docs).toBeDefined();
      expect(rule.create).toBeTypeOf('function');
    });
  });
});