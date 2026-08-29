import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly STORAGE_KEY = 'injoy_progress';

  // Signals for state
  private readonly _visitedTopicSlugs = signal<string[]>([]);
  private readonly _reviewedQANumbers = signal<number[]>([]);

  // Public computed values
  public readonly visitedTopicSlugs = computed(() => this._visitedTopicSlugs());
  public readonly reviewedQANumbers = computed(() => this._reviewedQANumbers());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.visitedTopicSlugs) this._visitedTopicSlugs.set(parsed.visitedTopicSlugs);
        if (parsed.reviewedQANumbers) this._reviewedQANumbers.set(parsed.reviewedQANumbers);
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      const payload = {
        visitedTopicSlugs: this._visitedTopicSlugs(),
        reviewedQANumbers: this._reviewedQANumbers()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }

  public visitTopic(slug: string) {
    const current = this._visitedTopicSlugs();
    if (!current.includes(slug)) {
      this._visitedTopicSlugs.set([...current, slug]);
      this.saveToStorage();
    }
  }

  public unvisitTopic(slug: string) {
    const current = this._visitedTopicSlugs();
    this._visitedTopicSlugs.set(current.filter(s => s !== slug));
    this.saveToStorage();
  }

  public reviewQA(num: number) {
    const current = this._reviewedQANumbers();
    if (!current.includes(num)) {
      this._reviewedQANumbers.set([...current, num]);
    } else {
      this._reviewedQANumbers.set(current.filter(n => n !== num));
    }
    this.saveToStorage();
  }

  public isTopicVisited(slug: string): boolean {
    return this._visitedTopicSlugs().includes(slug);
  }

  public isQAReviewed(num: number): boolean {
    return this._reviewedQANumbers().includes(num);
  }
}
