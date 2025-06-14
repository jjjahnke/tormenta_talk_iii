# Rule: Generating a Refactoring Plan and Tasks

*   [Back to Main Instructions](copilot-instructions.md) #file:copilot-instructions.md
*   [Related: Task Completion and Management](task-completion.md) #file:task-completion.md

## Goal

To guide an AI assistant in creating a detailed refactoring plan and task list in Markdown format, based on an initial user prompt or identified code smells. The refactoring plan should be clear, actionable, and suitable for a junior developer to understand and implement.

## GitHub Copilot Integration

### Activation Triggers
This rule activates when:
- User mentions "refactor", "code cleanup", "improve performance", "reduce technical debt"
- Working in `/tasks` directory with `.md` files
- File naming pattern `refactor-*.md` is detected
- User requests help with code improvement or restructuring

### Copilot-Specific Behaviors
- **Context Awareness:** Reference existing code files, project structure, and identified code smells.
- **File Suggestions:** Automatically suggest appropriate filename based on refactoring scope.
- **Workspace Integration:** Check for existing refactoring plans to maintain consistency.
- **Code Integration:** When refactoring opportunities are discussed, offer to analyze code or suggest specific changes.

### Usage Patterns
- **Inline Comments:** Can be triggered by comments like `// TODO: Refactor this module for better readability`
- **Chat Integration:** Works with Copilot Chat for iterative refactoring plan development.
- **File Context:** Leverages open files and workspace structure for better context understanding.

## Prerequisites

Before starting the refactoring process, ensure you have:
- Access to the current workspace and codebase.
- Understanding of the project structure and existing code.
- Ability to create/modify files in the `/tasks` directory.
- Context from any open files that might relate to the refactoring scope.

## Process

1.  **Receive Initial Prompt/Identify Need:** The user provides a brief description of the refactoring goal, or the AI identifies code smells/areas for improvement.
2.  **Ask Clarifying Questions:** Before writing the refactoring plan, the AI *must* ask clarifying questions to gather sufficient detail. Ask questions one at a time, allowing the user to respond fully before proceeding.
3.  **Summarize Understanding:** After gathering responses, briefly summarize your understanding of the refactoring request for user confirmation.
4.  **Analyze Codebase (if applicable):** If the refactoring scope is broad, offer to analyze relevant parts of the codebase to identify specific areas for improvement.
5.  **Generate Refactoring Plan:** Based on the initial prompt, user's answers, and code analysis, generate a comprehensive refactoring plan using the structure outlined below.
6.  **Generate Detailed Refactoring Tasks:** Break down the refactoring plan into specific, actionable tasks, similar to the `task-generation.md` rule.
7.  **Review with User:** Present the refactoring plan and tasks for user feedback and make any necessary revisions.
8.  **Save Refactoring Plan:** Save the finalized document as `refactor-[scope-name].md` inside the `/tasks` directory.

## Clarifying Questions Framework

### Required Questions (Always Ask)
- **Refactoring Goal:** "What specific problem does this refactoring aim to solve (e.g., improve readability, performance, maintainability, reduce bugs)?"
- **Scope:** "What specific areas or modules of the codebase are targeted for refactoring?"
- **Expected Outcome:** "What does a successful refactoring look like from a functional and non-functional perspective?"

### Contextual Questions (Ask Based on Refactoring Type)

**Impact & Risk:**
- "What are the potential risks associated with this refactoring (e.g., breaking existing functionality, performance degradation)?"
- "Are there any critical dependencies or integrations that might be affected?"

**Technical Debt:**
- "Is this refactoring addressing specific technical debt? If so, what kind (e.g., spaghetti code, duplicated logic, outdated patterns)?"

**Performance:**
- "If performance is a goal, what are the current bottlenecks and target metrics?"

**Maintainability/Readability:**
- "Are there specific code smells or patterns you want to eliminate (e.g., long functions, complex conditionals, unclear variable names)?"

**Testing:**
- "What is the current test coverage in the targeted areas? Should new tests be added or existing ones improved?"

## Refactoring Plan Structure

The generated refactoring plan should include the following sections:

