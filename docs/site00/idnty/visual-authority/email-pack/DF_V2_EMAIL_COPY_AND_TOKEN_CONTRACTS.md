# Digital Foundation V2 — email copy and token contracts

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GROK-COMPLETE-EMAIL-PACK-INVENTORY-CREATIVE-COVERAGE-AND-COST-AUDIT1`  
**Date:** 2026-10-11  
**Status:** Design contracts for founder review. No HTML. No live send. Credits spent: 0.

SITE 00 authored text in these contracts is uppercase. Client names, email addresses, domains, URLs, client-entered messages, legal identifiers, and data fields that must keep their original case stay as stored.

No price, payment status, approval, project percentage, referral credit, domain verification, or completion claim is invented here. Amount lines are tokens. If the record is missing, the line is omitted. `commercialConfig` defaults are founder-review defaults and are not email copy.

Sender identity is unregistered on the Digital Foundation communications domain. Stage 2 must bind a founder-approved from-address. This audit does not print one.

`{{preference_url}}` is unresolved. The client can save preferences inside the foundation project. There is no public unsubscribe route.

## personal-foundation-invitation

- **Name:** PERSONAL FOUNDATION INVITATION
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** NONE (ACCESS MESSAGE)
- **Trigger:** ARTIFACT_CREATED
- **Subject:** YOUR PERSONAL FOUNDATION IS READY
- **Preheader:** OPEN THE LINK TO BEGIN WITH SITE 00
- **Primary CTA:** OPEN YOUR FOUNDATION
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath
- **Body outline:**
  - SITE 00 HAS PREPARED A PERSONAL FOUNDATION.
  - THE LINK BELOW OPENS YOUR PROJECT.
  - NO PAYMENT IS CONFIRMED IN THIS MESSAGE.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`, `{{recipient_email}}`
- **Required records:** artifact, recipient_email
- **Fallback:** If business_name is missing, drop the name line. Never invent a business name.
- **Opt-out:** NONE. This is the access message for the artifact. It is not a marketing send and must not carry a campaign.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## intake-started

- **Name:** INTAKE STARTED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** INTAKE_STARTED
- **Subject:** YOUR INTAKE IS OPEN
- **Preheader:** CONTINUE WHERE YOU LEFT OFF
- **Primary CTA:** CONTINUE INTAKE
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}?step=intake`
- **Route source:** digitalFoundationClientIntakePath
- **Body outline:**
  - INTAKE IS IN PROGRESS.
  - NOTHING IN THIS MESSAGE SAYS THE INTAKE IS COMPLETE.
  - THE BUTTON RETURNS TO THE INTAKE STEP.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`
- **Required records:** artifact
- **Fallback:** If the intake is no longer open, do not send. The dispatcher must read intake_state.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF. NO MARKETING UNSUBSCRIBE BLOCK.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## intake-completed

- **Name:** INTAKE COMPLETED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** INTAKE_COMPLETED
- **Subject:** YOUR INTAKE IS RECEIVED
- **Preheader:** SITE 00 HAS YOUR FOUNDATION DETAILS
- **Primary CTA:** VIEW YOUR FOUNDATION
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath
- **Body outline:**
  - INTAKE IS COMPLETE.
  - A QUOTE IS A LATER MESSAGE.
  - THIS MESSAGE DOES NOT STATE A PRICE.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`
- **Required records:** artifact
- **Fallback:** Do not send if intake_state is not complete.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## quote-ready

- **Name:** QUOTE READY
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** QUOTE_CREATED
- **Subject:** YOUR QUOTE IS READY
- **Preheader:** REVIEW THE FOUNDATION QUOTE IN YOUR PROJECT
- **Primary CTA:** REVIEW YOUR QUOTE
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** resolveDigitalFoundationArtifactUiStep → quote when surface is QUOTE
- **Body outline:**
  - A QUOTE IS READY.
  - VERSION {{quote_version}}.
  - TOTAL APPEARS ONLY FROM THE QUOTE RECORD.
  - THIS MESSAGE DOES NOT SAY THE QUOTE IS ACCEPTED.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`, `{{quote_version}}`, `{{quote_total_display}}`
