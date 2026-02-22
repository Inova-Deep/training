My idea for a clean “Role Requirements pack” using the same 15-competency library I proposed. I’ll map it to two ERP Job Titles that you already have in your sample data (“Maintenance Technician” and a likely “Maintenance Supervisor”). If your ERP has different names, the mapping still applies 1:1 by job title.
I’ll also mark Gating items (Option A) and keep the demo rules consistent:
High/Critical → assessor required; gating by default
Medium → manager sign-off; gating if Mandatory or Cert/Licence
Expired gating → Not Authorised immediately
Competency codes (for the library)
C01 PTW – Permit to Work (maintenance execution)
C02 LOTO / Isolation
C03 Working at Height
C04 Confined Space Entry
C05 Lifting Ops / Banksman-Slinger (as applicable)
C06 Mechanical Maintenance Competence (core)
C07 Use of calibrated measuring tools (torque/gauges/vernier)
C08 Document control awareness (procedures/revisions)
C09 Nonconformance reporting & escalation
C10 Corrective action participation (basic CAPA discipline)
C11 Site/BU HSE Induction
C12 Fire safety / emergency response briefing
C13 Manual handling awareness
C14 PPE compliance & hazard awareness
C15 First Aid (nominated only)
Role 1: Maintenance Technician (ERP Job Title: MNT-TECH)
Include in matrix: Yes (Applicability = Included)
Requirements (12 total)
Gating (6)
C02 LOTO / Isolation — High/Critical — Mandatory — Cert/OJT — Assessor — Expiry 365d (or per evidence)
C01 PTW — High/Critical — Mandatory — Awareness + sign-off — Assessor or Manager (your choice; for demo keep Assessor) — No expiry (or annual)
C03 Working at Height — High/Critical — Mandatory when role requires — Cert/Licence — Assessor — Expiry from cert
C04 Confined Space — High/Critical — Mandatory when role requires — Cert/Licence — Assessor — Expiry from cert
C05 Lifting Ops — High/Critical — Mandatory if applicable — Cert/Licence — Assessor — Expiry from cert
C11 HSE Induction — Medium — Mandatory — Induction record — Manager sign-off — No expiry (or annual refresh)
Non-gating (6)
C06 Mechanical maintenance competence — Medium — Mandatory — Experience/OJT — Manager assessment — No expiry
C07 Calibrated tools — Medium — Mandatory — OJT — Manager — No expiry
C14 PPE compliance — Medium — Mandatory — Awareness + observation — Manager — No expiry
C09 NCR reporting — Medium — Mandatory — Awareness — Manager — No expiry
C12 Fire safety — Medium — Mandatory — Awareness — Manager — Expiry 365d (optional)
C13 Manual handling — Low — Mandatory — Awareness — Manager — No expiry
Excluded / N/A for this role by default
C08 Document control awareness (optional: include if you want a QMS flavour, otherwise skip)
C10 CAPA participation (more supervisor-level; optional)
C15 First Aid (only for nominated staff)
Role 2: Maintenance Supervisor (or Maintenance Lead)
Include in matrix: Yes (Applicability = Included)
Requirements (11 total)
Gating (5)
C01 PTW — High/Critical — Mandatory — Assessor — No expiry (or annual)
C02 LOTO / Isolation — High/Critical — Mandatory — Assessor — Expiry 365d
C11 HSE Induction — Medium — Mandatory — Manager sign-off — No expiry/annual
C09 NCR reporting & escalation — Medium — Mandatory — Manager sign-off — No expiry (Medium + Mandatory ⇒ gating per your rule)
C10 Corrective action participation — Medium — Mandatory — Manager sign-off — No expiry (Medium + Mandatory ⇒ gating per your rule)
Non-gating (6)
C08 Document control awareness — Medium — Mandatory — Awareness — Manager — No expiry
C14 PPE compliance — Medium — Mandatory — Awareness + observation — Manager — No expiry
C12 Fire safety — Medium — Mandatory — Awareness — Manager — Expiry 365d (optional)
C13 Manual handling — Low — Mandatory — Awareness — Manager — No expiry
C06 Mechanical maintenance competence — Medium — Optional (recommended) — Experience validated — Manager — No expiry
C03 Working at Height — High/Critical — Optional (only if supervisor also performs tasks) — Cert/Licence — Assessor — Expiry from cert
Excluded / conditional
C04 Confined Space and C05 Lifting Ops: include only if supervisors personally perform/lead these operations and you want them on the hook for certification.
C15 First Aid: nominated only.
Role 3 (Optional for demo): QHSE Coordinator / Assessor
If you want a third role to show “assessor required” workflows cleanly, I can map a 7–9 requirement pack focused on governance + safety certs. Not required.
How to present this to the frontend team
In Roles → Role Requirements tab, you’ll configure:
Mandatory: as above
Risk: as above (defaults from library)
Training type + assessment method: defaults from library, tweak if needed
Gating toggles: exactly as listed
And in Skills Matrix, start with these “interesting” seeded scenarios:
One technician with C03 expired (Not Authorised)
One technician with C04 expiring in 10 days (Expiring)
One supervisor missing C09 NCR reporting (Required; Not Authorised if you keep it gating)
One external certificate evidence record for C03/C04 (URL + issuer + ref + expiry)

