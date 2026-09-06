# Week 4 - Decisions Log

## Locked Product
Evaluator-facing Proof-of-Skill checkpoint for one synthetic entry-level financial analyst and one completed analytical task.

## Authority Boundary
- Structured evidence -> LLM proposed criterion mappings
- Evaluator -> remaining verification choice
- Deterministic application code -> minutes implication

The LLM does not score, rank, recommend hire/no-hire, recommend a verification step, or calculate time savings.

## Build Status
- Phase 1: Project setup and Zod source validation - complete
- Phase 2: Raw evidence screen - complete
- Phase 3: Live structured OpenAI mapping - complete
- Phase 4: Criterion-level evidence map - complete
- Phase 5: Human verification choice - complete
- Phase 6: Deterministic time calculation - complete
- Phase 7: Final verification decision state - complete
- Phase 8: Mechanical testing and production smoke testing - complete

## Testing
Mechanical tests passed for:
- source packet validation
- locked verification enum
- deterministic minute outputs
- valid LLM mapping
- fabricated evidence-reference rejection
- duplicate criterion rejection
- malformed structured-output rejection
- separation of LLM output from economic calculation

Fallback tested successfully:
AI mapping unavailable — raw evidence remains inspectable.

Production smoke test passed on Vercel.

## Persona Test - First Pass
Evaluator selected:
Brief verification interview.

Primary confusion:
The evaluator could see evidence references in the AI criterion map, but moving from the AI claim to the underlying raw evidence required too much manual searching.

Why it mattered:
The evaluator wanted to independently verify the AI mapping before reducing additional skill verification.

## Persona Fix
Added direct "View evidence" links from criterion mappings to the corresponding:
- source dataset row
- submitted calculation
- candidate conclusion
- provenance item

This preserved the locked authority boundary by making AI-proposed mappings directly auditable by the evaluator.

## Persona Retest
The evaluator again selected:
Brief verification interview.

The evaluator reported that the new evidence links substantially increased confidence because "Supported" became auditable rather than something that had to be trusted at face value.

Remaining lower-priority friction:
- "Gap: None stated" and "Uncertainty: None stated" can feel overly absolute
- technical evidence IDs add little evaluator value
- return navigation from raw evidence to the same criterion could be smoother
- stronger visual highlighting of cited evidence could improve orientation

No additional product-scope expansion was made.

## Current Deployment
Production:
https://proof-of-skill-week4.vercel.app

## Next First Move
Prepare the final persona-test documentation/PDF and submission evidence using the completed production prototype.
