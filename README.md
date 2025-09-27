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

### `no-localhost`

Disallow hardcoded "localhost" usage to encourage configurable defaults.

#### ❌ Incorrect

```javascript
const apiUrl = "http://localhost:3000/api";
const host = "localhost";
const baseUrl = `http://localhost:${port}`;

const config = {
  api: "http://localhost:8080",
  host: "localhost"
};

fetch("http://LOCALHOST/users");
```

#### ✅ Correct

```javascript
// Environment variables
const apiUrl = process.env.API_URL || "http://127.0.0.1:3000/api";
const host = process.env.HOST || "127.0.0.1";

// Configuration object
const config = {
  api: CONFIG.API_URL,
  host: CONFIG.HOST
};

// Constants file
import { API_ENDPOINTS } from './constants';
fetch(API_ENDPOINTS.users);
```

#### Options

```javascript
{
  "default/no-localhost": ["error", {
    "allowInTests": false,    // Allow localhost in test files (default: false)
    "allowInComments": true   // Allow localhost in comments (default: true)
  }]
}
```

#### Examples with Options

**Allow in test files:**

```javascript
// In *.test.js or *.spec.js files with allowInTests: true
const testUrl = "http://localhost:3000"; // ✅ Allowed in tests
```

**Disallow in comments:**

```javascript
// With allowInComments: false
// Connect to localhost for development  // ❌ Would trigger error
```

### `no-hardcoded-urls`

Disallow any hardcoded URLs to enforce proper configuration abstraction for all endpoints.

#### ❌ Incorrect

```javascript
const apiUrl = "https://api.example.com";
const wsUrl = "ws://websocket.service.com";
const ftpUrl = "ftp://files.company.com";

const config = {
  api: "https://api.myservice.com",
  docs: "https://docs.example.com"
};

fetch("https://jsonplaceholder.typicode.com/posts");
const message = "Visit https://docs.example.com for help";
```

#### ✅ Correct

```javascript
// Environment variables
const apiUrl = process.env.API_URL;
const wsUrl = process.env.WEBSOCKET_URL;

// Configuration objects
const config = {
  api: ENDPOINTS.API_URL,
  docs: ENDPOINTS.DOCS_URL
};

// Constants/configuration files
import { API_URLS } from './config/urls';
fetch(API_URLS.POSTS_ENDPOINT);

// Default configurations with overrides
const DEFAULTS = {
  apiUrl: "https://api.example.com",
  docsUrl: "https://docs.example.com"
};
const message = `Visit ${config.docsUrl || DEFAULTS.docsUrl} for help`;
```

#### Options

```javascript
{
  "default/no-hardcoded-urls": ["error", {
    "allowInTests": false,                    // Allow URLs in test files (default: false)
    "allowInComments": true,                  // Allow URLs in comments (default: true)
    "allowedProtocols": ["ftp", "ws"],       // Allow specific protocols
    "allowedDomains": ["docs.github.com"]    // Allow specific trusted domains
  }]
}
```

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

## Requirements

- Node.js 18+
- ESLint 9+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the tests (`pnpm test`)
5. Run the linter (`pnpm lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

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