- **Required records:** artifact, quote
- **Fallback:** If quote_total_display is missing, omit the total line. Do not print a sample price.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## quote-updated

- **Name:** QUOTE UPDATED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** QUOTE_UPDATED
- **Subject:** YOUR QUOTE WAS UPDATED
- **Preheader:** REVIEW VERSION {{quote_version}} BEFORE YOU CONTINUE
- **Primary CTA:** REVIEW THE UPDATED QUOTE
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath
- **Body outline:**
  - THE QUOTE ON YOUR FOUNDATION CHANGED.
  - EARLIER ACCEPTANCE DOES NOT CARRY FORWARD UNLESS THE SYSTEM SAYS SO.
  - NO PAYMENT STATUS IS STATED HERE.
- **Placeholders:** `{{quote_version}}`, `{{quote_total_display}}`, `{{public_token}}`
- **Required records:** artifact, quote
- **Fallback:** Omit the total if the quote record has no display amount.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## quote-accepted

- **Name:** QUOTE ACCEPTED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** QUOTE_ACCEPTED
- **Subject:** YOUR QUOTE ACCEPTANCE IS RECORDED
- **Preheader:** PAYMENT IS A SEPARATE STEP
- **Primary CTA:** CONTINUE TO CHECKOUT
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath
- **Body outline:**
  - ACCEPTANCE IS RECORDED FOR VERSION {{quote_version}}.
  - TERMS {{terms_version}}.
  - THIS IS NOT A PAYMENT RECEIPT.
- **Placeholders:** `{{quote_version}}`, `{{terms_version}}`, `{{public_token}}`
- **Required records:** artifact, quote_acceptance
- **Fallback:** If terms_version is missing, omit that line. Do not invent a terms label.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## checkout-link-ready

- **Name:** CHECKOUT LINK READY
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** CHECKOUT_CREATED
- **Subject:** YOUR CHECKOUT IS READY
- **Preheader:** CONTINUE TO PAYMENT WHEN YOU ARE READY
- **Primary CTA:** CONTINUE TO PAYMENT
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** surface CHECKOUT resolves to the quote/checkout step
- **Body outline:**
  - CHECKOUT IS OPEN.
  - THIS MESSAGE DOES NOT SAY PAYMENT SUCCEEDED OR FAILED.
- **Placeholders:** `{{public_token}}`, `{{business_name}}`
- **Required records:** artifact, checkout
- **Fallback:** Do not send if no checkout exists.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## payment-confirmed

- **Name:** PAYMENT CONFIRMED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** ESSENTIAL_SERVICE
- **Trigger:** PAYMENT_CONFIRMED
- **Subject:** YOUR PAYMENT IS CONFIRMED
- **Preheader:** SITE 00 RECORDED THE PAYMENT ON YOUR FOUNDATION
- **Primary CTA:** OPEN YOUR PROJECT
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath
- **Body outline:**
  - PAYMENT IS CONFIRMED.
  - AMOUNT LINE USES {{payment_amount_display}} FROM THE PAYMENT RECORD.
  - THIS DOES NOT SAY THE FOUNDATION IS COMPLETE.
- **Placeholders:** `{{payment_amount_display}}`, `{{public_token}}`
- **Required records:** artifact, payment
- **Fallback:** If the amount is missing, omit the amount line. Do not print a fixture number in the master.
- **Opt-out:** SERVICE NOTICE. NO MARKETING UNSUBSCRIBE. PREFERENCE FOOTER MAY LINK TO OPTIONAL CATEGORIES ONLY.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## payment-failed

- **Name:** PAYMENT FAILED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** ESSENTIAL_SERVICE
- **Trigger:** PAYMENT_FAILED
- **Subject:** YOUR PAYMENT NEEDS ATTENTION
- **Preheader:** THE PAYMENT DID NOT COMPLETE
- **Primary CTA:** REVIEW PAYMENT
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** surface PAYMENT_RECOVERY resolves to the quote step
- **Body outline:**
  - THE PAYMENT DID NOT COMPLETE.
  - NO CARD NUMBER APPEARS HERE.
  - THE BUTTON RETURNS TO THE FOUNDATION SO THE CLIENT CAN REVIEW PAYMENT.
  - THIS IS NOT A SECOND CHARGE NOTICE.
