/**
 * Core types and interfaces for the TypeScript Generator Builder library
 */

// We need to export interfaces both as types and as values for ESM compatibility
// This is because when using "type": "module" in package.json, TypeScript's
// type-only exports are not available at runtime

/**
 * Configuration options for the generator
 */
export interface GeneratorConfig {
  /**
   * Default options for all sections
   */
  sectionDefaults?: SectionOptions;
  
  /**
   * Global metadata to include in the generated output
   */
  globalMetadata?: {
    /**
     * Name of the generator
     */
    generator?: string;
    
    /**
     * Timestamp when the code was generated
     */
    generatedAt?: string | Date;
    
    /**
     * Project name
     */
    project?: string;
    
    /**
     * Additional custom metadata
     */
    [key: string]: any;
  };
}

/**
 * Configuration options for a section
 */
export interface SectionOptions {
  /**
   * Description of the section
   */
  description?: string | string[];
  
  /**
   * Style of JSDoc comments
   */
  jsdocStyle?: 'single' | 'multi';
  
  /**
   * Whether to add an end comment for the section
   */
  addEndComment?: boolean;
  
  /**
   * Whether to export all items in the section
   */
  exportAll?: boolean;
  
  /**
   * Spacing style for the section
   */
  spacing?: 'compact' | 'normal' | 'loose';
  
  /**
   * Whether to sort items alphabetically
   */
  sortItems?: boolean;
  
  /**
   * Order of the section in the generated output
   */
  order?: number;
  
  /**
   * Metadata for the section
   */
  metadata?: {
    /**
     * Source of the data
     */
    source?: string;
    
    /**
     * Version of the data
     */
    version?: string;
    
    /**
     * Timestamp when the data was generated
     */
    generatedAt?: string | Date;
    
    /**
     * Author of the data
     */
    author?: string;
    
    /**
     * Additional custom metadata
     */
    [key: string]: any;
  };
}

/**
 * Configuration options for a property in an interface
 */
export interface PropertyOptions {
  /**
   * JSDoc comment for the property
   */
  jsdoc?: string | string[];
  
  /**
   * Whether the property is optional
   */
  optional?: boolean;
  
  /**
   * Whether the property is readonly
   */
  readonly?: boolean;
}

/**
 * Configuration options for a type
 */
export interface TypeOptions {
  /**
   * JSDoc comment for the type
   */
  jsdoc?: string | string[];
  
  /**
   * Whether to export the type
   */
  export?: boolean;
}

/**
 * Configuration options for an enum
 */
export interface EnumOptions {
  /**
   * JSDoc comment for the enum
   */
  jsdoc?: string | string[];
  
  /**
   * Whether to export the enum
   */
  export?: boolean;
  
  /**
   * Whether the enum is a const enum
   */
  const?: boolean;
}

/**
 * Configuration options for an object property
 */
export interface ObjectPropertyOptions {
  /**
   * JSDoc comment for the property
   */
  jsdoc?: string | string[];
  
  /**
   * Whether the property is readonly
   */
  readonly?: boolean;
  
  /**
   * Optional type annotation for the property
   * If not provided, the type will be inferred from the value
   */
  type?: string;
}

/**
 * Configuration options for an object
 */
export interface ObjectOptions {
  /**
   * JSDoc comment for the object
   */
  jsdoc?: string | string[];
  
  /**
   * Whether to export the object
   */
  export?: boolean;
  
  /**
   * Whether to add 'as const' assertion to the object,
   * This makes all properties readonly and narrows literal types
   */
  asConst?: boolean;
  
  /**
   * Variable name for the object
   * If provided, the object will be declared as a variable
   * Otherwise, it will be generated as an object literal expression
   */
  name?: string;
}

/**
 * Configuration options for imports
 */
export interface ImportOptions {
  /**
   * Whether to include imports that are not used in the generated code
   * If false, unused imports will be omitted
   * Default: false
   */
  includeUnused?: boolean;
  
  /**
   * Whether to use type-only imports (import type { ... } from '...')
   * Default: false
   */
  typeOnly?: boolean;
}

/**
 * Interface for the main generator
 */
export interface Generator {
  /**
   * Add a section to the generator
   */
  section(name: string, options: SectionOptions, callback: (section: Section) => void): Generator;
  section(name: string, callback: (section: Section) => void): Generator;
  
  /**
   * Generate the TypeScript code
   */
  generate(): string;
}

/**
 * Interface for a section in the generator
 */
