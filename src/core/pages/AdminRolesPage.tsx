import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PageHeader } from "../components/ui/PageHeader";
import { isStaff as checkStaff } from "../constants/roles";
import type { Role } from "../constants/roles";

export default function AdminRolesPage() {
    const users = useQuery(api.admin.getAllUsers) || [];
    const updateRole = useMutation(api.hr.updateStaffRole);

    return (
        <div className="space-y-6">
            <PageHeader
                title="User Roles & Access"
                subtitle="Manage system permissions and sub-roles for all members."
                size="sm"
            />

            <div className="bg-white border-2 border-brand-blueDark shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] rounded-tl-2xl rounded-br-2xl overflow-hidden">
                <div className="grid gap-0 divide-y-2 divide-brand-blueDark">
                    {users.map((user: any) => (
                        <div key={user._id} className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-brand-bgLight transition-colors">
                            <div className="mb-4 md:mb-0">
                                <p className="font-extrabold font-display text-brand-blueDark text-lg">{user.name}</p>
                                <p className="text-sm text-brand-darkBlue/70 font-medium">{user.email}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex flex-col w-full sm:w-auto">
                                    <span className="text-[10px] font-extrabold text-brand-blueDark/50 uppercase tracking-widest mb-1.5 ml-1">Primary Role</span>
                                    <select
                                        className="p-2 border-2 border-brand-blueDark/20 focus:border-brand-blueDark focus:shadow-[2px_2px_0px_0px_rgba(57,103,153,0.3)] transition-all rounded-lg text-sm bg-brand-bgLight/50 outline-none focus:ring-0 font-bold text-brand-blueDark cursor-pointer appearance-none min-w-[140px]"
                                        value={user.role}
                                        onChange={(e) => updateRole({ userId: user._id, role: e.target.value as any })}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%231B3B5C' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.2rem' }}
                                    >
                                        <option value="Applicant">Applicant</option>
                                        <option value="T5">T5 — Volunteer</option>
                                        <option value="T4">T4 — Associate</option>
                                        <option value="T3">T3 — Coordinator</option>
                                        <option value="T2">T2 — Manager</option>
                                        <option value="T1">T1 — Director</option>
                                        <option value="Super Admin">Super Admin</option>
                                    </select>
                                </div>
                                {checkStaff(user.role as Role) ? (
                                    <div className="flex flex-col w-full sm:w-auto">
                                        <span className="text-[10px] font-extrabold text-brand-blue/50 uppercase tracking-widest mb-1.5 ml-1">Special Designations</span>
                                        <select
                                            className="p-2 border-2 border-brand-blue/20 focus:border-brand-blue focus:shadow-[2px_2px_0px_0px_rgba(37,99,235,0.3)] transition-all rounded-lg text-sm bg-brand-blue/5 outline-none focus:ring-0 font-bold text-brand-blue cursor-pointer appearance-none min-w-[140px]"
                                            value={user.specialRoles?.includes("Alumni") ? "Alumni" : user.specialRoles?.includes("Evaluator") ? "Reviewer" : "Regular"}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const specialRoles = val === "Alumni" ? ["Alumni"] : val === "Reviewer" ? ["Evaluator"] : [];
                                                updateRole({ userId: user._id, specialRoles: specialRoles as any });
                                            }}
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 7l5 5 5-5'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', paddingRight: '2.2rem' }}
                                        >
                                            <option value="Regular">Regular Staff</option>
                                            <option value="Reviewer">Staff Reviewer</option>
                                            <option value="Alumni">Full Alumni</option>
                                        </select>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <p className="text-center text-brand-blueDark/50 py-12 font-bold bg-brand-bgLight/30">No users found in the system yet.</p>}
                </div>
            </div>
        </div>
    );
}
