# no-hardcoded-urls

Disallow any hardcoded URLs to enforce proper configuration abstraction for all endpoints.

## ❌ Incorrect

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

## ✅ Correct

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

## Options

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