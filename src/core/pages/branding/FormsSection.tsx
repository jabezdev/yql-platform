import { useState } from 'react';
import { FileText, Search, Check, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { DateInput, TimeInput, DateTimeInput, DateRangeInput, TimeSlotPicker } from '../../components/ui/DateTimePicker';
import { Section, Meta, Box, Grid, Callout } from './shared';

export default function FormsSection() {
    const [inputVal, setInputVal] = useState('');
    const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({
        'Receive email updates': true,
        'Notify on new events': false,
        'Weekly digest': false,
    });
    const [cohort, setCohort] = useState('Cohort 1');
    const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
        'Email notifications': true,
        'Public profile': false,
        'Two-factor auth': true,
    });
    const [darkToggle, setDarkToggle] = useState(true);
    const [darkCheck, setDarkCheck] = useState(true);
    const [darkCohort, setDarkCohort] = useState('Cohort 1');
    const [selectOpen, setSelectOpen] = useState(false);
    const [selectVal, setSelectVal] = useState('');

    // Date / time state
    const [dateVal, setDateVal] = useState('2026-04-05');
    const [timeVal, setTimeVal] = useState('14:00');
    const [dtDate, setDtDate] = useState('2026-04-05');
    const [dtTime, setDtTime] = useState('10:30');
    const [rangeStart, setRangeStart] = useState('2026-04-01');
    const [rangeEnd, setRangeEnd] = useState('2026-04-30');
    const [slot, setSlot] = useState('10:00 AM');

    const ALL_SLOTS = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM'];
    const BOOKED_SLOTS = ['9:30 AM', '10:30 AM', '1:00 PM'];

    return (
        <Section id="forms" title="Forms" icon={FileText}>
            <Callout>
                One consistent input style across all controls. Error states use <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">brand-wine</code> (form validation) — not red (destructive). Focus ring is always blue. Always pair every control with a visible label.
            </Callout>

            <Meta>Text Input — states</Meta>
            <Grid cols={2} className="mb-6">
                <div><Meta>Default</Meta><Input placeholder="Placeholder text…" /></div>
                <div><Meta>With label</Meta><Input label="Full Name" placeholder="Enter your name…" /></div>
                <div><Meta>Required</Meta><Input label="Email Address" placeholder="you@example.com" required /></div>
                <div><Meta>With icon</Meta><Input label="Search" placeholder="Search members…" icon={Search} /></div>
                <div>
                    <Meta>Error state</Meta>
                    <Input label="Password" type="password" value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        error="Password must be at least 8 characters." required />
                </div>
                <div><Meta>Disabled</Meta><Input label="Read-only field" value="Cannot be changed" disabled /></div>
            </Grid>

            <Grid cols={2} className="mb-6">
                <Box>
                    <Meta>Textarea</Meta>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-1.5">Bio</label>
                    <textarea rows={4} placeholder="Tell us about yourself…"
                        className="w-full px-3 py-2.5 text-sm border-2 border-brand-blue/25 rounded-tl-lg rounded-br-lg bg-white text-brand-blue placeholder-brand-blue/35 resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-lightBlue transition-[border-color,box-shadow] duration-150" />
                </Box>
                <Box>
                    <Meta>Select</Meta>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-brand-blue/70 mb-1.5">Committee</label>
                    <div className="relative">
                        <button
                            onClick={() => setSelectOpen(o => !o)}
                            onBlur={() => setTimeout(() => setSelectOpen(false), 150)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm border-2 rounded-tl-lg rounded-br-lg bg-white transition-[border-color,box-shadow] duration-150 focus:outline-none ${selectOpen ? 'border-brand-lightBlue ring-2 ring-brand-blue/20' : 'border-brand-blue/25'}`}
                        >
                            <span className={selectVal ? 'text-brand-blue' : 'text-brand-blue/40'}>{selectVal || 'Select a committee…'}</span>
                            <ChevronDown size={14} className={`text-brand-blue/50 transition-transform duration-150 flex-shrink-0 ${selectOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>
                        {selectOpen && (
                            <div className="absolute top-full mt-1 w-full bg-white border-2 border-brand-blue/15 rounded-tl-xl rounded-br-xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] overflow-hidden z-10">
                                {['Technical', 'Creative', 'Operations'].map(opt => (
                                    <button key={opt}
                                        onMouseDown={() => { setSelectVal(opt); setSelectOpen(false); }}
                                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-brand-bgLight ${selectVal === opt ? 'text-brand-blue font-bold bg-brand-bgLight/60' : 'text-brand-blue/75'}`}
                                    >
                                        {opt}
                                        {selectVal === opt && <Check size={12} className="inline ml-2 text-brand-blue" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Box>
            </Grid>

            <Grid cols={2} className="mb-6">
                <Box>
                    <Meta>Checkbox</Meta>
                    <div className="space-y-2.5 mb-5">
                        {(['Receive email updates', 'Notify on new events', 'Weekly digest'] as const).map((label) => (
                            <button key={label}
                                role="checkbox"
                                aria-checked={checkboxStates[label]}
                                onClick={() => setCheckboxStates(prev => ({ ...prev, [label]: !prev[label] }))}
                                className="flex items-center gap-2.5 cursor-pointer group w-full text-left">
                                <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${checkboxStates[label] ? 'bg-brand-blue border-brand-blue' : 'border-brand-blue/25 bg-white group-hover:border-brand-lightBlue'}`}>
                                    {checkboxStates[label] && <Check size={10} strokeWidth={3.5} className="text-white" aria-hidden="true" />}
                                </span>
                                <span className="text-sm text-brand-blue/75 group-hover:text-brand-blue transition-colors">{label}</span>
                            </button>
                        ))}
                    </div>
                    <Meta>Radio</Meta>
                    <div className="space-y-2.5">
                        {['Cohort 1', 'Cohort 2', 'Cohort 3'].map((label) => (
                            <button key={label}
                                role="radio"
                                aria-checked={cohort === label}
                                onClick={() => setCohort(label)}
                                className="flex items-center gap-2.5 cursor-pointer group w-full text-left">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${cohort === label ? 'border-brand-blue' : 'border-brand-blue/25 bg-white group-hover:border-brand-lightBlue'}`}>
                                    {cohort === label && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
                                </span>
                                <span className="text-sm text-brand-blue/75 group-hover:text-brand-blue transition-colors">{label}</span>
                            </button>
                        ))}
                    </div>
                </Box>
                <Box>
                    <Meta>Toggle / Switch</Meta>
                    <div className="space-y-4">
                        {(['Email notifications', 'Public profile', 'Two-factor auth'] as const).map((label) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm text-brand-blue/75">{label}</span>
                                <button
                                    role="switch"
                                    aria-checked={toggleStates[label]}
                                    onClick={() => setToggleStates(prev => ({ ...prev, [label]: !prev[label] }))}
                                    className={`relative w-10 h-5 rounded-full p-0 overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 flex-shrink-0 ${toggleStates[label] ? 'bg-brand-blue' : 'bg-brand-blue/20'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${toggleStates[label] ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))}
                        <p className="text-[10px] text-brand-blue/55 pt-2 border-t border-brand-blue/8 leading-relaxed">
                            On: <code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue</code> · Off: <code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue/20</code>.
                        </p>
                    </div>
                </Box>
            </Grid>

            {/* ── Date and Time ── */}
            <Meta>Date &amp; Time Inputs</Meta>
            <Callout>
                Use <strong>DateInput</strong> / <strong>TimeInput</strong> for single fields, <strong>DateTimeInput</strong> for a combined pair, <strong>DateRangeInput</strong> for spans, and <strong>TimeSlotPicker</strong> for interview or booking flows.
                All inputs share the standard border-2 / focus ring style. Icons are decorative — always include a visible label.
            </Callout>

            <Grid cols={2} className="mb-5">
                <Box>
                    <Meta>DateInput + TimeInput</Meta>
                    <div className="space-y-4">
                        <DateInput label="Interview Date" value={dateVal} onChange={setDateVal} />
                        <TimeInput label="Start Time" value={timeVal} onChange={setTimeVal} />
                    </div>
                </Box>
                <Box>
                    <Meta>DateTimeInput — combined pair</Meta>
                    <DateTimeInput
                        label="Event starts"
                        dateValue={dtDate}
                        timeValue={dtTime}
                        onDateChange={setDtDate}
                        onTimeChange={setDtTime}
                    />
                    <div className="mt-4">
                        <Meta>DateRangeInput</Meta>
                        <DateRangeInput
                            label="Cohort window"
                            startValue={rangeStart}
                            endValue={rangeEnd}
                            onStartChange={setRangeStart}
                            onEndChange={setRangeEnd}
                        />
                    </div>
                </Box>
            </Grid>

            <Box className="mb-6">
                <Meta>TimeSlotPicker — for booking / interview scheduling</Meta>
                <TimeSlotPicker
                    label="Available slots — April 5"
                    slots={ALL_SLOTS}
                    value={slot}
                    onChange={setSlot}
                    disabledSlots={BOOKED_SLOTS}
                />
                <p className="text-[10px] text-brand-blue/45 mt-3 leading-relaxed">
                    Selected: <code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue text-white</code>.
                    Booked/unavailable: <code className="font-mono bg-brand-bgLight px-1 rounded">line-through opacity-25</code>.
                    Available: standard outline style.
                </p>
            </Box>

            {/* ── Dark mode form controls ── */}
            <Grid cols={2}>
                <Box dark>
                    <Meta light>Inputs on dark background</Meta>
                    <div className="space-y-3">
                        {/* Dark input */}
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-white/55 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your name…"
                                className="w-full px-3 py-2.5 text-sm border-2 border-white/20 rounded-tl-lg rounded-br-lg bg-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/40 transition-[border-color,box-shadow] duration-150"
                            />
                        </div>
                        {/* Dark textarea */}
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-white/55 mb-1.5">Bio</label>
                            <textarea rows={2} placeholder="Tell us about yourself…"
                                className="w-full px-3 py-2.5 text-sm border-2 border-white/20 rounded-tl-lg rounded-br-lg bg-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/40 transition-[border-color,box-shadow] duration-150" />
                        </div>
                        <p className="text-[10px] text-white/45 leading-relaxed">
                            Dark inputs: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10</code> · <code className="font-mono bg-white/10 px-1 rounded">border-white/20</code> · white text.
                        </p>
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Controls on dark background</Meta>
                    {/* Dark checkboxes */}
                    <div className="space-y-2.5 mb-4">
                        {['Receive updates', 'Notify on events'].map((label, i) => (
                            <button key={label}
                                role="checkbox"
                                aria-checked={i === 0 ? darkCheck : !darkCheck}
                                onClick={() => i === 0 && setDarkCheck(v => !v)}
                                className="flex items-center gap-2.5 cursor-pointer group w-full text-left">
                                <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${(i === 0 ? darkCheck : !darkCheck) ? 'bg-brand-yellow border-brand-yellow' : 'border-white/30 bg-white/10 group-hover:border-white/50'}`}>
                                    {(i === 0 ? darkCheck : !darkCheck) && <Check size={10} strokeWidth={3.5} className="text-brand-blue" aria-hidden="true" />}
                                </span>
                                <span className="text-sm text-white/75 group-hover:text-white transition-colors">{label}</span>
                            </button>
                        ))}
                    </div>
                    {/* Dark radio */}
                    <div className="space-y-2.5 mb-4 pt-3 border-t border-white/10">
                        {['Cohort 1', 'Cohort 2', 'Cohort 3'].map((label) => (
                            <button key={label}
                                role="radio"
                                aria-checked={darkCohort === label}
                                onClick={() => setDarkCohort(label)}
                                className="flex items-center gap-2.5 cursor-pointer group w-full text-left">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${darkCohort === label ? 'border-brand-yellow' : 'border-white/30 bg-white/10 group-hover:border-white/50'}`}>
                                    {darkCohort === label && <span className="w-2 h-2 rounded-full bg-brand-yellow" />}
                                </span>
                                <span className="text-sm text-white/75 group-hover:text-white transition-colors">{label}</span>
                            </button>
                        ))}
                    </div>
                    {/* Dark toggle */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-sm text-white/75">Dark mode active</span>
                        <button
                            role="switch"
                            aria-checked={darkToggle}
                            onClick={() => setDarkToggle(v => !v)}
                            className={`relative w-10 h-5 rounded-full p-0 overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 flex-shrink-0 ${darkToggle ? 'bg-brand-yellow' : 'bg-white/20'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${darkToggle ? 'bg-brand-blue translate-x-5' : 'bg-white translate-x-0'}`} />
                        </button>
                    </div>
                    <p className="text-[10px] text-white/45 leading-relaxed mt-3">
                        Dark checked: <code className="font-mono bg-white/10 px-1 rounded">border-brand-yellow</code> + yellow fill/dot. Toggle on: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow</code>.
                    </p>
                </Box>
            </Grid>
        </Section>
    );
}
