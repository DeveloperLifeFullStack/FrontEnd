import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';
import { CodeRoastService } from '../../../../services/code-roast-service';

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

interface TaskData {
  language: string;
  difficulty: string;
}

@Component({
  selector: 'app-code-roast',
  imports: [CommonModule, FormsModule],
  templateUrl: './code-roast.html',
  styleUrl: './code-roast.scss',
})
export class CodeRoast implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('monacoEditor', { static: false }) monacoEditorRef!: ElementRef;

  private editor: any;
  public isMonacoLoaded = false;

  // User data
  userData: any;
  originalStack: string = '';
  // Challenge selection
  selectedDifficulty: 'easy' | 'medium' | 'hard' | null = null;
  selectedLanguage = 'javascript';

  // Current state
  currentChallenge: Challenge | null = null;
  userCode = '';
  isRunning = false;
  lastRoast: RoastResult | null = null;

  // Monaco configuration
  private monacoLanguageMap: Record<string, string> = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    csharp: 'csharp',
    cpp: 'cpp',
  };

  public currentTheme = 'vs-dark';

  constructor(
    public sideBarService: Sidebar,
    private codeRoastService: CodeRoastService
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  ngAfterViewInit(): void {
    // Monaco will be loaded when challenge is selected
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  getUserData(): void {
    this.userData = JSON.parse(localStorage.getItem('userData') ?? 'null');

    if (this.userData?.user?.stack) {
      // Store the original for backend
      this.originalStack = this.userData.user.stack; // "Python"

      // Convert for Monaco Editor
      this.selectedLanguage = this.userData.user.stack.toLowerCase(); // "python"

      console.log('Original stack for backend:', this.originalStack);
      console.log('Monaco language:', this.selectedLanguage);
    }
  }

  selectDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.selectedDifficulty = difficulty;
  }

  canGenerateChallenge(): boolean {
    return !!(
      this.selectedDifficulty &&
      this.selectedLanguage &&
      this.userData
    );
  }

  getNewChallenge(): void {
    if (!this.selectedDifficulty || !this.selectedLanguage) return;

    const taskData: TaskData = {
      language: this.originalStack,
      difficulty: this.selectedDifficulty,
    };

    this.codeRoastService.getTask(taskData).subscribe({
      next: (challenge: Challenge) => {
        this.currentChallenge = challenge;
        this.lastRoast = null;

        // Initialize Monaco after challenge is loaded
        setTimeout(() => {
          this.loadMonacoEditor();
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching challenge:', error);
      },
    });
  }

  private async loadMonacoEditor(): Promise<void> {
    if (this.isMonacoLoaded && this.editor) return;

    try {
      if (typeof monaco !== 'undefined') {
        this.initializeEditor();
        return;
      }

      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';

      script.onload = () => {
        (window as any).require.config({
          paths: {
            vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
          },
        });

        (window as any).require(['vs/editor/editor.main'], () => {
          this.initializeEditor();
        });
      };

      script.onerror = (error) => {
        console.error('Failed to load Monaco Editor:', error);
        this.isMonacoLoaded = false;
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Monaco Editor:', error);
      this.isMonacoLoaded = false;
    }
  }

  private initializeEditor(): void {
    if (!this.monacoEditorRef?.nativeElement || typeof monaco === 'undefined') {
      return;
    }

    try {
      const editorOptions = {
        value: this.getStarterCode(),
        language: this.monacoLanguageMap[this.selectedLanguage] || 'javascript',
        theme: this.currentTheme,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: '"Fira Code", "Consolas", "Courier New", monospace',
        lineNumbers: 'on',
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      };

      this.editor = monaco.editor.create(
        this.monacoEditorRef.nativeElement,
        editorOptions
      );
      this.userCode = this.getStarterCode();
      this.editor.onDidChangeModelContent(() => {
        this.userCode = this.editor.getValue();
      });

      // Keyboard shortcuts
      this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
        this.runCode()
      );

      this.editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
        () => this.submitForRoast()
      );

      this.isMonacoLoaded = true;
    } catch (error) {
      console.error('Error initializing Monaco Editor:', error);
      this.isMonacoLoaded = false;
    }
  }

  private updateEditorLanguage(): void {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (model) {
      const monacoLang =
        this.monacoLanguageMap[this.selectedLanguage.toLowerCase()] ||
        'javascript';
      console.log('Setting Monaco language to:', monacoLang);
      monaco.editor.setModelLanguage(model, monacoLang);
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
    this.currentTheme = theme;
    if (this.editor) {
      monaco.editor.setTheme(theme);
    }
  }

  private getStarterCode(): string {
    const templates: Record<string, string> = {
      javascript: `function solution(nums, target) {
    // Write your solution here
    
}

// Test your solution:
// console.log(solution([2,7,11,15], 9));`,

      python: `def solution(nums, target):
    """
    Write your solution here
    """
    pass

# Test your solution:
# print(solution([2,7,11,15], 9))`,

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

    // TODO: Implement actual code execution via backend service
    setTimeout(() => {
      this.isRunning = false;
      console.log('Code executed successfully!');
    }, 2000);
  }

  submitForRoast(): void {
    if (!this.userCode.trim()) return;

    if (this.editor) {
      this.userCode = this.editor.getValue();
    }
    this.codeRoastService.submitCode(this.userCode).subscribe({
      next: (response) => {
        this.lastRoast = {
          score: response.rating,
          scoreClass:
            response.rating >= 7
              ? 'good'
              : response.rating >= 4
              ? 'neutral'
              : 'bad',
          emoji:
            response.rating >= 7 ? '🎉' : response.score >= 4 ? '😐' : '💀',
          type:
            response.rating >= 7
              ? 'good'
              : response.rating >= 4
              ? 'neutral'
              : 'bad',
          message: response.message,
        };
        console.log(response);
      },
      error: (err) => {
        console.log('error: ', err);
      },
    });
  }

  formatCode(): void {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument').run();
    }
  }
}
