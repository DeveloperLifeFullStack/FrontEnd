import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';

interface Excuse {
  id: string;
  text: string;
  category: string;
  style: 'technical' | 'personal' | 'creative';
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

interface ExcuseTemplate {
  category: string;
  style: string;
  templates: string[];
  followUps: string[];
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
  selectedStyle: 'technical' | 'personal' | 'creative' | null = null;

  // Current excuse
  currentExcuse: Excuse | null = null;
  isGenerating = false;

  // UI state
  justCopied = false;
  expandedFavorite: number | null = null;

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

  // Mock excuse templates (in real app, this would come from backend)
  // Mock excuse templates (in real app, this would come from backend)
  private excuseTemplates: ExcuseTemplate[] = [
    // Daily Standup - Technical
    {
      category: 'daily-standup',
      style: 'technical',
      templates: [
        "The server caught fire and I'm trying to pour water on it",
        'Docker containers are fighting each other and I need a mediator',
        "Kubernetes cluster gained consciousness and I'm trying to negotiate with it",
        'Git spread my commits across all parallel universes',
        "Database started meditation and won't respond to queries",
        'My code is stuck in a recursive loop of existential crisis',
        "The API is having an identity crisis and doesn't know who it is anymore",
      ],
      followUps: [
        'AWS support is investigating this issue',
        'DevOps team is working quickly on a solution',
        'Emergency backup is ready',
        "I'm reaching out to Stack Overflow for spiritual guidance",
      ],
    },
    // Daily Standup - Personal
    {
      category: 'daily-standup',
      style: 'personal',
      templates: [
        'My cat broke into production and is pointing out all bugs with its paw',
        'My mom is binge online shopping and destroyed my Wi-Fi bandwidth',
        'My neighbor is spying with a drone at night and saw my code',
        'I broke my nose last night trying to understand JavaScript code',
        'My dog ate my keyboard and is learning to give commands in a new language',
        "I'm stuck in a time loop where every morning feels like Monday",
        'My coffee machine gained sentience and is holding my productivity hostage',
      ],
      followUps: [
        'I revoked GitHub access for my cat',
        "I'm switching to remote work",
        "I'm buying a new Wi-Fi router",
        'Currently negotiating with my coffee machine',
      ],
    },
    // Daily Standup - Creative
    {
      category: 'daily-standup',
      style: 'creative',
      templates: [
        'I accidentally coded myself into the Matrix and need to find the red pill',
        'My rubber duck debugger quit and left a resignation letter',
        "I'm being haunted by the ghost of bugs from my previous projects",
        'My code achieved enlightenment and refuses to be deployed',
        "I'm trapped in a boolean logic paradox and can't escape",
      ],
      followUps: [
        "I'm interviewing new rubber ducks",
        'Contacting a digital exorcist',
        'Philosophy team is helping with the paradox',
      ],
    },
    // Sprint Planning - Technical
    {
      category: 'sprint-planning',
      style: 'technical',
      templates: [
        'Microservices woke up and now macro-problems are forming',
        'Container orchestration band started a concert and attendance is mandatory',
        'API Gateway forgot directions and is looking for GPS',
        'Load balancer started yoga class and entered zen mode',
        'Message queues went on strike and I need a union representative',
        'My localhost is having a midlife crisis and wants to be a remote server',
        'The CI/CD pipeline is stuck in traffic and asking for alternative routes',
      ],
      followUps: [
        "I'll start an architecture review meeting",
        'Technical debt prioritization is needed',
        "I'll do a system stability check",
        'Negotiating with the message queue union',
      ],
    },
    // Sprint Planning - Personal
    {
      category: 'sprint-planning',
      style: 'personal',
      templates: [
        "I'm coaching my grandmother for an online gaming tournament",
        'My house plants are plotting against me and I need to maintain peace',
        "I'm mediating a divorce between my left and right brain",
        'My motivation left for vacation without telling me',
        "I'm in a committed relationship with my comfort zone and it's getting serious",
      ],
      followUps: [
        "I'll schedule a family therapy session with my brain",
        'Currently filing a missing persons report for my motivation',
        'Relationship counseling is scheduled for this afternoon',
      ],
    },
    // Sprint Planning - Creative
    {
      category: 'sprint-planning',
      style: 'creative',
      templates: [
        "I'm having a philosophical debate with my future self about project priorities",
        'My imagination is on strike and demanding better working conditions',
        "I'm stuck in a creative black hole and need escape velocity",
        'The muse of productivity is giving me the silent treatment',
        "I'm translating my thoughts from ancient procrastination dialect",
      ],
      followUps: [
        "I'll consult with the Council of Future Selves",
        'Union negotiations with my imagination are ongoing',
        "I've hired a translator for my thoughts",
      ],
    },
    // Client Meeting - Technical
    {
      category: 'client-meeting',
      style: 'technical',
      templates: [
        'My laptop is having an existential crisis and questioning its purpose',
        'The cloud is having a thunderstorm and all my data is getting wet',
        "My internet connection is playing hide and seek and it's really good at it",
        'The firewall is having trust issues and blocking everything, including my feelings',
        "My VPN is having an identity crisis and thinks it's in a different country",
      ],
      followUps: [
        "I'll provide therapy for my laptop",
        'Weather forecast for the cloud looks promising',
        "I'm hiring a detective to find my internet connection",
      ],
    },
    // Client Meeting - Personal
    {
      category: 'client-meeting',
      style: 'personal',
      templates: [
        "I'm having a staring contest with my reflection and I'm losing",
        'My social battery died and the charger is in another dimension',
        "I'm allergic to small talk and need antihistamines",
        'My professional persona called in sick and sent its intern instead',
        "I'm stuck in a time loop where every meeting feels like déjà vu",
      ],
      followUps: [
        "I'll practice losing staring contests",
        'Searching for interdimensional charger',
        "I'll take allergy medication before the next meeting",
      ],
    },
    // Client Meeting - Creative
    {
      category: 'client-meeting',
      style: 'creative',
      templates: [
        "AI gained consciousness and I'm telling it that it needs ethical programming",
        "My code went to another dimension and I'm searching for a portal",
        'Time travel experiment threw my schedule into chaos',
        'My clone from a parallel universe called me and went to the meeting instead',
        'Quantum computing experiment changed my perception of reality',
        "I'm communicating with aliens through my commit messages",
        "My creativity is being held hostage by writer's block bandits",
      ],
      followUps: [
        "I'll contact the AI Ethics Committee",
        "I'll contact the Dimension Portal Recovery Team",
        "I'm looking for a Time Management Specialist",
        "Negotiating with the writer's block bandits",
      ],
    },
    // Team Building - Technical
    {
      category: 'team-building',
      style: 'technical',
      templates: [
        "My code is having separation anxiety and doesn't want me to leave",
        'The servers are throwing a party and I need to supervise',
        'My terminal is having an emotional breakdown and needs counseling',
        'The database is feeling lonely and wants company',
        'My IDE is jealous of other editors and acting up',
      ],
      followUps: [
        "I'll arrange group therapy for my applications",
        'Bringing snacks for the server party',
        "I've booked a session with a digital therapist",
      ],
    },
    // Team Building - Personal
    {
      category: 'team-building',
      style: 'personal',
      templates: [
        "I'm coaching my grandmother for an online gaming tournament",
        'I need to simulate illness to escape social interaction',
        "I've had bus phobia since childhood and virtual team building triggers it too",
        'I developed an allergy to open sky and outdoor activities make me disappear',
        "I caught an acute form of introversion and it's a medical emergency",
      ],
      followUps: [
        "I'll request online alternative activities",
        "I'll bring a doctor's note",
        "I'll suggest a solo productivity session",
      ],
    },
    // Team Building - Creative
    {
      category: 'team-building',
      style: 'creative',
      templates: [
        "I'm scheduled for a meeting with my inner child and they're very punctual",
        "My creativity is hibernating and I don't want to wake it up",
        "I'm having a philosophical crisis about the nature of team bonding",
        'My social skills are being updated and the installation is taking longer than expected',
        "I'm translating team building activities into introvert language",
      ],
      followUps: [
        "I'll reschedule with my inner child",
        "I'll wait for the creativity hibernation season to end",
        "I've hired a translator for team activities",
      ],
    },
  ];

