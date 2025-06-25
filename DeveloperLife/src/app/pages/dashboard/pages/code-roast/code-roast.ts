import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  examples?: Array<{ input: string; output: string }>;
  constraints?: string[];
}

interface RoastResult {
  score: number;
  scoreClass: 'good' | 'bad' | 'neutral';
  emoji: string;
  type: 'good' | 'bad' | 'neutral';
  message: string;
  details?: Array<{
    icon: string;
    title: string;
    comment: string;
  }>;
  testResults?: {
    passed: number;
    failed: number;
  };
}

@Component({
  selector: 'app-code-roast',
  imports: [CommonModule, FormsModule],
  templateUrl: './code-roast.html',
  styleUrl: './code-roast.scss',
})
export class CodeRoast {
  // Header stats
  solvedChallenges = 47;
  accuracy = 73;
  roastLevel = 'Medium Rare';

  // Challenge selection
  selectedDifficulty: 'easy' | 'medium' | 'hard' | null = null;
  selectedLanguage = 'javascript';
  selectedSource = 'leetcode';

  // Current challenge
  currentChallenge: Challenge | null = null;

  // Code editor
  userCode = '';
  isRunning = false;

  // Roast results
  lastRoast: RoastResult | null = null;

  // Mock challenges data
  private mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Two Sum',
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'easy',
      source: 'leetcode',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        'Only one valid answer exists',
      ],
    },
    {
      id: '2',
      title: 'Valid Parentheses',
      description:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      difficulty: 'easy',
      source: 'leetcode',
      examples: [
        { input: 's = "()"', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' },
      ],
    },
    {
      id: '3',
      title: 'Longest Palindromic Substring',
      description:
        'Given a string s, return the longest palindromic substring in s.',
      difficulty: 'medium',
      source: 'leetcode',
      examples: [
        { input: 's = "babad"', output: '"bab" or "aba"' },
        { input: 's = "cbbd"', output: '"bb"' },
      ],
    },
  ];

  // Mock roast responses
  private mockRoasts: RoastResult[] = [
    {
      score: 8,
      scoreClass: 'good',
      emoji: '👑',
      type: 'good',
      message:
        "Bravo! This code is so clean, it could be in a museum. My grandmother could write this, but she's been dead for 20 years, so you win!",
      details: [
        {
          icon: 'fas fa-thumbs-up',
          title: 'Code Quality',
          comment:
            'Excellent readability and structure. Even a confused intern could understand this.',
        },
        {
          icon: 'fas fa-rocket',
          title: 'Performance',
          comment: 'Optimized like a race car. Fast and efficient!',
        },
      ],
      testResults: { passed: 15, failed: 0 },
    },
    {
      score: 3,
      scoreClass: 'bad',
      emoji: '💀',
      type: 'bad',
      message:
        "This code is so bad, the compiler filed a complaint with HR. I've seen spaghetti with better structure than this mess.",
      details: [
        {
          icon: 'fas fa-skull',
          title: 'Code Quality',
          comment:
            'This looks like it was written during an earthquake while blindfolded.',
        },
        {
          icon: 'fas fa-snail',
          title: 'Performance',
          comment: 'Slower than a snail carrying a piano uphill.',
        },
      ],
      testResults: { passed: 3, failed: 12 },
    },
    {
      score: 6,
      scoreClass: 'neutral',
      emoji: '🤷',
      type: 'neutral',
      message:
        "This code works... technically. It's like a car with square wheels - it moves, but nobody wants to ride in it.",
      details: [
        {
          icon: 'fas fa-meh',
          title: 'Code Quality',
          comment: 'Functional but about as elegant as a dancing elephant.',
        },
      ],
      testResults: { passed: 8, failed: 2 },
    },
  ];

  constructor(public sideBarService: Sidebar) {}

  selectSource(source: string): void {
    this.selectedSource = source;
  }

  selectDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.selectedDifficulty = difficulty;
  }

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    // Update code template when language changes
    if (this.currentChallenge) {
      this.userCode = this.getStarterCode();
    }
  }

  canGenerateChallenge(): boolean {
    return !!(this.selectedDifficulty && this.selectedLanguage);
  }

  getNewChallenge(): void {
    if (!this.selectedDifficulty || !this.selectedLanguage) return;

    // Filter challenges by difficulty
    const filtered = this.mockChallenges.filter(
      (c) => c.difficulty === this.selectedDifficulty
    );

    if (filtered.length > 0) {
      this.currentChallenge =
        filtered[Math.floor(Math.random() * filtered.length)];
      this.userCode = this.getStarterCode();
      this.lastRoast = null;
    }
  }

  private getStarterCode(): string {
    const templates: Record<string, string> = {
      javascript: `function solution(nums, target) {
    // Write your solution here
    
}`,
      python: `def solution(nums, target):
    # Write your solution here
    pass`,
      java: `public class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
      csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
    };

    return templates[this.selectedLanguage] || templates['javascript'];
  }

  runCode(): void {
    if (!this.userCode.trim()) return;

    this.isRunning = true;

    setTimeout(() => {
      this.isRunning = false;
      console.log('Code executed successfully!');
    }, 2000);
  }

  submitForRoast(): void {
    if (!this.userCode.trim()) return;

    // Mock AI roasting - in real implementation, call OpenAI/Groq/Claude API
    const randomRoast =
      this.mockRoasts[Math.floor(Math.random() * this.mockRoasts.length)];

    setTimeout(() => {
      this.lastRoast = randomRoast;

      // Update stats based on score
      if (randomRoast.score >= 7) {
        this.solvedChallenges++;
        this.accuracy = Math.min(100, this.accuracy + 1);
      } else if (randomRoast.score <= 4) {
        this.accuracy = Math.max(0, this.accuracy - 2);
      }
    }, 1500);
  }
}
