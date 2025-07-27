/**
 * Section implementation
 */
import * as ts from 'typescript';
import type { 
  Section as SectionInterface, 
  SectionOptions, 
  InterfaceBuilder, 
  EnumBuilder,
  ObjectBuilder,
  ImportsBuilder,
  TypeBuilder,
  IfStatementBuilder,
  SwitchStatementBuilder,
  ForLoopBuilder,
  WhileLoopBuilder,
  DoWhileLoopBuilder,
  TypeOptions,
  ObjectOptions
} from './types';
import { 
  createJSDocComment,
  createTypeAlias,
  createExportModifier,
  printNodes
} from './ast-utils';
import { InterfaceBuilderImpl } from './builders/interface-builder';
import { EnumBuilderImpl } from './builders/enum-builder';
import { ObjectBuilderImpl } from './builders/object-builder';
import { ImportsBuilderImpl } from './builders/imports-builder';
import { TypeBuilderImpl } from './builders/type-builder';
import { IfStatementBuilderImpl } from './builders/if-statement-builder';
import { SwitchStatementBuilderImpl } from './builders/switch-statement-builder';
import { ForLoopBuilderImpl } from './builders/for-loop-builder';
import { WhileLoopBuilderImpl } from './builders/while-loop-builder';
import { DoWhileLoopBuilderImpl } from './builders/do-while-loop-builder';

/**
 * Represents a code item in a section
 */
interface CodeItem {
  type: 'interface' | 'type' | 'enum' | 'object' | 'import' | 'if' | 'switch' | 'for' | 'while' | 'doWhile';
  name: string;
  node: ts.Node | string;
}

/**
 * Implementation of the Section interface
 */
export class SectionImpl implements SectionInterface {
  private name: string;
  private options: SectionOptions;
  private items: CodeItem[] = [];

  /**
   * Create a new Section
   * 
   * @param name The name of the section
   * @param options Configuration options for the section
   */
  constructor(name: string, options: SectionOptions = {}) {
    this.name = name;
    this.options = options;
  }

  /**
   * Get the section options
   * 
   * @returns The section options
   */
  getOptions(): SectionOptions {
    return this.options;
  }

  /**
   * Add an interface to the section
   * 
   * @param name The name of the interface
   * @param callback A callback function to configure the interface
   * @returns The section instance for chaining
   */
  addInterface(name: string, callback: (builder: InterfaceBuilder) => void): SectionInterface {
    const builder = new InterfaceBuilderImpl(name, this.options.exportAll);
    callback(builder);
    
    // Get the AST node from the builder
    const node = ts.createSourceFile(
      'temp.ts',
      builder.generate(),
      ts.ScriptTarget.Latest,
      true
    ).statements[0];
    
    this.items.push({
      type: 'interface',
      name,
      node
    });
    
    return this;
  }

  /**
   * Add a type to the section
   * 
   * @param name The name of the type
   * @param typeOrCallback The type definition or a callback function to configure the type
   * @param options Configuration options for the type
   * @returns The section instance for chaining
   */
  addType(name: string, typeOrCallback: string | ((builder: TypeBuilder) => void), options: TypeOptions = {}): SectionInterface {
    // Check if the second parameter is a string or a callback function
    if (typeof typeOrCallback === 'string') {
      // Handle the original overload (string type)
      const type = typeOrCallback;
      
      // Create JSDoc comment if provided
      const jsDoc = options.jsdoc
        ? createJSDocComment(options.jsdoc)
        : undefined;
      
      // Create modifiers if needed
      const modifiers: ts.Modifier[] = (options.export ?? this.options.exportAll)
        ? [createExportModifier()]
        : [];
      
      // Create the type alias declaration
      const typeAliasNode = createTypeAlias(
        name,
        type,
        jsDoc,
        modifiers
      );
      
      this.items.push({
        type: 'type',
        name,
        node: typeAliasNode
      });
    } else {
      // Handle the new overload (callback function)
      const callback = typeOrCallback;
      
      // Create a new TypeBuilder with the name and export option
      const builder = new TypeBuilderImpl(name, options.export ?? this.options.exportAll);
      
      // Call the callback function with the builder
      callback(builder);
      
      // Get the AST node directly from the builder
      const node = builder.generateNode();
      
      this.items.push({
        type: 'type',
        name,
        node
      });
    }
    
    return this;
  }

