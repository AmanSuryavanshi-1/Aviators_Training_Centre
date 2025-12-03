# Interview Prep - Quick Revision Guide

**Your Go-To Checklist Before Any Interview**  
**Read Time:** 15 minutes | **Format:** Point-based for quick memorization

---

## 🎯 THE BIG PICTURE (30 Seconds)

**What I Built:**
- Full-stack aviation training website for DGCA ground school
- Transformed business from 100% paid ads → diversified lead generation (organic SEO + targeted ads + cold outreach)
- Generated ₹3 lakh revenue from organic SEO leads alone (50+ total leads across all channels in 3-4 months)
- Zero cost for organic leads vs ₹500-800 per lead via ads

**The Technical Wins:**
- Achieved 95+ Lighthouse score (was <50)
- Built 3 n8n production workflows with 99.7% reliability (74+ nodes)
- Implemented llms.txt for AI search optimization (first in India aviation)
- Designed WhatsApp AI system (discontinued due to Meta policy change)

**The Impact:**
- Business: ₹3L revenue, infinite ROI, owner saves 3-4 hours daily
- Technical: 95+ Lighthouse, 19.3K impressions, 146 clicks
- Automation: 3-layer validation, session-based architecture, 15-20% cancellation recovery

---

## 📊 KEY NUMBERS (MEMORIZE THESE)

### Business Impact
- **50+ leads** (total in 3-4 months via organic + ads + cold outreach)
- **₹3,00,000 revenue** (from organic SEO leads only - 6 conversions)
- **12% conversion rate**
- **₹0 cost per organic lead** (vs ₹500-800 via ads)
- **Diversified lead sources** (organic SEO + targeted ads + cold outreach)

### Technical Wins
- **95+ Lighthouse** (up from <50)
- **19.3K impressions** (6 months Google data)
- **146 clicks** (0.8% CTR)
- **10.4 average position** (page 1-2)
- **20+ keywords** ranking page 1

### Architecture
- **15+ pages**, **40+ components**
- **3 production workflows**, **74+ n8n nodes**
- **99.7% workflow reliability**
- **<2s response time**
- **99.9% uptime**

### n8n Automation Impact
- **Response time:** 6+ hours → <2 minutes (180x faster)
- **Follow-up rate:** 20% manual → 100% automated
- **Owner admin time:** 3-4 hours/day → 30 min/day (85% reduction)
- **Cancellation recovery:** 15-20% reschedule rate

### Innovation
- **First in India** (llms.txt for aviation)
- **AI search optimization** (ChatGPT, Claude, Perplexity)
- **6-12 month moat** (competitive advantage)
- **WhatsApp AI discontinued** (Meta policy change lesson)

---

## 🎤 ELEVATOR PITCHES (60 Seconds Each)

### For Full-Stack Developer Roles

**Opening Hook:**
"I built a production platform that generates ₹3 lakh revenue with zero infrastructure costs."

**The Stack:**
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Firebase, Next.js API Routes
- Automation: n8n workflows with session-based architecture
- CMS: Sanity.io

**Key Technical Win:**
- Lighthouse optimization: <50 → 95+
- How: Image optimization (93% reduction), code splitting (67% reduction), font optimization
- Impact: Drove all organic traffic → 50+ leads → ₹3L revenue

**Why It Matters:**
"Performance directly drives business outcomes. Every optimization translated to better rankings and more revenue."

---

### For AI/Automation Developer Roles

**Opening Hook:**
"I designed automation workflows that handle the entire lead management process with 99.7% reliability."

**The Problem:**
- Manual process: Phone calls → Excel → Follow-ups
- Missed opportunities, slow response time
- No tracking, no automation

**What I Built (3 Production Workflows):**

**Workflow 1: Firebase Contact Form Automation**
- Trigger: Website form → Firebase → n8n webhook
- Actions: Validate → Send email → Create Airtable record → Wait 48hrs → Follow-up
- Result: Instant response (<2 min) to every inquiry

**Workflow 2: Cal.com Booking Confirmation**
- Trigger: Cal.com BOOKING_CREATED webhook
- Innovation: 3-layer validation solving "empty object bug"
- Result: 99.7% reliability, zero blank emails

**Workflow 3: Cancellation Recovery**
- Trigger: Cal.com BOOKING_CANCELLED webhook
- Actions: Acknowledge → Wait 7 days → Re-engagement email
- Result: 15-20% of cancelled bookings reschedule

