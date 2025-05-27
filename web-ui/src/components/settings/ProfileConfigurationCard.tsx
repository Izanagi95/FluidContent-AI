import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, X } from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  user_id: string;
  name: string;
  age: string;
  interests: string[];
  preferences: {
    tone: string;
    length: string;
    format_preference: string;
  };
}

const ProfileConfigurationCard = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    user_id: "user-1",
    name: "",
    age: "",
    interests: [],
    preferences: {
      tone: "entusiasta e informativo",
      length: "conciso",
      format_preference: "articoli con punti elenco"
    }
  });

  const [newInterest, setNewInterest] = useState("");

  const handleProfileChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileData] as object),
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  const saveProfile = () => {
    const apiData = {
      profile: profileData
    };
    console.log('Profile data for API:', JSON.stringify(apiData, null, 2));
    toast.success('Profile configuration saved!');
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <User className="h-5 w-5" />
        Profile Configuration
      </h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={profileData.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <Input
              type="number"
              value={profileData.age}
              onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || '')}
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
              onKeyPress={handleKeyPress}
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
              onValueChange={(value) => handleProfileChange('preferences.tone', value)}
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
              onValueChange={(value) => handleProfileChange('preferences.length', value)}
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
              onValueChange={(value) => handleProfileChange('preferences.format_preference', value)}
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