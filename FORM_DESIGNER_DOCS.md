# Form Designer System Documentation

## Overview

The Form Designer system is a comprehensive drag-and-drop form builder that allows users to create custom registration forms for events, save them as templates, and manage form templates centrally.

## Features

### 1. Form Designer (Setup > Form Designer Tab)

The main form management interface with a table view displaying all created forms.

**Features:**

- **Table View** with searchable and filterable form list
- **Columns:**
  - Form Name: Display name of the form
  - Event Name: Associated event
  - Form Link: Shareable link with copy icon (/form/:formId)
  - Created By: User who created the form with date/time
  - Status: Draft, Saved, or Published
  - Actions: Edit and Delete buttons

**Operations:**

- **Add Form:** Opens dialog to create new form
- **Edit Form:** Opens form editor
- **Delete Form:** Remove form with confirmation
- **Copy Link:** Copy form sharing link to clipboard
- **Filter/Search:** Find forms by name or filter by status

### 2. Create New Form Dialog

Step-by-step wizard for creating new forms.

**Step 1: Basic Information**

- Form Name: Enter name for the form
- Choose Event: Select event from dropdown
- Displays available event fields when selected

**Step 2: Summary**

- Review form details
- Confirm and proceed to editor

### 3. Form Editor - Visual Form Designer

The main editing interface with three panels:

#### Left Panel - Elements Library

Drag elements onto canvas:

- **Header:** For form titles/headings
- **Image:** Embed images
- **Logo:** Add logo/branding
- **Text:** Static text/labels
- **Field:** Map to event attendee fields

#### Center Panel - Canvas

- 600x800px design canvas
- Drag elements to reposition
- Click elements to select
- Real-time preview

#### Right Panel - Properties

Comprehensive property editor for selected elements:

**Position & Size:**

- X/Y coordinates
- Width/Height
- Resizable via property inputs

**Styling:**

- Text Color (color picker + hex input)
- Background Color
- Font Size
- Font Weight (Normal, Bold, Lighter)
- Font Style (Normal, Italic)
- Text Alignment (Left, Center, Right)
- Border Radius (px)
- Border Width (px)
- Border Color

**Field Mapping (for Field elements):**

- Dropdown to select event fields
- Maps to attendee fields from selected event
- Displays field names from event

**Actions:**

- Duplicate Element
- Delete Element
- Layers Panel (view all elements)

### 4. Form Operations

**Save Draft:**

- Saves current design state
- Updates form status to "draft"
- Can be edited later

**Save Form:**

- Finalizes form design
- Updates form status to "saved"
- Records in Form Designer table

**Save as Template:**

- Opens dialog to name template
- Saves form layout/design
- Available in Form Templates tab

### 5. Form Templates (Setup > Form Templates Tab)

Template management interface for reusable form designs.

**Features:**

- **Grid View:** Cards showing all saved templates
- **Search:** Filter templates by name
- **Template Info:**
  - Template name
  - Description (if available)
  - Element count
  - Creation date
  - Use/Delete buttons

**Operations:**

- **View Details:** Modal showing template elements and metadata
- **Use Template:** Apply template to new form
- **Delete Template:** Remove template (with confirmation)

## Data Structure

### Form Object

```javascript
{
  id: "timestamp_string",
  formName: "string",
  eventId: "string",
  eventName: "string",
  description: "string",
  createdBy: "string",
  createdAt: "ISO_datetime",
  updatedAt: "ISO_datetime",
  status: "draft|saved|published",
  elements: [] // Array of form elements
}
```

### Form Element Object

```javascript
{
  id: "unique_id",
  type: "header|image|logo|text|field",
  content: "string",
  x: number,           // X position in pixels
  y: number,           // Y position in pixels
  width: number,       // Width in pixels
  height: number,      // Height in pixels
  fontSize: number,
  color: "hex_color",
  backgroundColor: "hex_color",
  borderRadius: number,
  fontStyle: "normal|italic",
  fontWeight: "normal|bold|lighter",
  textAlign: "left|center|right",
  borderWidth: number,
  borderColor: "hex_color",
  mappedFieldId: "string" // For field elements - links to event field
}
```

### Form Template Object

```javascript
{
  id: "timestamp_string",
  name: "string",
  formId: "string",
  elements: [], // Array of form elements
  description: "string",
  createdAt: "ISO_datetime"
}
```

## Context Management

### FormContext API

Located in `src/context/FormContext.js`

**Hooks:**

```javascript
const {
  // Forms management
  forms, // Array of all forms
  currentForm, // Currently edited form
  setCurrentForm, // Set active form
  createForm, // Create new form
  updateForm, // Update form metadata
  deleteForm, // Delete form
  getFormById, // Get form by ID

  // Form elements
  formElements, // Object: { formId: [...elements] }
  saveFormElements, // Save elements for a form
  getFormElements, // Get elements for a form

  // Templates
  formTemplates, // Array of all templates
  createTemplate, // Create template from form
  deleteTemplate, // Delete template
  loadTemplate, // Load template into form
} = useForm();
```

## Usage Examples

### Creating a Form

```javascript
import { useForm } from "../context/FormContext";

function MyComponent() {
  const { createForm } = useForm();

  const handleCreateForm = () => {
    const newForm = createForm({
      formName: "Registration",
      eventId: "event123",
      eventName: "Tech Summit 2024",
      description: "Online event registration",
      createdBy: "admin",
    });
    // Redirects to form editor
  };
}
```

### Adding Elements

```javascript
const [elements, setElements] = useState([]);

const addElement = (type) => {
  const newElement = {
    id: Date.now().toString(),
    type: type,
    content: "New " + type,
    x: 10,
    y: 10,
    width: 200,
    height: 40,
    // ... other properties
  };
  setElements([...elements, newElement]);
};
```

### Saving Template

```javascript
const { createTemplate } = useForm();

const saveAsTemplate = (formId) => {
  const template = createTemplate(formId, "My Template");
  // Template is now available in Form Templates
};
```

## Local Storage

All forms and templates are stored in browser localStorage:

- `app_forms` - All form definitions
- `app_form_templates` - All saved templates
- `form_elements` - Elements for each form (keyed by formId)

## File Structure

```
src/
├── context/
│   └── FormContext.js          # Form state management
├── pages/
│   ├── FormDesignerPage.js     # Main form management table
│   └── FormTemplatePage.js     # Template management
├── components/
│   └── forms/
│       ├── AddFormModal.js     # Create form wizard
│       └── FormEditor.js       # Visual editor with canvas
└── App.js                       # FormProvider wrapper
```

## Keyboard Shortcuts

- **Delete:** Remove selected element
- **Escape:** Deselect element
- **Drag:** Move element on canvas

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Notes

- Canvas rendering optimized for up to 50 elements
- Debounced updates while dragging
- Efficient re-renders via React Context
- Local storage with 5MB limit

## Future Enhancements

- [ ] Undo/Redo functionality
- [ ] Element groups/layers
- [ ] Template preview/thumbnail
- [ ] Form versioning
- [ ] Conditional field logic
- [ ] Export to PDF
- [ ] Form submissions tracking
