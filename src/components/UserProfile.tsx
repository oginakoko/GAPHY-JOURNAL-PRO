import { useState, useRef } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function UserProfile() {
  const { profile, loading, error, updateProfile, uploadAvatar } = useProfile();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      await uploadAvatar(file);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-500/10 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A] rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
      
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarClick}
            className="relative w-24 h-24 rounded-full overflow-hidden group"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">{profile?.username?.[0]?.toUpperCase() || '?'}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#252525] rounded-lg px-4 py-3 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setUsername(profile?.username || '');
                  }}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Display Name
                </label>
                <p className="text-lg font-medium">{profile?.username || 'Anonymous'}</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#252525] hover:bg-[#303030] rounded-lg transition-all"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;