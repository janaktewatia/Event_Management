# QRCodeGenerator + Unified Hub Integration Guide

## Overview
The QRCodeGenerator module is now integrated into the Unified Hub as an **Event Manager** submenu. When users click on "Event Manager" in the sidebar, they'll see all QRCodeGenerator features as expandable sub-menu items.

## Architecture

### Navigation Flow
```
Unified Hub Dashboard
  └─ Sidebar: Modules
      ├─ Event Manager [EXPANDABLE]
      │   ├─ Dashboard
      │   ├─ Create Event
      │   ├─ Registrants
      │   ├─ Scan Pass
      │   ├─ Attendee Data
      │   ├─ Generate QR Code
      │   ├─ Bulk QR Codes
      │   ├─ Setup
      │   ├─ Communication Setup
      │   ├─ Communication Templates
      │   └─ WhatsApp Integration
      ├─ WhatsApp CRM
      ├─ Website Builder
      ├─ Communication
      ├─ Front Office
      ├─ Reports & Analytics
      └─ User Management
```

## Integration Details

### 1. Sidebar Configuration (`app-sidebar.tsx`)

**New Submenu Array:**
```typescript
const eventManagerSubmenu = [
  { title: "Dashboard", slug: "events-dashboard", icon: Grid3x3 },
  { title: "Create Event", slug: "events-create", icon: CalendarRange },
  { title: "Registrants", slug: "events-registrants", icon: UserPlus },
  { title: "Scan Pass", slug: "events-scan", icon: QrCode },
  { title: "Attendee Data", slug: "events-attendees", icon: BarChart4 },
  { title: "Generate QR Code", slug: "events-qr-gen", icon: QrCode },
  { title: "Bulk QR Codes", slug: "events-bulk-qr", icon: Upload },
  { title: "Setup", slug: "events-setup", icon: Settings },
  { title: "Communication Setup", slug: "events-comm-setup", icon: Zap },
  { title: "Communication Templates", slug: "events-comm-templates", icon: MessageCircle },
  { title: "WhatsApp Integration", slug: "events-whatsapp", icon: MessageSquare },
];
```

**Collapsible Component:**
- Event Manager now renders as an expandable/collapsible menu
- When expanded, shows all 11 sub-menu items
- Auto-expands when user navigates to any `events-*` route
- Active indicators show current page

### 2. Route Metadata (`modules.$module.tsx`)

**Added MODULE_META entries:**
```typescript
"events-dashboard": { title: "Dashboard", description: "Event management overview and metrics." },
"events-create": { title: "Create Event", description: "Create a new event and configure details." },
"events-registrants": { title: "Registrants", description: "Manage event registrations and attendees." },
// ... and 8 more entries
```

**Enhanced ModulePage Component:**
- Detects `events-*` modules
- Shows custom message for Event Manager features: "✓ Feature Available"
- Indicates feature is integrated from QRCodeGenerator

### 3. Routing Pattern

**URL Pattern:**
- `/modules/events-dashboard`
- `/modules/events-create`
- `/modules/events-registrants`
- etc.

**Parameters:**
```typescript
// Navigation example
<Link 
  to="/modules/$module" 
  params={{ module: "events-registrants" }}
>
  Registrants
</Link>
```

## Current Status

### ✅ Completed
1. **Sidebar Structure** - Event Manager expandable menu added
2. **Route Configuration** - All 11 QRCodeGenerator features mapped to routes
3. **Metadata** - MODULE_META updated with all descriptions
4. **Module Page** - Enhanced to handle Event Manager modules

### 📋 Next Steps (When Ready)

1. **Component Integration**
   - Copy QRCodeGenerator pages to unified-hub (`/src/routes/modules/`)
   - Adapt styling to match Unified Hub (Radix UI + Tailwind)
   - Create wrapper components for seamless integration

2. **Authentication Sync**
   - Sync user auth between Unified Hub and QRCodeGenerator
   - Pass auth tokens in component initialization
   - Manage permissions consistently

3. **API Integration**
   - QRCodeGenerator uses separate backend at port 5000
   - Unified Hub may have its own backend
   - Ensure API endpoints are accessible and CORS configured

4. **Testing**
   - Test sidebar navigation and expand/collapse
   - Test active states for menu items
   - Test routing to each Event Manager feature
   - Verify component rendering

5. **Build & Deployment**
   ```bash
   cd /Users/edunextion/Desktop/Event\ Management/QRCodeGenerator/unified-hub
   npm run build
   npm run preview
   ```

## File Changes Summary

### Modified Files
1. **`unified-hub/src/components/app-sidebar.tsx`**
   - Added Event Manager submenu array
   - Added new icons (Grid3x3, QrCode, Upload, UserPlus, BarChart4, Zap, MessageCircle)
   - Added Collapsible Event Manager component
   - Event Manager items now render as expandable submenu

2. **`unified-hub/src/routes/modules.$module.tsx`**
   - Added 12 new MODULE_META entries for Event Manager features
   - Enhanced ModulePage component with Event Manager detection
   - Custom UI for Event Manager modules

## User Experience

### For End Users
1. User logs into Unified Hub
2. Sees main dashboard with sidebar menu
3. Clicks "Event Manager" to expand submenu
4. Clicks desired feature (e.g., "Create Event")
5. Navigates to `/modules/events-create`
6. Sees Event Manager feature content

### Sidebar Behavior
- **Collapsed State**: Shows "Event Manager" with calendar icon
- **Expanded State**: Shows all 11 sub-menu items with individual icons
- **Active State**: Current page highlighted in submenu
- **Auto-Expand**: Opens Event Manager menu when on any `events-*` page

## Configuration Reference

### Icons Used
- Dashboard: `Grid3x3`
- Create Event: `CalendarRange`
- Registrants: `UserPlus`
- Scan Pass: `QrCode`
- Attendee Data: `BarChart4`
- Setup: `Settings`
- Communication Setup: `Zap`
- Templates: `MessageCircle`
- WhatsApp: `MessageSquare`

### Colors & Styling
- Uses Unified Hub's Radix UI components
- Tailwind CSS for styling
- Consistent with existing module design
- Dark mode compatible

## Troubleshooting

### Event Manager Menu Not Expanding
- Check browser console for errors
- Verify `Collapsible` component is imported
- Ensure pathname state is updating correctly

### Routes Not Resolving
- Verify MODULE_META has entries for all event manager slugs
- Check TanStack Router configuration
- Ensure link params are correct: `params={{ module: "events-*" }}`

### Styling Issues
- Ensure Radix UI components are installed
- Verify Tailwind CSS is configured
- Check component prop types

## Related Documentation
- [Unified Hub README](./unified-hub/README.md)
- [QRCodeGenerator README](./README.md)
- [Form Designer Docs](./FORM_DESIGNER_DOCS.md)
- [Communication Integration](./COMMUNICATION_INTEGRATION_GUIDE.md)

---

**Last Updated:** 2026-06-18
**Integration Status:** ✅ Navigation Layer Complete
**Next Phase:** Component Integration (Pending)
