/**
 * Statement Builder implementation
 */
import * as ts from "typescript";
import type { StatementBuilder } from "../types";
import { createJSDocComment, printNode } from "../utils/ast-utils";

/**
 * Implementation of the StatementBuilder interface
 */
export abstract class StatementBuilderImpl implements StatementBuilder {
  protected comments: string | string[] | undefined;

  /**
   * Add a JSDoc comment to the statement
   *
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): this {
    this.comments = comment;
    return this;
  }

  /**
   * Generate the TypeScript code for the statement
   *
   * @returns The generated TypeScript code
   */
  generate(): string {
    const node = this.generateNode();
    return printNode(node);
  }

  /**
   * Generate the AST node for the statement
   *
   * @returns The statement node
   */
  abstract generateNode(): ts.Statement;

  /**
   * Create a JSDoc comment node if comments are provided
   *
   * @returns The JSDoc comment node or undefined
   */
  protected createJSDoc(): ts.JSDoc | undefined {
    return this.comments ? createJSDocComment(this.comments) : undefined;
  }
}