export interface Section {
  /**
   * Add an interface to the section
   */
  addInterface(name: string, callback: (builder: InterfaceBuilder) => void): Section;
  
  /**
   * Add a type to the section
   * 
   * @param name The name of the type
   * @param type The type definition as a string
   * @param options Configuration options for the type
   * @returns The section instance for chaining
   * 
   * @example
   * // Simple type alias
   * section.addType('UserId', 'string');
   */
  addType(name: string, type: string, options?: TypeOptions): Section;
  
  /**
   * Add a type to the section using a builder
   * 
   * @param name The name of the type
   * @param callback A callback function to configure the type
   * @param options Configuration options for the type
   * @returns The section instance for chaining
   * 
   * @example
   * // Complex type with builder
   * section.addType('Status', (builder) => {
   *   builder.union(['pending', 'approved', 'rejected']);
   * });
   */
  addType(name: string, callback: (builder: TypeBuilder) => void, options?: TypeOptions): Section;
  
  /**
   * Add an enum to the section
   */
  addEnum(name: string, callback: (builder: EnumBuilder) => void): Section;
  
  /**
   * Add an object to the section
   */
  addObject(options: ObjectOptions, callback: (builder: ObjectBuilder) => void): Section;
  
  /**
   * Add imports to the section
   */
  addImports(moduleSpecifier: string, callback: (builder: ImportsBuilder) => void): Section;

  /**
   * Add an if statement to the section
   * 
   * @param callback A callback function to configure the if statement
   * @returns The section instance for chaining
   * 
   * @example
   * section.addIf((ifBuilder) => {
   *   ifBuilder
   *     .condition('x > 0')
   *     .then((block) => {
   *       block.addStatement('console.log("Positive")');
   *     });
   * });
   */
  addIf(callback: (builder: IfStatementBuilder) => void): Section;
  
  /**
   * Add a switch statement to the section
   * 
   * @param callback A callback function to configure the switch statement
   * @returns The section instance for chaining
   * 
   * @example
   * section.addSwitch((switchBuilder) => {
   *   switchBuilder
   *     .expression('status')
   *     .case('"pending"', (block) => {
   *       block.addStatement('console.log("Pending")');
   *       block.addStatement('break');
   *     });
   * });
   */
  addSwitch(callback: (builder: SwitchStatementBuilder) => void): Section;
  
  /**
   * Add a for loop to the section
   * 
   * @param callback A callback function to configure the for loop
   * @returns The section instance for chaining
   * 
   * @example
   * section.addFor((forBuilder) => {
   *   forBuilder
   *     .init('let i = 0')
   *     .condition('i < 10')
   *     .increment('i++')
   *     .body((block) => {
   *       block.addStatement('console.log(i)');
   *     });
   * });
   */
  addFor(callback: (builder: ForLoopBuilder) => void): Section;
  
  /**
   * Add a while loop to the section
   * 
   * @param callback A callback function to configure the while loop
   * @returns The section instance for chaining
   * 
   * @example
   * section.addWhile((whileBuilder) => {
   *   whileBuilder
   *     .condition('condition')
   *     .body((block) => {
   *       block.addStatement('console.log("Looping")');
   *     });
   * });
   */
  addWhile(callback: (builder: WhileLoopBuilder) => void): Section;
  
  /**
   * Add a do-while loop to the section
   * 
   * @param callback A callback function to configure the do-while loop
   * @returns The section instance for chaining
   * 
   * @example
   * section.addDoWhile((doWhileBuilder) => {
   *   doWhileBuilder
   *     .body((block) => {
   *       block.addStatement('console.log("Looping")');
   *     })
   *     .condition('condition');
   * });
   */
  addDoWhile(callback: (builder: DoWhileLoopBuilder) => void): Section;
}

/**
 * Interface for building an interface
 */
export interface InterfaceBuilder {
  /**
   * Add a property to the interface
   */
  property(name: string, type: string, options?: PropertyOptions): this;
  
  /**
   * Add a JSDoc comment to the interface
   */
  jsdoc(comment: string | string[]): this;
  
  /**
   * Make the interface extend another interface
   */
  extends(interfaceName: string | string[]): this;
}

/**
 * Interface for building an enum
 */
export interface EnumBuilder {
  /**
   * Add a member to the enum
   */
  member(key: string, value: string | number): this;
  
  /**
   * Add multiple values to the enum
   */
  values(values: string[]): this;
  
