import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { Input, Textarea, Select, Checkbox, RadioGroup, Toggle } from '@/design';
import { DateInput, TimeInput, DateTimeInput, DateRangeInput, TimeSlotPicker } from '@/design';
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
    const [selectVal, setSelectVal] = useState('');

    // Date / time state
    const [dateVal, setDateVal] = useState('2026-04-05');
    const [timeVal, setTimeVal] = useState('14:00');
    const [dtDate, setDtDate] = useState('2026-04-05');
    const [dtTime, setDtTime] = useState('10:30');
    const [rangeStart, setRangeStart] = useState('2026-04-01');
    const [rangeEnd, setRangeEnd] = useState('2026-04-30');
    const [slot, setSlot] = useState('10:00 AM');
    // Dark date / time state
    const [darkDateVal, setDarkDateVal] = useState('2026-04-05');
    const [darkTimeVal, setDarkTimeVal] = useState('14:00');
    const [darkRangeStart, setDarkRangeStart] = useState('2026-04-01');
    const [darkRangeEnd, setDarkRangeEnd] = useState('2026-04-30');

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
                    <Textarea label="Bio" placeholder="Tell us about yourself…" rows={4} />
                </Box>
                <Box>
                    <Meta>Select</Meta>
                    <Select
                        label="Committee"
                        value={selectVal}
                        onChange={setSelectVal}
                        options={[
                            { label: 'Technical', value: 'Technical' },
                            { label: 'Creative', value: 'Creative' },
                            { label: 'Operations', value: 'Operations' }
                        ]}
                    />
                </Box>
            </Grid>

            <Grid cols={2} className="mb-6">
                <Box>
                    <Meta>Checkbox</Meta>
                    <div className="space-y-2.5 mb-5">
                        {(['Receive email updates', 'Notify on new events', 'Weekly digest'] as const).map((label) => (
                            <Checkbox 
                                key={label} 
                                label={label} 
                                checked={checkboxStates[label]} 
                                onChange={(c) => setCheckboxStates(prev => ({ ...prev, [label]: c }))} 
                            />
                        ))}
                    </div>
                    <Meta>Radio</Meta>
                    <RadioGroup
                        value={cohort}
                        onChange={setCohort}
                        options={[
                            { label: 'Cohort 1', value: 'Cohort 1' },
                            { label: 'Cohort 2', value: 'Cohort 2' },
                            { label: 'Cohort 3', value: 'Cohort 3' },
                        ]}
                    />
                </Box>
                <Box>
                    <Meta>Toggle / Switch</Meta>
                    <div className="space-y-4">
                        {(['Email notifications', 'Public profile', 'Two-factor auth'] as const).map((label) => (
                            <Toggle
                                key={label}
                                label={label}
                                checked={toggleStates[label]}
                                onChange={(c) => setToggleStates(prev => ({ ...prev, [label]: c }))}
                            />
                        ))}
                        <p className="text-[10px] text-brand-blue/70 pt-2 border-t border-brand-blue/8 leading-relaxed">
                            On: <code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue</code> · Off: <code className="font-mono bg-brand-bgLight px-1 rounded">bg-brand-blue/20</code>.
                        </p>
                    </div>
                </Box>
            </Grid>

            {/* ── Date and Time ── */}
            <Meta>Date &amp; Time Inputs</Meta>
            <Callout>
                All date and time inputs use portal-rendered custom popovers — calendar and clock render into <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">document.body</code> via <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">createPortal</code> so they're never clipped. Every field also accepts manual text entry — type a date (<code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">Apr 5, 2026</code> · <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">04/05/2026</code> · <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">2026-04-05</code>) or time (<code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">2:30 PM</code> · <code className="font-mono text-[10px] bg-brand-blue/8 px-1 rounded">14:30</code>) and press Enter or blur to commit.
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
                        <Meta>DateRangeInput — shared calendar</Meta>
                        <DateRangeInput
                            label="Cohort window"
                            startValue={rangeStart}
                            endValue={rangeEnd}
                            onStartChange={setRangeStart}
                            onEndChange={setRangeEnd}
                        />
                        <p className="text-[10px] text-brand-blue/65 mt-2 leading-relaxed">
                            Click start → click end on one calendar. Focuses the correct phase automatically.
                        </p>
                    </div>
                </Box>
            </Grid>

            {/* Dark mode date/time */}
            <Grid cols={2} className="mb-5">
                <Box dark>
                    <Meta light>DateInput + TimeInput — dark</Meta>
                    <div className="space-y-4">
                        <DateInput dark label="Interview Date" value={darkDateVal} onChange={setDarkDateVal} />
                        <TimeInput dark label="Start Time" value={darkTimeVal} onChange={setDarkTimeVal} />
                    </div>
                </Box>
                <Box dark>
                    <Meta light>DateRangeInput — dark</Meta>
                    <DateRangeInput
                        dark
                        label="Cohort window"
                        startValue={darkRangeStart}
                        endValue={darkRangeEnd}
                        onStartChange={setDarkRangeStart}
                        onEndChange={setDarkRangeEnd}
                    />
                    <p className="text-[10px] text-white/60 mt-2 leading-relaxed">
                        Dark popovers: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-blue</code> · selected uses <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow text-brand-blue</code>. Range fill: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow/15</code>.
                    </p>
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
                <p className="text-[10px] text-brand-blue/65 mt-3 leading-relaxed">
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
                        <Input dark label="Full Name" placeholder="Enter your name…" />
                        {/* Dark textarea */}
                        <Textarea dark label="Bio" placeholder="Tell us about yourself…" rows={2} />
                        <p className="text-[10px] text-white/65 leading-relaxed">
                            Dark inputs: <code className="font-mono bg-white/10 px-1 rounded">bg-white/10</code> · <code className="font-mono bg-white/10 px-1 rounded">border-white/20</code> · white text.
                        </p>
                    </div>
                </Box>
                <Box dark>
                    <Meta light>Controls on dark background</Meta>
                    {/* Dark checkboxes */}
                    <div className="space-y-2.5 mb-4">
                        {['Receive updates', 'Notify on events'].map((label, i) => (
                            <Checkbox 
                                key={label}
                                label={label}
                                dark
                                checked={i === 0 ? darkCheck : !darkCheck}
                                onChange={(c) => i === 0 && setDarkCheck(c)}
                            />
                        ))}
                    </div>
                    {/* Dark radio */}
                    <div className="space-y-2.5 mb-4 pt-3 border-t border-white/10">
                        <RadioGroup
                            dark
                            value={darkCohort}
                            onChange={setDarkCohort}
                            options={[
                                { label: 'Cohort 1', value: 'Cohort 1' },
                                { label: 'Cohort 2', value: 'Cohort 2' },
                                { label: 'Cohort 3', value: 'Cohort 3' },
                            ]}
                        />
                    </div>
                    {/* Dark toggle */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <Toggle
                            label="Dark mode active"
                            dark
                            checked={darkToggle}
                            onChange={setDarkToggle}
                            className="w-full"
                        />
                    </div>
                    <p className="text-[10px] text-white/65 leading-relaxed mt-3">
                        Dark checked: <code className="font-mono bg-white/10 px-1 rounded">border-brand-yellow</code> + yellow fill/dot. Toggle on: <code className="font-mono bg-white/10 px-1 rounded">bg-brand-yellow</code>.
                    </p>
                </Box>
            </Grid>
        </Section>
    );
}
