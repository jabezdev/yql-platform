// ── Primitives ──────────────────────────────────────────────────────────────
export { Button } from './primitives/Button';
export { Card } from './primitives/Card';
export { Input } from './primitives/Input';

// ── Layout ───────────────────────────────────────────────────────────────────
export { Container } from './layout/Container';
export { Section } from './layout/Section';

// ── Typography ───────────────────────────────────────────────────────────────
export { GradientText } from './typography/GradientText';
export { SectionTitle } from './typography/SectionTitle';
export { IconWrapper } from './typography/IconWrapper';

// ── Geometric decorators ─────────────────────────────────────────────────────
export * from './geometry/GeometricShapes';
export * as GeometricShapes from './geometry/GeometricShapes';
export { BrandColors } from './geometry/shape-utils';
export { GeometricBorder } from './geometry/GeometricBorder';
export { default as GeometricPattern } from './geometry/GeometricPattern';

// ── Page structure ───────────────────────────────────────────────────────────
export { PageHeader, DashboardPage, StatusBadge, EmptyState } from './structure/PageHeader';

// ── Dashboard ────────────────────────────────────────────────────────────────
export { DashboardCard, InfoCard, StatCard, DashboardSectionTitle } from './structure/DashboardCard';

// ── Forms ────────────────────────────────────────────────────────────────────
export { DateInput, TimeInput, DateTimeInput, DateRangeInput, TimeSlotPicker } from './forms/DateTimePicker';

// ── Profiles ─────────────────────────────────────────────────────────────────
export { Avatar, AvatarStack, ChipFallback, avatarPaletteFor } from './profiles/Avatar';
export type { AvatarSize } from './profiles/Avatar';
export { MemberCard, ProfileHeader } from './profiles/Profiles';

// ── Navigation ───────────────────────────────────────────────────────────────
export { Tabs, TabsList, TabsTrigger, TabsContent } from './navigation/Tabs';
export { Pagination } from './navigation/Pagination';
export { Breadcrumbs } from './navigation/Breadcrumbs';
export type { BreadcrumbItem } from './navigation/Breadcrumbs';
export { SidebarItem, SidebarLabel } from './navigation/SidebarItem';

// ── Feedback — Toast & Alert ─────────────────────────────────────────────────
export { Toast, Alert, ToastStack, useToast } from './feedback/Toast';
export type { ToastVariant, ToastItem } from './feedback/Toast';

// ── Feedback — Tooltip & Popover ─────────────────────────────────────────────
export { Tooltip, Popover } from './feedback/Tooltip';
export type { TooltipPlacement } from './feedback/Tooltip';

// ── Overlays — Modal & Drawer ────────────────────────────────────────────────
export { Modal, Drawer } from './overlays/Modal';

// ── Form controls ─────────────────────────────────────────────────────────────
export { Checkbox, RadioGroup, Toggle, Select, Textarea } from './forms/FormControls';
export type { RadioOption, SelectOption } from './forms/FormControls';

// ── Data display ─────────────────────────────────────────────────────────────
export { ProgressBar, StepIndicator, TrendBadge } from './display/DataDisplay';
export type { ProgressColor } from './display/DataDisplay';

// ── Feedback — loading states ────────────────────────────────────────────────
export { Spinner, Skeleton } from './feedback/Feedback';



// ── Editors & viewers ────────────────────────────────────────────────────────
export { RichTextEditor } from './editors/RichTextEditor';
export { default as PdfViewer } from './editors/PdfViewer';

// ── Auth / guards ────────────────────────────────────────────────────────────
export { RoleGuard } from './auth/RoleGuard';

// ── Error boundaries ─────────────────────────────────────────────────────────
export { default as ErrorBoundary } from './error/ErrorBoundary';
export { PageErrorBoundary } from './error/PageErrorBoundary';


