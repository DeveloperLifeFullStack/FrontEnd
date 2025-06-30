import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../../../services/sidebar';
import { WhoYouCodeService } from '../../../../services/who-you-code-service';
import { ToastrService } from 'ngx-toastr';

interface PersonalityResult {
  type: string;
  strengths: string[];
  weaknesses: string[];
  match: string;
  image_url: string;
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
  githubToken = '';
  ownerName = '';
  repositoryName = '';
  isAnalyzing = false;

  // Validation
  validationErrors: ValidationError[] = [];
  showValidation = false;

  // Results
  currentResult: PersonalityResult | null = null;

  constructor(
    public sideBarService: Sidebar,
    private whoYouCodeService: WhoYouCodeService,
    private toastr: ToastrService
  ) {}

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
    const tokenRegex =
      /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}|gho_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36})$/;
    return tokenRegex.test(token);
  }

  private isValidGitHubUsername(username: string): boolean {
    const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
    return usernameRegex.test(username);
  }

  private isValidRepositoryName(repoName: string): boolean {
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

    this.isAnalyzing = true;

    this.whoYouCodeService
      .submitCode({
        owner: this.ownerName,
        repo: this.repositoryName,
        token: this.githubToken,
      })
      .subscribe({
        next: (response) => {
          this.currentResult = response;
          console.log(this.currentResult);
          this.isAnalyzing = false;
        },
        error: (err) => {
          console.log('Error: ', err);
          this.isAnalyzing = false;
          this.toastr.error(`${err.error.error}`, 'Error', {
            timeOut: 1500,
          });
        },
      });
  }

  tryExample(owner: string, repo: string): void {
    this.ownerName = owner;
    this.repositoryName = repo;
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
    this.githubToken = '';
    this.ownerName = '';
    this.repositoryName = '';
    this.validationErrors = [];
    this.showValidation = false;
  }
}
