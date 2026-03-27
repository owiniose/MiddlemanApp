import React, { useState } from 'react';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

export default function AuthStack() {
  const [screen, setScreen] = useState<'login' | 'signup'>('login');

  if (screen === 'signup') {
    return <SignUpScreen onGoLogin={() => setScreen('login')} />;
  }
  return <LoginScreen onGoSignUp={() => setScreen('signup')} />;
}
