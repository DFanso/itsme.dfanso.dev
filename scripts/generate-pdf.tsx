/**
 * generate-pdf.tsx
 * Generates public/resume.pdf using @react-pdf/renderer (no browser needed).
 * Usage: yarn generate:cv
 */

import React from 'react';
import {
    Document, Page, Text, View, Link, StyleSheet, renderToFile,
} from '@react-pdf/renderer';

import { profile, companies, education, certifications, skillGroups } from '../src/data/portfolio.js';

// ── Colours ───────────────────────────────────────────────────────────────────
const C = {
    dark:    '#0f172a',
    mid:     '#334155',
    muted:   '#64748b',
    border:  '#e2e8f0',
    blue:    '#2563eb',
    accent:  '#0284c7',
    tagBg:   '#dbeafe',
    tagText: '#1d4ed8',
    tagBdr:  '#bfdbfe',
    honBg:   '#fef9c3',
    honText: '#854d0e',
    honBdr:  '#fde047',
    white:   '#ffffff',
    hdrBg:   '#0f172a',
    hdrSub:  '#94a3b8',
    hdrLink: '#7dd3fc',
    sideBg:  '#f8fafc',
};

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // Page: two-column layout via flex row
    page: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        fontFamily: 'Helvetica',
        fontSize: 9,
        backgroundColor: C.white,
        paddingTop: 28,
        paddingBottom: 28,
        paddingLeft: 28,
        paddingRight: 28,
    },

    // ── Header (full width) ──
    header: {
        width: '100%',
        backgroundColor: C.hdrBg,
        paddingTop: 16,
        paddingBottom: 14,
        paddingLeft: 14,
        paddingRight: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 0,
    },
    hdrLeft:  { flex: 1, paddingRight: 12 },
    hdrName:  { fontSize: 24, fontFamily: 'Helvetica-Bold', color: C.white },
    hdrTitle: { fontSize: 9, color: C.hdrSub, marginTop: 4 },
    hdrRight: { flexDirection: 'column', alignItems: 'flex-end' },
    hdrRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    hdrLabel: { fontSize: 7.5, color: C.hdrSub, marginRight: 4 },
    hdrLink:  { fontSize: 7.5, color: C.hdrLink, textDecoration: 'none' },
    hdrText:  { fontSize: 7.5, color: '#cbd5e1' },

    // ── Sidebar ──
    sidebar: {
        width: '30%',
        backgroundColor: C.sideBg,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 12,
        paddingRight: 10,
        borderRight: `1 solid ${C.border}`,
    },

    // ── Main ──
    main: {
        width: '70%',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 12,
        paddingRight: 12,
    },

    // ── Section ──
    section:      { marginBottom: 12 },
    sectionTitle: {
        fontSize: 6.5,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 1.4,
        color: C.blue,
        borderBottom: `1.5 solid ${C.blue}`,
        paddingBottom: 2,
        marginBottom: 7,
    },

    // ── Experience ──
    expItem:    { marginBottom: 10 },
    expHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
    expTitle:   { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: C.dark, flex: 1, paddingRight: 8 },
    expPeriod:  { fontSize: 7, color: C.muted },
    expCompany: { fontSize: 8, color: C.blue, marginBottom: 4 },

    bullet:     { flexDirection: 'row', marginBottom: 2 },
    bulletDot:  { fontSize: 8, color: C.accent, marginRight: 5, lineHeight: 1.5 },
    bulletText: { fontSize: 8, color: C.mid,    flex: 1,        lineHeight: 1.5 },

    techRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5, gap: 3 },
    techTag: {
        fontSize: 6.5,
        backgroundColor: C.tagBg,
        color: C.tagText,
        border: `0.5 solid ${C.tagBdr}`,
        borderRadius: 2,
        paddingTop: 1, paddingBottom: 1,
        paddingLeft: 3, paddingRight: 3,
    },

    // ── Education ──
    eduItem:  { marginBottom: 9 },
    eduDeg:   { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.dark },
    eduInst:  { fontSize: 8, color: C.blue, marginTop: 1 },
    eduMeta:  { fontSize: 7, color: C.muted, marginTop: 1 },
    eduGrade: {
        fontSize: 6.5,
        backgroundColor: C.honBg,
        color: C.honText,
        border: `0.5 solid ${C.honBdr}`,
        borderRadius: 2,
        paddingTop: 1, paddingBottom: 1,
        paddingLeft: 3, paddingRight: 3,
        marginTop: 3,
        alignSelf: 'flex-start',
    },

    // ── Certifications ──
    certItem:   { marginBottom: 8 },
    certName:   { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.dark },
    certIssuer: { fontSize: 8, color: C.blue, marginTop: 1 },
    certMeta:   { fontSize: 7, color: C.muted, marginTop: 1 },

    // ── Skills ──
    skillGroup: { marginBottom: 6 },
    skillLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.mid, marginBottom: 3 },
    skillTags:  { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
    skillTag:   {
        fontSize: 6.5,
        backgroundColor: C.white,
        border: `0.5 solid ${C.border}`,
        borderRadius: 2,
        paddingTop: 1, paddingBottom: 1,
        paddingLeft: 3, paddingRight: 3,
        color: C.mid,
    },

    // ── Summary ──
    summaryText: { fontSize: 8, color: C.mid, lineHeight: 1.6 },

    // ── Divider ──
    divider: { borderBottom: `0.5 solid ${C.border}`, marginBottom: 8 },
});

