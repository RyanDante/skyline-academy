import type { Paper, Question, Solution } from '@/types/models';
import { papers as seedPapers, questions as seedQuestions, solutions as seedSolutions } from '@/data/seed';

export interface CachedPaperData {
  paper: Paper;
  questions: Question[];
  solutions: Solution[];
  cachedAt: number;
  sizeKb: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  level: 'A' | 'O';
  category: 'formulas' | 'summary' | 'marking_guide' | 'concours_tips';
  description: string;
  content: string;
  cachedAt: number;
  sizeKb: number;
}

const STORAGE_KEYS = {
  PAPERS: 'skyline_offline_papers_v2',
  MATERIALS: 'skyline_offline_materials_v2',
  INITIALIZED: 'skyline_offline_initialized_v2',
} as const;

class OfflineStorageService {
  /**
   * Cache a past paper along with its questions and solutions into localStorage
   */
  cachePaper(paper: Paper, questionsList?: Question[], solutionsList?: Solution[]): boolean {
    try {
      const allQuestions = questionsList || seedQuestions.filter((q) => q.paperId === paper.id);
      const questionIds = allQuestions.map((q) => q.id);
      const allSolutions = solutionsList || seedSolutions.filter((s) => questionIds.includes(s.questionId));

      const cachedPapers = this.getCachedPapersMap();
      const payload: CachedPaperData = {
        paper,
        questions: allQuestions,
        solutions: allSolutions,
        cachedAt: Date.now(),
        sizeKb: Math.max(12, Math.round(JSON.stringify(allQuestions).length / 1024)),
      };

      cachedPapers[paper.id] = payload;
      localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(cachedPapers));
      return true;
    } catch (err) {
      console.warn('Failed to cache paper to localStorage:', err);
      return false;
    }
  }

  /**
   * Remove a paper from offline cache
   */
  removeCachedPaper(paperId: string): boolean {
    try {
      const cached = this.getCachedPapersMap();
      if (cached[paperId]) {
        delete cached[paperId];
        localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(cached));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Check if a paper is available offline
   */
  isPaperCached(paperId: string): boolean {
    const cached = this.getCachedPapersMap();
    return Boolean(cached[paperId]);
  }

  /**
   * Get all cached past papers
   */
  getCachedPapers(): CachedPaperData[] {
    const cached = this.getCachedPapersMap();
    return Object.values(cached);
  }

  /**
   * Get a single cached paper by ID
   */
  getCachedPaper(paperId: string): CachedPaperData | null {
    const cached = this.getCachedPapersMap();
    return cached[paperId] || null;
  }

  private getCachedPapersMap(): Record<string, CachedPaperData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PAPERS);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * Cache a study revision guide or formula sheet
   */
  cacheStudyMaterial(material: StudyMaterial): boolean {
    try {
      const materials = this.getCachedMaterialsMap();
      materials[material.id] = material;
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all cached study materials
   */
  getCachedStudyMaterials(): StudyMaterial[] {
    const map = this.getCachedMaterialsMap();
    return Object.values(map);
  }

  private getCachedMaterialsMap(): Record<string, StudyMaterial> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageUsage(): {
    usedKb: number;
    cachedPapersCount: number;
    cachedMaterialsCount: number;
  } {
    const papers = this.getCachedPapers();
    const materials = this.getCachedStudyMaterials();
    let totalSize = 0;

    papers.forEach((p) => {
      totalSize += p.sizeKb || 15;
    });
    materials.forEach((m) => {
      totalSize += m.sizeKb || 10;
    });

    return {
      usedKb: totalSize,
      cachedPapersCount: papers.length,
      cachedMaterialsCount: materials.length,
    };
  }

  /**
   * Seed offline storage with essential 2024 past papers & high-yield revision summaries
   * so students can practice without internet immediately.
   */
  initDefaultOfflineMaterials(): void {
    try {
      const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (isInit) return;

      // 1. Preload 2024 Physics Paper 1 and Maths Paper 1
      const initialPapers = seedPapers.filter(
        (p) => p.id === 'a-physics-2024-p1' || p.id === 'a-maths-2024-p1'
      );
      initialPapers.forEach((paper) => {
        this.cachePaper(paper);
      });

      // 2. Preload high-yield study materials & formula sheets
      const defaultMaterials: StudyMaterial[] = [
        {
          id: 'mat-phy-formulas-a',
          title: 'A-Level Physics Formula Sheet',
          subjectId: 'a-physics',
          subjectName: 'Physics',
          level: 'A',
          category: 'formulas',
          description: 'Essential equations for Mechanics, Electricity, Waves, and Nuclear Physics.',
          content: `### 1. Mechanics
- Linear motion: v = u + at | s = ut + ½at² | v² = u² + 2as
- Momentum: p = mv | Impulse J = F·Δt = Δp
- Centripetal force: F = mv²/r = mω²r
- Work & Kinetic Energy: W = F·d·cosθ | KE = ½mv² | GPE = mgh

### 2. Electricity & Magnetism
- Ohm's law: V = IR | Resistance: R = ρL/A
- Electric field: E = F/q = V/d
- Coulomb's law: F = (1 / 4πε₀) · (q₁q₂ / r²)
- Magnetic force on wire: F = BIL·sinθ
- Magnetic force on charge: F = qvB·sinθ

### 3. Oscillations & Waves
- Wave equation: v = f·λ
- Simple harmonic motion: a = -ω²x | T = 2π√(m/k) = 2π√(L/g)
- Doppler effect: f' = f(v ± v₀) / (v ∓ vₛ)`,
          cachedAt: Date.now(),
          sizeKb: 14,
        },
        {
          id: 'mat-maths-calculus-a',
          title: 'Pure Mathematics Calculus Guide',
          subjectId: 'a-maths',
          subjectName: 'Pure Mathematics',
          level: 'A',
          category: 'formulas',
          description: 'Standard derivatives, trigonometric substitutions, and integration by parts rules.',
          content: `### Differentiation Rules
- Product Rule: d/dx(uv) = u'v + uv'
- Quotient Rule: d/dx(u/v) = (u'v - uv') / v²
- Chain Rule: dy/dx = (dy/du) · (du/dx)
- Trigonometric:
  - d/dx(sin x) = cos x
  - d/dx(cos x) = -sin x
  - d/dx(tan x) = sec² x
  - d/dx(sec x) = sec x·tan x

### Standard Integrals
- ∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + C  (n ≠ -1)
- ∫ (1/x) dx = ln|x| + C
- ∫ eᵏˣ dx = (1/k)eᵏˣ + C
- Integration by Parts: ∫ u·v' dx = uv - ∫ u'v dx
- Substitution: When integrand contains g'(x)f(g(x)), set u = g(x).`,
          cachedAt: Date.now(),
          sizeKb: 12,
        },
        {
          id: 'mat-concours-prep-tips',
          title: 'Concours Medical & Engineering High-Yield Strategy',
          subjectId: 'a-physics',
          subjectName: 'Concours Bridge',
          level: 'A',
          category: 'concours_tips',
          description: 'FHS Buea, CUSS Yaoundé, and NAHPI Bamenda speed tactics and question weights.',
          content: `### Strategy for Cameroon Concours:
1. **Speed & Time Budgeting**:
   - Concours MCQs give ~60 seconds per question. Never spend >90 seconds on a single problem.
   - Mark uncertain questions with a pencil dot and proceed immediately.

2. **Negative Marking Caution**:
   - In FHS Buea & CUSS Yaoundé, check if negative marking (-0.25 or -0.5) is enforced this year.
   - Guess only when you can eliminate at least 2 options.

3. **Key Scoring Topics**:
   - Physics: Dimensional analysis, projectile trajectories, DC circuits, ray optics.
   - Chemistry: Stoichiometry, buffer pH calculations, reaction orders, aromatic mechanisms.
   - Biology: Cell transport, Krebs cycle ATP yields, Mendelian genetics, nervous reflex arcs.`,
          cachedAt: Date.now(),
          sizeKb: 10,
        },
      ];

      defaultMaterials.forEach((m) => this.cacheStudyMaterial(m));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch (e) {
      console.warn('Could not initialize offline seed materials:', e);
    }
  }

  /**
   * Clear all cached offline papers and study materials
   */
  clearOfflineCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PAPERS);
      localStorage.removeItem(STORAGE_KEYS.MATERIALS);
      localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    } catch {}
  }
}

export const offlineStorage = new OfflineStorageService();
