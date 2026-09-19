"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Mail, Phone, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const AccountSettings = () => {
  const { user, setUser } = useAuthStore();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!profileData.email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const res = await authApi.updateProfile({
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim() || undefined,
      });

      if (res.data?.success && res.data.data) {
        setUser(res.data.data);
        toast.success("Profile details updated successfully");
      }
    } catch (err: unknown) {
      console.error("Update profile error:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update profile details.";
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const res = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data?.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: unknown) {
      console.error("Change password error:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to change password.";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Personalize your profile credentials and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-between rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8"
        >
          <div>
            <div className="mb-6 flex items-center gap-3 border-b border-outline-variant/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Personal Profile
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Update your contact info and personal identification
                </p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Full Name
                </label>
                <Input
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Eleanor Vance"
                  icon={<User size={16} />}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="client@thecurator.com"
                  icon={<Mail size={16} />}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+1 (555) 234-5678"
                  icon={<Phone size={16} />}
                />
                <p className="mt-1 text-[11px] text-on-surface-variant/70">
                  Used for delivery dispatch notifications and courier
                  communication.
                </p>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingProfile}
                  className="w-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase sm:w-auto"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Security / Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col justify-between rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8"
        >
          <div>
            <div className="mb-6 flex items-center gap-3 border-b border-outline-variant/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Security & Password
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Manage your credentials and password protection
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                  icon={<Lock size={16} />}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Minimum 6 characters"
                  icon={<KeyRound size={16} />}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Repeat new password"
                  icon={<KeyRound size={16} />}
                  required
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingPassword}
                  className="w-full px-6 py-2.5 text-xs font-semibold tracking-wider uppercase sm:w-auto"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