- **Placeholders:** `{{public_token}}`, `{{business_name}}`
- **Required records:** artifact, payment_attempt
- **Fallback:** Do not state a decline code unless the payment record provides one. Never invent a failure reason.
- **Opt-out:** SERVICE NOTICE. NO MARKETING UNSUBSCRIBE.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.
- **Collision:** shared/site00-email registry id payment-failed is a studio billing template (sentence-case subject). It is not this Digital Foundation design.

## project-activated

- **Name:** PROJECT ACTIVATED
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** PROJECT_ACTIVATED
- **Subject:** YOUR PROJECT IS ACTIVE
- **Preheader:** THE FOUNDATION PROJECT IS OPEN
- **Primary CTA:** OPEN YOUR PROJECT
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath
- **Body outline:**
  - THE PROJECT IS ACTIVE.
  - COMPLETION AND RECORDS ARE LATER MESSAGES.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`
- **Required records:** artifact
- **Fallback:** Do not send before PROJECT_ACTIVATED is recorded.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## client-action-required

- **Name:** CLIENT ACTION REQUIRED
- **Classification:** OPERATIONAL
- **Family:** OPERATIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** CLIENT_ACTION_REQUESTED
- **Subject:** A FOUNDATION ACTION NEEDS YOU
- **Preheader:** OPEN THE PROJECT TO COMPLETE THE REQUEST
- **Primary CTA:** COMPLETE THE REQUEST
- **Secondary CTA:** OPEN YOUR PROJECT
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** PORTAL surface
- **Body outline:**
  - AN ACTION IS WAITING.
  - TITLE: {{action_title}}.
  - CLIENT-ENTERED TEXT KEEPS ITS ORIGINAL CASE.
  - THIS IS NOT AN APPROVAL CONFIRMATION.
- **Placeholders:** `{{action_title}}`, `{{client_message}}`, `{{public_token}}`
- **Required records:** artifact, client_action
- **Fallback:** If action_title is missing, use the generic line AN ACTION IS WAITING and do not invent a task name.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF. NOT A MARKETING SEND.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## approval-requested

- **Name:** APPROVAL REQUESTED
- **Classification:** OPERATIONAL
- **Family:** OPERATIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** APPROVAL_REQUESTED
- **Subject:** YOUR APPROVAL IS REQUESTED
- **Preheader:** REVIEW THE ITEM IN YOUR FOUNDATION
- **Primary CTA:** REVIEW AND APPROVE
- **Secondary CTA:** OPEN YOUR PROJECT
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** PORTAL surface
- **Body outline:**
  - AN APPROVAL IS WAITING.
  - SUBJECT: {{approval_subject}}.
  - THIS MESSAGE DOES NOT SAY THE ITEM IS APPROVED.
- **Placeholders:** `{{approval_subject}}`, `{{public_token}}`
- **Required records:** artifact, approval_request
- **Fallback:** If approval_subject is missing, omit it. Do not invent the item.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## approval-completed

- **Name:** APPROVAL COMPLETED
- **Classification:** OPERATIONAL
- **Family:** OPERATIONAL
- **Consent:** PROJECT_OPERATIONS
- **Trigger:** CLIENT_ACTION_COMPLETED
- **Subject:** YOUR ACTION IS RECORDED
- **Preheader:** THE REQUEST ON YOUR FOUNDATION IS COMPLETE
- **Primary CTA:** VIEW PROJECT STATUS
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** PORTAL surface
- **Body outline:**
  - THE ACTION IS RECORDED COMPLETE.
  - TITLE: {{action_title}}.
  - A SEPARATE APPROVED EVENT DOES NOT SEND A SECOND EMAIL.
- **Placeholders:** `{{action_title}}`, `{{public_token}}`
- **Required records:** artifact, client_action
- **Fallback:** Omit the title if the action record has none.
- **Opt-out:** SUPPRESS WHEN PROJECT OPERATIONS PREFERENCE IS OFF.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## foundation-complete

- **Name:** FOUNDATION COMPLETE
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** ESSENTIAL_SERVICE
- **Trigger:** FOUNDATION_COMPLETED
- **Subject:** YOUR FOUNDATION IS COMPLETE
- **Preheader:** THE FOUNDATION SERVICE IS RECORDED COMPLETE
- **Primary CTA:** VIEW YOUR FOUNDATION
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** surface COMPLETE
- **Body outline:**
  - THE FOUNDATION IS COMPLETE.
  - RECORDS AVAILABILITY IS A SEPARATE MESSAGE.
  - NO UPSELL COPY IN THIS TEMPLATE.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`