  /**
   * Add a JSDoc comment to the enum
   */
  jsdoc(comment: string | string[]): this;
  
  /**
   * Generate the TypeScript code for the enum
   */
  generate(): string;
  
  /**
   * Generate the AST node for the enum
   */
  generateNode(): import('typescript').EnumDeclaration;
}

/**
 * Interface for building a type
 */
export interface TypeBuilder {
  /**
   * Set the type to a primitive type
   * 
   * @param type The primitive type (string, number, boolean, etc.)
   * @returns The builder instance for chaining
   * 
   * @example
   * // type UserId = string;
   * builder.primitive('string');
   */
  primitive(type: string): this;
  
  /**
   * Set the type to a reference to another type
   * 
   * @param type The type to reference
   * @returns The builder instance for chaining
   * 
   * @example
   * // type UserList = User[];
   * builder.reference('User[]');
   */
  reference(type: string): this;
  
  /**
   * Create a union type
   * 
   * @param types The types to union
   * @returns The builder instance for chaining
   * 
   * @example
   * // type Status = 'pending' | 'approved' | 'rejected';
   * builder.union(['pending', 'approved', 'rejected']);
   */
  union(types: string[]): this;
  
  /**
   * Create an intersection type
   * 
   * @param types The types to intersect
   * @returns The builder instance for chaining
   * 
   * @example
   * // type UserWithRole = User & { role: string };
   * builder.intersection(['User', '{ role: string }']);
   */
  intersection(types: string[]): this;
  
  /**
   * Create an array type
   * 
   * @param elementType The type of the array elements
   * @returns The builder instance for chaining
   * 
   * @example
   * // type UserIds = string[];
   * builder.array('string');
   */
  array(elementType: string): this;
  
  /**
   * Create a tuple type
   * 
   * @param elementTypes The types of the tuple elements
   * @returns The builder instance for chaining
   * 
   * @example
   * // type UserInfo = [string, number, boolean];
   * builder.tuple(['string', 'number', 'boolean']);
   */
  tuple(elementTypes: string[]): this;
  
  /**
   * Create a keyof type
   * 
   * @param type The type to get keys from
   * @returns The builder instance for chaining
   * 
   * @example
   * // type UserKeys = keyof User;
   * builder.keyof('User');
   */
  keyof(type: string): this;
  
  /**
   * Create a typeof type
   * 
   * @param value The value to get the type of
   * @returns The builder instance for chaining
   * 
   * @example
   * // type Config = typeof defaultConfig;
   * builder.typeof('defaultConfig');
   */
  typeof(value: string): this;
  
  /**
   * Add a type parameter (generic)
   * 
   * @param name The name of the type parameter
   * @param constraint Optional constraint for the type parameter
   * @param defaultType Optional default type for the type parameter
   * @returns The builder instance for chaining
   * 
   * @example
   * // type Result<T> = { data: T, error?: string };
   * builder.typeParameter('T').reference('{ data: T, error?: string }');
   */
  typeParameter(name: string, constraint?: string, defaultType?: string): this;
  
  /**
   * Add multiple type parameters (generics)
   * 
   * @param params The type parameters to add
   * @returns The builder instance for chaining
   * 
   * @example
   * // type Result<T, E> = { data?: T, error?: E };
   * builder.addTypeParameters([
   *   { name: 'T' },
   *   { name: 'E' }
   * ]).reference('{ data?: T, error?: E }');
   */
  addTypeParameters(params: Array<{ name: string, constraint?: string, defaultType?: string }>): this;
  
  /**
   * Add a JSDoc comment to the type
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   * 
   * @example
   * // /** User ID type * /
   * // type UserId = string;
   * builder.jsdoc('User ID type').primitive('string');
   */
  jsdoc(comment: string | string[]): this;
  
  /**
   * Generate the TypeScript code for the type
   * 
   * @returns The generated TypeScript code
   */
  generate(): string;
  
  /**
   * Generate the AST node for the type
   * 
   * @returns The type alias declaration node
   */
  generateNode(): import('typescript').TypeAliasDeclaration;
}

/**
 * Interface for building an object
 */
export interface ObjectBuilder {
  /**
   * Add a property to the object with a value
   * 
   * @param name The name of the property
   * @param value The value of the property
   * @param options Configuration options for the property
   * @returns The builder instance for chaining
   */
  property(name: string, value: any, options?: ObjectPropertyOptions): this;
  
