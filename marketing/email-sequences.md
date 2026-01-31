# StackAudit.ai - Onboarding Email Sequence

> Customer Success Email Templates for New User Activation

---

## Overview

| Email | Timing | Goal | Subject Line |
|-------|--------|------|--------------|
| Welcome | Immediate | Excitement + First Action | Welcome to StackAudit! 🚀 Your first audit awaits |
| Getting Started | Day 1 | First Value Moment | Your 3-minute path to your first stack audit |
| Tips & Tricks | Day 3 | Deepen Engagement | 5 power moves that 10x your StackAudit results |
| Check-In | Day 7 | Gather Feedback + Re-engage | Quick question about your StackAudit experience |

---

## Email 1: Welcome

**Send Timing:** Immediately after signup  
**From:** Alex from StackAudit <alex@stackaudit.ai>  
**Subject:** Welcome to StackAudit! 🚀 Your first audit awaits  
**Preview Text:** You just leveled up your repo analysis game

---

### Body

Hi {{first_name}},

Welcome to StackAudit! You just joined thousands of developers who've stopped guessing about their tech stacks and started *knowing*.

**Here's what you can do right now:**

→ **Run your first audit** – Paste any GitHub URL and get a complete stack analysis in under 60 seconds. [Analyze a Repo →]({{app_url}}/analyze)

I'm curious: what brought you to StackAudit today?

- [ ] Evaluating a new codebase
- [ ] Security audit for dependencies
- [ ] Assessing technical debt
- [ ] Checking out candidate portfolios
- [ ] Just exploring

Hit reply and let me know – I read every response and love learning what our users are building.

**Your account:**
- Email: {{email}}
- Plan: {{plan_name}}
- Audits remaining: {{audits_remaining}}

Welcome aboard,

**Alex Chen**  
Head of Customer Success  
StackAudit.ai

P.S. Have a repo you've been meaning to audit? [Do it now]({{app_url}}/analyze) – it takes 60 seconds and you'll wonder why you waited.

---

### Tracking

- **CTA:** "Analyze a Repo" button click
- **Success:** User submits first analysis within 24 hours
- **Fallback:** If no action → send Email 2 on schedule

---

## Email 2: Getting Started

**Send Timing:** Day 1 (24 hours after signup)  
**Condition:** Send regardless of first audit status  
**From:** Alex from StackAudit <alex@stackaudit.ai>  
**Subject:** Your 3-minute path to your first stack audit  
**Preview Text:** Step-by-step guide to instant repo insights

---

### Body

Hi {{first_name}},

Ready to see what's really inside a codebase? Here's your quickstart:

---

### 🎯 3 Steps to Your First Audit

**Step 1: Connect GitHub** (30 seconds)  
One-click OAuth. We only request read access to public repos.  
[Connect GitHub →]({{app_url}}/settings/integrations)

**Step 2: Paste Any Repo URL** (10 seconds)  
Try one of these to see StackAudit in action:
```
https://github.com/facebook/react
https://github.com/vercel/next.js
https://github.com/openai/whisper
```
Or paste your own project.

**Step 3: Get Your Report** (60 seconds)  
Watch in real-time as we detect:
- ✅ Languages & frameworks
- ✅ Dependencies & versions
- ✅ Security vulnerabilities
- ✅ AI-powered recommendations

---

### What You'll See

Your audit report includes:

| Section | What It Shows |
|---------|---------------|
| **Stack Overview** | Languages, frameworks, tools visualized |
| **Dependency Tree** | Every package with version + health status |
| **Security Scan** | CVEs, outdated deps, config issues |
| **AI Insights** | GPT-4 recommendations for improvements |

---

