import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';

// Monaco Editor types
declare var monaco: any;

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
export class CodeRoast implements AfterViewInit, OnDestroy {
  @ViewChild('monacoEditor', { static: false }) monacoEditorRef!: ElementRef;

  // Monaco Editor instance
  private editor: any;
  public isMonacoLoaded = false;

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

  // Language mapping for Monaco
  private monacoLanguageMap: Record<string, string> = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    csharp: 'csharp',
    cpp: 'cpp',
  };

  // Monaco themes
  public currentTheme = 'vs-dark';

  // Mock challenges data (keeping your existing data)
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

  // Mock roast responses (keeping your existing data)
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

  ngAfterViewInit(): void {
    // this.loadMonacoEditor();
    console.log('Intialized');
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private async loadMonacoEditor(): Promise<void> {
    console.log('Loading Monaco Editor...');

    if (this.isMonacoLoaded && this.editor) {
      console.log('Monaco already loaded and initialized');
      return;
    }

    try {
      // Check if Monaco is already loaded
      if (typeof monaco !== 'undefined') {
        console.log('Monaco already available globally');
        this.initializeEditor(); // Don't set isMonacoLoaded here
        return;
      }

      console.log('Loading Monaco from CDN...');

      // Load Monaco Editor via CDN
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';

      script.onload = () => {
        console.log('Monaco loader loaded successfully');

        (window as any).require.config({
          paths: {
            vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
          },
        });

        (window as any).require(['vs/editor/editor.main'], () => {
          console.log('Monaco editor main loaded');
          this.initializeEditor(); // This will set isMonacoLoaded to true
        });
      };

      script.onerror = (error) => {
        console.error('Failed to load Monaco Editor script:', error);
        this.isMonacoLoaded = false;
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error in loadMonacoEditor:', error);
      this.isMonacoLoaded = false;
    }
  }

  private initializeEditor(): void {
    console.log('Initializing editor...');

    if (!this.monacoEditorRef?.nativeElement) {
      console.error('Monaco editor container not found');
      return;
    }

    if (typeof monaco === 'undefined') {
      console.error('Monaco not loaded');
      return;
    }

    try {
      const editorOptions = {
        value: this.userCode || this.getStarterCode(),
        language: this.monacoLanguageMap[this.selectedLanguage] || 'javascript',
        theme: this.currentTheme,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: '"Fira Code", "Consolas", "Courier New", monospace',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordBasedSuggestions: 'off',
        parameterHints: {
          enabled: true,
        },
      };

      this.editor = monaco.editor.create(
        this.monacoEditorRef.nativeElement,
        editorOptions
      );

      // Listen for content changes
      this.editor.onDidChangeModelContent(() => {
        this.userCode = this.editor.getValue();
      });

      // Custom keybindings
      this.editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          this.runCode();
        }
      );

      this.editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        () => {
          this.submitForRoast();
        }
      );

      console.log('Monaco Editor initialized successfully!');

      // Set the starter code if we don't have any code yet
      if (!this.userCode) {
        const starterCode = this.getStarterCode();
        this.editor.setValue(starterCode);
        this.userCode = starterCode;
      }

      // IMPORTANT: Set isMonacoLoaded to true AFTER editor is fully initialized
      // This ensures the loading spinner disappears
      this.isMonacoLoaded = true;
    } catch (error) {
      console.error('Error initializing Monaco Editor:', error);
      this.isMonacoLoaded = false; // Keep spinner visible if initialization fails
    }
  }

  private updateEditorLanguage(): void {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(
        model,
        this.monacoLanguageMap[this.selectedLanguage] || 'javascript'
      );
    }
  }

  private updateEditorCode(code: string): void {
    if (!this.editor) {
      this.userCode = code;
      return;
    }

    this.editor.setValue(code);
    this.userCode = code;
  }
  switchTheme(theme: string): void {
    const validTheme = theme as 'vs-dark' | 'vs-light' | 'hc-black';
    this.currentTheme = validTheme;
    if (this.editor) {
      monaco.editor.setTheme(validTheme);
    }
  }

  // Your existing methods with Monaco integration
  selectSource(source: string): void {
    this.selectedSource = source;
  }

  selectDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.selectedDifficulty = difficulty;
  }

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
    this.updateEditorLanguage();

    if (this.currentChallenge) {
      const newCode = this.getStarterCode();
      this.updateEditorCode(newCode);
    }
  }

  canGenerateChallenge(): boolean {
    return !!(this.selectedDifficulty && this.selectedLanguage);
  }

  getNewChallenge(): void {
    if (!this.selectedDifficulty || !this.selectedLanguage) return;

    const filtered = this.mockChallenges.filter(
      (c) => c.difficulty === this.selectedDifficulty
    );

    if (filtered.length > 0) {
      this.currentChallenge =
        filtered[Math.floor(Math.random() * filtered.length)];

      this.lastRoast = null;

      // Initialize Monaco AFTER the challenge card is rendered
      setTimeout(() => {
        this.loadMonacoEditor();
      }, 100);
    }
  }

  private getStarterCode(): string {
    const templates: Record<string, string> = {
      javascript: `function solution(nums, target) {
    // Write your solution here
    // Hint: Use a hash map for O(n) time complexity
    
}

// Test your solution:
// console.log(solution([2,7,11,15], 9)); // Expected: [0,1]`,

      python: `def solution(nums, target):
    """
    Write your solution here
    Hint: Use a hash map for O(n) time complexity
    """
    pass

# Test your solution:
# print(solution([2,7,11,15], 9))  # Expected: [0,1]`,

      java: `public class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your solution here
        // Hint: Use a HashMap for O(n) time complexity
        
    }
    
    // Test your solution:
    // System.out.println(Arrays.toString(solution(new int[]{2,7,11,15}, 9)));
}`,

      csharp: `public class Solution {
    public int[] TwoSum(int[] nums, int target) {
        // Write your solution here
        // Hint: Use a Dictionary for O(n) time complexity
        
    }
    
    // Test your solution:
    // Console.WriteLine(string.Join(",", TwoSum(new int[]{2,7,11,15}, 9)));
}`,

      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        // Hint: Use unordered_map for O(n) time complexity
        
    }
};

