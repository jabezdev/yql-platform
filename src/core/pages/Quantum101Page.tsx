import { useState } from "react";
import { Atom, ChevronRight, ChevronDown, Zap, Binary, GitBranch, Cpu, FlaskConical, ExternalLink } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";

interface Module {
    id: string;
    title: string;
    icon: React.ReactNode;
    summary: string;
    content: string;
    keyTerms: { term: string; definition: string }[];
    readMore?: { label: string; url: string };
}

const MODULES: Module[] = [
    {
        id: "superposition",
        title: "Superposition",
        icon: <Zap size={20} className="text-brand-yellow" />,
        summary: "A qubit can exist in multiple states simultaneously until measured.",
        content: `In classical computing, a bit is always either 0 or 1. A qubit, however, can exist in a **superposition** of both 0 and 1 at the same time — represented mathematically as α|0⟩ + β|1⟩, where α and β are complex probability amplitudes.

When we measure a qubit, its superposition **collapses** to either 0 or 1 with probabilities |α|² and |β|² respectively. This ability to be in multiple states simultaneously is what gives quantum computers their potential for parallelism.`,
        keyTerms: [
            { term: "Qubit", definition: "The basic unit of quantum information — a two-level quantum system." },
            { term: "State vector", definition: "A mathematical description of a qubit's quantum state, written as α|0⟩ + β|1⟩." },
            { term: "Collapse", definition: "When measurement forces a quantum system into a definite classical state." },
        ],
    },
    {
        id: "entanglement",
        title: "Entanglement",
        icon: <GitBranch size={20} className="text-brand-blue" />,
        summary: "Two qubits can be correlated such that measuring one instantly determines the other.",
        content: `Quantum entanglement is a phenomenon where two or more qubits become **correlated** in such a way that the quantum state of each cannot be described independently. Measuring one qubit instantly determines the state of the other, regardless of the physical distance between them.

A classic example is the Bell state: (|00⟩ + |11⟩)/√2. If you measure the first qubit and get 0, the second is guaranteed to be 0 too — and vice versa.

Entanglement is a key resource in quantum algorithms, quantum teleportation, and quantum cryptography.`,
        keyTerms: [
            { term: "Bell state", definition: "A maximally entangled two-qubit state, e.g. (|00⟩ + |11⟩)/√2." },
            { term: "Non-locality", definition: "Entangled systems show correlations that cannot be explained by local hidden variables." },
            { term: "EPR pair", definition: "An entangled pair of qubits first described by Einstein, Podolsky, and Rosen." },
        ],
    },
    {
        id: "interference",
        title: "Quantum Interference",
        icon: <Binary size={20} className="text-brand-green" />,
        summary: "Quantum algorithms amplify correct answers and cancel wrong ones via wave-like interference.",
        content: `Like waves on water, quantum states can **constructively** or **destructively** interfere. Quantum algorithms are engineered to amplify probability amplitudes for correct answers and cancel amplitudes for wrong answers.

Grover's search algorithm, for example, uses interference to find an item in an unsorted list of N items in O(√N) steps instead of O(N) classically.

Interference is what makes quantum algorithms potentially more powerful than classical ones — it is not just parallelism, but directed amplification.`,
        keyTerms: [
            { term: "Constructive interference", definition: "Amplitudes add together, increasing the probability of a state." },
            { term: "Destructive interference", definition: "Amplitudes cancel, reducing or eliminating the probability of a state." },
            { term: "Phase", definition: "The angular component of a complex amplitude, crucial for interference effects." },
        ],
    },
    {
        id: "gates",
        title: "Quantum Gates",
        icon: <Cpu size={20} className="text-brand-wine" />,
        summary: "Quantum gates are unitary operations that transform qubits — the building blocks of quantum circuits.",
        content: `Quantum gates are analogous to classical logic gates, but they operate on qubits and must be **reversible** (unitary). Common gates include:

- **Hadamard (H)**: puts a qubit into equal superposition
- **Pauli-X**: flips |0⟩ to |1⟩ and vice versa (quantum NOT gate)
- **CNOT**: flips the target qubit if the control qubit is |1⟩
- **T gate**: applies a phase shift of π/4

Quantum circuits are sequences of gates applied to qubits, ending in a measurement. Unlike classical circuits, all gates are reversible except measurement.`,
        keyTerms: [
            { term: "Hadamard gate", definition: "Creates equal superposition: H|0⟩ = (|0⟩+|1⟩)/√2." },
            { term: "CNOT gate", definition: "Controlled-NOT gate — entangles two qubits, fundamental for universal quantum computing." },
            { term: "Unitary matrix", definition: "A matrix U where U†U = I — all quantum gates must be unitary." },
        ],
    },
    {
        id: "algorithms",
        title: "Key Quantum Algorithms",
        icon: <FlaskConical size={20} className="text-brand-blue" />,
        summary: "Shor's, Grover's, and VQE are landmark algorithms demonstrating quantum advantage.",
        content: `Several quantum algorithms show provable or expected speedups over classical counterparts:

**Shor's Algorithm** (1994) — Factors large integers in polynomial time, threatening RSA encryption. Classically this is believed to be exponentially hard.

**Grover's Algorithm** (1996) — Searches an unsorted database in O(√N) queries, vs. O(N) classically. Provides a quadratic speedup.

**VQE (Variational Quantum Eigensolver)** — A hybrid classical-quantum algorithm for approximating the ground state energy of molecules. Key for quantum chemistry applications.

**QAOA (Quantum Approximate Optimization Algorithm)** — Targets combinatorial optimization problems on near-term devices.`,
        keyTerms: [
            { term: "Quantum advantage", definition: "When a quantum algorithm solves a problem faster than any known classical algorithm." },
            { term: "Polynomial time", definition: "An algorithm whose runtime grows as a polynomial function of input size." },
            { term: "NISQ", definition: "Noisy Intermediate-Scale Quantum — current-era devices with ~50–1000 qubits and significant noise." },
        ],
        readMore: { label: "IBM Quantum Learning", url: "https://learning.quantum.ibm.com/" },
    },
];

