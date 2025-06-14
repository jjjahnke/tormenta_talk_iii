# Task Completion and Management

*   [Back to Main Instructions](copilot-instructions.md) #file:copilot-instructions.md
*   [Related: Task List Generation](task-generation.md) #file:task-generation.md

Guidelines for managing task completion in AI-human collaborative development environments, with support for the enhanced task structure and execution modes.

## GitHub Copilot Integration

### Activation Triggers
This rule activates when:
- Working with files matching `tasks-*.md` pattern
- User mentions "complete task", "mark done", or "update progress"
- Task completion indicators are detected in conversation
- User references specific task IDs (e.g., "S1.1", "C2.1")

### Workspace Context
- **Progress Tracking:** Monitor completion status across related files
- **Dependency Management:** Check for blocking tasks before starting new ones
- **File Synchronization:** Ensure task list stays aligned with actual implementation

## Execution Mode-Aware Task Management

### 👨‍💻 Human Developer Tasks
**Pre-Start Protocol:**
1. Verify the developer understands the learning objectives
2. Confirm they have necessary context and requirements
3. Check that dependencies are satisfied
4. Provide guidance on approach, not implementation

**Completion Protocol:**
1. Developer implements the task independently
2. AI reviews code for adherence to acceptance criteria
3. Validate learning objectives were met
4. Mark task complete only after human confirmation
5. Update skill development tracking

### 🤖 AI Agent Tasks
**Pre-Start Protocol:**
1. Confirm task specifications are clear
2. Check for any human input required before starting
3. Verify dependencies and prerequisites

**Completion Protocol:**
1. AI implements the task automatically
2. Generate implementation summary for human review
3. Mark task complete immediately if no issues
4. Flag for human review if any problems encountered

### 🤝 Collaborative Tasks
**Pre-Start Protocol:**
1. Clarify handoff points between human and AI work
2. Confirm human has completed their portion
3. Verify AI responsibilities are well-defined

**Completion Protocol:**
1. Track completion of both human and AI portions
2. Require explicit human approval for final completion
3. Document collaboration effectiveness for future reference

## Enhanced Task Implementation Flow

### Task Selection and Preparation
1. **Dependency Check:** Verify all prerequisite tasks are completed
2. **Execution Mode Identification:** Confirm who (human/AI/both) will work on task
3. **Context Gathering:** Collect all relevant information and requirements
4. **Skill Verification:** For human tasks, confirm developer has necessary skills
5. **Resource Check:** Ensure all required tools, access, and information are available

### During Task Execution
1. **Progress Monitoring:** Track intermediate milestones and blockers
2. **Quality Gates:** Validate work against acceptance criteria at key points
3. **Collaboration Checkpoints:** For collaborative tasks, verify handoffs
4. **Risk Mitigation:** Address any identified risks or blockers promptly
5. **Documentation Updates:** Keep implementation notes current

### Task Completion Protocol

#### Immediate Actions (Per Sub-task)
1. **Validate Acceptance Criteria:** Confirm all criteria are met
2. **Update Task Status:** Change `[ ]` to `[x]` for completed sub-task
3. **Document Implementation:** Add notes about actual implementation approach
4. **Update File List:** Add/modify entries in "Relevant Files" section
5. **Check Dependencies:** Update any tasks that were blocked by this completion

#### Parent Task Completion
1. **Verify All Sub-tasks:** Confirm all child tasks are marked `[x]`
2. **Epic-Level Validation:** Ensure overall goal is achieved
3. **Integration Testing:** Verify task works with existing system
4. **Mark Parent Complete:** Change parent task from `[ ]` to `[x]`
5. **Notify Stakeholders:** Update relevant team members of completion

#### Quality Validation
1. **Code Review:** For human tasks, AI reviews; for AI tasks, human reviews
2. **Testing Verification:** Confirm all tests pass and coverage is adequate
3. **Documentation Check:** Verify all documentation is updated
4. **Security Review:** Validate security considerations are addressed
5. **Performance Check:** Ensure performance requirements are met

## Enhanced Task List Maintenance

### Real-Time Updates
```markdown
## Task Status Summary
- **Total Tasks:** 24
- **Completed:** 8 (33%)
- **In Progress:** 2
- **Blocked:** 1
- **Ready:** 13

## Recent Activity
- ✅ **S1.2** - API route structure completed by AI Agent
- 🔄 **C2.1** - Business logic implementation in progress (Human)
- ⚠️ **U3.1** - Blocked waiting for design review
```

### Dynamic File Tracking
```markdown
## Relevant Files (Auto-Updated)

### Implementation Files
- ✅ `api/routes/feature.ts` - Main API endpoints (Created: 2025-01-15, Last Modified: 2025-01-15)
- ✅ `lib/services/featureService.ts` - Business logic implementation (Created: 2025-01-15)
- 🔄 `components/FeatureComponent.tsx` - Main UI component (In Progress)
- ⏳ `components/FeatureForm.tsx` - Form component (Pending)

### Test Files
- ✅ `api/routes/feature.test.ts` - API endpoint tests (Coverage: 95%)
- 🔄 `lib/services/featureService.test.ts` - Service layer tests (Coverage: 78%)
- ⏳ `components/FeatureComponent.test.tsx` - Component tests (Pending)

### Documentation
- ✅ `docs/api/feature-endpoints.md` - API documentation
- 🔄 `docs/user-guide/feature-usage.md` - User documentation (In Progress)
```

