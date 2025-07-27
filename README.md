# TypeScript Generator Builder

A fluent API library for generating TypeScript code with organized sections, comprehensive JSDoc support, and metadata tracking.

## Overview

This library provides a clean, chainable API for programmatically generating TypeScript interfaces, types, enums, and other code constructs. It emphasizes organization through sections, comprehensive documentation generation, and traceability through metadata.

## Core Features

- **Fluent API**: Chainable methods for building TypeScript constructs
- **Section Organization**: Group related code with customizable sections
- **JSDoc Support**: Single-line and multi-line JSDoc generation with metadata
- **Metadata Tracking**: Track source, version, generation time, and custom metadata
- **Flexible Configuration**: Global and per-section configuration options
- **Type Safety**: Full TypeScript support with proper type definitions
- **TypeScript Compiler API**: Uses the TypeScript Compiler API for robust code generation
- **Consistent Case Conversion**: Uses the change-case package for reliable case transformations
- **Conditional Imports**: Smart import statements that only include what's actually used

## Installation

```bash
npm install ts-generator-builder
```

## Quick Start

```typescript
import { createGenerator } from 'ts-generator-builder';

const generator = createGenerator();

const result = generator
  // Add imports (only used imports will be included)
  .section('Imports', (section) => {
    section.addImports('react', (builder) => {
      builder
        .named('useState')
        .named('useEffect')
        // Mark imports as used
        .markUsed('useState');
    });
    
    section.addImports('./types', (builder) => {
      builder
        .named('User')
        .named('UserRole')
        // Mark imports as used
        .markUsed('User')
        .markUsed('UserRole');
    });
  })
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
 * Imports
 * Import statements for external dependencies
 */
import { useState } from "react";
import { User, UserRole } from "./types";
// End Imports

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
// Create a generator with default options
const generator = createGenerator();

// Create a generator with custom options
const generatorWithOptions = createGenerator({
  sectionDefaults: {
    jsdocStyle: 'multi',
    addEndComment: true,
    exportAll: false,
    spacing: 'normal',
    sortItems: false
  },
  globalMetadata: {
    generator: 'ts-generator-builder',
    generatedAt: new Date(),
    project: 'my-project'
  }
});
```

### Section Configuration

```typescript
// Basic section
generator.section('Basic Types', (section) => {
  // Add types, interfaces, enums...
});

// Section with options
generator.section('API Models', {
  description: 'API request and response models',
  jsdocStyle: 'multi',
  addEndComment: true,
  exportAll: true,
  spacing: 'normal',
  sortItems: true,
  order: 1,
  metadata: {
    source: 'api-spec.json',
    version: '1.0.0',
    author: 'API Team'
  }
}, (section) => {
  // Add types, interfaces, enums...
});
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

// Interface that extends another interface
section.addInterface('AdminUser', (iface) => {
  iface
    .extends('User')
    .property('permissions', 'string[]')
    .property('role', 'UserRole');
});
```

### Type Builder

The TypeBuilder provides a fluent API for creating complex type definitions with support for various TypeScript type constructs.

#### Simple Types

```typescript
// Simple type alias (string-based approach)
section.addType('UserId', 'string');

// Simple type alias (builder approach)
section.addType('UserId', (builder) => {
  builder
    .jsdoc('Unique identifier for a user')
    .primitive('string');
});

// Type with JSDoc (string-based approach)
section.addType('Timestamp', 'number', {
  jsdoc: 'Unix timestamp in milliseconds'
});
```

#### Complex Types

```typescript
// Union type
section.addType('Status', (builder) => {
  builder
    .jsdoc('Possible status values for a request')
    .union(['"pending"', '"approved"', '"rejected"']);
});

// Intersection type
section.addType('UserWithRole', (builder) => {
  builder
    .jsdoc('User with additional role information')
    .intersection(['User', '{ role: UserRole }']);
});

// Array type
section.addType('UserList', (builder) => {
  builder
    .jsdoc('List of users')
    .array('User');
});

// Tuple type
section.addType('UserTuple', (builder) => {
  builder
    .jsdoc('User information as a tuple')
    .tuple(['string', 'number', 'boolean']);
});

// Keyof type
section.addType('UserKeys', (builder) => {
  builder
    .jsdoc('All property keys of the User interface')
    .keyof('User');
});

// Typeof type
section.addType('ConfigType', (builder) => {
  builder
    .jsdoc('Type of the API_CONFIG object')
    .typeof('API_CONFIG');
});
```

#### Generic Types

