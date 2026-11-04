"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TermsModal from '@/components/legal/TermsModal';

// Đổi cho khớp backend của bạn. Hai endpoint dự kiến: POST /auth/login và POST /auth/register
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api';

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

const INPUT_BASE =
  'mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border bg-[var(--color-bg-secondary)] px-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 disabled:opacity-60';
const INPUT_OK =
  'border-[var(--color-border-separator)] focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]/20';
const INPUT_ERR =
  'border-[var(--color-system-error)] focus:border-[var(--color-system-error)] focus:ring-[var(--color-system-error)]/20';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(0|\+84)\d{9}$/;

const INITIAL_LOGIN = { email: '', password: '', remember: true };
const INITIAL_REGISTER = { fullName: '', email: '', phone: '', password: '', confirm: '', agree: false };

// ---------- Kiểm tra dữ liệu ----------
function validateLogin(v) {
  const e = {};
  if (!v.email.trim()) e.email = 'Vui lòng nhập email.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Email chưa đúng định dạng.';
  if (!v.password) e.password = 'Vui lòng nhập mật khẩu.';
  return e;
}

function validateRegister(v) {
  const e = {};
  if (!v.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên.';
  if (!v.email.trim()) e.email = 'Vui lòng nhập email.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Email chưa đúng định dạng.';
  if (!v.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại.';
  else if (!PHONE_RE.test(v.phone.trim())) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0 hoặc +84.';
  if (!v.password) e.password = 'Vui lòng nhập mật khẩu.';
  else if (v.password.length < 8) e.password = 'Mật khẩu cần ít nhất 8 ký tự.';
  if (!v.confirm) e.confirm = 'Vui lòng nhập lại mật khẩu.';
  else if (v.confirm !== v.password) e.confirm = 'Mật khẩu nhập lại chưa khớp.';
  if (!v.agree) e.agree = 'Bạn cần đồng ý với điều khoản để tiếp tục.';
  return e;
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

const STRENGTH_LABEL = ['Quá yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
const STRENGTH_COLOR = [
  'bg-[var(--color-system-error)]',
  'bg-[var(--color-system-error)]',
  'bg-[var(--color-system-warning)]',
  'bg-[var(--color-system-success)]',
  'bg-[var(--color-system-success)]',
];

// ---------- Gọi API ----------
async function postJson(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Không kết nối được máy chủ. Vui lòng thử lại sau.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
  return data;
}

// ---------- Trang ----------
export default function AuthPage() {
  const router = useRouter();

  const [tab, setTab] = useState('login'); // login | register
  const [login, setLogin] = useState(INITIAL_LOGIN);
  const [register, setRegister] = useState(INITIAL_REGISTER);
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginBanner, setLoginBanner] = useState({ tone: 'error', message: '' });
  const [registerBanner, setRegisterBanner] = useState({ tone: 'error', message: '' });
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const isLogin = tab === 'login';

  function switchTab(next) {
    if (next === tab || loading) return;
    setTab(next);
  }

  function updateLogin(name, value) {
    setLogin((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    setLoginBanner((prev) => (prev.message ? { ...prev, message: '' } : prev));
  }

  function updateRegister(name, value) {
    setRegister((prev) => ({ ...prev, [name]: value }));
    setRegisterErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    setRegisterBanner((prev) => (prev.message ? { ...prev, message: '' } : prev));
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (loading) return;

    const errors = validateLogin(login);
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setLoginBanner({ tone: 'error', message: '' });
    try {
      await postJson('/auth/login', {
        email: login.email.trim(),
        password: login.password,
        rememberMe: login.remember,
      });
      router.push('/');
    } catch (err) {
      setLoginBanner({ tone: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    if (loading) return;

    const errors = validateRegister(register);
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setRegisterBanner({ tone: 'error', message: '' });
    try {
      await postJson('/auth/register', {
        fullName: register.fullName.trim(),
        email: register.email.trim(),
        phone: register.phone.trim(),
        password: register.password,
      });
      // Đăng ký xong: chuyển sang tab đăng nhập, điền sẵn email
      setLogin({ ...INITIAL_LOGIN, email: register.email.trim() });
      setLoginErrors({});
      setLoginBanner({ tone: 'success', message: 'Đăng ký thành công. Hãy đăng nhập để tiếp tục.' });
      setRegister(INITIAL_REGISTER);
      setRegisterErrors({});
      setTab('login');
    } catch (err) {
      setRegisterBanner({ tone: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-200">
      <Header />

      <main className="animate-fade-in mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:py-14">
        <div className="relative">
          {/* Thanh chuyển floating: nổi phía trên thẻ, đè lên mép trên của thẻ */}
          <div
            role="tablist"
            aria-label="Đăng nhập hoặc đăng ký"
            className="sticky top-20 z-20 mx-auto -mb-5 grid w-full max-w-xs grid-cols-2 rounded-full border border-[var(--color-border-separator)] bg-[var(--color-bg-translucent-card)] p-1 backdrop-blur-xl"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-full bg-[var(--color-brand-fill)] shadow-[var(--shadow-low)] transition-transform duration-300 ${EASE} motion-reduce:transition-none ${
                isLogin ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <TabButton id="tab-login" controls="panel-login" active={isLogin} onClick={() => switchTab('login')}>
              Đăng nhập
            </TabButton>
            <TabButton id="tab-register" controls="panel-register" active={!isLogin} onClick={() => switchTab('register')}>
              Đăng ký
            </TabButton>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-separator)] bg-[var(--color-bg-tertiary)] px-5 pb-6 pt-12 shadow-[var(--shadow-medium)] sm:px-8 sm:pb-8">
            {/* Tiêu đề: mờ dần mỗi khi đổi tab */}
            <div key={tab} className="animate-fade-in text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
              </h1>
              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                {isLogin
                  ? 'Đăng nhập để đặt vé và xem lịch sử giao dịch.'
                  : 'Đăng ký để đặt vé nhanh hơn và tích điểm thành viên.'}
              </p>
            </div>

            <div className="mt-6">
              {/* Panel đăng nhập */}
              <Panel id="panel-login" labelledBy="tab-login" active={isLogin} side="left">
                <form onSubmit={handleLogin} noValidate>
                  <Banner tone={loginBanner.tone} message={loginBanner.message} />

                  <div className="space-y-4">
                    <Field id="login-email" label="Email" error={loginErrors.email}>
                      <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={login.email}
                        onChange={(e) => updateLogin('email', e.target.value)}
                        disabled={loading}
                        placeholder="example@gmail.com"
                        aria-invalid={Boolean(loginErrors.email)}
                        className={`${INPUT_BASE} ${loginErrors.email ? INPUT_ERR : INPUT_OK}`}
                      />
                    </Field>

                    <Field id="login-password" label="Mật khẩu" error={loginErrors.password}>
                      <PasswordInput
                        id="login-password"
                        autoComplete="current-password"
                        value={login.password}
                        onChange={(v) => updateLogin('password', v)}
                        disabled={loading}
                        placeholder="Nhập mật khẩu"
                        invalid={Boolean(loginErrors.password)}
                      />
                    </Field>

                    <div className="flex items-center justify-between gap-3">
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                        <input
                          type="checkbox"
                          checked={login.remember}
                          onChange={(e) => updateLogin('remember', e.target.checked)}
                          disabled={loading}
                          className="h-4 w-4 accent-[var(--color-brand-fill)]"
                        />
                        Ghi nhớ đăng nhập
                      </label>
                      <Link
                        href="/ho-tro"
                        title="Liên hệ hỗ trợ để khôi phục mật khẩu"
                        className="text-xs font-semibold text-[var(--color-brand-primary)] transition-opacity hover:opacity-80"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <SubmitButton loading={loading} idleLabel="Đăng nhập" loadingLabel="Đang đăng nhập..." />
                  </div>

                  <p className="mt-5 text-center text-xs text-[var(--color-text-secondary)]">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('register')}
                      className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </form>
              </Panel>

              {/* Panel đăng ký */}
              <Panel id="panel-register" labelledBy="tab-register" active={!isLogin} side="right">
                <form onSubmit={handleRegister} noValidate>
                  <Banner tone={registerBanner.tone} message={registerBanner.message} />

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="register-name" label="Họ và tên" error={registerErrors.fullName}>
                        <input
                          id="register-name"
                          type="text"
                          autoComplete="name"
                          maxLength={100}
                          value={register.fullName}
                          onChange={(e) => updateRegister('fullName', e.target.value)}
                          disabled={loading}
                          placeholder="Nguyễn Văn A"
                          aria-invalid={Boolean(registerErrors.fullName)}
                          className={`${INPUT_BASE} ${registerErrors.fullName ? INPUT_ERR : INPUT_OK}`}
                        />
                      </Field>

                      <Field id="register-phone" label="Số điện thoại" error={registerErrors.phone}>
                        <input
                          id="register-phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          maxLength={12}
                          value={register.phone}
                          onChange={(e) => updateRegister('phone', e.target.value)}
                          disabled={loading}
                          placeholder="0987654321"
                          aria-invalid={Boolean(registerErrors.phone)}
                          className={`${INPUT_BASE} ${registerErrors.phone ? INPUT_ERR : INPUT_OK}`}
                        />
                      </Field>
                    </div>

                    <Field id="register-email" label="Email" error={registerErrors.email}>
                      <input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        value={register.email}
                        onChange={(e) => updateRegister('email', e.target.value)}
                        disabled={loading}
                        placeholder="example@gmail.com"
                        aria-invalid={Boolean(registerErrors.email)}
                        className={`${INPUT_BASE} ${registerErrors.email ? INPUT_ERR : INPUT_OK}`}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="register-password" label="Mật khẩu" error={registerErrors.password}>
                        <PasswordInput
                          id="register-password"
                          autoComplete="new-password"
                          value={register.password}
                          onChange={(v) => updateRegister('password', v)}
                          disabled={loading}
                          placeholder="Ít nhất 8 ký tự"
                          invalid={Boolean(registerErrors.password)}
                        />
                      </Field>

                      <Field id="register-confirm" label="Nhập lại mật khẩu" error={registerErrors.confirm}>
                        <PasswordInput
                          id="register-confirm"
                          autoComplete="new-password"
                          value={register.confirm}
                          onChange={(v) => updateRegister('confirm', v)}
                          disabled={loading}
                          placeholder="Nhập lại mật khẩu"
                          invalid={Boolean(registerErrors.confirm)}
                        />
                      </Field>
                    </div>

                    <StrengthMeter password={register.password} />

                    <div>
                      <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                        <input
                          type="checkbox"
                          checked={register.agree}
                          onChange={(e) => updateRegister('agree', e.target.checked)}
                          disabled={loading}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand-fill)]"
                        />
                        <span>
                          Tôi đã đọc và đồng ý với{' '}
                          <button
                            type="button"
                            onClick={() => setTermsOpen(true)}
                            aria-haspopup="dialog"
                            className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                          >
                            Điều khoản & Quy định
                          </button>{' '}
                          của Seenema.
                        </span>
                      </label>
                      <FieldError id="register-agree-error" message={registerErrors.agree} />
                    </div>

                    <SubmitButton loading={loading} idleLabel="Tạo tài khoản" loadingLabel="Đang tạo tài khoản..." />
                  </div>

                  <p className="mt-5 text-center text-xs text-[var(--color-text-secondary)]">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('login')}
                      className="font-semibold text-[var(--color-brand-primary)] hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </p>
                </form>
              </Panel>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAgree={() => updateRegister('agree', true)}
      />
    </div>
  );
}

// ---------- Thành phần con ----------

function TabButton({ id, controls, active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`relative z-10 h-9 rounded-full text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] ${
        active
          ? 'text-[var(--color-brand-on-primary)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}

// Cả hai panel luôn nằm trong DOM: panel đang ẩn co chiều cao về 0, mờ đi và trượt sang một bên.
// Thẻ bên ngoài tự co giãn theo chiều cao panel đang hiện.
function Panel({ id, labelledBy, active, side, children }) {
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      className={`grid transition-[grid-template-rows,opacity,transform,visibility] duration-500 ${EASE} motion-reduce:transition-none ${
        active
          ? 'visible translate-x-0 grid-rows-[1fr] opacity-100'
          : `invisible grid-rows-[0fr] opacity-0 ${side === 'left' ? '-translate-x-4' : 'translate-x-4'}`
      }`}
    >
      <div className="-mx-1 overflow-hidden px-1">{children}</div>
    </div>
  );
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[var(--color-text-secondary)]">
        {label}
      </label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

// Thông báo lỗi dưới ô nhập: mở ra và thu lại mượt, giữ nội dung cũ trong lúc thu lại
function FieldError({ id, message }) {
  const last = useRef('');
  if (message) last.current = message;

  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        message ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <p id={id} role={message ? 'alert' : undefined} className="pt-1.5 text-xs text-[var(--color-system-error)]">
          {last.current}
        </p>
      </div>
    </div>
  );
}

function Banner({ tone, message }) {
  const last = useRef({ tone, message: '' });
  if (message) last.current = { tone, message };
  const shown = last.current;

  return (
    <div
      role={shown.tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        message ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <p
          className={`mb-4 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm ${
            shown.tone === 'success'
              ? 'bg-[var(--color-brand-primary-container)] text-[var(--color-brand-primary)]'
              : 'bg-[var(--color-system-error)]/10 text-[var(--color-system-error)]'
          }`}
        >
          {shown.message}
        </p>
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, invalid, ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={`${INPUT_BASE} pr-11 ${invalid ? INPUT_ERR : INPUT_OK}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        className="absolute bottom-0 right-1.5 flex h-11 w-9 items-center justify-center text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:text-[var(--color-brand-primary)]"
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}

// Thanh đánh giá độ mạnh mật khẩu: chỉ mở ra khi bắt đầu gõ, các đoạn đổi màu mượt
function StrengthMeter({ password }) {
  const score = getStrength(password);
  const hasValue = password.length > 0;

  return (
    <div
      aria-live="polite"
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        hasValue ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < score ? STRENGTH_COLOR[score] : 'bg-[var(--color-fill-tertiary)]'
                }`}
              />
            ))}
          </div>
          <span className="w-20 text-right text-xs text-[var(--color-text-secondary)]">
            {STRENGTH_LABEL[score]}
          </span>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, idleLabel, loadingLabel }) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand-fill)] text-sm font-semibold text-[var(--color-brand-on-primary)] transition-all duration-200 hover:bg-[var(--color-brand-fill-hover)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-tertiary)]"
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
        />
      )}
      <span>{loading ? loadingLabel : idleLabel}</span>
    </button>
  );
}

function EyeIcon({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}