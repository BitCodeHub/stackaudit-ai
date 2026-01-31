# StackAudit.ai User Research Plan

## Research Objectives

### Primary Goals
1. Understand IT leaders' pain points with SaaS sprawl and technology stack management
2. Identify key features and capabilities that would drive adoption
3. Validate pricing models and willingness to pay
4. Discover competitive landscape and switching triggers
5. Map the buying process and decision-making criteria

### Target Personas
- **CIOs/CTOs** - Strategic oversight, budget authority
- **IT Directors/Managers** - Operational management, tool selection
- **IT Operations Leads** - Day-to-day administration
- **Security/Compliance Officers** - Risk and audit focus
- **Finance/Procurement** - Cost optimization focus

---

## Part 1: User Interview Script (45-60 minutes)

### Introduction (5 min)

> "Thank you for taking the time to speak with us today. I'm [Name] from StackAudit.ai. We're researching how IT leaders manage their technology stacks and SaaS applications. There are no right or wrong answers—we're here to learn from your real experiences. Everything you share is confidential and will only be used to improve our product. May I record this conversation for note-taking purposes?"

### Warm-Up: Role & Context (5 min)

1. Tell me about your role and how long you've been in this position.
2. How would you describe your organization's technology environment? (Size, industry, complexity)
3. Roughly how many SaaS applications does your organization use?

### Current State: Pain Points (15 min)

4. **Walk me through how you currently keep track of all the software and SaaS tools your organization uses.**
   - Probe: Is there a single source of truth? Who maintains it?
   - Probe: How confident are you in its accuracy?

5. **What's the most frustrating part of managing your technology stack today?**
   - Probe: Can you give me a specific recent example?

6. **How do you currently discover shadow IT or unauthorized applications?**
   - Probe: How big of a problem is this for you?
   - Probe: What happens when you find something unauthorized?

7. **Tell me about your last software audit or compliance review.**
   - Probe: How long did it take? Who was involved?
   - Probe: What made it difficult?

8. **How do you track software spending across the organization?**
   - Probe: Have you ever been surprised by duplicate subscriptions or unused licenses?
   - Probe: What's the financial impact of this?

### Decision Making & Priorities (10 min)

9. **If you could wave a magic wand and fix one thing about managing your tech stack, what would it be?**

10. **When evaluating new IT management tools, what are your top 3 criteria?**
    - Probe: How important is integration with existing tools?
    - Probe: What role does price play vs. functionality?

11. **Who else would be involved in evaluating and purchasing a tool like this?**
    - Probe: What would their concerns be?
    - Probe: What would make them say "no"?

12. **What's your biggest fear about adopting a new platform for stack management?**

### Competitive Landscape (5 min)

13. **What tools or methods do you currently use to manage your SaaS portfolio?**
    - Probe: What do you like about them? What's missing?

14. **Have you looked at any SaaS management platforms recently?**
    - Probe: What made you consider them? Why did/didn't you move forward?

### Feature Validation (10 min)

15. **I'm going to mention some capabilities. For each, tell me how valuable it would be on a scale of 1-5 (5 = must-have, 1 = don't care):**
    - Automatic discovery of all SaaS applications
    - Real-time spend tracking and optimization recommendations
    - Compliance and security risk scoring
    - License utilization and waste identification
    - Renewal tracking and contract management
    - AI-powered recommendations for consolidation
    - Integration overlap analysis
    - Vendor risk assessment
    - Automated offboarding workflows

16. **Which of those would make you stop what you're doing and take a demo today?**

17. **What capability did I NOT mention that you wish existed?**

### Pricing & Value (5 min)

18. **How do you typically prefer to pay for tools like this?** (per user, per app managed, flat fee, usage-based)

19. **What would this tool need to deliver for you to consider it worth $X/month?**
    - Probe: What ROI would you need to see?

20. **What would make you cancel a tool like this after 6 months?**

### Wrap-Up (5 min)

21. **Is there anything else about managing your technology stack that keeps you up at night?**

22. **Would you be open to being a design partner as we build this product?**

23. **Can you recommend 2-3 peers who might be interested in this conversation?**

> "Thank you so much for your time and insights. This is incredibly valuable."

---

## Part 2: Quantitative Survey (10-15 min)

### Screening Questions

**S1. What is your current role?**
- [ ] CIO / CTO / VP of IT
- [ ] IT Director / IT Manager
- [ ] IT Operations / Systems Administrator
- [ ] Security / Compliance Officer
- [ ] Finance / Procurement
- [ ] Other: _______
- [ ] None of the above [DISQUALIFY]

**S2. How many employees are at your organization?**
- [ ] 1-50
- [ ] 51-200
- [ ] 201-500
- [ ] 501-1,000
- [ ] 1,001-5,000
- [ ] 5,001+

