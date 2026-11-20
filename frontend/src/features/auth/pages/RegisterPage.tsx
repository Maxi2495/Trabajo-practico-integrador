import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/authApi';
import { handleApiError } from '../../../shared/api/handleApiError';
import { useState } from 'react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      // Tras registrarse con éxito, redirigimos al login
      navigate('/login');
    },
    onError: (error) => {
      setErrorMessage(handleApiError(error));
    },
  });

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      registerMutation.mutate(value);
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Food Store</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Creá tu cuenta de cliente</p>
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
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
                  />
                  {field.state.meta.errors ? (
                    <p className="mt-1 text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="full_name"
              validators={{
                onChange: ({ value }) => (!value ? 'El nombre completo es requerido' : undefined),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
                  />
                  {field.state.meta.errors ? (
                    <p className="mt-1 text-xs text-red-600">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => (!value ? 'El correo electrónico es requerido' : undefined),
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
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
                onChange: ({ value }) =>
                  value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña (mín. 8 caracteres)</label>
                  <input
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
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
              disabled={registerMutation.isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {registerMutation.isPending ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">¿Ya tenés cuenta? </span>
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Iniciá sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};