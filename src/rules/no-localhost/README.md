# no-localhost

Disallow hardcoded "localhost" usage to encourage configurable defaults.

## ❌ Incorrect

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

## ✅ Correct

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

## Options

```javascript
{
  "default/no-localhost": ["error", {
    "allowInTests": false,    // Allow localhost in test files (default: false)
    "allowInComments": true   // Allow localhost in comments (default: true)
  }]
}
```

### Examples with Options

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