---------
Below is a more relavant to what we have for Job Titles, the focus is on two technical roles from your ERP list and one HR role, using the same 15-competency library (C01–C15). I’ll give you the exact “Role Requirements packs” with Mandatory + Gating + risk/training/assessment defaults.
Technical Role 1: Maintenance Technician (MNT-TECH)
Applicability: Included
Gating (6)
C02 LOTO / Isolation — High/Critical — Mandatory — OJT/Cert — Assessor — Expiry 365d (or evidence expiry)
C01 PTW (Maintenance execution) — High/Critical — Mandatory — Awareness + sign-off — Assessor — No expiry (or 365d refresh if you want)
C03 Working at Height — High/Critical — Mandatory — Cert/Licence (external allowed) — Assessor — Expiry from cert
C04 Confined Space Entry — High/Critical — Mandatory — Cert/Licence (external allowed) — Assessor — Expiry from cert
C05 Lifting Ops / Banksman — High/Critical — Mandatory if applicable — Cert/Licence (external allowed) — Assessor — Expiry from cert
C11 HSE Induction — Medium — Mandatory — Induction record — Manager sign-off — No expiry (or annual)
Non-gating (6)
C06 Mechanical maintenance competence — Medium — Mandatory — Experience/OJT — Manager assessment — No expiry
C07 Calibrated tools — Medium — Mandatory — OJT — Manager — No expiry
C14 PPE compliance & hazard awareness — Medium — Mandatory — Awareness + observation — Manager — No expiry
C09 Nonconformance reporting — Medium — Mandatory — Awareness — Manager — No expiry
C12 Fire safety / emergency response — Medium — Mandatory — Awareness — Manager — Expiry 365d (optional)
C13 Manual handling — Low — Mandatory — Awareness — Manager — No expiry
Excluded by default
C08 Document control awareness (optional)
C10 CAPA participation (optional)
C15 First Aid (nominated only)
Technical Role 2: Maintenance Supervisor (MNT-SUP)
Applicability: Included
Gating (5)
C01 PTW — High/Critical — Mandatory — Assessor — No expiry (or 365d refresh)
C02 LOTO / Isolation — High/Critical — Mandatory — Assessor — Expiry 365d
C11 HSE Induction — Medium — Mandatory — Manager sign-off — No expiry/annual
C09 Nonconformance reporting & escalation — Medium — Mandatory — Manager sign-off — No expiry (Medium+Mandatory ⇒ gating per your rule)
C10 Corrective action participation — Medium — Mandatory — Manager sign-off — No expiry (Medium+Mandatory ⇒ gating per your rule)
Non-gating (6)
C08 Document control awareness — Medium — Mandatory — Awareness — Manager — No expiry
C14 PPE compliance — Medium — Mandatory — Awareness + observation — Manager — No expiry
C12 Fire safety — Medium — Mandatory — Awareness — Manager — Expiry 365d (optional)
C13 Manual handling — Low — Mandatory — Awareness — Manager — No expiry
C06 Mechanical maintenance competence — Medium — Optional (recommended) — Experience validated — Manager — No expiry
C03 Working at Height — High/Critical — Optional (only if supervisor performs tasks) — Cert/Licence — Assessor — Expiry from cert
Excluded/conditional
C04 Confined Space and C05 Lifting Ops: include only if supervisors personally perform/lead these tasks and you want certification on them.
C15 First Aid: nominated only.
HR Role: HR Manager (HR-MGR)
Applicability: Included (but matrix is lighter and mostly governance/mandatory)
Gating (3)
C11 HSE Induction — Medium — Mandatory — Induction record — Manager sign-off — No expiry/annual
C08 Document control awareness — Medium — Mandatory — Awareness — Manager sign-off — No expiry (Medium+Mandatory ⇒ gating)
C09 Nonconformance reporting & escalation — Medium — Mandatory — Awareness — Manager sign-off — No expiry (Medium+Mandatory ⇒ gating)
Non-gating (6)
C10 CAPA participation — Medium — Mandatory — Awareness — Manager sign-off — No expiry
C12 Fire safety — Medium — Mandatory — Awareness — Manager sign-off — Expiry 365d (optional)
C13 Manual handling — Low — Mandatory — Awareness — Manager sign-off — No expiry
C14 PPE & hazard awareness — Medium — Mandatory — Awareness + observation — Manager — No expiry
C01 PTW — N/A for HR (unless HR participates operationally; default exclude)
C15 First Aid — Nominated only (include if HR manager is a first aider)
Notes to keep the HR matrix “realistic”
HR roles typically shouldn’t carry heavy technical safety certs unless they actually perform those tasks. So keep C03/C04/C05 out of HR by default.
The “gating” set for HR is governance + mandatory compliance awareness, which still demonstrates the authorisation concept without feeling weird.
