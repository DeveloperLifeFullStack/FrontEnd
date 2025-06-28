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

interface ValidationError {
  field: string;
  message: string;
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
  githubToken = '';
  ownerName = '';
  repositoryName = '';
  isAnalyzing = false;

  // Validation
  validationErrors: ValidationError[] = [];
  showValidation = false;

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

  validateInputs(): boolean {
    this.validationErrors = [];

    // Validate GitHub Token
    if (!this.githubToken.trim()) {
      this.validationErrors.push({
        field: 'token',
        message: 'GitHub token is required',
      });
    } else if (!this.isValidGitHubToken(this.githubToken.trim())) {
      this.validationErrors.push({
        field: 'token',
        message: 'Invalid GitHub token format',
      });
    }

    // Validate Owner Name
    if (!this.ownerName.trim()) {
      this.validationErrors.push({
        field: 'owner',
        message: 'Owner name is required',
      });
    } else if (!this.isValidGitHubUsername(this.ownerName.trim())) {
      this.validationErrors.push({
        field: 'owner',
        message: 'Invalid GitHub username format',
      });
    }

    // Validate Repository Name
    if (!this.repositoryName.trim()) {
      this.validationErrors.push({
        field: 'repository',
        message: 'Repository name is required',
      });
    } else if (!this.isValidRepositoryName(this.repositoryName.trim())) {
      this.validationErrors.push({
        field: 'repository',
        message: 'Invalid repository name format',
      });
    }

    return this.validationErrors.length === 0;
  }

  private isValidGitHubToken(token: string): boolean {
    // GitHub tokens can be:
    // - Personal Access Tokens (classic): ghp_xxxx (40 chars total)
    // - Fine-grained tokens: github_pat_xxxx
    // - OAuth tokens: gho_xxxx
    // - Refresh tokens: ghr_xxxx
    const tokenRegex =
      /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}|gho_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36})$/;
    return tokenRegex.test(token);
  }

  private isValidGitHubUsername(username: string): boolean {
    // GitHub username rules:
    // - May only contain alphanumeric characters or hyphens
    // - Cannot have multiple consecutive hyphens
    // - Cannot begin or end with a hyphen
    // - Maximum is 39 characters
    const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    return usernameRegex.test(username);
  }

  private isValidRepositoryName(repoName: string): boolean {
    // Repository name rules:
    // - Can contain letters, numbers, hyphens, underscores, and periods
    // - Cannot start with a period or hyphen
    // - Cannot end with a period
    // - Maximum 100 characters
    const repoRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
    return repoRegex.test(repoName);
  }

  getFieldError(fieldName: string): string | null {
    const error = this.validationErrors.find((err) => err.field === fieldName);
    return error ? error.message : null;
  }

  hasFieldError(fieldName: string): boolean {
    return this.validationErrors.some((err) => err.field === fieldName);
  }

  get isFormValid(): boolean {
    return (
      this.githubToken.trim() !== '' &&
      this.ownerName.trim() !== '' &&
      this.repositoryName.trim() !== '' &&
      this.validationErrors.length === 0
    );
  }

  onInputChange(): void {
    if (this.showValidation) {
      this.validateInputs();
    }
  }

  analyzeRepo(): void {
    this.showValidation = true;

    if (!this.validateInputs() || this.isAnalyzing) {
      return;
    }

    // Combine inputs into original format for existing logic
    this.repoInput = `${this.ownerName.trim()}/${this.repositoryName.trim()}`;
    this.isAnalyzing = true;

    // Keep original simulation logic
    setTimeout(() => {
      const randomPersonality =
        this.personalities[
          Math.floor(Math.random() * this.personalities.length)
        ];

      this.currentResult = randomPersonality;
      this.isAnalyzing = false;
    }, 2000);
  }

  tryExample(owner: string, repo: string): void {
    this.ownerName = owner;
    this.repositoryName = repo;
    // Set a placeholder token for examples
    this.githubToken = 'ghp_1234567890abcdef1234567890abcdef12345678';
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

  resetForm(): void {
    this.currentResult = null;
    this.repoInput = '';
    this.githubToken = '';
    this.ownerName = '';
    this.repositoryName = '';
    this.validationErrors = [];
    this.showValidation = false;
  }
}
