import { FormEvent, useEffect, useState } from 'react';
import { Activity, LockKeyhole, UserRound } from 'lucide-react';
import { LoginBackground } from '../components/LoginBackground';
import { AuthSession, Project, protabApi } from '../services/api';

interface LoginPageProps {
  onAuthenticated: (session: AuthSession) => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [quadrigramme, setQuadrigramme] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    protabApi.listProjects()
      .then((items) => {
        setProjects(items);
        setProjectId(items[0]?.id ?? '');
      })
      .catch(() => setError('Impossible de charger la liste des projets.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const session = await protabApi.login(projectId, quadrigramme, password);
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identification impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-nord-0 text-slate-900 dark:text-nord-5 flex items-center justify-center px-4 py-10">
      <LoginBackground />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-nord-2 bg-white dark:bg-nord-1 p-7 shadow-xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white dark:bg-nord-9">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-nord-6">Tally</h1>
            <p className="text-sm text-slate-500 dark:text-nord-4">Accès à votre projet</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">
            Projet
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              disabled={loading || submitting || projects.length === 0}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-nord-2 dark:bg-nord-0"
              required
            >
              {projects.length === 0 && <option value="">Aucun projet disponible</option>}
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Quadrigramme
            <span className="relative mt-1.5 block">
              <UserRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input value={quadrigramme} onChange={(event) => setQuadrigramme(event.target.value.toUpperCase())} disabled={submitting} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 dark:border-nord-2 dark:bg-nord-0" required />
            </span>
          </label>

          <label className="block text-sm font-medium">
            Mot de passe du projet
            <span className="relative mt-1.5 block">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 dark:border-nord-2 dark:bg-nord-0" required />
            </span>
          </label>

          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-nord-11/15 dark:text-nord-11">{error}</p>}

          <button type="submit" disabled={loading || submitting || !projectId} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-nord-10 dark:hover:bg-nord-9">
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </section>
    </main>
  );
}
