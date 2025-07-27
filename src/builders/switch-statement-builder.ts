/**
 * Switch Statement Builder implementation
 */
import * as ts from 'typescript';
import type { SwitchStatementBuilder, BlockBuilder } from '../types';
import { StatementBuilderImpl } from './statement-builder';
import { BlockBuilderImpl } from './block-builder';
import { createSwitchStatement, createCaseClause, createDefaultClause } from '../ast-utils';

/**
 * Implementation of the SwitchStatementBuilder interface
 */
export class SwitchStatementBuilderImpl extends StatementBuilderImpl implements SwitchStatementBuilder {
  private expressionExpr: string | undefined;
  private caseClauses: Array<{ value: string; block: BlockBuilderImpl }> = [];
  private defaultClauseBlock: BlockBuilderImpl | undefined;

  /**
   * Set the expression to switch on
   * 
   * @param expression The expression to switch on
   * @returns The builder instance for chaining
   */
  expression(expression: string): this {
    this.expressionExpr = expression;
    return this;
  }

  /**
   * Add a case clause to the switch statement
   * 
   * @param value The case value
   * @param callback A callback function to configure the case block
   * @returns The builder instance for chaining
   */
  case(value: string, callback: (block: BlockBuilder) => void): this {
    const block = new BlockBuilderImpl();
    callback(block);
    this.caseClauses.push({ value, block });
    return this;
  }

  /**
   * Add a default clause to the switch statement
   * 
   * @param callback A callback function to configure the default block
   * @returns The builder instance for chaining
   */
  default(callback: (block: BlockBuilder) => void): this {
    const block = new BlockBuilderImpl();
    callback(block);
    this.defaultClauseBlock = block;
    return this;
  }

  /**
   * Generate the AST node for the switch statement
   * 
   * @returns The switch statement node
   */
  override generateNode(): ts.SwitchStatement {
    if (!this.expressionExpr) {
      throw new Error('Expression is required for switch statement');
    }

    // Create the case clauses
    const clauses: ts.CaseOrDefaultClause[] = this.caseClauses.map(({ value, block }) => {
      const statements = this.getStatementsFromBlock(block);
      return createCaseClause(value, statements);
    });

    // Add the default clause if provided
    if (this.defaultClauseBlock) {
      const statements = this.getStatementsFromBlock(this.defaultClauseBlock);
      clauses.push(createDefaultClause(statements));
    }

    // Create the switch statement
    return createSwitchStatement(
      this.expressionExpr,
      clauses,
      this.createJSDoc()
    );
  }

  /**
   * Get the statements from a block
   * 
   * @param block The block
   * @returns The statements
   */
  private getStatementsFromBlock(block: BlockBuilderImpl): ts.Statement[] {
    // We need to extract the statements from the block
    // This is a bit of a hack, but it works for now
    const blockNode = block.generateNode();
    return blockNode.statements;
  }
}