import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProgressService } from '../../services/progress.service';
import { NavigationService } from '../../services/navigation.service';

interface InterviewQA {
  number: number;
  question: string;
  answer: string;
  isFiveCrore: boolean;
  difficulty: string;
}

interface Part {
  partNumber: number;
  heading: string;
  bodyMdx: string;
  interviewHook?: string;
  fiveCroreAnswer?: string;
  diagramIds?: string[];
  interviewQAs?: InterviewQA[];
  timelineSteps?: string[];
  codeIllustration?: {
    code: string;
    language: string;
    explanation: string;
  };
}

interface TopicData {
  slug: string;
  moduleSlug: string;
  title: string;
  summaryOneLiner: string;
  estimatedReadMinutes: number;
  keyTerms: string[];
  parts: Part[];
}

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topic-detail.component.html',
  styleUrls: ['./topic-detail.component.css']
})
export class TopicDetailComponent implements OnInit {
  public slug: string = '';
  public topic: TopicData | null = null;
  public loading: boolean = true;
  
  // Interactive Timeline state per part
  public activePartIdx: number = 0;
  public activeTimelineStep: number = 0;
  
  // Interactive QA accordion state
  public openQAs: Record<number, boolean> = {};

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public progressService: ProgressService,
    public navService: NavigationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slugVal = params.get('slug');
      if (slugVal) {
        this.slug = slugVal;
        this.loadTopicData();
      }
    });
  }

  private loadTopicData() {
    this.loading = true;
    console.log('Antigravity Debug: HTTP request initiated for content-manifest.json with slug:', this.slug);
    this.http.get<Record<string, TopicData>>('/content-manifest.json').subscribe({
      next: (manifest) => {
        console.log('Antigravity Debug: HTTP next callback fired. Manifest exists?', !!manifest);
        try {
          if (manifest && manifest[this.slug]) {
            console.log('Antigravity Debug: Slug found inside manifest:', this.slug);
            this.topic = manifest[this.slug];
            // Mark topic as visited in progress service
            this.progressService.visitTopic(this.slug);
            // Reset interaction states
            this.activePartIdx = 0;
            this.activeTimelineStep = 0;
            this.openQAs = {};
          } else {
            console.warn('Antigravity Debug: Slug NOT found inside manifest:', this.slug);
            this.topic = null;
          }
        } catch (err) {
          console.error('Antigravity Debug: Error parsing manifest topic', err);
          this.topic = null;
        } finally {
          this.loading = false;
          console.log('Antigravity Debug: Loading set to false. this.topic exists?', !!this.topic);
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Antigravity Debug: Failed to load topic data', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  public selectPart(idx: number) {
    this.activePartIdx = idx;
    this.activeTimelineStep = 0;
    this.cdr.markForCheck();
  }

  public selectStep(stepIdx: number) {
    this.activeTimelineStep = stepIdx;
    this.cdr.markForCheck();
  }

  public toggleQA(qaNum: number) {
    this.openQAs[qaNum] = !this.openQAs[qaNum];
    this.cdr.markForCheck();
  }

  public toggleQAProgress(qaNum: number, event: MouseEvent) {
    event.stopPropagation(); // Avoid toggling QA content
    this.progressService.reviewQA(qaNum);
    this.cdr.markForCheck();
  }

  public getModuleColor(slug: string): string {
    const themeColors: Record<string, string> = {
      'spring-framework-fundamentals': '#10E39B',
      'spring-boot': '#22D3EE',
      'spring-boot-annotations': '#38BDF8',
      'microservices': '#A78BFA',
      'java-collections': '#FBBF24',
      'java-8-17-21': '#E879F9',
      'multithreading-concurrency': '#FB7185',
      'sql-database': '#A3E635',
      'jvm-internals': '#FB923C',
      'core-java': '#60A5FA'
    };
    return themeColors[slug] || '#3b82f6';
  }
}