### Dependency Status Tracking
```markdown
## Dependency Status
- **S1.1** ✅ → **S1.2** ✅ → **C2.1** 🔄 → **C2.2** ⏳
- **S1.3** ✅ → **C2.2** ⏳ → **U3.1** ⚠️
- **I4.1** ⏳ → **T5.3** ⏳

### Blocked Tasks
- **U3.1**: Waiting for S1.3 completion and design review
- **T5.3**: Waiting for I4.1 integration completion
```

## AI Instructions for Task Management

### Before Starting Any Task
1. **Validate Current State:**
   ```
   - Check if previous task is truly complete
   - Verify all dependencies are satisfied
   - Confirm execution mode requirements are met
   - Ensure human developer is ready (for human/collaborative tasks)
   ```

2. **Task Preparation:**
   ```
   - Load and review task specifications
   - Gather all relevant context and files
   - Check for any updated requirements or constraints
   - Prepare workspace and tools as needed
   ```

### During Task Execution
1. **Progress Tracking:**
   - Update task status indicators in real-time
   - Document any deviations from planned approach
   - Flag blockers or risks immediately
   - Maintain communication with human developer for collaborative tasks

2. **Quality Assurance:**
   - Validate work against acceptance criteria at each step
   - Run tests and verify functionality continuously
   - Update documentation as implementation progresses
   - Seek human input when encountering ambiguity

### After Task Completion
1. **Immediate Updates:**
   ```markdown
   ✅ Mark sub-task complete: [x]
   📝 Add implementation notes
   📁 Update file listings with actual changes
   🔗 Update dependency chains
   📊 Update progress metrics
   ```

2. **Validation and Handoff:**
   ```
   - Run all relevant tests
   - Verify acceptance criteria are met
   - Document any technical debt or future considerations
   - Prepare summary for human review (AI tasks) or validation (Human tasks)
   - Update skill development tracking (Human tasks)
   ```

3. **Communication Protocol:**
   ```
   For Human Tasks: "Task S1.1 completed by developer. Ready for review and validation."
   For AI Tasks: "Task S1.2 completed by AI. Implementation summary: [details]. Ready to proceed to S1.3?"
   For Collaborative Tasks: "Human portion of C2.1 complete. Ready for AI implementation phase."
   ```

## User Interaction Protocols

### Permission and Approval System
```markdown
**For Human Tasks:**
- "Task C2.1 (business logic) is ready. Do you want to proceed? (y/n)"
- "Review my implementation of C2.1. Approve to mark complete? (y/n/needs-changes)"

**For AI Tasks:**
- "Completed S1.2 (API setup). Continue to next task C2.1? (y/n)"
- "S1.2 implementation ready for review. Proceed automatically? (y/n)"

**For Collaborative Tasks:**
- "Your design for U3.1 is complete. Ready for AI implementation? (y/n)"
- "AI implementation of U3.1 complete. Ready for your review and integration? (y/n)"
```

### Status Reporting
```markdown
**Progress Report Format:**
"🎯 Current Status: Working on C2.1 (Core Business Logic)
✅ Completed: S1.1, S1.2 (Setup complete)
🔄 In Progress: C2.1 (Human: 60% complete)
⏳ Next Up: C2.2 (API endpoints)
⚠️ Blockers: None
📈 Overall Progress: 35% (8/23 tasks complete)"
```

## Integration with Development Workflow

### Git Integration
```markdown
## Commit Strategy
- **Per Sub-task:** Individual commits with clear messages
- **Per Parent Task:** Feature branch merge with task completion summary
- **Epic Completion:** Release candidate with full feature documentation

## Branch Naming
- `task/S1.1-database-migration`
- `task/C2.1-business-logic`
- `feature/user-authentication` (for Epic completion)
```

### Code Review Integration
```markdown
## Review Requirements
- **Human Tasks:** AI provides architectural review and suggestions
- **AI Tasks:** Human reviews for business logic and maintainability
- **Collaborative Tasks:** Cross-validation of both human and AI contributions

## Review Checklist
- [ ] Meets all acceptance criteria
- [ ] Follows project coding standards
- [ ] Includes appropriate tests
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance requirements met
```

## Continuous Improvement

### Retrospective Data Collection
```markdown
## Task Efficiency Metrics
- **Estimation Accuracy:** Planned vs Actual effort
- **Quality Metrics:** Bugs found, rework required
- **Collaboration Effectiveness:** Human-AI handoff smoothness
- **Skill Development:** Learning objectives achieved
```

### Adaptive Task Management
```markdown
## Learning Patterns
- Track which tasks take longer than expected
- Identify common blockers and preparation improvements
- Adjust human/AI task distribution based on effectiveness
- Refine acceptance criteria based on quality outcomes
```

## Final Instructions

1. **Always update task status immediately** after any significant progress
2. **Maintain accurate file listings** with current status and purpose
3. **Respect execution modes** - don't do human work, guide appropriately
4. **Validate dependencies** before starting new tasks
5. **Document everything** - implementation notes, decisions, blockers
6. **Communicate clearly** about status, needs, and next steps
7. **Focus on learning** for human tasks, efficiency for AI tasks
8. **Maintain quality** through appropriate review cycles