### 1. Introduction/Overview
- Brief description of the refactoring goal and the problem it solves.
- Clear statement of the primary objective.
- Context within the broader project goals.

### 2. Goals & Success Metrics
- **Primary Goals:** 2-3 specific, measurable objectives for the refactoring.
- **Success Metrics:** How success will be measured (e.g., improved readability scores, reduced cyclomatic complexity, performance benchmarks, reduced bug count).
- **Timeline/Priority:** Urgency and target completion timeframe.

### 3. Scope & Boundaries
- Explicitly define the modules, files, or functionalities included in the refactoring.
- **Non-Goals:** Explicitly state what this refactoring will NOT include to manage scope.

### 4. Current State Analysis (if applicable)
- Summary of the current code issues (e.g., code smells, performance bottlenecks, architectural deficiencies).
- Metrics or examples illustrating the problem.

### 5. Proposed Changes & Strategy
- High-level overview of the refactoring approach (e.g., extract methods, introduce design patterns, optimize algorithms).
- Architectural changes or new patterns to be introduced.

### 6. Refactoring Task Categories
- Breakdown of tasks into logical categories (see below).

### 7. Risk Assessment & Mitigation
- Potential risks (e.g., regressions, performance issues, integration breaks) and strategies to mitigate them.

### 8. Testing Strategy
- How the refactoring will be tested (e.g., unit, integration, regression tests).
- Expected test coverage improvements.

### 9. Rollback Plan
- Strategy for reverting changes if issues arise.

### 10. Open Questions
- Remaining questions needing clarification or further research.

## Refactoring Task Categories

Similar to feature tasks, but tailored for refactoring:

**Code Structure & Readability (CR)**
- Extract methods/functions, simplify conditionals, rename variables, improve comments.

**Performance Optimization (PO)**
- Algorithm optimization, caching strategies, database query tuning.

**Technical Debt Reduction (TD)**
- Remove dead code, eliminate duplication, update outdated patterns, fix anti-patterns.

**Architecture & Design (AD)**
- Introduce design patterns, decouple modules, improve dependency management.

**Testing & Quality (TQ)**
- Add/improve unit tests, integration tests, improve testability.

**Dependency Management (DM)**
- Update libraries, remove unused dependencies, manage versions.

## Output Format

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `refactor-[scope-name].md`
- **Style:** Use clear headings, numbered lists for tasks, and bullet points for details.

## Standardized Task Metadata Schema for Refactoring

All generated refactoring tasks should adhere to the following machine-readable JSON schema for consistent metadata and easier integration with external tools. This schema aligns with the general task metadata schema used for feature development.

### Task Metadata Template
```json
{
  "id": "CR1.1",
  "title": "Refactor [specific function/module] for readability",
  "type": "Refactoring Task", // Specific type for refactoring tasks
  "epic": "CR1.0", // Reference to the parent refactoring epic ID
  "priority": "Medium", // e.g., "High", "Medium", "Low"
  "storyPoints": 5, // Estimated effort
  "executionMode": "human", // "human", "ai-agent", "collaborative"
  "skillsRequired": ["Code Refactoring", "TypeScript"], // Array of skills
  "humanResponsibilities": [
    "Analyze current implementation for code smells",
    "Design refactored structure",
    "Implement changes and ensure no regressions"
  ],
  "aiAgentResponsibilities": [
    "Suggest initial refactoring opportunities",
    "Generate boilerplate for new structures",
    "Create basic unit test templates for refactored code"
  ],
  "learningObjectives": [
    "Practice identifying code smells",
    "Learn refactoring patterns",
    "Understand impact of refactoring on existing code"
  ],
  "dependencies": [], // Array of task IDs this task depends on
  "blockedBy": [], // Array of task IDs that block this task
  "blocks": [], // Array of task IDs this task blocks
  "assigneeSuggestion": "Frontend Developer", // Suggested assignee role
  "acceptanceCriteria": [
    "Code readability score improved by X%",
    "No regressions introduced (all tests pass)",
    "Follows project coding standards"
  ],
  "definitionOfReady": "Refactoring plan approved, relevant code analyzed", // Criteria for starting the task
  "labels": ["refactoring", "code-quality", "frontend"], // Array of labels
  "estimatedHours": 8 // Estimated hours for completion
}
```

