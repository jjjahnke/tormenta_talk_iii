# Rule: Generating a Task List from a PRD

*   [Back to Main Instructions](copilot-instructions.md) #file:copilot-instructions.md
*   [Related: Product Requirements Document (PRD) Generation](create-prd.md) #file:create-prd.md
*   [Related: Task Completion and Management](task-completion.md) #file:task-completion.md

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). The task list should provide a complete implementation roadmap for developers, with proper sequencing, dependencies, and quality checks.

## GitHub Copilot Integration

### Activation Triggers
This rule activates when:
- User mentions "tasks from PRD", "implementation plan", or "break down PRD"
- Working with files matching `prd-*.md` pattern
- User requests task generation or implementation planning
- File naming pattern `tasks-*.md` is detected

### Workspace Context
- **Project Structure Analysis:** Examine existing folders, naming conventions, and architecture patterns
- **Technology Stack Detection:** Identify frameworks, testing libraries, and build tools in use
- **Existing Task Files:** Reference other task files for consistency in format and detail level
- **Code Patterns:** Leverage existing code structure to suggest appropriate file paths and organization

## Prerequisites

Before generating tasks, ensure you have:
- Access to the specified PRD file and its complete content
- Understanding of the current project structure and technology stack
- Knowledge of existing development patterns and conventions in the workspace
- Ability to create/modify files in the `/tasks` directory

## Enhanced Analysis Process

### Phase 1: PRD Deep Analysis
1. **Extract Core Components:**
   - Identify all functional requirements (numbered list from PRD)
   - Map user stories to implementation needs
   - Note technical constraints and dependencies
   - Identify integration points with existing systems

2. **Categorize Feature Complexity:**
   - **Simple:** Basic CRUD operations, simple UI components
   - **Medium:** Complex business logic, multiple integrations
   - **Complex:** Advanced algorithms, performance optimization, security features

3. **Identify Implementation Layers:**
   - **Data Layer:** Database schemas, models, migrations
   - **API Layer:** Routes, controllers, middleware, validation
   - **Business Logic:** Services, utilities, algorithms
   - **UI Layer:** Components, pages, styling, interactions
   - **Integration Layer:** External APIs, authentication, notifications

### Phase 2: Task Categorization Strategy

**Setup & Infrastructure (S)**
- Database setup, migrations, configurations
- API route structure, middleware setup
- Authentication and authorization setup

**Core Features (C)**
- Primary functionality implementation
- Business logic and data processing
- Main user workflows

**User Interface (U)**
- Component development
- Page layouts and navigation
- User interactions and feedback

**Integration & External (I)**
- Third-party service integration
- Internal system connections
- Data synchronization

**Testing & Quality (T)**
- Unit tests for all components
- Integration tests for workflows
- End-to-end testing scenarios

**Documentation & Deployment (D)**
- Code documentation
- User documentation updates
- Deployment configurations

## Process

1. **Receive PRD Reference:** User provides path to specific PRD file
2. **Analyze Project Context:** Scan workspace for existing patterns, tech stack, and conventions
3. **Deep PRD Analysis:** Extract all requirements, user stories, and technical considerations using the enhanced analysis process
4. **Generate Implementation Plan:** Create high-level categories and estimate complexity
5. **Phase 1: Generate Parent Tasks:** Create main task categories with complexity indicators and present to user
6. **Wait for Confirmation:** Pause for user to respond with "Go" or request modifications
7. **Phase 2: Generate Detailed Sub-Tasks:** Break down each parent task with specific, actionable items
8. **Generate File Structure:** Identify all files to be created/modified based on project patterns
9. **Add Quality Checks:** Include validation steps and acceptance criteria mapping
10. **Save Task List:** Create final document with complete implementation roadmap

## Enhanced Output Format