**S3. Do you have influence over IT tool purchasing decisions?**
- [ ] I make the final decision
- [ ] I'm a key influencer/recommender
- [ ] I provide input but don't decide
- [ ] I have no influence [DISQUALIFY]

---

### Section A: Current State

**Q1. Approximately how many SaaS applications does your organization use?**
- [ ] 1-25
- [ ] 26-50
- [ ] 51-100
- [ ] 101-200
- [ ] 201-500
- [ ] 500+
- [ ] I don't know

**Q2. How confident are you that you have a complete inventory of all software/SaaS in use?**
| Very confident | Somewhat confident | Neutral | Not very confident | Not at all confident |

**Q3. How do you currently track your SaaS applications? (Select all that apply)**
- [ ] Spreadsheets (Excel, Google Sheets)
- [ ] IT asset management tool (ServiceNow, Freshservice, etc.)
- [ ] SaaS management platform (Zylo, Productiv, Torii, etc.)
- [ ] Finance/procurement system
- [ ] We don't formally track
- [ ] Other: _______

**Q4. In the past 12 months, have you discovered unauthorized ("shadow IT") applications being used?**
- [ ] Yes, frequently (monthly or more)
- [ ] Yes, occasionally (quarterly)
- [ ] Yes, rarely (1-2 times)
- [ ] No
- [ ] I don't know

---

### Section B: Pain Points (Rate 1-5: 1=Not a problem, 5=Critical problem)

**Q5. How significant are the following challenges for your organization?**

| Challenge | 1 | 2 | 3 | 4 | 5 |
|-----------|---|---|---|---|---|
| Lack of visibility into all SaaS applications | | | | | |
| Duplicate or overlapping tools | | | | | |
| Unused or underutilized licenses | | | | | |
| Shadow IT / unauthorized applications | | | | | |
| Security risks from unvetted tools | | | | | |
| Compliance/audit preparation | | | | | |
| Manual renewal tracking | | | | | |
| Offboarding users from multiple systems | | | | | |
| Understanding true cost of ownership | | | | | |
| Vendor sprawl and relationship management | | | | | |

**Q6. What percentage of your SaaS spend do you estimate is wasted on unused/underutilized licenses?**
- [ ] Less than 5%
- [ ] 5-10%
- [ ] 11-20%
- [ ] 21-30%
- [ ] More than 30%
- [ ] I don't know

**Q7. How many hours per month does your team spend on SaaS-related administrative tasks (tracking, auditing, managing)?**
- [ ] Less than 5 hours
- [ ] 5-10 hours
- [ ] 11-20 hours
- [ ] 21-40 hours
- [ ] 40+ hours

---

### Section C: Feature Importance (Rate 1-5: 1=Not important, 5=Essential)

**Q8. How important are the following capabilities in a SaaS management solution?**

| Capability | 1 | 2 | 3 | 4 | 5 |
|------------|---|---|---|---|---|
| Automatic discovery of all SaaS apps | | | | | |
| Integration with SSO/identity providers | | | | | |
| Spend analytics and optimization | | | | | |
| License utilization tracking | | | | | |
| Security and compliance scoring | | | | | |
| Contract and renewal management | | | | | |
| Automated user provisioning/deprovisioning | | | | | |
| Workflow approvals for new app requests | | | | | |
| AI-powered recommendations | | | | | |
| Vendor risk assessment | | | | | |
| Integration with finance systems | | | | | |

**Q9. What is the #1 feature that would make you adopt a SaaS management platform?**
[Open text]

---

### Section D: Buying Criteria

**Q10. What are your top 3 criteria when evaluating new IT management tools?**
- [ ] Ease of implementation
- [ ] Price/total cost of ownership
- [ ] Integration with existing tools
- [ ] Vendor reputation/stability
- [ ] Feature completeness
- [ ] Security certifications (SOC 2, etc.)
- [ ] Customer support quality
- [ ] User interface/ease of use
- [ ] Customization options
- [ ] Time to value

**Q11. What is your organization's typical budget for SaaS management tools (annual)?**
- [ ] Under $10,000
- [ ] $10,000 - $25,000
- [ ] $25,001 - $50,000
- [ ] $50,001 - $100,000
- [ ] $100,001 - $250,000
- [ ] Over $250,000
- [ ] I don't know / prefer not to say

**Q12. What pricing model do you prefer?**
- [ ] Per user/employee
- [ ] Per managed application
- [ ] Flat annual fee
- [ ] Usage-based
- [ ] Tiered packages
- [ ] No preference

**Q13. Who is involved in purchasing decisions for IT management tools? (Select all)**
- [ ] CIO/CTO
- [ ] IT Director/Manager
- [ ] Security team
- [ ] Finance/Procurement
- [ ] Legal/Compliance
- [ ] Department heads
- [ ] Other: _______

