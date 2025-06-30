import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';
import { EscapeMeetingService } from '../../../../services/escape-meeting-service';
interface Excuse {
  id: string;
  text: string;
  category: string;
  style: 'Technical' | 'Personal' | 'Creative';
  believabilityScore: number;
  followUpSuggestions?: string[];
  timestamp: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface BackendResponse {
  excuse: string;
  believabilityScore: number;
}

@Component({
  selector: 'app-escape-meeting',
  imports: [CommonModule, FormsModule],
  templateUrl: './escape-meeting.html',
  styleUrl: './escape-meeting.scss',
})
export class EscapeMeeting implements OnInit {
  // Header stats
  totalExcusesGenerated = 0;
  averageBelievability = 0;
  favoriteExcuses: Excuse[] = [];

  // Selection state
  selectedCategory: string | null = null;
  selectedStyle: 'Technical' | 'Personal' | 'Creative' | null = null;

  // Current excuse
  currentExcuse: Excuse | null = null;
  isGenerating = false;

  // UI state
  justCopied = false;
  expandedFavorite: number | null = null;

  // Error handling
  errorMessage: string | null = null;

  // Stats tracking
  categoryStats: Record<string, number> = {
    'daily-standup': 0,
    'sprint-planning': 0,
    'client-meeting': 0,
    'team-building': 0,
  };

  styleStats: Record<string, number> = {
    technical: 0,
    personal: 0,
    creative: 0,
  };

  // Achievements
  achievements: Achievement[] = [
    {
      id: 'first-excuse',
      name: 'First Escape',
      description: 'Generated your first excuse',
      icon: 'fas fa-baby',
      unlocked: false,
    },
    {
      id: 'believable-master',
      name: 'Master Deceiver',
      description: 'Generated an excuse with 9+ believability',
      icon: 'fas fa-mask',
      unlocked: false,
    },
    {
      id: 'favorite-collector',
      name: 'Collector',
      description: 'Saved 5 favorite excuses',
      icon: 'fas fa-star',
      unlocked: false,
    },
    {
      id: 'serial-escaper',
      name: 'Serial Escaper',
      description: 'Generated 25 excuses',
      icon: 'fas fa-running',
      unlocked: false,
    },
  ];

  constructor(
    public sideBarService: Sidebar,
    private escapeMeetingService: EscapeMeetingService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadFavorites();
    this.checkAchievements();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.clearError();
  }

  selectStyle(style: 'Technical' | 'Personal' | 'Creative'): void {
    this.selectedStyle = style;
    this.clearError();
  }

  canGenerate(): boolean {
    return !!(
      this.selectedCategory &&
      this.selectedStyle &&
      !this.isGenerating
    );
  }

  generateExcuse(): void {
    if (!this.canGenerate()) return;

    this.isGenerating = true;
    this.clearError();

    const requestData = {
      category: this.selectedCategory!,
      type: this.selectedStyle!,
    };

    this.escapeMeetingService.getReason(requestData).subscribe({
      next: (response) => {
        const excuse = this.createExcuseFromResponse(response);
        this.currentExcuse = excuse;
        console.log(this.currentExcuse);
        this.totalExcusesGenerated++;
        this.categoryStats[this.selectedCategory!]++;
        this.styleStats[this.selectedStyle!]++;

        this.updateAverageBelievability(excuse.believabilityScore);
        this.checkAchievements();
        this.saveStats();

        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error generating excuse:', error);
        this.errorMessage = 'Failed to generate excuse. Please try again.';
        this.isGenerating = false;
      },
    });
  }

