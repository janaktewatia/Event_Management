# Form Designer - Integration Notes

## Current Implementation

The Form Designer system uses **browser localStorage** for persistence. Forms and templates are stored locally without backend integration.

## LocalStorage Keys

- `app_forms` - Array of all form objects
- `app_form_templates` - Array of all template objects
- `form_elements` - Object mapping formId to array of elements

## Data Structures

### Creating a Form (POST /api/forms)

```json
{
  "formName": "Registration Form",
  "eventId": "123",
  "eventName": "Tech Summit 2024",
  "description": "Event registration",
  "createdBy": "userId123",
  "status": "draft"
}
```

### Saving Form Elements (PATCH /api/forms/:formId)

```json
{
  "elements": [
    {
      "id": "1234567890",
      "type": "header",
      "content": "Welcome",
      "x": 10,
      "y": 10,
      "width": 200,
      "height": 40,
      "fontSize": 24,
      "color": "#000000",
      "backgroundColor": "#ffffff",
      "borderRadius": 0,
      "fontStyle": "normal",
      "fontWeight": "bold",
      "textAlign": "center",
      "borderWidth": 0,
      "borderColor": "#cccccc"
    },
    {
      "id": "1234567891",
      "type": "field",
      "content": "Name",
      "x": 10,
      "y": 60,
      "width": 200,
      "height": 40,
      "mappedFieldId": "field_name",
      "fontSize": 14,
      "color": "#000000",
      "backgroundColor": "#ffffff",
      "borderRadius": 4,
      "fontStyle": "normal",
      "fontWeight": "normal",
      "textAlign": "left",
      "borderWidth": 1,
      "borderColor": "#cccccc"
    }
  ],
  "status": "saved"
}
```

### Creating a Template (POST /api/form-templates)

```json
{
  "name": "Standard Registration",
  "formId": "form123",
  "description": "Basic registration form with name and email",
  "elements": [...] // Array of form elements
}
```

## Backend Integration Steps

### 1. Install FormProvider Context

Located in `src/context/FormContext.js` - already integrated in App.js

### 2. Create API Service Layer

Add these functions to `src/services/api.js`:

```javascript
// Forms API
export const fetchForms = async () => {
  const response = await fetch("/api/forms");
  return response.json();
};

export const createForm = async (formData) => {
  const response = await fetch("/api/forms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return response.json();
};

export const updateForm = async (formId, updates) => {
  const response = await fetch(`/api/forms/${formId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return response.json();
};

export const deleteForm = async (formId) => {
  const response = await fetch(`/api/forms/${formId}`, {
    method: "DELETE",
  });
  return response.json();
};

// Form Templates API
export const fetchFormTemplates = async () => {
  const response = await fetch("/api/form-templates");
  return response.json();
};

export const createFormTemplate = async (templateData) => {
  const response = await fetch("/api/form-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(templateData),
  });
  return response.json();
};

export const deleteFormTemplate = async (templateId) => {
  const response = await fetch(`/api/form-templates/${templateId}`, {
    method: "DELETE",
  });
  return response.json();
};
```

### 3. Update FormContext.js

Replace localStorage calls with API calls:

```javascript
// Instead of:
// const [forms, setForms] = useLocalStorage("app_forms", []);

// Use:
const [forms, setForms] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await fetchForms();
      setForms(data);
    } catch (error) {
      console.error("Failed to load forms:", error);
    } finally {
      setLoading(false);
    }
  };
  loadForms();
}, []);

const createForm = useCallback(async (formData) => {
  try {
    const newForm = await createFormAPI(formData);
    setForms((prev) => [newForm, ...prev]);
    return newForm;
  } catch (error) {
    console.error("Failed to create form:", error);
    throw error;
  }
}, []);
```

### 4. Database Schema Example (MongoDB)

```javascript
// Forms Collection
{
  _id: ObjectId,
  formName: String,
  eventId: ObjectId,
  eventName: String,
  description: String,
  createdBy: ObjectId,
  status: String, // 'draft', 'saved', 'published'
  elements: Array,
  createdAt: Date,
  updatedAt: Date,
  __v: Number
}

