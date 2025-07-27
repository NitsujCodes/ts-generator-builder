/**
 * Test file for automatic import usage detection
 *
 * This test demonstrates that imports are automatically included
 * when types are referenced in the generated code, without needing
 * to manually call markUsed().
 */
import { createGenerator } from "./src";

// Create a generator
const generator = createGenerator({
  globalMetadata: {
    generator: "ts-generator-builder",
    generatedAt: new Date(),

    project: "automatic-imports-test",
  },
});

// Test automatic import detection
const result = generator
  .section(
    "Imports",
    {
      description: "Imports that should be automatically detected",
    },
    (section) => {
      // Add imports WITHOUT manually marking them as used
      section.addImports("react", (builder) => {
        builder.named("useState").named("useEffect").named("useContext").named("useMemo");
        // Note: NO markUsed() calls here!
      });

      section.addImports("./types", (builder) => {
        builder.named("User").named("UserRole").named("ApiResponse").named("UnusedType");
        // Note: NO markUsed() calls here!
      });

      section.addImports("unused-library", (builder) => {
        builder.named("UnusedFunction").named("AnotherUnusedType");
        // Note: NO markUsed() calls here!
      });
    }
  )
  .section(
    "User Interface",
    {
      description: "Interface that uses some of the imported types",
    },
    (section) => {
      // This interface references User and UserRole
      // These should be automatically detected and imported
      section.addInterface("UserProfile", (iface) => {
        iface
          .jsdoc("User profile with role information")
          .property("user", "User") // References User type
          .property("role", "UserRole") // References UserRole type
          .property("isActive", "boolean");
      });
    }
  )
  .section(
    "React Component",
    {
      description: "Component that uses React hooks",
    },
    (section) => {
      // Add a string-based code that references useState and useEffect
      // These should be automatically detected and imported
      section.addObject(
        {
          name: "MyComponent",
        },
        (objBuilder) => {
          objBuilder
            .jsdoc("React component using hooks")
            .property(
              "setup",
              "function() { const [state, setState] = useState(0); useEffect(() => {}); }"
            );
        }
      );
    }
  )
  .generate();

console.log("=== AUTOMATIC IMPORT DETECTION TEST ===");
console.log(result);
console.log("\n=== EXPECTED BEHAVIOR ===");
console.log('- Should import { useState, useEffect } from "react" (used in component)');
console.log('- Should import { User, UserRole } from "./types" (used in interface)');
console.log("- Should NOT import useContext, useMemo (not used)");
console.log("- Should NOT import ApiResponse, UnusedType (not used)");
console.log('- Should NOT import anything from "unused-library" (not used)');
