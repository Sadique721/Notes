import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  public readonly curriculumOpen = signal<boolean>(false);

  public openCurriculum() {
    this.curriculumOpen.set(true);
  }

  public closeCurriculum() {
    this.curriculumOpen.set(false);
  }

  public toggleCurriculum() {
    this.curriculumOpen.set(!this.curriculumOpen());
  }
}
