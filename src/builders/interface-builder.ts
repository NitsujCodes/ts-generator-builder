/**
 * Interface Builder implementation
 */
import * as ts from 'typescript';
import type { InterfaceBuilder, PropertyOptions } from '../types';
import { 
  createInterface, 
  createPropertySignature, 
  createJSDocComment, 
  createHeritageClause,
  createExportModifier,
  printNode
} from '../utils/ast-utils';

/**
 * Property definition for an interface
 */
interface PropertyDefinition {
  name: string;
  type: string;
  options: PropertyOptions;
}

/**
 * Implementation of the InterfaceBuilder interface
 */
export class InterfaceBuilderImpl implements InterfaceBuilder {
  private readonly name: string;
  private properties: PropertyDefinition[] = [];
  private comments: string | string[] | undefined;
  private extending: string[] = [];
  private readonly shouldExport: boolean;

  /**
   * Create a new InterfaceBuilder
   * 
   * @param name The name of the interface
   * @param shouldExport Whether the interface should be exported
   */
  constructor(name: string, shouldExport: boolean = false) {
    this.name = name;
    this.shouldExport = shouldExport;
  }

  /**
   * Add a property to the interface
   * 
   * @param name The name of the property
   * @param type The type of the property
   * @param options Configuration options for the property
   * @returns The builder instance for chaining
   */
  property(name: string, type: string, options: PropertyOptions = {}): this {
    this.properties.push({
      name,
      type,
      options
    });
    
    return this;
  }

  /**
   * Add a JSDoc comment to the interface
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this {
    this.comments = comment;
    return this;
  }

  /**
   * Make the interface extend another interface
   * 
   * @param interfaceName The name of the interface to extend
   * @returns The builder instance for chaining
   */
  extends(interfaceName: string | string[]): this {
    if (Array.isArray(interfaceName)) {
      this.extending.push(...interfaceName);
    } else {
      this.extending.push(interfaceName);
    }
    
    return this;
  }

  /**
   * Generate the TypeScript code for the interface
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    // Create property signatures
    const propertySignatures: ts.PropertySignature[] = this.properties.map(prop => {
      // Create JSDoc for property if provided
      const propertyJSDoc = prop.options.jsdoc 
        ? createJSDocComment(prop.options.jsdoc)
        : undefined;
      
      return createPropertySignature(
        prop.name,
        prop.type,
        prop.options.optional ?? false,
        prop.options.readonly ?? false,
        propertyJSDoc
      );
    });
    
    // Create heritage clauses if extending other interfaces
    const heritageClauses: ts.HeritageClause[] = this.extending.length > 0
      ? [createHeritageClause(ts.SyntaxKind.ExtendsKeyword, this.extending)]
      : [];
    
    // Create JSDoc comment if provided
    const jsDoc = this.comments
      ? createJSDocComment(this.comments)
      : undefined;
    
    // Create modifiers if needed
    const modifiers: ts.Modifier[] = this.shouldExport
      ? [createExportModifier()]
      : [];
    
    // Create the interface declaration
    const interfaceDeclaration = createInterface(
      this.name,
      propertySignatures,
      heritageClauses,
      jsDoc,
      modifiers
    );
    
    // Print the interface declaration to formatted TypeScript code
    return printNode(interfaceDeclaration);
  }
}