- **Required records:** artifact
- **Fallback:** Do not send on marketing journeys.
- **Opt-out:** SERVICE NOTICE. NO MARKETING UNSUBSCRIBE. DO NOT ATTACH A BLDR OR CREDIT OFFER.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## records-available

- **Name:** RECORDS AVAILABLE
- **Classification:** TRANSACTIONAL
- **Family:** TRANSACTIONAL
- **Consent:** ESSENTIAL_SERVICE
- **Trigger:** FOUNDATION_VERIFIED
- **Subject:** YOUR RECORDS ARE AVAILABLE
- **Preheader:** OPEN THE FOUNDATION TO VIEW RECORDS
- **Primary CTA:** OPEN YOUR RECORDS
- **Secondary CTA:** NONE
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** surface COMPLETE / portal records inside FoundationClient
- **Body outline:**
  - VERIFICATION IS RECORDED.
  - RECORDS CAN BE OPENED FROM THE FOUNDATION.
  - THIS MESSAGE DOES NOT LIST PRIVATE DOCUMENTS.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`
- **Required records:** artifact, verification
- **Fallback:** Do not attach document names unless the records projection already exposes them to the client.
- **Opt-out:** SERVICE NOTICE. NO MARKETING UNSUBSCRIBE.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## foundation-credit-issued

- **Name:** FOUNDATION CREDIT ISSUED
- **Classification:** MARKETING
- **Family:** MARKETING
- **Consent:** MARKETING
- **Trigger:** CREDIT_CREATED
- **Subject:** A FOUNDATION CREDIT IS ON YOUR PROJECT
- **Preheader:** VIEW THE CREDIT INSIDE YOUR FOUNDATION
- **Primary CTA:** VIEW YOUR CREDIT
- **Secondary CTA:** MANAGE PREFERENCES
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** digitalFoundationClientPath. preference_url is not implemented.
- **Body outline:**
  - A CREDIT IS RECORDED.
  - AMOUNT AND WINDOW COME FROM THE CREDIT RECORD.
  - THIS IS NOT A PAYMENT RECEIPT AND NOT A COMPLETION NOTICE.
- **Placeholders:** `{{credit_amount_display}}`, `{{credit_valid_until}}`, `{{preference_url}}`, `{{public_token}}`
- **Required records:** artifact, credit, marketing_opt_in
- **Fallback:** If the amount or date is missing, omit that line. The sentence A FOUNDATION CREDIT IS ON YOUR PROJECT still stands.
- **Opt-out:** REQUIRES marketing_opt_in. UNSUBSCRIBE, PREFERENCE LINK, SUPPRESSION ON UNSUBSCRIBE, BOUNCE, COMPLAINT, FOUNDER, POLICY.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## bldr-discovery

- **Name:** BLDR DISCOVERY
- **Classification:** MARKETING
- **Family:** MARKETING
- **Consent:** MARKETING
- **Trigger:** BUILD_INTEREST_CAPTURED
- **Subject:** YOUR BUILD INTEREST IS RECORDED
- **Preheader:** CONTINUE THE BLDR CONVERSATION FROM YOUR FOUNDATION
- **Primary CTA:** CONTINUE WITH BLDR
- **Secondary CTA:** MANAGE PREFERENCES
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** event map BUILD_INTEREST_CAPTURED
- **Body outline:**
  - BUILD INTEREST IS ON THE RECORD.
  - THIS IS NOT A BOOKING CONFIRMATION.
  - BUILD_BOOKED HAS NO EMAIL TEMPLATE.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`, `{{preference_url}}`
