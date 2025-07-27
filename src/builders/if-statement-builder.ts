/**
 * If Statement Builder implementation
 */
import * as ts from "typescript";
import type { BlockBuilder, IfStatementBuilder } from "../types";
import { StatementBuilderImpl } from "./statement-builder";
import { BlockBuilderImpl } from "./block-builder";
import { createIfStatement } from "../utils/ast-utils";

type ElseIfClause = {
  condition: string;
  block: BlockBuilderImpl;
};

/**
 * Implementation of the IfStatementBuilder interface
 */
export class IfStatementBuilderImpl extends StatementBuilderImpl implements IfStatementBuilder {
  private conditionExpr: string | undefined;
  private thenBlock: BlockBuilderImpl | undefined;
  private elseIfClauses: Array<ElseIfClause> = [];
  private elseBlock: BlockBuilderImpl | undefined;

  /**
   * Add a condition to the if statement
   *
   * @param condition The condition expression
   * @returns The builder instance for chaining
   */
  condition(condition: string): this {
    this.conditionExpr = condition;
    return this;
  }

  /**
   * Add statements to the if block
   *
   * @param callback A callback function to configure the if block
   * @returns The builder instance for chaining
   */
  then(callback: (block: BlockBuilder) => void): this {
    const block = new BlockBuilderImpl();
    callback(block);
    this.thenBlock = block;
    return this;
  }

  /**
   * Add an else-if clause to the if statement
   *
   * @param condition The condition expression for the else-if
   * @param callback A callback function to configure the else-if block
   * @returns The builder instance for chaining
   */
  elseIf(condition: string, callback: (block: BlockBuilder) => void): this {
    const block = new BlockBuilderImpl();
    callback(block);
    this.elseIfClauses.push({ condition, block });
    return this;
  }

  /**
   * Add an else clause to the if statement
   *
   * @param callback A callback function to configure the else block
   * @returns The builder instance for chaining
   */
  else(callback: (block: BlockBuilder) => void): this {
    const block = new BlockBuilderImpl();
    callback(block);
    this.elseBlock = block;
    return this;
  }

  /**
   * Generate the AST node for the if statement
   *
   * @returns The if statement node
   */
  override generateNode(): ts.IfStatement {
    if (!this.conditionExpr) {
      throw new Error("Condition is required for if statement");
    }

    if (!this.thenBlock) {
      throw new Error("Then block is required for if statement");
    }

    // Create the then statement
    const thenStatement = this.thenBlock.generateNode();

    // Create the else statement
    let elseStatement: ts.Statement | undefined = undefined;

    // If there are else-if clauses, create a chain of if statements
    if (this.elseIfClauses.length > 0) {
      // Start with the last else-if clause
      let currentElse: ts.Statement | undefined = undefined;

      // If there's an else block, use it as the final else statement
      if (this.elseBlock) {
        currentElse = this.elseBlock.generateNode();
      }

      // Build the chain of else-if statements from the end to the beginning
      for (let i = this.elseIfClauses.length - 1; i >= 0; i--) {
        const { condition, block } = this.elseIfClauses[i] as ElseIfClause;
        currentElse = createIfStatement(condition, block.generateNode(), currentElse);
      }

      elseStatement = currentElse;
    } else if (this.elseBlock) {
      // If there are no else-if clauses but there is an else block, use it as the else statement
      elseStatement = this.elseBlock.generateNode();
    }

    // Create the if statement
    return createIfStatement(this.conditionExpr, thenStatement, elseStatement, this.createJSDoc());
  }
}
