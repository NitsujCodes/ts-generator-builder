/**
 * Type Builder implementation
 */
import ts from 'typescript';
import type { TypeBuilder } from '../types';
import { 
  createJSDocComment,
  createExportModifier,
  printNode
} from '../ast-utils';

/**
 * Type parameter definition
 */
interface TypeParameterDefinition {
  name: string;
  constraint?: string;
  defaultType?: string;
}

/**
 * Implementation of the TypeBuilder interface
 */
export class TypeBuilderImpl implements TypeBuilder {
  private readonly name: string;
  private typeNode: ts.TypeNode | null = null;
  private comments: string | string[] | undefined;
  private readonly shouldExport: boolean;
  private typeParameters: TypeParameterDefinition[] = [];

  /**
   * Create a new TypeBuilder
   * 
   * @param name The name of the type
   * @param shouldExport Whether the type should be exported
   */
  constructor(name: string, shouldExport: boolean = false) {
    this.name = name;
    this.shouldExport = shouldExport;
  }

  /**
   * Set the type to a primitive type
   * 
   * @param type The primitive type (string, number, boolean, etc.)
   * @returns The builder instance for chaining
   */
  primitive(type: string): this {
    this.typeNode = this.createTypeNode(type);
    return this;
  }

  /**
   * Set the type to a reference to another type
   * 
   * @param type The type to reference
   * @returns The builder instance for chaining
   */
  reference(type: string): this {
    this.typeNode = this.createTypeNode(type);
    return this;
  }

  /**
   * Create a union type
   * 
   * @param types The types to union
   * @returns The builder instance for chaining
   */
  union(types: string[]): this {
    const typeNodes = types.map(type => this.createTypeNode(type));
    this.typeNode = ts.factory.createUnionTypeNode(typeNodes);
    return this;
  }

  /**
   * Create an intersection type
   * 
   * @param types The types to intersect
   * @returns The builder instance for chaining
   */
  intersection(types: string[]): this {
    const typeNodes = types.map(type => this.createTypeNode(type));
    this.typeNode = ts.factory.createIntersectionTypeNode(typeNodes);
    return this;
  }

  /**
   * Create an array type
   * 
   * @param elementType The type of the array elements
   * @returns The builder instance for chaining
   */
  array(elementType: string): this {
    const elementTypeNode = this.createTypeNode(elementType);
    this.typeNode = ts.factory.createArrayTypeNode(elementTypeNode);
    return this;
  }

  /**
   * Create a tuple type
   * 
   * @param elementTypes The types of the tuple elements
   * @returns The builder instance for chaining
   */
  tuple(elementTypes: string[]): this {
    const elementTypeNodes = elementTypes.map(type => this.createTypeNode(type));
    this.typeNode = ts.factory.createTupleTypeNode(elementTypeNodes);
    return this;
  }

  /**
   * Create a keyof type
   * 
   * @param type The type to get keys from
   * @returns The builder instance for chaining
   */
  keyof(type: string): this {
    const typeNode = this.createTypeNode(type);
    this.typeNode = ts.factory.createTypeOperatorNode(
      ts.SyntaxKind.KeyOfKeyword,
      typeNode
    );
    return this;
  }

  /**
   * Create a typeof type
   * 
   * @param value The value to get the type of
   * @returns The builder instance for chaining
   */
  typeof(value: string): this {
    const expression = ts.factory.createIdentifier(value);
    this.typeNode = ts.factory.createTypeQueryNode(expression);
    return this;
  }

  /**
   * Add a type parameter (generic)
   * 
   * @param name The name of the type parameter
   * @param constraint Optional constraint for the type parameter
   * @param defaultType Optional default type for the type parameter
   * @returns The builder instance for chaining
   */
  typeParameter(name: string, constraint?: string, defaultType?: string): this {
    this.typeParameters.push({
      name,
      constraint,
      defaultType
    });
    return this;
  }

  /**
   * Add multiple type parameters (generics)
   * 
   * @param params The type parameters to add
   * @returns The builder instance for chaining
   */
  addTypeParameters(params: Array<{ name: string, constraint?: string, defaultType?: string }>): this {
    this.typeParameters.push(...params);
    return this;
  }

