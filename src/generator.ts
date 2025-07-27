/**
 * Core Generator implementation
 */
import * as ts from 'typescript';
import type { Generator as GeneratorInterface, GeneratorConfig, Section, SectionOptions } from './types';
import { formatTimestamp } from './utils/utils';
import { createJSDocComment } from './utils/ast-utils';
import { SectionImpl } from './section';

/**
 * Implementation of the Generator interface
 */
export class GeneratorImpl implements GeneratorInterface {
  private sections: SectionImpl[] = [];
  private config: GeneratorConfig;

  /**
   * Create a new Generator
   * 
   * @param config Configuration options for the generator
   */
  constructor(config: GeneratorConfig = {}) {
    this.config = {
      sectionDefaults: {
        jsdocStyle: 'multi',
        addEndComment: true,
        exportAll: false,
        spacing: 'normal',
        sortItems: false,
        ...config.sectionDefaults
      },
      globalMetadata: {
        generator: 'ts-generator-builder',
        generatedAt: formatTimestamp(),
        ...config.globalMetadata
      }
    };
  }

  /**
   * Add a section to the generator
   * 
   * @param name The name of the section
   * @param optionsOrCallback Section options or callback function
   * @param callback Optional callback function if options are provided
   * @returns The generator instance for chaining
   */
  section(
    name: string,
    optionsOrCallback: SectionOptions | ((section: Section) => void),
    callback?: (section: Section) => void
  ): GeneratorInterface {
    let options: SectionOptions = {};
    let sectionCallback: (section: Section) => void;

    if (typeof optionsOrCallback === 'function') {
      sectionCallback = optionsOrCallback;
    } else {
      options = optionsOrCallback;
      sectionCallback = callback || (() => {});
    }

    // Merge default options with provided options
    const mergedOptions: SectionOptions = {
      ...this.config.sectionDefaults,
      ...options
    };

    const section = new SectionImpl(name, mergedOptions);
    sectionCallback(section);
    this.sections.push(section);

    return this;
  }

  /**
   * Generate the TypeScript code
   * 
   * @returns The generated TypeScript code
   */
  generate(): string {
    // Sort sections by order if specified
    const sortedSections = [...this.sections].sort((a, b) => {
      const orderA = a.getOptions().order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.getOptions().order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    // Generate code for each section
    const sectionCodes = sortedSections.map(section => section.generate());

    // Combine all section codes into a single string
    const combinedCode = sectionCodes.join('\n\n');

    // Parse the combined code into a source file
    const sourceFile = ts.createSourceFile(
      'generated.ts',
      combinedCode,
      ts.ScriptTarget.Latest,
      true
    );

    // Add a header comment with global metadata if provided
    if (this.config.globalMetadata && Object.keys(this.config.globalMetadata).length > 0) {
      const headerComment = createJSDocComment(
        'Generated TypeScript code',
        this.config.globalMetadata
      );

      // Add the header comment to the source file
      if (sourceFile.statements.length > 0) {
        ts.addSyntheticLeadingComment(
          sourceFile.statements[0] as ts.Statement,
          ts.SyntaxKind.MultiLineCommentTrivia,
          `* ${headerComment.comment} `,
          true
        );
      }
    }

    // Print the source file with proper formatting
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
      omitTrailingSemicolon: false
    });

    return printer.printFile(sourceFile);
  }
}