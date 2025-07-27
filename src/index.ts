/**
 * TypeScript Generator Builder
 * 
 * A fluent API library for generating TypeScript code with organized sections,
 * comprehensive JSDoc support, and metadata tracking.
 */

// Export public types
export type {
  Generator,
  GeneratorConfig,
  Section,
  SectionOptions,
  InterfaceBuilder,
  EnumBuilder,
  PropertyOptions,
  TypeOptions,
  EnumOptions
} from './types';

// Import implementations
import { GeneratorImpl } from './generator';

/**
 * Create a new TypeScript code generator
 * 
 * @param config Configuration options for the generator
 * @returns A new Generator instance
 * 
 * @example
 * ```typescript
 * const generator = createGenerator();
 * 
 * const result = generator
 *   .section('User Types', {
 *     description: 'Core user interfaces and types',
 *     metadata: {
 *       source: 'user-schema.json',
 *       version: '1.0.0'
 *     }
 *   }, (section) => {
 *     section.addInterface('User', (iface) => {
 *       iface
 *         .property('id', 'number')
 *         .property('name', 'string')
 *         .property('email', 'string');
 *     });
 *     
 *     section.addType('PartialUser', 'Partial<User>');
 *   })
 *   .generate();
 * ```
 */
export function createGenerator(config = {}) {
  return new GeneratorImpl(config);
}