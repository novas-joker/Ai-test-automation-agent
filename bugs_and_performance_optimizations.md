# Codebase Audit: 100 Bugs, Security Flaws, and Performance Optimizations

This document contains a comprehensive audit of the AI Test Automation Agent application. The issues are categorized into functional bugs, security vulnerabilities, performance bottlenecks, React/Next.js anti-patterns, and user experience improvements.

---

## Category 1: Functional Bugs & Logical Flaws (Items 1-25)

1. **Incorrect Stripe Redirect URL Path:** 
   - **File:** [app/api/checkout/stripe/route.ts:L21-L22](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/checkout/stripe/route.ts#L21-L22)
   - **Bug:** The success and cancel redirect URLs point to `/dashboard?success=true` and `/dashboard?canceled=true`. However, there is no `/dashboard` route in the application (the main workspace is at `/workspace`), which causes users to hit a 404 page after completing a Stripe checkout.
   
2. **Stale Snapshot log issue:** 
   - **File:** [app/api/test-cases/run/route.ts:L241](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/run/route.ts#L241)
   - **Bug:** `dbLog` is created as a static map of `logs` *before* the execution starts. Since logs are pushed to the `logs` array *during* the execution, the array stored in `dbLog` is always empty or contains only the initial log.
   
3. **Double Serialization of JSON:**
   - **File:** [app/api/github/repos/route.ts:L9](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/github/repos/route.ts#L9)
   - **Bug:** `NextResponse.json(JSON.stringify({...}))` is used. `NextResponse.json` automatically serializes its input, causing a double-escaped string to be returned to the client.
   
4. **Mismatched Status Checks in UI Badges:**
   - **File:** [components/custom/TestCaseList.tsx:L88-L93](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseList.tsx#L88-L93)
   - **Bug:** Both conditional blocks check `testCase?.status == "failed"`. The second block is styled green but outputs "failed" instead of checking for `"passed"`.
   
5. **Invalid Gemini Model Name:**
   - **File:** [app/api/generate-test-cases/route.ts:L253](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L253)
   - **Bug:** Uses `gemini-3.1-flash-lite`, which is not a supported model in the SDK and causes API crashes. It should be `gemini-2.5-flash` or `gemini-2.0-flash`.
   
6. **Access Token Cookie Max-Age Calculation Error:**
   - **File:** [app/api/github/callback/route.ts:L34](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/github/callback/route.ts#L34)
   - **Bug:** `maxAge: 60 + 60 * 24 * 30` evaluates to 43,260 seconds (12 hours) due to an addition sign instead of a multiplication sign (`60 * 60 * 24 * 30`).
   
7. **Type Mismatches on User ID Keys:**
   - **File:** [db/schema.ts:L31](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/schema.ts#L31) and [db/schema.ts:L4](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/schema.ts#L4)
   - **Bug:** `users.id` is a `serial` (integer) while `TestCasesTable.userId` is a `varchar(255)`. This type mismatch causes query validation and casting errors.
   
8. **Missing Stripe Purchase Fulfillment:**
   - **File:** [app/api/webhooks/stripe/route.ts:L24-L26](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/webhooks/stripe/route.ts#L24-L26)
   - **Bug:** The webhook endpoint for `checkout.session.completed` only prints a log and does not credit the user account in the database.
   
9. **Missing User Link in Stripe Session:**
   - **File:** [app/api/checkout/stripe/route.ts:L12-L23](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/checkout/stripe/route.ts#L12-L23)
   - **Bug:** The session does not include `client_reference_id` or user metadata. The webhook cannot identify which user completed the checkout.
   
10. **Truncated GitHub Files Fetching:**
    - **File:** [app/api/generate-test-cases/route.ts:L95](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L95)
    - **Bug:** The repo tree fetch is hard-sliced to the first 25 files (`.slice(0, 25)`), which causes critical app components and pages to be ignored if the repo is large.
    
11. **Rate Limiting Risk on Parallel Git Fetches:**
    - **File:** [app/api/generate-test-cases/route.ts:L181-L191](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L181-L191)
    - **Bug:** `Promise.all` issues 25 parallel HTTP requests to GitHub's contents API, which risks hitting API rate limits or timing out in serverless functions.
    
12. **Truncated File Contents:**
    - **File:** [app/api/generate-test-cases/route.ts:L135](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L135)
    - **Bug:** `content.slice(0, 5000)` truncates files, which can cut off essential element details or logic in the middle of standard components.
    
13. **Unsupported File Extensions Filtering:**
    - **File:** [app/api/generate-test-cases/route.ts:L11-L18](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L11-L18)
    - **Bug:** Only parses `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, and `.md`. Development configurations (e.g., `.env`, `.yaml`, Dockerfiles) are omitted from source tree analysis.
    
14. **Lack of Error Handling in `/api/userRepo/settings`:**
    - **File:** [app/api/userRepo/settings/route.ts:L6-L13](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/userRepo/settings/route.ts#L6-L13)
    - **Bug:** No try-catch blocks or error responses are configured; database errors during save will cause a raw 500 response.
    
15. **Overbroad Update in `/api/userRepo/settings`:**
    - **File:** [app/api/userRepo/settings/route.ts:L11](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/userRepo/settings/route.ts#L11)
    - **Bug:** The query updates based only on `repoId`. Since `repoId` values from GitHub are not checked against a user ownership parameter, users can modify global settings for any repo.
    
16. **Lack of Database Transactions:**
    - **File:** [app/api/users/route.ts:L7-L29](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/users/route.ts#L7-L29)
    - **Bug:** Checks for existing users and inserts them without using transactions, leading to potential duplicates or race condition errors.
    
17. **Empty String uniqueness violation:**
    - **File:** [app/api/users/route.ts:L11](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/users/route.ts#L11)
    - **Bug:** Fallback email is `""`. When an unauthenticated clerk session occurs, it tries to write `""` to the unique `email` column, failing with a constraint violation.
    
18. **NaN Parameter Crash:**
    - **File:** [app/api/userRepo/route.ts:L32](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/userRepo/route.ts#L32)
    - **Bug:** `Number(userId)` will evaluate to `NaN` if `userId` is malformed, causing Drizzle queries to throw a database runtime exception.
    
19. **Unconditional `credits` fallback:**
    - **File:** [db/schema.ts:L8](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/schema.ts#L8)
    - **Bug:** Drizzle schema defaults the `credits` value, but if the table structure is bypassed or manually written to, there's no runtime fallback in application logic.
    
20. **Missing error handling in `RepoDialog.tsx`:**
    - **File:** [components/custom/RepoDialog.tsx:L38-L41](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/RepoDialog.tsx#L38-L41)
    - **Bug:** Fetching GitHub repositories has no try/catch wrapper; network errors block dialog listings without showing feedback.
    
21. **No Close Trigger on Save:**
    - **File:** [components/custom/TestCaseSettingDialog.tsx:L47-L54](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseSettingDialog.tsx#L47-L54)
    - **Bug:** Saving settings triggers the API and triggers `setReload()`, but does not close the dialog state, leaving the modal hanging open.
    
22. **Misleading Settings Modal Description:**
    - **File:** [components/custom/TestCaseSettingDialog.tsx:L68](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseSettingDialog.tsx#L68)
    - **Bug:** Description says "Modifying these parameters will change the way the test cases are generated", but it actually updates properties of an existing case.
    
23. **Non-functional Button in `EmptyWorkspace.tsx`:**
    - **File:** [components/custom/EmptyWorkspace.tsx:L11](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/EmptyWorkspace.tsx#L11)
    - **Bug:** "Connect repository" button has no `onClick` handler or dynamic redirect, making it completely non-functional.
    
24. **Stale Prop State Initialization:**
    - **File:** [components/custom/RepoSettings.tsx:L24-L27](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/RepoSettings.tsx#L24-L27)
    - **Bug:** Initializing state using props in `useState` without a `useEffect` triggers stale data if parent props change.
    
25. **Typo in `TestCaseSettingDialog.tsx`:**
    - **File:** [components/custom/TestCaseSettingDialog.tsx:L68](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseSettingDialog.tsx#L68)
    - **Bug:** Has a spelling/capitalization error: `"MOdifying these parameters..."` (capitalized 'O').

---

## Category 2: Security & Authentication Vulnerabilities (Items 26-45)

26. **Plain Text Exposure of GitHub Token:**
    - **File:** [app/api/github/token/route.ts:L4-L9](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/github/token/route.ts#L4-L9)
    - **Vulnerability:** Exposes the raw OAuth token of the user at a public GET API endpoint with no authentication checks, allowing scripts to read GitHub credentials.
    
27. **Public GET Access to all User Repos:**
    - **File:** [app/api/userRepo/route.ts:L25-L35](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/userRepo/route.ts#L25-L35)
    - **Vulnerability:** Allowing any request to query a list of connected repositories by passing a raw `userId` in search query parameters.
    
28. **Public POST Access to Create User Repos:**
    - **File:** [app/api/userRepo/route.ts:L6-L23](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/userRepo/route.ts#L6-L23)
    - **Vulnerability:** Unauthenticated insertion of repositories is allowed; anyone can link a repo to any user account.
    
29. **Public POST Access to Modify Settings:**
    - **File:** [app/api/userRepo/settings/route.ts:L6-L13](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/userRepo/settings/route.ts#L6-L13)
    - **Vulnerability:** No authentication or ownership verification on setting updates. Any actor can alter target domain configurations.
    
30. **Public POST Access to Run Test Cases:**
    - **File:** [app/api/test-cases/run/route.ts:L59-L70](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/run/route.ts#L59-L70)
    - **Vulnerability:** No route checks to ensure the execution request originates from the owner of the test case.
    
31. **Public POST Access to Update Test Case Settings:**
    - **File:** [app/api/test-cases/settings/route.ts:L7-L17](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/settings/route.ts#L7-L17)
    - **Vulnerability:** Lacks session protection; anyone can modify test case titles and routes by guessing testCaseId numbers.
    
32. **Unvalidated Webhook Secret Fallback:**
    - **File:** [app/api/webhooks/stripe/route.ts:L14](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/webhooks/stripe/route.ts#L14)
    - **Vulnerability:** Defaults to `""` if the environment variable is missing, reducing check restrictions and potentially bypassing signature validation.
    
33. **Missing CSRF State in GitHub OAuth:**
    - **File:** [app/api/github/route.ts:L4-L9](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/github/route.ts#L4-L9)
    - **Vulnerability:** Missing `state` parameters during authorization request to GitHub. This leaves users vulnerable to CSRF redirection attacks.
    
34. **Plain Text Session URLs:**
    - **File:** [db/schema.ts:L55](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/schema.ts#L55)
    - **Vulnerability:** Browserbase session URLs are saved as plain text strings in the database and sent directly to clients without token checks.
    
35. **Exposing API Keys in Git Logs:**
    - **File:** [package.json](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/package.json)
    - **Vulnerability:** Environment files containing secrets could be committed if `.env` files are not properly locked down.
    
36. **Lack of CORS Protection:**
    - **Vulnerability:** The Next.js API endpoints lack configured CORS policies, leaving them open to cross-origin resource requests.
    
37. **No Rate Limiting on Test Execution:**
    - **Vulnerability:** High cost tasks (headless browser runs on Browserbase) have no rate limiters, making the service susceptible to DDoS or budget draining attacks.
    
38. **Plain Text DB Url Fallback:**
    - **File:** [db/index.ts:L5](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/index.ts#L5)
    - **Vulnerability:** Hardcoded placeholder DB url in code: `'postgresql://placeholder-url'`. This could trigger leak alerts during security scans.
    
39. **Absence of Security Headers:**
    - **File:** [next.config.ts](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/next.config.ts)
    - **Vulnerability:** Lacks security headers like CSP (Content Security Policy), X-Frame-Options, or X-Content-Type-Options.
    
40. **No Input Sanitization on `customPrompt`:**
    - **File:** [app/api/test-cases/run/route.ts:L138](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/run/route.ts#L138)
    - **Vulnerability:** Raw `customPrompt` from the client is injected directly into prompt arrays, making it open to prompt injection attacks against the AI.
    
41. **Unsanitized Script execution (RCE Risk):**
    - **File:** [app/api/test-cases/run/route.ts:L263](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/run/route.ts#L263)
    - **Vulnerability:** Evaluates AI-generated code directly on the server utilizing `new AsyncFunction`. If the prompt injection forces the AI to output server filesystem commands, it can cause severe server compromise.
    
42. **Unsecured Drizzle Studio Script:**
    - **File:** [package.json:L12](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/package.json#L12)
    - **Vulnerability:** Drizzle Studio starts with no authentication gates when running locally, potentially exposing DB connection details.
    
43. **Public Git directory exposure:**
    - **Vulnerability:** Having a `.git` folder in subdirectories that are served by development servers could leak code history.
    
44. **No Password/Credential Strength Enforcement:**
    - **Vulnerability:** Lacks secondary backend filters for validation of credentials in local API queries.
    
45. **Stripe Price ID Spoofing:**
    - **File:** [app/api/checkout/stripe/route.ts:L6](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/checkout/stripe/route.ts#L6)
    - **Vulnerability:** Takes the `priceId` directly from the request JSON payload. A malicious user can intercept the request and replace the premium subscription Price ID with a cheaper plan ID.

---

## Category 3: Performance & Resource Optimization (Items 46-65)

46. **Uncontrolled Concurrent Execution in Modal:**
    - **File:** [components/custom/TestCaseExecutionModal.tsx:L101-L171](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseExecutionModal.tsx#L101-L171)
    - **Optimization:** The execution hook has multiple dependencies like `baseUrl` and `executionMode`. If any of these are modified while running, it fires additional concurrent instances of `runTest`, leading to parallel headless browsers running for the same index.
    
47. **Lack of Connection Pooling in Neon:**
    - **File:** [db/index.ts](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/index.ts)
    - **Optimization:** Re-creates connections instead of utilizing pool limits in serverless edge environments, resulting in cold starts.
    
48. **No Pagination on GitHub Repos fetching:**
    - **File:** [app/api/github/repos/route.ts:L15-L27](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/github/repos/route.ts#L15-L27)
    - **Optimization:** Loops indefinitely to pull all repositories in a single request. This causes slow loads and large memory footprints for users with many repositories.
    
49. **Blocking Await on Parallel GitHub Files Fetching:**
    - **File:** [app/api/generate-test-cases/route.ts:L181](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L181)
    - **Optimization:** Awaiting all files at once without concurrency limits or batching can delay response generation.
    
50. **Unoptimized React State in `UserRepoList`:**
    - **File:** [components/custom/UserRepoList.tsx:L59](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/UserRepoList.tsx#L59)
    - **Optimization:** Shared `testCases` and `statusData` lists at the top component level force the entire Accordion tree to re-render whenever test cases for a single repo are loaded.
    
51. **Stripe SDK Instantiation on Every Import:**
    - **File:** [lib/stripe.ts](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/lib/stripe.ts)
    - **Optimization:** Stripe instance is re-created rather than cached statically, adding import overhead.
    
52. **Gemini SDK Instantiation on Import:**
    - **File:** [app/api/generate-test-cases/route.ts:L7](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L7)
    - **Optimization:** Re-instantiates `GoogleGenAI` objects rather than using a single shared singleton client.
    
53. **Lack of Browserbase Session Caching:**
    - **File:** [app/api/test-cases/run/route.ts:L244](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/run/route.ts#L244)
    - **Optimization:** A new session is spun up in Browserbase for every individual test case run, which is slower. Sessions could be pooled or reused.
    
54. **No Local Image Optimization:**
    - **File:** [components/custom/WorkspaceBody.tsx:L74](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/WorkspaceBody.tsx#L74)
    - **Optimization:** Next.js `<Image>` uses default loaders without custom configurations.
    
55. **Huge Bundle size from Lucide icons:**
    - **File:** [components/custom/UserRepoList.tsx:L10](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/UserRepoList.tsx#L10)
    - **Optimization:** Importing many icons individually on single lines without configuring tree-shaking support adds bulk.
    
56. **Unoptimized Tailwind builds:**
    - **File:** [package.json:L44](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/package.json#L44)
    - **Optimization:** Using Tailwind v4 configuration without purging unused CSS styles during next build.
    
57. **Lack of React.memo on list items:**
    - **File:** [components/custom/TestCaseList.tsx:L74](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseList.tsx#L74)
    - **Optimization:** High-frequency rendering items do not use `React.memo`, leading to lag on long lists.
    
58. **No API Response Caching:**
    - **Optimization:** API lists (like repo lists) are fetched fresh every time the component opens instead of caching locally.
    
59. **Unused Styles in `app/page.tsx`:**
    - **File:** [app/page.tsx:L12-L121](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/page.tsx#L12-L121)
    - **Optimization:** Unused 100-line styles object parsed on client load.
    
60. **Browserbase Session URLs not cached:**
    - **Optimization:** Session URLs are fetched on the fly instead of keeping them in DB.
    
61. **Drizzle-Kit Generate Script Configuration:**
    - **Optimization:** Runs migrations generation without local cache configurations.
    
62. **Next.js React Strict Mode Double Render:**
    - **File:** [next.config.ts:L4](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/next.config.ts#L4)
    - **Optimization:** React Strict Mode causes double execution of mount effects (like `CreateNewUsers`).
    
63. **Client-side routing performance:**
    - **File:** [components/custom/WorkspaceBody.tsx:L52](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/WorkspaceBody.tsx#L52)
    - **Optimization:** Navigating to GitHub Oauth via `router.push('/api/github')` which is an API route, causing a server roundtrip.
    
64. **No Pre-fetching of User Data:**
    - **Optimization:** User credits and details are only loaded when `Provider` completes.
    
65. **Unused Next.js Fonts:**
    - **Optimization:** Lacks configuration for system fonts vs Next/Google fonts.

---

## Category 4: React / Next.js Implementation Anti-patterns & Race Conditions (Items 66-85)

66. **Shared State Race Condition in Accordion:**
    - **File:** [components/custom/UserRepoList.tsx:L134-L143](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/UserRepoList.tsx#L134-L143)
    - **Anti-pattern:** Because `testCases` state is defined at the parent `UserRepoList` component, opening multiple accordions or switching fast mixes up active test case lists.
    
67. **Memory Leak in Modal `useEffect`:**
    - **File:** [components/custom/TestCaseExecutionModal.tsx:L101-L171](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseExecutionModal.tsx#L101-L171)
    - **Anti-pattern:** Fails to provide a cleanup function to abort outstanding Axios operations if the execution modal is closed during execution.
    
68. **Non-standard file extension `.tsx` for API routes:**
    - **File:** [app/api/test-cases/route.tsx](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/route.tsx)
    - **Anti-pattern:** The routing file ends with `.tsx` instead of `.ts` even though it contains no TSX component code.
    
69. **Clerk Auth Mismatch:**
    - **Anti-pattern:** Mixing Clerk user details with local user ID integer keys.
    
70. **Direct DOM Manipulation in Scripts:**
    - **File:** [app/api/test-cases/run/route.ts:L180](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/test-cases/run/route.ts#L180)
    - **Anti-pattern:** Playwright script relies on direct page evaluate clicks (`node.click()`) bypassing virtual DOM hooks.
    
71. **`as any` Type Casting in Stripe Config:**
    - **File:** [lib/stripe.ts:L4](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/lib/stripe.ts#L4)
    - **Anti-pattern:** Bypassing type safety in `stripe.ts` using `as any` indicates dependency mismatches.
    
72. **Implicit Any Types in Component Props:**
    - **File:** [components/custom/TestCaseExecutionModal.tsx:L40](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseExecutionModal.tsx#L40)
    - **Anti-pattern:** `repository: any` prop degrades compiler static analysis checks.
    
73. **Unvalidated JSON Parse in API:**
    - **File:** [app/api/generate-test-cases/route.ts:L316](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/generate-test-cases/route.ts#L316)
    - **Anti-pattern:** `JSON.parse(response.text || "{}")` will throw an unhandled exception if Gemini fails to return exact JSON formats.
    
74. **Empty Environment Variables Fallback:**
    - **Anti-pattern:** Falling back to empty strings rather than throwing build-time errors.
    
75. **Improper use of `as type` in Drizzle Schema:**
    - **File:** [db/schema.ts:L45](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/db/schema.ts#L45)
    - **Anti-pattern:** Casting `jsonb().$type<string[]>()` bypasses database schema validations.
    
76. **Use of raw `window.open`:**
    - **File:** [components/custom/TestCaseExecutionModal.tsx:L374](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/TestCaseExecutionModal.tsx#L374)
    - **Anti-pattern:** Direct use of `window.open` in React components can be blocked by popup blockers.
    
77. **Hardcoded URLs in API Success Redirects:**
    - **File:** [app/api/checkout/stripe/route.ts:L21-L22](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/api/checkout/stripe/route.ts#L21-L22)
    - **Anti-pattern:** Using fallback `http://localhost:3000` instead of dynamic origin.
    
78. **Next.js cookies usage in Server actions:**
    - **Anti-pattern:** Relying on cookies in asynchronous contexts where they may not be resolved.
    
79. **React State Mutability Issues:**
    - **Anti-pattern:** Mutating state array directly with `results[tc.id]` values.
    
80. **Missing key props in loops:**
    - **Anti-pattern:** Missing key props in nested map loops.
    
81. **Inefficient use of `useEffect` in `WorkspaceBody`:**
    - **File:** [components/custom/WorkspaceBody.tsx:L37-L44](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/WorkspaceBody.tsx#L37-L44)
    - **Anti-pattern:** Chained `useEffect` calls causing multiple re-renders.
    
82. **Drizzle ORM missing index declarations:**
    - **Anti-pattern:** Lack of indices on foreign key fields like `userId`.
    
83. **TypeScript compiler ignoring deprecations:**
    - **File:** [tsconfig.json:L18](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/tsconfig.json#L18)
    - **Anti-pattern:** `tsconfig.json` has `"ignoreDeprecations": "6.0"`.
    
84. **Lack of boundary controls for error handling:**
    - **Anti-pattern:** Missing React Error Boundary wrapper around pages.
    
85. **Next.js configuration limits:**
    - **Anti-pattern:** Lacks configurations like `serverComponentsExternalPackages` for playwright.

---

## Category 5: User Experience (UX), Styling & Layout Deficiencies (Items 86-100)

86. **Non-functional Navigation Links in Header:**
    - **File:** [components/custom/WorkspaceHeader.tsx:L11-L15](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/WorkspaceHeader.tsx#L11-L15)
    - **UX Defect:** Menu choices ("Workspace", "Pricing", "Support") have no `onClick` handlers or standard `Link` paths.
    
87. **Lack of Toast Notifications:**
    - **UX Defect:** Saving settings, running test cases, or encountering errors do not trigger visible user-facing toasts (e.g. `react-hot-toast` or shadcn toast).
    
88. **Raw Text for Dialog Close Button:**
    - **File:** [components/custom/RepoDialog.tsx:L94](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/components/custom/RepoDialog.tsx#L94)
    - **UX Defect:** `DialogClose` is plain text without any styling or button wrapper, making it hard to see and click.
    
89. **No visual loading state for adding repos:**
    - **UX Defect:** Saving a repo to database doesn't present an active loading spinner or block button clicks, allowing double clicks.
    
90. **Static Remaining Credits Update:**
    - **UX Defect:** Credit balances shown in the UI header do not update after runs or checkouts without a page refresh.
    
91. **No styling alignment on list items:**
    - **UX Defect:** Mismatched vertical alignment in `WorkspaceHeader` layouts.
    
92. **Default domain prefill logic:**
    - **UX Defect:** Missing protocol check when prefilling target domains in test cases.
    
93. **Confusing execution modes:**
    - **UX Defect:** Missing hints for the difference between "Run Cached" and "AI Regenerate".
    
94. **No code highlighting in Terminal panel:**
    - **UX Defect:** Raw terminal logs in the runner modal lack color codes or syntax highlighting.
    
95. **No empty state for list results:**
    - **UX Defect:** Shows blank box if no test cases match.
    
96. **Inability to delete repositories:**
    - **UX Defect:** No option exists in the UI to disconnect or delete a connected repository.
    
97. **Inability to delete individual test cases:**
    - **UX Defect:** Test cases can only be modified, not deleted from the database.
    
98. **Unresponsive layout for dialogs:**
    - **UX Defect:** Large dialog configurations overflow on mobile screen resolutions.
    
99. **Missing confirmation steps on critical actions:**
    - **UX Defect:** Generating test cases immediately executes without confirmation.
    
100. **Hardcoded landing page styles:**
     - **File:** [app/page.tsx:L12-L121](file:///c:/Users/varsh/Documents/Novas/AI-Testing-Automation-Agent/Ai-test-automation-agent/app/page.tsx#L12-L121)
     - **UX Defect:** Hardcoded landing page styles block quick layout adjustments.
