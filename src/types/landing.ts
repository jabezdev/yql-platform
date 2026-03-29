import type { ElementType } from 'react';

export interface NavLink {
    name: string;
    href: string;
}

export interface SocialLink {
    name: string;
    href: string;
    icon: ElementType;
}

export interface ValuePillar {
    icon: ElementType;
    iconColor: string;
    label: string;
}

export interface MissionCard {
    icon: ElementType;
    title: string;
    description: string;
    gradientFrom: string;
    gradientTo: string;
}

export interface PerkItem {
    icon: ElementType;
    iconColor: string;
    title: string;
    description: string;
}

export interface TimelineStep {
    date: string;
    title: string;
    description: string;
}

export interface TeamInfo {
    name: string;
    description: string;
    accentColor: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}