// ── Small helpers ─────────────────────────────────────────────────────────────
const SectionTitle = ({ children }: { children: string }) => (
    <View style={s.sectionTitle}><Text>{children.toUpperCase()}</Text></View>
);

const ContactRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
    <View style={s.hdrRow}>
        <Text style={s.hdrLabel}>{label}</Text>
        {href
            ? <Link src={href} style={s.hdrLink}>{value}</Link>
            : <Text style={s.hdrText}>{value}</Text>
        }
    </View>
);

// ── Document ──────────────────────────────────────────────────────────────────
const ResumePDF = () => {
    const allExperience = companies.flatMap(c =>
        c.roles
            .filter(r => r.type !== 'VOL' && r.type !== 'VID')
            .map(r => ({ company: c.company, ...r }))
    );

    return (
        <Document title={`${profile.name} — Resume`} author={profile.name}>
            <Page size="A4" style={s.page}>

                {/* ══ Header ══════════════════════════════════════════════ */}
                <View style={s.header}>
                    <View style={s.hdrLeft}>
                        <Text style={s.hdrName}>{profile.name}</Text>
                        <Text style={s.hdrTitle}>{profile.title}</Text>
                    </View>
                    <View style={s.hdrRight}>
                        <ContactRow label="Location:" value={profile.location} />
                        <ContactRow label="Email:"    value={profile.email}    href={`mailto:${profile.email}`} />
                        <ContactRow label="LinkedIn:" value={profile.linkedinHandle} href={profile.linkedin} />
                        <ContactRow label="Portfolio:" value={profile.portfolioHandle} href={profile.portfolio} />
                        <ContactRow label="GitHub:"   value={profile.githubHandle}   href={profile.github} />
                    </View>
                </View>

                {/* ══ Sidebar ═════════════════════════════════════════════ */}
                <View style={s.sidebar}>

                    {/* About */}
                    <View style={s.section}>
                        <SectionTitle>About</SectionTitle>
                        <Text style={s.summaryText}>{profile.summary}</Text>
                    </View>

                    {/* Skills */}
                    <View style={s.section}>
                        <SectionTitle>Technical Skills</SectionTitle>
                        {skillGroups.map(g => (
                            <View key={g.name} style={s.skillGroup}>
                                <Text style={s.skillLabel}>{g.name}</Text>
                                <View style={s.skillTags}>
                                    {g.skills.map(sk => <Text key={sk} style={s.skillTag}>{sk}</Text>)}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Certifications */}
                    <View style={s.section}>
                        <SectionTitle>Certifications</SectionTitle>
                        {certifications.map(cert => (
                            <View key={cert.name} style={s.certItem}>
                                <Text style={s.certName}>{cert.name}</Text>
                                <Text style={s.certIssuer}>{cert.issuer}</Text>
                                <Text style={s.certMeta}>{cert.date}{cert.expiry ? `  |  ${cert.expiry}` : ''}</Text>
                                {cert.id ? <Text style={s.certMeta}>{cert.id}</Text> : null}
                            </View>
                        ))}
                    </View>

                    {/* Education */}
                    <View style={s.section}>
                        <SectionTitle>Education</SectionTitle>
                        {education.map(edu => (
                            <View key={edu.institution} style={s.eduItem}>
                                <Text style={s.eduDeg}>{edu.degree}</Text>
                                <Text style={s.eduInst}>{edu.institution}</Text>
                                <Text style={s.eduMeta}>{edu.period}</Text>
                                <Text style={s.eduMeta}>{edu.location}</Text>
                                {edu.grade ? <Text style={s.eduGrade}>First Class Honours</Text> : null}
                            </View>
                        ))}
                    </View>

                </View>

                {/* ══ Main — Experience ════════════════════════════════════ */}
                <View style={s.main}>
                    <View style={s.section}>
                        <SectionTitle>Experience</SectionTitle>
                        {allExperience.map((exp, i) => (
                            <View key={i} style={s.expItem} wrap={false}>
                                <View style={s.expHeader}>
                                    <Text style={s.expTitle}>{exp.title}</Text>
                                    <Text style={s.expPeriod}>{exp.period}</Text>
                                </View>
                                <Text style={s.expCompany}>{exp.company}</Text>
                                {exp.responsibilities.map((r, j) => (
                                    <View key={j} style={s.bullet}>
                                        <Text style={s.bulletDot}>-</Text>
                                        <Text style={s.bulletText}>{r}</Text>
                                    </View>
                                ))}
                                <View style={s.techRow}>
                                    {exp.tech.map(t => <Text key={t.name} style={s.techTag}>{t.name}</Text>)}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </Page>
        </Document>
    );
};

// ── Generate ──────────────────────────────────────────────────────────────────
const OUTPUT = new URL('../public/resume.pdf', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

console.log('Generating resume.pdf...');
renderToFile(<ResumePDF />, OUTPUT)
    .then(() => console.log(`Done -> ${OUTPUT}`))
    .catch((err: Error) => { console.error('Error:', err.message); process.exit(1); });
