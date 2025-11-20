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
    goal: '',
    struggle: ''
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
        goal: '',
        struggle: ''
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
        width: '300px',
        height: '650px',
        background: 'var(--color-background-secondary, #F8FAFC)',
        border: '1px solid var(--color-border, #E2E8F0)',
        borderRadius: '16px',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <span style={{ color: 'var(--color-text-secondary, #64748B)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{
      width: '300px',
      height: '650px',
      background: 'var(--color-background-secondary, #F8FAFC)',
      border: '1px solid var(--color-border, #E2E8F0)',
      borderRadius: '16px',
      padding: '40px',
      overflow: 'auto'
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
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
            flexDirection: 'column',
            gap: '6px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--color-border-subtle, #F1F5F9)'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>Goal</span>
            {!isEditing ? (
              <span style={{ fontSize: '13px', color: 'var(--color-text, #0F172A)', lineHeight: '1.4' }}>
                {profile.goal || 'N/A'}
              </span>
            ) : (
              <textarea
                value={editForm.goal || ''}
                onChange={(e) => handleChange('goal', e.target.value)}
                placeholder="Your goal"
                rows="3"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text, #0F172A)',
                  padding: '8px 10px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '6px',
                  background: 'var(--color-background, #FFFFFF)',
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            )}
          </div>

          {/* My Struggle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--color-border-subtle, #F1F5F9)'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>Struggle</span>
            {!isEditing ? (
              <span style={{ fontSize: '13px', color: 'var(--color-text, #0F172A)', lineHeight: '1.4' }}>
                {profile.struggle || 'N/A'}
              </span>
            ) : (
              <textarea
                value={editForm.struggle || ''}
                onChange={(e) => handleChange('struggle', e.target.value)}
                placeholder="Your struggle"
                rows="3"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text, #0F172A)',
                  padding: '8px 10px',
                  border: '1px solid var(--color-border, #E2E8F0)',
                  borderRadius: '6px',
                  background: 'var(--color-background, #FFFFFF)',
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            )}
          </div>
        </div>

        {/* Weight to Go */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(52, 199, 89, 0.1))',
          borderRadius: '8px',
          padding: '12px 16px',
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '11px',
            color: '#4ECDC4',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: '700'
          }}>
            Weight to Go
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '28px', fontWeight: '600', color: '#4ECDC4' }}>
              {weightToGo}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>kg</span>
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
      paddingBottom: '8px',
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
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type={type}
            value={editValue ?? ''}
            onChange={(e) => onChange(e.target.value)}
            step={step}
            placeholder={`0 ${suffix}`}
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--color-text, #0F172A)',
              padding: '6px 10px',
              paddingRight: '60px',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: '6px',
              background: 'var(--color-background, #FFFFFF)',
              width: '120px',
              textAlign: 'right'
            }}
          />
          <span style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            color: 'var(--color-text-secondary, #64748B)',
            pointerEvents: 'none'
          }}>
            {suffix}
          </span>
        </div>
      )}
    </div>
  );
}
