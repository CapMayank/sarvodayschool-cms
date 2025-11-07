<!-- @format -->

# Dynamic Result Page Implementation

## Overview

The public result page has been updated to dynamically display result publication information from the `ResultPublication` database table.

## Changes Made

### 1. Created Public API Endpoint

- **File**: `/src/app/api/result/publication/public/route.ts`
- **Purpose**: Provides a public endpoint to fetch published result information without authentication
- **Endpoint**: `GET /api/result/publication/public`
- **Returns**: The latest published result publication data

### 2. Updated Result Page Component

- **File**: `/src/app/(public)/result/page.tsx`
- **Changes**:
  - Added state management for published result data
  - Implemented data fetching from the new public API endpoint
  - Added dynamic countdown timer based on publication date
  - Conditional rendering based on publication status

## Features

### Dynamic Content Display

- **When no results are published** (`isPublished: false`):

  - Shows "No results to display"
  - Displays message: "No results have been published yet. Please check back later."
  - No action button available

- **When results are published** (`isPublished: true`):
  - Displays actual session year from database
  - Shows formatted publication date
  - Shows countdown timer until publication date
  - Button changes based on availability:
    - Before publication date: "Results Available Soon" (disabled)
    - After publication date: "Check Result From Here" (active)

### UI Components

- Loading state while fetching data
- Responsive countdown timer
- Conditional button states
- Proper date formatting (DD/MM/YYYY)

## Database Schema

The component uses the `ResultPublication` table:

```prisma
model ResultPublication {
  id              Int       @id @default(autoincrement())
  academicYear    String    @unique
  publishDate     DateTime
  isPublished     Boolean   @default(false)
  publishedBy     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Usage

1. Admins can manage result publications through the dashboard
2. Only one session result can be published at a time (controlled by `isPublished` flag)
3. The public page automatically updates based on the publication status
4. Countdown timer shows time remaining until results become available

## API Response Format

```json
{
	"publication": {
		"id": 1,
		"academicYear": "2024-25",
		"publishDate": "2025-03-15T05:30:00.000Z",
		"isPublished": true,
		"publishedBy": "admin@example.com",
		"createdAt": "2025-01-01T00:00:00.000Z",
		"updatedAt": "2025-01-01T00:00:00.000Z"
	}
}
```

When no results are published, `publication` will be `null`.
