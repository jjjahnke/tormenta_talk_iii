# Rule: Generating a Product Requirements Document (PRD)

*   [Back to Main Instructions](copilot-instructions.md) #file:copilot-instructions.md
*   [Related: Task List Generation](task-generation.md) #file:task-generation.md

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## GitHub Copilot Integration

### Activation Triggers
This rule activates when:
- User mentions "PRD", "product requirements", or "feature spec"
- Working in `/tasks` directory with `.md` files
- File naming pattern `prd-*.md` is detected
- User requests help with product documentation

### Copilot-Specific Behaviors
- **Context Awareness:** Reference existing files in the workspace when asking clarifying questions
- **File Suggestions:** Automatically suggest appropriate filename based on feature name
- **Workspace Integration:** Check for existing PRDs to maintain consistency in format and style
- **Code Integration:** When technical requirements are discussed, offer to generate corresponding code stubs or examples

### Usage Patterns
- **Inline Comments:** Can be triggered by comments like `// TODO: Create PRD for user authentication feature`
- **Chat Integration:** Works with Copilot Chat for iterative PRD development
- **File Context:** Leverages open files and workspace structure for better context understanding

## Prerequisites

Before starting the PRD process, ensure you have:
- Access to the current workspace and existing documentation
- Understanding of the project structure and existing PRDs (if any)
- Ability to create/modify files in the `/tasks` directory
- Context from any open files that might relate to the feature

## Process

1. **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2. **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask clarifying questions to gather sufficient detail. Ask questions one at a time, allowing the user to respond fully before proceeding.
3. **Summarize Understanding:** After gathering responses, briefly summarize your understanding of the feature request for user confirmation.
4. **Generate PRD:** Based on the initial prompt and the user's answers, generate a comprehensive PRD using the structure outlined below.
5. **Review with User:** Present the PRD for user feedback and make any necessary revisions.
6. **Save PRD:** Save the finalized document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions Framework

### Required Questions (Always Ask)
- **Problem/Goal:** "What specific problem does this feature solve for users?"
- **Target User:** "Who is the primary user of this feature? What's their role/context?"
- **Core Functionality:** "What are the 3-5 most important actions users should be able to perform?"

### Contextual Questions (Ask Based on Feature Type)

**Scope & Boundaries:**
- "What should this feature NOT do? Any explicit non-goals?"
- "Are there any constraints or limitations we should consider?"

**User Experience:**
- "Can you provide 2-3 user stories? (As a [user type], I want to [action] so that [benefit])"
- "How will users discover and access this feature?"
- "What should happen when something goes wrong?"

**Integration & Technical:**
- "How should this integrate with existing features or systems?"
- "Are there any performance requirements? (speed, capacity, etc.)"
- "Any security or privacy considerations?"

**Success & Measurement:**
- "How will we measure if this feature is successful?"
- "What does 'done' look like from a user perspective?"

**Design & Accessibility:**
- "Are there existing design patterns or components to follow?"
- "Should this meet specific accessibility standards?"

## PRD Structure

The generated PRD should include the following sections:

### 1. Introduction/Overview
- Brief description of the feature and the problem it solves
- Clear statement of the primary goal
- Context within the broader product strategy

### 2. Goals & Success Metrics
- **Primary Goals:** 2-3 specific, measurable objectives
- **Success Metrics:** How success will be measured (quantitative when possible)
- **Timeline/Priority:** Urgency and target completion timeframe

### 3. Target Users
- Primary user personas and their characteristics
- User context and scenarios where this feature will be used

### 4. User Stories
- Detailed user narratives describing feature usage and benefits
- Format: "As a [user type], I want to [perform action] so that [benefit/outcome]"
- Include both primary and edge-case scenarios

### 5. Functional Requirements
- Numbered list of specific functionalities the feature must have
- Use clear, actionable language (e.g., "The system must allow users to...")
- Include input validation, error handling, and edge cases

### 6. Non-Goals (Out of Scope)
- Explicitly state what this feature will NOT include
- Helps manage scope and prevent feature creep

### 7. Assumptions
- Key assumptions being made about user behavior, technical constraints, or business context
- Dependencies on other teams or external factors

### 8. Design Considerations
- UI/UX requirements or guidelines
- Links to mockups, wireframes, or design systems
- Accessibility requirements
- Mobile/responsive considerations