  /**
   * Add a nested object property
   * 
   * @param name The name of the property
   * @param callback A callback function to configure the nested object
   * @param options Configuration options for the property
   * @returns The builder instance for chaining
   */
  nestedObject(name: string, callback: (builder: ObjectBuilder) => void, options?: ObjectPropertyOptions): this;
  
  /**
   * Add a JSDoc comment to the object
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this;
  
  /**
   * Make the entire object readonly using 'as const' assertion
   * 
   * @returns The builder instance for chaining
   */
  asConst(): this;
  
  /**
   * Generate the TypeScript code for the object
   * 
   * @returns The generated TypeScript code
   */
  generate(): string;
  
  /**
   * Generate the AST node for the object
   * 
   * @returns The object literal expression node
   */
  generateNode(): import('typescript').Expression;
  }

  /**
   * Interface for building imports
   */
  export interface ImportsBuilder {
    /**
     * Add a named import
     * 
     * @param name The name to import
     * @param alias Optional alias for the import
     * @returns The builder instance for chaining
     * 
     * @example
     * // import { Type } from 'module';
     * builder.named('Type');
     * 
     * @example
     * // import { Type as Alias } from 'module';
     * builder.named('Type', 'Alias');
     */
    named(name: string, alias?: string): this;
  
    /**
     * Add multiple named imports
     * 
     * @param names The names to import
     * @returns The builder instance for chaining
     * 
     * @example
     * // import { Type1, Type2, Type3 } from 'module';
     * builder.namedMultiple(['Type1', 'Type2', 'Type3']);
     */
    namedMultiple(names: string[]): this;
  
    /**
     * Add a default import
     * 
     * @param name The name for the default import
     * @returns The builder instance for chaining
     * 
     * @example
     * // import DefaultExport from 'module';
     * builder.default('DefaultExport');
     */
    default(name: string): this;
  
    /**
     * Add a namespace import
     * 
     * @param name The name for the namespace
     * @returns The builder instance for chaining
     * 
     * @example
     * // import * as namespace from 'module';
     * builder.namespace('namespace');
     */
    namespace(name: string): this;
  
    /**
     * Mark a named import as used
     * 
     * @param name The name of the import to mark as used
     * @returns The builder instance for chaining
     */
    markUsed(name: string): this;
  
    /**
     * Mark the default import as used
     * 
     * @returns The builder instance for chaining
     */
    markDefaultUsed(): this;
  
    /**
     * Mark the namespace import as used
     * 
     * @returns The builder instance for chaining
     */
    markNamespaceUsed(): this;
  
    /**
     * Generate the TypeScript code for the imports
     *
     * @returns The generated TypeScript code
     */
    generate(): string;
  }

/**
 * Interface for a base statement builder
 */
export interface StatementBuilder {
  /**
   * Add a JSDoc comment to the statement
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this;
  
  /**
   * Generate the TypeScript code for the statement
   * 
   * @returns The generated TypeScript code
   */
  generate(): string;
  
  /**
   * Generate the AST node for the statement
   * 
   * @returns The statement node
   */
  generateNode(): import('typescript').Statement;
}

/**
 * Interface for building an if statement
 */
export interface IfStatementBuilder extends StatementBuilder {
  /**
   * Add a condition to the if statement
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // if (x > 0) { ... }
   * builder.condition('x > 0');
   */
  condition(condition: string): this;
  
  /**
   * Add statements to the if block
   * 
   * @param callback A callback function to configure the if block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.then((block) => {
   *   block.addStatement('console.log("Positive")');
   * });
   */
  then(callback: (block: BlockBuilder) => void): this;
  
  /**
   * Add an else-if clause to the if statement
   * 
   * @param condition The condition expression for the else-if
   * @param callback A callback function to configure the else-if block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.elseIf('x < 0', (block) => {
   *   block.addStatement('console.log("Negative")');
   * });
   */
  elseIf(condition: string, callback: (block: BlockBuilder) => void): this;
  
  /**
   * Add an else clause to the if statement
   * 
   * @param callback A callback function to configure the else block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.else((block) => {
   *   block.addStatement('console.log("Zero")');
   * });
   */
  else(callback: (block: BlockBuilder) => void): this;
}

/**
 * Interface for building a switch statement
 */
export interface SwitchStatementBuilder extends StatementBuilder {
  /**
   * Set the expression to switch on
   * 
   * @param expression The expression to switch on
   * @returns The builder instance for chaining
   * 
   * @example
   * // switch (status) { ... }
   * builder.expression('status');
   */
  expression(expression: string): this;
  
