# Phase 6: Lead Integration & Patch Custom Fields

## Project Context
**Goal:** Implement comprehensive CRM fields to capture all custom patch quotation requirements modeled after the American Patch form, enabling smooth manual data entry and preparing the system for automated leads via email forwarding/webhooks.

**Key Requirements:**
- Must capture all lead information including patch type, backing, size, quantity, deadline, and artwork.
- UI must prioritize dropdowns/selects over free text for accurate reporting.
- An ingestion route (API endpoint) must be prepared to accept incoming POST requests from email forwarders (like Zapier/Make) or webhooks.

---

## Task Breakdown

### 1. Database Schema Operations (Backend Specialist)
**Objective:** Add patch-specific metadata to the `deals` table.
- [x] Run migration to add `patch_type` (text).
- [x] Run migration to add `backing_type` (text).
- [x] Run migration to add `patch_width` (numeric).
- [x] Run migration to add `patch_height` (numeric).
- [x] Run migration to add `promo_code` (text).
- [x] Run migration to add `artwork_url` (text) and `artwork_notes` (text).
- [x] Run `npx supabase gen types typescript --local > src/types/database.types.ts` to sync schema types.

### 2. CRM Configuration & Validation (Frontend Specialist)
**Objective:** Standardize the new field values and form constraints.
- [x] Modify `src/lib/constants.ts` to include `PATCH_TYPES`:
  - *Embroidered, Woven, Dye Sublimation, Felt, PVC, Leather, Chenille, Blank, Bullion Crest, Combination*
- [x] Modify `src/lib/constants.ts` to include `BACKING_TYPES`:
  - *Unbacked, Plastic, Heat Seal, Hook & Loop, Self Stick, Pin, Magnetic, Not Sure*
- [x] Update `src/lib/validations/deal.schema.ts` to include the new fields as optional attributes, mapping closely to the DB structure.

### 3. Service Layer and UI Form (Frontend Specialist)
**Objective:** Allow users to manually capture leads with the correct custom fields.
- [x] Update `src/components/deals/DealForm.tsx`:
  - Add Select dropdowns for Patch Type and Backing Type.
  - Add Numeric inputs for Width, Height, and Quantity.
  - Add text inputs for Promo Code and additional file notes.
- [x] Verify `cleanFormData` logic in `src/app/(dashboard)/deals/actions.ts` handles the numeric null values accurately.
- [x] Update `src/components/deals/DealDetail.tsx`:
  - Create a new "Product Specifications" card displaying patch details.

### 4. API Ingestion Route (Backend Specialist)
**Objective:** Provide a destination for the forwarded emails/webhooks to dump the lead data automatically.
- [x] Create `src/app/api/public/leads/route.ts` (Public POST endpoint).
- [x] Implement generic payload parser mapping incoming data to the `dealSchema`.
- [x] Implement logic to: 
  1. Find or create client from email (`clients.service`).
  2. Create deal with stage `lead` and specific patch data (`deals.service`).
  3. Log `deal_created` activity.

---

## Verification Checklist
- [ ] Users can manually create a deal capturing patch dimensions and type without errors.
- [ ] "Product Specifications" tab/card renders accurately on the Deal Detail page.
- [ ] A POST request to `/api/public/leads` with a mock payload successfully provisions a new Client and Deal.
- [ ] Missing values in the lead payload do not crash the endpoint.

---

## Agent Assignments

- **Frontend Specilaist:** Handles the Deal forms, TypeScript types, UI layouts, and constant constants.
- **Backend Specialist:** Handles the SQL schema updates, the `public API` routes, and validation mappings.