// FormTemplates Collection
{
  _id: ObjectId,
  name: String,
  formId: ObjectId,
  description: String,
  elements: Array,
  createdAt: Date,
  __v: Number
}

// Form Submissions Collection (optional)
{
  _id: ObjectId,
  formId: ObjectId,
  eventId: ObjectId,
  submissionData: Object, // Maps fieldId to submitted values
  submittedAt: Date,
  submittedBy: String, // Email or user identifier
  __v: Number
}
```

## API Endpoints Required

| Method | Endpoint                          | Purpose              |
| ------ | --------------------------------- | -------------------- |
| GET    | `/api/forms`                      | List all forms       |
| POST   | `/api/forms`                      | Create new form      |
| PATCH  | `/api/forms/:formId`              | Update form          |
| DELETE | `/api/forms/:formId`              | Delete form          |
| GET    | `/api/form-templates`             | List all templates   |
| POST   | `/api/form-templates`             | Create template      |
| DELETE | `/api/form-templates/:templateId` | Delete template      |
| POST   | `/api/forms/:formId/submissions`  | Submit form (future) |

## Migration from LocalStorage to Backend

### Phase 1: Add Backend Service Layer

1. Create API functions in `services/api.js`
2. Keep localStorage as fallback
3. Test API calls

### Phase 2: Update Context

1. Replace useLocalStorage with useState + useEffect
2. Implement error handling
3. Add loading states

### Phase 3: Update UI Components

1. Add loading spinners
2. Add error messages
3. Show sync status

### Phase 4: Add Advanced Features

1. Form submission tracking
2. Analytics
3. Versioning
4. Collaboration

## Performance Considerations

**Current (LocalStorage):**

- Fast reads/writes
- No network latency
- 5MB limit
- Works offline

**Backend Benefits:**

- Unlimited storage
- Multi-device sync
- Backup & recovery
- Audit trail
- Team collaboration

**Hybrid Approach:**

- Cache forms locally
- Sync on save
- Background upload
- Conflict resolution

## Security Notes

When implementing backend:

- Validate all form data server-side
- Sanitize element content (prevent XSS)
- Check user permissions for each form
- Audit form modifications
- Rate limit submissions
- Encrypt sensitive field data

## Testing

### Local Testing

```bash
# Test localStorage persistence
localStorage.getItem('app_forms')

# Test form creation
const forms = JSON.parse(localStorage.getItem('app_forms'))
console.log(forms[0])

# Export test data
copy(localStorage.getItem('app_forms'))
```

### API Testing

```bash
# cURL examples
curl http://localhost:5000/api/forms

curl -X POST http://localhost:5000/api/forms \
  -H "Content-Type: application/json" \
  -d '{"formName":"Test","eventId":"123"}'

curl -X PATCH http://localhost:5000/api/forms/formId \
  -H "Content-Type: application/json" \
  -d '{"status":"saved"}'
```

## Error Handling

Implement proper error boundaries:

```javascript
try {
  const form = await createForm(formData);
  setForms((prev) => [form, ...prev]);
} catch (error) {
  if (error.status === 404) {
    // Event not found
  } else if (error.status === 403) {
    // Permission denied
  } else if (error.status === 500) {
    // Server error - use localStorage fallback
  }
}
```

## Future Enhancements

- [ ] Real-time collaboration (WebSockets)
- [ ] Form versioning & rollback
- [ ] Form submissions tracking
- [ ] Analytics dashboard
- [ ] API for programmatic form creation
- [ ] Webhook support
- [ ] Export to PDF/HTML
- [ ] Multi-language support
- [ ] Custom field types
- [ ] Conditional logic builder
