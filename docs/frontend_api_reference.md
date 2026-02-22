# INOVA DML: Frontend API Integration Reference

Complete API documentation for the INOVA DML (Deep Management Layer) backend. This document covers authentication, all endpoints, request/response schemas, workflows, and best practices for frontend integration.

---

## Table of Contents

1. [Base URL & Headers](#1-base-url--headers)
2. [Authentication](#2-authentication)
3. [API Conventions](#3-api-conventions)
4. [Response Formats](#4-response-formats)
5. [Error Handling](#5-error-handling)
6. [Pagination](#6-pagination)
7. [Endpoints Reference](#7-endpoints-reference)
   - [Authentication](#71-authentication)
   - [Organization Structure](#72-organization-structure)
   - [Human Resources](#73-human-resources)
   - [Identity & Access Management](#74-identity--access-management)
   - [Audit Logs](#75-audit-logs)
8. [Data Models](#8-data-models)
9. [Workflows](#9-workflows)
10. [Role-Based Access Control](#10-role-based-access-control)
11. [Common Patterns & Best Practices](#11-common-patterns--best-practices)

---

## 1. Base URL & Headers

### Production URL
```
https://dmlapi.inova.krd/api/v1
```

### Required Headers
| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `application/json` | Required for POST/PUT requests |
| `Authorization` | `Bearer <token>` | Required for all authenticated endpoints |

---

## 2. Authentication

### 2.1 Login

Acquire a JWT token for authenticated requests.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "YourPassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

### 2.2 Token Usage

Include the token in all subsequent requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Token Contents

The JWT token contains the following claims:
- `sub` - User ID (UUID)
- `tenant_id` - Tenant ID for multi-tenancy isolation
- `roles` - Array of role codes (e.g., `["ADMIN", "USER"]`)

> **Important:** The `X-Tenant-ID` header is deprecated. Tenant isolation is enforced automatically via the JWT token.

---

## 3. API Conventions

### 3.1 HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Retrieve resources |
| `POST` | Create new resources |
| `PUT` | Update entire resources (not yet implemented) |
| `PATCH` | Partial updates (not yet implemented) |
| `DELETE` | Remove resources (not yet implemented) |

### 3.2 URL Patterns

```
GET    /api/v1/{resource}           # List resources
GET    /api/v1/{resource}/{id}      # Get single resource
POST   /api/v1/{resource}           # Create resource
GET    /api/v1/{resource}/{id}/{sub} # Get sub-resource
```

### 3.3 Field Naming Convention

All JSON fields use **camelCase**:

```json
{
  "employeeNo": "UK-001",
  "firstName": "John",
  "lastName": "Doe",
  "businessUnitId": "uuid-here"
}
```

---

## 4. Response Formats

### 4.1 Single Resource Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "field1": "value1",
  "field2": "value2"
}
```

### 4.2 Paginated List Response

```json
{
  "data": [
    { "id": "...", "field": "..." },
    { "id": "...", "field": "..." }
  ],
  "metadata": {
    "currentPage": 1,
    "pageSize": 50,
    "totalCount": 150,
    "totalPages": 3
  }
}
```

### 4.3 Timestamps

All timestamps are in ISO 8601 format (UTC):
```
"2024-01-15T10:30:00.123456Z"
```

### 4.4 Nullable Fields

Nullable fields may be `null` or omitted from responses:
```json
{
  "displayName": null,
  "managerId": null
}
```

---

## 5. Error Handling

### 5.1 Standard Error Response

```json
{
  "error": "Descriptive error message"
}
```

### 5.2 Validation Error Response

```json
{
  "error": "Validation failed",
  "details": {
    "email": "Failed validation on 'email' tag",
    "password": "Failed validation on 'min' tag"
  }
}
```

### 5.3 HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (duplicate resource) |
| `500` | Internal server error |

### 5.4 Common Error Messages

| Error | Cause |
|-------|-------|
| `Authorization header required` | Missing Bearer token |
| `Invalid or expired token` | Token is invalid or expired |
| `Forbidden: insufficient permissions` | User lacks required role |
| `Invalid request payload` | Malformed JSON body |
| `A record with this value already exists` | Unique constraint violation |
| `Invalid reference to a related record` | Foreign key not found |

---

## 6. Pagination

### 6.1 Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | int | 1 | - | Page number (1-indexed) |
| `size` | int | 50 | 1000 | Items per page |
| `search` | string | - | - | Search term (optional) |

> **Note:** You can also use `pageSize` as an alias for `size`.

### 6.2 Example Request

```
GET /api/v1/employees?page=2&size=20&search=Smith
```

### 6.3 Pagination Metadata

```json
{
  "metadata": {
    "currentPage": 2,
    "pageSize": 20,
    "totalCount": 150,
    "totalPages": 8
  }
}
```

---

## 7. Endpoints Reference

### 7.1 Authentication

#### POST /api/v1/auth/login

Authenticate user and receive JWT token.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | No |
| **Role Required** | - |

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbG..."
}
```

---

### 7.2 Organization Structure

#### Business Units

##### GET /api/v1/business-units

List all business units with pagination.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | Any authenticated user |

**Query Parameters:**
- `page` (optional) - Page number
- `size` (optional) - Page size
- `search` (optional) - Search by code or name

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "BU-001",
      "name": "Engineering",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": { "currentPage": 1, "pageSize": 50, "totalCount": 10, "totalPages": 1 }
}
```

##### GET /api/v1/business-units/{id}

Get a single business unit by ID.

**Response:**
```json
{
  "id": "uuid",
  "code": "BU-001",
  "name": "Engineering",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

##### POST /api/v1/business-units

Create a new business unit.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "code": "string (required)",
  "name": "string (required)"
}
```

---

#### Departments

##### GET /api/v1/departments

List all departments with pagination.

**Query Parameters:**
- `page`, `size`, `search` (same as business units)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "DEP-001",
      "name": "Software Development",
      "parentDepartmentId": null,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": { "..." }
}
```

##### GET /api/v1/departments/{id}

Get a single department by ID.

##### POST /api/v1/departments

Create a new department.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "code": "string (required)",
  "name": "string (required)",
  "parentDepartmentId": "uuid (optional)"
}
```

---

#### Job Titles

##### GET /api/v1/job-titles

List all job titles with pagination.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "SWE-002",
      "name": "Senior Software Engineer",
      "grade": "GR-6",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": { "..." }
}
```

##### GET /api/v1/job-titles/{id}

Get a single job title by ID.

##### POST /api/v1/job-titles

Create a new job title.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "code": "string (required)",
  "name": "string (required)",
  "grade": "string (optional)"
}
```

---

### 7.3 Human Resources

#### Employees

##### GET /api/v1/employees

List all employees with enriched details (includes business unit, department, job title, and manager).

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | Any authenticated user |

**Query Parameters:**
- `page`, `size`, `search` (searches name, email)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "employeeNo": "UK-001",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "workEmail": "john.doe@inova.krd",
      "status": "active",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "businessUnit": {
        "id": "uuid",
        "code": "BU-001",
        "name": "Engineering"
      },
      "department": {
        "id": "uuid",
        "code": "DEP-001",
        "name": "Software Development"
      },
      "jobTitle": {
        "id": "uuid",
        "code": "SWE-002",
        "name": "Senior Software Engineer",
        "grade": "GR-6"
      },
      "manager": {
        "id": "uuid",
        "employeeNo": "UK-000",
        "firstName": "Jane",
        "lastName": "Smith",
        "displayName": "Jane Smith"
      }
    }
  ],
  "metadata": { "..." }
}
```

> **Note:** `businessUnit`, `department`, `jobTitle`, and `manager` will be `null` if not assigned.

##### GET /api/v1/employees/{id}

Get a single employee with full details.

**Response:** Same structure as items in the list response.

##### GET /api/v1/employees/{id}/hierarchy

Get an employee and all their direct/indirect reports (recursive).

**Response:**
```json
[
  {
    "id": "uuid",
    "employeeNo": "UK-001",
    "firstName": "John",
    "lastName": "Doe",
    "managerId": null
  },
  {
    "id": "uuid",
    "employeeNo": "UK-002",
    "firstName": "Alice",
    "lastName": "Johnson",
    "managerId": "uuid-of-john"
  }
]
```

##### POST /api/v1/employees

Create a new employee (HR record only, no user account).

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | Any authenticated user |

**Request Body:**
```json
{
  "employeeNo": "string (required)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "displayName": "string (optional)",
  "workEmail": "string (optional, valid email)",
  "businessUnitId": "uuid (optional)",
  "departmentId": "uuid (optional)",
  "jobTitleId": "uuid (optional)",
  "managerId": "uuid (optional)"
}
```

---

#### Onboarding

##### POST /api/v1/onboard

Atomically create Employee + User + Role Assignment in a single transaction.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "employeeNo": "string (required)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "displayName": "string (optional)",
  "workEmail": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "initialRoleId": "uuid (required)",
  "businessUnitId": "uuid (optional)",
  "departmentId": "uuid (optional)",
  "jobTitleId": "uuid (optional)",
  "managerId": "uuid (optional)"
}
```

**Success Response (201):**
```json
{
  "employeeId": "uuid",
  "userId": "uuid",
  "email": "new.employee@inova.krd"
}
```

> **Tip:** Optional UUIDs can be sent as `null` or empty string `""`.

---

### 7.4 Identity & Access Management

#### Users

##### GET /api/v1/users

List all users with pagination.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | Any authenticated user |

**Query Parameters:**
- `page`, `size`, `search` (searches email, display name)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "employeeId": "uuid",
      "email": "user@inova.krd",
      "displayName": "John Doe",
      "isActive": true,
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": { "..." }
}
```

##### GET /api/v1/users/{id}

Get a single user by ID.

##### GET /api/v1/users/by-email?email={email}

Get a user by email address.

**Query Parameters:**
- `email` (required) - User's email address

##### POST /api/v1/users

Create a new user (links to existing employee).

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "employeeId": "uuid (required)",
  "email": "string (required, valid email)",
  "displayName": "string (optional)",
  "password": "string (required, min 8 chars)"
}
```

##### POST /api/v1/users/{userId}/roles

Assign a role to a user.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "roleId": "uuid (required)"
}
```

**Success Response (201):**
```json
{
  "message": "Role assigned successfully"
}
```

##### DELETE /api/v1/users/{userId}/roles/{roleId}

Revoke a role from a user.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Success Response (200):**
```json
{
  "message": "Role revoked successfully"
}
```

---

#### Roles

##### GET /api/v1/roles

List all available roles.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | Any authenticated user |

**Response:**
```json
[
  {
    "id": "uuid",
    "code": "ADMIN",
    "name": "Administrator",
    "description": "Full system access",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

##### GET /api/v1/roles/{id}

Get a single role by ID.

##### POST /api/v1/roles

Create a new role.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Request Body:**
```json
{
  "code": "string (required, unique)",
  "name": "string (required)",
  "description": "string (optional)"
}
```

---

### 7.5 Audit Logs

##### GET /api/v1/audit-logs

Retrieve audit trail with filtering.

| Attribute | Value |
|-----------|-------|
| **Auth Required** | Yes |
| **Role Required** | ADMIN |

**Query Parameters:**
- `page` - Page number
- `size` - Page size
- `entityType` - Filter by entity type (see below)
- `action` - Filter by action type

**Entity Types:**
- `Employees`
- `Users`
- `Roles`
- `BusinessUnit`
- `Department`
- `JobTitle`

**Actions:**
- `CREATE`
- `UPDATE`
- `DELETE`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tenantId": "uuid",
      "actorId": "uuid",
      "action": "CREATE",
      "entityType": "Employees",
      "entityId": "uuid",
      "changes": {
        "employee_no": "UK-001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": { "..." }
}
```

---

## 8. Data Models

### 8.1 Employee (Enriched Response)

```typescript
interface Employee {
  id: string;                    // UUID
  tenantId: string;              // UUID
  employeeNo: string;            // Employee number
  firstName: string;             // First name
  lastName: string;              // Last name
  displayName: string | null;    // Display name
  workEmail: string | null;      // Work email
  status: 'active' | 'inactive'; // Employment status
  isActive: boolean;             // Soft delete flag
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  businessUnit: BusinessUnitSummary | null;
  department: DepartmentSummary | null;
  jobTitle: JobTitleSummary | null;
  manager: ManagerSummary | null;
}

interface BusinessUnitSummary {
  id: string;
  code: string | null;
  name: string | null;
}

interface DepartmentSummary {
  id: string;
  code: string | null;
  name: string | null;
}

interface JobTitleSummary {
  id: string;
  code: string | null;
  name: string | null;
  grade: string | null;
}

interface ManagerSummary {
  id: string;
  employeeNo: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
}
```

### 8.2 User

```typescript
interface User {
  id: string;
  tenantId: string;
  employeeId: string | null;
  email: string;
  displayName: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 8.3 Role

```typescript
interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 8.4 Business Unit / Department / Job Title

```typescript
interface BusinessUnit {
  id: string;
  code: string | null;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  code: string | null;
  name: string;
  parentDepartmentId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobTitle {
  id: string;
  code: string | null;
  name: string;
  grade: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 8.5 Audit Log

```typescript
interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  createdAt: string;
}
```

---

## 9. Workflows

### 9.1 Complete Staff Onboarding Flow

The recommended way to onboard new staff:

```
1. Login as ADMIN
2. GET /business-units - Fetch available business units
3. GET /departments - Fetch available departments  
4. GET /job-titles - Fetch available job titles
5. GET /roles - Fetch available roles
6. GET /employees - Find manager (optional)
7. POST /onboard - Create employee + user + role in one call
```

### 9.2 Displaying Employee Directory

```
1. Login
2. GET /employees?page=1&size=50 - Fetch paginated employees
3. Response includes nested businessUnit, department, jobTitle, manager
4. No additional requests needed for related data
```

### 9.3 Displaying Org Chart

```
1. Login
2. GET /employees - Get all employees
3. GET /employees/{ceo-id}/hierarchy - Get reporting structure from CEO
4. Build tree structure on frontend using managerId relationships
```

### 9.4 Role Management

```
1. Login as ADMIN
2. GET /users - List all users
3. GET /roles - List available roles
4. POST /users/{userId}/roles - Assign role
5. DELETE /users/{userId}/roles/{roleId} - Revoke role
```

---

## 10. Role-Based Access Control

### 10.1 Available Roles

| Role Code | Description |
|-----------|-------------|
| `ADMIN` | Full system access, can manage users, roles, and all resources |

### 10.2 Endpoint Permissions

| Endpoint | Requires ADMIN |
|----------|---------------|
| `POST /business-units` | Yes |
| `POST /departments` | Yes |
| `POST /job-titles` | Yes |
| `POST /onboard` | Yes |
| `POST /users` | Yes |
| `POST /users/{id}/roles` | Yes |
| `DELETE /users/{id}/roles/{roleId}` | Yes |
| `POST /roles` | Yes |
| `GET /audit-logs` | Yes |
| All other GET endpoints | No (authenticated only) |

### 10.3 Permission Error Response

```json
{
  "error": "Forbidden: insufficient permissions"
}
```

---

## 11. Common Patterns & Best Practices

### 11.1 Token Storage

Store the JWT token securely:
```javascript
// After login
localStorage.setItem('token', response.token);

// For API calls
const token = localStorage.getItem('token');
fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 11.2 Token Expiration Handling

When receiving a 401 response:
```javascript
if (response.status === 401) {
  // Token expired or invalid
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

### 11.3 Handling Nullable Relations

Employee relations may be null:
```javascript
const buName = employee.businessUnit?.name ?? 'Not Assigned';
const managerName = employee.manager?.displayName ?? 'No Manager';
```

### 11.4 Dropdown Population

For form dropdowns, fetch reference data once:
```javascript
// Fetch once and cache
const [businessUnits, departments, jobTitles, roles] = await Promise.all([
  fetch('/api/v1/business-units?size=1000').then(r => r.json()),
  fetch('/api/v1/departments?size=1000').then(r => r.json()),
  fetch('/api/v1/job-titles?size=1000').then(r => r.json()),
  fetch('/api/v1/roles').then(r => r.json())
]);
```

### 11.5 Search Implementation

Use the `search` query parameter:
```javascript
const searchEmployees = async (query) => {
  const response = await fetch(
    `/api/v1/employees?search=${encodeURIComponent(query)}`
  );
  return response.json();
};
```

### 11.6 Pagination Handling

Calculate pagination state:
```javascript
const { data, metadata } = await response.json();
const hasNextPage = metadata.currentPage < metadata.totalPages;
const hasPrevPage = metadata.currentPage > 1;
```

### 11.7 Error Display

Show user-friendly error messages:
```javascript
const handleError = (error) => {
  if (error.details) {
    // Validation errors
    return Object.values(error.details).join(', ');
  }
  return error.error || 'An unexpected error occurred';
};
```

---

## Appendix: Quick Reference

### Authentication
```
POST /api/v1/auth/login
```

### Organization
```
GET    /api/v1/business-units
GET    /api/v1/business-units/{id}
POST   /api/v1/business-units

GET    /api/v1/departments
GET    /api/v1/departments/{id}
POST   /api/v1/departments

GET    /api/v1/job-titles
GET    /api/v1/job-titles/{id}
POST   /api/v1/job-titles
```

### HR
```
GET    /api/v1/employees
GET    /api/v1/employees/{id}
GET    /api/v1/employees/{id}/hierarchy
POST   /api/v1/employees
POST   /api/v1/onboard
```

### IAM
```
GET    /api/v1/users
GET    /api/v1/users/{id}
GET    /api/v1/users/by-email?email={email}
POST   /api/v1/users
POST   /api/v1/users/{id}/roles
DELETE /api/v1/users/{id}/roles/{roleId}

GET    /api/v1/roles
GET    /api/v1/roles/{id}
POST   /api/v1/roles
```

### Audit
```
GET    /api/v1/audit-logs
```

---

*For additional information, refer to the OpenAPI/Swagger documentation at `/swagger/` on the API server.*
