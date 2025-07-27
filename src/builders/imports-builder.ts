/**
 * Imports Builder implementation
 */
import * as ts from "typescript";
import type { ImportOptions, ImportsBuilder } from "../types";
import { printNode } from "../utils/ast-utils";
import { TypeUsageTracker } from "../utils/type-usage-tracker";

/**
 * Named import definition
 */
interface NamedImportDefinition {
  name: string;
  alias?: string;
  used: boolean;
}

/**
 * Implementation of the ImportsBuilder interface
 */
export class ImportsBuilderImpl implements ImportsBuilder {
  private readonly moduleSpecifier: string;
  private namedImports: NamedImportDefinition[] = [];
  private defaultImport: { name: string; used: boolean } | null = null;
  private namespaceImport: { name: string; used: boolean } | null = null;
  private options: ImportOptions;

  /**
   * Create a new ImportsBuilder
   *
   * @param moduleSpecifier The module specifier for the import
   * @param options Configuration options for the import
   */
  constructor(moduleSpecifier: string, options: ImportOptions = {}) {
    this.moduleSpecifier = moduleSpecifier;
    this.options = {
      includeUnused: false,
      typeOnly: false,
      ...options,
    };
  }

  /**
   * Add a named import
   *
   * @param name The name to import
   * @param alias Optional alias for the import
   * @returns The builder instance for chaining
   */
  named(name: string, alias?: string): this {
    // Check if the import already exists
    const existingImport = this.namedImports.find(
      (imp) => imp.name === name && imp.alias === alias
    );
    if (!existingImport) {
      this.namedImports.push({
        name,
        alias,
        used: false,
      });
    }

    return this;
  }

  /**
   * Add multiple named imports
   *
   * @param names The names to import
   * @returns The builder instance for chaining
   */
  namedMultiple(names: string[]): this {
    for (const name of names) {
      this.named(name);
    }

    return this;
  }

  /**
   * Add a default import
   *
   * @param name The name for the default import
   * @returns The builder instance for chaining
   */
  default(name: string): this {
    this.defaultImport = {
      name,
      used: false,
    };

    return this;
  }

  /**
   * Add a namespace import
   *
   * @param name The name for the namespace
   * @returns The builder instance for chaining
   */
  namespace(name: string): this {
    this.namespaceImport = {
      name,
      used: false,
    };

    return this;
  }

  /**
   * Mark a named import as used
   *
   * @param name The name of the import to mark as used
   * @returns The builder instance for chaining
   */
  markUsed(name: string): this {
    // Find the import by name (ignoring alias)
    const importToMark = this.namedImports.find((imp) => imp.name === name);
    if (importToMark) {
      importToMark.used = true;
    }

    return this;
  }

  /**
   * Mark the default import as used
   *
   * @returns The builder instance for chaining
   */
  markDefaultUsed(): this {
    if (this.defaultImport) {
      this.defaultImport.used = true;
    }

    return this;
  }

  /**
   * Mark the namespace import as used
   *
   * @returns The builder instance for chaining
   */
  markNamespaceUsed(): this {
    if (this.namespaceImport) {
      this.namespaceImport.used = true;
    }

    return this;
  }

  /**
   * Automatically mark imports as used based on a usage tracker
   *
   * @param usageTracker The usage tracker containing used identifiers
   * @returns The builder instance for chaining
   */
  markUsedFromTracker(usageTracker: TypeUsageTracker): ImportsBuilder {
    console.log(`ImportsBuilder.markUsedFromTracker() called for module: ${this.moduleSpecifier}`);
    // Mark named imports as used if they appear in the usage tracker
    this.namedImports.forEach((namedImport) => {
      if (usageTracker.isUsed(namedImport.name)) {
        namedImport.used = true;
      }
    });

    // Mark the default import as used if it appears in the usage tracker
    if (this.defaultImport && usageTracker.isUsed(this.defaultImport.name)) {
      this.defaultImport.used = true;
    }

    // Mark namespace import as used if it appears in the usage tracker
    if (this.namespaceImport && usageTracker.isUsed(this.namespaceImport.name)) {
      this.namespaceImport.used = true;
    }

    return this;
  }

  /**
   * Generate the TypeScript code for the imports
   *
   * @returns The generated TypeScript code
   */
  generate(): string {
    // Filter named imports based on usage
    const filteredNamedImports = this.options.includeUnused
      ? this.namedImports
      : this.namedImports.filter((imp) => imp.used);

    // Check if the default import should be included
    const includeDefault =
      this.defaultImport && (this.options.includeUnused || this.defaultImport.used);

    // Check if namespace import should be included
    const includeNamespace =
      this.namespaceImport && (this.options.includeUnused || this.namespaceImport.used);

    // If there are no imports to include, return an empty string
    if (filteredNamedImports.length === 0 && !includeDefault && !includeNamespace) {
      return "";
    }

    // Create the import declaration using the TypeScript AST
    const importClause: ts.ImportClause | undefined = this.createImportClause(
      includeDefault ? this.defaultImport!.name : undefined,
      includeNamespace ? this.namespaceImport!.name : undefined,
      filteredNamedImports
    );

    // If there's no import clause (e.g., only side effect import), create a simple import declaration
    if (!importClause) {
      const importDeclaration = ts.factory.createImportDeclaration(
        undefined,
        undefined,
        ts.factory.createStringLiteral(this.moduleSpecifier)
      );

      return printNode(importDeclaration);
    }

    // Create the import declaration with the import clause
    const importDeclaration = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        this.options.typeOnly as boolean,
        importClause.name,
        importClause.namedBindings
      ),
      ts.factory.createStringLiteral(this.moduleSpecifier)
    );

    return printNode(importDeclaration);
  }

  /**
   * Create an import clause for the import declaration
   *
   * @param defaultImportName The name of the default import
   * @param namespaceImportName The name of the namespace import
   * @param namedImports The named imports
   * @returns The import clause
   */
  private createImportClause(
    defaultImportName?: string,
    namespaceImportName?: string,
    namedImports: NamedImportDefinition[] = []
  ): ts.ImportClause | undefined {
    // Create the default import identifier if needed
    const name = defaultImportName ? ts.factory.createIdentifier(defaultImportName) : undefined;

    // Create the named imports if needed
    let namedBindings: ts.NamedImportBindings | undefined = undefined;

    if (namespaceImportName) {
      // Create a namespace import
      namedBindings = ts.factory.createNamespaceImport(
        ts.factory.createIdentifier(namespaceImportName)
      );
    } else if (namedImports.length > 0) {
      // Create named imports
      const elements = namedImports.map((imp) => {
        return ts.factory.createImportSpecifier(
          false,
          imp.alias ? ts.factory.createIdentifier(imp.name) : undefined,
          ts.factory.createIdentifier(imp.alias || imp.name)
        );
      });

      namedBindings = ts.factory.createNamedImports(elements);
    }

    // If there's nothing to import, return undefined
    if (!name && !namedBindings) {
      return undefined;
    }

    // Create the import clause
    return ts.factory.createImportClause(this.options.typeOnly as boolean, name, namedBindings);
  }
}
