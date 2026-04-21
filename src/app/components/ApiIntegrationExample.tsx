import { FormEvent, useEffect, useState } from 'react';
import { ApiError, authApi, userApi } from '../api';

interface LoginResponse {
  token?: string;
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

interface BeachItem {
  id: number;
  name: string;
  location: string;
  price: number;
}

export function ApiIntegrationExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [beaches, setBeaches] = useState<BeachItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBeaches = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await userApi.getAllBeaches<BeachItem[]>();
        setBeaches(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Unexpected error while loading beaches.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadBeaches();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await authApi.login<LoginResponse>({ email, password });

      if (response?.token) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unexpected error during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">API Integration Example</h2>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="border rounded px-3 py-2 w-full"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="border rounded px-3 py-2 w-full"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-cyan-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          Login
        </button>
      </form>

      {token ? <p className="text-green-700">Authenticated</p> : <p className="text-gray-600">Not authenticated</p>}

      {errorMessage ? <p className="text-red-600">{errorMessage}</p> : null}

      <div>
        <h3 className="font-semibold mb-2">Beaches</h3>
        {loading ? <p>Loading...</p> : null}
        <ul className="space-y-2">
          {beaches.map((beach) => (
            <li key={beach.id} className="border rounded p-3">
              <p className="font-medium">{beach.name}</p>
              <p className="text-sm text-gray-600">{beach.location}</p>
              <p className="text-sm">{beach.price} EGP</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
