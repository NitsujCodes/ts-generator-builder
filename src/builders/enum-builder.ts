/**
 * Enum Builder implementation
 */
import * as ts from 'typescript';
import type { EnumBuilder } from '../types';
import { 
  createEnum, 
  createEnumMember, 
  createJSDocComment, 
  createExportModifier,
  createConstModifier,
  printNode
} from '../utils/ast-utils';

/**
 * Enum member definition
 */
interface EnumMemberDefinition {
  key: string;
  value: string | number;
}

/**
 * Implementation of the EnumBuilder interface
 */
export class EnumBuilderImpl implements EnumBuilder {
  private readonly name: string;
  private members: EnumMemberDefinition[] = [];
  private comments: string | string[] | undefined;
  private readonly shouldExport: boolean;
  private readonly isConst: boolean;

  /**
   * Create a new EnumBuilder
   * 
   * @param name The name of the enum
   * @param shouldExport Whether the enum should be exported
   * @param isConst Whether the enum should be a const enum
   */
  constructor(name: string, shouldExport: boolean = false, isConst: boolean = false) {
    this.name = name;
    this.shouldExport = shouldExport;
    this.isConst = isConst;
  }

  /**
   * Add a member to the enum
   * 
   * @param key The key of the enum member
   * @param value The value of the enum member
   * @returns The builder instance for chaining
   */
  member(key: string, value: string | number): this {
    this.members.push({
      key,
      value
    });
    
    return this;
  }

  /**
   * Add multiple values to the enum
   * 
   * @param values The values to add to the enum
   * @returns The builder instance for chaining
   */
  values(values: string[]): this {
    for (const value of values) {
      this.member(value, value);
    }
    
    return this;
  }

  /**
   * Add a JSDoc comment to the enum
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this {
    this.comments = comment;
    return this;
  }

  /**
   * Generate the TypeScript code for the enum
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    // Create the AST node for the enum
    const node = this.generateNode();
    
    // Print the enum declaration to formatted TypeScript code
    return printNode(node);
  }
  
  /**
   * Generate the AST node for the enum
   * 
   * @returns The enum declaration node
   */
  generateNode(): ts.EnumDeclaration {
    // Create enum members
    const enumMembers: ts.EnumMember[] = this.members.map(member => 
      createEnumMember(member.key, member.value)
    );
    
    // Create JSDoc comment if provided
    const jsDoc = this.comments
      ? createJSDocComment(this.comments)
      : undefined;
    
    // Create modifiers if needed
    const modifiers: ts.Modifier[] = [];
    if (this.shouldExport) {
      modifiers.push(createExportModifier());
    }
    if (this.isConst) {
      modifiers.push(createConstModifier());
    }
    
    // Create the enum declaration
    return createEnum(
      this.name,
      enumMembers,
      jsDoc,
      modifiers
    );
  }
}