import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Settings, LogOut, Globe, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useApiClient } from '../lib/useApiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: currentUser } = useCurrentUser();
  const { i18n } = useTranslation();
  const api = useApiClient();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [employerNameHe, setEmployerNameHe] = useState('');
  const [employerTaxId, setEmployerTaxId] = useState('');
  const [employerAddress, setEmployerAddress] = useState('');
  const [employerCity, setEmployerCity] = useState('');
  const [employerZip, setEmployerZip] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName ?? '');
      setPhone(currentUser.phone ?? '');
      setEmployerNameHe(currentUser.employerName?.he ?? '');
      setEmployerTaxId(currentUser.employerTaxId ?? '');
      setEmployerAddress(currentUser.employerAddress ?? '');
      setEmployerCity(currentUser.employerCity ?? '');
      setEmployerZip(currentUser.employerZip ?? '');
    }
  }, [currentUser]);

  const updateUser = useMutation({
    mutationFn: () => api.patch('/api/users/me', { fullName, phone }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  });

  const updateEmployer = useMutation({
    mutationFn: () => api.patch('/api/users/me', {
      employerName: { he: employerNameHe },
      employerTaxId,
      employerAddress,
      employerCity,
      employerZip,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currentUser'] }),
  });

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-[#1B2A4A]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">הגדרות</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#1B2A4A]">פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">שם מלא</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>אימייל</Label>
            <Input
              value={user?.primaryEmailAddress?.emailAddress ?? ''}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>
          <Button
            onClick={() => updateUser.mutate()}
            disabled={updateUser.isPending}
            className="w-full"
          >
            {updateUser.isPending ? 'שומר...' : 'שמור שינויים'}
          </Button>
          {updateUser.isSuccess && (
            <p className="text-sm text-teal-600 text-center">הפרטים נשמרו בהצלחה</p>
          )}
        </CardContent>
      </Card>

      {/* Employer info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#1B2A4A]">פרטי מעסיק</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="employerNameHe">שם המעסיק (עברית)</Label>
            <Input id="employerNameHe" value={employerNameHe} onChange={(e) => setEmployerNameHe(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="employerTaxId">מספר עוסק / ח.פ.</Label>
            <Input id="employerTaxId" value={employerTaxId} onChange={(e) => setEmployerTaxId(e.target.value)} dir="ltr" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="employerAddress">כתובת</Label>
            <Input id="employerAddress" value={employerAddress} onChange={(e) => setEmployerAddress(e.target.value)} className="mt-1" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="employerCity">עיר</Label>
              <Input id="employerCity" value={employerCity} onChange={(e) => setEmployerCity(e.target.value)} className="mt-1" />
            </div>
            <div className="w-28">
              <Label htmlFor="employerZip">מיקוד</Label>
              <Input id="employerZip" value={employerZip} onChange={(e) => setEmployerZip(e.target.value)} dir="ltr" className="mt-1" />
            </div>
          </div>
          <Button onClick={() => updateEmployer.mutate()} disabled={updateEmployer.isPending} className="w-full">
            {updateEmployer.isPending ? 'שומר...' : 'שמור פרטי מעסיק'}
          </Button>
          {updateEmployer.isSuccess && (
            <p className="text-sm text-teal-600 text-center">פרטי המעסיק נשמרו בהצלחה</p>
          )}
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#1B2A4A]">שפת ממשק</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { code: 'he', label: 'עברית' },
              { code: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                    : 'border-gray-200 text-gray-600 hover:border-[#1B2A4A]'
                }`}
              >
                <Globe className="h-4 w-4" />
                {lang.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#1B2A4A]">מנוי</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link to="/subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              נהל מנויים
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4 ms-2" />
        התנתקות
      </Button>
    </div>
  );
}
