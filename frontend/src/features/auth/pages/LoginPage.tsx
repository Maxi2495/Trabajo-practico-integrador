import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi, getMeApi } from '../api/authApi';
import { useAuthStore } from '../../../store/authStore';
import { handleApiError } from '../../../shared/api/handleApiError';
import { useState } from 'react'; 

export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (values: { username: string; password: string }) => {
      const params = new URLSearchParams();
      params.append('username', values.username);
      params.append('password', values.password);
      await loginApi(params);
      const user = await getMeApi();
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      if (user.role === 'admin') {
        navigate('/admin/resumen');
      } else {
        navigate('/');
      }
    },
    onError: (error) => {
      setErrorMessage(handleApiError(error));
    },
  });

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      loginMutation.mutate(value);
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Food Store</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Iniciá sesión en tu cuenta</p>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4 rounded-md shadow-sm">
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => (!value ? 'El usuario es requerido' : undefined),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <input
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                  {field.state.meta.errors ? (
                    <p className="mt-1 text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => (!value ? 'La contraseña es requerida' : undefined),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                  {field.state.meta.errors ? (
                    <p className="mt-1 text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿No tenés cuenta? </span>
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Registrate aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};