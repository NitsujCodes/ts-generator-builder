/**
 * Loop Builder implementation
 */
import ts from 'typescript';
import type { LoopBuilder, BlockBuilder } from '../types';
import { StatementBuilderImpl } from './statement-builder';
import { BlockBuilderImpl } from './block-builder';

/**
 * Implementation of the LoopBuilder interface
 */
export abstract class LoopBuilderImpl extends StatementBuilderImpl implements LoopBuilder {
  protected bodyBlock: BlockBuilderImpl | undefined;

  /**
   * Add statements to the loop body
   * 
   * @param callback A callback function to configure the loop body
   * @returns The builder instance for chaining
   */
  body(callback: (block: BlockBuilder) => void): this {
    const block = new BlockBuilderImpl();
    callback(block);
    this.bodyBlock = block;
    return this;
  }

  /**
   * Get the body block node
   * 
   * @returns The body block node
   */
  protected getBodyNode(): ts.Block {
    if (!this.bodyBlock) {
      throw new Error('Body is required for loop statement');
    }
    return this.bodyBlock.generateNode();
  }
}