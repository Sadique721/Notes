import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface ModuleItem {
  slug: string;
  title: string;
  order: number;
  topicCount: number;
  topics: { slug: string; title: string; summaryOneLiner: string }[];
}

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {
  public modules: Record<string, ModuleItem> = {};
  public modulesList: ModuleItem[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.http.get<Record<string, ModuleItem>>('/modules-manifest.json').subscribe({
      next: (data) => {
        this.modules = data;
        this.modulesList = Object.values(data).sort((a, b) => a.order - b.order);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load modules manifest', err);
        this.cdr.markForCheck();
      }
    });
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
