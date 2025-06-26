import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';

interface PersonalityResult {
  emoji: string;
  type: string;
  description: string;
  celebrity: string;
  scoreClass: 'good' | 'bad' | 'neutral';
}

@Component({
  selector: 'app-who-you-code',
  imports: [CommonModule, FormsModule],
  templateUrl: './who-you-code.html',
  styleUrl: './who-you-code.scss',
})
export class WhoYouCode {
  // Form data
  repoInput = '';
  isAnalyzing = false;

  // Results
  currentResult: PersonalityResult | null = null;

  // Mock personalities
  private personalities: PersonalityResult[] = [
    {
      emoji: '🧙‍♂️',
      type: 'The Chaotic Debugger',
      description:
        "You write code like you're solving a mystery - lots of console.logs everywhere!",
      celebrity: 'Ryan Dahl (Node.js creator)',
      scoreClass: 'good',
    },
    {
      emoji: '🏗️',
      type: 'The Architect',
      description:
        'You build systems like digital cathedrals - beautiful and structured.',
      celebrity: 'John Carmack (id Software)',
      scoreClass: 'good',
    },
    {
      emoji: '⚡',
      type: 'The Speed Demon',
      description:
        'You code faster than light - efficiency is your middle name!',
      celebrity: 'Fabrice Bellard (QEMU)',
      scoreClass: 'neutral',
    },
    {
      emoji: '💀',
      type: 'The Code Zombie',
      description:
        'Your code works, but nobody knows how or why. It just... does.',
      celebrity: 'Unknown Developer',
      scoreClass: 'bad',
    },
  ];

  constructor(public sideBarService: Sidebar) {}

  analyzeRepo(): void {
    if (!this.repoInput.trim() || this.isAnalyzing) return;

    this.isAnalyzing = true;

    // Simulate analysis
    setTimeout(() => {
      const randomPersonality =
        this.personalities[
          Math.floor(Math.random() * this.personalities.length)
        ];

      this.currentResult = randomPersonality;
      this.isAnalyzing = false;
    }, 2000);
  }

  tryExample(repo: string): void {
    this.repoInput = repo;
    this.analyzeRepo();
  }

  shareResult(): void {
    if (!this.currentResult) return;

    const text = `I'm "${this.currentResult.type}" 🧬 What's your coding personality?`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  }
}
