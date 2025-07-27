# TypeScript Generator Builder

A fluent API library for generating TypeScript code with organized sections, comprehensive JSDoc support, and metadata tracking.

## Overview


This library provides a clean, chainable API for programmatically generating TypeScript interfaces, types, enums, and other code constructs. It serves as a **simplified abstraction layer over the TypeScript Compiler API**, combining the ease of use of template-based generation with the robustness and correctness of the official TypeScript compiler.

The library emphasizes organization through sections, comprehensive documentation generation, and traceability through metadata - all while ensuring your generated code is syntactically correct and follows TypeScript best practices.

## Core Features

- **Fluent API**: Chainable methods for building TypeScript constructs without AST complexity
- **Compiler API Foundation**: Built on TypeScript's official compiler API for guaranteed syntax correctness
- **Section Organization**: Group related code with customizable sections
- **JSDoc Support**: Single-line and multi-line JSDoc generation with metadata
- **Intelligent Imports**: You suggest the imports that are possible, and it will only use the ones that are needed
- **Metadata Tracking**: Track source, version, generation time, and custom metadata
- **Flexible Configuration**: Global and per-section configuration options
- **Type Safety**: Full TypeScript support with proper type definitions
- **Professional Output**: Consistent formatting and style using TypeScript's built-in printer


## Installation

```bash
npm install ts-generator-builder
```

## Quick Start

```typescript
import { createGenerator } from 'ts-generator-builder';

const generator = createGenerator();

const result = generator
  .section('User Types', {
    description: 'Core user interfaces and types',
    metadata: {
      source: 'user-schema.json',
      version: '1.0.0'
    }
  }, (section) => {
    section.addInterface('User', (iface) => {
      iface
        .property('id', 'number')
        .property('name', 'string')
        .property('email', 'string');
    });
    
    section.addType('PartialUser', 'Partial<User>');
  })
  .section('User Enums', (section) => {
    section.addEnum('UserRole', (enumBuilder) => {
      enumBuilder.values(['admin', 'user', 'guest']);
    });
  })
  .generate();

console.log(result);
```

**Generated Output:**
```typescript
/**
 * User Types
 * Core user interfaces and types
 * 
 * @source user-schema.json
 * @version 1.0.0
 */
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
/**
 * End User Types
 */

// User Enums
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}
// End User Enums
```

## API Reference

### Generator Creation

```typescript
interface GeneratorConfig {
  sectionDefaults?: {
    jsdocStyle?: 'single' | 'multi';
    addEndComment?: boolean;
    exportAll?: boolean;
    spacing?: 'compact' | 'normal' | 'loose';
    sortItems?: boolean;
  };
  globalMetadata?: {
    generator?: string;
    generatedAt?: string | Date;
    project?: string;
    [key: string]: any;
  };
}

function createGenerator(config?: GeneratorConfig): Generator;
```

### Section Configuration
```typescript
interface SectionOptions {
  description?: string | string[];
  jsdocStyle?: 'single' | 'multi';
  addEndComment?: boolean;
  exportAll?: boolean;
  spacing?: 'compact' | 'normal' | 'loose';
  sortItems?: boolean;
  order?: number;
  metadata?: {
    source?: string;
    version?: string;
    generatedAt?: string | Date;
    author?: string;
    [key: string]: any;
  };
}
```

### Interface Builder

```typescript
// Basic interface
section.addInterface('User', (iface) => {
  iface
    .property('id', 'number')
    .property('name', 'string')
    .property('email', 'string');
});

// Interface with optional properties
section.addInterface('UserProfile', (iface) => {
  iface
    .property('bio', 'string', { optional: true })
    .property('avatar', 'string', { optional: true })
    .property('verified', 'boolean');
});

// Interface with JSDoc
section.addInterface('ApiResponse', (iface) => {
  iface
    .jsdoc('Standard API response wrapper')
    .property('data', 'T')
    .property('success', 'boolean')
    .property('message', 'string', { optional: true });
});
```


### Type Builder

```typescript
// Simple type alias
section.addType('UserId', 'string');

// Complex type alias
section.addType('UserEvent', 'UserCreated | UserUpdated | UserDeleted');

// Generic type alias
section.addType('ApiResponse<T>', '{ data: T; success: boolean; message?: string }');

// Type with JSDoc
section.addType('Timestamp', 'number', {
  jsdoc: 'Unix timestamp in milliseconds'
});
```

### Enum Builder
```typescript
// String enum with values
section.addEnum('UserRole', (enumBuilder) => {
  enumBuilder.values(['admin', 'user', 'guest']);
});

// Enum with custom keys and values
section.addEnum('HttpStatus', (enumBuilder) => {
  enumBuilder
    .member('OK', 200)
    .member('NOT_FOUND', 404)
    .member('SERVER_ERROR', 500);
});

// Enum with JSDoc
section.addEnum('EventType', (enumBuilder) => {
  enumBuilder
    .jsdoc('Available event types for the system')
    .values(['CREATE', 'UPDATE', 'DELETE']);
});
```