**The Challenge Solved (Empty Object Bug):**
- Problem: 40% of booking confirmations had blank data
- Root cause: Cal.com sends `{}` for cancellations, n8n's `alwaysOutputData: true` passes it through
- Solution: 3-layer validation (structure → ID field → required fields)

**The Result:**
- 60% → 99.7% reliability
- Owner saves 3-4 hours daily
- Complete pipeline visibility in Airtable

**Why It Matters:**
"Automation isn't just about efficiency—it's about reliability and freeing humans to do what they do best. The owner teaches, the system handles admin."

---

### For Product/Technical PM Roles

**Opening Hook:**
"I transformed an aviation training institute from 100% paid ads to a diversified lead generation strategy, delivering ₹3L revenue from organic SEO alone while building additional channels (targeted ads + cold outreach)."

**The Problem:**
- Spending ₹35K/month on Facebook ads
- ₹500-800 per lead
- Zero organic presence
- Unsustainable business model

**What I Did:**
- Built full-stack platform (Next.js, Firebase)
- Optimized Lighthouse <50 → 95+
- Created content strategy (15+ blog posts)
- Designed automation workflows

**The Result:**
- 50+ leads in 3-4 months (organic + ads + cold outreach)
- ₹3 lakh revenue from organic SEO leads alone
- Infinite ROI on organic channel (₹0 cost vs ₹3L revenue)

**Why It Matters:**
"I connect technical decisions to business outcomes. Every optimization had measurable impact on revenue."

---

## 📖 THREE CORE STORIES (Use These for Deep Dives)

### Story 1: Lighthouse Optimization (The "Performance = Revenue" Story)

<img src="https://res.cloudinary.com/dr0lrme36/image/upload/f_auto,q_auto,w_1600,c_limit/v1764768010/aviators-training-centre/docs-assets/ASSET-10_Lighthouse_Optimization_BeforeAfter.png" alt="Lighthouse Optimization" width="900"/>

*Visual aid: Lighthouse optimization journey showing before/after scores and 5-part optimization strategy*

**🎯 Use this for:** Technical problem-solving, systematic thinking, business impact

**SETUP:**
- "After launch, we weren't ranking despite good content"
- "Ran Lighthouse: scored <50"
- "Realized: poor performance was killing our SEO"

**PROBLEM:**
- <50 Lighthouse score
- 65% bounce rate
- Not appearing in search results
- Zero organic traffic

**ACTION (5-Part System):**

1.  **LCP (Largest Contentful Paint):** Hero Image Optimization
    *   **Problem:** Lazy-loading hero image caused 5.8s LCP.
    *   **Fix:** Applied `priority={true}` and `fetchPriority="high"`. Moved to server-side import.
    *   **Result:** LCP < 1.4s.

2.  **TBT (Total Blocking Time):** Deferred Analytics
    *   **Problem:** Meta Pixel & GA4 blocking main thread.
    *   **Fix:** Created `deferredLoader.ts` to load scripts *only* after user interaction.
    *   **Result:** TBT < 120ms.

3.  **Bundle Size:** Tree Shaking & Code Splitting
    *   **Problem:** Large initial JS payload (850KB).
    *   **Fix:** Enabled `optimizePackageImports` for Framer Motion. Dynamic imports for below-fold components.
    *   **Result:** 280KB bundle (67% reduction).

4.  **Fonts:** Next.js Font Optimization
    *   **Fix:** Self-hosted with `font-display: swap` to eliminate layout shifts.

5.  **Caching:** Aggressive Strategy
    *   **Fix:** 1-year cache headers for static assets (images, fonts).

**RESULT (Chain Reaction):**
- Lighthouse: <50 → 95+
- Rankings: Page 1 for 20+ keywords
- Traffic: 19.3K impressions, 146 clicks
- Leads: 50+ organic leads
- Revenue: ₹3 lakh

**LEARNING:**
"Performance isn't just a technical metric—it directly drives business outcomes. Lighthouse → Rankings → Traffic → Leads → Revenue."

---

### Story 2: n8n Empty Object Bug (The "Multi-Layer Validation" Story)