```typescript
// Generic type with single type parameter
section.addType('Result', (builder) => {
  builder
    .jsdoc('Generic result container')
    .typeParameter('T')
    .reference('{ data: T; error?: string }');
});

// Generic type with multiple type parameters and constraints
section.addType('Dictionary', (builder) => {
  builder
    .jsdoc('Dictionary mapping keys to values')
    .addTypeParameters([
      { name: 'K', constraint: 'string' },
      { name: 'V' }
    ])
    .reference('Record<K, V>');
});

// Complex type combining multiple features
section.addType('ApiHandler', (builder) => {
  builder
    .jsdoc([
      'API request handler function type',
      'Takes request data and returns a promise with the response'
    ])
    .addTypeParameters([
      { name: 'TRequest' },
      { name: 'TResponse', constraint: 'object' }
    ])
    .reference('(req: TRequest) => Promise<Result<TResponse>>');
});
```

The TypeBuilder provides the following methods:

- **primitive(type)**: Set the type to a primitive type (string, number, boolean, etc.)
- **reference(type)**: Set the type to a reference to another type
- **union(types)**: Create a union type
- **intersection(types)**: Create an intersection type
- **array(elementType)**: Create an array type
- **tuple(elementTypes)**: Create a tuple type
- **keyof(type)**: Create a keyof type
- **typeof(value)**: Create a typeof type
- **typeParameter(name, constraint?, defaultType?)**: Add a type parameter (generic)
- **addTypeParameters(params)**: Add multiple type parameters (generics)
- **jsdoc(comment)**: Add a JSDoc comment to the type

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

### Imports Builder

```typescript
// Named imports with conditional inclusion
section.addImports('react', (builder) => {
  builder
    .named('useState')
    .named('useEffect')
    .named('useContext')
    // Only useState and useEffect will be included in the output
    .markUsed('useState')
    .markUsed('useEffect');
});

// Default import
section.addImports('react-dom', (builder) => {
  builder
    .default('ReactDOM')
    .markDefaultUsed();
});

// Namespace import
section.addImports('react-router-dom', (builder) => {
  builder
    .namespace('Router')
    .markNamespaceUsed();
});

// Mixed imports (default and named)
section.addImports('styled-components', (builder) => {
  builder
    .default('styled')
    .named('css')
    .named('keyframes')
    // Only styled and css will be included
    .markDefaultUsed()
    .markUsed('css');
});

// Multiple named imports at once
section.addImports('./types', (builder) => {
  builder
    .namedMultiple(['User', 'UserRole', 'ApiResponse'])
    .markUsed('User')
    .markUsed('UserRole');
});

// Unused imports (won't appear in output)
section.addImports('unused-module', (builder) => {
  builder
    .named('UnusedComponent')
    .named('UnusedFunction');
});
```

The ImportsBuilder provides a powerful way to manage imports in your generated code:

- **Conditional Imports**: Only imports marked as "used" will be included in the output
- **Multiple Import Styles**: Support for named, default, and namespace imports
- **Smart Formatting**: Imports are automatically placed at the top of the generated code
- **Deduplication**: Duplicate imports are automatically merged

#### Import Options

You can customize the behavior of imports with options:

```typescript
// Include all imports, even if not marked as used
section.addImports('react', { includeUnused: true }, (builder) => {
  builder
    .named('useState')
    .named('useEffect');
});

// Use type-only imports (import type { ... } from '...')
section.addImports('./types', { typeOnly: true }, (builder) => {
  builder
    .named('User')
    .named('UserRole')
    .markUsed('User')
    .markUsed('UserRole');
});
```

### Logic Statements and Loops

The library provides builders for adding logic statements and loops to your generated code. These builders allow you to create complex control flow structures with a fluent API.

#### If Statements

```typescript
// Simple if statement
section.addIf((ifBuilder) => {
  ifBuilder
    .jsdoc('Check if user is authenticated')
    .condition('isAuthenticated')
    .then((block) => {
      block.addStatement('console.log("User is authenticated")');
      block.addStatement('renderAuthenticatedContent()');
    });
});

// If-else statement
section.addIf((ifBuilder) => {
  ifBuilder
    .condition('user.role === "admin"')
    .then((block) => {
      block.addStatement('renderAdminDashboard()');
    })
    .else((block) => {
      block.addStatement('renderUserDashboard()');
    });
});

// If-else-if-else statement
section.addIf((ifBuilder) => {
  ifBuilder
    .condition('status === 200')
    .then((block) => {
      block.addStatement('handleSuccess(data)');
    })
    .elseIf('status === 404', (block) => {
      block.addStatement('handleNotFound()');
    })
    .elseIf('status >= 500', (block) => {
      block.addStatement('handleServerError()');
    })
    .else((block) => {
      block.addStatement('handleUnexpectedStatus(status)');
    });
});

// Nested if statements
section.addIf((ifBuilder) => {
  ifBuilder
    .condition('isLoggedIn')
    .then((block) => {
      block.addStatement('const userData = getUserData()');
      block.addIf((nestedIf) => {
        nestedIf
          .condition('userData.isVerified')
          .then((nestedBlock) => {
            nestedBlock.addStatement('showVerifiedBadge()');
          });
      });
    });
});
```

