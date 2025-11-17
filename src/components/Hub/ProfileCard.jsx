// components/Hub/ProfileCard.jsx
import React, { useState, useEffect } from 'react';
import { fetchProfile, upsertProfile, calculateWeightToGo } from '../../services/profileService';

/**
 * ProfileCard Component
 *
 * Editable user profile card for Hub page
 * Loads and saves data from/to Supabase profiles table
 *
 * @param {object} user - Current user object
 */
export default function ProfileCard({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    nickname: '',
    age: null,
    height: null,
    weight: null,
    target_weight: null,
    goal: ''
  });

  // Edit form state
  const [editForm, setEditForm] = useState({ ...profile });

  // Load profile on mount
  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await fetchProfile(user.id);

    if (data) {
      setProfile(data);
      setEditForm(data);
    } else {
      // No profile yet - use defaults
      const defaultProfile = {
        name: '',
        nickname: '',
        age: null,
        height: null,
        weight: null,
        target_weight: null,
        goal: ''
      };
      setProfile(defaultProfile);
      setEditForm(defaultProfile);
    }

    setLoading(false);
  };

  const handleEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const updated = await upsertProfile(user.id, editForm);

    if (updated) {
      setProfile(updated);
      setIsEditing(false);
    }

    setSaving(false);
  };

  const handleChange = (field, value) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const weightToGo = calculateWeightToGo(profile.weight, profile.target_weight);

  if (loading) {
    return (
      <div style={{
        background: 'var(--color-background, #FFFFFF)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <span style={{ color: 'var(--color-text-secondary, #64748B)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--color-background, #FFFFFF)',
      border: '1px solid var(--color-border, #E2E8F0)',
      borderRadius: '16px',
      padding: '40px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--color-text-secondary, #64748B)',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>PROFILE</h2>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            style={{
              color: '#4ECDC4',
              fontSize: '13px',
              fontWeight: '500',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{
                color: 'var(--color-text-secondary, #64748B)',
                fontSize: '13px',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                color: '#4ECDC4',
                fontSize: '13px',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Name */}
        <div>
          {!isEditing ? (
            <>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--color-text, #0F172A)',
                marginBottom: '8px'
              }}>
                {profile.name || 'Your Name'}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary, #64748B)'
              }}>
                Nickname: {profile.nickname || 'N/A'}
              </p>
            </>
          ) : (
            <>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Your Name"
                style={{
                  width: '100%',
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'var(--color-text, #0F172A)',
                  marginBottom: '8px',
                  padding: '8px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '8px',
                  background: 'var(--color-background, #FFFFFF)'
                }}
              />
              <input
                type="text"
                value={editForm.nickname || ''}
                onChange={(e) => handleChange('nickname', e.target.value)}
                placeholder="Nickname"
                style={{
                  width: '100%',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary, #64748B)',
                  padding: '8px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '8px',
                  background: 'var(--color-background, #FFFFFF)'
                }}
              />
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>
          {/* Age */}
          <ProfileField
            label="Age"
            value={profile.age}
            editValue={editForm.age}
            isEditing={isEditing}
            onChange={(val) => handleChange('age', val ? parseInt(val) : null)}
            suffix="years"
            type="number"
          />

          {/* Height */}
          <ProfileField
            label="Height"
            value={profile.height}
            editValue={editForm.height}
            isEditing={isEditing}
            onChange={(val) => handleChange('height', val ? parseInt(val) : null)}
            suffix="cm"
            type="number"
          />

          {/* Weight */}
          <ProfileField
            label="Weight"
            value={profile.weight}
            editValue={editForm.weight}
            isEditing={isEditing}
            onChange={(val) => handleChange('weight', val ? parseFloat(val) : null)}
            suffix="kg"
            type="number"
            step="0.1"
          />

          {/* Target */}
          <ProfileField
            label="Target"
            value={profile.target_weight}
            editValue={editForm.target_weight}
            isEditing={isEditing}
            onChange={(val) => handleChange('target_weight', val ? parseFloat(val) : null)}
            suffix="kg"
            type="number"
            step="0.1"
          />

          {/* Goal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border-subtle, #F1F5F9)'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>Goal</span>
            {!isEditing ? (
              <span style={{ fontSize: '13px', color: 'var(--color-text, #0F172A)', textAlign: 'right', maxWidth: '60%' }}>
                {profile.goal || 'N/A'}
              </span>
            ) : (
              <input
                type="text"
                value={editForm.goal || ''}
                onChange={(e) => handleChange('goal', e.target.value)}
                placeholder="Your goal"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text, #0F172A)',
                  padding: '6px 10px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '6px',
                  background: 'var(--color-background, #FFFFFF)',
                  width: '60%',
                  textAlign: 'right'
                }}
              />
            )}
          </div>
        </div>

        {/* Weight to Go */}
        <div style={{ paddingTop: '12px' }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary, #94A3B8)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>WEIGHT TO GO</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '48px', fontWeight: '300', color: '#4ECDC4' }}>
              {weightToGo}
            </span>
            <span style={{ fontSize: '18px', color: 'var(--color-text-secondary, #64748B)' }}>kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileField Component
 * Reusable field for profile data (display/edit mode)
 */
function ProfileField({ label, value, editValue, isEditing, onChange, suffix, type = 'text', step }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '12px',
      borderBottom: '1px solid var(--color-border-subtle, #F1F5F9)'
    }}>
      <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>
        {label}
      </span>
      {!isEditing ? (
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text, #0F172A)' }}>
          {value ? `${value} ${suffix}` : 'N/A'}
        </span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type={type}
            value={editValue ?? ''}
            onChange={(e) => onChange(e.target.value)}
            step={step}
            placeholder="0"
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--color-text, #0F172A)',
              padding: '6px 10px',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '6px',
              background: 'var(--color-background, #FFFFFF)',
              width: '80px',
              textAlign: 'right'
            }}
          />
          <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>
            {suffix}
          </span>
        </div>
      )}
    </div>
  );
}
