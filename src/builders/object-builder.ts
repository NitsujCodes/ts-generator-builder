/**
 * Object Builder implementation
 */
import ts from 'typescript';
import type { ObjectBuilder, ObjectOptions, ObjectPropertyOptions } from '../types';
import { 
  createPropertyAssignment,
  createAsConstAssertion
} from '../ast-utils';

/**
 * Property definition for an object
 */
interface PropertyDefinition {
  name: string;
  value: any;
  options: ObjectPropertyOptions;
}

/**
 * Nested object definition
 */
interface NestedObjectDefinition {
  name: string;
  builder: ObjectBuilderImpl;
  options: ObjectPropertyOptions;
}

/**
 * Implementation of the ObjectBuilder interface
 */
export class ObjectBuilderImpl implements ObjectBuilder {
  private properties: PropertyDefinition[] = [];
  private nestedObjects: NestedObjectDefinition[] = [];
  private comments: string | string[] | undefined;
  private useAsConst: boolean;
  private options: ObjectOptions;

  /**
   * Create a new ObjectBuilder
   * 
   * @param options Configuration options for the object
   */
  constructor(options: ObjectOptions = {}) {
    this.options = options;
    this.useAsConst = options.asConst || false;
  }

  /**
   * Add a property to the object with a value
   * 
   * @param name The name of the property
   * @param value The value of the property
   * @param options Configuration options for the property
   * @returns The builder instance for chaining
   */
  property(name: string, value: any, options: ObjectPropertyOptions = {}): this {
    this.properties.push({
      name,
      value,
      options
    });
    
    return this;
  }

  /**
   * Add a nested object property
   * 
   * @param name The name of the property
   * @param callback A callback function to configure the nested object
   * @param options Configuration options for the property
   * @returns The builder instance for chaining
   */
  nestedObject(name: string, callback: (builder: ObjectBuilder) => void, options: ObjectPropertyOptions = {}): this {
    const builder = new ObjectBuilderImpl();
    callback(builder);
    
    this.nestedObjects.push({
      name,
      builder,
      options
    });
    
    return this;
  }

  /**
   * Add a JSDoc comment to the object
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this {
    this.comments = comment;
    return this;
  }

  /**
   * Make the entire object readonly using 'as const' assertion
   * 
   * @returns The builder instance for chaining
   */
  asConst(): this {
    this.useAsConst = true;
    return this;
  }

  /**
   * Generate the TypeScript code for the object
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    // Use a direct string-based approach for generating object literals
    let result = '';
    
    // Add JSDoc if provided
    if (this.comments) {
      if (Array.isArray(this.comments)) {
        result += '/**\n';
        for (const line of this.comments) {
          result += ` * ${line}\n`;
        }
        result += ' */\n';
      } else {
        result += `/** ${this.comments} */\n`;
      }
    }
    
    // Handle named objects (variable declarations)
    if (this.options.name) {
      const exportKeyword = this.options.export ? 'export ' : '';
      result += `${exportKeyword}const ${this.options.name} = `;
      
      // Generate the object literal
      result += this.generateObjectLiteral();
      
      // Add 'as const' assertion if needed
      if (this.useAsConst) {
        result += ' as const';
      }
      
      // Add semicolon for variable declarations
      result += ';';
    } 
    // Handle anonymous objects
    else {
      // For anonymous objects, we need to format them differently
      // to ensure they're valid TypeScript expressions
      const objectLiteral = this.generateObjectLiteral();
      
      if (this.useAsConst) {
        // For 'as const' assertions, wrap the object in parentheses
        result += `(${objectLiteral}) as const`;
      } else {
        result += objectLiteral;
      }
    }
    
    return result;
  }
  
  /**
   * Generate a string representation of the object literal
   * 
   * @returns A string representation of the object literal
   */
  private generateObjectLiteral(): string {
    const properties: string[] = [];
    
    // Add regular properties
    for (const prop of this.properties) {
      const readonlyPrefix = prop.options.readonly ? '/* readonly */ ' : '';
      const valueStr = this.stringifyValue(prop.value);
      properties.push(`${readonlyPrefix}${prop.name}: ${valueStr}`);
    }
    
    // Add nested objects
    for (const nestedObj of this.nestedObjects) {
      const readonlyPrefix = nestedObj.options.readonly ? '/* readonly */ ' : '';
      const nestedObjStr = (nestedObj.builder as ObjectBuilderImpl).generateObjectLiteral();
      properties.push(`${readonlyPrefix}${nestedObj.name}: ${nestedObjStr}`);
    }
    
    // Format the object literal
    if (properties.length === 0) {
      return '{}';
    }
    
    return `{\n  ${properties.join(',\n  ')}\n}`;
  }
  
  /**
   * Convert a value to its string representation
   * 
   * @param value The value to stringify
   * @returns A string representation of the value
   */
  private stringifyValue(value: any): string {
    if (value === null) {
      return 'null';
    }
    
    if (value === undefined) {
      return 'undefined';
    }
    
    switch (typeof value) {
      case 'string':
        return `"${value}"`;
      case 'number':
      case 'boolean':
        return String(value);
      case 'object':
        if (Array.isArray(value)) {
          return this.stringifyArray(value);
        }
        return this.stringifyObject(value);
      default:
        return `"${String(value)}"`;
    }
  }
  
  /**
   * Convert an array to its string representation
   * 
   * @param arr The array to stringify
   * @returns A string representation of the array
   */
  private stringifyArray(arr: any[]): string {
    if (arr.length === 0) {
      return '[]';
    }
    
    const elements = arr.map(item => this.stringifyValue(item));
    return `[${elements.join(', ')}]`;
  }
  
  /**
   * Convert an object to its string representation
   * 
   * @param obj The object to stringify
   * @returns A string representation of the object
   */
  private stringifyObject(obj: Record<string, any>): string {
    const properties: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      properties.push(`${key}: ${this.stringifyValue(value)}`);
    }
    
    if (properties.length === 0) {
      return '{}';
    }
    
    return `{\n    ${properties.join(',\n    ')}\n  }`;
  }

  /**
   * Generate the AST node for the object
   * 
   * @returns The object literal expression node
   */
  generateNode(): ts.Expression {
    // Create property assignments for regular properties
    const propertyAssignments: ts.PropertyAssignment[] = this.properties.map(prop => {
      return createPropertyAssignment(
        prop.name,
        prop.value,
        prop.options.readonly || false
      );
    });
    
    // Create property assignments for nested objects
    const nestedObjectAssignments: ts.PropertyAssignment[] = this.nestedObjects.map(nestedObj => {
      const nestedNode = nestedObj.builder.generateNode();
      
      const identifier = ts.factory.createIdentifier(nestedObj.name);
      const propertyAssignment = ts.factory.createPropertyAssignment(
        identifier,
        nestedNode
      );
      
      // Add a comment to indicate readonly for documentation purposes
      if (nestedObj.options.readonly) {
        ts.addSyntheticLeadingComment(
          propertyAssignment,
          ts.SyntaxKind.SingleLineCommentTrivia,
          " readonly",
          true
        );
      }
      
      return propertyAssignment;
    });
    
    // Combine all property assignments
    const allProperties = [...propertyAssignments, ...nestedObjectAssignments];
    
    // Create the object literal expression
    let objectLiteral = ts.factory.createObjectLiteralExpression(
      allProperties,
      true
    );
    
    // Add 'as const' assertion if needed
    if (this.useAsConst) {
      return createAsConstAssertion(objectLiteral);
    }
    
    return objectLiteral;
  }
}