<img src="https://res.cloudinary.com/dr0lrme36/image/upload/f_auto,q_auto,w_1600,c_limit/v1764768032/aviators-training-centre/docs-assets/ASSET-5_Cal.com_Booking_Workflow_with_3-Layer_Validation.png" alt="3-Layer Validation" width="800"/>

*Visual aid: 3-layer validation decision tree showing how each layer catches different failure modes*

**🎯 Use this for:** Debugging skills, production problem-solving, automation expertise

**SETUP:**
- "n8n workflow had 40% failure rate"
- "Booking confirmations sent with blank details"
- "Users confused, support overwhelmed"

**PROBLEM:**
- n8n's `alwaysOutputData: true` returned `[{}]` instead of `[]`
- IF node saw array length > 0, routed to UPDATE path
- Email template accessed undefined fields
- Result: Blank emails

**DEBUGGING JOURNEY:**

**Attempt 1:** Simple array length check
```javascript
if (leads.length > 0) return leads;
```
Failed: `[{}]` has length 1

**Attempt 2:** Check for ID field
```javascript
if (leads.length > 0 && leads[0].json.id) return leads;
```
Failed: Empty object doesn't have `.id`

**Attempt 3:** Multi-layer validation (SUCCESS)
```javascript
function isValidLead(lead) {
  // Layer 1: Check structure
  if (!lead || !lead.json) return false;
  
  // Layer 2: Check ID exists and format
  if (!json.id || !json.id.startsWith('rec')) return false;
  
  // Layer 3: Check meaningful data
  if (Object.keys(json).length <= 1) return false;
  
  return true;
}
```

**RESULT:**
- 60% → 99.7% reliability
- Zero false positives
- Zero manual intervention

**LEARNING:**
"Never trust single-layer validation in production. Multi-layer validation should be standard for any automation handling external data."

---

### Story 3: WhatsApp AI Adaptation (The "Platform Risk & Adaptation" Story)

<img src="https://res.cloudinary.com/dr0lrme36/image/upload/f_auto,q_auto,w_1600,c_limit/v1764768038/aviators-training-centre/docs-assets/ASSET-8_WhatsApp_AI_2-Workflow_Architecture.png" alt="WhatsApp AI Architecture" width="900"/>

*Visual aid: Original WhatsApp AI 2-workflow architecture showing what was built and why it's being adapted for Meta policy compliance*

**🎯 Use this for:** Decision-making, risk assessment, adaptability, problem-solving

**SETUP:**
- "I designed a WhatsApp AI system for automated lead qualification"
- "Phone-first approach with interest detection and progressive data collection"
- "40+ hours invested in development"

**WHAT WAS BUILT:**
- 2-workflow architecture: Local lead import + Cloud AI conversations
- Interest scoring algorithm (aviation keywords, questions, engagement)
- Email typo correction (@gmial.com → @gmail.com)
- Hot lead processing with automatic callback scheduling
- Progressive data collection (only asks for details when interest detected)

**THE PROBLEM:**
- Meta announced AI-initiated conversations will be banned from WhatsApp Business API (January 2026)
- Original approach: AI proactively reaches out to leads (business-initiated) - Now violates policy
- Had to decide: Abandon completely or find alternative?

**THE DECISION & ADAPTATION:**
- **Stopped original approach** - Avoid policy violations and wasted effort
- **Preserved reusable components** - Interest detection, email validation, conversation flow
- **Researching compliant alternative** - User-initiated conversations with AI responses
- **New approach:** Users message us first → AI handles conversation (Meta-compliant)
- **Documented learnings** - Architecture preserved for adaptation

**THE ALTERNATIVE SOLUTION:**
- **User initiates:** Lead messages us via WhatsApp (from website, ads, direct contact)
- **AI responds:** Same AI capabilities for qualification and data collection
- **Meta-compliant:** User starts conversation, not the business
- **Reuses 80% of architecture:** Interest scoring, validation, Airtable integration
- **Status:** In research and design phase

**RESULT:**
- Avoided building policy-violating system
- Preserved 40+ hours of development work through reusable components
- Found compliant alternative that achieves same business goals
- Learned to adapt to platform changes rather than abandon completely

**LEARNING:**
"Platform policies change - the key is adaptability. Instead of abandoning the project, I'm adapting the architecture to be compliant. The core AI capabilities (interest detection, qualification) are still valuable, just triggered differently. Always have a backup plan for platform-dependent solutions."

