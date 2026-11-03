# Student Profile Edit Permission Flow

## Overview
The SuperAdmin can toggle a global setting that controls whether all authenticated users can edit any student profile. This document explains the complete user flow.

---

## How It Works

### 1. SuperAdmin Controls the Setting

**Location:** Settings page (`/superadmin/settings`)

**Access:** Only SuperAdmin role can access

**Steps:**
1. Login as SuperAdmin
2. Click "Manage" dropdown in navigation
3. Click "⚙️ Settings"
4. Toggle the "Allow Everyone to Edit All Profiles" switch
   - **ON (Green)**: All authenticated users can edit any profile
   - **OFF (Gray)**: Users can only edit their own profiles

**Setting is saved to database:** `Settings` collection with key `allowEveryoneToEditStudentProfiles`

---

### 2. User Views Student Profiles

**Location:** Students page (`/students`)

**What Users See Based on Permission:**

#### When Toggle is ON:
- **SuperAdmin**: Sees 3 buttons on each card
  - 🔵 View (blue)
  - 🟡 Edit (amber)
  - 🔴 Delete (red)
  
- **Regular Users** (student/member): Sees 1 button on each card
  - 🔵 View Detail (blue)

- **Not Logged In**: Sees 1 button
  - 🔵 View Detail (blue)

#### When Toggle is OFF:
- **Everyone**: Only sees "View Detail" button

---

### 3. User Clicks "View Detail" Button

**Action:** Navigates to `/students/:id` (StudentDetail page)

**What Happens:**
1. Page loads student information
2. Page checks if user has edit permission by calling `canEditStudent()`

**Permission Logic (`canEditStudent()` function):**
```typescript
✓ SuperAdmin → Always can edit
✓ Admin → Always can edit
✓ Global Toggle ON + User Logged In → Can edit
✓ Profile Owner (name + email + phone match) → Can edit
✗ None of above → Cannot edit
```

---

### 4. Edit Profile Button Appears (If Allowed)

**Location:** Left sidebar of StudentDetail page

**Visibility:**
- Only visible if `canEditStudent()` returns `true`
- Shows green "Edit Profile" button with pencil icon

---

### 5. User Clicks "Edit Profile"

**Action:** Page switches to edit mode

**What Happens:**
1. Form appears with all current student data pre-filled
2. User can update any field:
   - Name, Field of Study, Year, Entry (Batch)
   - Village, School, Phone, Email, Telegram
   - Role, Image URL, Message, Bio
3. Required fields are marked with red asterisk (*)

---

### 6. User Updates Information and Clicks "Save Changes"

**Action:** Form data is submitted to backend

**Backend Processing:**
1. **Backend receives PATCH request** to `/api/students/:id`
2. **Backend checks permission:**
   ```typescript
   ✓ Is SuperAdmin? → Allow
   ✓ Is Owner (userId matches)? → Allow
   ✓ Global setting ON (allowEveryoneToEditStudentProfiles=true)? → Allow
   ✗ None of above? → Block with 403 Forbidden
   ```
3. **If allowed:** Update database and return updated student
4. **If blocked:** Return error message

**Frontend After Save:**
- Success: Shows green success message "Profile updated successfully!"
- Error: Shows red error message
- Page switches back to view mode showing updated information

---

## Code Files Involved

### Frontend:
1. **`frontend/src/pages/SuperAdminSettings.tsx`**
   - SuperAdmin settings page with toggle UI
   - Updates setting via `PUT /api/settings/allowEveryoneToEditStudentProfiles`

2. **`frontend/src/pages/Students.tsx`**
   - Lists all student cards
   - Loads setting via `GET /api/settings`
   - Shows "View Detail" button that navigates to detail page
   - Console logs: `🔧 Settings loaded - Allow everyone to edit: true/false`

3. **`frontend/src/pages/StudentDetail.tsx`**
   - Shows full student information
   - Loads setting via `GET /api/settings`
   - `canEditStudent()` function checks permission
   - Shows "Edit Profile" button if allowed
   - Handles form submission via `PATCH /api/students/:id`

### Backend:
1. **`backend/src/models/Settings.ts`**
   - MongoDB model for storing system settings
   - Key-value storage with timestamps

2. **`backend/src/routes/settings.ts`**
   - `GET /api/settings` - Returns all settings as object (public)
   - `PUT /api/settings/:key` - Updates setting (superadmin only)

3. **`backend/src/routes/students.ts`**
   - `PATCH /api/students/:id` - Updates student profile
   - Checks: isSuperAdmin OR isOwner OR allowEveryoneToEdit=true

---

## Testing the Feature

### Test Case 1: Toggle ON
1. ✅ Login as SuperAdmin
2. ✅ Go to Settings → Toggle ON
3. ✅ Logout
4. ✅ Login as regular student/member
5. ✅ Go to Students page
6. ✅ Click "View Detail" on any student card
7. ✅ Should see "Edit Profile" button in left sidebar
8. ✅ Click "Edit Profile"
9. ✅ Update some fields
10. ✅ Click "Save Changes"
11. ✅ Should see success message and updated data

### Test Case 2: Toggle OFF
1. ✅ Login as SuperAdmin
2. ✅ Go to Settings → Toggle OFF
3. ✅ Logout
4. ✅ Login as regular student/member
5. ✅ Go to Students page
6. ✅ Click "View Detail" on any student card
7. ✅ Should NOT see "Edit Profile" button (unless it's their own profile)

### Test Case 3: SuperAdmin Always Has Access
1. ✅ Login as SuperAdmin
2. ✅ Go to Students page (regardless of toggle state)
3. ✅ Click "View Detail" on any student
4. ✅ Should always see "Edit Profile" button
5. ✅ Should be able to edit and save changes

---

## Security Notes

✅ **Backend validates permission** - Frontend UI is just convenience, real security is on backend

✅ **SuperAdmin retains full control** - Can always edit, regardless of toggle

✅ **Setting is stored in database** - Persists across server restarts

✅ **Real-time updates** - No need to restart application after toggling

---

## Console Debugging

Open browser console (F12) to see:
```
🔧 Settings loaded - Allow everyone to edit: true
```
or
```
🔧 Settings loaded - Allow everyone to edit: false
```

If settings fail to load:
```
⚠️ Failed to load settings: [error details]
```

---

## Summary

**The flow is simple and logical:**

1. 👨‍💼 **SuperAdmin** toggles permission ON/OFF in Settings
2. 👀 **User** views student list and clicks "View Detail" 
3. 📄 **Detail page** loads with student information
4. ✏️ **Edit button** appears if user has permission
5. 📝 **User** clicks edit, updates fields, saves
6. ✅ **Backend** validates permission and updates database
7. 🎉 **Success** message shows and page displays updated info