```markdown
# Implementation Tasks for [Feature Name]
*Generated from: [PRD filename]*

## Project Context
- **Technology Stack:** [Detected frameworks, libraries]
- **Architecture Pattern:** [MVC, Component-based, etc.]
- **Testing Framework:** [Jest, Cypress, etc.]
- **Estimated Complexity:** [Simple/Medium/Complex]

## Prerequisites & Dependencies
- [ ] [Required existing features or setup]
- [ ] [External dependencies to install]
- [ ] [Environment configurations needed]

## Relevant Files

### New Files to Create
- `path/to/component/FeatureName.tsx` - Main component implementing [specific functionality]
- `path/to/component/FeatureName.test.tsx` - Unit tests for FeatureName component
- `api/routes/feature-name.ts` - API endpoint for [specific operations]
- `api/routes/feature-name.test.ts` - API route tests
- `lib/services/featureService.ts` - Business logic and data processing
- `lib/services/featureService.test.ts` - Service layer tests
- `types/feature.ts` - TypeScript interfaces and types
- `db/migrations/xxx-create-feature-table.sql` - Database schema changes

### Existing Files to Modify
- `components/Layout.tsx` - Add navigation for new feature
- `api/index.ts` - Register new API routes
- `lib/auth/permissions.ts` - Add new permission checks
- `.env.example` - Document new environment variables

### Notes
- Follow existing project naming conventions: [detected pattern]
- Place tests alongside source files per project standard
- Use `npm test` or `yarn test` to run test suite
- Database migrations should follow sequence: [detected pattern]

## Tasks

### 🏗️ S1.0 Setup & Infrastructure (Epic)

**S1.1** - Create database migration for [specific schema changes]
- **ID:** S1.1
- **Type:** Task
- **Priority:** High
- **Story Points:** 3
- **Execution Mode:** 🤝 Collaborative
- **Skills Required:** Database, SQL
- **Dependencies:** None
- **Human Responsibilities:**
  - Design database schema and relationships
  - Define constraints and indexing strategy
  - Review generated migration for optimization
- **AI Agent Responsibilities:**
  - Generate migration SQL from schema design
  - Create rollback scripts
  - Generate basic CRUD queries
- **Acceptance Criteria:**
  - [ ] Migration script creates required tables/columns
  - [ ] Migration can be rolled back safely
  - [ ] All constraints and indexes are properly defined
- **Definition of Ready:** PRD approved, database schema reviewed
- **Assignee Suggestion:** Backend Developer

**S1.2** - Set up API route structure for [feature endpoints]
- **ID:** S1.2
- **Type:** Task
- **Priority:** High
- **Story Points:** 5
- **Execution Mode:** 🤖 AI Agent (with Human Review)
- **Skills Required:** Node.js, Express/FastAPI
- **Dependencies:** S1.1
- **Human Responsibilities:**
  - Define API contract and endpoint specifications
  - Review generated code for security and best practices
  - Test endpoints manually for edge cases
- **AI Agent Responsibilities:**
  - Generate boilerplate route handlers
  - Implement basic validation middleware
  - Create standard error responses
- **Acceptance Criteria:**
  - [ ] All CRUD endpoints defined and responding
  - [ ] Proper error handling implemented
  - [ ] API documentation updated
- **Definition of Ready:** Database migration completed
- **Assignee Suggestion:** Backend Developer

### ⚙️ C2.0 Core Feature Implementation (Epic)

**C2.1** - Implement [specific business logic] in service layer
- **ID:** C2.1
- **Type:** Story
- **Priority:** High
- **Story Points:** 8
- **Execution Mode:** 👨‍💻 Human Developer
- **Skills Required:** Business Logic, Algorithms
- **Dependencies:** S1.1, S1.2
- **Human Responsibilities:**
  - Design business logic architecture and flow
  - Implement complex algorithms and decision trees
  - Handle edge cases and business rule exceptions
  - Optimize performance for critical paths
- **AI Agent Responsibilities:**
  - Generate basic data validation utilities
  - Create standard error handling patterns
  - Generate unit test templates
- **Learning Objectives:**
  - Practice translating business requirements to code
  - Develop algorithmic thinking skills
  - Learn to handle complex state management
- **Acceptance Criteria:**
  - [ ] All business rules from PRD implemented correctly
  - [ ] Edge cases handled with appropriate error messages
  - [ ] Performance meets specified requirements
  - [ ] Code is well-documented and maintainable

**C2.2** - Create API endpoints for [CRUD operations]
- **ID:** C2.2
- **Type:** Task
- **Priority:** Medium
- **Story Points:** 5
- **Execution Mode:** 🤖 AI Agent (with Human Design)
- **Skills Required:** REST API, HTTP protocols
- **Dependencies:** C2.1
- **Human Responsibilities:**
  - Design API contract and response formats
  - Define authentication and authorization requirements
  - Review and refactor generated code for maintainability
  - Test complex scenarios and error conditions
- **AI Agent Responsibilities:**
  - Generate standard CRUD endpoint implementations
  - Create request/response validation schemas
  - Implement standard middleware patterns
- **Learning Objectives:**
  - Understand API design principles
  - Practice code review and refactoring skills
  - Learn authentication/authorization patterns

### 🎨 U3.0 User Interface Development (Epic)

**U3.1** - Create main [FeatureName] component architecture
- **ID:** U3.1
- **Type:** Story
- **Priority:** High
- **Story Points:** 8
- **Execution Mode:** 👨‍💻 Human Developer
- **Skills Required:** React/Vue, Component Design, UX
- **Dependencies:** C2.2
- **Human Responsibilities:**
  - Design component hierarchy and data flow
  - Implement complex user interactions and state management
  - Handle accessibility requirements and keyboard navigation
  - Optimize rendering performance and user experience
- **AI Agent Responsibilities:**
  - Generate basic component boilerplate
  - Create standard form validation utilities
  - Generate CSS/styling templates
- **Learning Objectives:**
  - Practice component architecture design
  - Develop state management skills
  - Learn accessibility best practices
  - Understand performance optimization techniques
- **Acceptance Criteria:**
  - [ ] Component follows established design patterns
  - [ ] All user interactions work intuitively
  - [ ] Accessible to users with disabilities
  - [ ] Responsive across different screen sizes

**U3.2** - Implement form validation and error handling
- **ID:** U3.2
- **Type:** Task
- **Priority:** Medium
- **Story Points:** 3
- **Execution Mode:** 🤝 Collaborative
- **Skills Required:** Form Validation, UX
- **Dependencies:** U3.1
- **Human Responsibilities:**
  - Design validation rules and user feedback strategy
  - Implement complex cross-field validation logic
  - Design error message UX and recovery flows
- **AI Agent Responsibilities:**
  - Generate standard validation functions
  - Create error message components
  - Implement basic field-level validation

### 🔗 I4.0 Integration & External Services (Estimated: [X hours])
- [ ] I4.1 Integrate with [external service/API]
- [ ] I4.2 Set up data synchronization with [existing system]
- [ ] I4.3 Implement error handling for external service failures

### 🧪 T5.0 Testing & Quality Assurance (Epic)

**T5.1** - Design and implement comprehensive test strategy
- **ID:** T5.1
- **Type:** Story
- **Priority:** High
- **Story Points:** 6
- **Execution Mode:** 👨‍💻 Human Developer
- **Skills Required:** Testing Strategy, Test Design
- **Dependencies:** C2.1, U3.1
- **Human Responsibilities:**
  - Design test cases for complex business logic
  - Create integration test scenarios
  - Define edge cases and error conditions to test
  - Review and improve AI-generated tests
- **AI Agent Responsibilities:**
  - Generate basic unit test templates
  - Create mock data and fixtures
  - Generate standard test utilities
- **Learning Objectives:**
  - Practice test-driven development principles
  - Learn to design comprehensive test coverage
  - Understand testing best practices and patterns
- **Acceptance Criteria:**
  - [ ] Test strategy covers all critical business logic
  - [ ] Edge cases and error conditions are tested
  - [ ] Integration tests verify end-to-end functionality
  - [ ] Test coverage meets project standards (>90%)

**T5.2** - Write unit tests for service layer
- **ID:** T5.2
- **Type:** Task
- **Priority:** Medium
- **Story Points:** 4
- **Execution Mode:** 🤖 AI Agent (with Human Review)
- **Skills Required:** Unit Testing, Mocking
- **Dependencies:** T5.1, C2.1
- **Human Responsibilities:**
  - Review generated tests for completeness
  - Add tests for complex edge cases
  - Ensure tests are meaningful and maintainable
- **AI Agent Responsibilities:**
  - Generate standard unit tests for CRUD operations
  - Create mock objects and test data
  - Implement basic assertion patterns

## AI-Human Collaboration Guidelines

### 👨‍💻 Always Human-Led Tasks (Critical for Skill Development)
- **System Architecture:** Overall design and component relationships
- **Complex Business Logic:** Algorithms, decision trees, edge case handling
- **Performance Optimization:** Identifying bottlenecks and optimization strategies
- **Security Implementation:** Authentication, authorization, data protection
- **Code Review & Refactoring:** Improving AI-generated code quality
- **Integration Problem Solving:** Connecting disparate systems and handling conflicts
- **User Experience Design:** Complex interactions and accessibility

### 🤖 AI Agent Optimal Tasks (Efficiency Focus)
- **Boilerplate Generation:** Standard CRUD operations, basic components
- **Test Template Creation:** Standard unit test patterns and mock data
- **Documentation Generation:** API docs, code comments, README files
- **Configuration Files:** Standard setup files, environment configurations
- **Data Validation:** Standard form validation and input sanitization
- **CSS/Styling:** Basic responsive layouts and standard component styling

### 🤝 Collaborative Tasks (Best of Both)
- **Database Design:** Human designs schema, AI generates migration scripts
- **API Development:** Human defines contracts, AI implements standard patterns
- **Component Development:** Human architects, AI generates boilerplate, human refines
- **Testing:** Human designs test cases, AI generates test code, human reviews

### Developer Growth Checkpoints
Include these in sprint reviews:
- **Architecture Decisions:** Did developer make key design choices?
- **Problem Solving:** Did developer handle complex edge cases?
- **Code Quality:** Did developer improve AI-generated code?
- **Learning Goals:** Did developer gain new skills from human-led tasks?

### 📚 D6.0 Documentation & Deployment (Estimated: [X hours])
- [ ] D6.1 Update API documentation with new endpoints
- [ ] D6.2 Add feature documentation for end users
- [ ] D6.3 Update deployment scripts if needed
- [ ] D6.4 Add feature flags/toggles for gradual rollout

## Acceptance Criteria Mapping
*(Links tasks back to PRD functional requirements)*

| PRD Requirement | Related Tasks | Acceptance Criteria |
|----------------|---------------|-------------------|
| FR-1: [Requirement text] | C2.1, U3.1 | [Specific testable criteria] |
| FR-2: [Requirement text] | C2.2, T5.4 | [Specific testable criteria] |

## Standardized Task Metadata Schema

All generated tasks should adhere to the following machine-readable JSON schema for consistent metadata and easier integration with external tools. This schema is used for both feature and refactoring tasks.

### Task Metadata Template
```json
{
  "id": "S1.1",
  "title": "Create database migration for [specific schema changes]",
  "type": "Task", // e.g., "Task", "Story", "Bug"
  "epic": "S1.0", // Reference to the parent epic ID
  "priority": "High", // e.g., "High", "Medium", "Low"
  "storyPoints": 3, // Estimated effort
  "executionMode": "collaborative", // "human", "ai-agent", "collaborative"
  "skillsRequired": ["Database", "SQL"], // Array of skills
  "humanResponsibilities": [
    "Design database schema and relationships",
    "Define constraints and indexing strategy",
    "Review generated migration for optimization"
  ],
  "aiAgentResponsibilities": [
    "Generate migration SQL from schema design",
    "Create rollback scripts",
    "Generate basic CRUD queries"
  ],
  "learningObjectives": [
    "Practice database design principles",
    "Understand migration best practices"
  ],
  "dependencies": [], // Array of task IDs this task depends on
  "blockedBy": [], // Array of task IDs that block this task
  "blocks": ["S1.2"], // Array of task IDs this task blocks
  "assigneeSuggestion": "Backend Developer", // Suggested assignee role
  "acceptanceCriteria": [
    "Migration script creates required tables/columns",
    "Migration can be rolled back safely",
    "All constraints and indexes are properly defined"
  ],
  "definitionOfReady": "PRD approved, database schema reviewed", // Criteria for starting the task
  "labels": ["backend", "database", "setup"], // Array of labels
  "estimatedHours": 6 // Estimated hours for completion
}
```

### Epic Structure
- **Epic S1.0:** Setup & Infrastructure
- **Epic C2.0:** Core Feature Implementation
- **Epic U3.0:** User Interface Development
- **Epic I4.0:** Integration & External Services
- **Epic T5.0:** Testing & Quality Assurance
- **Epic D6.0:** Documentation & Deployment

### Dependency Chain Visualization
```
S1.1 → S1.2 → C2.1 → C2.2
       S1.3 → C2.2 → U3.1
              I4.1 → T5.3