function ModuleCard({ mod }: { mod: Module }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`bg-white border-2 border-brand-blueDark rounded-tl-2xl rounded-br-2xl shadow-[4px_4px_0px_0px_rgba(57,103,153,0.15)] transition-all ${open ? "shadow-[4px_4px_0px_0px_rgba(57,103,153,0.6)]" : "hover:shadow-[4px_4px_0px_0px_rgba(57,103,153,0.5)] hover:-translate-y-0.5"}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left p-5 flex items-start gap-4"
            >
                <div className="w-10 h-10 bg-brand-bgLight border-2 border-brand-blueDark/20 rounded-tl-lg rounded-br-lg flex items-center justify-center shrink-0 mt-0.5">
                    {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-display font-extrabold text-brand-blueDark text-lg">{mod.title}</h3>
                    <p className="text-sm text-brand-blueDark/60 font-medium mt-0.5 leading-relaxed">{mod.summary}</p>
                </div>
                <div className="shrink-0 mt-1">
                    {open ? <ChevronDown size={20} className="text-brand-blue" /> : <ChevronRight size={20} className="text-brand-blueDark/40" />}
                </div>
            </button>

            {open && (
                <div className="border-t-2 border-brand-blueDark/10 p-5 space-y-6 animate-in fade-in duration-150">
                    <div className="prose-custom text-sm text-brand-blueDark/80 leading-relaxed whitespace-pre-line">
                        {mod.content.split("\n").map((line, i) => {
                            const bold = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
                            return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: bold }} />;
                        })}
                    </div>

                    <div className="bg-brand-bgLight border-2 border-brand-blueDark/10 rounded-xl p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blueDark/40 mb-3">Key Terms</p>
                        <div className="space-y-2">
                            {mod.keyTerms.map(kt => (
                                <div key={kt.term} className="flex gap-3">
                                    <span className="font-bold text-brand-blueDark text-sm shrink-0 w-36">{kt.term}</span>
                                    <span className="text-sm text-brand-blueDark/60 font-medium leading-relaxed">{kt.definition}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {mod.readMore && (
                        <a
                            href={mod.readMore.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline"
                        >
                            <ExternalLink size={14} /> {mod.readMore.label}
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Quantum101Page() {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 pb-8">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-brand-yellow/20 border-2 border-brand-blueDark rounded-tl-xl rounded-br-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(57,103,153,0.3)] shrink-0 mt-1">
                    <Atom size={28} className="text-brand-blueDark" strokeWidth={2} />
                </div>
                <PageHeader
                    title="Quantum 101"
                    subtitle="Core quantum computing concepts every QCSP member should know."
                    className="!mb-0"
                />
            </div>

            <div className="bg-brand-blue/5 border-2 border-brand-blue/20 rounded-xl p-4 text-sm font-medium text-brand-blueDark/70 leading-relaxed">
                These modules cover the fundamental principles underlying quantum computing. Work through them in order or jump to any topic you need.
            </div>

            <div className="space-y-4">
                {MODULES.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
            </div>
        </div>
    );
}
