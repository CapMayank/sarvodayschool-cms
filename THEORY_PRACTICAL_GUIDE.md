<!-- @format -->

# Theory + Practical Marking System for Classes 9-12

## Overview

This implementation adds support for **theory and practical components** for classes 9th to 12th in the result management system. Classes Nursery to 8th continue to use the traditional single-mark system.

## Key Features

### For Classes 9th-12th:

- Each subject is divided into **Theory** and **Practical** components
- Students must pass **ALL THREE** criteria:
  1. **Theory Component**: ≥33% of theory max marks
  2. **Practical Component**: ≥33% of practical max marks
  3. **Total Subject**: ≥33% of (theory + practical) combined marks

### For Classes Nursery-8th:

- Traditional system remains unchanged
- Single marks entry with overall 33% passing criteria

## Database Schema Changes

### Subject Model

```typescript
// New fields for theory/practical support
theoryMaxMarks: number // Theory component max marks
	? practicalMaxMarks
	: number // Practical component max marks
	? theoryPassingMarks
	: number // 33% of theory max
	? practicalPassingMarks
	: number // 33% of practical max
	? hasPractical
	: boolean; // True for classes 9-12
```

### SubjectMark Model

```typescript
// Traditional field (for Nursery-8th)
marksObtained: number          // Total marks for traditional subjects

// New fields for theory/practical (9th-12th)
theoryMarks: number?           // Theory marks obtained
practicalMarks: number?        // Practical marks obtained
isTheoryPassed: boolean?       // Theory pass status
isPracticalPassed: boolean?    // Practical pass status
```

## API Changes

### Subject Creation (POST /api/result/classes/[id]/subjects)

```json
{
	"name": "Mathematics",
	"code": "MATH",
	"theoryMaxMarks": 80, // For classes 9-12
	"practicalMaxMarks": 20 // For classes 9-12
}
```

For classes 9-12, the system automatically:

- Sets `hasPractical = true`
- Calculates `theoryPassingMarks = 33% of theoryMaxMarks`
- Calculates `practicalPassingMarks = 33% of practicalMaxMarks`
- Sets `maxMarks = theoryMaxMarks + practicalMaxMarks`

### Marks Entry (POST /api/result/marks)

```json
{
	"studentId": 123,
	"academicYear": "2024-25",
	"marks": [
		{
			"subjectId": 1,
			"theoryMarks": 65, // For classes 9-12
			"practicalMarks": 18 // For classes 9-12
		},
		{
			"subjectId": 2,
			"marksObtained": 75 // For classes Nursery-8th
		}
	]
}
```

## Passing Logic

### Classes 9-12 (Theory + Practical)

Example: Mathematics with Theory(80) + Practical(20) = 100 total

**Passing Requirements:**

- Theory: ≥33% of 80 = ≥27 marks
- Practical: ≥33% of 20 = ≥7 marks
- Total: ≥33% of 100 = ≥33 marks

**Example Scenarios:**

```
Student A: Theory=65, Practical=18, Total=83
✅ Theory: 65≥27 ✅ Practical: 18≥7 ✅ Total: 83≥33 → PASS

Student B: Theory=25, Practical=18, Total=43
❌ Theory: 25<27 ✅ Practical: 18≥7 ✅ Total: 43≥33 → FAIL (Theory failed)

Student C: Theory=40, Practical=5, Total=45
✅ Theory: 40≥27 ❌ Practical: 5<7 ✅ Total: 45≥33 → FAIL (Practical failed)
```

### Classes Nursery-8th (Traditional)

Standard ≥33% of total marks required.

## UI Components

### Class Management

- Shows theory/practical info for classes 9-12
- Auto-calculates passing marks
- Displays subject breakdown in class view

### Marks Entry

- Conditional UI based on class type
- Separate theory/practical input fields for 9-12
- Real-time pass/fail status indication

## Implementation Files Modified

1. **Database Schema**: `prisma/schema.prisma`
2. **API Routes**:
   - `src/app/api/result/classes/[id]/subjects/route.ts`
   - `src/app/api/result/marks/route.ts`
3. **Components**:
   - `src/components/dashboard/result/ClassManagement.tsx`
4. **Migration**: `prisma/migrations/20251107042246_add_theory_practical_support_for_classes_9_12/`

## Usage Examples

### Creating a Class 10th Subject

1. Go to Dashboard → Result Management → Class Management
2. Create/select "10th" class
3. Add subject with theory/practical breakdown
4. System automatically handles all calculations

### Entering Marks for Class 10th

1. Navigate to Marks Management
2. Select Class 10th student
3. Enter theory and practical marks separately
4. System validates all three pass criteria automatically

This implementation ensures backward compatibility while adding the robust theory/practical system required for higher classes.