```

## Instructions for AI: Applying Standardized Metadata

When generating tasks, ensure each task's metadata strictly adheres to the `Task Metadata Template` provided above. This consistency is crucial for automated processing and tracking.

## Risk Assessment & Mitigation

### High Risk Tasks
- [ ] **[Task ID]**: [Risk description] → *Mitigation: [strategy]*
- [ ] **[Task ID]**: [Risk description] → *Mitigation: [strategy]*

### Dependencies & Blockers
- **[Task ID]** depends on **[Other Task ID]** completion
- **[External dependency]** required before starting **[Task ID]**

## Definition of Done Checklist
*(Apply to each task before marking complete)*

- [ ] Code follows project style guidelines and conventions
- [ ] Unit tests written and passing (minimum 80% coverage)
- [ ] Integration tests pass
- [ ] Code reviewed by peer
- [ ] Documentation updated
- [ ] Accessibility requirements met
- [ ] Performance benchmarks met
- [ ] Security considerations addressed
- [ ] Feature flag/toggle implemented if applicable

## Interaction Model

### Phase 1: High-Level Planning
1. Present task categories with complexity estimates
2. Show file structure and project integration points
3. Highlight any risks or dependencies identified
4. Wait for user confirmation with "Go" or feedback

### Phase 2: Detailed Breakdown
1. Generate comprehensive sub-tasks for each category
2. Add specific acceptance criteria and testing requirements
3. Include time estimates and risk assessments
4. Create final document with all implementation details

## Quality Validation Checklist

Before finalizing task list, verify:
- [ ] All PRD functional requirements are covered by tasks
- [ ] Tasks are properly sequenced with clear dependencies
- [ ] Testing coverage is comprehensive (unit, integration, e2e)
- [ ] File paths follow existing project conventions
- [ ] Acceptance criteria map back to PRD requirements
- [ ] Risk assessment identifies potential blockers
- [ ] Time estimates are realistic based on complexity
- [ ] Documentation and deployment tasks are included

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[prd-file-name].md`
- **Naming Convention:** Match input PRD file (e.g., `prd-user-auth.md` → `tasks-prd-user-auth.md`)

