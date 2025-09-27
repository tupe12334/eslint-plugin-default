# require-param-defaults

Enforce default values for function parameters to prevent runtime errors and promote defensive programming.

## Why This Rule?

Functions without parameter defaults can throw runtime errors when called with missing arguments. Default parameters make your functions more robust and predictable.

## ❌ Incorrect

```javascript
// Runtime error if called without arguments
function greet(name) {
  return `Hello ${name}`; // Error: "Hello undefined"
}

function calculate(a, b) {
  return a + b; // Error: NaN if arguments missing
}

function processData(config) {
  return config.host; // Error: Cannot read property 'host' of undefined
}

// Destructuring without defaults
function setup({host, port}) {
  // Error: Cannot destructure property of undefined
}
```

## ✅ Correct

```javascript
// Safe with defaults
function greet(name = "Guest") {
  return `Hello ${name}`; // Always works
}

function calculate(a = 0, b = 0) {
  return a + b; // Returns 0 if no arguments
}

function processData(config = {}) {
  return config.host || "localhost"; // Safe access
}

// Destructuring with defaults
function setup({host = "localhost", port = 3000} = {}) {
  return {host, port}; // Always works
}
```

## Options

```javascript
{
  "default/require-param-defaults": ["error", {
    "requireForPrimitives": true,        // Require defaults for basic parameters (default: true)
    "requireForObjects": false,          // Require defaults for object parameters (default: false)
    "requireForArrays": false,           // Require defaults for array parameters (default: false)
    "requireForFunctions": false,        // Require defaults for function parameters (default: false)
    "exemptFirstParam": false,           // Exempt first parameter (common for IDs) (default: false)
    "exemptLastParam": false,            // Exempt last parameter (common for callbacks) (default: false)
    "minParamCount": 1,                  // Apply only to functions with N+ parameters (default: 1)
    "exemptedParamNames": [],            // Parameter names to exempt (default: [])
    "requireDefaultForDestructuring": true  // Require default object/array for destructuring (default: true)
  }]
}
```

## Examples with Different Options

### Basic Usage (Default Configuration)

```javascript
// ❌ Missing defaults for primitives
function process(name, age) { }

// ✅ With defaults
function process(name = "", age = 0) { }
```

### Require Defaults for Objects

```javascript
{
  "requireForObjects": true
}

// ❌ Missing default for object parameter
function configure(options) { }

// ✅ With default object
function configure(options = {}) { }
```

### Require Defaults for Functions

```javascript
{
  "requireForFunctions": true
}

// ❌ Missing default for callback
function async(callback) { }

// ✅ With default function
function async(callback = () => {}) { }
```

### Exempt First Parameter

```javascript
{
  "exemptFirstParam": true
}

// ✅ ID parameters often don't need defaults
function getUserById(id, options = {}) { }
function updateUser(userId, data = {}) { }
```

### Exempt Last Parameter

```javascript
{
  "exemptLastParam": true
}

// ✅ Callback patterns
function fetchData(url = "", callback) { }
function processAsync(data = {}, done) { }
```

### Minimum Parameter Count

```javascript
{
  "minParamCount": 2
}

// ✅ Single parameter functions are exempt
function toggle(enabled) { }

// ❌ Multiple parameters need defaults
function combine(a, b) { }
```

### Exempted Parameter Names

```javascript
{
  "exemptedParamNames": ["id", "key", "index"]
}

// ✅ Common parameter names that represent required values
function findById(id, options = {}) { }
function getItem(key, fallback = null) { }
function getAt(index, array = []) { }
```

### Destructuring Configuration

```javascript
{
  "requireDefaultForDestructuring": true,
  "requireForPrimitives": true
}

// ❌ Missing defaults for destructured properties and object
function setup({host, port}) { }

// ✅ Complete destructuring defaults
function setup({host = "localhost", port = 3000} = {}) { }
```

## Common Patterns

### API Configuration Functions

```javascript
// ✅ Robust API configuration
function createClient({
  baseURL = "https://api.example.com",
  timeout = 5000,
  retries = 3
} = {}) {
  return new APIClient({baseURL, timeout, retries});
}
```

### Event Handlers

```javascript
// ✅ Safe event handling
function handleSubmit(event, options = {}) {
  event.preventDefault();
  const {validate = true, redirect = false} = options;
  // Handle submission
}
```

### Utility Functions

```javascript
// ✅ Predictable utility functions
function formatCurrency(amount = 0, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}
```

## Best Practices

1. **Use meaningful defaults**: Choose defaults that make sense for your use case
2. **Consider null vs empty values**: `null` for unknown, `""` for empty strings, `[]` for empty arrays
3. **Document your defaults**: Use JSDoc to explain default behavior
4. **Test with defaults**: Ensure your functions work correctly when called with no arguments

```javascript
/**
 * Processes user data with configurable options
 * @param {Object} userData - User data object
 * @param {Object} options - Processing options
 * @param {boolean} options.validate - Whether to validate data (default: true)
 * @param {boolean} options.sanitize - Whether to sanitize input (default: false)
 */
function processUser(userData = {}, {validate = true, sanitize = false} = {}) {
  // Implementation
}
```