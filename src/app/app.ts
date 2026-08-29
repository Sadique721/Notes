import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from './services/navigation.service';
import { ProgressService } from './services/progress.service';
import { filter } from 'rxjs/operators';

interface TopicItem {
  slug: string;
  title: string;
  summaryOneLiner: string;
}

interface ModuleItem {
  slug: string;
  title: string;
  order: number;
  topics: TopicItem[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('injoy-angular');
  
  public rawModulesList: ModuleItem[] = [];
  public searchQuery: string = '';
  public expandedModules: Record<string, boolean> = {};

  constructor(
    public navService: NavigationService,
    public progressService: ProgressService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Load modules manifest
    this.http.get<Record<string, ModuleItem>>('/modules-manifest.json').subscribe({
      next: (data) => {
        this.rawModulesList = Object.values(data).sort((a, b) => a.order - b.order);
      },
      error: (err) => console.error('Failed to load modules manifest in root app component', err)
    });

    // Close drawer automatically on route navigation changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.navService.closeCurriculum();
    });
  }

  public toggleModule(slug: string) {
    this.expandedModules[slug] = !this.expandedModules[slug];
  }

  public get filteredModulesList(): ModuleItem[] {
    if (!this.searchQuery.trim()) {
      return this.rawModulesList;
    }
    const query = this.searchQuery.toLowerCase();
    
    return this.rawModulesList.map(mod => {
      const matchingTopics = mod.topics.filter(t => 
        t.title.toLowerCase().includes(query) || 
        (t.summaryOneLiner || '').toLowerCase().includes(query)
      );
      
      const moduleMatches = mod.title.toLowerCase().includes(query);
      
      if (moduleMatches || matchingTopics.length > 0) {
        // Auto-expand module if there's active matches
        this.expandedModules[mod.slug] = true;
        return {
          ...mod,
          topics: matchingTopics.length > 0 ? matchingTopics : mod.topics
        };
      }
      return null;
    }).filter((m): m is ModuleItem => m !== null);
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
