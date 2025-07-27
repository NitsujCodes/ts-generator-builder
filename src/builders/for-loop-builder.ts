/**
 * For Loop Builder implementation
 */
import * as ts from 'typescript';
import type { ForLoopBuilder } from '../types';
import { LoopBuilderImpl } from './loop-builder';
import { createForStatement } from '../ast-utils';

/**
 * Implementation of the ForLoopBuilder interface
 */
export class ForLoopBuilderImpl extends LoopBuilderImpl implements ForLoopBuilder {
  private initExpr: string | undefined;
  private conditionExpr: string | undefined;
  private incrementExpr: string | undefined;

  /**
   * Set the initialization expression for the for loop
   * 
   * @param init The initialization expression
   * @returns The builder instance for chaining
   */
  init(init: string): this {
    this.initExpr = init;
    return this;
  }

  /**
   * Set the condition expression for the for loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   */
  condition(condition: string): this {
    this.conditionExpr = condition;
    return this;
  }

  /**
   * Set the increment expression for the for loop
   * 
   * @param increment The increment expression
   * @returns The builder instance for chaining
   */
  increment(increment: string): this {
    this.incrementExpr = increment;
    return this;
  }

  /**
   * Generate the AST node for the for loop
   * 
   * @returns The for statement node
   */
  override generateNode(): ts.ForStatement {
    // Get the body block
    const bodyBlock = this.getBodyNode();

    // Create the for statement
    return createForStatement(
      this.initExpr,
      this.conditionExpr,
      this.incrementExpr,
      bodyBlock,
      this.createJSDoc()
    );
  }
}