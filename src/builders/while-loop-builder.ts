/**
 * While Loop Builder implementation
 */
import * as ts from "typescript";
import type { WhileLoopBuilder } from "../types";
import { LoopBuilderImpl } from "./loop-builder";
import { createWhileStatement } from "../utils/ast-utils";

/**
 * Implementation of the WhileLoopBuilder interface
 */
export class WhileLoopBuilderImpl extends LoopBuilderImpl implements WhileLoopBuilder {
  private conditionExpr: string | undefined;

  /**
   * Set the condition expression for the while loop
   *
   * @param condition The condition expression
   * @returns The builder instance for chaining
   */
  condition(condition: string): this {
    this.conditionExpr = condition;
    return this;
  }

  /**
   * Generate the AST node for the while loop
   *
   * @returns The while statement node
   */
  override generateNode(): ts.WhileStatement {
    if (!this.conditionExpr) {
      throw new Error("Condition is required for while statement");
    }

    // Get the body block
    const bodyBlock = this.getBodyNode();

    // Create the while statement
    return createWhileStatement(this.conditionExpr, bodyBlock, this.createJSDoc());
  }
}
