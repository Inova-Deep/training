BELOW IS JUST GUIDELINE FOR YOU TO USE WHEN BUILDING THE APP, this is not final and for your reference only. However they are good to use as a guide and relevant to the logic of the application itself
---------
Dashboard (role-aware)
Core KPI tiles (numbers)
People in scope (e.g., “My Team: 12”, “Org: 186”)
Not Authorised (role-level, gating failed)
Required items (count of competence items in REQUIRED)
Expiring (≤ 30 days)
Expired
Open Training Needs
Overdue Training Needs (due date < today)
Top lists (5–10 rows each)
“Not Authorised (Gating Failed)” list: Employee, Job Title, which gating item is missing/expired, days expired
“Expiring Soon” list: Employee, requirement, expiry date, days remaining, responsible
“Recent Activity” feed: Evidence uploaded, evidence accepted/rejected, assessment pass/fail, role requirements published
Skills Matrix (the hero grid)
Columns/fields that will make it match your Excel and feel real
Employee, Department, Business Unit, Job Title
Skill Category, Requirement, Risk Level, Criticality, Mandatory (Y/N)
Status (VALID primary; REQUIRED/IN_PROGRESS; derived EXPIRING/EXPIRED)
Expiry Date
Evidence Expected (AUTO)
Evidence Reference (file name / external ref no)
Assessment Method
Action Required (AUTO)
Responsible (AUTO)
Matrix “views” to include as quick filters (buttons)
“Gating Only”
“Safety/Critical Only”
“Expired Only”
“Expiring in 30 Days”
“Required + In Progress”
“By Job Title” (grouping)
My Team (Manager)
Team summary cards
Direct reports count vs All levels count
Not Authorised count
Gating Expired count
Expiring within 30 days count
Team roster table (drillable)
Employee, Job Title, Dept/BU, Authorisation, Required count, Expiring count, Expired count
Optional: “Top 1 action” column (e.g., “Renew licence”, “Submit evidence”, “Schedule assessment”)
People (HR/Admin and optional for Managers)
Employee profile header (from ERP + computed)
Name, Job Title, Dept, BU, Manager
Authorisation badge (Authorised/Not Authorised)
“Compliance score” (simple: % of requirements in VALID/EXPIRING vs total applicable)
“Next expiry” date
Employee Competence list (grouped)
Group by Skill Category
Show: status, expiry, action required, responsible, evidence link(s), last completed date
Roles (HR/Admin)
Applicability overview
List of Job Titles with: Included / Awareness-only / Out of scope
“Last reviewed” date + owner
Quick “needs review” flag when role requirements changed
Role Requirements page (per Job Title)
Count of requirements
Count of gating requirements
Breakdown by risk level (Low/Medium/High-Critical)
Published version + published date
Change log summary (added/removed requirements)
Competency Library (HR/Admin)
Useful library stats
Total competencies
By category
By risk level
Archived count
Library list columns (feel enterprise)
Code, Title, Category, Default Risk, Default Training Type, Default Assessment Method, Default validity days, Active/Archived
Training Needs (Manager + HR/Admin)
Queue KPIs
Open, In Progress, Completed (last 30 days)
Overdue
Safety/Critical-related (filtered from linked competence item risk)
Queue table columns
Employee, linked requirement, reason (Required/Expired/Manager flagged), due date, status, owner, last update
Attachments: completion evidence (file or external ref)
Awareness (Employee + HR/Admin)
Topic list (HR/Admin)
Title, target rule (“all staff with manager”), start/end, completion rate, created by
Employee view
Assigned topics: title, due, acknowledgement button, acknowledged_at
Reports (if you include it)
High-impact demo reports (exportable)
“Expiring Certificates (next 30 days)” (driven from evidence expiry_date)
“Not Authorised roster” (employee + failing gating items)
“Compliance by Job Title” (% valid vs total)
“Compliance by BU/Department”
Admin (Reference Lists + ERP Connection)
Reference list examples (from your Excel Lists)
Risk levels: Low / Medium / High-Critical
Training types: Certification/Licence, OJT/Coaching, Experience Validated, Awareness
Assessment methods: Record Review, Observation, Manager Sign-off, Test/Interview (optional)
Status definitions (with note: Expiring/Expired are derived)
Expiring threshold: 30 days
ERP Connection “health”
Last successful call time
Sample call buttons: job titles, employee by id, hierarchy
Response time display (helps demo credibility)