---

### Section E: Competitive Intelligence

**Q14. Are you currently using a SaaS management platform?**
- [ ] Yes → [Go to Q15]
- [ ] No, but evaluating → [Go to Q16]
- [ ] No, and not planning to → [Go to Q17]

**Q15. Which platform do you use? (Select all that apply)**
- [ ] Zylo
- [ ] Productiv
- [ ] Torii
- [ ] Vendr
- [ ] Zluri
- [ ] BetterCloud
- [ ] Cleanshelf
- [ ] Other: _______

**Q15a. How satisfied are you with your current solution?**
| Very satisfied | Somewhat satisfied | Neutral | Somewhat dissatisfied | Very dissatisfied |

**Q15b. What's missing from your current solution?**
[Open text]

**Q16. What's preventing you from adopting a SaaS management platform?**
- [ ] Budget constraints
- [ ] Not enough pain to justify
- [ ] Too complex to implement
- [ ] Lack of executive buy-in
- [ ] Haven't found the right solution
- [ ] Other priorities
- [ ] Other: _______

**Q17. What would change your mind about needing a SaaS management platform?**
[Open text]

---

### Section F: Demographics & Follow-up

**Q18. What industry is your organization in?**
- [ ] Technology/Software
- [ ] Financial Services
- [ ] Healthcare
- [ ] Manufacturing
- [ ] Retail/E-commerce
- [ ] Education
- [ ] Government
- [ ] Professional Services
- [ ] Other: _______

**Q19. What is your annual IT budget (approximate)?**
- [ ] Under $500K
- [ ] $500K - $2M
- [ ] $2M - $10M
- [ ] $10M - $50M
- [ ] Over $50M
- [ ] Prefer not to say

**Q20. Would you be interested in:**
- [ ] A 15-minute demo of StackAudit.ai
- [ ] Early access/beta program
- [ ] Receiving our research findings
- [ ] A follow-up interview ($50 gift card)
- [ ] None of the above

**Q21. Contact information (optional):**
- Name: _______
- Email: _______
- Company: _______

---

## Part 3: Research Methodology & Timeline

### Phase 1: Discovery Interviews (Weeks 1-3)
- **Goal:** 15-20 in-depth interviews
- **Recruitment:** LinkedIn outreach, warm intros, UserInterviews.com
- **Incentive:** $100-150 Amazon gift card (executives), $75 for managers
- **Format:** 45-60 min video calls

### Phase 2: Quantitative Survey (Weeks 3-5)
- **Goal:** 200+ responses
- **Distribution:** LinkedIn ads, IT communities (Spiceworks, Reddit r/sysadmin), email lists
- **Incentive:** Entry into $500 raffle, early access to product
- **Platform:** Typeform or SurveyMonkey

### Phase 3: Analysis & Synthesis (Weeks 5-6)
- Affinity mapping of qualitative themes
- Statistical analysis of survey data
- Persona refinement
- Feature prioritization matrix
- Competitive positioning insights

### Phase 4: Validation (Week 7)
- Share findings with 5 key interview participants
- Concept testing with mockups
- Pricing sensitivity analysis

---

## Key Hypotheses to Validate

1. **Shadow IT is a top-3 pain point** for IT leaders in companies with 200+ employees
2. **Spreadsheets are still the #1 tool** for SaaS tracking in mid-market companies
3. **20%+ of SaaS spend is wasted** on unused licenses
4. **Security/compliance concerns** outweigh cost concerns for enterprise buyers
5. **AI-powered recommendations** are a differentiator worth paying premium for
6. **Time to value** (< 30 days) is critical for adoption
7. **Integration with SSO/Okta** is table stakes

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Completed interviews | 15+ |
| Survey responses | 200+ |
| Qualified leads generated | 30+ |
| Design partners secured | 5+ |
| Clear ICP definition | ✓ |
| Top 5 features validated | ✓ |
| Pricing model validated | ✓ |

---

## Appendix: Recruitment Screener

**For LinkedIn/Email Outreach:**

> Subject: Quick research call? $100 gift card for 45 min
>
> Hi [Name],
>
> I'm researching how IT leaders manage their growing SaaS portfolios. Given your role at [Company], I'd love to learn from your experience.
>
> We're offering a $100 Amazon gift card for a 45-minute video call to share your insights. No sales pitch—just research.
>
> Would you have time this week or next?

**Screening Questions:**
1. Do you work in IT/Technology leadership? (Must be yes)
2. Does your company use 25+ SaaS applications? (Must be yes)
3. Do you influence software purchasing decisions? (Must be yes)
4. Are you willing to be recorded for research purposes? (Must be yes)

---

*Last updated: [Date]*
*Research Lead: [Name]*
*Contact: research@stackaudit.ai*