- **Required records:** artifact, build_interest, marketing_opt_in
- **Fallback:** Do not send if marketing_opt_in is false, even when interest was captured.
- **Opt-out:** REQUIRES marketing_opt_in PLUS THE INTEREST EVENT. FULL MARKETING FOOTER.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## M01

- **Name:** DIGITAL FOUNDATION EDUCATION
- **Classification:** PLANNED_CONTRACT
- **Family:** MARKETING
- **Consent:** EDUCATIONAL
- **Trigger:** NONE BOUND
- **Subject:** HOW THE DIGITAL FOUNDATION WORKS
- **Preheader:** A SHORT GUIDE TO THE FOUNDATION
- **Primary CTA:** LEARN THE FOUNDATION
- **Secondary CTA:** MANAGE PREFERENCES
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** DIGITAL_FOUNDATION_V2_EMAIL_TEMPLATE_MANIFEST.json M01
- **Body outline:**
  - WHAT THE FOUNDATION IS.
  - WHAT IT DOES NOT PROMISE.
  - NO PRICE, NO PAYMENT STATUS, NO PROJECT PERCENTAGE.
- **Placeholders:** `{{business_name}}`, `{{preference_url}}`
- **Required records:** educational preference
- **Fallback:** If there is no public_token, this journey does not send. Do not fall back to a broadcast list in this pack.
- **Opt-out:** SUPPRESS WHEN educational IS FALSE. STILL CARRY UNSUBSCRIBE AND A PREFERENCE LINK. DO NOT SEND UNDER ESSENTIAL_SERVICE.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## M06

- **Name:** BLDR INTRODUCTION
- **Classification:** PLANNED_CONTRACT
- **Family:** MARKETING
- **Consent:** MARKETING
- **Trigger:** NONE BOUND
- **Subject:** AN INTRODUCTION TO BLDR
- **Preheader:** WHAT BLDR IS, WITHOUT A BOOKING CLAIM
- **Primary CTA:** SEE BLDR
- **Secondary CTA:** MANAGE PREFERENCES
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** manifest M06
- **Body outline:**
  - BLDR IS INTRODUCED.
  - NO INTEREST IS CLAIMED.
  - NO BOOKING IS CLAIMED.
- **Placeholders:** `{{business_name}}`, `{{preference_url}}`
- **Required records:** marketing_opt_in
- **Fallback:** Do not send when marketing_opt_in is false.
- **Opt-out:** REQUIRES marketing_opt_in. FULL MARKETING FOOTER.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

## M13

- **Name:** POST-COMPLETION FOLLOW-UP
- **Classification:** PLANNED_CONTRACT
- **Family:** MARKETING
- **Consent:** MARKETING
- **Trigger:** NONE BOUND
- **Subject:** AFTER THE FOUNDATION
- **Preheader:** A FOLLOW-UP FROM SITE 00
- **Primary CTA:** SEE WHAT COMES NEXT
- **Secondary CTA:** MANAGE PREFERENCES
- **Destination:** `/foundation/{{public_token}}`
- **Route source:** manifest M13
- **Body outline:**
  - THE FOUNDATION SERVICE IS ALREADY COMPLETE.
  - THIS MESSAGE IS OPTIONAL.
  - IT DOES NOT REOPEN A PAYMENT OR A VERIFICATION CLAIM.
- **Placeholders:** `{{business_name}}`, `{{public_token}}`, `{{preference_url}}`
- **Required records:** artifact completion, marketing_opt_in
- **Fallback:** Do not send if the artifact is not complete. Do not send if marketing_opt_in is false.
- **Opt-out:** REQUIRES marketing_opt_in. FULL MARKETING FOOTER.
- **Sender:** UNREGISTERED. No from-address is stored on the Digital Foundation communications domain. Do not invent one.