### Epic Structure for Refactoring
- **Epic CR1.0:** Code Structure & Readability
- **Epic PO2.0:** Performance Optimization
- **Epic TD3.0:** Technical Debt Reduction
- **Epic AD4.0:** Architecture & Design
- **Epic TQ5.0:** Testing & Quality
- **Epic DM6.0:** Dependency Management

### Dependency Chain Visualization (Example)
```
CR1.1 → CR1.2 → TQ5.1
       AD4.1 → PO2.1
```

## Instructions for AI: Applying Standardized Metadata for Refactoring

When generating refactoring tasks, ensure each task's metadata strictly adheres to the `Task Metadata Template` provided above. This consistency is crucial for automated processing and tracking of refactoring efforts.

## Final Instructions for GitHub Copilot

1.  **Dynamic Content Generation:** When generating refactoring plans and tasks, actively use placeholders (e.g., `[module/feature]`, `[code area]`) and fill them with context-specific information derived from the user's prompt and codebase analysis. Generate dynamic lists (e.g., "Refactoring Task Categories," "Relevant Files") based on identified code smells and refactoring opportunities.
2.  **Context First:** Always scan the workspace for existing code, project structure, and relevant documentation.
3.  **Incremental Approach:** Use Copilot's chat interface for the question-asking phase.
4.  **File Management:** Suggest appropriate file paths based on existing project organization.
5.  **Cross-Reference:** When mentioning technical changes, offer to analyze code or suggest specific code modifications.
6.  **Consistency:** Maintain formatting consistency with existing documentation in the workspace.
7.  **Version Control & Committing:** After finalizing the refactoring plan, suggest committing it to version control with a descriptive message (e.g., `refactor(auth): Add plan for authentication module refactor`). Refer to "Version Control Best Practices for Documentation" in `copilot-instructions.md`.

## How to Invoke This Rule

Users can trigger this rule by typing phrases like:
- "Create a refactoring plan for [module/feature]"
- "Help me refactor [code area]"
- "Generate refactoring tasks for [project name]"
- "I need a plan to reduce technical debt in [area]"

**File-based triggers:**
- Opening or creating files with pattern `refactor-*.md`
- Working in `/tasks` directory with markdown files
- Adding comments like `<!-- TODO: Refactor [area] -->`

## Final Instructions

1.  **DO NOT** start implementing the refactoring immediately.
2.  **DO** ask clarifying questions one at a time, waiting for responses.
3.  **DO** scan workspace context before beginning.
4.  **DO** summarize your understanding before generating the refactoring plan.
5.  **DO** present the completed refactoring plan and tasks for user review and feedback.
6.  **DO** iterate based on user input before finalizing.

## Error Handling and Ambiguity Resolution for Refactoring

When encountering ambiguity, insufficient information, or conflicting requirements during the refactoring plan and task generation process, the AI *must* follow these guidelines:

1.  **Prioritize Clarification:** Always ask clarifying questions to the user. Refer to the "Clarifying Questions Framework" section for guidance specific to refactoring.
2.  **One Question at a Time:** Ask questions one at a time, allowing the user to respond fully before proceeding.
3.  **Identify Gaps:** Explicitly state what information is missing or what aspects are unclear regarding the refactoring scope, goals, or potential impact.
4.  **Propose Assumptions (if necessary):** If direct clarification is not immediately possible, propose reasonable assumptions about the refactoring approach or scope and explicitly state them to the user for confirmation.
5.  **Avoid Proceeding with Ambiguity:** Do not generate refactoring plans or tasks based on assumptions without explicit or implicit user confirmation.
6.  **Conflict Resolution:** If conflicting refactoring goals or approaches are identified, highlight the conflict to the user and ask for a definitive decision.
7.  **Fallback to High-Level:** If detailed information cannot be obtained, generate a high-level refactoring plan and clearly mark sections that require further detail or clarification from the user.
