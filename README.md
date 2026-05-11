# @creadev.org/sandbox

> Sandbox - code isolation

[![npm](https://img.shields.io/npm/v/@creadev.org/sandbox)](https://www.npmjs.com/package/@creadev.org/sandbox)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Install

```bash
npm install @creadev.org/sandbox
```

## Usage

```typescript
import { Sandbox, createSandbox, run, isolate } from '@creadev.org/sandbox';

const sandbox = createSandbox();
const result = await run('console.log("safe")', { timeout: 1000 });
const isolated = isolate({ allowedGlobs: ['**'] });
```

## API

| Function | Description |
|----------|-------------|
| `createSandbox(options?)` | Create sandbox |
| `run(code, options?)` | Run safely |
| `isolate(options?)` | Create isolated scope |

## License

MIT
trigger
