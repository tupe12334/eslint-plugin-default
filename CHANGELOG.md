# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2024-09-27)

### Features

* Initial release of eslint-plugin-default
* **rules:** Add no-localhost rule to disallow hardcoded localhost usage
* **rules:** Add no-hardcoded-urls rule to disallow any hardcoded URLs
* **config:** Add recommended and strict configurations for environment-based development
* **options:** Support allowInTests, allowInComments, allowedProtocols, and allowedDomains options
* **philosophy:** Enforce proper defaults management and configuration abstraction
* **testing:** Comprehensive test suite with native ESLint RuleTester
* **build:** Support for ESLint 9 and pnpm without build step