#### Switch Statements

```typescript
section.addSwitch((switchBuilder) => {
  switchBuilder
    .jsdoc('Handle different user roles')
    .expression('userRole')
    .case('"admin"', (block) => {
      block.addStatement('console.log("Admin user")');
      block.addStatement('grantFullAccess()');
      block.addStatement('break');
    })
    .case('"moderator"', (block) => {
      block.addStatement('console.log("Moderator user")');
      block.addStatement('grantModeratorAccess()');
      block.addStatement('break');
    })
    .default((block) => {
      block.addStatement('console.log("Unknown role")');
      block.addStatement('grantGuestAccess()');
    });
});
```

#### For Loops

```typescript
section.addFor((forBuilder) => {
  forBuilder
    .jsdoc('Process items in an array')
    .init('let i = 0')
    .condition('i < items.length')
    .increment('i++')
    .body((block) => {
      block.addStatement('console.log(`Processing item ${i}:`, items[i])');
      block.addStatement('processItem(items[i])');
    });
});
```

#### While Loops

```typescript
section.addWhile((whileBuilder) => {
  whileBuilder
    .jsdoc('Retry an operation until successful or max retries reached')
    .condition('!success && retries < MAX_RETRIES')
    .body((block) => {
      block.addStatement('console.log(`Attempt ${retries + 1}`)');
      block.addStatement('success = attemptOperation()');
      block.addStatement('retries++');
    });
});
```

#### Do-While Loops

```typescript
section.addDoWhile((doWhileBuilder) => {
  doWhileBuilder
    .jsdoc('Get user input until valid')
    .body((block) => {
      block.addStatement('const input = getUserInput()');
      block.addStatement('isValid = validateInput(input)');
      block.addStatement('if (!isValid) showError("Invalid input")');
    })
    .condition('!isValid');
});
```

#### Block Builder

The BlockBuilder is used to build blocks of statements for if/else clauses, switch cases, and loop bodies. It provides methods for adding statements and nested control structures:

```typescript
// Adding statements
block.addStatement('console.log("Hello, world!")');

// Adding nested if statements
block.addIf((nestedIf) => {
  nestedIf
    .condition('condition')
    .then((nestedBlock) => {
      nestedBlock.addStatement('statement');
    });
});

// Adding nested switch statements
block.addSwitch((nestedSwitch) => {
  nestedSwitch
    .expression('expression')
    .case('value', (caseBlock) => {
      caseBlock.addStatement('statement');
    });
});

// Adding nested loops
block.addFor((nestedFor) => {
  nestedFor
    .init('init')
    .condition('condition')
    .increment('increment')
    .body((loopBlock) => {
      loopBlock.addStatement('statement');
    });
});

// Adding return statements
block.addReturn('value');
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

## Best Practices

1. **Organize by logical sections** - Group related types together in the same section
2. **Use meaningful section names** that clearly indicate the purpose
3. **Add comprehensive JSDoc** for better IDE support
4. **Use consistent naming conventions** across your generated types
5. **Order sections logically** using the `order` property
6. **Include generation metadata** for debugging and maintenance

## Technical Implementation

This library uses modern technologies to ensure robust and reliable code generation:

### TypeScript Compiler API

Instead of relying on string concatenation or templates, ts-generator-builder uses the TypeScript Compiler API to:

- Create Abstract Syntax Tree (AST) nodes programmatically
- Add JSDoc comments to these nodes
- Print the AST to formatted TypeScript code

This approach provides several benefits:
- **Syntactically correct code**: The generated code is guaranteed to be syntactically valid TypeScript
- **Proper formatting**: The TypeScript printer handles indentation, spacing, and other formatting details
- **Type safety**: The AST nodes are type-checked, reducing the risk of generating invalid code

### Case Conversion

For consistent case conversion (e.g., converting strings to PascalCase or camelCase), the library uses the [change-case](https://github.com/blakeembrey/change-case) package, which provides:

- Reliable case conversion for various naming conventions
- Support for special characters and edge cases
- Consistent behavior across different platforms

## License

MIT
