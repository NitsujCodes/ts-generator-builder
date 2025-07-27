/**
 * Interface for a base statement builder
 */
export interface StatementBuilder {
  /**
   * Add a JSDoc comment to the statement
   * 
   * @param comment The JSDoc comment
   * @returns The builder instance for chaining
   */
  jsdoc(comment: string | string[]): StatementBuilder;
  
  /**
   * Generate the TypeScript code for the statement
   * 
   * @returns The generated TypeScript code
   */
  generate(): string;
  
  /**
   * Generate the AST node for the statement
   * 
   * @returns The statement node
   */
  generateNode(): import('typescript').Statement;
}

/**
 * Interface for building an if statement
 */
export interface IfStatementBuilder extends StatementBuilder {
  /**
   * Add a condition to the if statement
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // if (x > 0) { ... }
   * builder.condition('x > 0');
   */
  condition(condition: string): IfStatementBuilder;
  
  /**
   * Add statements to the if block
   * 
   * @param callback A callback function to configure the if block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.then((block) => {
   *   block.addStatement('console.log("Positive")');
   * });
   */
  then(callback: (block: BlockBuilder) => void): IfStatementBuilder;
  
  /**
   * Add an else-if clause to the if statement
   * 
   * @param condition The condition expression for the else-if
   * @param callback A callback function to configure the else-if block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.elseIf('x < 0', (block) => {
   *   block.addStatement('console.log("Negative")');
   * });
   */
  elseIf(condition: string, callback: (block: BlockBuilder) => void): IfStatementBuilder;
  
  /**
   * Add an else clause to the if statement
   * 
   * @param callback A callback function to configure the else block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.else((block) => {
   *   block.addStatement('console.log("Zero")');
   * });
   */
  else(callback: (block: BlockBuilder) => void): IfStatementBuilder;
}

/**
 * Interface for building a switch statement
 */
export interface SwitchStatementBuilder extends StatementBuilder {
  /**
   * Set the expression to switch on
   * 
   * @param expression The expression to switch on
   * @returns The builder instance for chaining
   * 
   * @example
   * // switch (status) { ... }
   * builder.expression('status');
   */
  expression(expression: string): SwitchStatementBuilder;
  
  /**
   * Add a case clause to the switch statement
   * 
   * @param value The case value
   * @param callback A callback function to configure the case block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.case('"pending"', (block) => {
   *   block.addStatement('console.log("Pending")');
   *   block.addStatement('break');
   * });
   */
  case(value: string, callback: (block: BlockBuilder) => void): SwitchStatementBuilder;
  
  /**
   * Add a default clause to the switch statement
   * 
   * @param callback A callback function to configure the default block
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.default((block) => {
   *   block.addStatement('console.log("Unknown status")');
   * });
   */
  default(callback: (block: BlockBuilder) => void): SwitchStatementBuilder;
}

/**
 * Interface for building a block of statements
 */
export interface BlockBuilder {
  /**
   * Add a statement to the block
   * 
   * @param statement The statement to add
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addStatement('console.log("Hello")');
   */
  addStatement(statement: string): BlockBuilder;
  
  /**
   * Add an if statement to the block
   * 
   * @param callback A callback function to configure the if statement
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addIf((ifBuilder) => {
   *   ifBuilder
   *     .condition('x > 0')
   *     .then((thenBlock) => {
   *       thenBlock.addStatement('console.log("Positive")');
   *     });
   * });
   */
  addIf(callback: (builder: IfStatementBuilder) => void): BlockBuilder;
  
  /**
   * Add a switch statement to the block
   * 
   * @param callback A callback function to configure the switch statement
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addSwitch((switchBuilder) => {
   *   switchBuilder
   *     .expression('status')
   *     .case('"pending"', (caseBlock) => {
   *       caseBlock.addStatement('console.log("Pending")');
   *       caseBlock.addStatement('break');
   *     });
   * });
   */
  addSwitch(callback: (builder: SwitchStatementBuilder) => void): BlockBuilder;
  
  /**
   * Add a for loop to the block
   * 
   * @param callback A callback function to configure the for loop
   * @returns The builder instance for chaining
   */
  addFor(callback: (builder: ForLoopBuilder) => void): BlockBuilder;
  
  /**
   * Add a while loop to the block
   * 
   * @param callback A callback function to configure the while loop
   * @returns The builder instance for chaining
   */
  addWhile(callback: (builder: WhileLoopBuilder) => void): BlockBuilder;
  
  /**
   * Add a do-while loop to the block
   * 
   * @param callback A callback function to configure the do-while loop
   * @returns The builder instance for chaining
   */
  addDoWhile(callback: (builder: DoWhileLoopBuilder) => void): BlockBuilder;
  