  private createExcuseFromResponse(response: BackendResponse): Excuse {
    return {
      id: this.generateId(),
      text: response.excuse,
      category: this.selectedCategory!,
      style: this.selectedStyle!,
      believabilityScore: response.believabilityScore,
      followUpSuggestions: [], // You can add this to backend later or generate locally
      timestamp: new Date(),
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private clearError(): void {
    this.errorMessage = null;
  }

  getBelievabilityClass(): string {
    if (!this.currentExcuse) return 'medium';

    const score = this.currentExcuse.believabilityScore;
    if (score >= 8) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  copyToClipboard(): void {
    if (!this.currentExcuse) return;

    navigator.clipboard.writeText(this.currentExcuse.text).then(() => {
      this.justCopied = true;
      setTimeout(() => (this.justCopied = false), 2000);
    });
  }

  toggleFavorite(): void {
    if (!this.currentExcuse) return;

    const existingIndex = this.favoriteExcuses.findIndex(
      (f) => f.id === this.currentExcuse!.id
    );

    if (existingIndex >= 0) {
      this.favoriteExcuses.splice(existingIndex, 1);
    } else {
      this.favoriteExcuses.push({ ...this.currentExcuse });
    }

    this.saveFavorites();
    this.checkAchievements();
  }

  isCurrentFavorite(): boolean {
    if (!this.currentExcuse) return false;
    return this.favoriteExcuses.some((f) => f.id === this.currentExcuse!.id);
  }

  shareExcuse(): void {
    if (!this.currentExcuse) return;

    if (navigator.share) {
      navigator.share({
        title: 'Meeting Excuse Generator',
        text: this.currentExcuse.text,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      this.copyToClipboard();
    }
  }

  getExcusePreview(text: string): string {
    return text.length > 60 ? text.substring(0, 60) + '...' : text;
  }

  toggleFavoriteExpansion(index: number): void {
    this.expandedFavorite = this.expandedFavorite === index ? null : index;
  }

  copyFavorite(excuse: Excuse): void {
    navigator.clipboard.writeText(excuse.text).then(() => {
      // Could show a toast notification here
    });
  }

  shareFavorite(excuse: Excuse): void {
    if (navigator.share) {
      navigator.share({
        title: 'Meeting Excuse Generator',
        text: excuse.text,
        url: window.location.href,
      });
    } else {
      this.copyFavorite(excuse);
    }
  }

  removeFavorite(index: number): void {
    this.favoriteExcuses.splice(index, 1);
    this.expandedFavorite = null;
    this.saveFavorites();
  }

  getStatByCategory(category: string): number {
    return this.categoryStats[category] || 0;
  }

  getStatByStyle(style: string): number {
    return this.styleStats[style] || 0;
  }

  getMostBelievableScore(): number {
    // This would be tracked in real implementation
    return Math.max(...Object.values(this.styleStats)) > 0 ? 9 : 0;
  }

  get unlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  private checkAchievements(): void {
    // First excuse
    if (this.totalExcusesGenerated >= 1) {
      this.unlockAchievement('first-excuse');
    }

    // Believable master
    if (this.currentExcuse?.believabilityScore! >= 9) {
      this.unlockAchievement('believable-master');
    }

    // Favorite collector
    if (this.favoriteExcuses.length >= 5) {
      this.unlockAchievement('favorite-collector');
    }

    // Serial escaper
    if (this.totalExcusesGenerated >= 25) {
      this.unlockAchievement('serial-escaper');
    }
  }

  private unlockAchievement(id: string): void {
    const achievement = this.achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      // Could show a notification here
    }
  }

  private updateAverageBelievability(newScore: number): void {
    if (this.totalExcusesGenerated === 1) {
      this.averageBelievability = newScore;
    } else {
      const total =
        this.averageBelievability * (this.totalExcusesGenerated - 1) + newScore;
      this.averageBelievability = Math.round(
        total / this.totalExcusesGenerated
      );
    }
  }

  private saveStats(): void {
    const stats = {
      totalExcusesGenerated: this.totalExcusesGenerated,
      averageBelievability: this.averageBelievability,
      categoryStats: this.categoryStats,
      styleStats: this.styleStats,
      achievements: this.achievements,
    };
    localStorage.setItem('escape-meeting-stats', JSON.stringify(stats));
  }

  private loadStats(): void {
    const saved = localStorage.getItem('escape-meeting-stats');
    if (saved) {
      const stats = JSON.parse(saved);
      this.totalExcusesGenerated = stats.totalExcusesGenerated || 0;
      this.averageBelievability = stats.averageBelievability || 0;
      this.categoryStats = { ...this.categoryStats, ...stats.categoryStats };
      this.styleStats = { ...this.styleStats, ...stats.styleStats };
      if (stats.achievements) {
        this.achievements = stats.achievements;
      }
    }
  }

  private saveFavorites(): void {
    localStorage.setItem(
      'escape-meeting-favorites',
      JSON.stringify(this.favoriteExcuses)
    );
  }

  private loadFavorites(): void {
    const saved = localStorage.getItem('escape-meeting-favorites');
    if (saved) {
      this.favoriteExcuses = JSON.parse(saved);
    }
  }
}