-----

Here’s a ready-to-use set of 15 competencies that aligns with your procedure + spreadsheet structure (categories, risk, mandatory, training type, evidence expected, assessment method, expiry). You can attach these to 2–3 ERP Job Titles (e.g., “Maintenance Technician”, “Maintenance Supervisor”, “QHSE Coordinator”) and mark ~4–6 as gating per role.
Competency set (15)
A) Technical / Role-Specific (Maintenance example)
Permit to Work (PTW) – Maintenance execution
Risk: High/Critical
Training type: Awareness + Manager sign-off
Evidence: toolbox talk/briefing record + sign-off
Assessment: Observation / Manager sign-off
Expiry: none (or annual if you prefer)
LOTO (Lockout/Tagout) / Isolation competency
Risk: High/Critical
Training type: Certification/Licence (internal) or OJT + assessment
Evidence: training record + assessment record
Assessment: Observation + record review
Expiry: 365 days
Working at Height authorisation
Risk: High/Critical
Training type: Certification/Licence
Evidence: third-party certificate (external ref allowed) + expiry
Assessment: Record review
Expiry: from certificate
Confined Space entry authorisation
Risk: High/Critical
Training type: Certification/Licence
Evidence: external cert + medical/fit if needed (optional)
Assessment: Record review
Expiry: from certificate
Lifting operations / banksman-slinger (as applicable)
Risk: High/Critical
Training type: Certification/Licence
Evidence: certificate + reference no + expiry
Assessment: Record review
Expiry: from certificate
Basic mechanical maintenance competency (job-specific)
Risk: Medium
Training type: Experience validated / OJT
Evidence: supervisor sign-off + observation note
Assessment: Observation
Expiry: none
Use of calibrated measuring tools (torque, gauges, vernier)
Risk: Medium
Training type: OJT/Coaching
Evidence: OJT record + spot check record
Assessment: Observation
Expiry: none
B) Quality / Management System (applies across roles)
8) Document control awareness (procedures, revisions)
Risk: Medium
Training type: Awareness
Evidence: acknowledgement (or N/A outside matrix if you prefer)
Assessment: Manager sign-off
Expiry: none
Nonconformance reporting & escalation
Risk: Medium
Training type: Awareness + coached practice
Evidence: acknowledgement + sample NCR created (optional)
Assessment: Record review
Expiry: none
Corrective action participation (basic CAPA discipline)
Risk: Medium
Training type: Awareness
Evidence: acknowledgement + manager confirmation
Assessment: Manager sign-off
Expiry: none
C) Mandatory / Compliance & Safety (cross-cutting)
11) HSE Induction (site/BU induction)
Risk: Medium
Training type: Certification/Induction record
Evidence: induction record
Assessment: Record review
Expiry: none (or annual refresh)
Fire safety / emergency response briefing
Risk: Medium
Training type: Awareness
Evidence: toolbox talk/briefing attendance
Assessment: Manager sign-off
Expiry: 365 days (optional)
Manual handling awareness
Risk: Low
Training type: Awareness
Evidence: acknowledgement / attendance
Assessment: Manager sign-off
Expiry: none
PPE compliance and hazard awareness (role relevant)
Risk: Medium
Training type: Awareness + observation
Evidence: acknowledgement + observation note
Assessment: Observation
Expiry: none
First Aid (only for nominated staff)
Risk: High/Critical (for nominated role) / N/A otherwise
Training type: Certification/Licence
Evidence: external cert ref + expiry
Assessment: Record review
Expiry: from certificate