/**
 * Do-While Loop Builder implementation
 */
import * as ts from 'typescript';
import type { DoWhileLoopBuilder } from '../types';
import { LoopBuilderImpl } from './loop-builder';
import { createDoWhileStatement } from '../ast-utils';

/**
 * Implementation of the DoWhileLoopBuilder interface
 */
export class DoWhileLoopBuilderImpl extends LoopBuilderImpl implements DoWhileLoopBuilder {
  private conditionExpr: string | undefined;

  /**
   * Set the condition expression for the do-while loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   */
  condition(condition: string): this {
    this.conditionExpr = condition;
    return this;
  }

  /**
   * Generate the AST node for the do-while loop
   * 
   * @returns The do-while statement node
   */
  override generateNode(): ts.DoStatement {
    if (!this.conditionExpr) {
      throw new Error('Condition is required for do-while statement');
    }

    // Get the body block
    const bodyBlock = this.getBodyNode();

    // Create the do-while statement
    return createDoWhileStatement(
      bodyBlock,
      this.conditionExpr,
      this.createJSDoc()
    );
  }
}