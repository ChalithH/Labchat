import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation'
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Upload, Camera } from "lucide-react";

import getUserFromSession from "@/lib/get_user";
import ErrorBox from "./ErrorBox";
import ProfilePicture from "@/components/profilePicture/ProfilePicture";

type ProfileTabProps = {
  onSubmit: (fieldsToUpdate: Record<string, string>) => void;
};

const ProfileTab = ({ onSubmit }: ProfileTabProps) => {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Manage profilePic state internally
  const [profilePic, setProfilePic] = useState<string>("");
  const [originalProfilePic, setOriginalProfilePic] = useState<string>("");

  // User data for ProfilePicture component
  const [userData, setUserData] = useState<{
    id: number;
    universityId: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromSession();
      const currentProfilePic = user.profilePic || "";

      // Set profile pic state internally
      setProfilePic(currentProfilePic);
      setOriginalProfilePic(currentProfilePic);

      // Set user data for ProfilePicture component
      setUserData({
        id: user.id,
        universityId: user.universityId,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    };
    getUser();
  }, []);

  useEffect(() => {
    const newHasChanges = profilePic !== originalProfilePic;
    setHasChanges(newHasChanges);
  }, [profilePic, originalProfilePic]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "title",
        String(
          `${userData?.firstName}${userData?.lastName}${userData?.universityId}`
        )
      );

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed with response:", errorText);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setProfilePic(data.url);

      // Clear the input so the same file can be selected again if needed
      event.target.value = "";
      // Immediately refresh the page to show the new profile picture
      router.refresh()

    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfilePic("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!hasChanges) {
      setError("No changes to save");
      return;
    }

    setError("");
    onSubmit({
      profilePic,
    });
  };

  // Don't render until we have user data
  if (!userData) {
    return (
      <div className="grid py-4 gap-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid py-4 gap-4">
      {error && <ErrorBox error={error} />}

      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <Label className="text-sm font-medium">Profile Picture</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a new profile picture (max 5MB)
          </p>
        </div>

        {/* Profile Picture Display */}
        <div className="relative">
          {profilePic ? (
            <div className="relative">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <ProfilePicture
                  key={`profile-${profilePic}`}
                  user_id={userData.id}
                  profilePic={profilePic}
                  name={`${userData.firstName} ${userData.lastName}`}
                  size={16}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute -top-1 -right-1 rounded-full p-1 h-6 w-6 shadow-md text-xs"
                onClick={handleRemoveImage}
                disabled={isUploading}
                title="Remove image"
              >
                ×
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <ProfilePicture
                  user_id={userData.id}
                  profilePic={profilePic}
                  name={`${userData.firstName} ${userData.lastName}`}
                  size={16}
                />
              </div>
              {/* Overlay to indicate it's clickable/empty */}
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>
          )}
        </div>

        {/* Upload Input */}
        <div className="w-full max-w-sm">
          <Label htmlFor="profile-upload" className="sr-only">
            Upload profile picture
          </Label>
          <div className="relative">
            <Input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => document.getElementById("profile-upload")?.click()}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {profilePic ? "Change Image" : "Choose Image"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!hasChanges || isUploading}>
        Save Changes
      </Button>

      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
    </div>
  );
};

export default ProfileTab;
