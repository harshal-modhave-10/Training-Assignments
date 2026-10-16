// src/components/RegistrationForm.jsx
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useUser } from '../context/UserContext';

// Helper component to access pending state via useFormStatus()
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      style={{
        padding: '10px 20px',
        backgroundColor: pending ? '#ccc' : '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: pending ? 'not-allowed' : 'pointer'
      }}
    >
      {pending ? 'Registering...' : 'Register'}
    </button>
  );
}

export function RegistrationForm() {
  const { setUser } = useUser();

  // Async action handler for React 19 useActionState
  async function registerAction(prevState, formData) {
    const name = formData.get('name')?.trim();
    const email = formData.get('email')?.trim();
    const password = formData.get('password');

    // Basic Validation
    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required.' };
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Simulated API Call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const userData = { name, email };
    setUser(userData); // Update React 19 Context

    return { success: true, user: userData, error: null };
  }

  const [state, formAction] = useActionState(registerAction, {
    success: false,
    error: null,
    user: null
  });

  return (
    <div style={{ maxWidth: '400px', margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>User Registration</h2>
      {state.success ? (
        <div style={{ color: 'green', padding: '10px 0' }}>
          Registration successful! Welcome, {state.user?.name}.
        </div>
      ) : (
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {state.error && (
            <div style={{ color: 'red', fontSize: '14px' }}>{state.error}</div>
          )}

          <div>
            <label htmlFor="name">Name:</label><br />
            <input type="text" id="name" name="name" style={{ width: '100%', padding: '8px' }} />
          </div>

          <div>
            <label htmlFor="email">Email:</label><br />
            <input type="email" id="email" name="email" style={{ width: '100%', padding: '8px' }} />
          </div>

          <div>
            <label htmlFor="password">Password:</label><br />
            <input type="password" id="password" name="password" style={{ width: '100%', padding: '8px' }} />
          </div>

          <SubmitButton />
        </form>
      )}
    </div>
  );
}