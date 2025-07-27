/**
 * TypeScript AST utilities for code generation
 * 
 * This module provides functions to create AST nodes using the TypeScript Compiler API
 */
import * as ts from 'typescript';

/**
 * Create a JSDoc comment for a node
 * 
 * @param text The comment text or array of comment lines
 * @param metadata Optional metadata to include in the JSDoc
 * @returns JSDoc comment node
 */
export function createJSDocComment(
  text: string | string[] | undefined,
  metadata?: Record<string, any>
): ts.JSDoc {
  if (!text && !metadata) {
    return createEmptyJSDocComment();
  }

  const commentLines: string[] = Array.isArray(text) ? text : text ? [text] : [];
  const metadataLines: string[] = [];

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined) {
        metadataLines.push(`@${key} ${value}`);
      }
    }
  }

  const allLines = [...commentLines];
  
  // Add a blank line before metadata if both comment and metadata exist
  if (commentLines.length > 0 && metadataLines.length > 0) {
    allLines.push('');
  }
  
  allLines.push(...metadataLines);

  // Create JSDoc tags for metadata
  const tags: ts.JSDocTag[] = metadataLines.map(line => {
    const [tagName, ...tagText] = line.substring(1).split(' ');
    return ts.factory.createJSDocUnknownTag(
      ts.factory.createIdentifier(tagName),
      tagText.join(' ')
    );
  });

  // Create the JSDoc comment
  return ts.factory.createJSDocComment(
    commentLines.join('\n'),
    tags
  );
}

/**
 * Create an empty JSDoc comment
 * 
 * @returns Empty JSDoc comment node
 */
export function createEmptyJSDocComment(): ts.JSDoc {
  return ts.factory.createJSDocComment('', []);
}

/**
 * Create an interface declaration
 * 
 * @param name The name of the interface
 * @param members The members of the interface
 * @param heritageClauses Optional heritage clauses (extends)
 * @param jsDoc Optional JSDoc comment
 * @param modifiers Optional modifiers (export, etc.)
 * @returns Interface declaration node
 */
export function createInterface(
  name: string,
  members: ts.TypeElement[],
  heritageClauses?: ts.HeritageClause[],
  jsDoc?: ts.JSDoc,
  modifiers?: ts.Modifier[]
): ts.InterfaceDeclaration {
  const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
    modifiers,
    ts.factory.createIdentifier(name),
    undefined, // type parameters
    heritageClauses,
    members
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      interfaceDeclaration,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return interfaceDeclaration;
}

/**
 * Create a property signature for an interface
 * 
 * @param name The name of the property
 * @param type The type of the property
 * @param optional Whether the property is optional
 * @param readonly Whether the property is readonly
 * @param jsDoc Optional JSDoc comment
 * @returns Property signature node
 */
export function createPropertySignature(
  name: string,
  type: string,
  optional: boolean = false,
  readonly: boolean = false,
  jsDoc?: ts.JSDoc
): ts.PropertySignature {
  const modifiers: ts.Modifier[] = [];
  if (readonly) {
    modifiers.push(ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword));
  }

  const propertySignature = ts.factory.createPropertySignature(
    modifiers,
    ts.factory.createIdentifier(name),
    optional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    ts.factory.createTypeReferenceNode(type)
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      propertySignature,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return propertySignature;
}

/**
 * Create a type alias declaration
 * 
 * @param name The name of the type
 * @param type The type definition
 * @param jsDoc Optional JSDoc comment
 * @param modifiers Optional modifiers (export, etc.)
 * @returns Type alias declaration node
 */
