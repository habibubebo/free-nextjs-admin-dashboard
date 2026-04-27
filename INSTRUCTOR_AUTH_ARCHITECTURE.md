# Instructor Authentication System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Instructor Authentication System          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         Frontend                              │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────┐      ┌──────────────────────────┐   │
│  │  Login Page         │      │  Dashboard / Profile     │   │
│  │  /instructor-login  │─────▶│  /instructor-dashboard   │   │
│  │                     │      │                          │   │
│  │ • Email input       │      │ • Profile info display   │   │
│  │ • Password input    │      │ • Change password modal  │   │
│  │ • Error handling    │      │ • Logout button          │   │
│  └─────────────────────┘      └──────────────────────────┘   │
│           │                              │                    │
│           │ loginInstructor()            │ getCurrentSession()│
│           │                              │                    │
└───────────┼──────────────────────────────┼────────────────────┘
            │                              │
            ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Server Actions (Backend)                   │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  authActions.ts                                               │
│  ├─ loginInstructor(email, password)                         │
│  │  └─ Hash password → Query DB → Create session             │
│  │                                                             │
│  ├─ logoutInstructor()                                        │
│  │  └─ Delete session cookie                                 │
│  │                                                             │
│  ├─ getCurrentSession()                                       │
│  │  └─ Read session from cookie                              │
│  │                                                             │
│  ├─ updateInstructorPassword(id, newPassword)                │
│  │  └─ Hash new password → Update DB                         │
│  │                                                             │
│  └─ checkEmailExists(email)                                  │
│     └─ Query DB for email uniqueness                         │
│                                                                │
│  instructorActions.ts (Updated)                              │
│  ├─ addInstructor(data)                                      │
│  │  └─ Hash password → Insert into DB                        │
│  │                                                             │
│  ├─ updateInstructor(id, data)                               │
│  │  └─ Hash password if provided → Update DB                 │
│  │                                                             │
│  └─ deleteInstructor(id)                                     │
│     └─ Delete from DB                                        │
│                                                                │
└──────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│                      Database Layer                           │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  instruktur table                                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Id (PK)                                              │    │
│  │ NamaInstruktur                                       │    │
│  │ Kelamin                                              │    │
│  │ Tempatlahir                                          │    │
│  │ Tanggallahir                                         │    │
│  │ Namaibu                                              │    │
│  │ Alamat                                               │    │
│  │ Email (UNIQUE)                                       │    │
│  │ Password (SHA256 hashed)  ◄── NEW COLUMN            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Login Flow
```
User enters email & password
         │
         ▼
┌─────────────────────────────┐
│ loginInstructor()           │
│ (Server Action)             │
└─────────────────────────────┘
         │
         ├─ Hash password (SHA256)
         │
         ├─ Query: SELECT * FROM instruktur 
         │         WHERE Email = ? AND Password = ?
         │
         ▼
    ┌─────────────┐
    │ Found?      │
    └─────────────┘
      │         │
     YES       NO
      │         │
      ▼         ▼
   Create    Return error
   Session   "Email atau
   Cookie    password salah"
      │         │
      ▼         ▼
   Redirect  Show error
   to        message
   Dashboard
```

### Session Management
```
┌─────────────────────────────────────────┐
│         HTTP-Only Cookie                │
├─────────────────────────────────────────┤
│ Name: instructor_session                │
│ Value: {                                │
│   id: number,                           │
│   name: string,                         │
│   email: string,                        │
│   gender: string,                       │
│   birthPlace: string,                   │
│   birthDate: string,                    │
│   motherName: string,                   │
│   address: string                       │
│ }                                       │
│                                         │
│ Secure: true (production)               │
│ HttpOnly: true                          │
│ SameSite: lax                           │
│ MaxAge: 7 days                          │
└─────────────────────────────────────────┘
```

## Route Protection

### Middleware Flow
```
Request to /instructor-dashboard
         │
         ▼
┌─────────────────────────────┐
│ middleware.ts               │
│ Check route                 │
└─────────────────────────────┘
         │
         ├─ Is /instructor-dashboard?
         │  └─ Check for session cookie
         │     ├─ Found? → Allow access
         │     └─ Not found? → Redirect to /instructor-login
         │
         └─ Is /instructor-login?
            └─ Check for session cookie
               ├─ Found? → Redirect to /instructor-dashboard
               └─ Not found? → Allow access
```

## Admin Management Flow

### Add Instructor
```
Admin fills form
     │
     ├─ Name
     ├─ Gender
     ├─ Birth info
     ├─ Mother's name
     ├─ Address
     ├─ Email (must be unique)
     └─ Password (required)
     │
     ▼
addInstructor()
     │
     ├─ Hash password
     ├─ INSERT into instruktur table
     └─ Revalidate cache
     │
     ▼
Success message
```