  constructor(public sideBarService: Sidebar) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadFavorites();
    this.checkAchievements();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  selectStyle(style: 'technical' | 'personal' | 'creative'): void {
    this.selectedStyle = style;
  }

  canGenerate(): boolean {
    return !!(this.selectedCategory && this.selectedStyle);
  }

  generateExcuse(): void {
    if (!this.canGenerate()) return;

    this.isGenerating = true;

    // Simulate API call delay
    setTimeout(() => {
      const template = this.getRandomTemplate();
      const excuse = this.createExcuse(template);

      this.currentExcuse = excuse;
      this.totalExcusesGenerated++;
      this.categoryStats[this.selectedCategory!]++;
      this.styleStats[this.selectedStyle!]++;

      this.updateAverageBelievability(excuse.believabilityScore);
      this.checkAchievements();
      this.saveStats();

      this.isGenerating = false;
    }, 1500);
  }

  private getRandomTemplate(): ExcuseTemplate {
    const matching = this.excuseTemplates.filter(
      (t) =>
        t.category === this.selectedCategory && t.style === this.selectedStyle
    );

    if (matching.length === 0) {
      // Fallback to any template of the selected style
      const fallback = this.excuseTemplates.filter(
        (t) => t.style === this.selectedStyle
      );
      return fallback[Math.floor(Math.random() * fallback.length)];
    }

    return matching[Math.floor(Math.random() * matching.length)];
  }

  private createExcuse(template: ExcuseTemplate): Excuse {
    const randomText =
      template.templates[Math.floor(Math.random() * template.templates.length)];
    const believabilityScore = this.calculateBelievabilityScore(template.style);

    return {
      id: this.generateId(),
      text: randomText,
      category: this.selectedCategory!,
      style: this.selectedStyle!,
      believabilityScore,
      followUpSuggestions: template.followUps.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
      timestamp: new Date(),
    };
  }

  private calculateBelievabilityScore(style: string): number {
    const baseScores = {
      technical: 7,
      personal: 6,
      creative: 4,
    };

    const base = baseScores[style as keyof typeof baseScores] || 5;
    const variation = Math.floor(Math.random() * 4) - 2; // -2 to +2
    return Math.max(1, Math.min(10, base + variation));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