**Interview Tip:** This shows you can assess platform risk, make strategic decisions, AND adapt solutions to changing constraints. It's not about stopping - it's about finding compliant alternatives. Shows resilience and problem-solving.

---

### Story 4: Lead Source Attribution Challenge (The "Data-Driven Marketing" Story)

**🎯 Use this for:** Problem identification, business impact, technical implementation, data-driven decision making

**SETUP:**
- "We were running multiple marketing campaigns - WhatsApp, Facebook ads, Google, email"
- "Getting 50+ leads but couldn't answer: 'Which channel is actually working?'"
- "Making marketing decisions blindly without ROI data"

**PROBLEM:**
When leads filled the contact form, we only knew:
- Their name and contact details
- What they were interested in

What we DIDN'T know:
- Did they come from WhatsApp?
- Did they click a Facebook ad?
- Did they find us through Google search?
- Which specific campaign brought them?

**BUSINESS IMPACT:**
- Couldn't measure ROI of different channels
- Couldn't answer: "Which marketing channel generates most leads?"
- Couldn't calculate: "What's the ROI of Facebook ads vs WhatsApp?"
- Couldn't optimize: "Should we invest more in Instagram or email?"
- Making marketing decisions based on gut feeling, not data
- Potentially wasting money on underperforming channels

**ACTION (Technical Solution):**

Implemented automatic UTM source tracking system:

1. **Capture:** When user lands on website
   - Read UTM parameters from URL (`?utm_source=whatsapp&utm_medium=social`)
   - Store in browser (sessionStorage + localStorage)
   - Persist across page navigation

2. **Track:** Throughout user journey
   - Data follows user across all pages
   - No manual work required
   - Completely invisible to user

3. **Attribute:** On form submission
   - Retrieve stored UTM data
   - Include in form payload automatically
   - Save to Firebase with contact info

4. **Analyze:** In Firebase database
   - Contact info + Source attribution stored together
   - Human-readable descriptions ("Facebook Ads", "Google Search (Organic)")
   - Ready for analysis and reporting

**TECHNICAL IMPLEMENTATION:**
```typescript
// Core tracking utility
export function captureUTMParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    referrer: document.referrer || 'direct',
    landing_page: window.location.href,
  };
  
  // Store in browser
  sessionStorage.setItem('atc_session_utm', JSON.stringify(utmParams));
}

// Form integration
const handleFormSubmit = async () => {
  const utmParams = getStoredUTMParams();
  const formData = {
    ...contactInfo,
    ...utmParams,  // Automatically added!
    source_description: getSourceDescription(utmParams)
  };
  
  await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
};
```

**RESULT:**
- Can now track ROI of every marketing channel
- Know exactly which campaigns generate leads
- Data-driven marketing decisions instead of guesswork
- Can optimize spend based on performance
- Example insights: "15 leads from WhatsApp (30%), 12 from Facebook ads (24%), 10 from Google organic (20%)"