// Test your solution:
// vector<int> nums = {2,7,11,15};
// Solution sol;
// vector<int> result = sol.twoSum(nums, 9);`,
    };

    return templates[this.selectedLanguage] || templates['javascript'];
  }

  runCode(): void {
    if (!this.userCode.trim()) return;

    this.isRunning = true;

    // Simulate code execution
    setTimeout(() => {
      this.isRunning = false;
      console.log('Code executed successfully!');

      // You could add actual code execution here
      // For now, just show a success message
    }, 2000);
  }

  submitForRoast(): void {
    if (!this.userCode.trim()) return;

    // Get current code from editor
    if (this.editor) {
      this.userCode = this.editor.getValue();
    }

    const randomRoast =
      this.mockRoasts[Math.floor(Math.random() * this.mockRoasts.length)];

    setTimeout(() => {
      this.lastRoast = randomRoast;

      if (randomRoast.score >= 7) {
        this.solvedChallenges++;
        this.accuracy = Math.min(100, this.accuracy + 1);
      } else if (randomRoast.score <= 4) {
        this.accuracy = Math.max(0, this.accuracy - 2);
      }
    }, 1500);
  }

  // Utility methods for editor
  formatCode(): void {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument').run();
    }
  }

  insertSnippet(snippet: string): void {
    if (this.editor) {
      const selection = this.editor.getSelection();
      this.editor.executeEdits('', [
        {
          range: selection,
          text: snippet,
        },
      ]);
    }
  }

  getEditorContent(): string {
    return this.editor ? this.editor.getValue() : '';
  }
}
