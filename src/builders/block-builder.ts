/**
 * Block Builder implementation
 */
import * as ts from 'typescript';
import type { BlockBuilder, IfStatementBuilder, SwitchStatementBuilder, ForLoopBuilder, WhileLoopBuilder, DoWhileLoopBuilder } from '../types';
import { 
  createBlock, 
  createJSDocComment, 
  createReturnStatement,
  parseStatement,
  printNode
} from '../utils/ast-utils';
import { IfStatementBuilderImpl } from './if-statement-builder';
import { SwitchStatementBuilderImpl } from './switch-statement-builder';
import { ForLoopBuilderImpl } from './for-loop-builder';
import { WhileLoopBuilderImpl } from './while-loop-builder';
import { DoWhileLoopBuilderImpl } from './do-while-loop-builder';

/**
 * Implementation of the BlockBuilder interface
 */
export class BlockBuilderImpl implements BlockBuilder {
  private statements: ts.Statement[] = [];
  private comments: string | string[] | undefined;

  /**
   * Create a new BlockBuilder
   */
  constructor() {}

  /**
   * Add a statement to the block
   * 
   * @param statement The statement to add
   * @returns The builder instance for chaining
   */
  addStatement(statement: string): this {
    // Parse the statement string into an AST node
    const statementNode = parseStatement(statement);
    this.statements.push(statementNode);
    return this;
  }

  /**
   * Add an if statement to the block
   * 
   * @param callback A callback function to configure the if statement
   * @returns The builder instance for chaining
   */
  addIf(callback: (builder: IfStatementBuilder) => void): this {
    const builder = new IfStatementBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const ifStatement = builder.generateNode();
    this.statements.push(ifStatement);
    
    return this;
  }

  /**
   * Add a switch statement to the block
   * 
   * @param callback A callback function to configure the switch statement
   * @returns The builder instance for chaining
   */
  addSwitch(callback: (builder: SwitchStatementBuilder) => void): this {
    const builder = new SwitchStatementBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const switchStatement = builder.generateNode();
    this.statements.push(switchStatement);
    
    return this;
  }

  /**
   * Add a for loop to the block
   * 
   * @param callback A callback function to configure the for loop
   * @returns The builder instance for chaining
   */
  addFor(callback: (builder: ForLoopBuilder) => void): this {
    const builder = new ForLoopBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const forStatement = builder.generateNode();
    this.statements.push(forStatement);
    
    return this;
  }

  /**
   * Add a while loop to the block
   * 
   * @param callback A callback function to configure the while loop
   * @returns The builder instance for chaining
   */
  addWhile(callback: (builder: WhileLoopBuilder) => void): this {
    const builder = new WhileLoopBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const whileStatement = builder.generateNode();
    this.statements.push(whileStatement);
    
    return this;
  }

  /**
   * Add a do-while loop to the block
   * 
   * @param callback A callback function to configure the do-while loop
   * @returns The builder instance for chaining
   */
  addDoWhile(callback: (builder: DoWhileLoopBuilder) => void): this {
    const builder = new DoWhileLoopBuilderImpl();
    callback(builder);
    
    // Get the AST node from the builder
    const doWhileStatement = builder.generateNode();
    this.statements.push(doWhileStatement);
    
    return this;
  }

  /**
   * Add a return statement to the block
   * 
   * @param expression Optional expression to return
   * @returns The builder instance for chaining
   */
  addReturn(expression?: string): this {
    const returnStatement = createReturnStatement(expression);
    this.statements.push(returnStatement);
    return this;
  }

  /**
   * Add a JSDoc comment to the block
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this {
    this.comments = comment;
    return this;
  }

  /**
   * Generate the TypeScript code for the block
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    const node = this.generateNode();
    return printNode(node);
  }

  /**
   * Generate the AST node for the block
   * 
   * @returns The block statement node
   */
  generateNode(): ts.Block {
    // Create JSDoc comment if provided
    const jsDoc = this.comments
      ? createJSDocComment(this.comments)
      : undefined;
    
    // Create the block statement
    return createBlock(this.statements, jsDoc);
  }
}