  /**
   * Add a case clause to the switch statement
   * 
   * @param value The case value
   * @param callback A callback function to configure the case block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.case('"pending"', (block) => {
   *   block.addStatement('console.log("Pending")');
   *   block.addStatement('break');
   * });
   */
  case(value: string, callback: (block: BlockBuilder) => void): this;
  
  /**
   * Add a default clause to the switch statement
   * 
   * @param callback A callback function to configure the default block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.default((block) => {
   *   block.addStatement('console.log("Unknown status")');
   * });
   */
  default(callback: (block: BlockBuilder) => void): this;
}

/**
 * Interface for building a block of statements
 */
export interface BlockBuilder {
  /**
   * Add a statement to the block
   * 
   * @param statement The statement to add
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addStatement('console.log("Hello")');
   */
  addStatement(statement: string): this;
  
  /**
   * Add an if statement to the block
   * 
   * @param callback A callback function to configure the if statement
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addIf((ifBuilder) => {
   *   ifBuilder
   *     .condition('x > 0')
   *     .then((thenBlock) => {
   *       thenBlock.addStatement('console.log("Positive")');
   *     });
   * });
   */
  addIf(callback: (builder: IfStatementBuilder) => void): this;
  
  /**
   * Add a switch statement to the block
   * 
   * @param callback A callback function to configure the switch statement
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addSwitch((switchBuilder) => {
   *   switchBuilder
   *     .expression('status')
   *     .case('"pending"', (caseBlock) => {
   *       caseBlock.addStatement('console.log("Pending")');
   *       caseBlock.addStatement('break');
   *     });
   * });
   */
  addSwitch(callback: (builder: SwitchStatementBuilder) => void): this;
  
  /**
   * Add a for loop to the block
   * 
   * @param callback A callback function to configure the for loop
   * @returns The builder instance for chaining
   */
  addFor(callback: (builder: ForLoopBuilder) => void): this;
  
  /**
   * Add a while loop to the block
   * 
   * @param callback A callback function to configure the while loop
   * @returns The builder instance for chaining
   */
  addWhile(callback: (builder: WhileLoopBuilder) => void): this;
  
  /**
   * Add a do-while loop to the block
   * 
   * @param callback A callback function to configure the do-while loop
   * @returns The builder instance for chaining
   */
  addDoWhile(callback: (builder: DoWhileLoopBuilder) => void): this;
  
  /**
   * Add a return statement to the block
   * 
   * @param expression Optional expression to return
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addReturn('result');
   */
  addReturn(expression?: string): this;
  
  /**
   * Generate the TypeScript code for the block
   * 
   * @returns The generated TypeScript code
   */
  generate(): string;
  
  /**
   * Generate the AST node for the block
   * 
   * @returns The block statement node
   */
  generateNode(): import('typescript').Block;
}

/**
 * Interface for a base loop builder
 */
export interface LoopBuilder extends StatementBuilder {
  /**
   * Add statements to the loop body
   * 
   * @param callback A callback function to configure the loop body
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.body((block) => {
   *   block.addStatement('console.log(i)');
   * });
   */
  body(callback: (block: BlockBuilder) => void): this;
}

/**
 * Interface for building a for loop
 */
export interface ForLoopBuilder extends LoopBuilder {
  /**
   * Set the initialization expression for the for loop
   * 
   * @param init The initialization expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // for (let i = 0; ...; ...) { ... }
   * builder.init('let i = 0');
   */
  init(init: string): this;
  
  /**
   * Set the condition expression for the for loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // for (...; i < 10; ...) { ... }
   * builder.condition('i < 10');
   */
  condition(condition: string): this;
  
  /**
   * Set the increment expression for the for loop
   * 
   * @param increment The increment expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // for (...; ...; i++) { ... }
   * builder.increment('i++');
   */
  increment(increment: string): this;
}

/**
 * Interface for building a while loop
 */
export interface WhileLoopBuilder extends LoopBuilder {
  /**
   * Set the condition expression for the while loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // while (condition) { ... }
   * builder.condition('i < 10');
   */
  condition(condition: string): this;
}

/**
 * Interface for building a do-while loop
 */
export interface DoWhileLoopBuilder extends LoopBuilder {
  /**
   * Set the condition expression for the do-while loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // do { ... } while (condition);
   * builder.condition('i < 10');
   */
  condition(condition: string): this;
}