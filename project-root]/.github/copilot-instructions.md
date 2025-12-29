# Copilot Instructions for AI Coding Agents

## Project Overview
This project is designed to facilitate [insert project purpose]. Understanding the architecture is crucial for effective contributions.

### Architecture
- **Major Components**: The project consists of several key components, including [list major components, e.g., services, modules].
- **Service Boundaries**: Each component is responsible for specific functionalities, such as [describe responsibilities].
- **Data Flows**: Data flows between components through [describe data flow mechanisms, e.g., APIs, message queues].
- **Structural Decisions**: The architecture was designed to enhance [explain the rationale behind the structure, e.g., scalability, maintainability].

### Developer Workflows
- **Building the Project**: Use the command `npm run build` to compile the project. Ensure all dependencies are installed via `npm install`.
- **Running Tests**: Execute `npm test` to run the test suite. Tests are located in the `tests` directory.
- **Debugging**: Use [specific debugging tools or methods] for effective debugging. For example, [provide a specific command or tool].

### Project-Specific Conventions
- **Code Style**: Follow [insert coding standards or style guides, e.g., ESLint rules].
- **Naming Conventions**: Use [describe naming conventions for files, variables, etc.].
- **Folder Structure**: The folder structure is organized as follows:
  - `src/`: Contains the main application code.
  - `tests/`: Contains unit and integration tests.

### Integration Points
- **External Dependencies**: The project relies on [list key external libraries or services].
- **Cross-Component Communication**: Components communicate via [describe communication patterns, e.g., REST APIs, event emitters].

## Examples
- **Service Example**: The `UserService` in `src/services/userService.js` handles user-related operations and communicates with the database through the `UserRepository`.
- **Testing Example**: Tests for the `UserService` can be found in `tests/userService.test.js`, demonstrating how to mock dependencies.

Please review this draft and provide feedback on any unclear or incomplete sections for further iteration.