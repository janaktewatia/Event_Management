# Form Designer System Architecture

## Component Hierarchy

```
App.js
├── FormProvider (Context)
│   └── SetupPage
│       ├── Form Designer Tab
│       │   ├── FormDesignerPage
│       │   │   ├── AddFormModal
│       │   │   │   └── EventDataContext (events, fields)
│       │   │   ├── Form Table
│       │   │   │   └── List with filters
│       │   │   └── FormEditor (when editing)
│       │   │       ├── Elements Panel (Left)
│       │   │       ├── Canvas (Center)
│       │   │       │   └── Draggable Elements
│       │   │       └── Properties Panel (Right)
│       │   │           └── Style Controls
│       │   │
│       │   └── Form Templates Tab
│       │       ├── FormTemplatePage
│       │       ├── Template Grid
│       │       ├── Template Details Modal
│       │       └── Search & Filter
│       │
│       ├── Registration Fields Tab (existing)
│       │   └── EventFormDesignerTab
│       │
│       └── Other Setup Tabs...
```

## Data Flow

```
┌─────────────────────────────────────────┐
│         User Interactions                │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │  SetupPage     │
       └────┬────────┬──┘
            │        │
    ┌───────▼──┐  ┌──▼───────┐
    │FormDesigner   FormTemplate
    │   Page      │     Page
    └────┬────────┘  └────┬─────┘
         │                │
    ┌────▼────────────────▼─────┐
    │    FormContext/useForm()   │
    │  ├─ forms[]                │
    │  ├─ formElements{}         │
    │  └─ formTemplates[]        │
    └────┬────────────────┬──────┘
         │                │
    ┌────▼──────┐  ┌─────▼──────┐
    │localStorage   │localStorage  │
    │ (app_forms)   │ (templates)  │
    └─────────────┘  └────────────┘
```

## State Management

### FormContext Provides:

```
useForm() Hook
├─ forms (Array)
│  └─ [{ id, formName, eventId, elements, status, ... }]
├─ formElements (Object)
│  └─ { formId: [{ id, type, x, y, content, ... }] }
├─ formTemplates (Array)
│  └─ [{ id, name, elements, ... }]
├─ currentForm (Object)
│  └─ Currently editing form
└─ Functions
   ├─ createForm(data)
   ├─ updateForm(id, updates)
   ├─ deleteForm(id)
   ├─ saveFormElements(formId, elements)
   ├─ getFormElements(formId)
   ├─ createTemplate(formId, name)
   └─ deleteTemplate(templateId)
```

## Component Lifecycle

### Form Creation Flow:

```
1. User clicks "Add Form"
   ↓
2. AddFormModal opens
   ├─ Get events from EventDataContext
   ├─ Get fields for selected event
   ↓
3. User submits modal
   ├─ createForm() called via FormContext
   ├─ Form saved to formElements context
   ├─ localStorage updated
   ↓
4. FormEditor opens automatically
   ├─ Load form data and elements
   ├─ Display canvas with empty state
```

### Form Editing Flow:

```
1. FormEditor displays
   ├─ Canvas with existing elements
   ├─ Elements in layers panel
   ├─ Properties panel empty
   ↓
2. User clicks element
   ├─ Element selected
   ├─ Properties panel updates
   ├─ Visual outline on canvas
   ↓
3. User drags element
   ├─ updateElement() updates state
   ├─ Canvas re-renders
   ├─ Position updated in real-time
   ↓
4. User modifies property
   ├─ onChange triggers updateElement()
   ├─ Element state updates
   ├─ Canvas visuals update
   ↓
5. User saves
   ├─ saveFormElements() called
   ├─ Elements persisted to context
   ├─ localStorage synced
   ├─ Confirmation shown
```

### Template Creation Flow:

```
1. User clicks "Save as Template"
   ├─ Modal opens with name input
   ↓
2. User enters template name
   ├─ createTemplate(formId, name)
   ├─ Creates template object
   ├─ Stores current elements
   ↓
3. Template saved
   ├─ formTemplates context updated
   ├─ localStorage synced
   ├─ Confirmation shown
   ↓
4. Template appears in Form Templates tab
```

## File Organization

```
src/
├── context/
│   └── FormContext.js ..................... State management
│
├── pages/
│   ├── FormDesignerPage.js ............... Main form list/table
│   └── FormTemplatePage.js .............. Template management
│
├── components/
│   ├── forms/
│   │   ├── AddFormModal.js .............. Create form wizard
│   │   ├── FormEditor.js ............... Visual editor
│   │   └── [Other QR form components]
│   └── [Other components]
│
├── services/
│   └── api.js ........................... API calls (future)
│
├── App.js .............................. FormProvider wrapper
├── index.js ............................ Entry point
└── pages/
    └── SetupPage.js ................... Contains all setup tabs
```

