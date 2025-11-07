<!-- @format -->

# Edit Publication Feature Implementation

## Overview

Added edit functionality to the Publication Control component in the result dashboard, allowing administrators to modify publication data including academic year, publish date, time, and publication status.

## Changes Made

### 1. Updated Publication Control Component

- **File**: `/src/components/dashboard/result/PublicationControl.tsx`
- **New Features**:
  - Edit button for each publication entry
  - Edit dialog modal with form fields
  - State management for editing mode
  - Form validation and error handling

### 2. New Functionality

#### Edit Button

- Added "Edit" button next to each publication entry
- Uses Edit3 icon from Lucide React
- Opens edit dialog when clicked

#### Edit Dialog

- **Academic Year**: Editable text input field
- **Publish Date & Time**: DateTime-local input for precise date/time selection
- **Publication Status**: Checkbox to immediately publish (override date/time)
- **Current Info Display**: Shows which publication is being edited in the dialog title

#### Form Handling

- Pre-populates form with existing publication data
- Converts ISO date to datetime-local format for proper display
- Validates required fields before submission
- Updates existing publication via API call

### 3. User Interface Elements

#### Edit Button Layout

```tsx
<Button
	variant="outline"
	size="sm"
	onClick={() => openEditDialog(pub)}
	className="flex items-center gap-1"
>
	<Edit3 className="h-4 w-4" />
	Edit
</Button>
```

#### Edit Dialog Features

- Modal dialog using shadcn/ui Dialog component
- Form fields with proper labels and styling
- Save/Cancel buttons with loading states
- Validation feedback via toast notifications

### 4. State Management

#### New State Variables

```tsx
const [showEditDialog, setShowEditDialog] = useState(false);
const [editingPublication, setEditingPublication] =
	useState<Publication | null>(null);
const [editFormData, setEditFormData] = useState({
	academicYear: "",
	publishDate: "",
	isPublished: false,
});
```

#### Edit Functions

- `openEditDialog(publication)`: Opens edit dialog with pre-filled data
- `handleEditSave()`: Validates and saves changes via API
- Proper date formatting for datetime-local input

### 5. API Integration

- Uses existing `/api/result/publication` POST endpoint
- Handles success/error responses with toast notifications
- Refreshes publication list after successful update

## Usage Flow

1. **View Publications**: Admin sees list of configured publications
2. **Click Edit**: Click "Edit" button next to any publication
3. **Modify Data**: Update academic year, date/time, or publication status
4. **Save Changes**: Click "Update Publication" to save changes
5. **Confirmation**: Success message displayed and list refreshes

## Form Fields

### Academic Year

- Text input field
- Editable format (e.g., "2024-25")
- Required field

### Publish Date & Time

- DateTime-local input type
- Allows precise date and time selection
- Automatically converts from ISO format to local datetime
- Required field

### Publication Status

- Checkbox input
- "Publish immediately (override date/time)"
- When checked, publishes regardless of date/time setting

## Error Handling

- Form validation for required fields
- API error handling with user-friendly messages
- Loading states during save operation
- Toast notifications for success/error feedback

## Security & Validation

- Requires authentication (existing middleware)
- Form validation on client and server side
- Proper error handling and user feedback
- Maintains data integrity during updates
