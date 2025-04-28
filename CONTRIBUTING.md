# Contributing to KitAgent

Thank you for considering contributing to KitAgent! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:

- Check the [existing issues](https://github.com/Drakezair/kitagent/issues) to see if the problem has already been reported
- Try to create a minimal, reproducible example that demonstrates the issue

When submitting a bug report, please include:

- A clear, descriptive title
- Detailed steps to reproduce the bug
- Expected behavior and what actually happened
- KitAgent version, Node.js version, and operating system
- Any error messages or logs

### Suggesting Enhancements

Enhancement suggestions are welcome! When suggesting an enhancement, please:

- Provide a clear and detailed explanation of the feature
- Explain why this enhancement would be useful to KitAgent users
- Consider how it might be implemented and potential implications

### Pull Requests

We welcome pull requests for bug fixes, features, and improvements. Here's how to submit a good PR:

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies** with `pnpm install`
3. **Make your changes**, following the coding style and conventions
6. **Update documentation** when needed
7. **Submit your pull request** with a clear description of the changes

## Development Setup

To set up KitAgent for development:

```bash
# Clone your fork of the repo
git clone https://github.com/YOUR_USERNAME/kitagent.git

# Navigate to the project directory
cd kitagent

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test
```

### Project Structure

The KitAgent codebase is organized as follows:

```
packages/
  ├── core/               # Core framework functionality
  │   ├── src/
  │   │   ├── agents/     # Agent-related functionality
  │   │   ├── chat/       # Chat interface
  │   │   ├── http/       # HTTP server and endpoints
  │   │   ├── mcp/        # Model Context Protocol implementation
  │   │   ├── tools/      # Tools system
  │   │   ├── types/      # TypeScript type definitions
  │   │   ├── utils/      # Utility functions
  │   │   └── workflows/  # Workflow engine
  │   └── package.json
  └── kitagent-cli/       # CLI tool for KitAgent
      ├── src/
      └── package.json
```

## Coding Guidelines

### TypeScript Style Guide

- Use TypeScript for all code
- Follow the established patterns in the codebase
- Add appropriate type annotations
- Avoid using `any` when possible


### Commit Messages

Please use clear and descriptive commit messages following these guidelines:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when relevant

Example commit message:
```
feat: Add weather tool implementation

This adds a new tool for fetching weather data from OpenWeatherMap API.
Includes TypeScript types and unit tests.

Fixes #123
```

## Documentation

Documentation is crucial for KitAgent. When adding or changing features:

- Update the README.md when appropriate
- Add or update JSDoc comments for public APIs
- Create or update example code
- Consider adding to the wiki for complex features

## Release Process

KitAgent follows semantic versioning. The release process is managed by the maintainers and involves:

1. Updating the version in package.json
2. Creating a changelog entry
3. Creating a git tag for the version
4. Publishing to npm

## Questions?

If you have any questions about contributing, feel free to [open an issue](https://github.com/Drakezair/kitagent/issues/new) or reach out to the maintainers.

Thank you for contributing to KitAgent!