### Edit Instructor
```
Admin fills form
     │
     ├─ All fields optional
     ├─ Password field:
     │  ├─ Empty? → Keep current password
     │  └─ Filled? → Hash and update
     │
     ▼
updateInstructor()
     │
     ├─ If password provided:
     │  └─ Hash password
     │
     ├─ UPDATE instruktur table
     └─ Revalidate cache
     │
     ▼
Success message
```

## Password Security

### Hashing Algorithm
```
Plain Password: "MyPassword123"
         │
         ▼
    SHA256 Hash
         │
         ▼
Hashed: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
         │
         ▼
    Store in DB
```

### Login Verification
```
User enters: "MyPassword123"
         │
         ▼
    Hash with SHA256
         │
         ▼
Hashed: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
         │
         ▼
Compare with DB hash
         │
    ┌────┴────┐
    │          │
   Match    No Match
    │          │
    ▼          ▼
  Login    Error
  Success  Message
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Interface                           │
│              /admin/instructors                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Instructor List                                      │   │
│  │ ┌─────────────────────────────────────────────────┐  │   │
│  │ │ Name │ Gender │ Birth │ Email │ Actions        │  │   │
│  │ ├─────────────────────────────────────────────────┤  │   │
│  │ │ John │ M      │ ...   │ ...   │ [Edit] [Delete]│  │   │
│  │ └─────────────────────────────────────────────────┘  │   │
│  │                                                        │   │
│  │ [Add Instructor]                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           ├─ Click Edit                                      │
│           │      │                                           │
│           │      ▼                                           │
│           │  ┌──────────────────────────────────────┐       │
│           │  │ Edit Instructor Modal               │       │
│           │  ├──────────────────────────────────────┤       │
│           │  │ Name: [John]                         │       │
│           │  │ Email: [john@email.com]              │       │
│           │  │ Password: [••••••] (optional)        │       │
│           │  │ [Cancel] [Save]                      │       │
│           │  └──────────────────────────────────────┘       │
│           │      │                                           │
│           │      └─ updateInstructor()                       │
│           │           │                                      │
│           │           ▼                                      │
│           │      Database Update                            │
│           │                                                  │
│           └─ Click Add                                       │
│                  │                                           │
│                  ▼                                           │
│           ┌──────────────────────────────────────┐          │
│           │ Add Instructor Modal                │          │
│           ├──────────────────────────────────────┤          │
│           │ Name: [_____]                        │          │
│           │ Email: [_____]                       │          │
│           │ Password: [_____] (required)         │          │
│           │ [Cancel] [Save]                      │          │
│           └──────────────────────────────────────┘          │
│                  │                                           │
│                  └─ addInstructor()                          │
│                       │                                      │
│                       ▼                                      │
│                  Database Insert                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Instructor Interface                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /instructor-login                                    │   │
│  │                                                      │   │
│  │ Email: [john@email.com]                             │   │
│  │ Password: [••••••]                                  │   │
│  │ [Login]                                             │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                   │
│           └─ loginInstructor()                               │
│                │                                             │
│                ▼                                             │
│           ┌──────────────────────────────────────┐          │
│           │ /instructor-dashboard                │          │
│           ├──────────────────────────────────────┤          │
│           │ Profile Information                 │          │
│           │ ┌────────────────────────────────┐  │          │
│           │ │ Name: John                     │  │          │
│           │ │ Email: john@email.com          │  │          │
│           │ │ Gender: Laki-laki              │  │          │
│           │ │ Birth: Jakarta, 1990-01-01     │  │          │
│           │ │ Mother: Jane                   │  │          │
│           │ │ Address: Jl. Merdeka           │  │          │
│           │ └────────────────────────────────┘  │          │
│           │                                      │          │
│           │ [Ubah Password] [Logout]             │          │
│           └──────────────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React/Next.js (Client Components) |
| Backend | Next.js Server Actions |
| Database | MySQL |
| Authentication | Session Cookies (HTTP-Only) |
| Password Hashing | SHA256 (Node.js crypto) |
| Route Protection | Next.js Middleware |
| State Management | React useState |
| Styling | Tailwind CSS |

## Security Considerations

1. **Password Storage**
   - Passwords are hashed using SHA256
   - Never stored in plain text
   - Unique email constraint prevents duplicates

2. **Session Security**
   - HTTP-only cookies prevent XSS attacks
   - Secure flag enabled in production
   - SameSite policy prevents CSRF
   - 7-day expiration for automatic logout

3. **Route Protection**
   - Middleware checks for valid session
   - Automatic redirect to login if expired
   - Protected routes cannot be accessed without session

4. **Input Validation**
   - Email format validation
   - Password length requirements
   - SQL injection prevention via parameterized queries

## Future Enhancements

- [ ] Email verification for new accounts
- [ ] Password reset via email
- [ ] Two-factor authentication
- [ ] Login history and audit logs
- [ ] Account lockout after failed attempts
- [ ] Password strength meter
- [ ] Session management dashboard
- [ ] Remember me functionality
- [ ] OAuth/SSO integration