{{#if has_completed_audit}}
🎉 **You already ran your first audit!** Nice work. Want to go deeper? Try auditing a private repo or sharing results with your team.
{{else}}
⚡ **Your first audit is waiting.** [Start now →]({{app_url}}/analyze)
{{/if}}

Here to help,

**Alex**

P.S. Reply with any questions. Real human, real inbox, usually responds within hours.

---

### Tracking

- **CTA:** "Start now" button click
- **Success:** User has ≥1 completed audit
- **Segment:** Split users into "activated" vs "not activated" for Email 4

---

## Email 3: Tips & Tricks

**Send Timing:** Day 3 (72 hours after signup)  
**Condition:** Send to all users  
**From:** Alex from StackAudit <alex@stackaudit.ai>  
**Subject:** 5 power moves that 10x your StackAudit results  
**Preview Text:** Hidden features our power users love

---

### Body

Hi {{first_name}},

You've had a few days with StackAudit. Here's how our power users get the most out of it:

---

### 💡 5 Tips You Might Have Missed

**1. Audit Private Repos**  
Connected to GitHub? You can analyze any repo you have access to – not just public ones. Perfect for internal code reviews.

**2. Export PDF Reports**  
Need to share with stakeholders who don't have an account? Every audit has a one-click PDF export with professional formatting.  
*Find it: Report → Download → PDF*

**3. Share Audits with Your Team**  
Invite team members and collaborate on audits with comments. Tag specific findings and resolve issues together.  
[Invite Team →]({{app_url}}/team/invite)

**4. Set Up Webhooks**  
Get notified when repos change. Connect to your CI/CD pipeline for automated security scanning on every push.  
[Configure Webhooks →]({{app_url}}/settings/webhooks)

**5. Compare Before & After**  
Re-run audits after making changes to track your progress. Our AI highlights what improved.

---

### 🔥 Pro Tip: The Security Deep Dive

Click any vulnerability in your report to see:
- CVE details and severity
- Affected versions
- Recommended fix (usually just a version bump)
- One-click copy for your `package.json` or `requirements.txt`

---

### This Week's Popular Audits

See what repos the community is analyzing:

1. **tailwindlabs/tailwindcss** – 847 audits
2. **supabase/supabase** – 623 audits
3. **langchain-ai/langchain** – 591 audits

[Explore Trending →]({{app_url}}/explore)

---

Questions? Ideas? Just hit reply.

**Alex**

---

### Tracking

- **CTA:** Any feature link click
- **Success:** User uses ≥1 advanced feature (team invite, PDF export, webhook)
- **Engagement Score:** Track clicks per section

---

## Email 4: Check-In

**Send Timing:** Day 7 (1 week after signup)  
**Condition:** Personalized based on activation status  
**From:** Alex from StackAudit <alex@stackaudit.ai>

---

### Version A: Activated Users (≥1 audit completed)

**Subject:** Quick question about your StackAudit experience  
**Preview Text:** 30 seconds to help us help you better

---

Hi {{first_name}},

You've been using StackAudit for a week now – how's it going?

I'd love your quick take:

**On a scale of 1-10, how likely are you to recommend StackAudit to a colleague?**

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

*(Click a number – it takes you to a 30-second survey)*

---

### Your Stats This Week

| Metric | Count |
|--------|-------|
| Audits completed | {{audits_count}} |
| Vulnerabilities found | {{vulns_found}} |
| Dependencies analyzed | {{deps_analyzed}} |

---

### What's Coming Next

We're building features based on user feedback:

- 🔜 **Scheduled audits** – Auto-run weekly security checks
- 🔜 **Slack integration** – Get alerts in your workspace
- 🔜 **Custom rules** – Define your own compliance checks

Want early access? Reply "yes" and I'll add you to the beta list.

Thanks for being part of the StackAudit community,

**Alex**

P.S. Anything frustrating you? Anything you wish we had? Reply and tell me – your feedback shapes our roadmap.

---

### Version B: Not Activated (0 audits completed)

**Subject:** Did something go wrong?  
**Preview Text:** I'd love to help you get started

---

Hi {{first_name}},

I noticed you signed up for StackAudit a week ago but haven't run an audit yet.

I'm curious – what's holding you back?

- [ ] **Ran out of time** – Totally get it. When you're ready, [your dashboard is here]({{app_url}}/dashboard).

- [ ] **Confused about how it works** – I can hop on a quick 10-minute call to walk you through it. [Book a time →]({{calendly_link}})

- [ ] **Not sure it's right for my use case** – Tell me what you're trying to accomplish and I'll let you know if we can help.

- [ ] **Technical issue** – If something broke, I want to fix it. Reply with details and I'll personally look into it.

- [ ] **Changed my mind** – No worries at all. But I'd love to know why, so we can improve.

Just reply with a number (1-5) or hit reply and tell me what's up.

Here to help,

**Alex**

P.S. If you're evaluating tools, happy to do a quick comparison call. We're confident in where we shine and honest about where we don't.

---

### Tracking

- **CTA:** NPS score click / Survey completion
- **Success:** NPS submission or reply received
- **Segment:** Promoters (9-10), Passives (7-8), Detractors (1-6) for follow-up sequences

---

## Email Sequence Flow

```
                    ┌─────────────────────┐
                    │   User Signs Up     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Email 1: Welcome   │
                    │    (Immediate)      │
                    └──────────┬──────────┘
                               │
                               │ +24 hours
                               ▼
                    ┌─────────────────────┐
                    │ Email 2: Getting    │
                    │    Started          │
                    └──────────┬──────────┘
                               │
                               │ +48 hours
                               ▼
                    ┌─────────────────────┐
                    │ Email 3: Tips &     │
                    │    Tricks           │
                    └──────────┬──────────┘
                               │
                               │ +4 days
                               ▼
                    ┌─────────────────────┐
                    │   Check Activation  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ Email 4A: NPS   │               │ Email 4B: Win   │
    │   (Activated)   │               │ Back (Inactive) │
    └────────┬────────┘               └────────┬────────┘
             │                                  │
             ▼                                  ▼
    ┌─────────────────┐               ┌─────────────────┐
    │  Continue to    │               │  If no action:  │
    │  Engagement     │               │  Sunset after   │
    │  Sequence       │               │  30 days        │
    └─────────────────┘               └─────────────────┘
```

---

## Implementation Notes

### Merge Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `{{first_name}}` | User's first name | "Alex" |
| `{{email}}` | User's email | "alex@company.com" |
| `{{plan_name}}` | Subscription tier | "Pro" |
| `{{audits_remaining}}` | Audits left this month | "47" |
| `{{audits_count}}` | Audits completed | "12" |
| `{{vulns_found}}` | Security issues found | "23" |
| `{{deps_analyzed}}` | Dependencies scanned | "847" |
| `{{app_url}}` | Application base URL | "https://app.stackaudit.ai" |
| `{{calendly_link}}` | CS booking link | "https://calendly.com/stackaudit-alex" |

### A/B Test Ideas

1. **Subject lines:** Emoji vs no emoji
2. **Welcome email:** Ask about use case vs don't ask
3. **CTA style:** Button vs text link
4. **Sender:** Personal name vs "StackAudit Team"
5. **Day 7 timing:** Day 5 vs Day 7 vs Day 10

### ESP Recommendations

- **Primary:** Customer.io (best for behavioral triggers)
- **Alternative:** Intercom (good for in-app + email)
- **Budget option:** ConvertKit or Mailchimp

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email 1 Open Rate | >60% | ESP analytics |
| First Audit (Day 1) | >40% | Product analytics |
| First Audit (Day 7) | >65% | Product analytics |
| NPS Response Rate | >25% | Survey tool |
| Reply Rate | >5% | Manual tracking |

---

## Future Sequences to Build

1. **Upgrade Sequence** – For free users approaching limits
2. **Re-engagement Sequence** – For users inactive 30+ days
3. **Feature Announcement** – For new releases
4. **Referral Program** – For promoters (NPS 9-10)
5. **Churn Prevention** – For users showing decline signals

---

*Last updated: {{current_date}}*  
*Owner: Customer Success Team*
