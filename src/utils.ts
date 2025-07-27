/**
 * Utility functions for the TypeScript Generator Builder
 */
import { pascalCase } from 'change-case';

/**
 * Format a JSDoc comment in single-line or multi-line style
 * 
 * @param comment The comment text or array of comment lines
 * @param style The style of JSDoc comment ('single' or 'multi')
 * @param metadata Optional metadata to include in the JSDoc
 * @returns Formatted JSDoc comment string
 */
export function formatJSDoc(
  comment: string | string[] | undefined,
  style: 'single' | 'multi' = 'multi',
  metadata?: Record<string, any>
): string {
  if (!comment && !metadata) {
    return '';
  }

  const commentLines: string[] = Array.isArray(comment) ? comment : comment ? [comment] : [];
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

  if (style === 'single') {
    return allLines.map(line => `/** ${line} */`).join('\n');
  } else {
    if (allLines.length === 0) {
      return '/**\n */';
    }
    
    return [
      '/**',
      ...allLines.map(line => ` * ${line}`),
      ' */'
    ].join('\n');
  }
}

/**
 * Format a section comment
 * 
 * @param name The name of the section
 * @param description Optional description of the section
 * @param metadata Optional metadata for the section
 * @param style The style of JSDoc comment ('single' or 'multi')
 * @returns Formatted section comment
 */
export function formatSectionComment(
  name: string,
  description?: string | string[],
  metadata?: Record<string, any>,
  style: 'single' | 'multi' = 'multi'
): string {
  const commentLines: string[] = [name];
  
  if (description) {
    if (Array.isArray(description)) {
      commentLines.push(...description);
    } else {
      commentLines.push(description);
    }
  }
  
  return formatJSDoc(commentLines, style, metadata);
}

/**
 * Format a section end comment
 * 
 * @param name The name of the section
 * @returns Formatted section end comment
 */
export function formatSectionEndComment(name: string): string {
  return formatJSDoc(`End ${name}`, 'multi');
}

/**
 * Format a simple comment (non-JSDoc)
 * 
 * @param text The comment text
 * @returns Formatted comment
 */
export function formatComment(text: string): string {
  return `// ${text}`;
}

/**
 * Format an interface property
 * 
 * @param name The property name
 * @param type The property type
 * @param optional Whether the property is optional
 * @param readonly Whether the property is readonly
 * @returns Formatted property string
 */
export function formatProperty(
  name: string,
  type: string,
  optional: boolean = false,
  readonly: boolean = false
): string {
  const readonlyPrefix = readonly ? 'readonly ' : '';
  const optionalSuffix = optional ? '?' : '';
  
  return `${readonlyPrefix}${name}${optionalSuffix}: ${type};`;
}

/**
 * Format an enum member
 * 
 * @param key The enum key
 * @param value The enum value
 * @returns Formatted enum member string
 */
export function formatEnumMember(key: string, value: string | number): string {
  // Format string values with quotes, number values without
  const formattedValue = typeof value === 'string' ? `'${value}'` : value;
  
  // Convert key to PascalCase using change-case
  const pascalCaseKey = pascalCase(key);
  
  return `${pascalCaseKey} = ${formattedValue},`;
}

/**
 * Apply indentation to a string or array of strings
 * 
 * @param content The content to indent
 * @param level The indentation level (number of spaces = level * 2)
 * @returns Indented string
 */
export function indent(content: string | string[], level: number = 1): string {
  const spaces = ' '.repeat(level * 2);
  
  if (Array.isArray(content)) {
    return content.map(line => `${spaces}${line}`).join('\n');
  }
  
  return `${spaces}${content}`;
}

/**
 * Apply spacing based on the spacing style
 * 
 * @param style The spacing style
 * @returns Newlines to insert
 */
export function getSpacing(style: 'compact' | 'normal' | 'loose' = 'normal'): string {
  switch (style) {
    case 'compact':
      return '';
    case 'loose':
      return '\n\n';
    case 'normal':
    default:
      return '\n';
  }
}

/**
 * Format a timestamp for use in generated code
 * 
 * @param date The date to format, or current date if not provided
 * @returns Formatted date string
 */
export function formatTimestamp(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}