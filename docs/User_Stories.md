# Standalone Competence / Training / Awareness — User Stories (Demo v1)

This set is written to be implementation-ready (each story has a clear outcome). Stories are grouped by persona and by module. Where relevant, stories reference locked demo rules: **Expiring = 30 days**, **Role authorisation = gating requirements**, **ERP directory is read-only**, **external evidence allowed**.

---

## 1) Employee Stories

### A. My Competence (self)

1. As an Employee, I want to see my current role and organisational details (Job Title, Department, Business Unit, Manager) so I understand what the system thinks my position is.

2. As an Employee, I want to see my role-level Independent Work Authorisation status (Authorised / Not Authorised) so I know whether I can work independently.

3. As an Employee, I want to see my competence requirements grouped by category so I can easily understand what is required of me.

4. As an Employee, I want to see the status of each requirement (Required, In Progress, Valid, Expiring, Expired, N/A) so I can prioritise actions.

5. As an Employee, I want to see the system-generated “Action Required” for each requirement so I know exactly what to do next.

6. As an Employee, I want to upload evidence files (e.g., certificates, records) against a requirement so I can prove competence.

7. As an Employee, I want to submit third-party certification evidence as an external reference (URL and/or reference number + issuer) so I can record external credentials.

8. As an Employee, I want to attach the same evidence to multiple requirements when appropriate so I don’t duplicate uploads.

9. As an Employee, I want to track evidence review status (Submitted/Accepted/Rejected) so I know whether my submission was approved.

10. As an Employee, I want to receive a clear reason when evidence is rejected so I can correct and resubmit.

11. As an Employee, I want to request verification/assessment once I submit evidence so my manager/assessor is prompted to review.

12. As an Employee, I want to see expiry dates for time-bound requirements so I can renew before expiry.

13. As an Employee, I want expiring items (within 30 days) to be clearly highlighted so I can take action early.

14. As an Employee, I want to see my historical completion milestones (Completed history) so I can demonstrate progress over time.

### B. My Training

15. As an Employee, I want to see training needs assigned to me so I can complete the required actions.

16. As an Employee, I want to update training need progress (Open → In Progress → Completed) so the system reflects what I’m doing.

17. As an Employee, I want to attach training completion evidence (file or external ref) to a training need so it can be verified.

18. As an Employee, I want to see due dates for training needs so I can prioritise.

### C. Awareness

19. As an Employee, I want to see awareness topics assigned to me so I know what must be acknowledged.

20. As an Employee, I want to acknowledge awareness topics so my completion is recorded.

21. As an Employee, I want to view my awareness acknowledgement history so I can confirm compliance.

### D. Notifications (optional for demo)

22. As an Employee, I want to be notified when evidence is accepted/rejected so I can respond promptly.

23. As an Employee, I want to be notified when a requirement becomes Expiring so I can renew in time.

---

## 2) Manager Stories

### A. Dashboard and Team Overview

24. As a Manager, I want a dashboard showing my team’s Required/Expiring/Expired counts so I can manage compliance.

25. As a Manager, I want to see the count of employees who are Not Authorised (role-level) so I can manage operational risk.

26. As a Manager, I want to toggle between Direct Reports and All Levels (hierarchy) so I can manage my full organisation.

27. As a Manager, I want to drill into an employee profile from the team view so I can review details quickly.

### B. Skills Matrix (Team)

28. As a Manager, I want to view my team in a Skills Matrix grid so I can spot gaps across multiple employees.

29. As a Manager, I want to filter the matrix by Department/Business Unit/Job Title/Status/Risk so I can focus on the right slice.

30. As a Manager, I want to export the matrix to Excel so I can share/report offline.

31. As a Manager, I want to see “Action Required (AUTO)” and “Responsible (AUTO)” in the matrix so I can act immediately.

32. As a Manager, I want the matrix to clearly flag Expiring (≤30 days) and Expired items so I can prioritise.

### C. Evidence Review and Verification

33. As a Manager, I want to review and accept/reject evidence for Low/Medium risk requirements so I can confirm competence.

34. As a Manager, I want to record an assessment outcome (PASS/FAIL/LIMITED) so competence status becomes Valid or remains Required.

35. As a Manager, I want to add assessment comments/constraints so the system records limitations for the demo.

36. As a Manager, I want accepted evidence and a PASS assessment to create a Completed milestone so history is auditable.

### D. Training Needs (Team)

37. As a Manager, I want training needs to be created automatically when a competence item is Required or when a gating item is Expired so gaps are not missed.

38. As a Manager, I want to view and manage my team’s training needs so I can ensure completion.

39. As a Manager, I want to assign a training need to an employee or HR/Admin so ownership is clear.