### Advanced Configuration Examples
```typescript
// Generator with global configuration
const generator = createGenerator({
  sectionDefaults: {
    jsdocStyle: 'multi',
    addEndComment: true,
    spacing: 'normal',
    sortItems: true
  },
  globalMetadata: {
    generator: 'ts-generator-builder',
    project: 'my-awesome-project',
    generatedAt: new Date()
  }
});

// Section with custom metadata and options
generator.section('Database Models', {
  description: [
    'Generated database model interfaces',
    'Auto-generated from schema.prisma'
  ],
  jsdocStyle: 'multi',
  spacing: 'loose',
  order: 1,
  metadata: {
    source: 'schema.prisma',
    version: '2.1.0',
    generatedAt: new Date(),
    author: 'Schema Generator'
  }
}, (section) => {
  // Section content...
});
```

### Property Configuration
```typescript
// Interface with detailed property configuration
section.addInterface('User', (iface) => {
  iface
    .property('id', 'string', {
      jsdoc: 'Unique user identifier',
      readonly: true
    })
    .property('email', 'string', {
      jsdoc: 'User email address'
    })
    .property('profile', 'UserProfile', {
      optional: true,
      jsdoc: 'Optional user profile data'
    });
});
```

## Common Use Cases

### API Response Types Generation
```typescript
const generator = createGenerator();

generator.section('API Types', (section) => {
  // Base response interface
  section.addInterface('BaseResponse', (iface) => {
    iface
      .jsdoc('Base structure for all API responses')
      .property('success', 'boolean')
      .property('timestamp', 'number')
      .property('requestId', 'string');
  });

  // Generic data response
  section.addInterface('DataResponse<T>', (iface) => {
    iface
      .extends('BaseResponse')
      .property('data', 'T')
      .property('meta', 'ResponseMeta', { optional: true });
  });

  // Error response
  section.addInterface('ErrorResponse', (iface) => {
    iface
      .extends('BaseResponse')
      .property('error', 'ApiError')
      .property('details', 'string[]', { optional: true });
  });
});
```

### Database Schema Generation
```typescript
generator.section('Database Models', {
  description: 'Generated from database schema',
  metadata: { source: 'database.sql' }
}, (section) => {
  // User model
  section.addInterface('User', (iface) => {
    iface
      .property('id', 'number', { readonly: true })
      .property('email', 'string')
      .property('createdAt', 'Date', { readonly: true })
      .property('updatedAt', 'Date', { readonly: true });
  });

  // Status enum
  section.addEnum('UserStatus', (enumBuilder) => {
    enumBuilder.values(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
  });
});
```

### Configuration Types
```typescript
generator.section('Configuration', (section) => {
  section.addInterface('AppConfig', (iface) => {
    iface
      .property('database', 'DatabaseConfig')
      .property('redis', 'RedisConfig', { optional: true })
      .property('logging', 'LoggingConfig')
      .property('features', 'FeatureFlags');
  });

  section.addType('Environment', "'development' | 'staging' | 'production'");
});
```

## Best Practices

### 1. Organization and Structure

```typescript
// ✅ Good: Organize by logical sections
const generator = createGenerator();

generator.section('Core Types', { order: 1 }, (section) => {
  // Base types first
});

generator.section('API Models', { order: 2 }, (section) => {
  // API-specific types
});

generator.section('Utility Types', { order: 3 }, (section) => {
  // Helper and utility types
});
```

### 2. Consistent Naming and Documentation
```typescript
// ✅ Good: Consistent naming and comprehensive docs
section.addInterface('UserCreateRequest', (iface) => {
  iface
    .jsdoc([
      'Request payload for creating a new user',
      '@example',
      '```typescript',
      'const request: UserCreateRequest = {',
      '  email: "user@example.com",',
      '  name: "John Doe"',
      '};',
      '```'
    ])
    .property('email', 'string', {
      jsdoc: 'User email address (must be unique)'
    })
    .property('name', 'string', {
      jsdoc: 'Full name of the user'
    });
});
```

### 3. Reusable Configuration
```typescript
// ✅ Good: Define reusable configurations
const commonConfig = {
  jsdocStyle: 'multi' as const,
  spacing: 'normal' as const,
  addEndComment: true
};

generator.section('Models', commonConfig, (section) => {
  // Your types here
});

generator.section('Services', commonConfig, (section) => {
  // More types here
});
```

### 4. Type Safety and Validation
```typescript
// ✅ Good: Use strict types and validation
section.addInterface('ApiConfig', (iface) => {
  iface
    .property('baseUrl', 'string', {
      jsdoc: 'Base URL for API requests (must be valid URL)'
    })
    .property('timeout', 'number', {
      jsdoc: 'Request timeout in milliseconds (positive integer)'
    })
    .property('retries', 'number', {
      jsdoc: 'Number of retry attempts (0-5)',
      optional: true
    });
});
```

## Tips and Tricks
- **Use meaningful section names** that clearly indicate the purpose
- **Group related types together** in the same section
- **Add comprehensive JSDoc** for better IDE support
- **Use consistent naming conventions** across your generated types
- **Order sections logically** using the `order` property
- **Include generation metadata** for debugging and maintenance
- **Test your generated output** to ensure it compiles correctly

## Complete Example
```typescript
const generator = createGenerator({
  sectionDefaults: {
    jsdocStyle: 'multi',
    spacing: 'normal'
  }
});

// Generate and save
const output = generator.generate();
await fs.writeFile('generated-types.ts', output);
```
