# eslint-plugin-default

ESLint plugin that enforces proper defaults by disallowing hardcoded values in your codebase. Promotes flexible, maintainable code by encouraging configurable defaults instead of magic constants.

## Philosophy

This plugin prevents **hardcoded values** that should be configurable defaults. It encourages proper abstraction of configuration, constants, and URLs, making your codebase more:

- **Maintainable**: Easy to update values without hunting through code
- **Testable**: Different values for different test scenarios
- **Flexible**: Configurable for different environments, users, or deployments
- **Readable**: Clear separation between logic and configuration

## Installation

```bash
npm install --save-dev eslint-plugin-default
# or
pnpm add -D eslint-plugin-default
# or
yarn add --dev eslint-plugin-default
```

## Usage

### ESLint 9+ (Flat Config)

```javascript
import defaultPlugin from 'eslint-plugin-default';

export default [
  {
    plugins: {
      default: defaultPlugin
    },
    rules: {
      'default/no-localhost': 'error',
      'default/no-hardcoded-urls': 'error'
    }
  }
];
```

### Using Predefined Configurations

#### Recommended Configuration

```javascript
import defaultPlugin from 'eslint-plugin-default';

export default [
  defaultPlugin.configs.recommended
];
```

#### Strict Configuration

```javascript
import defaultPlugin from 'eslint-plugin-default';

export default [
  defaultPlugin.configs.strict
];
```

## Rules

- [`no-localhost`](src/rules/no-localhost/README.md) - Disallow hardcoded "localhost" usage to encourage configurable defaults
- [`no-hardcoded-urls`](src/rules/no-hardcoded-urls/README.md) - Disallow any hardcoded URLs to enforce proper configuration abstraction
- [`require-param-defaults`](src/rules/require-param-defaults/README.md) - Enforce default values for function parameters to prevent runtime errors
- [`no-param-defaults`](src/rules/no-param-defaults/README.md) - Disallow default values in function parameters to enforce explicit handling

## Why These Rules?

Hardcoded values in your codebase can lead to:

- **Maintenance burden**: Searching and replacing values across the codebase
- **Testing difficulties**: Unable to easily mock or override values for tests
- **Configuration rigidity**: Inability to customize behavior without code changes
- **Deployment complexity**: Different values needed for different environments
- **Team collaboration issues**: Conflicting hardcoded values between developers
- **Code coupling**: Business logic mixed with configuration data

## Default Management Patterns

### ✅ Constants Files
```javascript
// constants/urls.js
export const API_ENDPOINTS = {
  USERS: 'https://api.example.com/users',
  POSTS: 'https://api.example.com/posts'
};

// constants/config.js
export const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3,
  host: 'localhost'
};
```

### ✅ Configuration Objects
```javascript
// config/index.js
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true
  },
  production: {
    apiUrl: process.env.API_URL,
    debug: false
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### ✅ Default Parameters with Overrides
```javascript
class ApiClient {
  constructor(options = {}) {
    this.config = {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      retries: 3,
      ...options
    };
  }
}

// Usage with overrides
const client = new ApiClient({
  baseUrl: process.env.API_URL,
  timeout: 10000
});
```

### ✅ Environment Variables with Defaults
```javascript
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  dbUrl: process.env.DATABASE_URL || 'sqlite://memory',
  port: parseInt(process.env.PORT || '3000', 10)
};
```

## Configurations

Both `recommended` and `strict` configurations enable all rules as errors, promoting strict adherence to proper default management.

## Use Cases

This plugin is particularly useful for:

- **Large codebases**: Maintaining consistency in configuration management
- **Team projects**: Preventing conflicting hardcoded values between developers
- **Library development**: Ensuring configurable defaults for consumers
- **Multi-environment apps**: Supporting dev, staging, production configurations
- **Testing**: Making values easily mockable and overridable
- **Maintenance**: Centralizing configuration changes instead of scattered updates

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint the code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Release (maintainers only)
pnpm release
```

## License

MIT

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for details about changes in each version.