# Design Change Management Process

## Overview
This folder manages all UI/UX changes for the Sam AI project. **CRITICAL**: All design changes must be briefed with data requirements BEFORE any development begins.

## Folder Structure
- `briefs/` - Early briefings focusing on data and schema requirements
- `implementations/` - Full implementation specifications after backend preparation

## Process Flow

### 1. Early Briefing (IMMEDIATE)
When ANY design change is identified:
1. Create brief in `briefs/YYYY-MM-DD-brief-description.md`
2. Focus on data requirements and database impact
3. Define API contract changes needed
4. Get technical review BEFORE any implementation

### 2. Backend Preparation
1. Review brief for database schema impacts
2. Plan and execute schema changes first
3. Update APIs to support new data flows
4. Test all data operations

### 3. Frontend Implementation
1. Lovable team implements using pre-built backend
2. No backend changes during UI work
3. Smooth integration with prepared APIs

## Brief Template

```markdown
# Design Change Brief - [Date] - [Component/Feature]

## Change Overview
Brief description of the proposed UI/UX change

## Data Requirements (CRITICAL)
### New Fields Needed:
- field_name: data_type // Description and usage
- example_field: string // Where this appears in UI

### Modified Fields:
- existing_field: new_requirements // What changes

### Deleted Fields:
- deprecated_field // Why no longer needed

## Database Schema Impact
### New Tables Required:
- table_name: purpose and relationships

### Modified Tables:
- table_name: specific column changes needed

### New Relationships:
- foreign key relationships and constraints

## API Contract Changes
### New Endpoints:
- POST /api/new-endpoint - purpose and payload
- GET /api/modified-endpoint - changed response structure

### Modified Endpoints:
- endpoint: what changes in request/response

### Real-time Events:
- event_name: when triggered and payload structure

## Backend Logic Impact
- Business logic changes required
- Workflow modifications needed
- Integration points affected

## Implementation Priority
- [ ] Critical (blocks current development)
- [ ] High (needed for next release)
- [ ] Medium (future enhancement)  
- [ ] Low (nice to have)

## Dependencies
- Other features that depend on this change
- External integrations affected
- Migration requirements
```

## Success Metrics
- ✅ Zero surprise backend changes during UI implementation
- ✅ All required database fields available when needed
- ✅ APIs ready before frontend development starts
- ✅ Smooth deployment without missing dependencies