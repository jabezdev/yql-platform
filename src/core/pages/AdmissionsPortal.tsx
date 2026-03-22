import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthContext } from "../providers/AuthProvider";
import { useToast } from "../providers/ToastProvider";
import { FileUp, Send, CheckCircle2, Clock, CalendarDays, Activity } from "lucide-react";
import { format, isPast } from "date-fns";
import InterviewBooking from "../components/applicant/InterviewBooking";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";

export default function AdmissionsPortal() {
    const { user } = useAuthContext();
    const { toast } = useToast();
    const availableCohorts = useQuery(api.cohorts.getAvailable) || [];
    const allCohorts = useQuery(api.cohorts.getAll) || [];
    const myApplications = useQuery(api.applications.getApplicationsForUser, user ? { userId: user._id as Id<"users"> } : "skip") || [];

    const latestApplication = myApplications[myApplications.length - 1];

    // Form stuff
    const [selectedCohortId, setSelectedCohortId] = useState<Id<"cohorts"> | "">("");
    const form = useQuery(api.forms.getFormForCohort, selectedCohortId ? { cohortId: selectedCohortId as Id<"cohorts"> } : "skip");
    const submitResponse = useMutation(api.forms.submitResponse);
    const createApplication = useMutation(api.applications.createApplication);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

    const handleValueChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleFileUpload = async (fieldId: string, file: File) => {
        if (!file) return;
        setUploadingFields(prev => ({ ...prev, [fieldId]: true }));
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            handleValueChange(fieldId, storageId);
        } catch (err) {
            console.error("Upload failed", err);
            toast("File upload failed. Please try again.", "error");
        } finally {
            setUploadingFields(prev => ({ ...prev, [fieldId]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCohortId || !user) return;

        setIsSubmitting(true);
        try {
            const applicationId = await createApplication({
                userId: user._id as Id<"users">,
                cohortId: selectedCohortId as Id<"cohorts">
            });

            const responses = Object.entries(formValues).map(([fieldId, value]) => ({ fieldId, value }));
            await submitResponse({ applicationId, formId: form!._id, responses });

            toast("Application submitted successfully!", "success");
            setSelectedCohortId("");
            setFormValues({});
        } catch (error) {
            console.error("Failed to submit application", error);
            toast("Failed to submit. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Pipeline Logic
    const steps = [
        { key: "submitted", label: "Application Submitted" },
        { key: "round1", label: "Round 1 Review" },
        { key: "round2", label: "Skills Assessment" },
        { key: "round3", label: "Live Interview" },
        { key: "accepted", label: "Decision" }
    ];

    const getStepIndex = (status?: string) => {
        if (!status) return -1;
        if (status === "accepted" || status === "rejected") return 4;
        if (status === "round3") return 3;
        if (status === "round2") return 2;
        if (status === "round1") return 1;
        return 0; // "submitted"
    };

    const currentStepIndex = getStepIndex(latestApplication?.status);

    // Determine which cohort to show dates for
    const displayCohort = latestApplication
        ? allCohorts.find(c => c._id === latestApplication.cohortId)
        : (allCohorts.find(c => c.status === "active") ?? availableCohorts[0] ?? null);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <PageHeader
                title="Admissions Portal"
                subtitle="Track your application pipeline and next steps."
                className="mb-8"
            />

            {/* PIPELINE TRACKER */}
            {latestApplication && (
                <div className="bg-white p-6 md:p-8 border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] mb-8">
                    <div className="relative">
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-brand-bgLight/80 border border-brand-blue/10">
                            <div
                                style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${latestApplication.status === "rejected" ? "bg-brand-red" : "bg-brand-green"
                                    }`}
                            />
                        </div>
                        <div className="flex justify-between w-full mt-2">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step.key} className="flex flex-col items-center flex-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center -mt-9 border-2 border-brand-blue shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] transition-colors duration-300 ${latestApplication.status === "rejected" && isCurrent ? "bg-brand-red text-white" :
                                            isCompleted ? "bg-brand-green text-brand-blue" : "bg-white text-brand-blue/40"
                                            }`}>
                                            {isCompleted && idx < currentStepIndex ? <CheckCircle2 size={16} strokeWidth={3} /> : <span className="text-xs font-extrabold">{idx + 1}</span>}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs mt-4 text-center px-1 ${isCurrent ? 'font-extrabold text-brand-blue uppercase tracking-widest' : 'text-brand-darkBlue/50 font-bold uppercase tracking-widest'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* DYNAMIC ACTION PANEL */}
                    {!latestApplication ? (
                        <div className="bg-white p-6 md:p-8 border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] mb-6">
                            <h2 className="text-2xl font-display font-extrabold text-brand-blue mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-lg bg-brand-lightBlue/10 border-2 border-brand-blue flex items-center justify-center">
                                    <FileUp className="text-brand-lightBlue" size={20} strokeWidth={2.5} />
                                </span>
                                Start Application
                            </h2>
                            <div className="space-y-4 mb-8 p-6 bg-brand-bgLight border-2 border-brand-blue/10 rounded-xl">
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/50 mb-2">Select an open cohort:</label>
                                <select
                                    className="w-full p-3 bg-white border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] transition-all outline-none font-bold text-brand-blue appearance-none"
                                    value={selectedCohortId}
                                    onChange={(e) => setSelectedCohortId(e.target.value as Id<"cohorts">)}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="">-- Choose a Cohort --</option>
                                    {availableCohorts.map((c: any) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedCohortId && form && (
                                <div className="space-y-6 pt-8 border-t-2 border-brand-blue/10 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-brand-yellow/10 p-6 rounded-xl border-l-4 border-brand-yellow">
                                        <h3 className="text-xl font-display font-extrabold text-brand-blue">{form.title}</h3>
                                        <p className="text-brand-darkBlue/80 text-sm font-medium mt-2">{form.description}</p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-8 mt-8">
                                        {form.fields.map((field: any, index: number) => (
                                            <div key={field.id} className="space-y-3 relative pl-10">
                                                <div className="absolute left-0 top-0 w-6 h-6 rounded bg-brand-blue text-white font-bold flex items-center justify-center text-xs">
                                                    {index + 1}
                                                </div>
                                                <label className="block text-sm font-extrabold text-brand-blue border-b-2 border-brand-blue/10 pb-2">
                                                    {field.label} {field.required && <span className="text-brand-red ml-1">*</span>}
                                                </label>
                                                {field.type === 'text' && (
                                                    <input type="text" required={field.required} value={formValues[field.id] || ""} onChange={(e) => handleValueChange(field.id, e.target.value)} className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-medium text-brand-blue" />
                                                )}
                                                {field.type === 'textarea' && (
                                                    <textarea required={field.required} value={formValues[field.id] || ""} onChange={(e) => handleValueChange(field.id, e.target.value)} rows={4} className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-medium text-brand-blue resize-y custom-scrollbar" />
                                                )}
                                                {field.type === 'select' && (
                                                    <select required={field.required} value={formValues[field.id] || ""} onChange={(e) => handleValueChange(field.id, e.target.value)} className="w-full p-3 bg-brand-bgLight/50 border-2 border-brand-blue/20 rounded-lg focus:ring-0 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] focus:bg-white transition-all outline-none font-bold text-brand-blue appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                                                        <option value="">-- Select an option --</option>
                                                        {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                )}
                                                {field.type === 'file' && (
                                                    <div className="border-2 border-dashed border-brand-blue/30 rounded-xl p-8 flex flex-col items-center justify-center bg-brand-bgLight/30 hover:bg-brand-bgLight/80 hover:border-brand-blue transition-colors group cursor-pointer relative overflow-hidden">
                                                        <div className="w-12 h-12 rounded-full bg-brand-lightBlue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                            <FileUp className="text-brand-lightBlue" size={24} strokeWidth={2.5} />
                                                        </div>
                                                        <p className="font-bold text-brand-blue">Upload PDF document</p>
                                                        <p className="text-xs text-brand-darkBlue/50 mt-1 font-medium">Max 5MB</p>
                                                        <input type="file" accept=".pdf" required={field.required && !formValues[field.id]} onChange={(e) => { if (e.target.files && e.target.files[0]) { handleFileUpload(field.id, e.target.files[0]); } }} disabled={uploadingFields[field.id]} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed" />
                                                        {formValues[field.id] && !uploadingFields[field.id] && <div className="mt-4 px-3 py-1.5 bg-brand-green/20 border border-brand-green/40 rounded-md text-xs text-brand-blue font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"><CheckCircle2 size={14} className="text-brand-green" /> File ready</div>}
                                                        {uploadingFields[field.id] && <div className="mt-4 px-3 py-1.5 bg-brand-yellow/20 border border-brand-yellow/40 rounded-md text-xs text-brand-blue font-bold flex items-center gap-2 animate-pulse"><Activity size={14} className="text-brand-yellow" /> Uploading...</div>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t-2 border-brand-blue/10">
                                            <Button type="submit" disabled={isSubmitting} variant="geometric-primary" className="w-full py-4 text-lg justify-center disabled:opacity-50 disabled:shadow-[4px_4px_0px_0px_rgba(10,22,48,0.45)] disabled:translate-y-0 disabled:translate-x-0">
                                                {isSubmitting ? "Submitting..." : <><Send size={18} strokeWidth={2.5} className="mr-2" /> Submit Application</>}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {latestApplication.status === "round3" && (
                                <div className="bg-white p-6 md:p-8 border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                                    <h2 className="text-2xl font-display font-extrabold mb-6 flex items-center gap-3 relative z-10 text-brand-blue">
                                        <span className="p-2 bg-brand-green/20 border-2 border-brand-blue rounded-lg shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)]">
                                            <CalendarDays className="text-brand-blue" size={24} />
                                        </span>
                                        Book Interview
                                    </h2>
                                    <InterviewBooking applicationId={latestApplication._id} />
                                </div>
                            )}

                            {latestApplication.status !== "round3" && (
                                <div className="bg-white p-8 md:p-12 border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,103,153,0.05)_0%,transparent_70%)] pointer-events-none" />
                                    <div className="w-20 h-20 bg-brand-yellow/20 rounded-tl-xl rounded-br-xl border-2 border-brand-blue flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] relative z-10">
                                        <Clock className="text-brand-blue" size={36} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-3xl font-display font-extrabold text-brand-blue mb-4 relative z-10">Application Under Review</h3>
                                    <p className="text-brand-darkBlue/70 font-medium max-w-md relative z-10 text-lg">We've received your application. The review team will reach out to you with next steps as soon as decisions are made.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* RIGHT SIDEBAR */}
                    <div className="bg-white p-8 border-2 border-brand-blue rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] sticky top-8">
                        <div className="mb-8 p-6 bg-brand-bgLight border-2 border-brand-blue/10 rounded-xl shadow-inner">
                            <h3 className="font-display font-extrabold mb-6 text-brand-blue flex items-center gap-3 text-xl">
                                <span className="bg-white p-1.5 rounded-lg border-2 border-brand-blue/20 shadow-sm"><Activity className="w-5 h-5 text-brand-lightBlue" /></span> Action Checklist
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4 text-sm items-center p-2 rounded-lg hover:bg-white transition-colors">
                                    <span className="bg-brand-green/20 text-brand-green p-1 rounded border border-brand-green/30"><CheckCircle2 size={20} strokeWidth={3} /></span>
                                    <span className="text-brand-blue font-bold text-base">Create Account</span>
                                </li>
                                <li className="flex gap-4 text-sm items-center p-2 rounded-lg hover:bg-white transition-colors">
                                    {currentStepIndex > 0 ? <span className="bg-brand-green/20 text-brand-green p-1 rounded border border-brand-green/30"><CheckCircle2 size={20} strokeWidth={3} /></span> : <div className="w-6 h-6 border-2 border-brand-blue/30 rounded-sm shrink-0 ml-1 mr-1.5" />}
                                    <span className={currentStepIndex > 0 ? "text-brand-blue font-bold text-base" : "text-brand-lightBlue font-bold text-base"}>Submit Application</span>
                                </li>
                                <li className="flex gap-4 text-sm items-center p-2 rounded-lg hover:bg-white transition-colors">
                                    {currentStepIndex >= 3 ? <span className="bg-brand-green/20 text-brand-green p-1 rounded border border-brand-green/30"><CheckCircle2 size={20} strokeWidth={3} /></span> : <div className="w-6 h-6 border-2 border-brand-blue/30 rounded-sm shrink-0 ml-1 mr-1.5" />}
                                    <span className={currentStepIndex >= 3 ? "text-brand-blue font-bold text-base" : "text-brand-blue/50 font-medium text-base"}>Attend Interview</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 border-2 border-brand-blue/10 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/10 rounded-full blur-xl group-hover:bg-brand-yellow/20 transition-colors" />
                            <h3 className="font-display font-extrabold mb-5 text-brand-blue flex items-center gap-2 relative z-10 text-lg">
                                <CalendarDays className="text-brand-yellow" size={20} /> Important Dates
                            </h3>
                            <div className="space-y-3 relative z-10">
                                {!displayCohort ? (
                                    <p className="text-sm text-brand-blue/40 italic font-medium">No upcoming cohorts at this time. Check back soon.</p>
                                ) : (
                                    <>
                                        {displayCohort.name && (
                                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue/40 mb-2">{displayCohort.name}</p>
                                        )}
                                        <div className="border-l-4 border-brand-lightBlue pl-4 py-2 bg-gradient-to-r from-brand-lightBlue/5 to-transparent rounded-r-lg">
                                            <p className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest mb-1">Applications Close</p>
                                            <p className="text-sm font-bold text-brand-blue">
                                                {isPast(displayCohort.applicationEndDate)
                                                    ? <span className="text-brand-red">Closed</span>
                                                    : format(displayCohort.applicationEndDate, "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="border-l-4 border-brand-green pl-4 py-2 bg-gradient-to-r from-brand-green/5 to-transparent rounded-r-lg">
                                            <p className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest mb-1">Term Begins</p>
                                            <p className="text-sm font-bold text-brand-blue">{format(displayCohort.termStartDate, "MMMM d, yyyy")}</p>
                                        </div>
                                        <div className="border-l-4 border-brand-yellow pl-4 py-2 bg-gradient-to-r from-brand-yellow/10 to-transparent rounded-r-lg">
                                            <p className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest mb-1">Term Ends</p>
                                            <p className="text-sm font-bold text-brand-blue">{format(displayCohort.termEndDate, "MMMM d, yyyy")}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
