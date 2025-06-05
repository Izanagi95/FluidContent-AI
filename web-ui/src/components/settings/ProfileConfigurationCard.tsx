import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface ProfileData {
  user_id: string | null;
  name: string;
  age: number;
  interests: string[];
  preferences: {
    tone: string;
    length: string;
    format_preference: string;
  };
}

const ProfileConfigurationCard = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    user_id: null,
    name: "",
    age: 18,
    interests: [],
    preferences: {
      tone: "entusiasta e informativo",
      length: "conciso",
      format_preference: "articoli con punti elenco",
    },
  });

  const [newInterest, setNewInterest] = useState("");

  const handleProfileChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileData] as object),
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !profileData.interests.includes(trimmed)) {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const id = userData ? JSON.parse(userData).id : null;

    if (!id) return;

    setProfileData((prev) => ({ ...prev, user_id: id }));

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/configurations/user/${id}`);
        const data = response.data;

        setProfileData({
          user_id: data.user_id,
          name: data.name,
          age: data.age_preference,
          interests: data.interests ? (data.interests === "" ? [] : data.interests.split(",")) : [],
          preferences: {
            tone: data.tone_preference,
            length: data.length_preference,
            format_preference: data.format_preference,
          },
        });
      } catch (err) {
        toast.error("Errore nel caricamento del profilo.");
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!profileData.user_id) return;

    const body = {
      user_id: profileData.user_id,
      name: profileData.name,
      age_preference: profileData.age,
      tone_preference: profileData.preferences.tone,
      length_preference: profileData.preferences.length,
      format_preference: profileData.preferences.format_preference,
      interests: profileData.interests.join(","),
    };

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/configurations/user/${body.user_id}`, body);
      toast.success("Profile configuration saved!");
    } catch (error) {
      toast.error("Error saving profile data.");
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="h-5 w-5" />
        Content Configuration
      </h3>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <Input
              type="number"
              value={profileData.age}
              onChange={(e) => handleProfileChange("age", parseInt(e.target.value) || 0)}
              placeholder="Your age"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Interests</label>
          <div className="space-y-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Add an interest and press Enter"
            />
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <Select
              value={profileData.preferences.tone}
              onValueChange={(value) => handleProfileChange("preferences.tone", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entusiasta e informativo">Entusiasta e Informativo</SelectItem>
                <SelectItem value="professionale">Professionale</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="tecnico">Tecnico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Length</label>
            <Select
              value={profileData.preferences.length}
              onValueChange={(value) => handleProfileChange("preferences.length", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conciso">Conciso</SelectItem>
                <SelectItem value="dettagliato">Dettagliato</SelectItem>
                <SelectItem value="medio">Medio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <Select
              value={profileData.preferences.format_preference}
              onValueChange={(value) => handleProfileChange("preferences.format_preference", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="articoli con punti elenco">Articoli con Punti Elenco</SelectItem>
                <SelectItem value="paragrafi narrativi">Paragrafi Narrativi</SelectItem>
                <SelectItem value="formato domanda-risposta">Formato Domanda-Risposta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={saveProfile} className="w-full">
          Save Profile Configuration
        </Button>
      </div>
    </Card>
  );
};

export default ProfileConfigurationCard;
