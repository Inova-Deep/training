For this system, “Training Needs” should really be a broader “Competence Actions” queue, where the resolution can be: attend training, upload existing third-party cert, do OJT, or complete an assessment. If you keep calling it “Training Needs” in the UI, make sure the page clearly supports “I already have the cert” and “verification only”.
Here’s what I’d display on the frontend to make it feel correct and flexible.
Training Needs page purpose (what users should understand instantly)
This is a queue of competence gaps and renewals that must be resolved.
Resolution paths include:
Upload existing certificate (third-party)
Renew certificate (third-party course)
OJT / coaching
Assessment / verification only (no training required)
Training Need record cards (table columns)
For Manager + HR/Admin views, each row/card should show:
Identity and context
Employee (name + employee no)
Job Title
Department / BU
Requirement (competency code + title)
Risk badge (Low / Medium / High-Critical)
Gating badge (Yes/No) (if gating, this drives urgency)
Why it exists
Reason (enum): Missing evidence / Evidence rejected / Expiring renewal / Expired renewal / New requirement / Manager flagged
Trigger date (when created)
What must happen next (auto guidance)
Recommended action (AUTO): “Upload existing cert”, “Book renewal training”, “Complete OJT”, “Schedule assessment”
Evidence expected (AUTO): “External cert ref + issuer + expiry”, “OJT record + sign-off”, etc.
Ownership and due dates
Responsible (AUTO): Employee / Manager / HR/Admin / Assessor
Due date (optional but good for demo)
Status: Open / In Progress / Completed / Cancelled
Priority: High if gating + expired, Medium if expiring, Low otherwise
Training Need “details drawer” (when you click a row)
This is where you make it feel enterprise-grade without complexity:
Header
Employee + requirement + current competence status + authorisation impact (“Not Authorised due to gating expiry”)
Resolution path selector (key UI element)
Let the user choose one of these “resolution types”:
A) Upload Existing Certification (third-party)
Fields: issuer, reference number, URL, issue date, expiry date, optional file upload
Button: “Submit for verification”
B) Renewal / External Training
Fields: provider name, planned date, notes, expected completion date
Attach completion evidence later
C) OJT / Coaching
Fields: trainer/supervisor name, planned start/end, notes
Attach OJT sign-off evidence
D) Assessment Only (no training)
Fields: assessor, planned date, method
Button: “Request assessment”
This single selector solves your “not just classroom training” point elegantly.
Evidence panel
Show linked evidence (files + external refs) and review status
Allow adding evidence directly here (because it’s the most natural place)
Activity log (tiny but impactful)
Created → assigned → evidence added → reviewed → assessment → closed
“New employee brings own certs” handling (frontend)
Two good UX patterns; for demo pick one:
Option 1: On Employee Profile show a “Quick Onboarding” widget
“Upload existing certifications” button
Lets them add evidence first
System then matches/link evidence to requirements (initially manual linking is fine for demo)
Option 2: In Training Needs list show a banner for new employees:
“This employee has X required items. Upload existing certs to close gaps faster.”
A button opens the details drawer in “Upload Existing Certification” mode.
Key is: don’t force creating “training needs” for everything if they already have the cert. The UI should encourage evidence-first.
What to show for the demo scenarios (so the page looks real)
Seed a few items like:
Expired gating cert (Working at Height) → priority High, recommended action “Renew cert OR upload existing valid cert”
Expiring cert (Confined Space, 12 days left) → recommended action “Renew before expiry”
Required item (NCR reporting for supervisor) → recommended action “Complete awareness + manager sign-off”
Evidence rejected (LOTO training record missing signature) → recommended action “Resubmit evidence”
New hire (technician) → multiple Required items, banner “Upload existing certifications”
Small naming tweak (optional but helps)
Keep the sidebar label “Training Needs” (because people expect it), but inside the page title use:
“Training Needs & Competence Actions”
and show the resolution path selector so no one assumes it’s classroom-only.