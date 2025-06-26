import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Sidebar } from '../../../../services/sidebar'; // Commented out for debugging

interface UserProfile {
  gender: 'male' | 'female' | 'other' | '';
  preference: 'all' | 'frontend' | 'backend' | '';
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

  // User setup
  userProfile: UserProfile = {
    gender: '',
    preference: '',
    bio: '',
  };
  isSetupComplete = false;

  // Current state
  currentProfile: DeveloperProfile | null = null;
  profiles: DeveloperProfile[] = [];
  currentProfileIndex = 0;
  isSwipeAnimating = false;

  // Match system
  showMatchNotification = false;
  lastMatch: DeveloperProfile | null = null;
  matches: DeveloperProfile[] = [];

  // Chat system
  showChat = false;
  currentChatPartner: DeveloperProfile | null = null;
  chatMessages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;

  // Stats
  stats: Stats = {
    likes: 0,
    matches: 0,
    viewed: 0,
  };

  // Mock developer profiles
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

  // AI chat responses
  private chatResponses = [
    "That's really interesting! I've been working on something similar.",
    'I totally agree! Have you tried using any specific frameworks for that?',
    'Wow, that sounds like a challenging project. How did you approach it?',
    "Nice! I'm always excited to meet other developers who are passionate about clean code.",
    "That's awesome! I'd love to hear more about your experience with that technology.",
    'Cool! Maybe we could collaborate on something together sometime?',
    "I've been meaning to learn more about that. Any resources you'd recommend?",
    "That's exactly the kind of problem-solving mindset I appreciate!",
    'Interesting perspective! I never thought about it that way.',
    'That project sounds really impressive. What was the most challenging part?',
  ];

  constructor(public sideBarService: Sidebar) {
    this.initializeProfiles();
  }

  // Temporary method for mobile menu (replace with your actual sidebar service later)
  toggleSidebar(): void {
    console.log('Sidebar toggle clicked');
  }

  initializeProfiles(): void {
    this.profiles = [...this.mockProfiles];
    this.loadNextProfile();
  }

  isSetupValid(): boolean {
    return !!(
      this.userProfile.gender &&
      this.userProfile.preference &&
      this.userProfile.bio.trim()
    );
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

        // Remove animation class after animation completes
        setTimeout(() => {
          if (profileCard) {
            profileCard.classList.remove(`swipe-${direction}`);
          }
        }, 100);
      }, 500); // Animation duration
    } else {
      // Fallback if no animation
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

      // Simulate match (50% chance for demo purposes)
      if (Math.random() > 0.5) {
        this.createMatch(this.currentProfile);
      }
    }

    // Remove current profile and load next
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
  }

  private initializeChat(): void {
    this.chatMessages = [
      {
        text: `Hey! Thanks for the match! I'm excited to chat with a fellow developer 😊`,
        time: new Date(),
        isOwn: false,
      },
    ];
    this.scrollChatToBottom();
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;

    // Add user message
    this.chatMessages.push({
      text: this.currentMessage,
      time: new Date(),
      isOwn: true,
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.scrollChatToBottom();

    // Simulate typing and response
    this.isTyping = true;
    setTimeout(() => {
      const response = this.generateAIResponse(userMessage);
      this.chatMessages.push({
        text: response,
        time: new Date(),
        isOwn: false,
      });
      this.isTyping = false;
      this.scrollChatToBottom();
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  }

  private generateAIResponse(userMessage: string): string {
    // Simple AI response logic
    const message = userMessage.toLowerCase();

    if (message.includes('hello') || message.includes('hi')) {
      return 'Hi there! Great to meet you! What kind of development are you most passionate about?';
    } else if (message.includes('project')) {
      return 'That sounds like an exciting project! I love hearing about what other developers are building. What tech stack are you using?';
    } else if (message.includes('code') || message.includes('coding')) {
      return "I totally get that! There's something magical about writing clean, efficient code. What's your favorite programming language?";
    } else if (message.includes('work')) {
      return "Work can be really rewarding when you're building something meaningful! Are you working on anything particularly interesting right now?";
    } else {
      // Random response
      return this.chatResponses[
        Math.floor(Math.random() * this.chatResponses.length)
      ];
    }
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

  tryExample(repo: string): void {
    // This can be used later if you want to integrate with the WhoYouCode analysis
    console.log('Analyzing repo:', repo);
  }

  resetProfiles(): void {
    this.initializeProfiles();
    this.stats = { likes: 0, matches: 0, viewed: 0 };
    this.matches = [];
  }
}
