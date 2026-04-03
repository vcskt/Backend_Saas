import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { PoPageLoginModule } from '@po-ui/ng-templates';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, PoPageLoginModule],
  template: `
    <po-page-login
      [p-hide-remember-user]="true"
      p-background="https://po-ui.io/assets/images/bg-login.jpg"
      p-logo="https://po-ui.io/assets/images/thf-logo.svg"
      (p-login-submit)="login($event)">
    </po-page-login>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  login(formData: any) {
    this.authService.login({ email: formData.login, password: formData.password })
      .subscribe({
        next: () => this.router.navigate(['/admin']),
        error: (err) => alert('Login falhou. Verifique as credenciais.')
      });
  }
}