## How to Invoke This Rule

Users can trigger this rule by typing:
- "Generate tasks from [PRD filename]"
- "Create implementation plan for [PRD filename]"
- "Break down [PRD filename] into development tasks"
- "Convert [PRD filename] to task list"

**File-based triggers:**
- Opening or referencing files with pattern `prd-*.md`
- Creating files with pattern `tasks-*.md`
- Working in `/tasks` directory with implementation planning

## Target Audience & AI-Human Collaboration

**Primary:** Junior to mid-level developers working with AI coding agents
**Secondary:** Project managers tracking progress and senior developers reviewing implementation approach

### Developer Skill Retention Strategy
This task generation explicitly distinguishes between:
- **👨‍💻 Human Developer Tasks:** Critical thinking, architecture decisions, complex problem-solving
- **🤖 AI Agent Tasks:** Boilerplate code, repetitive implementations, basic CRUD operations
- **🤝 Collaborative Tasks:** Human designs/guides, AI implements, human reviews

### Skill Development Focus Areas
- **Architecture & Design:** Human-led system design and component planning
- **Problem Solving:** Complex business logic and edge case handling
- **Code Review:** Understanding and improving AI-generated code
- **Testing Strategy:** Designing test cases and validation approaches
- **Integration:** Connecting systems and handling real-world complexities

## Error Handling and Ambiguity Resolution

When encountering ambiguity, insufficient information, or conflicting requirements during the task generation process, the AI *must* follow these guidelines:

1.  **Prioritize Clarification:** Always ask clarifying questions to the user. Refer to the "Clarifying Questions Framework" in the related PRD rule (`create-prd.md`) for types of questions.
2.  **One Question at a Time:** Ask questions one at a time, allowing the user to respond fully before proceeding.
3.  **Identify Gaps:** Explicitly state what information is missing or what aspects are unclear regarding task breakdown or dependencies.
4.  **Propose Assumptions (if necessary):** If direct clarification is not immediately possible, propose reasonable assumptions about task scope or dependencies and explicitly state them to the user for confirmation.
5.  **Avoid Proceeding with Ambiguity:** Do not generate tasks based on assumptions without explicit or implicit user confirmation.
6.  **Conflict Resolution:** If conflicting task requirements or dependencies are identified, highlight the conflict to the user and ask for a definitive decision.
7.  **Fallback to High-Level:** If detailed information cannot be obtained, generate a high-level task list and clearly mark sections that require further detail or clarification from the user.
