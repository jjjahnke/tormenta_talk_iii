# GitHub Copilot Repository Instructions for Agentic Development

This repository is set up for agentic development, where we define tasks and guide AI agents to execute them. The following core documents and the centralized rules manifest are essential context for all interactions with Copilot:

## Core Agentic Development Context:

*   **Agentic Development Rules Manifest:**
    This document provides a centralized overview and metadata for all available AI agent rules, including their descriptions and activation patterns.
    [Rules Manifest Link](rules-manifest.md) #file:rules-manifest.md

*   **Product Requirements Document (PRD):**
    This document outlines the high-level goals, features, and user stories for the project. All development work should align with this PRD.
    [PRD Link](create-prd.md) #file:create-prd.md

*   **Agent Task List Generation:**
    This file contains a detailed guide for generating step-by-step task breakdowns for the AI agent to perform. It's the primary directive for agent execution.
    [Agent Task List Generation Link](task-generation.md) #file:task-generation.md

*   **Execution Guidance / Task Completion:**
    This document provides specific instructions, coding standards, preferred libraries, error handling patterns, and other guidelines for how tasks should be executed by the agent and how their completion is managed. Refer to this for implementation details.
    [Execution Guidance Link](task-completion.md) #file:task-completion.md

*   **Refactoring Plan and Task Generation:**
    This document guides the AI in creating detailed refactoring plans and task lists for existing codebases.
    [Refactoring Plan Link](refactor-project.md) #file:refactor-project.md

---

## General Guidance for Copilot:

*   **Dynamic Content Generation:** Strive to generate content that is highly contextual and specific, utilizing placeholders and dynamically populating sections based on analysis and user input.
*   **Standardized Task Metadata:** All generated tasks (features and refactoring) should adhere to a standardized JSON metadata schema for consistent tracking and integration.
*   **Error Handling & Ambiguity Resolution:** When encountering unclear or conflicting information, prioritize asking clarifying questions and avoid proceeding with assumptions without explicit user confirmation.
*   Always refer to the relevant PRD for the overall objective and requirements of a feature.
*   Consult the generated Task List to understand the current task scope and order of operations.
*   Adhere strictly to the guidelines and standards defined in the Execution Guidance when generating or modifying code.
*   If a task is ambiguous, refer back to the PRD or Refactoring Plan for clarification.
*   Prioritize modularity, readability, and testability in all generated code.
*   If suggesting changes, explain how they align with these core documents and the overall project goals.
*   Assume an agentic workflow where tasks are broken down and executed iteratively.

---

## Version Control Best Practices for Documentation

To ensure documentation evolves cleanly alongside code and maintains a clear history of decisions and plans, follow these guidelines:

*   **Dedicated Branches:** For significant documentation updates (e.g., new PRDs, major refactoring plans), consider suggesting a dedicated feature branch (e.g., `docs/new-feature-prd`, `refactor/auth-module-plan`).
*   **Atomic Commits:** Make small, focused commits for each logical change within a document.
*   **Descriptive Commit Messages:** Use clear and concise commit messages that explain the purpose of the documentation change. Prefix with `docs:` or `feat(docs):` for clarity.
*   **Review Documentation Changes:** Encourage human review of documentation changes, similar to code reviews, to ensure accuracy and clarity.
*   **Link to Code Changes:** When documentation relates directly to code changes, suggest linking the documentation commit/PR to the corresponding code commit/PR.