  /**
   * Add a JSDoc comment to the type
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this {
    this.comments = comment;
    return this;
  }

  /**
   * Generate the TypeScript code for the type
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    const node = this.generateNode();
    return printNode(node);
  }

  /**
   * Generate the AST node for the type
   * 
   * @returns The type alias declaration node
   */
  generateNode(): ts.TypeAliasDeclaration {
    // If no type has been set, use a default any type
    if (!this.typeNode) {
      this.typeNode = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }

    // Create type parameters if any
    const typeParameters = this.typeParameters.length > 0
      ? this.createTypeParameterNodes()
      : undefined;

    // Create JSDoc comment if provided
    const jsDoc = this.comments
      ? createJSDocComment(this.comments)
      : undefined;

    // Create modifiers if needed
    const modifiers: ts.Modifier[] = this.shouldExport
      ? [createExportModifier()]
      : [];

    // Create the type alias declaration
    const typeAliasDeclaration = ts.factory.createTypeAliasDeclaration(
      modifiers,
      ts.factory.createIdentifier(this.name),
      typeParameters,
      this.typeNode
    );

    // Add JSDoc comment if provided
    if (jsDoc) {
      ts.addSyntheticLeadingComment(
        typeAliasDeclaration,
        ts.SyntaxKind.MultiLineCommentTrivia,
        `* ${jsDoc.comment} `,
        true
      );
    }

    return typeAliasDeclaration;
  }

  /**
   * Create type parameter nodes from the type parameters
   * 
   * @returns Array of type parameter nodes
   */
  private createTypeParameterNodes(): ts.TypeParameterDeclaration[] {
    return this.typeParameters.map(param => {
      const constraintNode = param.constraint
        ? this.createTypeNode(param.constraint)
        : undefined;

      const defaultTypeNode = param.defaultType
        ? this.createTypeNode(param.defaultType)
        : undefined;

      return ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier(param.name),
        constraintNode,
        defaultTypeNode
      );
    });
  }

  /**
   * Create a type node from a type string
   * 
   * @param type The type string
   * @returns The type node
   */
  private createTypeNode(type: string): ts.TypeNode {
    // For simple types, create a type reference node
    if (this.isSimpleType(type)) {
      return ts.factory.createTypeReferenceNode(type);
    }

    // For literal types (strings, numbers, booleans), create a literal type node
    if (this.isStringLiteral(type)) {
      return ts.factory.createLiteralTypeNode(
        ts.factory.createStringLiteral(type.slice(1, -1))
      );
    }

    if (this.isNumberLiteral(type)) {
      return ts.factory.createLiteralTypeNode(
        ts.factory.createNumericLiteral(type)
      );
    }

    if (type === 'true' || type === 'false') {
      return ts.factory.createLiteralTypeNode(
        type === 'true' ? ts.factory.createTrue() : ts.factory.createFalse()
      );
    }

    // For object types, create a type literal node
    if (this.isObjectType(type)) {
      // This is a simplified implementation that treats the object type as a reference
      // A more complete implementation would parse the object type and create a type literal node
      return ts.factory.createTypeReferenceNode(type);
    }

    // For array types, create an array type node
    if (this.isArrayType(type)) {
      const elementType = type.slice(0, -2);
      return ts.factory.createArrayTypeNode(
        this.createTypeNode(elementType)
      );
    }

    // For complex types, create a type reference node
    // This is a simplified implementation that treats complex types as references
    // A more complete implementation would parse the complex type and create the appropriate node
    return ts.factory.createTypeReferenceNode(type);
  }

  /**
   * Check if a type string is a simple type (identifier)
   * 
   * @param type The type string
   * @returns Whether the type is a simple type
   */
  private isSimpleType(type: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(type);
  }

  /**
   * Check if a type string is a string literal
   * 
   * @param type The type string
   * @returns Whether the type is a string literal
   */
  private isStringLiteral(type: string): boolean {
    return /^['"].*['"]$/.test(type);
  }

  /**
   * Check if a type string is a number literal
   * 
   * @param type The type string
   * @returns Whether the type is a number literal
   */
  private isNumberLiteral(type: string): boolean {
    return /^[0-9]+(\.[0-9]+)?$/.test(type);
  }

  /**
   * Check if a type string is an object type
   * 
   * @param type The type string
   * @returns Whether the type is an object type
   */
  private isObjectType(type: string): boolean {
    return type.startsWith('{') && type.endsWith('}');
  }

  /**
   * Check if a type string is an array type
   * 
   * @param type The type string
   * @returns Whether the type is an array type
   */
  private isArrayType(type: string): boolean {
    return type.endsWith('[]');
  }
}