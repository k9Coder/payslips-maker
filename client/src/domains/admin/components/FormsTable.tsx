import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PageLoading } from '@/shared/components/LoadingSpinner';
import { useAdminForms } from '../hooks/useAdminForms';
import { formatCurrency, formatDate, formatPeriod } from '@/lib/utils';
import type { AdminFormsQuery } from '@payslips-maker/shared';

const MONTH_NAMES = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

interface QuickViewForm {
  employeeInfo: { fullName: string; idNumber: string; nationality: string };
  period: { month: number; year: number };
  payCalculation: { grossSalary: number };
  netSalary: number;
  deductions: { incomeTax: number; nationalInsurance: number; healthInsurance: number };
  updatedAt: string;
}

function QuickViewDialog({ form }: { form: QuickViewForm }) {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">{t('admin.forms.quickView')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {form.employeeInfo.fullName} - {formatPeriod(form.period.month, form.period.year)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-base">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">מספר זהות:</span>
            <span>{form.employeeInfo.idNumber}</span>
            <span className="text-muted-foreground">לאום:</span>
            <span>{form.employeeInfo.nationality}</span>
            <span className="text-muted-foreground">ברוטו:</span>
            <span className="font-medium">{formatCurrency(form.payCalculation.grossSalary)}</span>
            <span className="text-muted-foreground">מס הכנסה:</span>
            <span className="text-destructive">-{formatCurrency(form.deductions.incomeTax)}</span>
            <span className="text-muted-foreground">ביטוח לאומי:</span>
            <span className="text-destructive">-{formatCurrency(form.deductions.nationalInsurance)}</span>
            <span className="text-muted-foreground">ביטוח בריאות:</span>
            <span className="text-destructive">-{formatCurrency(form.deductions.healthInsurance)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>נטו לתשלום:</span>
            <span className="text-primary">{formatCurrency(form.netSalary)}</span>
          </div>
          <p className="text-sm text-muted-foreground">עודכן: {formatDate(form.updatedAt)}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FormsTable() {
  const { t } = useTranslation();
  const [query, setQuery] = useState<AdminFormsQuery>({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    page: 1,
  });
  const [groupByPeriod, setGroupByPeriod] = useState(false);

  const { data, isLoading } = useAdminForms(query);

  if (isLoading) return <PageLoading />;

  const forms = (data?.forms ?? []) as QuickViewForm[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (query.limit ?? 20));

  // Group by period if enabled
  const grouped = groupByPeriod
    ? forms.reduce<Record<string, QuickViewForm[]>>((acc, form) => {
        const key = formatPeriod(form.period.month, form.period.year);
        if (!acc[key]) acc[key] = [];
        acc[key].push(form);
        return acc;
      }, {})
    : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort By */}
        <Select
          value={query.sortBy ?? 'updatedAt'}
          onValueChange={(v) => setQuery((q) => ({ ...q, sortBy: v as AdminFormsQuery['sortBy'], page: 1 }))}
        >
          <SelectTrigger className="w-44">
            <ArrowUpDown className="h-4 w-4 ms-2" />
            <SelectValue placeholder={t('admin.forms.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">תאריך עדכון</SelectItem>
            <SelectItem value="employeeName">שם עובד</SelectItem>
            <SelectItem value="grossSalary">ברוטו</SelectItem>
            <SelectItem value="netSalary">נטו</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={query.sortOrder ?? 'desc'}
          onValueChange={(v) => setQuery((q) => ({ ...q, sortOrder: v as 'asc' | 'desc', page: 1 }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">יורד</SelectItem>
            <SelectItem value="asc">עולה</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter by month */}
        <Select
          value={query.month ? String(query.month) : 'all'}
          onValueChange={(v) => setQuery((q) => ({ ...q, month: v === 'all' ? undefined : Number(v), page: 1 }))}
        >
          <SelectTrigger className="w-36">
            <Filter className="h-4 w-4 ms-2" />
            <SelectValue placeholder="חודש" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל החודשים</SelectItem>
            {MONTH_NAMES.slice(1).map((name, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Group by period toggle */}
        <Button
          variant={groupByPeriod ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGroupByPeriod((v) => !v)}
        >
          קבץ לפי תקופה
        </Button>

        <span className="ms-auto text-sm text-muted-foreground">{total} תלושים</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.forms.employee')}</TableHead>
              <TableHead>{t('admin.forms.period')}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('admin.forms.gross')}</TableHead>
              <TableHead>{t('admin.forms.net')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('admin.forms.updatedAt')}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped
              ? Object.entries(grouped).map(([period, periodForms]) => (
                  <>
                    <TableRow key={`header-${period}`} className="bg-muted/30">
                      <TableCell colSpan={6} className="font-semibold text-base py-2">
                        📅 {period} ({periodForms.length} תלושים)
                      </TableCell>
                    </TableRow>
                    {periodForms.map((form, i) => (
                      <TableRow key={`${period}-${i}`}>
                        <TableCell className="font-medium">{form.employeeInfo.fullName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{formatPeriod(form.period.month, form.period.year)}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{formatCurrency(form.payCalculation.grossSalary)}</TableCell>
                        <TableCell className="font-semibold text-primary">{formatCurrency(form.netSalary)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {formatDate(form.updatedAt)}
                        </TableCell>
                        <TableCell><QuickViewDialog form={form} /></TableCell>
                      </TableRow>
                    ))}
                  </>
                ))
              : forms.map((form, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{form.employeeInfo.fullName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatPeriod(form.period.month, form.period.year)}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatCurrency(form.payCalculation.grossSalary)}</TableCell>
                    <TableCell className="font-semibold text-primary">{formatCurrency(form.netSalary)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(form.updatedAt)}
                    </TableCell>
                    <TableCell><QuickViewDialog form={form} /></TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={(query.page ?? 1) === 1}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
          >
            הקודם
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.page')} {query.page} {t('common.of')} {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={(query.page ?? 1) === totalPages}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
          >
            הבא
          </Button>
        </div>
      )}
    </div>
  );
}