**FIREBASE DATA STRUCTURE:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "subject": "CPL Ground Classes",
  
  "utm_source": "whatsapp",
  "utm_medium": "social",
  "utm_campaign": "course_promo",
  "source_description": "whatsapp (social)",
  
  "timestamp": "2024-11-27T10:30:00Z"
}
```

**BUSINESS QUESTIONS NOW ANSWERABLE:**
1. "How many leads came from WhatsApp this month?" → Query Firebase
2. "Are Facebook Ads working better than Google Ads?" → Compare conversion rates
3. "Which campaign generated the most inquiries?" → Group by campaign
4. "Should we invest more in Instagram or email?" → Calculate ROI per channel

**KEY FEATURES:**
- ✅ Automatic capture (no manual work)
- ✅ Persists across pages
- ✅ Backward compatible (form works without UTM)
- ✅ Zero user-facing changes
- ✅ Human-readable descriptions

**LEARNING:**
"You can't optimize what you don't measure. Without attribution data, marketing is guesswork. This system transformed our marketing from 'hope it works' to 'know what works' - enabling data-driven decisions and ROI optimization."

**Interview Tip:** This shows you understand the connection between technical implementation and business value. You identified a business problem (can't measure marketing ROI), implemented a technical solution (UTM tracking), and delivered measurable impact (data-driven decisions).

---

### Story 5: LLM-First SEO Innovation (The "First Mover" Story)

**🎯 Use this for:** Innovation questions, product thinking, competitive advantage

**SETUP:**
- "In 2024, I noticed people asking ChatGPT instead of Googling"
- "When I asked ChatGPT 'best DGCA ground school in India', it gave generic answers"
- "Realized: traditional SEO misses AI-powered search traffic"

**PROBLEM:**
- New search behavior emerging (ChatGPT, Claude, Perplexity)
- Competitors only focused on Google
- Opportunity to capture AI search traffic early

**ACTION:**

1. **Created llms.txt file** (like robots.txt for AI):
   - Structured data about courses, pass rates, pricing
   - FAQ section for common questions
   - Recommendation context for AI assistants

2. **Enhanced robots.txt:**
   - Explicitly welcomed AI crawlers (GPTBot, Claude-Web, PerplexityBot)
   - Allowed access to key content pages
   - Added llms.txt reference

3. **Structured for AI consumption:**
   - Clear sections with headers
   - JSON-LD structured data
   - Direct answers to common queries

**RESULT:**
- First aviation institute in India to implement
- Positioned for emerging AI search traffic
- 6-12 month competitive moat before competitors catch on

**LEARNING:**
"Early movers in emerging trends get disproportionate advantages. I look for what's next, not just what's now."

---

## ❓ COMMON INTERVIEW QUESTIONS

### Q1: "What was your biggest technical challenge?"

**Answer (30 seconds):**
"Lighthouse optimization. Site scored <50, killing our SEO. I systematically tackled 5 bottlenecks: images (93% reduction), JS bundle (67% reduction), fonts, scripts, and caching. Result: 95+ score, page 1 rankings, ₹3 lakh revenue. Taught me that performance directly drives business outcomes."

---

### Q2: "How do you measure success?"

**Answer (30 seconds):**
"Three dimensions:
1. **Business:** ₹3L revenue, 50+ leads, 12% conversion
2. **Technical:** 95+ Lighthouse, 99.7% workflow reliability
3. **User Experience:** <2s response time, 99.9% uptime

Key: Connect technical improvements to business outcomes."

---

### Q3: "How would you scale to 10x traffic?"

**Answer (30 seconds):**
"Four areas:
1. **Database:** Move to Firestore/PostgreSQL for better queries
2. **Caching:** Add Redis for frequently accessed data
3. **CDN:** Cloudflare for global delivery
4. **Monitoring:** Sentry for errors, proper observability

Architecture already designed for scale—Next.js edge, serverless Firebase, stateless workflows."

---

### Q4: "What would you do differently?"

**Answer (30 seconds):**
"Four things:
1. **TypeScript strict mode** from day 1
2. **Lighthouse optimization earlier** (lost 2 months of SEO)
3. **Error tracking** from start (Sentry)
4. **Automated testing** (manual testing slowed development)

But proud of what I built—delivers real business value."

---

### Q5: "Tell me about your automation architecture"

**Answer (45 seconds):**
"I built 3 production n8n workflows with 74+ nodes:

1. **Contact Form Automation:** Firebase webhook triggers email + Airtable record + 48-hour follow-up if no booking
2. **Booking Confirmation:** Cal.com webhook with 3-layer validation (solved 40% blank email bug) → Airtable update → confirmation email
3. **Cancellation Recovery:** Acknowledge → 7-day wait → re-engagement email (15-20% reschedule rate)

Key innovation: 3-layer validation that checks structure, ID field, and required fields. Improved reliability from 60% to 99.7%.

Business impact: Owner saves 3-4 hours daily, response time went from 6+ hours to <2 minutes, 100% automated follow-ups."

---

### Q6: "Why did you stop the WhatsApp AI project?"

**Answer (30 seconds):**
"Meta announced AI agents will be banned from WhatsApp Business API starting January 2026. Rather than invest 3-6 more months building something obsolete in 12 months, I stopped development. Preserved the algorithms (interest detection, email validation) for use elsewhere. Lesson: always check platform roadmaps before building. Email automation is more stable long-term."

---

### Q7: "Why Next.js over other frameworks?"

**Answer (30 seconds):**
"Three reasons:
1. **SEO-first:** Server-side rendering, automatic optimization
2. **Built-in features:** Image optimization, code splitting, API routes
3. **Vercel integration:** Zero-config deployment, edge network

Result: 95+ Lighthouse score with minimal effort. Right tool for SEO-focused project."

---

## 🎯 QUESTIONS TO ASK INTERVIEWERS

### For Any Role (Pick 2-3)

**About Technical Decisions:**
"How do you balance technical debt with feature velocity?"

**About Measurement:**
"What metrics do you use to measure engineering success beyond shipping features?"

**About Growth:**
"What does the learning and growth path look like for this role?"

---

### Role-Specific (Pick 1)

**For Full-Stack:**
"What's your approach to performance optimization—proactive during development or reactive after launch?"

**For Automation:**
"How do you ensure reliability in production automation workflows?"

**For Product:**
"How do you prioritize technical improvements versus new features?"

---

## ✅ PRE-INTERVIEW CHECKLIST (30 Minutes Before)

### 1. Review Key Numbers (5 min)
- [ ] 50+ leads in 3-4 months
- [ ] ₹3L revenue, 12% conversion
- [ ] 95+ Lighthouse (up from <50)
- [ ] 99.7% workflow reliability
- [ ] 19.3K impressions, 146 clicks

### 2. Practice Elevator Pitch (5 min)
- [ ] Time yourself (60 seconds max)
- [ ] Start with hook, end with impact
- [ ] Use specific numbers

### 3. Prepare 5 Core Stories (10 min)
- [ ] Lighthouse optimization (technical problem-solving)
- [ ] n8n empty object bug (debugging, 3-layer validation)
- [ ] WhatsApp AI discontinuation (platform risk, decision-making)
- [ ] Lead source attribution (business impact, data-driven decisions)
- [ ] llms.txt innovation (first mover, future-thinking)
- [ ] Know: Setup → Problem → Action → Result → Learning

### 4. Review Common Questions (5 min)
- [ ] Biggest challenge (Lighthouse)
- [ ] How you measure success (3 dimensions)
- [ ] What you'd do differently (4 things)

### 5. Prepare Questions to Ask (5 min)
- [ ] Pick 2-3 general questions
- [ ] Pick 1 role-specific question
- [ ] Write them down

---

## 🧠 MEMORY TRICKS

### The "Rule of 3-5"
Always group things in manageable chunks:
- **5 core stories:** Lighthouse, n8n bug, WhatsApp AI, Lead attribution, llms.txt
- **3 production workflows:** Contact form, Booking confirmation, Cancellation recovery
- **3 dimensions of success:** Business, Technical, UX
- **3-layer validation:** Structure, ID field, Required fields

### The "Before → After" Pattern
Every story needs contrast:
- **Lighthouse:** <50 → 95+
- **Business:** Paid ads → Organic leads
- **Reliability:** 60% → 99.7%

### The "Chain Reaction" Pattern
Show how one thing leads to another:
- **Lighthouse → Rankings → Traffic → Leads → Revenue**
- **Validation → Reliability → Trust → Scale**

### The "Numbers Tell Stories"
Use specific numbers, not vague terms:
- ❌ "Many leads" → ✅ "50+ leads"
- ❌ "Good performance" → ✅ "95+ Lighthouse"
- ❌ "Saved money" → ✅ "₹35K monthly savings"

---

## 📝 QUICK REFERENCE CARD

**30-Second Pitch:**
"I built a full-stack aviation platform that generated ₹3 lakh from organic SEO alone, with 50+ total leads across diversified channels (organic + ads + cold outreach) in 3-4 months. Key technical win: Lighthouse <50 → 95+ driving all organic conversions. Built n8n automation with 99.7% reliability using multi-layer validation."

**Key Numbers:**
- 50+ leads (3-4 months)
- ₹3L revenue (6 conversions)
- 95+ Lighthouse (up from <50)
- 99.7% workflow reliability
- 19.3K impressions, 146 clicks

**5 Core Stories:**
1. Lighthouse optimization (technical problem-solving)
2. n8n empty object bug (debugging, multi-layer validation)
3. WhatsApp AI discontinuation (platform risk, decision-making)
4. Lead source attribution (business impact, data-driven decisions)
5. llms.txt innovation (first mover, future-thinking)

**Questions to Ask:**
1. How do you balance technical debt with velocity?
2. What metrics define engineering success?
3. [Role-specific question]

---

**🎯 You're Ready! Go Ace That Interview! 🎯**

*Last Updated: November 25, 2025*