### 9. Technical Considerations
- Known technical constraints or dependencies
- Integration requirements with existing systems
- Performance requirements
- Security and privacy considerations

### 10. Risk Assessment
- Potential risks and mitigation strategies
- Dependencies that could block progress
- Technical or user experience risks

### 11. Open Questions
- Remaining questions needing clarification
- Areas requiring further research or stakeholder input
- Decisions that need to be made before implementation

## Target Audience

**Primary:** Junior developers who need clear, actionable requirements to implement the feature
**Secondary:** Product managers and stakeholders for alignment and approval
**Tone:** Professional but accessible, with examples and context where helpful
**Detail Level:** Sufficient for implementation without being overly prescriptive about technical solutions

## Quality Checklist

Before finalizing the PRD, ensure:
- [ ] All functional requirements are testable and measurable
- [ ] User stories clearly articulate the "why" behind each feature
- [ ] Non-goals are explicitly stated to prevent scope creep
- [ ] Success metrics are defined and measurable
- [ ] Technical constraints and dependencies are identified
- [ ] Edge cases and error scenarios are addressed
- [ ] The document is clear enough for a junior developer to understand

## Output Format

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `prd-[feature-name].md`
- **Style:** Use clear headings, numbered lists for requirements, and bullet points for supporting details

## Final Instructions for GitHub Copilot

1.  **Dynamic Content Generation:** Actively use placeholders (e.g., `[Feature Name]`, `[Problem Solved]`) and fill them with context-specific information derived from the user's prompt and workspace analysis. Generate dynamic lists (e.g., "Functional Requirements," "User Stories") based on gathered details.
2.  **Context First:** Always scan the workspace for existing PRDs and project structure before starting.
3.  **Incremental Approach:** Use Copilot's chat interface for the question-asking phase.
4.  **File Management:** Suggest appropriate file paths based on existing project organization.
5.  **Cross-Reference:** When mentioning technical requirements, offer to generate related code examples.
6.  **Consistency:** Maintain formatting consistency with existing documentation in the workspace.
7.  **Version Control & Committing:** After finalizing the PRD, suggest committing it to version control with a descriptive message (e.g., `docs: Add PRD for [Feature Name]`). Refer to "Version Control Best Practices for Documentation" in `copilot-instructions.md`.

## How to Invoke This Rule

Users can trigger this rule by typing phrases like:
- "Create a PRD for [feature name]"
- "Help me write a product requirements document for [feature]"
- "Generate PRD for [feature name]"
- "I need a product requirements document for [feature]"

**File-based triggers:**
- Opening or creating files with pattern `prd-*.md`
- Working in `/tasks` directory with markdown files
- Adding comments like `<!-- TODO: Create PRD for [feature] -->`

## Final Instructions

1. **DO NOT** start implementing the PRD immediately
2. **DO** ask clarifying questions one at a time, waiting for responses  
3. **DO** scan workspace context before beginning
4. **DO** summarize your understanding before generating the PRD
5. **DO** present the completed PRD for user review and feedback
6. **DO** iterate based on user input before finalizing

## Iteration Guidelines

- If user requests changes, update the specific sections rather than regenerating the entire document.
- Track version changes if significant revisions are made.
- Confirm user satisfaction before marking the PRD as complete.

## Error Handling and Ambiguity Resolution

When encountering ambiguity, insufficient information, or conflicting requirements during the PRD generation process, the AI *must* follow these guidelines:

1.  **Prioritize Clarification:** Always ask clarifying questions to the user. Refer to the "Clarifying Questions Framework" section for guidance.
2.  **One Question at a Time:** Ask questions one at a time, allowing the user to respond fully before proceeding.
3.  **Identify Gaps:** Explicitly state what information is missing or what aspects are unclear.
4.  **Propose Assumptions (if necessary):** If direct clarification is not immediately possible, propose reasonable assumptions and explicitly state them to the user for confirmation.
5.  **Avoid Proceeding with Ambiguity:** Do not generate content based on assumptions without explicit or implicit user confirmation.
6.  **Conflict Resolution:** If conflicting requirements are identified, highlight the conflict to the user and ask for a definitive decision.
7.  **Fallback to High-Level:** If detailed information cannot be obtained, generate a high-level PRD and clearly mark sections that require further detail or clarification.
