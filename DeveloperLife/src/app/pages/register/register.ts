import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { RegistrationRequest } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  constructor(
    private router: Router,
    private auth: Auth,
    private toastr: ToastrService
  ) {}
  registerForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    stack: new FormControl('', [Validators.required]),
    experience: new FormControl('', [Validators.required]),
  });

  public stacks = [
    'C# / .NET',
    'Node.js',
    'Python',
    'Java',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Angular',
  ];
  public experiences = ['Junior', 'Middle', 'Senior'];

  showStackDropdown = false;
  showExperienceDropdown = false;

  get usernameControl() {
    return this.registerForm.get('username');
  }

  get stackControl() {
    return this.registerForm.get('stack');
  }

  get experienceControl() {
    return this.registerForm.get('experience');
  }

  selectStack(stack: string) {
    this.registerForm.get('stack')?.setValue(stack);
    this.showStackDropdown = false;
  }

  selectExperience(level: string) {
    this.registerForm.get('experience')?.setValue(level);
    this.showExperienceDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showStackDropdown = false;
      this.showExperienceDropdown = false;
    }
  }
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  onSubmit() {
    if (this.registerForm.valid) {
      const registerInfo = this.registerForm.value;

      const registerData = {
        username: registerInfo.username,
        firstName: registerInfo.name,
        lastName: registerInfo.surname,
        birthDate: registerInfo.dateOfBirth,
        stack: registerInfo.stack,
        experience: registerInfo.experience,
      };
      localStorage.setItem('experience', registerData.experience!);
      this.auth.register(registerData).subscribe({
        next: (response) => {
          console.log(response);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
          this.toastr.success(
            'Registration success',
            'Navigating to the log in page'
          );
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Registration failed', `${err.error}`);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