export function createTypeAlias(
  name: string,
  type: string,
  jsDoc?: ts.JSDoc,
  modifiers?: ts.Modifier[]
): ts.TypeAliasDeclaration {
  const typeAliasDeclaration = ts.factory.createTypeAliasDeclaration(
    modifiers,
    ts.factory.createIdentifier(name),
    undefined, // type parameters
    ts.factory.createTypeReferenceNode(type)
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      typeAliasDeclaration,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return typeAliasDeclaration;
}

/**
 * Create an enum declaration
 * 
 * @param name The name of the enum
 * @param members The members of the enum
 * @param jsDoc Optional JSDoc comment
 * @param modifiers Optional modifiers (export, const, etc.)
 * @returns Enum declaration node
 */
export function createEnum(
  name: string,
  members: ts.EnumMember[],
  jsDoc?: ts.JSDoc,
  modifiers?: ts.Modifier[]
): ts.EnumDeclaration {
  const enumDeclaration = ts.factory.createEnumDeclaration(
    modifiers,
    ts.factory.createIdentifier(name),
    members
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      enumDeclaration,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return enumDeclaration;
}

/**
 * Create an enum member
 * 
 * @param name The name of the enum member
 * @param value The value of the enum member (string or number)
 * @returns Enum member node
 */
export function createEnumMember(
  name: string,
  value: string | number
): ts.EnumMember {
  const initializer = typeof value === 'string'
    ? ts.factory.createStringLiteral(value)
    : ts.factory.createNumericLiteral(value);

  return ts.factory.createEnumMember(
    ts.factory.createIdentifier(name),
    initializer
  );
}

/**
 * Create a heritage clause (extends or implements)
 * 
 * @param token The token kind (extends or implements)
 * @param types The types to extend or implement
 * @returns Heritage clause node
 */
export function createHeritageClause(
  token: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword,
  types: string[]
): ts.HeritageClause {
  return ts.factory.createHeritageClause(
    token,
    types.map(type => ts.factory.createExpressionWithTypeArguments(
      ts.factory.createIdentifier(type),
      undefined
    ))
  );
}

/**
 * Create an export modifier
 * 
 * @returns Export modifier
 */
export function createExportModifier(): ts.Modifier {
  return ts.factory.createModifier(ts.SyntaxKind.ExportKeyword);
}

/**
 * Create a const modifier
 * 
 * @returns Const modifier
 */
export function createConstModifier(): ts.Modifier {
  return ts.factory.createModifier(ts.SyntaxKind.ConstKeyword);
}

/**
 * Print a TypeScript node to string
 * 
 * @param node The node to print
 * @param options Printer options
 * @returns Formatted TypeScript code
 */
export function printNode(
  node: ts.Node,
  options: ts.PrinterOptions = {
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false
  }
): string {
  const printer = ts.createPrinter(options);
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

/**
 * Print multiple TypeScript nodes to string
 * 
 * @param nodes The nodes to print
 * @param options Printer options
 * @returns Formatted TypeScript code
 */
export function printNodes(
  nodes: ts.Node[],
  options: ts.PrinterOptions = {
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false
  }
): string {
  return nodes.map(node => printNode(node, options)).join('\n\n');
}

/**
 * Create a source file from nodes
 * 
 * @param nodes The nodes to include in the source file
 * @param fileName The name of the source file
 * @returns Source file node
 */
export function createSourceFile(
  nodes: ts.Statement[],
  fileName: string = 'generated.ts'
): ts.SourceFile {
  return ts.factory.createSourceFile(
    nodes,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
}

/**
 * Print a source file to string
 * 
 * @param sourceFile The source file to print
 * @param options Printer options
 * @returns Formatted TypeScript code
 */
export function printSourceFile(
  sourceFile: ts.SourceFile,
  options: ts.PrinterOptions = {
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
    omitTrailingSemicolon: false
  }
): string {
  const printer = ts.createPrinter(options);
  return printer.printFile(sourceFile);
}

/**
 * Create a literal expression from a JavaScript value
 * 
 * @param value The value to convert to a literal expression
 * @returns A literal expression node
 */
export function createLiteral(value: any): ts.Expression {
  if (value === null) {
    return ts.factory.createNull();
  }
  
  if (value === undefined) {
    return ts.factory.createIdentifier('undefined');
  }
  
  switch (typeof value) {
    case 'string':
      return ts.factory.createStringLiteral(value);
    case 'number':
      return ts.factory.createNumericLiteral(value);
    case 'boolean':
      return value ? ts.factory.createTrue() : ts.factory.createFalse();
    case 'object':
      if (Array.isArray(value)) {
        return createArrayLiteralExpression(value);
      }
      return createObjectLiteralExpression(value);
    default:
      // For complex cases, convert to string
      return ts.factory.createStringLiteral(String(value));
  }
}

/**
 * Create an array literal expression
 * 
 * @param elements The array elements
 * @returns An array literal expression node
 */
export function createArrayLiteralExpression(elements: any[]): ts.ArrayLiteralExpression {
  return ts.factory.createArrayLiteralExpression(
    elements.map(element => createLiteral(element)),
    false
  );
}

/**
 * Create an object literal expression from a JavaScript object
 * 
 * @param obj The object to convert to an object literal expression
 * @returns An object literal expression node
 */
export function createObjectLiteralExpression(obj: Record<string, any>): ts.ObjectLiteralExpression {
  const properties: ts.ObjectLiteralElementLike[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    properties.push(createPropertyAssignment(key, value));
  }
  
  return ts.factory.createObjectLiteralExpression(properties, true);
}

/**
 * Create a property assignment for an object literal
 * 
 * @param name The property name
 * @param value The property value
 * @param readonly Whether the property is readonly (will be handled at the object level with 'as const')
 * @returns A property assignment node
 */
export function createPropertyAssignment(
  name: string,
  value: any,
  readonly: boolean = false
): ts.PropertyAssignment {
  const identifier = ts.factory.createIdentifier(name);
  const initializer = typeof value === 'object' && value !== null
    ? createLiteral(value)
    : createLiteral(value);
    
  const propertyAssignment = ts.factory.createPropertyAssignment(
    identifier,
    initializer
  );
  
  // Note: TypeScript doesn't support readonly modifiers on object literal properties directly.
  // Readonly properties in object literals are typically achieved using 'as const' assertion
  // on the entire object, which we handle separately in createAsConstAssertion.
  
  // If we need to add a comment to indicate it's readonly for documentation purposes:
  if (readonly) {
    ts.addSyntheticLeadingComment(
      propertyAssignment,
      ts.SyntaxKind.SingleLineCommentTrivia,
      " readonly",
      true
    );
  }
  
  return propertyAssignment;
}

/**
 * Create a readonly modifier
 * 
 * @returns A readonly modifier
 */
export function createReadonlyModifier(): ts.Modifier {
  return ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword);
}

/**
 * Create an 'as const' assertion
 * 
 * @param expression The expression to assert as const
 * @returns An as expression with const assertion
 */
export function createAsConstAssertion(expression: ts.Expression): ts.AsExpression {
  return ts.factory.createAsExpression(
    expression,
    ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier('const'),
      undefined
    )
  );
}

/**
 * Create a variable declaration
 * 
 * @param name The variable name
 * @param initializer The initializer expression
 * @param type Optional type annotation
 * @param modifiers Optional modifiers (export, const, etc.)
 * @param jsDoc Optional JSDoc comment
 * @returns A variable statement node
 */
export function createVariableDeclaration(
  name: string,
  initializer: ts.Expression,
  type?: string,
  modifiers?: ts.Modifier[],
  jsDoc?: ts.JSDoc
): ts.VariableStatement {
  const variableDeclaration = ts.factory.createVariableDeclaration(
    ts.factory.createIdentifier(name),
    undefined,
    type ? ts.factory.createTypeReferenceNode(type, undefined) : undefined,
    initializer
  );
  
  const variableDeclarationList = ts.factory.createVariableDeclarationList(
    [variableDeclaration],
    ts.NodeFlags.Const
  );
  
  const variableStatement = ts.factory.createVariableStatement(
    modifiers,
    variableDeclarationList
  );
  
  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      variableStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }
  
  return variableStatement;
}

/**
 * Create a block statement
 * 
 * @param statements The statements in the block
 * @param jsDoc Optional JSDoc comment
 * @returns Block statement node
 */
export function createBlock(
  statements: ts.Statement[],
  jsDoc?: ts.JSDoc
): ts.Block {
  const block = ts.factory.createBlock(
    statements,
    true // multiLine
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      block,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return block;
}

/**
 * Create an if statement
 * 
 * @param condition The condition expression
 * @param thenStatement The then statement
 * @param elseStatement Optional else statement
 * @param jsDoc Optional JSDoc comment
 * @returns If statement node
 */
export function createIfStatement(
  condition: string | ts.Expression,
  thenStatement: ts.Statement,
  elseStatement?: ts.Statement,
  jsDoc?: ts.JSDoc
): ts.IfStatement {
  // Convert condition string to expression if needed
  const conditionExpr = typeof condition === 'string'
    ? parseExpression(condition)
    : condition;

  const ifStatement = ts.factory.createIfStatement(
    conditionExpr,
    thenStatement,
    elseStatement
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      ifStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return ifStatement;
}

/**
 * Create a switch statement
 * 
 * @param expression The expression to switch on
 * @param clauses The case and default clauses
 * @param jsDoc Optional JSDoc comment
 * @returns Switch statement node
 */
export function createSwitchStatement(
  expression: string | ts.Expression,
  clauses: ts.CaseOrDefaultClause[],
  jsDoc?: ts.JSDoc
): ts.SwitchStatement {
  // Convert expression string to expression if needed
  const expressionExpr = typeof expression === 'string'
    ? parseExpression(expression)
    : expression;

  const switchStatement = ts.factory.createSwitchStatement(
    expressionExpr,
    ts.factory.createCaseBlock(clauses)
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      switchStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return switchStatement;
}

/**
 * Create a case clause for a switch statement
 * 
 * @param expression The case expression
 * @param statements The statements in the case clause
 * @returns Case clause node
 */
export function createCaseClause(
  expression: string | ts.Expression,
  statements: ts.Statement[]
): ts.CaseClause {
  // Convert expression string to expression if needed
  const expressionExpr = typeof expression === 'string'
    ? parseExpression(expression)
    : expression;

  return ts.factory.createCaseClause(
    expressionExpr,
    statements
  );
}

/**
 * Create a default clause for a switch statement
 * 
 * @param statements The statements in the default clause
 * @returns Default clause node
 */
export function createDefaultClause(
  statements: ts.Statement[]
): ts.DefaultClause {
  return ts.factory.createDefaultClause(statements);
}

/**
 * Create a for loop statement
 * 
 * @param initializer The initializer expression or variable declaration
 * @param condition The condition expression
 * @param incrementor The incrementor expression
 * @param statement The loop body statement
 * @param jsDoc Optional JSDoc comment
 * @returns For statement node
 */
export function createForStatement(
  initializer: string | ts.Expression | ts.VariableDeclarationList | undefined,
  condition: string | ts.Expression | undefined,
  incrementor: string | ts.Expression | undefined,
  statement: ts.Statement,
  jsDoc?: ts.JSDoc
): ts.ForStatement {
  // Convert initializer string to expression if needed
  let initializerExpr: ts.Expression | ts.VariableDeclarationList | undefined = undefined;
  if (typeof initializer === 'string') {
    initializerExpr = parseExpression(initializer);
  } else {
    initializerExpr = initializer;
  }

  // Convert condition string to expression if needed
  let conditionExpr: ts.Expression | undefined = undefined;
  if (typeof condition === 'string') {
    conditionExpr = parseExpression(condition);
  } else {
    conditionExpr = condition;
  }

  // Convert incrementor string to expression if needed
  let incrementorExpr: ts.Expression | undefined = undefined;
  if (typeof incrementor === 'string') {
    incrementorExpr = parseExpression(incrementor);
  } else {
    incrementorExpr = incrementor;
  }

  const forStatement = ts.factory.createForStatement(
    initializerExpr,
    conditionExpr,
    incrementorExpr,
    statement
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      forStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return forStatement;
}

/**
 * Create a while loop statement
 * 
 * @param condition The condition expression
 * @param statement The loop body statement
 * @param jsDoc Optional JSDoc comment
 * @returns While statement node
 */
export function createWhileStatement(
  condition: string | ts.Expression,
  statement: ts.Statement,
  jsDoc?: ts.JSDoc
): ts.WhileStatement {
  // Convert condition string to expression if needed
  const conditionExpr = typeof condition === 'string'
    ? parseExpression(condition)
    : condition;

  const whileStatement = ts.factory.createWhileStatement(
    conditionExpr,
    statement
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      whileStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return whileStatement;
}

/**
 * Create a do-while loop statement
 * 
 * @param statement The loop body statement
 * @param condition The condition expression
 * @param jsDoc Optional JSDoc comment
 * @returns Do-while statement node
 */
export function createDoWhileStatement(
  statement: ts.Statement,
  condition: string | ts.Expression,
  jsDoc?: ts.JSDoc
): ts.DoStatement {
  // Convert condition string to expression if needed
  const conditionExpr = typeof condition === 'string'
    ? parseExpression(condition)
    : condition;

  const doWhileStatement = ts.factory.createDoStatement(
    statement,
    conditionExpr
  );

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      doWhileStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return doWhileStatement;
}

/**
 * Create a return statement
 * 
 * @param expression Optional expression to return
 * @param jsDoc Optional JSDoc comment
 * @returns Return statement node
 */
export function createReturnStatement(
  expression?: string | ts.Expression,
  jsDoc?: ts.JSDoc
): ts.ReturnStatement {
  // Convert expression string to expression if needed
  let expressionExpr: ts.Expression | undefined = undefined;
  if (typeof expression === 'string') {
    expressionExpr = parseExpression(expression);
  } else {
    expressionExpr = expression;
  }

  const returnStatement = ts.factory.createReturnStatement(expressionExpr);

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      returnStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return returnStatement;
}

/**
 * Create an expression statement
 * 
 * @param expression The expression
 * @param jsDoc Optional JSDoc comment
 * @returns Expression statement node
 */
export function createExpressionStatement(
  expression: string | ts.Expression,
  jsDoc?: ts.JSDoc
): ts.ExpressionStatement {
  // Convert expression string to expression if needed
  const expressionExpr = typeof expression === 'string'
    ? parseExpression(expression)
    : expression;

  const expressionStatement = ts.factory.createExpressionStatement(expressionExpr);

  if (jsDoc) {
    ts.addSyntheticLeadingComment(
      expressionStatement,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${jsDoc.comment} `,
      true
    );
  }

  return expressionStatement;
}

/**
 * Parse a string expression into an AST node
 * 
 * @param expression The expression string
 * @returns Expression node
 */
export function parseExpression(expression: string): ts.Expression {
  // This is a simplified implementation that just creates an identifier
  // In a real implementation, we would use the TypeScript parser to parse the expression
  return ts.factory.createIdentifier(expression);
}

/**
 * Parse a string statement into an AST node
 * 
 * @param statement The statement string
 * @returns Statement node
 */
export function parseStatement(statement: string): ts.Statement {
  // This is a simplified implementation that just creates an expression statement with an identifier
  // In a real implementation, we would use the TypeScript parser to parse the statement
  return ts.factory.createExpressionStatement(ts.factory.createIdentifier(statement));
}