  /**
   * Add a return statement to the block
   * 
   * @param expression Optional expression to return
   * @returns The builder instance for chaining
   * 
   * @example
   * block.addReturn('result');
   */
  addReturn(expression?: string): BlockBuilder;
  
  /**
   * Generate the TypeScript code for the block
   * 
   * @returns The generated TypeScript code
   */
  generate(): string;
  
  /**
   * Generate the AST node for the block
   * 
   * @returns The block statement node
   */
  generateNode(): import('typescript').Block;
}

/**
 * Interface for a base loop builder
 */
export interface LoopBuilder extends StatementBuilder {
  /**
   * Add statements to the loop body
   * 
   * @param callback A callback function to configure the loop body
   * @returns The builder instance for chaining
   * 
   * @example
   * builder.body((block) => {
   *   block.addStatement('console.log(i)');
   * });
   */
  body(callback: (block: BlockBuilder) => void): LoopBuilder;
}

/**
 * Interface for building a for loop
 */
export interface ForLoopBuilder extends LoopBuilder {
  /**
   * Set the initialization expression for the for loop
   * 
   * @param init The initialization expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // for (let i = 0; ...; ...) { ... }
   * builder.init('let i = 0');
   */
  init(init: string): ForLoopBuilder;
  
  /**
   * Set the condition expression for the for loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // for (...; i < 10; ...) { ... }
   * builder.condition('i < 10');
   */
  condition(condition: string): ForLoopBuilder;
  
  /**
   * Set the increment expression for the for loop
   * 
   * @param increment The increment expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // for (...; ...; i++) { ... }
   * builder.increment('i++');
   */
  increment(increment: string): ForLoopBuilder;
}

/**
 * Interface for building a while loop
 */
export interface WhileLoopBuilder extends LoopBuilder {
  /**
   * Set the condition expression for the while loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // while (condition) { ... }
   * builder.condition('i < 10');
   */
  condition(condition: string): WhileLoopBuilder;
}

/**
 * Interface for building a do-while loop
 */
export interface DoWhileLoopBuilder extends LoopBuilder {
  /**
   * Set the condition expression for the do-while loop
   * 
   * @param condition The condition expression
   * @returns The builder instance for chaining
   * 
   * @example
   * // do { ... } while (condition);
   * builder.condition('i < 10');
   */
  condition(condition: string): DoWhileLoopBuilder;
}

// Section interface additions
export interface Section {
  /**
   * Add an if statement to the section
   * 
   * @param callback A callback function to configure the if statement
   * @returns The section instance for chaining
   * 
   * @example
   * section.addIf((ifBuilder) => {
   *   ifBuilder
   *     .condition('x > 0')
   *     .then((block) => {
   *       block.addStatement('console.log("Positive")');
   *     });
   * });
   */
  addIf(callback: (builder: IfStatementBuilder) => void): Section;
  
  /**
   * Add a switch statement to the section
   * 
   * @param callback A callback function to configure the switch statement
   * @returns The section instance for chaining
   * 
   * @example
   * section.addSwitch((switchBuilder) => {
   *   switchBuilder
   *     .expression('status')
   *     .case('"pending"', (block) => {
   *       block.addStatement('console.log("Pending")');
   *       block.addStatement('break');
   *     });
   * });
   */
  addSwitch(callback: (builder: SwitchStatementBuilder) => void): Section;
  
  /**
   * Add a for loop to the section
   * 
   * @param callback A callback function to configure the for loop
   * @returns The section instance for chaining
   * 
   * @example
   * section.addFor((forBuilder) => {
   *   forBuilder
   *     .init('let i = 0')
   *     .condition('i < 10')
   *     .increment('i++')
   *     .body((block) => {
   *       block.addStatement('console.log(i)');
   *     });
   * });
   */
  addFor(callback: (builder: ForLoopBuilder) => void): Section;
  
  /**
   * Add a while loop to the section
   * 
   * @param callback A callback function to configure the while loop
   * @returns The section instance for chaining
   * 
   * @example
   * section.addWhile((whileBuilder) => {
   *   whileBuilder
   *     .condition('condition')
   *     .body((block) => {
   *       block.addStatement('console.log("Looping")');
   *     });
   * });
   */
  addWhile(callback: (builder: WhileLoopBuilder) => void): Section;
  
  /**
   * Add a do-while loop to the section
   * 
   * @param callback A callback function to configure the do-while loop
   * @returns The section instance for chaining
   * 
   * @example
   * section.addDoWhile((doWhileBuilder) => {
   *   doWhileBuilder
   *     .body((block) => {
   *       block.addStatement('console.log("Looping")');
   *     })
   *     .condition('condition');
   * });
   */
  addDoWhile(callback: (builder: DoWhileLoopBuilder) => void): Section;
}