import { registerUser, loginUser } from '../services/auth.js';
import { showToast } from '../components/Toast.js';

export function renderLogin(onSuccess) {
  const el = document.getElementById('auth-screen');
  el.innerHTML = `
    <div class="auth-container">
      <div class="auth-bg-glow primary"></div>
      <div class="auth-bg-glow accent"></div>
      <div class="auth-card card-glass scale-in">
        <div class="auth-brand">
          <div class="auth-brand-logo" style="font-size:var(--fs-lg);">TC</div>
          <div class="auth-brand-name">TCC Company: Finance</div>
          <div class="auth-brand-tagline">Suas finanças no controle</div>
        </div>

        <!-- Login Form -->
        <div id="login-form">
          <form class="auth-form" id="login-form-el">
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" class="form-input" id="login-email" placeholder="seu@email.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input type="password" class="form-input" id="login-password" placeholder="••••••••" required />
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%;margin-top:var(--space-sm);">
              <i data-lucide="log-in" style="width:18px;height:18px;"></i>
              Entrar
            </button>
          </form>
          <div class="auth-footer">
            Não tem conta? <a id="show-register">Criar conta</a>
          </div>
        </div>

        <!-- Register Form -->
        <div id="register-form" class="hidden">
          <form class="auth-form" id="register-form-el">
            <div class="form-group">
              <label class="form-label">Nome completo</label>
              <input type="text" class="form-input" id="reg-name" placeholder="Seu nome" required />
            </div>
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" class="form-input" id="reg-email" placeholder="seu@email.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
              <input type="password" class="form-input" id="reg-password" placeholder="Mínimo 6 caracteres" required minlength="6" />
            </div>
            <div class="form-group">
              <label class="form-label">Confirmar senha</label>
              <input type="password" class="form-input" id="reg-confirm" placeholder="Repita a senha" required />
            </div>
            <button type="submit" class="btn btn-accent btn-lg" style="width:100%;margin-top:var(--space-sm);">
              <i data-lucide="user-plus" style="width:18px;height:18px;"></i>
              Criar conta
            </button>
          </form>
          <div class="auth-footer">
            Já tem conta? <a id="show-login">Fazer login</a>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Toggle forms
  el.querySelector('#show-register').addEventListener('click', () => {
    el.querySelector('#login-form').classList.add('hidden');
    el.querySelector('#register-form').classList.remove('hidden');
  });
  el.querySelector('#show-login').addEventListener('click', () => {
    el.querySelector('#register-form').classList.add('hidden');
    el.querySelector('#login-form').classList.remove('hidden');
  });

  // Login submit
  el.querySelector('#login-form-el').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const session = await loginUser(
        document.getElementById('login-email').value,
        document.getElementById('login-password').value
      );
      showToast(`Bem-vindo de volta, ${session.name}!`, 'success');
      onSuccess(session);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Register submit
  el.querySelector('#register-form-el').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (pw !== confirm) { showToast('As senhas não coincidem.', 'error'); return; }
    try {
      const session = await registerUser(
        document.getElementById('reg-name').value,
        document.getElementById('reg-email').value,
        pw
      );
      showToast(`Conta criada! Bem-vindo, ${session.name}!`, 'success');
      onSuccess(session);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}
