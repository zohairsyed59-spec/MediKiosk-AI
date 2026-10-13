import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, LogOut, Search, Clock, AlertTriangle, CheckCircle2,
  FileText, User, ChevronRight, Filter, Stethoscope, Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Spinner, LoadingCard } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import type { Summary, Session, Patient } from '@/types';

interface DashboardItem {
  summary: Summary;
  session: Session;
  patient: Patient;
}

const filterOptions = [
  { key: 'all' as const, label: 'All' },
  { key: 'pending' as const, label: 'Awaiting Review' },
  { key: 'in_progress' as const, label: 'In Progress' },
  { key: 'completed' as const, label: 'Completed' },
] as const;

export default function PhysicianDashboard() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: summaries, error } = await supabase
        .from('summaries')
        .select(`
          *,
          session:sessions (
            *,
            patient:patients (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: DashboardItem[] = (summaries || []).map((s: any) => ({
        summary: s,
        session: s.session,
        patient: s.session?.patient,
      }));

      setItems(mapped);
    } catch {
      toast.error('Failed to load summaries', 'Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out', 'You have been logged out.');
    navigate('/');
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.patient?.name.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.chief_complaint?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && item.summary.status === 'pending_review') ||
      (filter === 'in_progress' && item.summary.status === 'draft') ||
      (filter === 'completed' && (item.summary.status === 'reviewed' || item.summary.status === 'amended'));

    return matchesSearch && matchesFilter;
  });

  const pendingCount = items.filter((i) => i.summary.status === 'pending_review').length;
  const emergencyCount = items.filter((i) => i.session?.red_flag_triggered).length;
  const reviewedCount = items.filter((i) => i.summary.status === 'reviewed' || i.summary.status === 'amended').length;
  const inProgressCount = items.filter((i) => i.summary.status === 'draft').length;

  const getTriageBadge = (session: Session | undefined) => {
    if (session?.red_flag_triggered) {
      return <Badge variant="emergency"><AlertTriangle className="w-3 h-3" /> Emergency</Badge>;
    }
    if (session?.mode === 'ayush') {
      return <Badge variant="priority"><Clock className="w-3 h-3" /> AYUSH</Badge>;
    }
    return null;
  };

  const getStatusBadge = (status: Summary['status']) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="warning"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'reviewed':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3" /> Reviewed</Badge>;
      case 'amended':
        return <Badge variant="info"><FileText className="w-3 h-3" /> Amended</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3" /> In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-lg font-semibold text-foreground">MediKiosk AI</p>
                <p className="text-xs text-muted-foreground">Physician Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <p className="text-sm font-medium text-foreground text-right">{profile.name}</p>
                  <p className="text-xs text-muted-foreground text-right">{profile.department}</p>
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Avatar>
                  <AvatarFallback className="text-sm font-medium text-muted-foreground">
                    {profile?.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Summaries</p>
                <p className="font-display text-3xl font-bold text-foreground mt-1">{items.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Awaiting Review</p>
                <p className="font-display text-3xl font-bold text-foreground mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Emergency</p>
                <p className="font-display text-3xl font-bold text-foreground mt-1">{emergencyCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reviewed</p>
                <p className="font-display text-3xl font-bold text-foreground mt-1">{reviewedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search by patient name or complaint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs className="flex-1 max-w-md">
            <TabsList className="grid w-full grid-cols-4">
              {filterOptions.map((f) => (
                <TabsTrigger
                  key={f.key}
                  className="text-xs py-2"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Patient Queue */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Patient Queue</CardTitle>
                <CardDescription>{filtered.length} of {items.length} records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <LoadingCard key={i} lines={3} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No summaries found"
                description={search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'Patient histories will appear here once patients complete the kiosk check-in.'}
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <Card
                    key={item.summary.id}
                    hover
                    className="cursor-pointer transition-all"
                    onClick={() => navigate(`/physician/review/${item.session?.id}`)}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-base font-medium">
                          {item.patient?.name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground truncate flex-1">{item.patient?.name || 'Unknown Patient'}</p>
                          {item.patient?.age && (
                            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                              {item.patient.age}y, {item.patient.gender}
                            </span>
                          )}
                          {getTriageBadge(item.session)}
                          {getStatusBadge(item.summary.status)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {item.summary.chief_complaint || 'No chief complaint recorded'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.summary.created_at)}
                          </span>
                          {item.patient?.abha_id && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              ABHA: {item.patient.abha_id}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}