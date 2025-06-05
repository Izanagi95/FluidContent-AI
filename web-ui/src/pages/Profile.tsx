import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Star, Trophy, BookOpen, Edit3 } from "lucide-react";
import { User as UserType } from "@/services/ServiceInterface";
import { toast } from "sonner";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [id, setId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('consumer');

  useEffect(() => {
    // Carica dati da localStorage solo sul client
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.id) {
          setId(parsed.id);
        } else {
          console.warn("ID mancante nell'oggetto user:", parsed);
        }
      } else {
        console.warn("Nessun dato utente trovato in localStorage.");
      }

      const role = localStorage.getItem('userRole');
      if (role) setUserRole(role);
    } catch (error) {
      console.error("Errore nel parsing di localStorage user:", error);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`);
        if (response.status !== 200) throw new Error("Failed to load user");

        const userData = response.data;
        setUser(userData);
        setFormData({ name: userData.name, email: userData.email });
      } catch (error) {
        console.error("Errore durante il caricamento utente:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleSave = async () => {
    if (!user || !id) return;

    const newUser = { ...user, ...formData };

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, newUser);
      setUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!', response.data);
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({ name: user.name, email: user.email });
    }
    setEditing(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-xl text-gray-600">Manage your account and view your progress</p>
        </div>

        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 text-center">
              <img 
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary/20"
              />
              <Badge
                className={
                  userRole === 'consumer'
                    ? 'bg-blue-100 text-blue-600 border-blue-300'
                    : userRole === 'maker'
                    ? 'bg-red-100 text-red-600 border-red-300'
                    : 'bg-green-100 text-green-600 border-green-300'
                }
              >
                {userRole === 'consumer'
                  ? 'Content Consumer'
                  : userRole === 'maker'
                  ? 'Content Maker'
                  : 'Content Provider'}
              </Badge>
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Your email"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save Changes</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <User className="h-5 w-5" />
                    <span>Level {user.level}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 mx-auto mb-3 flex items-center justify-center rounded-full">
              <Star className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold mb-1">{user.totalXp}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 mx-auto mb-3 flex items-center justify-center rounded-full">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold mb-1">{user.level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 mx-auto mb-3 flex items-center justify-center rounded-full">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="text-2xl font-bold mb-1">{user.achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-2xl font-semibold mb-6">Recent Achievements</h3>
          {user.achievements.length > 0 ? (
            <div className="space-y-4">
              {user.achievements.slice(-3).map((entry) => (
                <div key={entry.achievement.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl">{entry.achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{entry.achievement.name}</h4>
                    <p className="text-sm text-gray-600">{entry.achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      +{entry.achievement.xpReward} XP
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No achievements yet</p>
              <p className="text-sm">Start reading articles to earn your first achievement!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
