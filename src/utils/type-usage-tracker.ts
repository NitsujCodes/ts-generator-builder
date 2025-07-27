/**
 * Type Usage Tracker utility for automatically detecting which imports are used
 */
import * as ts from 'typescript';

/**
 * Tracks usage of types and identifiers in generated code
 */
export class TypeUsageTracker {
  private usedIdentifiers = new Set<string>();
  private instanceId = Math.random().toString(36).substring(2, 9);

  constructor() {
    console.log(`TypeUsageTracker instance created: ${this.instanceId}`);
  }

  /**
   * Scan an AST node for type references and identifiers
   * 
   * @param node The AST node to scan
   */
  scanNode(node: ts.Node): void {
    console.log(`TypeUsageTracker.scanNode() called with node kind: ${ts.SyntaxKind[node.kind]}`);
    const visit = (node: ts.Node) => {
      // Handle different types of nodes that might reference types
      switch (node.kind) {
        case ts.SyntaxKind.Identifier:
          const identifier = node as ts.Identifier;
          console.log(`  Found identifier: "${identifier.text}"`);
          this.usedIdentifiers.add(identifier.text);
          break;
          
        case ts.SyntaxKind.TypeReference:
          const typeRef = node as ts.TypeReferenceNode;
          if (ts.isIdentifier(typeRef.typeName)) {
            this.usedIdentifiers.add(typeRef.typeName.text);
          } else if (ts.isQualifiedName(typeRef.typeName)) {
            // Handle qualified names like Module.Type
            this.scanQualifiedName(typeRef.typeName);
          }
          break;
          
        case ts.SyntaxKind.QualifiedName:
          this.scanQualifiedName(node as ts.QualifiedName);
          break;
          
        case ts.SyntaxKind.PropertyAccessExpression:
          const propAccess = node as ts.PropertyAccessExpression;
          if (ts.isIdentifier(propAccess.expression)) {
            this.usedIdentifiers.add(propAccess.expression.text);
          }
          break;
          
        case ts.SyntaxKind.CallExpression:
          const callExpr = node as ts.CallExpression;
          if (ts.isIdentifier(callExpr.expression)) {
            this.usedIdentifiers.add(callExpr.expression.text);
          }
          break;
      }
      
      // Recursively visit child nodes
      ts.forEachChild(node, visit);
    };
    
    visit(node);
  }

  /**
   * Scan a string for type references (for string-based code)
   * 
   * @param code The code string to scan
   */
  scanString(code: string): void {
    console.log(`TypeUsageTracker.scanString() called with code: "${code}"`);
    const initialSize = this.usedIdentifiers.size;
    
    // First, extract content from string literals to scan nested code
    const stringLiteralRegex = /["'`]([^"'`]*?)["'`]/g;
    let stringMatch;
    while ((stringMatch = stringLiteralRegex.exec(code)) !== null) {
      const stringContent = stringMatch[1];
      if(! stringContent) continue

      console.log(`  Scanning string literal content: "${stringContent}"`);
      // Recursively scan the content inside string literals
      this.scanStringContent(stringContent);
    }
    
    // Use a simple regex to find potential type references
    // This is a basic implementation - could be enhanced with a proper parser
    const typeReferenceRegex = /\b([A-Z][a-zA-Z0-9_]*)\b/g;
    let match;
    
    while ((match = typeReferenceRegex.exec(code)) !== null) {
      if (! match[1]) continue

      console.log(`  Found type reference: "${match[1]}"`);
      this.usedIdentifiers.add(match[1]);
    }
    
    // Also look for common TypeScript patterns
    const patterns = [
      /:\s*([A-Za-z_][A-Za-z0-9_]*)/g, // Type annotations
      /extends\s+([A-Za-z_][A-Za-z0-9_]*)/g, // Interface extensions
      /implements\s+([A-Za-z_][A-Za-z0-9_]*)/g, // Interface implementations
      /typeof\s+([A-Za-z_][A-Za-z0-9_]*)/g, // typeof expressions
      /keyof\s+([A-Za-z_][A-Za-z0-9_]*)/g, // keyof expressions
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        if (! match[1]) continue

        console.log(`  Found pattern match: "${match[1]}"`);
        this.usedIdentifiers.add(match[1]);
      }
    });
    
    const finalSize = this.usedIdentifiers.size;
    console.log(`  scanString found ${finalSize - initialSize} new identifiers. Total: ${finalSize}`);
  }

  /**
   * Scan content inside string literals for function calls and identifiers
   * 
   * @param content The string content to scan
   */
  private scanStringContent(content: string): void {
    // Look for function calls and identifiers in the string content
    const functionCallRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match;
    
    while ((match = functionCallRegex.exec(content)) !== null) {
      if (! match[1]) continue
      console.log(`  Found function call in string: "${match[1]}"`);
      this.usedIdentifiers.add(match[1]);
    }
    
    // Also look for general identifiers (variables, types, etc.)
    const identifierRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    while ((match = identifierRegex.exec(content)) !== null) {
      // Skip common JavaScript keywords
      const keyword = match[1];
      if (! keyword) return

      if (!['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'true', 'false', 'null', 'undefined'].includes(keyword)) {
        console.log(`  Found identifier in string: "${keyword}"`);
        this.usedIdentifiers.add(keyword);
      }
    }
  }

  /**
   * Check if an identifier is used
   * 
   * @param identifier The identifier to check
   * @returns True if the identifier is used
   */
  isUsed(identifier: string): boolean {
    const result = this.usedIdentifiers.has(identifier);
    // Debug output
    console.log(`TypeUsageTracker.isUsed("${identifier}") = ${result}`);
    console.log(`All used identifiers:`, Array.from(this.usedIdentifiers));
    return result;
  }

  /**
   * Get all used identifiers
   * 
   * @returns Set of all used identifiers
   */
  getUsedIdentifiers(): Set<string> {
    return new Set(this.usedIdentifiers);
  }

  /**
   * Clear all tracked usage
   */
  clear(): void {
    this.usedIdentifiers.clear();
  }

  /**
   * Scan a qualified name (e.g., Module.Type)
   * 
   * @param qualifiedName The qualified name to scan
   */
  private scanQualifiedName(qualifiedName: ts.QualifiedName): void {
    if (ts.isIdentifier(qualifiedName.left)) {
      this.usedIdentifiers.add(qualifiedName.left.text);
    } else if (ts.isQualifiedName(qualifiedName.left)) {
      this.scanQualifiedName(qualifiedName.left);
    }
    
    this.usedIdentifiers.add(qualifiedName.right.text);
  }
}