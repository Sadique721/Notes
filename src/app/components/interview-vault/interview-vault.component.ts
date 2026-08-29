import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ProgressService } from '../../services/progress.service';

interface QAIndexEntry {
  type: string;
  moduleSlug: string;
  moduleTitle: string;
  topicSlug: string;
  topicTitle: string;
  qaNumber: number;
  qaQuestion: string;
  qaAnswer: string;
  isFiveCrore: boolean;
  difficulty: 'five-crore' | 'hard' | 'medium';
}

@Component({
  selector: 'app-interview-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './interview-vault.component.html',
  styleUrls: ['./interview-vault.component.css']
})
export class InterviewVaultComponent implements OnInit {
  public allQAs: QAIndexEntry[] = [];
  public loading: boolean = true;

  // Search & Filter state
  public searchQuery: string = '';
  public activeModule: string = 'all';
  public activeDifficulty: string = 'all';

  // Pagination state
  public currentPage: number = 1;
  public pageSize: number = 8;

  // Accordion expands
  public openQAs: Record<string, boolean> = {};

  public modules = [
    { slug: 'all', label: 'All Modules' },
    { slug: 'spring-framework-fundamentals', label: 'Spring Fundamentals' },
    { slug: 'spring-boot', label: 'Spring Boot' },
    { slug: 'spring-boot-annotations', label: 'Boot Annotations' },
    { slug: 'microservices', label: 'Microservices' },
    { slug: 'java-collections', label: 'Java Collections' },
    { slug: 'java-8-17-21', label: 'Java 8/17/21' },
    { slug: 'multithreading-concurrency', label: 'Concurrency' },
    { slug: 'sql-database', label: 'SQL & Database' },
    { slug: 'jvm-internals', label: 'JVM Internals' },
    { slug: 'core-java', label: 'Core Java' }
  ];

  constructor(
    private http: HttpClient,
    public progressService: ProgressService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<{ searchIndex: any[] }>('/content-index.json').subscribe({
      next: (res) => {
        // Filter out only interview QA entries
        this.allQAs = (res.searchIndex || []).filter(e => e.type === 'interviewQA') as QAIndexEntry[];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load content index', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // Getters for filtered QAs
  public get filteredQAs(): QAIndexEntry[] {
    return this.allQAs.filter(qa => {
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = 
        qa.qaQuestion.toLowerCase().includes(query) ||
        qa.qaAnswer.toLowerCase().includes(query) ||
        qa.topicTitle.toLowerCase().includes(query);
      
      const matchesModule = this.activeModule === 'all' || qa.moduleSlug === this.activeModule;
      
      const matchesDifficulty = this.activeDifficulty === 'all' || qa.difficulty === this.activeDifficulty;

      return matchesSearch && matchesModule && matchesDifficulty;
    });
  }

  // Getters for paginated QAs
  public get paginatedQAs(): QAIndexEntry[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredQAs.slice(start, start + this.pageSize);
  }

  public get totalPages(): number {
    return Math.ceil(this.filteredQAs.length / this.pageSize);
  }

  public get pagesArray(): number[] {
    const total = this.totalPages;
    const array: number[] = [];
    for (let i = 1; i <= total; i++) {
      array.push(i);
    }
    return array;
  }

  public setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.openQAs = {};
    }
  }

  public filterByModule(slug: string) {
    this.activeModule = slug;
    this.currentPage = 1;
    this.openQAs = {};
  }

  public filterByDifficulty(diff: string) {
    this.activeDifficulty = diff;
    this.currentPage = 1;
    this.openQAs = {};
  }

  public toggleQA(topicSlug: string, qaNum: number) {
    const key = `${topicSlug}-${qaNum}`;
    this.openQAs[key] = !this.openQAs[key];
  }

  public isQAOpen(topicSlug: string, qaNum: number): boolean {
    return !!this.openQAs[`${topicSlug}-${qaNum}`];
  }

  public toggleQAProgress(qaNum: number, event: MouseEvent) {
    event.stopPropagation();
    this.progressService.reviewQA(qaNum);
  }

  public getModuleColor(slug: string): string {
    const themeColors: Record<string, string> = {
      'dashboard': '#10E39B',
      'api-providers': '#22D3EE',
      'services': '#38BDF8',
      'inventory': '#A78BFA',
      'orders': '#FBBF24',
      'users': '#E879F9',
      'message': '#FB7185',
      'payments': '#A3E635',
      'invoices': '#FB923C',
      'currency': '#60A5FA'
    };
    return themeColors[slug] || '#3b82f6';
  }
}
