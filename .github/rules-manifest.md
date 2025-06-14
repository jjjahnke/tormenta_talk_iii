# Agentic Development Rules Manifest

This document serves as a centralized manifest for all AI agent rules and their associated metadata within this repository. It provides a single source of truth for understanding available functionalities and their activation patterns.

## Rule Definitions

Each rule is defined with the following metadata:

-   **`name`**: A unique identifier for the rule.
-   **`description`**: A brief explanation of what the rule does.
-   **`globs`**: An array of glob patterns that trigger the rule's activation based on file paths.
-   **`alwaysApply`**: A boolean indicating if the rule should always be considered, regardless of specific triggers.
-   **`path`**: The relative path to the detailed rule document.

---

## Available Rules

### 1. GitHub Copilot Repository Instructions

-   **name**: `copilot-instructions`
-   **description**: General instructions and context for agentic development within the repository.
-   **globs**: []
-   **alwaysApply**: true
-   **path**: `.github/copilot-instructions.md`

### 2. Product Requirements Document (PRD) Generation

-   **name**: `create-prd`
-   **description**: Guides an AI assistant in creating detailed Product Requirements Documents.
-   **globs**:
    -   `*.md`
    -   `prd-*.md`
    -   `/tasks/*.md`
-   **alwaysApply**: false
-   **path**: `.github/create-prd.md`

### 3. Task List Generation from PRD

-   **name**: `task-generation`
-   **description**: Guides an AI assistant in creating detailed, step-by-step task lists from PRDs.
-   **globs**:
    -   `tasks-*.md`
    -   `/tasks/*.md`
    -   `prd-*.md`
-   **alwaysApply**: false
-   **path**: `.github/task-generation.md`

### 4. Task Completion and Management

-   **name**: `task-completion`
-   **description**: Guidelines for managing task completion in AI-human collaborative development environments.
-   **globs**:
    -   `tasks-*.md`
    -   `/tasks/*.md`
-   **alwaysApply**: false
-   **path**: `.github/task-completion.md`

### 5. Refactoring Plan and Task Generation

-   **name**: `refactor-project`
-   **description**: Guides an AI assistant in creating detailed refactoring plans and task lists.
-   **globs**:
    -   `refactor-*.md`
    -   `/tasks/*.md`
-   **alwaysApply**: false
-   **path**: `.github/refactor-project.md`