## Element Types & Rendering

```
Element Type │ Rendered As    │ Properties         │ Interaction
─────────────┼────────────────┼────────────────────┼─────────────
header       │ <div>          │ Text, Color, Size  │ Movable
image        │ <img>          │ URL, Size, Props   │ Movable
logo         │ <img>          │ URL, Size, Props   │ Movable
text         │ <div/textarea> │ Content, Style     │ Movable
field        │ <input-like>   │ Field mapping      │ Movable
```

## Canvas System

```
Canvas (600x800px)
├─ SVG/DOM Layer
│  ├─ Position (X, Y)
│  ├─ Absolute positioning
│  ├─ Outline on select
│  └─ Drag handlers
├─ Rendering Engine
│  ├─ Element.map() → JSX
│  ├─ CSS styling
│  └─ Event handlers
└─ Interaction Layer
   ├─ Mouse down → Start drag
   ├─ Mouse move → Update position
   └─ Mouse up → Finish drag
```

## Properties Panel Structure

```
Properties Panel (Right 280px)
├─ Selected Element Info
│  ├─ Duplicate button
│  └─ Delete button
├─ Position & Size
│  ├─ X input
│  ├─ Y input
│  ├─ Width input
│  └─ Height input
├─ Colors
│  ├─ Text Color (picker + hex)
│  └─ Background Color (picker + hex)
├─ Typography
│  ├─ Font Size
│  ├─ Font Weight
│  └─ Font Style
├─ Alignment
│  ├─ Left
│  ├─ Center
│  └─ Right
├─ Borders
│  ├─ Border Radius
│  ├─ Border Width
│  └─ Border Color
└─ Content
   ├─ Text Area (for text elements)
   └─ Field Select (for field elements)
```

## Storage Schema

```
LocalStorage

app_forms: [
  {
    id: "timestamp",
    formName: "string",
    eventId: "string",
    eventName: "string",
    description: "string",
    createdBy: "string",
    createdAt: "ISO datetime",
    updatedAt: "ISO datetime",
    status: "draft|saved|published",
    elements: [] // Array of element IDs (stored separately)
  }
]

form_elements: {
  "formId": [
    {
      id: "timestamp",
      type: "header|image|logo|text|field",
      content: "string",
      x: number,
      y: number,
      width: number,
      height: number,
      fontSize: number,
      color: "hex",
      backgroundColor: "hex",
      borderRadius: number,
      fontStyle: "normal|italic",
      fontWeight: "normal|bold|lighter",
      textAlign: "left|center|right",
      borderWidth: number,
      borderColor: "hex",
      mappedFieldId: "string" // For field elements
    }
  ]
}

app_form_templates: [
  {
    id: "timestamp",
    name: "string",
    formId: "string",
    description: "string",
    elements: [], // Array of element objects
    createdAt: "ISO datetime"
  }
]
```

## Event Data Integration

```
EventDataContext provides:
├─ events[]
│  ├─ id/._id
│  ├─ eventName
│  ├─ attendeeFields[] → Used for field mapping
│  │  ├─ fieldId/_id
│  │  ├─ fieldName/label
│  │  ├─ type
│  │  └─ options (for choice fields)
│  └─ categories[]
└─ categories[]

FormDesigner uses:
├─ events → Show in event selector
├─ attendeeFields → Map to field elements
└─ categories → Future use
```

## Performance Considerations

```
Optimization Strategies:
├─ Canvas Rendering
│  ├─ React.memo for elements
│  ├─ useCallback for handlers
│  └─ Debounced drag updates
├─ State Management
│  ├─ Separate form/elements state
│  ├─ Efficient context updates
│  └─ localStorage batching
├─ UI Responsiveness
│  ├─ Lazy load FormEditor
│  ├─ Modal dialog pattern
│  └─ Suspense boundaries
└─ Limits
   ├─ Max 50-100 elements per form
   ├─ Max 100 forms in list
   ├─ 5MB localStorage limit
```

## Error Handling

```
Error Boundaries:
├─ Form validation
│  ├─ Form name required
│  ├─ Event selection required
│  └─ Field validation
├─ State errors
│  ├─ Element not found
│  ├─ Form not found
│  └─ Template not found
├─ Storage errors
│  ├─ localStorage quota exceeded
│  ├─ Corrupt data handling
│  └─ Recovery mechanisms
└─ User feedback
   ├─ Alert dialogs
   ├─ Error messages
   └─ Confirmation prompts
```

---

This architecture provides:
✓ Scalable state management
✓ Modular components
✓ Easy backend integration
✓ Efficient rendering
✓ Good user experience
✓ Maintainable codebase