  /**
   * Add an enum to the section
   * 
   * @param name The name of the enum
   * @param callback A callback function to configure the enum
   * @returns The section instance for chaining
   */
  addEnum(name: string, callback: (builder: EnumBuilder) => void): SectionInterface {
    const builder = new EnumBuilderImpl(name, this.options.exportAll);
    callback(builder);
    
    // Get the AST node directly from the builder
    const node = builder.generateNode();
    
    this.items.push({
      type: 'enum',
      name,
      node
    });
    
    return this;
  }
  
  /**
   * Add an object to the section
   * 
   * @param options Configuration options for the object
   * @param callback A callback function to configure the object
   * @returns The section instance for chaining
   */
  addObject(options: ObjectOptions, callback: (builder: ObjectBuilder) => void): SectionInterface {
    // Set export option based on section's exportAll if not explicitly provided
    const mergedOptions: ObjectOptions = {
      ...options,
      export: options.export ?? this.options.exportAll
    };
    
    const builder = new ObjectBuilderImpl(mergedOptions);
    callback(builder);
    
    // Use the provided name or generate a default one
    const name = options.name || 'anonymousObject';
    
    // Generate the code and store it directly as a string
    const generatedCode = builder.generate();
    
    this.items.push({
      type: 'object',
      name,
      node: generatedCode
    });
    
    return this;
  }
  
  /**
   * Add imports to the section
   * 
   * @param moduleSpecifier The module specifier for the import
   * @param callback A callback function to configure the imports
   * @returns The section instance for chaining
   */
  addImports(moduleSpecifier: string, callback: (builder: ImportsBuilder) => void): SectionInterface {
    // Create a new ImportsBuilder with the module specifier
    const builder = new ImportsBuilderImpl(moduleSpecifier);
    callback(builder);
    
    // Generate the code and store it directly as a string
    const generatedCode = builder.generate();
    
    // Only add the import if it's not empty (e.g., if there are imports to include)
    if (generatedCode) {
      this.items.push({
        type: 'import',
        name: moduleSpecifier, // Use the module specifier as the name
        node: generatedCode
      });
    }
    
    return this;
  }

  /**
   * Add an if statement to the section
   * 
   * @param callback A callback function to configure the if statement
   * @returns The section instance for chaining
   */
  addIf(callback: (builder: IfStatementBuilder) => void): SectionInterface {
    // Create a new IfStatementBuilder
    const builder = new IfStatementBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const node = builder.generateNode();
    
    // Add the if statement to the items
    this.items.push({
      type: 'if',
      name: 'if', // Use a generic name for if statements
      node
    });
    
    return this;
  }

  /**
   * Add a switch statement to the section
   * 
   * @param callback A callback function to configure the switch statement
   * @returns The section instance for chaining
   */
  addSwitch(callback: (builder: SwitchStatementBuilder) => void): SectionInterface {
    // Create a new SwitchStatementBuilder
    const builder = new SwitchStatementBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const node = builder.generateNode();
    
    // Add the switch statement to the items
    this.items.push({
      type: 'switch',
      name: 'switch', // Use a generic name for switch statements
      node
    });
    
    return this;
  }

  /**
   * Add a for loop to the section
   * 
   * @param callback A callback function to configure the for loop
   * @returns The section instance for chaining
   */
  addFor(callback: (builder: ForLoopBuilder) => void): SectionInterface {
    // Create a new ForLoopBuilder
    const builder = new ForLoopBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const node = builder.generateNode();
    
    // Add the for loop to the items
    this.items.push({
      type: 'for',
      name: 'for', // Use a generic name for for loops
      node
    });
    
    return this;
  }

  /**
   * Add a while loop to the section
   * 
   * @param callback A callback function to configure the while loop
   * @returns The section instance for chaining
   */
  addWhile(callback: (builder: WhileLoopBuilder) => void): SectionInterface {
    // Create a new WhileLoopBuilder
    const builder = new WhileLoopBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const node = builder.generateNode();
    
    // Add the while loop to the items
    this.items.push({
      type: 'while',
      name: 'while', // Use a generic name for while loops
      node
    });
    
    return this;
  }

