import React from 'react';
import { Icon } from './Icons.js';
import { store } from '../store.js';

const e = React.createElement;

export const AuthModal = ({ onClose, onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = React.useState(initialMode); // 'login', 'signup', 'forgot'
  const [step, setStep] = React.useState(initialMode === 'signup' ? 'signup_details' : 'login_form');

  // Input states
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [collegeName, setCollegeName] = React.useState('R.V.R. & J.C. College of Engineering');
  const [rollNo, setRollNo] = React.useState('');
  
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  
  const [otpInput, setOtpInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Google Account Selector State
  const [showGooglePicker, setShowGooglePicker] = React.useState(false);
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customEmail, setCustomEmail] = React.useState('');

  // Switch modes cleanly
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setOtpInput('');
    setPassword('');
    setConfirmPassword('');
    setShowGooglePicker(false);
    setShowCustomInput(false);
    if (newMode === 'login') setStep('login_form');
    else if (newMode === 'signup') setStep('signup_details');
    else if (newMode === 'forgot') setStep('forgot_email');
  };

  // Back Arrow handler
  const handleBackClick = () => {
    setError('');
    if (showGooglePicker) {
      setShowGooglePicker(false);
      setShowCustomInput(false);
      return;
    }
    if (step === 'signup_otp') setStep('signup_details');
    else if (step === 'signup_password') setStep('signup_otp');
    else if (step === 'signup_details') switchMode('login');
    else if (step === 'forgot_otp') setStep('forgot_email');
    else if (step === 'forgot_password') setStep('forgot_otp');
    else if (step === 'forgot_email') switchMode('login');
    else switchMode('login');
  };

  // --- SIGNUP STEP 1: Request OTP ---
  const handleSignupSendOtp = async (evt) => {
    evt.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your full name.');
    if (!email || !email.includes('@') || !email.includes('.')) return setError('Please enter a valid email address.');
    if (!collegeName.trim()) return setError('Please enter your college name.');
    if (!rollNo.trim()) return setError('Please enter your Roll No / Reg No.');

    setLoading(true);
    const res = await store.sendEmailOtp(email);
    setLoading(false);

    if (res && res.success) {
      setStep('signup_otp');
    } else {
      setError(res?.error || 'Failed to send OTP. Please check your email.');
    }
  };

  // --- SIGNUP STEP 2: Verify OTP ---
  const handleSignupVerifyOtp = async (evt) => {
    evt.preventDefault();
    setError('');

    if (!otpInput || otpInput.trim().length < 6) return setError('Please enter the 6-digit OTP code sent to your email.');

    setLoading(true);
    const res = await store.verifyEmailOtp(email, otpInput);
    setLoading(false);

    if (res && res.success) {
      setStep('signup_password');
    } else {
      setError(res?.error || 'Invalid 6-digit OTP code. Please check your email inbox.');
    }
  };

  // --- SIGNUP STEP 3: Complete Password Setup ---
  const handleSignupComplete = async (evt) => {
    evt.preventDefault();
    setError('');

    if (password.length < 4) return setError('Password must be at least 4 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match. Please re-enter.');

    setLoading(true);
    const res = await store.signup(name, email, password, collegeName, rollNo);
    setLoading(false);

    if (res && res.success) {
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setError(res?.error || 'Registration failed.');
    }
  };

  // --- LOGIN: Direct Email + Password ---
  const handleLogin = async (evt) => {
    evt.preventDefault();
    setError('');

    if (!email || !email.includes('@')) return setError('Please enter a valid email address.');
    if (!password) return setError('Please enter your password.');

    setLoading(true);
    const res = await store.login(email, password);
    setLoading(false);

    if (res && res.success) {
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setError(res?.error || 'Invalid email or password.');
    }
  };

  // --- FORGOT PASSWORD STEP 1: Request Reset OTP ---
  const handleForgotSendOtp = async (evt) => {
    evt.preventDefault();
    setError('');

    if (!email || !email.includes('@')) return setError('Please enter your registered email address.');

    setLoading(true);
    const res = await store.sendEmailOtp(email);
    setLoading(false);

    if (res && res.success) {
      setStep('forgot_otp');
    } else {
      setError(res?.error || 'Failed to send OTP.');
    }
  };

  // --- FORGOT PASSWORD STEP 2: Verify Reset OTP ---
  const handleForgotVerifyOtp = async (evt) => {
    evt.preventDefault();
    setError('');

    if (!otpInput || otpInput.trim().length < 6) return setError('Please enter the 6-digit OTP code.');

    setLoading(true);
    const res = await store.verifyEmailOtp(email, otpInput);
    setLoading(false);

    if (res && res.success) {
      setStep('forgot_password');
    } else {
      setError(res?.error || 'Invalid 6-digit OTP code.');
    }
  };

  // --- FORGOT PASSWORD STEP 3: Complete Password Reset ---
  const handleForgotComplete = async (evt) => {
    evt.preventDefault();
    setError('');

    if (password.length < 4) return setError('Password must be at least 4 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const res = await store.resetPassword(email, password);
    if (res && res.success) {
      const loginRes = await store.login(email, password);
      setLoading(false);
      if (loginRes && loginRes.success) {
        if (onSuccess) onSuccess(loginRes.user);
        onClose();
      }
    } else {
      setLoading(false);
      setError(res?.error || 'Failed to update password.');
    }
  };

  const handleOpenGooglePicker = () => {
    setError('');
    setShowGooglePicker(true);
  };

  const handleSelectGoogleAccount = async (selectedEmail, selectedName) => {
    setLoading(true);
    setError('');
    const res = await store.loginWithGoogle(selectedEmail, selectedName);
    setLoading(false);
    if (res && res.success) {
      if (res.user && onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setError(res?.error || 'Google Sign-In failed. Please try again.');
    }
  };

  return e('div', { className: "fixed inset-0 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" },
    e('div', { className: "bg-[#FFFDF8] border border-[#E2DDD3] rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden" },
      
      e('div', { className: "absolute top-0 left-0 right-0 h-2 bg-[#102A27]" }),

      /* Back Arrow Button (Top Left) */
      (mode !== 'login' || step !== 'login_form' || showGooglePicker) && e('button', {
        onClick: handleBackClick,
        className: "absolute top-4 left-4 p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center justify-center",
        title: "Go back"
      }, e(Icon, { name: "ChevronLeft", className: "w-5 h-5" })),

      e('button', {
        onClick: onClose,
        className: "absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
      }, e(Icon, { name: "X", className: "w-5 h-5" })),

      /* ------------------------------------------------------------- */
      /* GOOGLE ACCOUNT SELECTOR SCREEN                                */
      /* ------------------------------------------------------------- */
      showGooglePicker ? e('div', { className: "space-y-4 pt-2 animate-in fade-in" },
        e('div', { className: "text-center pb-3 border-b border-stone-200" },
          e('svg', { className: "w-8 h-8 mx-auto mb-2", viewBox: "0 0 24 24" },
            e('path', { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
            e('path', { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
            e('path', { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" }),
            e('path', { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" })
          ),
          e('h4', { className: "font-display font-extrabold text-xl text-stone-900" }, 'Choose a Google Account'),
          e('p', { className: "text-xs text-stone-500 mt-0.5" }, 'to sign in & continue to Student Shop')
        ),

        error && e('div', { className: "bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 mb-2" },
          e(Icon, { name: "AlertCircle", className: "w-4 h-4 shrink-0 text-rose-500" }),
          e('span', null, error)
        ),

        loading ? e('div', { className: "py-8 text-center space-y-3" },
          e('div', { className: "w-8 h-8 border-3 border-[#102A27] border-t-transparent rounded-full animate-spin mx-auto" }),
          e('p', { className: "text-xs font-semibold text-[#102A27]" }, 'Connecting to Google Account...')
        ) : e('div', { className: "space-y-2.5" },
          
          /* Saved Account 1 */
          e('button', {
            type: "button",
            onClick: () => handleSelectGoogleAccount('pulianil72@gmail.com', 'Anil Puli'),
            className: "w-full text-left p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/60 transition-all flex items-center gap-3 group shadow-xs"
          },
            e('div', { className: "w-9 h-9 rounded-full bg-[#102A27] text-amber-300 font-bold flex items-center justify-center text-sm shadow-xs" }, 'AP'),
            e('div', { className: "flex-1 min-w-0" },
              e('div', { className: "font-bold text-xs text-stone-900 group-hover:text-emerald-950" }, 'Anil Puli'),
              e('div', { className: "text-[11px] text-stone-500 truncate" }, 'pulianil72@gmail.com')
            ),
            e(Icon, { name: "ChevronRight", className: "w-4 h-4 text-stone-400 group-hover:text-emerald-600" })
          ),

          /* Saved Account 2 */
          e('button', {
            type: "button",
            onClick: () => handleSelectGoogleAccount('anil.rvrjc@gmail.com', 'Anil Student'),
            className: "w-full text-left p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/60 transition-all flex items-center gap-3 group shadow-xs"
          },
            e('div', { className: "w-9 h-9 rounded-full bg-[#3D7A6E] text-white font-bold flex items-center justify-center text-sm shadow-xs" }, 'AS'),
            e('div', { className: "flex-1 min-w-0" },
              e('div', { className: "font-bold text-xs text-stone-900 group-hover:text-emerald-950" }, 'Anil Student (RVR & JC)'),
              e('div', { className: "text-[11px] text-stone-500 truncate" }, 'anil.rvrjc@gmail.com')
            ),
            e(Icon, { name: "ChevronRight", className: "w-4 h-4 text-stone-400 group-hover:text-emerald-600" })
          ),

          /* Option 3: Custom Google Account */
          !showCustomInput ? e('button', {
            type: "button",
            onClick: () => setShowCustomInput(true),
            className: "w-full text-left p-3 rounded-xl border border-dashed border-stone-300 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all flex items-center gap-3 text-stone-700 font-semibold text-xs bg-stone-50/50"
          },
            e(Icon, { name: "Plus", className: "w-4 h-4 text-stone-500" }),
            e('span', null, 'Use another Google account')
          ) : e('form', {
            onSubmit: (evt) => {
              evt.preventDefault();
              if (customEmail && customEmail.includes('@')) {
                handleSelectGoogleAccount(customEmail, customEmail.split('@')[0]);
              }
            },
            className: "p-3 rounded-xl border border-emerald-500 bg-emerald-50/30 space-y-2.5 animate-in fade-in"
          },
            e('label', { className: "block text-xs font-semibold text-stone-700" }, 'Enter your Google Email Address'),
            e('input', {
              type: "email",
              required: true,
              autoFocus: true,
              value: customEmail,
              onChange: (evt) => setCustomEmail(evt.target.value),
              placeholder: "e.g. yourname@gmail.com",
              className: "w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            }),
            e('button', {
              type: "submit",
              className: "w-full bg-[#102A27] hover:bg-[#1C3E3A] text-amber-300 font-bold py-2 rounded-lg text-xs shadow-xs transition-all"
            }, 'Sign In with Selected Google Account')
          )
        ),

        e('p', { className: "text-[10px] text-stone-400 text-center leading-relaxed pt-2" },
          'To continue, Google will share your name, email address, language preference, and profile picture with Student Shop.'
        )
      ) : e(React.Fragment, null,

        /* Title Header */
        e('div', { className: "text-center mt-2 mb-6" },
          e('div', { className: "w-12 h-12 rounded-xl bg-[#102A27] text-amber-300 font-display font-black text-2xl flex items-center justify-center mx-auto mb-2 shadow-inner" }, 'SS'),
          e('h3', { className: "font-display font-extrabold text-2xl text-[#102A27]" },
            mode === 'login' && 'Welcome Back',
            mode === 'signup' && (step === 'signup_password' ? 'Set Up Your Password' : 'Create Student Account'),
            mode === 'forgot' && 'Reset Password'
          ),
          e('p', { className: "text-xs text-[#5C6B68] mt-1" },
            mode === 'login' && 'Enter your email & password to log in',
            mode === 'signup' && (
              step === 'signup_details' ? 'Enter student details to receive email OTP' :
              step === 'signup_otp' ? `Enter 6-digit OTP code sent to ${email}` :
              'Create a password for returning logins'
            ),
            mode === 'forgot' && (
              step === 'forgot_email' ? 'Enter email to receive reset OTP' :
              step === 'forgot_otp' ? `Enter 6-digit OTP code sent to ${email}` :
              'Enter your new password'
            )
          )
        ),

        error && e('div', { className: "bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 mb-4 animate-in fade-in" },
          e(Icon, { name: "AlertCircle", className: "w-4 h-4 shrink-0 text-rose-500" }),
          e('span', null, error)
        ),

        /* MODE 1: LOG IN */
        mode === 'login' && e(React.Fragment, null,
          e('button', {
            type: "button",
            onClick: handleOpenGooglePicker,
            className: "w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors mb-4"
          },
            e('svg', { className: "w-4 h-4", viewBox: "0 0 24 24" },
              e('path', { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
              e('path', { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
              e('path', { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" }),
              e('path', { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" })
            ),
            e('span', null, 'Continue with Google')
          ),

          e('div', { className: "relative my-4 text-center" },
            e('div', { className: "absolute inset-0 flex items-center" }, e('div', { className: "w-full border-t border-stone-200" })),
            e('span', { className: "relative bg-[#FFFDF8] px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider" }, 'or email & password')
          ),

          e('form', { onSubmit: handleLogin, className: "space-y-3" },
            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Email Address'),
              e('input', {
                type: "email",
                required: true,
                value: email,
                onChange: (evt) => setEmail(evt.target.value),
                placeholder: "e.g. rahul@gmail.com or student@college.edu.in",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('div', null,
              e('div', { className: "flex items-center justify-between mb-1" },
                e('label', { className: "block text-xs font-semibold text-stone-700" }, 'Password'),
                e('button', {
                  type: "button",
                  onClick: () => switchMode('forgot'),
                  className: "text-[11px] font-bold text-[#3D7A6E] hover:underline"
                }, 'Forgot Password?')
              ),
              e('input', {
                type: "password",
                required: true,
                value: password,
                onChange: (evt) => setPassword(evt.target.value),
                placeholder: "••••••••",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading,
              className: "w-full bg-[#102A27] hover:bg-[#1A3F3B] text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Signing in...'))
                : e('span', null, 'Log In to Student Shop')
            )
          ),

          e('div', { className: "text-center mt-4 text-xs text-[#5C6B68]" },
            "Don't have an account? ",
            e('button', {
              onClick: () => switchMode('signup'),
              className: "font-bold text-[#3D7A6E] hover:underline"
            }, 'Sign up')
          )
        ),

        /* MODE 2: SIGN UP */
        mode === 'signup' && e(React.Fragment, null,
          step === 'signup_details' && e('form', { onSubmit: handleSignupSendOtp, className: "space-y-3" },
            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Full Name'),
              e('input', {
                type: "text",
                required: true,
                value: name,
                onChange: (evt) => setName(evt.target.value),
                placeholder: "e.g. Rahul Sharma",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Email Address'),
              e('input', {
                type: "email",
                required: true,
                value: email,
                onChange: (evt) => setEmail(evt.target.value),
                placeholder: "e.g. rahul@gmail.com or student@college.edu.in",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Your College Name'),
              e('input', {
                type: "text",
                required: true,
                value: collegeName,
                onChange: (evt) => setCollegeName(evt.target.value),
                placeholder: "e.g. Riverside Institute of Technology / REC",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Enter Roll No / Reg No.'),
              e('input', {
                type: "text",
                required: true,
                value: rollNo,
                onChange: (evt) => setRollNo(evt.target.value),
                placeholder: "e.g. 211421104085 / 2021-CSE-042",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading,
              className: "w-full bg-[#102A27] hover:bg-[#1A3F3B] text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Sending Email OTP...'))
                : e('span', null, 'Send 6-Digit Verification OTP')
            ),

            e('div', { className: "text-center mt-4 text-xs text-[#5C6B68]" },
              "Already have an account? ",
              e('button', {
                onClick: () => switchMode('login'),
                className: "font-bold text-[#3D7A6E] hover:underline"
              }, 'Log in')
            )
          ),

          step === 'signup_otp' && e('form', { onSubmit: handleSignupVerifyOtp, className: "space-y-4 animate-in fade-in" },
            e('div', { className: "bg-[#102A27]/5 border border-[#3D7A6E]/30 p-3.5 rounded-xl text-center space-y-1" },
              e('div', { className: "text-xs font-bold text-[#102A27] flex items-center justify-center gap-1.5" },
                e(Icon, { name: "Mail", className: "w-4 h-4 text-[#3D7A6E]" }),
                '6-Digit OTP Sent to Email Inbox'
              ),
              e('div', { className: "text-[11px] text-stone-600" },
                `Please check your inbox or spam folder for `, e('strong', { className: "text-stone-900" }, email)
              ),
              e('div', { className: "text-[10px] text-stone-400" }, 'OTP valid for 5 minutes. Enter the 6-digit code below.')
            ),

            e('div', { className: "space-y-1" },
              e('label', { className: "block text-xs font-semibold text-stone-700 text-center uppercase tracking-wider" }, 'Enter 6-Digit OTP Code'),
              e('input', {
                type: "text",
                maxLength: 6,
                required: true,
                autoFocus: true,
                value: otpInput,
                onChange: (evt) => setOtpInput(evt.target.value),
                placeholder: "123456",
                className: "w-full bg-white border-2 border-[#3D7A6E] rounded-xl px-3 py-3 text-center text-xl font-mono tracking-widest font-bold focus:ring-2 focus:ring-[#102A27] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading || otpInput.length < 6,
              className: "w-full bg-[#102A27] hover:bg-[#1A3F3B] text-amber-300 font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Verifying OTP...'))
                : e('span', null, 'Verify OTP & Set Up Password →')
            ),

            e('div', { className: "text-center pt-2 border-t border-stone-200 flex items-center justify-between text-xs" },
              e('button', {
                type: "button",
                onClick: () => setStep('signup_details'),
                className: "text-stone-500 hover:text-stone-800 font-semibold"
              }, '← Edit Details'),

              e('button', {
                type: "button",
                onClick: async () => {
                  const res = await store.sendEmailOtp(email);
                  if (res && res.success) setError('');
                },
                className: "text-[#3D7A6E] font-bold hover:underline"
              }, 'Resend OTP Code')
            )
          ),

          step === 'signup_password' && e('form', { onSubmit: handleSignupComplete, className: "space-y-3 animate-in fade-in" },
            e('div', { className: "bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center text-xs text-emerald-900 font-semibold" },
              '🎉 Email Verified! Now set up a password for returning logins.'
            ),

            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Create Password'),
              e('input', {
                type: "password",
                required: true,
                autoFocus: true,
                value: password,
                onChange: (evt) => setPassword(evt.target.value),
                placeholder: "•••••••• (min 4 characters)",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Confirm Password'),
              e('input', {
                type: "password",
                required: true,
                value: confirmPassword,
                onChange: (evt) => setConfirmPassword(evt.target.value),
                placeholder: "Re-enter your password",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading || !password || password !== confirmPassword,
              className: "w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Saving Account...'))
                : e('span', null, 'Complete Registration & Sign In')
            )
          )
        ),

        /* MODE 3: FORGOT PASSWORD */
        mode === 'forgot' && e(React.Fragment, null,
          step === 'forgot_email' && e('form', { onSubmit: handleForgotSendOtp, className: "space-y-3" },
            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Registered Email Address'),
              e('input', {
                type: "email",
                required: true,
                value: email,
                onChange: (evt) => setEmail(evt.target.value),
                placeholder: "e.g. rahul@gmail.com",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading,
              className: "w-full bg-[#102A27] hover:bg-[#1A3F3B] text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Sending Reset OTP...'))
                : e('span', null, 'Send Password Reset OTP')
            ),

            e('div', { className: "text-center mt-4 text-xs" },
              e('button', {
                type: "button",
                onClick: () => switchMode('login'),
                className: "text-stone-500 hover:text-stone-800 font-semibold"
              }, '← Back to Login')
            )
          ),

          step === 'forgot_otp' && e('form', { onSubmit: handleForgotVerifyOtp, className: "space-y-4 animate-in fade-in" },
            e('div', { className: "bg-[#102A27]/5 border border-[#3D7A6E]/30 p-3.5 rounded-xl text-center space-y-1" },
              e('div', { className: "text-xs font-bold text-[#102A27] flex items-center justify-center gap-1.5" },
                e(Icon, { name: "Mail", className: "w-4 h-4 text-[#3D7A6E]" }),
                'Password Reset OTP Sent'
              ),
              e('div', { className: "text-[11px] text-stone-600" },
                `Check email inbox for `, e('strong', { className: "text-stone-900" }, email)
              )
            ),

            e('div', { className: "space-y-1" },
              e('label', { className: "block text-xs font-semibold text-stone-700 text-center uppercase tracking-wider" }, 'Enter 6-Digit OTP Code'),
              e('input', {
                type: "text",
                maxLength: 6,
                required: true,
                autoFocus: true,
                value: otpInput,
                onChange: (evt) => setOtpInput(evt.target.value),
                placeholder: "123456",
                className: "w-full bg-white border-2 border-[#3D7A6E] rounded-xl px-3 py-3 text-center text-xl font-mono tracking-widest font-bold focus:ring-2 focus:ring-[#102A27] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading || otpInput.length < 6,
              className: "w-full bg-[#102A27] hover:bg-[#1A3F3B] text-amber-300 font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Verifying OTP...'))
                : e('span', null, 'Verify OTP & Reset Password')
            )
          ),

          step === 'forgot_password' && e('form', { onSubmit: handleForgotComplete, className: "space-y-3 animate-in fade-in" },
            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Enter New Password'),
              e('input', {
                type: "password",
                required: true,
                autoFocus: true,
                value: password,
                onChange: (evt) => setPassword(evt.target.value),
                placeholder: "•••••••• (min 4 characters)",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('div', null,
              e('label', { className: "block text-xs font-semibold text-stone-700 mb-1" }, 'Confirm New Password'),
              e('input', {
                type: "password",
                required: true,
                value: confirmPassword,
                onChange: (evt) => setConfirmPassword(evt.target.value),
                placeholder: "Re-enter new password",
                className: "w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#3D7A6E] focus:outline-none"
              })
            ),

            e('button', {
              type: "submit",
              disabled: loading || !password || password !== confirmPassword,
              className: "w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            },
              loading 
                ? e(React.Fragment, null, e('div', { className: "w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" }), e('span', null, 'Updating Password...'))
                : e('span', null, 'Update Password & Sign In')
            )
          )
        )
      )
    )
  );
};
