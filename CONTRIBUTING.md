# Contributing to Cyberpunk Smart City Under Attack

Thank you for your interest in contributing to this educational cybersecurity project!

## Ethical Contribution Guidelines

Before contributing, please read and agree to our [SECURITY.md](SECURITY.md) ethical use statement.

**All contributions must:**
- Promote defensive cybersecurity thinking
- Use only fictional scenarios (never real exploits, vulnerabilities, or attack tools)
- Label all simulation content with `[SIMULATION]` prefix in log messages
- Make no external network connections

## How to Contribute

### Reporting Bugs

1. Check the [Issues](../../issues) page to see if the bug is already reported
2. Open a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behaviour
   - Browser and OS information

### Suggesting Scenarios

Want to add a new fictional cybersecurity scenario? Open an issue describing:
- The fictional incident (no real exploit details)
- The cybersecurity concepts it would teach
- The affected city assets
- The recommended defensive actions

### Adding Features

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm run test`
5. Run the build: `npm run build`
6. Commit with a clear message: `git commit -m "Add: your feature description"`
7. Push and open a Pull Request

### Code Style

- Use TypeScript — no `any` types unless absolutely necessary
- Follow existing file structure (`src/components/`, `src/data/`, `src/engine/`)
- Add unit tests for new engine logic
- Use descriptive variable and function names
- Add JSDoc comments to exported functions

## Development Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/     # React UI components
├── context/        # React Context and state
├── data/           # Static data (assets, scenarios, defenses)
├── engine/         # Simulation logic and reducer
├── hardware/       # Hardware bridge interfaces
├── styles/         # Global CSS
├── tests/          # Unit tests
└── types/          # TypeScript type definitions
```

## Pull Request Process

1. Ensure all tests pass (`npm run test`)
2. Ensure the build succeeds (`npm run build`)
3. Update the README if you added new features
4. Request review from a maintainer

Thank you for helping make cybersecurity education more engaging! 🏙️⚡
