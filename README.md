# UST (University of Santo Tomas) Entrance Test (USTET) Mock Exam Platform

An authentic, modern web application simulator for the **USTET (University of Santo Tomas Entrance Test)** built for personal study and examination mastery.

---

## Key Features

1. **Authentic 4-Part Examination Sequence**:
   - **Part 1**: Mental Ability (Abstract, Spatial, & Deductive Logic)
   - **Part 2**: English Proficiency (Grammar, Structure, & Reading Comprehension)
   - **Part 3**: Mathematics (Algebra, Geometry, Trigonometry, & Pre-Calculus — **Strictly No Calculator Allowed**)
   - **Part 4**: Science (Biology, Chemistry, Physics, & Earth Science)

2. **Strict Section Locking (Authentic USTET Testing Protocols)**:
   - Once a section is submitted or its countdown expires, the section is permanently sealed. You cannot navigate back to previous sections or jump ahead to unactivated sections.
   - Pacing indicator alerts when you spend $>45\text{ seconds}$ on a question.

3. **Digital Scratchpad**:
   - Built-in canvas drawing and notes scratchpad to perform handwritten calculations and algebra without a physical calculator.

4. **Tiered Question Pool (Easy, Medium, and Hard)**:
   - Complete with 270 curated items spanning all 4 authentic subtests:
     - 70 Mental Ability items
     - 70 English Proficiency items
     - 60 Mathematics items
     - 70 Science items
   - All items contain four choices (A, B, C, D), correct keys, and step-by-step rationales rendered with **KaTeX** mathematical typography.

5. **Post-Exam Review (Strictly Revealed Upon Completion)**:
   - As requested, rationales and correct answers remain hidden during testing and are unlocked only after all 4 parts are finalized.
   - Filter review by: All questions, Incorrect only, Flagged, by Subtest, or by Difficulty tier.

6. **UST College & Quota Program Cutoff Predictor**:
   - Compares your calculated subtest percentiles against historical UST admission cutoffs for:
     - **LEAPMed** (Faculty of Medicine & Surgery)
     - **BS Nursing** (College of Nursing)
     - **BS Medical Technology / Pharmacy** (Faculty of Pharmacy)
     - **BS Accountancy** (AMV College of Accountancy)
     - **BS Architecture** (College of Architecture)
     - **Engineering** (Civil, Chemical, Electrical)
     - **College of Science** (Biology, Applied Math)
     - **Faculty of Arts & Letters** (Legal Management, Communication)

7. **Targeted Practice / Tier Drill Mode**:
   - Need focused practice on Hard Math or Medium Science? Launch isolated drill sessions filtered by subject, difficulty, and question count.

8. **Question & Choice Randomization (Fisher-Yates Algorithm)**:
   - Shuffles questions within each section while maintaining the authentic 4-part subtest sequence.
   - Shuffles answer choices (`A`, `B`, `C`, `D`) with automatic key remapping to prevent answer-key memorization across retakes.

9. **Modular Question Sets System**:
   - **Full 4-Part Bank** (All 270 items • 165 mins)
   - **Balanced Mock Set A** (135 items • 90 mins)
   - **Balanced Mock Set B** (135 items • 90 mins)
   - **Express Diagnostic Set** (60 items • 45 mins)

10. **Full Session Persistence ("Save & Resume Anytime")**:
    - **Continuous Auto-Save**: Real-time progress and countdown timer saved to `localStorage` every 4 seconds.
    - **"Save & Pause Session"**: Explicit pause action in the exam header allowing users to safely close their browser or computer and return later.
    - **Automatic Resume Detection**: On return, displays both a high-priority resume prompt modal and a persistent "Active Simulation In Progress" banner on the home screen restoring exact shuffled questions, choice layouts, question index, recorded answers, flags, and remaining countdown seconds.

---

## How to Run Locally

From the `ust-mock-exam/` folder:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
npm run preview
```

Open your browser to `http://localhost:5173/` to start the simulation.