  /**
   * Add a do-while loop to the section
   * 
   * @param callback A callback function to configure the do-while loop
   * @returns The section instance for chaining
   */
  addDoWhile(callback: (builder: DoWhileLoopBuilder) => void): SectionInterface {
    // Create a new DoWhileLoopBuilder
    const builder = new DoWhileLoopBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const node = builder.generateNode();
    
    // Add the do-while loop to the items
    this.items.push({
      type: 'doWhile',
      name: 'doWhile', // Use a generic name for do-while loops
      node
    });
    
    return this;
  }

  /**
   * Generate the TypeScript code for the section
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    const { description, metadata, sortItems } = this.options;
    
    // First, separate import items from other items
    const importItems = this.items.filter(item => item.type === 'import');
    const nonImportItems = this.items.filter(item => item.type !== 'import');
    
    // Sort non-import items if needed
    const sortedNonImportItems = sortItems 
      ? [...nonImportItems].sort((a, b) => a.name.localeCompare(b.name))
      : nonImportItems;
    
    // Combine items with imports first, then other items
    const itemsToGenerate = [...importItems, ...sortedNonImportItems];
    
    // Separate string nodes and AST nodes
    const stringNodes: string[] = [];
    const astNodes: ts.Node[] = [];
    
    // Process import items first to ensure they appear at the top
    const importStrings: string[] = [];
    importItems.forEach(item => {
      if (typeof item.node === 'string') {
        importStrings.push(item.node);
      }
    });
    
    // Process non-import items
    itemsToGenerate.forEach(item => {
      // Skip import items as they've already been processed
      if (item.type === 'import') {
        return;
      }
      
      if (typeof item.node === 'string') {
        stringNodes.push(item.node);
      } else {
        astNodes.push(item.node as ts.Node);
      }
    });
    
    // If we only have string nodes, handle them directly
    if (astNodes.length === 0 && (stringNodes.length > 0 || importStrings.length > 0)) {
      // Create section comment
      let result = `/**\n * ${this.name}\n`;
      if (Array.isArray(description)) {
        description.forEach(line => {
          result += ` * ${line}\n`;
        });
      } else if (description) {
        result += ` * ${description}\n`;
      }
      
      // Add metadata
      if (metadata) {
        if (description) {
          result += ` *\n`;
        }
        
        for (const [key, value] of Object.entries(metadata)) {
          if (value !== undefined) {
            result += ` * @${key} ${value}\n`;
          }
        }
      }
      
      result += ` */\n`;
      
      // Add import strings first
      if (importStrings.length > 0) {
        result += importStrings.join('\n');
        if (stringNodes.length > 0) {
          result += '\n\n';
        }
      }
      
      // Add other string nodes
      if (stringNodes.length > 0) {
        result += stringNodes.join('\n\n');
      }
      
      // Add end comment
      result += `\n// End ${this.name}`;
      
      return result;
    }
    
    // Otherwise, handle mixed nodes (AST and string) or just AST nodes
    
    // Create section comment as a leading comment
    const sectionComment = createJSDocComment(
      [this.name, ...(Array.isArray(description) ? description : description ? [description] : [])],
      metadata
    );
    
    // Create a comment node for the end of the section
    const endCommentText = `End ${this.name}`;
    const endComment = ts.factory.createNotEmittedStatement(
      ts.factory.createIdentifier(endCommentText)
    );
    ts.addSyntheticLeadingComment(
      endComment,
      ts.SyntaxKind.SingleLineCommentTrivia,
      ` ${endCommentText}`,
      true
    );
    
    // Add the end comment to AST nodes
    astNodes.push(endComment);
    
    // Generate code from AST nodes
    let astCode = '';
    if (astNodes.length > 0) {
      // Add the section comment to the first AST node if there are AST nodes
      ts.addSyntheticLeadingComment(
        astNodes[0],
        ts.SyntaxKind.MultiLineCommentTrivia,
        `* ${sectionComment.comment} `,
        true
      );
      
      astCode = printNodes(astNodes);
    }
    
    // Combine import strings, other string nodes, and AST code
    let result = '';
    
    // Add import strings first
    if (importStrings.length > 0) {
      result += importStrings.join('\n');
    }
    
    // Add other string nodes
    if (stringNodes.length > 0) {
      if (result) {
        result += '\n\n';
      }
      result += stringNodes.join('\n\n');
    }
    
    // Add AST code
    if (astCode) {
      if (result) {
        result += '\n\n';
      }
      result += astCode;
    }
    
    return result;
  }
}