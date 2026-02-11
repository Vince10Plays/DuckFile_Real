
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebaseService';
import { DuckLogo } from '../constants';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationEmailSentTo, setVerificationEmailSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send verification email
        await sendEmailVerification(user);
        
        // Sign out immediately so they are not auto-logged in unverified
        await signOut(auth);
        
        setVerificationEmailSentTo(email);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          // Block access and show verification screen
          await signOut(auth);
          setVerificationEmailSentTo(email);
          return;
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('User already exists. Please sign in');
      } else if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('Email or password is incorrect');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Usually Google accounts are pre-verified, but we check to be safe
      if (!user.emailVerified) {
        await signOut(auth);
        setVerificationEmailSentTo(user.email);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationEmailSentTo) {
    return (
      <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
        <div className="bg-yellow-400 p-6 rounded-full shadow-lg mb-8 animate-pulse">
          <DuckLogo className="w-16 h-16" />
        </div>
        
        <div className="w-full bg-white rounded-[2.5rem] border-4 border-yellow-200 p-8 shadow-xl">
          <div className="mb-6 bg-green-50 p-4 rounded-2xl border-2 border-green-100 flex justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Check Your Inbox!</h2>
          <p className="text-gray-600 font-bold mb-8">
            We have sent you a verification email to <span className="text-green-600 underline">{verificationEmailSentTo}</span>. Please verify it and log in.
          </p>

          <button
            onClick={() => {
              setVerificationEmailSentTo(null);
              setIsSignUp(false);
              setEmail('');
              setPassword('');
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-all active:scale-95"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="bg-yellow-400 p-6 rounded-full shadow-lg mb-8">
        <DuckLogo className="w-16 h-16" />
      </div>
      
      <div className="w-full bg-white rounded-[2.5rem] border-4 border-yellow-200 p-8 shadow-xl">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          {isSignUp ? 'Join the Pond' : 'Welcome Back'}
        </h2>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Duck Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="quack@pond.com"
              className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl focus:border-green-500 focus:outline-none font-bold text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Secret Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl focus:border-green-500 focus:outline-none font-bold text-gray-800"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-yellow-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-yellow-200 hover:border-green-500 text-gray-700 py-3 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all active:scale-95 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-yellow-100 text-center">
          <p className="text-gray-500 font-bold mb-2">
            {isSignUp ? 'Already a pond member?' : 'New duck in town?'}
          </p>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            className="text-green-600 font-extrabold hover:text-green-700 transition-colors"
          >
            {isSignUp ? 'Sign In Instead' : 'Create a Pond Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
