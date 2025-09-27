# no-param-defaults

Disallow default values in function parameters to enforce explicit handling and improve code clarity.

## Why This Rule?

Default parameters can hide bugs, make function behavior less predictable, and reduce explicitness. This rule encourages handling defaults explicitly in the function body where the logic is more visible and testable.

## ❌ Incorrect

```javascript
// Hidden logic in parameter defaults
function greet(name = "Guest") {
  return `Hello ${name}`;
}

// Complex defaults that hide business logic
function process(config = {enabled: true, retries: 3}) {
  return config;
}

// Makes testing harder - can't easily mock defaults
function api(endpoint, timeout = 5000) {
  return fetch(endpoint, {timeout});
}

// Unclear what happens with undefined vs not passed
function calculate(a = 0, b = 0) {
  return a + b;
}
```

## ✅ Correct

```javascript
// Explicit handling in function body
function greet(name) {
  if (name === undefined) {
    name = "Guest";
  }
  return `Hello ${name}`;
}

// Or with nullish coalescing
function greet(name) {
  name = name ?? "Guest";
  return `Hello ${name}`;
}

// Business logic is visible and testable
function process(config) {
  config = config || {};
  config.enabled = config.enabled ?? true;
  config.retries = config.retries ?? 3;
  return config;
}

// Clear handling with constants
const DEFAULT_TIMEOUT = 5000;
function api(endpoint, timeout) {
  timeout = timeout ?? DEFAULT_TIMEOUT;
  return fetch(endpoint, {timeout});
}

// Explicit undefined checks
function calculate(a, b) {
  if (a === undefined) a = 0;
  if (b === undefined) b = 0;
  return a + b;
}
```

## Options

```javascript
{
  "default/no-param-defaults": ["error", {
    "allowInArrowFunctions": false,     // Allow defaults in arrow functions (default: false)
    "allowInMethods": false,            // Allow defaults in object/class methods (default: false)
    "allowInConstructors": false,       // Allow defaults in class constructors (default: false)
    "allowSimpleDefaults": false,       // Allow simple defaults (null, 0, "", false, []) (default: false)
    "allowForLastParam": false,         // Allow defaults only for last parameter (default: false)
    "exemptedParamNames": []            // Parameter names allowed to have defaults (default: [])
  }]
}
```

## Examples with Different Options

### Allow Simple Defaults

```javascript
{
  "allowSimpleDefaults": true
}

// ✅ Simple primitive defaults allowed
function process(enabled = false, count = 0, name = "", data = null) { }

// ❌ Complex defaults still not allowed
function setup(config = {enabled: true}) { }
```

### Allow in Arrow Functions

```javascript
{
  "allowInArrowFunctions": true
}

// ✅ Arrow functions can have defaults (functional programming style)
const map = (fn = x => x) => array => array.map(fn);
const filter = (predicate = () => true) => array => array.filter(predicate);

// ❌ Regular functions still can't have defaults
function process(data = {}) { } // Still an error
```

### Allow for Last Parameter

```javascript
{
  "allowForLastParam": true
}

// ✅ Common options pattern
function createUser(name, email, options = {}) { }
function fetchData(url, callback, timeout = 5000) { }

// ❌ Non-last parameters can't have defaults
function process(data = {}, callback) { } // Error on data
```

### Exempted Parameter Names

```javascript
{
  "exemptedParamNames": ["options", "config", "settings"]
}

// ✅ Common configuration parameter names
function createClient(baseURL, options = {}) { }
function setup(environment, config = {}) { }

// ❌ Other parameter names still can't have defaults
function greet(name = "Guest") { } // Still an error
```

### Allow in Methods

```javascript
{
  "allowInMethods": true
}

// ✅ Object and class methods can have defaults
class Calculator {
  multiply(a = 1, b = 1) { return a * b; }
}

const utils = {
  format(text = "", uppercase = false) {
    return uppercase ? text.toUpperCase() : text;
  }
};

// ❌ Standalone functions still can't have defaults
function add(a = 0, b = 0) { } // Still an error
```

## Philosophy

This rule promotes:

1. **Explicit code**: Default handling logic is visible in the function body
2. **Better testing**: You can test default logic separately from main logic
3. **Clearer intent**: It's obvious when and how defaults are applied
4. **Easier debugging**: Default logic doesn't hide in parameter declarations
5. **Consistent patterns**: All parameter validation happens in one place

## Best Practices

### Use Constants for Defaults

```javascript
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRIES = 3;

function apiCall(endpoint, timeout, retries) {
  timeout = timeout ?? DEFAULT_TIMEOUT;
  retries = retries ?? DEFAULT_RETRIES;
  // Implementation
}
```

### Group Default Handling

```javascript
function processUser(name, age, email, active) {
  // Handle all defaults at the top
  name = name ?? "Anonymous";
  age = age ?? 0;
  email = email ?? "";
  active = active ?? true;

  // Main logic
  return { name, age, email, active };
}
```

### Use Validation Functions

```javascript
function validateAndDefault(value, defaultValue, validator) {
  if (value === undefined) return defaultValue;
  if (validator && !validator(value)) {
    throw new Error('Invalid value');
  }
  return value;
}

function createUser(name, age) {
  name = validateAndDefault(name, "Anonymous", x => typeof x === 'string');
  age = validateAndDefault(age, 0, x => x >= 0);

  return { name, age };
}
```

## When to Use This Rule

- **Large codebases** where explicit patterns improve maintainability
- **Teams** that prefer explicit over implicit behavior
- **Critical applications** where parameter handling needs to be obvious
- **Testing-focused environments** where mocking defaults is important
- **Code review contexts** where parameter behavior should be clear

## When NOT to Use This Rule

- **Functional programming** codebases that rely heavily on defaults
- **Quick prototypes** where brevity is more important than explicitness
- **Libraries** that need concise public APIs
- **Teams** that prefer the brevity of parameter defaults