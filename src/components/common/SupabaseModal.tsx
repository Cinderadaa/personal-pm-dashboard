import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../../services/supabase';
import { Modal } from './Modal';
import {
  Cloud,
  Check,
  Copy,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- ==============================================================================
-- Personal Project Management Dashboard — Supabase Database Schema
-- ==============================================================================

-- 1. Create Projects Table
create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text default '',
  category text not null check (category in ('internship', 'work', 'study', 'personal', 'life')),
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed')),
  deadline text not null,
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  icon text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create Tasks Table
create table if not exists public.tasks (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  due_date text not null,
  due_time text,
  subtasks jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- 3. Create Indexes
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_projects_category on public.projects(category);

-- 4. Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- 5. Open Policies for Access
create policy "Allow all access to projects" on public.projects for all using (true) with check (true);
create policy "Allow all access to tasks" on public.tasks for all using (true) with check (true);

-- 6. Enable Realtime
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const {
    isSupabaseConnected,
    isCloudSyncing,
    lastSyncedAt,
    pushLocalToCloud,
    pullCloudToLocal,
    checkSupabaseConnection,
  } = useProjectContext();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
      setActionStatus(null);
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(url, anonKey);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSaveConfig = async () => {
    saveSupabaseConfig({ url, anonKey });
    await checkSupabaseConnection();
    setActionStatus('Configuration saved successfully!');
    setTimeout(() => setActionStatus(null), 2500);
  };

  const handleDisconnect = async () => {
    if (window.confirm('Disconnect Supabase and switch back to LocalStorage mode?')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      await checkSupabaseConnection();
      setTestResult(null);
      setActionStatus('Disconnected from Supabase.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handlePush = async () => {
    setActionStatus('Uploading local projects & tasks to Supabase...');
    const success = await pushLocalToCloud();
    if (success) {
      setActionStatus('Successfully pushed local data to Supabase!');
    } else {
      setActionStatus('Failed to upload data. Check database table schema and connection.');
    }
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handlePull = async () => {
    setActionStatus('Downloading projects & tasks from Supabase...');
    const success = await pullCloudToLocal();
    if (success) {
      setActionStatus('Successfully synced cloud data!');
    } else {
      setActionStatus('Failed to download data from Supabase.');
    }
    setTimeout(() => setActionStatus(null), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Database"
      description="Connect to your PostgreSQL cloud database for multi-device sync and real-time backup."
      maxWidth="lg"
    >
      <div className="space-y-5 font-mono text-[#abb2bf]">
        {/* Status Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#282c34] bg-[#14161a]">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isSupabaseConnected ? 'bg-[#98c379] animate-pulse' : 'bg-[#5c6370]'
              }`}
            />
            <div>
              <div className="text-xs font-semibold text-[#abb2bf] flex items-center gap-2">
                <span>{isSupabaseConnected ? 'Connected to Supabase Cloud' : 'Operating in Local Mode'}</span>
                {isCloudSyncing && (
                  <span className="text-[10px] text-[#5c6370] flex items-center gap-1 font-mono">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Syncing...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#5c6370] mt-0.5">
                {isSupabaseConnected
                  ? `Last synced: ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Just now'}`
                  : 'Data is stored in your local browser cache.'}
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#61afef] hover:underline flex items-center gap-1"
          >
            <span>Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Credentials Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef]"
            />
          </div>

          {/* Test & Action feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-[#98c379]/10 text-[#98c379] border-[#98c379]/30'
                  : 'bg-[#e06c75]/10 text-[#e06c75] border-[#e06c75]/30'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{testResult.message}</span>
            </div>
          )}

          {actionStatus && (
            <div className="p-2.5 rounded-lg text-xs bg-[#14161a] border border-[#282c34] text-[#61afef] font-medium">
              {actionStatus}
            </div>
          )}

          {/* Credential Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !url.trim() || !anonKey.trim()}
                className="px-3 py-1.5 text-xs font-medium border border-[#282c34] bg-[#14161a] rounded-lg hover:border-[#3e4451] disabled:opacity-40 transition-colors flex items-center gap-1.5 text-[#abb2bf]"
              >
                {isTesting ? <RefreshCw className="w-3 h-3 animate-spin text-[#61afef]" /> : <Cloud className="w-3 h-3 text-[#61afef]" />}
                <span>Test Connection</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={!url.trim() || !anonKey.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] disabled:opacity-40 transition-colors"
              >
                Save & Connect
              </button>
            </div>

            {isSupabaseConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 text-xs text-[#e06c75] hover:bg-[#2c313a] rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </div>

        {/* Database Migration & Schema Helper */}
        <div className="pt-4 border-t border-[#282c34] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-[#abb2bf]">
                1-Click Database Setup (SQL Schema)
              </h4>
              <p className="text-[11px] text-[#5c6370] font-sans">
                Paste this script into your Supabase SQL Editor to create tables with 1 click.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-2.5 py-1.5 text-xs font-medium bg-[#14161a] border border-[#282c34] hover:bg-[#2c313a] text-[#abb2bf] rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-[#98c379]" /> : <Copy className="w-3.5 h-3.5 text-[#61afef]" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          {/* Cloud Sync Migration Tools */}
          {isSupabaseConnected && (
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handlePush}
                className="p-3 text-left rounded-lg border border-[#282c34] bg-[#14161a] hover:bg-[#1e2227] hover:border-[#3e4451] transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#61afef] mb-0.5">
                  <UploadCloud className="w-4 h-4" />
                  <span>Push Local to Cloud</span>
                </div>
                <p className="text-[11px] text-[#5c6370] font-sans">
                  Upload current tasks and projects to Supabase database.
                </p>
              </button>

              <button
                type="button"
                onClick={handlePull}
                className="p-3 text-left rounded-lg border border-[#282c34] bg-[#14161a] hover:bg-[#1e2227] hover:border-[#3e4451] transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#c678dd] mb-0.5">
                  <DownloadCloud className="w-4 h-4" />
                  <span>Pull Cloud to Local</span>
                </div>
                <p className="text-[11px] text-[#5c6370] font-sans">
                  Fetch latest projects & tasks from Supabase into your browser.
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