40. As a Manager, I want to close a training need only when completion evidence exists so the demo looks auditable.

### E. Role-level Authorisation (Gating)

41. As a Manager, I want each role (Job Title) to define gating requirements so independent work authorisation is objective.

42. As a Manager, I want an employee to become Not Authorised automatically when any gating requirement expires so operational risk is controlled.

43. As a Manager, I want Expiring gating requirements to keep the employee Authorised but clearly flagged so I can intervene proactively.

### F. Exceptions

44. As a Manager, I want to mark a requirement as N/A for a specific employee (with justification) so real-world exceptions are handled.

---

## 3) HR/Admin (combined) Stories

### A. People and Org Oversight

45. As HR/Admin, I want to search and browse employees from ERP so I can access competence records without maintaining a duplicate directory.

46. As HR/Admin, I want to filter organisation compliance views by Business Unit/Department/Job Title so I can report accurately.

### B. Roles (Job Title configuration)

47. As HR/Admin, I want to complete and maintain an applicability decision per Job Title so only applicable roles appear in the skills matrix.

48. As HR/Admin, I want to define role requirements per Job Title so expectations are standardised.

49. As HR/Admin, I want to mark certain requirements as “Gating for Independent Work” so authorisation can be calculated.

50. As HR/Admin, I want to publish a versioned set of role requirements so changes are controlled and auditable.

51. As HR/Admin, I want to revise role requirements without deleting history so audits can trace what changed.

52. As HR/Admin, I want newly added requirements to appear as Required for employees in that Job Title so the org closes gaps.

### C. Competency Library

53. As HR/Admin, I want to create and maintain competency library items so requirements are reusable and consistent.

54. As HR/Admin, I want to define default risk level, training type, assessment method, and validity defaults on a library item so role setup is faster.

55. As HR/Admin, I want to archive competency items that are no longer used so the library stays clean.

### D. Evidence and Certificates

56. As HR/Admin, I want to upload evidence on behalf of an employee (e.g., certificates) so records can be completed centrally.

57. As HR/Admin, I want to store external certification references (issuer + reference no + URL) so third-party evidence is supported.

58. As HR/Admin, I want to see a list of certificates expiring soon so renewals can be managed.

### E. Training Needs (Org)

59. As HR/Admin, I want to view all training needs across the organisation so I can coordinate training.

60. As HR/Admin, I want to create training needs manually when required so gaps identified outside the matrix can be tracked.

61. As HR/Admin, I want to attach training completion evidence so training closure is defensible.

### F. Awareness Topics

62. As HR/Admin, I want to create awareness topics so policy/procedure awareness can be tracked.

63. As HR/Admin, I want to target awareness topics to “all staff with a manager” so C-suite is excluded by default.

64. As HR/Admin, I want to include contractors/interns (who have a manager) in awareness targeting so coverage is complete.

65. As HR/Admin, I want to track acknowledgement completion rates so I can demonstrate awareness compliance.

### G. Admin Configuration

66. As HR/Admin, I want to manage reference lists (risk levels, training types, assessment methods, statuses) so terminology is controlled.

67. As HR/Admin, I want to configure thresholds such as Expiring=30 days so the system matches policy.

68. As HR/Admin, I want to test ERP connectivity so I know employee/org data is available.

---

## 4) Cross-cutting / System Stories

### A. ERP Data Consumption

69. As the System, I want to fetch employee/job title/department/business unit data from ERP on demand so the app remains read-only to ERP and always current.

70. As the System, I want to support team retrieval via ERP hierarchy endpoint so managers can see direct and indirect reports.

### B. Audit and Traceability

71. As the System, I want to log all critical changes (role requirements publish, evidence review, assessments, status changes) so the demo is auditable.

72. As the System, I want each competence item status change to be attributable to a user and timestamp so it can be defended in an audit.

### C. Rule-driven Fields

73. As the System, I want to compute derived statuses (Expiring/Expired) from expiry dates so data stays consistent.

74. As the System, I want to compute role-level authorisation from gating requirements so authorisation is objective and repeatable.

75. As the System, I want to compute “Evidence Expected (AUTO)” so users are guided toward correct evidence types.

76. As the System, I want to compute “Action Required (AUTO)” so users always know the next step.

77. As the System, I want to compute “Responsible (AUTO)” so ownership is clear.

### D. Export

78. As the System, I want to export the Skills Matrix to Excel so users can share and archive reports.

---

## 5) Out-of-Scope Stories (explicitly excluded for demo)

79. As a User, I want SCORM/e-learning course playback and quizzes (excluded for demo).

80. As a User, I want ERP write-back (e.g., updating employee records) (excluded for demo).

81. As a User, I want multi-tenant separation (excluded for single-tenant demo).
