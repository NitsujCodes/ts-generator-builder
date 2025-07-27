/**
 * Test file for the TypeScript Generator Builder
 *
 * This file demonstrates the usage of the library with a simple example.
 */
import { createGenerator } from "./src";

// Create a generator with default options
const generator = createGenerator({
  globalMetadata: {
    generator: "ts-generator-builder",
    generatedAt: new Date(),
    project: "test-project",
  },
});

// Add sections and content
const result = generator
  // Imports section
  .section(
    "Imports",
    {
      description: "Import statements for external dependencies",
    },
    (section) => {
      // Named imports with some used and some unused
      section.addImports("react", (builder) => {
        builder
          .named("useState")
          .named("useEffect")
          .named("useContext")
          .named("useMemo")
          // Mark only some imports as used
          .markUsed("useState")
          .markUsed("useEffect");
      });

      // Default import that is used
      section.addImports("react-dom", (builder) => {
        builder.default("ReactDOM").markDefaultUsed();
      });

      // Namespace import that is used
      section.addImports("react-router-dom", (builder) => {
        builder.namespace("Router").markNamespaceUsed();
      });

      // Mixed imports with some used and some unused
      section.addImports("styled-components", (builder) => {
        builder
          .default("styled")
          .named("css")
          .named("keyframes")
          .named("ThemeProvider")
          // Mark only some imports as used
          .markDefaultUsed()
          .markUsed("css");
      });

      // Type-only imports
      section.addImports("./types", (builder) => {
        builder
          .named("User")
          .named("UserRole")
          .named("ApiResponse")
          .markUsed("User")
          .markUsed("UserRole");
      });

      // Unused imports (should not appear in the output)
      section.addImports("unused-module", (builder) => {
        builder.named("UnusedComponent").named("UnusedFunction");
      });
    }
  )
  // API Types section
  .section(
    "API Types",
    {
      description: "Common API types and interfaces",
      exportAll: true,
      metadata: {
        source: "api-spec.json",
        version: "1.0.0",
      },
    },
    (section) => {
      // Base response interface
      section.addInterface("BaseResponse", (iface) => {
        iface
          .jsdoc("Base structure for all API responses")
          .property("success", "boolean")
          .property("timestamp", "number")
          .property("requestId", "string");
      });

      // Generic data response
      section.addInterface("DataResponse<T>", (iface) => {
        iface
          .extends("BaseResponse")
          .jsdoc("Response containing data")
          .property("data", "T")
          .property("meta", "ResponseMeta", { optional: true });
      });

      // Error response
      section.addInterface("ErrorResponse", (iface) => {
        iface
          .extends("BaseResponse")
          .jsdoc("Response containing error information")
          .property("error", "ApiError")
          .property("details", "string[]", { optional: true });
      });

      // Response metadata
      section.addInterface("ResponseMeta", (iface) => {
        iface
          .jsdoc("Metadata for paginated responses")
          .property("page", "number")
          .property("pageSize", "number")
          .property("totalPages", "number")
          .property("totalItems", "number");
      });

      // API Error
      section.addInterface("ApiError", (iface) => {
        iface
          .jsdoc("API error information")
          .property("code", "string")
          .property("message", "string");
      });
    }
  )

  // Status Codes section
  .section("Status Codes", (section) => {
    section.addEnum("HttpStatus", (enumBuilder) => {
      enumBuilder
        .jsdoc("HTTP status codes used by the API")
        .member("OK", 200)
        .member("CREATED", 201)
        .member("BAD_REQUEST", 400)
        .member("UNAUTHORIZED", 401)
        .member("FORBIDDEN", 403)
        .member("NOT_FOUND", 404)
        .member("SERVER_ERROR", 500);
    });
  })

  // User Types section
  .section(
    "User Types",
    {
      description: "User-related types and interfaces",
      exportAll: true,
    },
    (section) => {
      // User interface
      section.addInterface("User", (iface) => {
        iface
          .jsdoc("User information")
          .property("id", "string", { readonly: true })
          .property("email", "string")
          .property("name", "string")
          .property("role", "UserRole")
          .property("createdAt", "Date", { readonly: true });
      });

      // User role enum
      section.addEnum("UserRole", (enumBuilder) => {
        enumBuilder.jsdoc("Available user roles").values(["admin", "user", "guest"]);
      });

      // User-related types
      section.addType("UserId", "string", {
        jsdoc: "Unique user identifier",
      });

      section.addType("UserList", "User[]", {
        jsdoc: "List of users",
      });

      section.addType("UserMap", "Record<UserId, User>", {
        jsdoc: "Map of users by ID",
      });
    }
  )

  // Config Objects section
  .section(
    "Config Objects",
    {
      description: "Configuration objects with readonly properties and const assertions",
      exportAll: true,
    },
    (section) => {
      // Basic object with different property types
      section.addObject(
        {
          name: "API_CONFIG",
          export: true,
          asConst: true,
        },
        (objBuilder) => {
          objBuilder
            .jsdoc([
              "API configuration constants",
              "Used throughout the application for API requests",
            ])
            .property("baseUrl", "https://api.example.com")
            .property("version", "v1")
            .property("timeout", 5000)
            .property("retryCount", 3)
            .property("endpoints", {
              users: "/users",
              auth: "/auth",
              products: "/products",
            });
        }
      );

      // Object with readonly properties
      section.addObject(
        {
          name: "DEFAULT_SETTINGS",
        },
        (objBuilder) => {
          objBuilder
            .jsdoc("Default application settings")
            .property("theme", "light", { readonly: true })
            .property("language", "en-US", { readonly: true })
            .property("notifications", true, { readonly: true })
            .property("pageSize", 20, { readonly: true });
        }
      );

      // Object with nested objects
      section.addObject(
        {
          name: "ENVIRONMENT_CONFIG",
        },
        (objBuilder) => {
          objBuilder
            .jsdoc("Environment-specific configuration")
            .nestedObject("development", (nestedBuilder) => {
              nestedBuilder
                .property("apiUrl", "https://dev-api.example.com")
                .property("debug", true);
            })
            .nestedObject(
              "production",
              (nestedBuilder) => {
                nestedBuilder
                  .property("apiUrl", "https://api.example.com")
                  .property("debug", false);
              },
              { readonly: true }
            );
        }
      );

      // Anonymous object literal (no name)
      section.addObject({}, (objBuilder) => {
        objBuilder
          .property("id", "12345")
          .property("name", "Example Object")
          .property("values", [1, 2, 3, 4, 5])
          .asConst();
      });
    }
  )
  // Type Builder section
  .section(
    "Type Builder",
    {
      description: "Advanced type definitions using the TypeBuilder",
      exportAll: true,
    },
    (section) => {
      // Simple primitive type
      section.addType("UserId", (builder) => {
        builder.jsdoc("Unique identifier for a user").primitive("string");
      });

      // Type reference
      section.addType("UserList", (builder) => {
        builder.jsdoc("List of users").array("User");
      });

      // Union type
      section.addType("Status", (builder) => {
        builder
          .jsdoc("Possible status values for a request")
          .union(['"pending"', '"approved"', '"rejected"']);
      });

      // Intersection type
      section.addType("UserWithRole", (builder) => {
        builder
          .jsdoc("User with additional role information")
          .intersection(["User", "{ role: UserRole }"]);
      });

      // Keyof type
      section.addType("UserKeys", (builder) => {
        builder.jsdoc("All property keys of the User interface").keyof("User");
      });

      // Typeof type
      section.addType("ConfigType", (builder) => {
        builder.jsdoc("Type of the API_CONFIG object").typeof("API_CONFIG");
      });

      // Generic type with single type parameter
      section.addType("Result", (builder) => {
        builder
          .jsdoc("Generic result container")
          .typeParameter("T")
          .reference("{ data: T; error?: string }");
      });

      // Generic type with multiple type parameters and constraints
      section.addType("Dictionary", (builder) => {
        builder
          .jsdoc("Dictionary mapping keys to values")
          .addTypeParameters([{ name: "K", constraint: "string" }, { name: "V" }])
          .reference("Record<K, V>");
      });

      // Tuple type
      section.addType("UserTuple", (builder) => {
        builder.jsdoc("User information as a tuple").tuple(["string", "number", "boolean"]);
      });

      // Complex type combining multiple features
      section.addType("ApiHandler", (builder) => {
        builder
          .jsdoc([
            "API request handler function type",
            "Takes request data and returns a promise with the response",
          ])
          .addTypeParameters([{ name: "TRequest" }, { name: "TResponse", constraint: "object" }])
          .reference("(req: TRequest) => Promise<Result<TResponse>>");
      });
    }
  )
  // Logic Statements and Loops section
  .section(
    "Logic Statements and Loops",
    {
      description: "Examples of logic statements and loops",
      exportAll: true,
    },
    (section) => {
      // If statement with then block
      section.addIf((ifBuilder) => {
        ifBuilder
          .jsdoc("Check if user is authenticated")
          .condition("isAuthenticated")
          .then((block) => {
            block.addStatement('console.log("User is authenticated")');
            block.addStatement("renderAuthenticatedContent()");
          });
      });

      // If-else statement
      section.addIf((ifBuilder) => {
        ifBuilder
          .jsdoc("Check user role and render appropriate content")
          .condition('user.role === "admin"')
          .then((block) => {
            block.addStatement("renderAdminDashboard()");
          })
          .else((block) => {
            block.addStatement("renderUserDashboard()");
          });
      });

      // If-else-if-else statement
      section.addIf((ifBuilder) => {
        ifBuilder
          .jsdoc("Handle different HTTP status codes")
          .condition("status === 200")
          .then((block) => {
            block.addStatement("handleSuccess(data)");
          })
          .elseIf("status === 404", (block) => {
            block.addStatement("handleNotFound()");
          })
          .elseIf("status >= 500", (block) => {
            block.addStatement("handleServerError()");
          })
          .else((block) => {
            block.addStatement("handleUnexpectedStatus(status)");
          });
      });

      // Nested if statements
      section.addIf((ifBuilder) => {
        ifBuilder
          .jsdoc("Nested conditions for complex logic")
          .condition("isLoggedIn")
          .then((block) => {
            block.addStatement("const userData = getUserData()");
            block.addIf((nestedIf) => {
              nestedIf.condition("userData.isVerified").then((nestedBlock) => {
                nestedBlock.addStatement("showVerifiedBadge()");
              });
            });
          });
      });

      // Switch statement
      section.addSwitch((switchBuilder) => {
        switchBuilder
          .jsdoc("Handle different user roles")
          .expression("userRole")
          .case('"admin"', (block) => {
            block.addStatement('console.log("Admin user")');
            block.addStatement("grantFullAccess()");
            block.addStatement("break");
          })
          .case('"moderator"', (block) => {
            block.addStatement('console.log("Moderator user")');
            block.addStatement("grantModeratorAccess()");
            block.addStatement("break");
          })
          .case('"user"', (block) => {
            block.addStatement('console.log("Regular user")');
            block.addStatement("grantBasicAccess()");
            block.addStatement("break");
          })
          .default((block) => {
            block.addStatement('console.log("Unknown role")');
            block.addStatement("grantGuestAccess()");
          });
      });

      // For loop
      section.addFor((forBuilder) => {
        forBuilder
          .jsdoc("Process items in an array")
          .init("let i = 0")
          .condition("i < items.length")
          .increment("i++")
          .body((block) => {
            block.addStatement("console.log(`Processing item ${i}:`, items[i])");
            block.addStatement("processItem(items[i])");
          });
      });

      // While loop
      section.addWhile((whileBuilder) => {
        whileBuilder
          .jsdoc("Retry an operation until successful or max retries reached")
          .condition("!success && retries < MAX_RETRIES")
          .body((block) => {
            block.addStatement("console.log(`Attempt ${retries + 1}`)");
            block.addStatement("success = attemptOperation()");
            block.addStatement("retries++");
            block.addStatement("if (!success) wait(1000 * retries)");
          });
      });

      // Do-while loop
      section.addDoWhile((doWhileBuilder) => {
        doWhileBuilder
          .jsdoc("Get user input until valid")
          .body((block) => {
            block.addStatement("const input = getUserInput()");
            block.addStatement("isValid = validateInput(input)");
            block.addStatement('if (!isValid) showError("Invalid input")');
          })
          .condition("!isValid");
      });

      // Combination of statements and loops
      section.addIf((ifBuilder) => {
        ifBuilder
          .jsdoc("Complex data processing example")
          .condition("data && data.items && data.items.length > 0")
          .then((block) => {
            block.addStatement("console.log(`Processing ${data.items.length} items`)");
            block.addFor((forBuilder) => {
              forBuilder
                .init("let i = 0")
                .condition("i < data.items.length")
                .increment("i++")
                .body((loopBlock) => {
                  loopBlock.addStatement("const item = data.items[i]");
                  loopBlock.addIf((itemIf) => {
                    itemIf
                      .condition("item.isValid")
                      .then((validBlock) => {
                        validBlock.addStatement("processValidItem(item)");
                      })
                      .else((invalidBlock) => {
                        invalidBlock.addStatement("logInvalidItem(item)");
                        invalidBlock.addStatement("skipCount++");
                      });
                  });
                });
            });
            block.addStatement(
              "console.log(`Processed ${data.items.length - skipCount} items, skipped ${skipCount} items`)"
            );
          })
          .else((block) => {
            block.addStatement('console.log("No items to process")');
          });
      });
    }
  )
  .generate();

// Output the result
console.log(result);
