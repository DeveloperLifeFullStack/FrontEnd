import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { Sidebar } from '../../../../services/sidebar';
import { DatingAppService } from '../../../../services/dating-app-service';

interface UserProfile {
  gender: 'male' | 'female' | 'other' | '';
  bio: string;
}

interface DeveloperProfile {
  id: number;
  name: string;
  role: string;
  experience: string;
  location: string;
  bio: string;
  techStack: string[];
  compatibility: number;
  liked?: boolean;
}

interface ChatMessage {
  text: string;
  time: Date;
  isOwn: boolean;
}

interface Stats {
  likes: number;
  matches: number;
  viewed: number;
}

@Component({
  selector: 'app-dev-dating-room',
  imports: [CommonModule, FormsModule],
  templateUrl: './dev-dating-room.html',
  styleUrl: './dev-dating-room.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class DevDatingRoom {
  @ViewChild('chatMessagesContainer') chatMessagesRef!: ElementRef;

  userProfile: UserProfile = {
    gender: '',
    bio: '',
  };
  isSetupComplete = false;

  currentProfile: DeveloperProfile | null = null;
  profiles: DeveloperProfile[] = [];
  isSwipeAnimating = false;

  showMatchNotification = false;
  lastMatch: DeveloperProfile | null = null;
  matches: DeveloperProfile[] = [];

  showChat = false;
  currentChatPartner: DeveloperProfile | null = null;
  chatMessages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  currentConversationId: string = '';
  chatError: string = '';

  stats: Stats = {
    likes: 0,
    matches: 0,
    viewed: 0,
  };

  private mockProfiles: DeveloperProfile[] = [
    {
      id: 1,
      name: 'Alex Rodriguez',
      role: 'Frontend Developer',
      experience: '3 years',
      location: 'San Francisco',
      bio: 'React enthusiast who loves clean code and pixel-perfect designs. Always debugging with a coffee in hand ☕',
      techStack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      compatibility: 87,
    },
    {
      id: 2,
      name: 'Sarah Chen',
      role: 'Full Stack Developer',
      experience: '5 years',
      location: 'New York',
      bio: "Building scalable applications by day, contributing to open source by night. Let's code something amazing together! 🚀",
      techStack: ['Node.js', 'Python', 'React', 'PostgreSQL'],
      compatibility: 92,
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      role: 'Backend Engineer',
      experience: '4 years',
      location: 'Austin',
      bio: 'API architect and database wizard. I speak fluent SQL and my code is as reliable as my morning routine 📊',
      techStack: ['Java', 'Spring Boot', 'Docker', 'AWS'],
      compatibility: 76,
    },
    {
      id: 4,
      name: 'Emma Thompson',
      role: 'DevOps Engineer',
      experience: '6 years',
      location: 'Seattle',
      bio: 'Automating everything so developers can focus on what they love. Infrastructure as code is poetry 🎭',
      techStack: ['Kubernetes', 'Terraform', 'Jenkins', 'Python'],
      compatibility: 81,
    },
    {
      id: 5,
      name: 'David Kim',
      role: 'Mobile Developer',
      experience: '3 years',
      location: 'Los Angeles',
      bio: 'Crafting beautiful mobile experiences. Native iOS/Android dev who dreams in Swift and Kotlin 📱',
      techStack: ['Swift', 'Kotlin', 'React Native', 'Flutter'],
      compatibility: 89,
    },
    {
      id: 6,
      name: 'Lisa Wang',
      role: 'Data Engineer',
      experience: '4 years',
      location: 'Boston',
      bio: 'Turning data into insights and chaos into pipelines. Big data enthusiast with a passion for ML 🤖',
      techStack: ['Python', 'Spark', 'Kafka', 'TensorFlow'],
      compatibility: 73,
    },
  ];

  constructor(
    public sideBarService: Sidebar,
    private datingAppService: DatingAppService
  ) {
    this.initializeProfiles();
  }

  initializeProfiles(): void {
    this.profiles = [...this.mockProfiles];
    this.loadNextProfile();
  }

  isSetupValid(): boolean {
    return !!(this.userProfile.gender && this.userProfile.bio.trim());
  }

  completeSetup(): void {
    if (this.isSetupValid()) {
      this.isSetupComplete = true;
    }
  }

  loadNextProfile(): void {
    if (this.profiles.length > 0) {
      this.currentProfile = this.profiles[0];
    } else {
      this.currentProfile = null;
    }
  }

  swipeLeft(): void {
    if (this.isSwipeAnimating) return;
    this.animateSwipe('left', false);
  }

  swipeRight(): void {
    if (this.isSwipeAnimating) return;
    this.animateSwipe('right', true);
  }

  private animateSwipe(direction: 'left' | 'right', liked: boolean): void {
    if (!this.currentProfile) return;

    this.isSwipeAnimating = true;
    const profileCard = document.querySelector('.profile-card') as HTMLElement;

    if (profileCard) {
      profileCard.classList.add(`swipe-${direction}`);
      setTimeout(() => {
        this.handleSwipe(liked);
        this.isSwipeAnimating = false;
        setTimeout(
          () => profileCard?.classList.remove(`swipe-${direction}`),
          100
        );
      }, 500);
    } else {
      this.handleSwipe(liked);
      this.isSwipeAnimating = false;
    }
  }

  private handleSwipe(liked: boolean): void {
    if (!this.currentProfile) return;

    this.stats.viewed++;

    if (liked) {
      this.stats.likes++;
      this.currentProfile.liked = true;

      if (Math.random() > 0.5) {
        this.createMatch(this.currentProfile);
      }
    }

    this.profiles.shift();
    this.loadNextProfile();
  }

  private createMatch(profile: DeveloperProfile): void {
    this.matches.push(profile);
    this.lastMatch = profile;
    this.stats.matches++;
    this.showMatchNotification = true;
  }

  closeMatchNotification(): void {
    this.showMatchNotification = false;
  }

  startChat(): void {
    if (this.lastMatch) {
      this.currentChatPartner = this.lastMatch;
      this.showChat = true;
      this.showMatchNotification = false;
      this.initializeChat();
    }
  }

  closeChat(): void {
    this.showChat = false;
    this.currentChatPartner = null;
    this.chatMessages = [];
    this.currentConversationId = '';
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage = this.currentMessage.trim();

    this.chatMessages.push({
      text: userMessage,
      time: new Date(),
      isOwn: true,
    });

    this.currentMessage = '';
    this.scrollChatToBottom();
    this.isTyping = true;
    this.chatError = '';

    const messagePayload = {
      message: userMessage,
      conversationId: this.currentConversationId || undefined,
      userProfile: {
        name: 'You',
        role: 'Developer',
        techStack: [],
      },
      partnerProfile: this.currentChatPartner
        ? {
            name: this.currentChatPartner.name,
            role: this.currentChatPartner.role,
            techStack: this.currentChatPartner.techStack,
          }
        : undefined,
    };

    this.datingAppService.chatAI(messagePayload).subscribe({
      next: (response: any) => {
        if (response.conversationId) {
          this.currentConversationId = response.conversationId;
        }

        let aiMessage = '';
        if (response.reply) {
          aiMessage = response.reply;
        } else if (response.message) {
          aiMessage = response.message; // Fixed: was response.response
        } else if (response.text) {
          aiMessage = response.text;
        } else if (response.content) {
          aiMessage = response.content;
        } else {
          aiMessage =
            "I received your message but I'm having trouble responding right now.";
        }

        this.chatMessages.push({
          text: aiMessage,
          time: response.timestamp ? new Date(response.timestamp) : new Date(),
          isOwn: false,
        });

        this.isTyping = false;
        this.scrollChatToBottom();
      },
      error: (error) => {
        console.error('Chat API error:', error);
        this.chatError = 'Failed to send message. Please try again.';
        this.isTyping = false;
        this.addFallbackResponse();
      },
    });
  }

  private addFallbackResponse(): void {
    setTimeout(() => {
      this.chatMessages.push({
        text: "I'm having trouble connecting right now 🤖 But I'm still here to chat!",
        time: new Date(),
        isOwn: false,
      });
      this.scrollChatToBottom();
    }, 1500);
  }

  private initializeChat(): void {
    this.currentConversationId = '';
    this.chatMessages = [
      {
        text: `Hey! Thanks for the match! I'm excited to chat with a fellow developer 😊`,
        time: new Date(),
        isOwn: false,
      },
    ];
    this.scrollChatToBottom();
  }

  clearChatError(): void {
    this.chatError = '';
  }

  private scrollChatToBottom(): void {
    setTimeout(() => {
      if (this.chatMessagesRef) {
        const element = this.chatMessagesRef.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  getTechClass(tech: string): string {
    const frontendTechs = [
      'React',
      'Vue',
      'Angular',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'Next.js',
      'Swift',
      'Kotlin',
      'React Native',
      'Flutter',
    ];
    const backendTechs = [
      'Node.js',
      'Python',
      'Java',
      'Spring Boot',
      'Django',
      'Flask',
      'PHP',
      'Ruby',
      'Go',
      'Rust',
      'C#',
    ];
    const databaseTechs = [
      'MongoDB',
      'PostgreSQL',
      'MySQL',
      'Redis',
      'Elasticsearch',
      'Spark',
      'Kafka',
    ];

    if (frontendTechs.includes(tech)) return 'frontend';
    if (backendTechs.includes(tech)) return 'backend';
    if (databaseTechs.includes(tech)) return 'database';
    return '';
  }

  resetProfiles(): void {
    this.initializeProfiles();
    this.stats = { likes: 0, matches: 0, viewed: 0 };
    this.matches = [];
  }
}
