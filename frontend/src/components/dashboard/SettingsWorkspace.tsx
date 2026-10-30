import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, User, Key, Bell, Check, Lock, Database } from 'lucide-react';
import { TEST_USER } from '../../data/testUserData.ts';
import { api } from '../../api/client.ts';

export default function SettingsWorkspace() {
  const [saved, setSaved] = useState(false);
  const [jurisdiction, setJurisdiction] = useState(TEST_USER.jurisdictionDefault);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((settings) => {
        if (settings?.default_jurisdiction) {
          setJurisdiction(settings.default_jurisdiction);
        }
      })
      .catch((err) => console.error('Failed to fetch user settings:', err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings({ default_jurisdiction: jurisdiction });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-4.25rem)]">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account & Preferences</h1>
        <p className="text-xs text-gray-500">
          Manage your verified in-house legal identity, jurisdiction routing, and subscription parameters.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
            {TEST_USER.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{TEST_USER.name}</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                Verified Pro Counsel
              </span>
            </div>
            <p className="text-xs text-gray-500">{TEST_USER.role} · {TEST_USER.organization}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{TEST_USER.email}</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Full Name</label>
            <input
              type="text"
              readOnly
              value={TEST_USER.name}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Registered Email Address</label>
            <input
              type="text"
              readOnly
              value={TEST_USER.email}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Default Legal Jurisdiction</label>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="US - New York">US - New York</option>
              <option value="US - Delaware Chancery">US - Delaware Chancery</option>
              <option value="US - California">US - California</option>
              <option value="United Kingdom">United Kingdom (E&W)</option>
              <option value="European Union">European Union (GDPR)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Current Subscription Tier</label>
            <input
              type="text"
              readOnly
              value={TEST_USER.plan}
              className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2 text-blue-900 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Security & Confidentiality */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Enterprise Security & Air-Gapped AI Routing
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          ClauseCite uses air-gapped zero-retention model endpoints. Your client privilege is preserved: documents and prompts are never fed into foundation training pools.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-900 block">SOC 2 Type II</span>
            <span className="text-[10px] text-gray-500">Continuous audit compliance</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-900 block">256-Bit AES</span>
            <span className="text-[10px] text-gray-500">At-rest & in-transit encryption</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-900 block">Attorney Privilege</span>
            <span className="text-[10px] text-gray-500">Zero data retention guarantee</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saved ? 'Preferences Saved!' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
}
