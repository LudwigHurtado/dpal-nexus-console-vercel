'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const ReportHeatMap = dynamic(() => import('./components/ReportHeatMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 320, background: '#0d1117', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>
      Loading map…
    </div>
  ),
});

type EntityType =
  | 'City'
  | 'County Government'
  | 'Hospital Network'
  | 'School District'
  | 'University'
  | 'Transit Agency'
  | 'Police Department'
  | 'Fire Department'
  | 'Housing Authority'
  | 'Utilities Provider'
  | 'Retail Chain'
  | 'Logistics Company'
  | 'Banking Group'
  | 'Insurance Provider'
  | 'Telecom Provider'
  | 'Airport Authority';

type DashboardView = 'Executive' | 'Operations' | 'Risk & Liability' | 'Public Portal';
type Status = 'Active' | 'Pilot' | 'Planning';
type Severity = 'Low' | 'Moderate' | 'High';
type ReportStatus = 'New' | 'Investigating' | 'Action Taken' | 'Resolved';
type ActionArea = 'reports' | 'dispatch' | 'analytics' | 'audit';

type Report = {
  id: string;
  channel: 'App' | 'WhatsApp' | 'Web Portal' | 'Hotline' | 'Field Team';
  title: string;
  severity: Severity;
  status: ReportStatus;
  location: string;
  eta: string;
  summary: string;
  assignedTo?: string;
  lastActionNote?: string;
};

type Entity = {
  id: string;
  name: string;
  type: EntityType;
  region: string;
  status: Status;
  confidence: number;
  heroImage: string;
  kpis: Array<{ label: string; value: string; delta: string }>;
  valueStats: Array<{ label: string; value: string }>;
  modules: string[];
  reports: Report[];
};

type AiInsight = {
  severitySuggested: 'Low' | 'Moderate' | 'High';
  routeTo: string;
  slaHours: number;
  rationale: string;
  nextActions: Array<{ label: string; status: ReportStatus; note: string }>;
  similar?: Array<{ id: string; title: string; severity: string; score: number }>;
  provider?: string;
};

type CategoryPlaybook = {
  operationalObjective: string;
  workflowSteps: string[];
  quickActions: Array<{ label: string; route: string; status: ReportStatus; note: string; openArea?: ActionArea }>;
};

type IntakeField = {
  key: string;
  label: string;
  placeholder: string;
};

const DASHBOARD_VIEWS: DashboardView[] = ['Executive', 'Operations', 'Risk & Liability', 'Public Portal'];
const ACTION_AREAS: Array<{ key: ActionArea; label: string }> = [
  { key: 'reports', label: 'Reports Queue' },
  { key: 'dispatch', label: 'Action Center' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'audit', label: 'Audit Trail' },
];

function getAreaForPortalTab(tab: string): ActionArea {
  const t = tab.toLowerCase();
  if (t.includes('admin')) return 'audit';
  if (t.includes('compliance') || t.includes('esg') || t.includes('policy')) return 'analytics';
  if (t.includes('operations') || t.includes('dispatch') || t.includes('field') || t.includes('station') || t.includes('route') || t.includes('hub') || t.includes('risk operations')) return 'dispatch';
  return 'reports';
}

function getTabForArea(area: ActionArea, portalTabs: string[]): string {
  switch (area) {
    case 'audit':
      return portalTabs.find((tab) => tab.toLowerCase().includes('admin')) || portalTabs[0] || 'Dashboard';
    case 'analytics':
      return portalTabs.find((tab) => /compliance|esg|policy/i.test(tab)) || portalTabs[0] || 'Dashboard';
    case 'dispatch':
      return portalTabs.find((tab) => /operations|dispatch|field|station|route|hub|risk operations/i.test(tab)) || portalTabs[0] || 'Dashboard';
    default:
      return portalTabs.find((tab) => /reports|feedback|complaints|violations|incident|case|store|service/i.test(tab)) || portalTabs[0] || 'Dashboard';
  }
}

const defaultApiBase = (process.env.NEXT_PUBLIC_DPAL_API_BASE || '').trim();

const ENTITIES: Entity[] = [
  {
    id: 'lapaz-city',
    name: 'City of La Paz',
    type: 'City',
    region: 'BO-LP',
    status: 'Active',
    confidence: 92,
    heroImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Open Cases', value: '482', delta: '-4.3%' },
      { label: 'Resolved (7d)', value: '1,207', delta: '+12.8%' },
      { label: 'Avg Response', value: '2.3h', delta: '-0.4h' },
      { label: 'SLA', value: '91%', delta: '+2.1%' },
    ],
    valueStats: [
      { label: 'Budget Saved (est.)', value: '$128,000/mo' },
      { label: 'Escalations Prevented', value: '143' },
      { label: 'Citizen Satisfaction Lift', value: '+18%' },
    ],
    modules: ['District Heatmap', 'Critical Queue', 'Public Works Dispatch', 'Legal Readiness'],
    reports: [
      { id: 'RPT-1042', channel: 'WhatsApp', title: 'Streetlight outage and unsafe crossing', severity: 'Moderate', status: 'Investigating', location: 'Zona Sur - Calle 17', eta: '6h', summary: 'Multiple citizen reports indicate repeated outages at school crossing zone during peak hours.' },
      { id: 'RPT-1049', channel: 'App', title: 'Drainage overflow near school entrance', severity: 'High', status: 'New', location: 'Sopocachi', eta: '2h', summary: 'Flooding hazard affecting student access and vehicle safety. Requires rapid public works intervention.' },
      { id: 'RPT-1055', channel: 'Web Portal', title: 'Illegal dumping hotspot recurrence', severity: 'Moderate', status: 'Action Taken', location: 'Periférica', eta: 'Completed', summary: 'Pattern identified across 3 weeks. Cleanup completed, surveillance routing active.' },
    ],
  },
  {
    id: 'metro-hospital',
    name: 'Metropolitan Hospital Network',
    type: 'Hospital Network',
    region: 'BO-CB',
    status: 'Pilot',
    confidence: 88,
    heroImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Patient Safety Alerts', value: '64', delta: '+8.6%' },
      { label: 'Incident Reviews', value: '23', delta: '+3.4%' },
      { label: 'Compliance Tasks', value: '118', delta: '-5.1%' },
      { label: 'SLA', value: '88%', delta: '+1.3%' },
    ],
    valueStats: [
      { label: 'Avoided Adverse Events', value: '21 this quarter' },
      { label: 'Audit Prep Time Saved', value: '46h/month' },
      { label: 'Legal Risk Reduction', value: '-27%' },
    ],
    modules: ['Clinical Risk Matrix', 'Adverse Event Workflow', 'Quality Board', 'Audit Exports'],
    reports: [
      { id: 'MED-4002', channel: 'Field Team', title: 'Sterilization compliance deviation', severity: 'High', status: 'Investigating', location: 'Unit B - OR 3', eta: '1h', summary: 'Temperature record variance detected. Team isolated equipment and initiated protocol review.' },
      { id: 'MED-4011', channel: 'Web Portal', title: 'Medication near-miss report', severity: 'Moderate', status: 'Action Taken', location: 'Pharmacy Tower', eta: 'Completed', summary: 'Barcode mismatch prevented administration. Corrective action and retraining completed.' },
      { id: 'MED-4014', channel: 'Hotline', title: 'ER triage delay complaint', severity: 'Moderate', status: 'New', location: 'Emergency Wing', eta: '3h', summary: 'High patient volume period with queue overflow requiring staffing rebalance.' },
    ],
  },
  {
    id: 'santa-cruz-schools',
    name: 'Santa Cruz Unified School District',
    type: 'School District',
    region: 'BO-SC',
    status: 'Active',
    confidence: 94,
    heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Campus Cases', value: '219', delta: '-2.2%' },
      { label: 'Interventions', value: '97', delta: '+9.4%' },
      { label: 'Parent Updates', value: '402', delta: '+15.2%' },
      { label: 'SLA', value: '93%', delta: '+1.8%' },
    ],
    valueStats: [
      { label: 'Incidents Resolved <24h', value: '82%' },
      { label: 'Repeat Cases Reduced', value: '-31%' },
      { label: 'Counselor Time Optimized', value: '+22%' },
    ],
    modules: ['Student Welfare Queue', 'Campus Risk Radar', 'Counselor Routing', 'Parent Transparency Feed'],
    reports: [
      { id: 'EDU-2291', channel: 'App', title: 'Bullying incident in recess area', severity: 'High', status: 'Investigating', location: 'Campus Norte', eta: '45m', summary: 'Counselor and principal assigned. Family communication in progress.' },
      { id: 'EDU-2295', channel: 'WhatsApp', title: 'Unsafe gate crowding at pickup', severity: 'Moderate', status: 'New', location: 'Campus Centro', eta: '2h', summary: 'Traffic and supervision issue at peak dismissal hours; safety plan pending.' },
      { id: 'EDU-2302', channel: 'Web Portal', title: 'Facilities hazard in science lab', severity: 'High', status: 'Action Taken', location: 'Campus Este', eta: 'Completed', summary: 'Area contained, maintenance team resolved issue, documentation submitted.' },
    ],
  },
  {
    id: 'nyc-city',
    name: 'City of New York',
    type: 'City',
    region: 'US-NY',
    status: 'Active',
    confidence: 95,
    heroImage: 'https://images.unsplash.com/photo-1546436836-07a91091f160?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Open Cases', value: '3,842', delta: '-6.1%' },
      { label: 'Resolved (7d)', value: '9,410', delta: '+10.2%' },
      { label: 'Avg Response', value: '1.8h', delta: '-0.3h' },
      { label: 'SLA', value: '94%', delta: '+1.7%' },
    ],
    valueStats: [
      { label: 'Critical Delays Avoided', value: '412/mo' },
      { label: 'Citizen NPS Lift', value: '+21%' },
      { label: 'Ops Cost Saved', value: '$410k/mo' },
    ],
    modules: ['Borough Heatmap', 'Emergency Routing', 'Public Portal Transparency', 'Escalation Watchtower'],
    reports: [
      { id: 'NYC-1001', channel: 'App', title: 'Road collapse hazard', severity: 'High', status: 'New', location: 'Brooklyn', eta: '1h', summary: 'Sinkhole expansion near school bus route requiring immediate closure and reroute.' },
      { id: 'NYC-1004', channel: 'WhatsApp', title: 'Recurring power issue at intersection', severity: 'Moderate', status: 'Investigating', location: 'Queens', eta: '4h', summary: 'Signal downtime recurring in peak traffic window with safety impact.' },
      { id: 'NYC-1012', channel: 'Web Portal', title: 'Illegal dumping near park', severity: 'Moderate', status: 'Action Taken', location: 'Bronx', eta: 'Completed', summary: 'Cleanup and enforcement patrol assigned; follow-up verification pending.' },
    ],
  },
  {
    id: 'la-city',
    name: 'City of Los Angeles',
    type: 'City',
    region: 'US-CA',
    status: 'Pilot',
    confidence: 90,
    heroImage: 'https://images.unsplash.com/photo-1468436385273-8abca6dfd8d3?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Open Cases', value: '2,940', delta: '-3.2%' },
      { label: 'Resolved (7d)', value: '7,118', delta: '+11.0%' },
      { label: 'Avg Response', value: '2.1h', delta: '-0.2h' },
      { label: 'SLA', value: '92%', delta: '+1.2%' },
    ],
    valueStats: [
      { label: 'Escalations Prevented', value: '287/mo' },
      { label: 'Field Crew Utilization', value: '+19%' },
      { label: 'Public Trust Score', value: '+14%' },
    ],
    modules: ['District Risk Radar', 'Traffic-Safety Cases', 'Infrastructure Dispatch', 'Policy Audit Feed'],
    reports: [
      { id: 'LAX-2101', channel: 'Hotline', title: 'Damaged traffic control cabinet', severity: 'High', status: 'Investigating', location: 'Downtown LA', eta: '2h', summary: 'Signal coordination interrupted across two corridors during rush hour.' },
      { id: 'LAX-2110', channel: 'App', title: 'Water line leak at intersection', severity: 'Moderate', status: 'New', location: 'Hollywood', eta: '3h', summary: 'Potential roadway undermining and pedestrian hazard.' },
      { id: 'LAX-2115', channel: 'Web Portal', title: 'Abandoned waste at school perimeter', severity: 'Moderate', status: 'Action Taken', location: 'South LA', eta: 'Completed', summary: 'Site secured, cleanup done, and monitoring camera request submitted.' },
    ],
  },
  {
    id: 'miami-dade',
    name: 'Miami-Dade County Government',
    type: 'County Government',
    region: 'US-FL',
    status: 'Planning',
    confidence: 84,
    heroImage: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'County Service Requests', value: '1,204', delta: '+2.4%' },
      { label: 'Resolved (7d)', value: '3,501', delta: '+8.1%' },
      { label: 'Avg Response', value: '3.0h', delta: '-0.6h' },
      { label: 'SLA', value: '89%', delta: '+1.5%' },
    ],
    valueStats: [
      { label: 'Inter-Agency Time Saved', value: '33h/week' },
      { label: 'Duplicate Cases Reduced', value: '-28%' },
      { label: 'Backlog Reduction', value: '-17%' },
    ],
    modules: ['County Ops Board', 'Agency Handoff Queue', 'Storm Risk Watch', 'Constituent Portal'],
    reports: [
      { id: 'MD-301', channel: 'Web Portal', title: 'Flood drainage obstruction', severity: 'High', status: 'New', location: 'Hialeah', eta: '90m', summary: 'Stormwater channel blocked ahead of forecast rainfall event.' },
      { id: 'MD-309', channel: 'App', title: 'Street debris accumulation', severity: 'Moderate', status: 'Investigating', location: 'Coral Gables', eta: '5h', summary: 'Repeated debris pickup misses on key commuter routes.' },
      { id: 'MD-320', channel: 'Hotline', title: 'Public lighting outage cluster', severity: 'Moderate', status: 'Action Taken', location: 'Kendall', eta: 'Completed', summary: 'Utility partner dispatched and restoration verified.' },
    ],
  },
  {
    id: 'lausd',
    name: 'Los Angeles Unified School District',
    type: 'School District',
    region: 'US-CA',
    status: 'Active',
    confidence: 93,
    heroImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Campus Cases', value: '612', delta: '-4.1%' },
      { label: 'Interventions', value: '322', delta: '+8.8%' },
      { label: 'Parent Updates', value: '1,840', delta: '+13.6%' },
      { label: 'SLA', value: '92%', delta: '+2.0%' },
    ],
    valueStats: [
      { label: 'Escalations Resolved <24h', value: '79%' },
      { label: 'Repeat Incidents Reduced', value: '-26%' },
      { label: 'Counselor Productivity', value: '+24%' },
    ],
    modules: ['District Safety Board', 'Campus Escalation Queue', 'Parent Communication Hub', 'Counselor Load Balancer'],
    reports: [
      { id: 'LAUSD-45', channel: 'App', title: 'Physical altercation at lunch area', severity: 'High', status: 'Investigating', location: 'Central HS', eta: '30m', summary: 'De-escalation team engaged; guardian communication started.' },
      { id: 'LAUSD-49', channel: 'WhatsApp', title: 'Unsafe pickup traffic pattern', severity: 'Moderate', status: 'New', location: 'Westside MS', eta: '2h', summary: 'Traffic safety intervention requested for dismissal window.' },
      { id: 'LAUSD-53', channel: 'Web Portal', title: 'HVAC safety complaint', severity: 'Moderate', status: 'Action Taken', location: 'South ES', eta: 'Completed', summary: 'Maintenance completed with post-inspection signoff.' },
    ],
  },
  {
    id: 'target-retail',
    name: 'Target Retail Safety Operations',
    type: 'Retail Chain',
    region: 'US-NATIONAL',
    status: 'Pilot',
    confidence: 86,
    heroImage: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Store Incidents', value: '438', delta: '-5.6%' },
      { label: 'Resolved (7d)', value: '1,030', delta: '+9.9%' },
      { label: 'Avg Response', value: '1.5h', delta: '-0.2h' },
      { label: 'SLA', value: '93%', delta: '+1.4%' },
    ],
    valueStats: [
      { label: 'Loss Prevention Impact', value: '$290k/mo' },
      { label: 'Safety Claim Reduction', value: '-18%' },
      { label: 'Manager Productivity', value: '+16%' },
    ],
    modules: ['Store Risk Feed', 'Regional Escalation Matrix', 'Case Evidence Vault', 'Customer Safety Portal'],
    reports: [
      { id: 'TRG-88', channel: 'App', title: 'Slip hazard near loading bay', severity: 'High', status: 'New', location: 'Store #1142', eta: '25m', summary: 'High foot traffic area with potential injury exposure.' },
      { id: 'TRG-96', channel: 'Field Team', title: 'Security camera blind spot', severity: 'Moderate', status: 'Investigating', location: 'Store #982', eta: '4h', summary: 'Coverage gap during evening shift in high-value aisle.' },
      { id: 'TRG-101', channel: 'Web Portal', title: 'Repeat theft pattern flagged', severity: 'Moderate', status: 'Action Taken', location: 'Store #450', eta: 'Completed', summary: 'Staffing and surveillance pattern updated.' },
    ],
  },
  {
    id: 'fedex-logistics',
    name: 'FedEx Logistics Risk Control',
    type: 'Logistics Company',
    region: 'US-NATIONAL',
    status: 'Planning',
    confidence: 82,
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80',
    kpis: [
      { label: 'Route Incidents', value: '217', delta: '-3.8%' },
      { label: 'Resolved (7d)', value: '588', delta: '+7.7%' },
      { label: 'Avg Response', value: '2.0h', delta: '-0.4h' },
      { label: 'SLA', value: '90%', delta: '+1.0%' },
    ],
    valueStats: [
      { label: 'Delivery Delay Reduction', value: '-14%' },
      { label: 'Insurance Exposure', value: '-12%' },
      { label: 'Hub Throughput Lift', value: '+11%' },
    ],
    modules: ['Hub Disruption Board', 'Driver Safety Queue', 'Claims Triage', 'Regional Ops Timeline'],
    reports: [
      { id: 'FDX-31', channel: 'Field Team', title: 'Dock safety incident', severity: 'High', status: 'Investigating', location: 'Memphis Hub', eta: '1h', summary: 'Loading path obstruction with repeated near-miss logs.' },
      { id: 'FDX-36', channel: 'App', title: 'Route delay due to access blockage', severity: 'Moderate', status: 'New', location: 'Dallas Route 7', eta: '2h', summary: 'Last-mile route impacted by recurring curbside restrictions.' },
      { id: 'FDX-40', channel: 'Web Portal', title: 'Package handling compliance issue', severity: 'Moderate', status: 'Action Taken', location: 'Phoenix Hub', eta: 'Completed', summary: 'Corrective coaching completed; monitoring active.' },
    ],
  },
];

const uniqueByType: Record<EntityType, { headline: string; color: string; channelFocus: string[]; layout: 'city' | 'hospital' | 'school' | 'bank' | 'utilities' | 'default' }> = {
  City: { headline: 'Urban Command Channel', color: '#38bdf8', channelFocus: ['Citizen WhatsApp Intake', 'Field Inspector App', 'Public Portal Reports'], layout: 'city' },
  'County Government': { headline: 'County Operations Channel', color: '#60a5fa', channelFocus: ['Constituent Portal', 'Cross-Agency Workflow', 'Emergency Readiness'], layout: 'default' },
  'Hospital Network': { headline: 'Clinical Safety Channel', color: '#22c55e', channelFocus: ['Ward Supervisor Hotline', 'Compliance Web Form', 'Clinical Team Mobile'], layout: 'hospital' },
  'School District': { headline: 'Campus Safety Channel', color: '#a78bfa', channelFocus: ['Parent App Reporting', 'Anonymous Web Intake', 'Counselor Escalation Queue'], layout: 'school' },
  University: { headline: 'Academic Integrity Channel', color: '#14b8a6', channelFocus: ['Student Portal', 'Faculty Oversight Board', 'Campus Security Feed'], layout: 'default' },
  'Transit Agency': { headline: 'Mobility Reliability Channel', color: '#f59e0b', channelFocus: ['Station Hotline', 'Driver Mobile Alerts', 'Commuter Web Reports'], layout: 'default' },
  'Police Department': { headline: 'Public Safety Response Channel', color: '#0284c7', channelFocus: ['911 Intake Sync', 'Patrol Dispatch', 'Evidence Workflow'], layout: 'default' },
  'Fire Department': { headline: 'Emergency Fire Ops Channel', color: '#f97316', channelFocus: ['Incident Command', 'Station Readiness', 'Response Timeline'], layout: 'default' },
  'Housing Authority': { headline: 'Tenant Protection Channel', color: '#ef4444', channelFocus: ['Tenant WhatsApp Intake', 'Inspector Field Workflow', 'Legal Case Pipeline'], layout: 'default' },
  'Utilities Provider': { headline: 'Service Continuity Channel', color: '#84cc16', channelFocus: ['Outage Mobile Alerts', 'Regulator Portal', 'Crew Dispatch Terminal'], layout: 'utilities' },
  'Retail Chain': { headline: 'Retail Risk Control Channel', color: '#f43f5e', channelFocus: ['Store Incident Intake', 'Loss Prevention Queue', 'Regional Ops Console'], layout: 'default' },
  'Logistics Company': { headline: 'Logistics Resilience Channel', color: '#0ea5e9', channelFocus: ['Hub Incident Feed', 'Driver Safety Alerts', 'Route Disruption Queue'], layout: 'default' },
  'Banking Group': { headline: 'Financial Operations Channel', color: '#22c55e', channelFocus: ['Branch Incident Intake', 'Fraud Risk Triage', 'Compliance Escalation'], layout: 'bank' },
  'Insurance Provider': { headline: 'Claims Integrity Channel', color: '#10b981', channelFocus: ['Claims Risk Queue', 'Field Assessment', 'Liability Tracker'], layout: 'default' },
  'Telecom Provider': { headline: 'Network Reliability Channel', color: '#8b5cf6', channelFocus: ['Outage Reports', 'Tower Dispatch', 'Customer Transparency'], layout: 'default' },
  'Airport Authority': { headline: 'Aviation Operations Channel', color: '#06b6d4', channelFocus: ['Terminal Incident Feed', 'Ground Ops Dispatch', 'Safety Audit Stream'], layout: 'default' },
};

const CATEGORY_SHOWCASE: Array<{ type: EntityType; image: string; caption: string }> = [
  { type: 'City', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=85', caption: 'US city command and citizen intake operations' },
  { type: 'County Government', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=85', caption: 'County-level multi-agency coordination' },
  { type: 'Hospital Network', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=85', caption: 'Clinical safety, compliance and incident review' },
  { type: 'School District', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85', caption: 'Campus welfare and parent transparency channel' },
  { type: 'University', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=85', caption: 'Academic integrity and governance workflows' },
  { type: 'Transit Agency', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1400&q=85', caption: 'Route reliability and disruption response center' },
  { type: 'Police Department', image: 'https://images.unsplash.com/photo-1593010533077-22f31338c3f8?auto=format&fit=crop&w=1400&q=85', caption: 'Public safety response and evidence workflow' },
  { type: 'Fire Department', image: 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?auto=format&fit=crop&w=1400&q=85', caption: 'Emergency dispatch and station readiness' },
  { type: 'Housing Authority', image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=85', caption: 'Tenant safety and structural risk management' },
  { type: 'Utilities Provider', image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=85', caption: 'Outage restoration and infrastructure oversight' },
  { type: 'Retail Chain', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=85', caption: 'Store safety, loss prevention and operations' },
  { type: 'Logistics Company', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=85', caption: 'Hub disruptions and route risk control' },
  { type: 'Banking Group', image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1400&q=85', caption: 'Branch incident and fraud risk oversight' },
  { type: 'Insurance Provider', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=85', caption: 'Claims integrity and liability reduction' },
  { type: 'Telecom Provider', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1400&q=85', caption: 'Network outage management and response' },
  { type: 'Airport Authority', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=85', caption: 'Terminal ops, safety cases and dispatch' },
];

const COMPLETE_ENTITIES: Entity[] = (() => {
  const byType = new Map<EntityType, Entity>();
  for (const e of ENTITIES) if (!byType.has(e.type)) byType.set(e.type, e);

  const generated: Entity[] = CATEGORY_SHOWCASE
    .filter((c) => !byType.has(c.type))
    .map((c, idx) => ({
      id: `${c.type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-demo`,
      name: `${c.type} Demo Entity`,
      type: c.type,
      region: `DEMO-${idx + 1}`,
      status: 'Pilot' as Status,
      confidence: 88,
      heroImage: c.image,
      kpis: [
        { label: 'Open Cases', value: String(120 + idx * 7), delta: '+2.1%' },
        { label: 'Resolved (7d)', value: String(320 + idx * 11), delta: '+8.4%' },
        { label: 'Avg Response', value: '2.4h', delta: '-0.2h' },
        { label: 'SLA', value: '91%', delta: '+1.2%' },
      ],
      valueStats: [
        { label: 'Risk Reduced', value: `${14 + idx}%` },
        { label: 'Workflow Throughput', value: `${320 + idx * 12}/wk` },
        { label: 'Compliance Lift', value: `+${9 + (idx % 4)}%` },
      ],
      modules: ['Risk Dashboard', 'Case Feed', 'AI Advisor', 'Ops Control'],
      reports: [
        { id: `${c.type.slice(0, 3).toUpperCase()}-9001`, channel: 'Web Portal', title: `${c.type} high-priority issue`, severity: 'High', status: 'New', location: 'Central Zone', eta: '2h', summary: `High-priority incident intake for ${c.type.toLowerCase()} operations.` },
        { id: `${c.type.slice(0, 3).toUpperCase()}-9002`, channel: 'App', title: `${c.type} service complaint`, severity: 'Moderate', status: 'Investigating', location: 'North Sector', eta: '6h', summary: `Active investigation under ${c.type.toLowerCase()} workflow.` },
        { id: `${c.type.slice(0, 3).toUpperCase()}-9003`, channel: 'WhatsApp', title: `${c.type} recurring risk pattern`, severity: 'Moderate', status: 'Action Taken', location: 'South Sector', eta: 'Completed', summary: `Mitigation action recorded for recurring ${c.type.toLowerCase()} pattern.` },
      ],
    }));

  return [...ENTITIES, ...generated];
})();

const CATEGORY_INFO_NEEDS: Record<EntityType, Array<{ label: string; value: string; note: string }>> = {
  City: [
    { label: '311 Intake Volume', value: '12,420 / week', note: 'By district, hour, and issue type' },
    { label: 'Critical Infrastructure Alerts', value: '39 active', note: 'Road, drainage, lighting, public safety zones' },
    { label: 'Department SLA by Team', value: '87% avg', note: 'Public works, sanitation, transport, legal follow-up' },
    { label: 'Citizen Sentiment', value: '+16% this quarter', note: 'Complaint-to-resolution satisfaction trend' },
  ],
  'County Government': [
    { label: 'Cross-Agency Handoff Time', value: '5.6h median', note: 'County ops → utility → emergency services' },
    { label: 'Permit/Compliance Backlog', value: '1,104 cases', note: 'Inspection and approval queue health' },
    { label: 'Storm/Flood Readiness Index', value: '78/100', note: 'Drainage, shelter, emergency staffing readiness' },
    { label: 'Constituent Escalation Rate', value: '8.2%', note: 'Cases requiring supervisor intervention' },
  ],
  'Hospital Network': [
    { label: 'Patient Safety Events', value: '64 open', note: 'Near misses, adverse events, rapid response triggers' },
    { label: 'Clinical Compliance Status', value: '92% complete', note: 'Sterilization, medication, protocol adherence' },
    { label: 'ER Flow Pressure', value: 'High 14:00-20:00', note: 'Wait-time and triage bottleneck windows' },
    { label: 'Medico-Legal Exposure', value: '12 high-risk files', note: 'Cases requiring legal/compliance review' },
  ],
  'School District': [
    { label: 'Student Safety Incidents', value: '219 this month', note: 'Bullying, fights, facility hazards' },
    { label: 'Counselor Intervention Queue', value: '23 pending', note: 'Priority by vulnerability score and urgency' },
    { label: 'Parent Communication SLA', value: '94%', note: 'Response time to family-reported incidents' },
    { label: 'Campus Risk Heatmap', value: '3 red campuses', note: 'Recurring incident concentration by site' },
  ],
  University: [
    { label: 'Academic Integrity Cases', value: '35 active', note: 'Plagiarism, misconduct, policy violations' },
    { label: 'Campus Security Alerts', value: '11 open', note: 'Safety and operational incident feed' },
    { label: 'Department Compliance Score', value: '84/100', note: 'Policy training and closure performance' },
    { label: 'Governance Action Backlog', value: '52 items', note: 'Committee and administrative follow-ups' },
  ],
  'Transit Agency': [
    { label: 'Route Disruptions', value: '79 this week', note: 'Delay causes by corridor and time band' },
    { label: 'Mean Time to Recovery', value: '1.8h', note: 'Incident detection to service normalization' },
    { label: 'Station Safety Signals', value: '27 alerts', note: 'Crowding, hazard, equipment incidents' },
    { label: 'Fleet Maintenance Risk', value: '44 overdue', note: 'Vehicles crossing maintenance thresholds' },
  ],
  'Police Department': [
    { label: 'Response Time to Priority Calls', value: '7m 40s', note: 'P1/P2 dispatch performance by precinct' },
    { label: 'Open Investigations', value: '412', note: 'Case load by detective unit and severity' },
    { label: 'Evidence Chain Integrity', value: '99.1%', note: 'Tamper-proof custody and verification status' },
    { label: 'Community Incident Hotspots', value: '14 zones', note: 'Repeat-location intelligence overlay' },
  ],
  'Fire Department': [
    { label: 'Dispatch-to-Arrival Time', value: '6m 05s', note: 'By station and emergency class' },
    { label: 'Hydrant/Equipment Readiness', value: '96%', note: 'Inspection and availability compliance' },
    { label: 'High-Risk Property Watchlist', value: '58 sites', note: 'Frequent incidents / code risk' },
    { label: 'Post-Incident Actions', value: '183 pending', note: 'Inspection, legal report, prevention outreach' },
  ],
  'Housing Authority': [
    { label: 'Urgent Tenant Safety Cases', value: '43 open', note: 'Structural, utility, sanitation, personal safety' },
    { label: 'Property Compliance Index', value: '81/100', note: 'Inspections and landlord corrective actions' },
    { label: 'Legal Exposure Cases', value: '12 high', note: 'Potential liability due to delayed resolution' },
    { label: 'Inspection Backlog', value: '67 units', note: 'Pending site visits and re-checks' },
  ],
  'Utilities Provider': [
    { label: 'Active Outages', value: '21', note: 'Power/water/gas by service zone' },
    { label: 'Customers Impacted', value: '14,102', note: 'Current affected accounts and vulnerability tier' },
    { label: 'Restoration ETA Accuracy', value: '87%', note: 'Predicted vs actual service restoration time' },
    { label: 'Regulatory Incident Queue', value: '8 open', note: 'Compliance reporting obligations' },
  ],
  'Retail Chain': [
    { label: 'Store Safety Incidents', value: '438', note: 'Slip/fall, security, operational hazards' },
    { label: 'Loss Prevention Flags', value: '126', note: 'Shrinkage patterns and repeat offenders' },
    { label: 'Store Ops SLA', value: '93%', note: 'Time-to-mitigate high-risk incidents' },
    { label: 'Insurance Claim Exposure', value: '$1.2M potential', note: 'Open risk cases by region' },
  ],
  'Logistics Company': [
    { label: 'Hub Disruptions', value: '217', note: 'Sortation, loading, and routing blockers' },
    { label: 'Driver Safety Events', value: '88', note: 'Fatigue, route hazards, near-miss telemetry' },
    { label: 'On-Time Recovery Rate', value: '89%', note: 'Delayed shipment recapture performance' },
    { label: 'Claims Liability Queue', value: '64 cases', note: 'Damaged/lost shipment legal follow-up' },
  ],
  'Banking Group': [
    { label: 'Branch Incident Feed', value: '72 open', note: 'Security, fraud, service continuity risks' },
    { label: 'Fraud Escalations', value: '31 high-priority', note: 'Transaction anomalies and account compromise' },
    { label: 'Compliance Breach Risk', value: 'Low-Moderate', note: 'Audit controls and policy adherence' },
    { label: 'Customer Impact Window', value: '2.4h avg', note: 'Mean disruption duration for incidents' },
  ],
  'Insurance Provider': [
    { label: 'Claims Integrity Alerts', value: '93', note: 'Potential fraud / missing evidence markers' },
    { label: 'High-Exposure Claims', value: '27', note: 'Large-loss and legal-sensitive cases' },
    { label: 'Adjuster Workload Balance', value: '74% optimal', note: 'Case distribution efficiency index' },
    { label: 'Settlement Cycle Time', value: '11.2 days', note: 'Average decision-to-settlement interval' },
  ],
  'Telecom Provider': [
    { label: 'Network Outage Clusters', value: '19', note: 'Tower/fiber incidents by metro zone' },
    { label: 'SLA Breach Risk', value: '7 enterprise links', note: 'Contracts at risk of penalties' },
    { label: 'Field Crew Dispatch Load', value: '83 active tasks', note: 'Technician queue and route efficiency' },
    { label: 'Customer Complaint Surge', value: '+12%', note: 'QoS degradation detection trend' },
  ],
  'Airport Authority': [
    { label: 'Terminal Incident Queue', value: '54', note: 'Safety, crowding, ops disruption events' },
    { label: 'Runway/Apron Readiness', value: '97%', note: 'Operational safety checks and closures' },
    { label: 'Ground Ops Turnaround', value: '42m avg', note: 'Delay to recovery cycle' },
    { label: 'Regulatory Audit Flags', value: '6 pending', note: 'Compliance actions and due dates' },
  ],
};

const CATEGORY_ICONS: Record<EntityType, string> = {
  City: '🏙️',
  'County Government': '🗺️',
  'Hospital Network': '🏥',
  'School District': '🏫',
  University: '🎓',
  'Transit Agency': '🚇',
  'Police Department': '🚔',
  'Fire Department': '🚒',
  'Housing Authority': '🏘️',
  'Utilities Provider': '⚡',
  'Retail Chain': '🛍️',
  'Logistics Company': '📦',
  'Banking Group': '🏦',
  'Insurance Provider': '🛡️',
  'Telecom Provider': '📡',
  'Airport Authority': '✈️',
};

const SETUP_CARDS: Array<{ id: string; label: string; icon: string; area: ActionArea }> = [
  { id: 'budget', label: 'Budget Oversight', icon: '🔍', area: 'analytics' },
  { id: 'safety', label: 'Public Safety Review', icon: '🛡️', area: 'reports' },
  { id: 'infra', label: 'Infrastructure Projects', icon: '🏗️', area: 'dispatch' },
  { id: 'policy', label: 'Policy Explorer', icon: '📋', area: 'analytics' },
];

// Using curated CATEGORY_SHOWCASE images first; fallback generator below keeps UI stable.

function categoryFallbackImage(type: EntityType): string {
  const icon = CATEGORY_ICONS[type] || '🧩';
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#0b5fff'/>
          <stop offset='100%' stop-color='#0f172a'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='72' y='255' font-size='118' fill='white' font-family='Segoe UI Emoji, Apple Color Emoji'>${icon}</text>
      <text x='72' y='350' font-size='56' fill='#dbeafe' font-family='Inter, Segoe UI, Arial' font-weight='700'>${type}</text>
      <text x='72' y='406' font-size='26' fill='#93c5fd' font-family='Inter, Segoe UI, Arial'>DPAL Nexus category visual</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function categoryImageForType(type: EntityType): string {
  return CATEGORY_SHOWCASE.find((c) => c.type === type)?.image || categoryFallbackImage(type);
}

const CATEGORY_INTAKE_FIELDS: Record<EntityType, IntakeField[]> = {
  City: [
    { key: 'district', label: 'District / Zone', placeholder: 'e.g., Downtown / Zone 4' },
    { key: 'department', label: 'Impacted Department', placeholder: 'e.g., Public Works / Transport' },
    { key: 'publicImpact', label: 'Public Impact', placeholder: 'e.g., traffic hazard, safety risk' },
  ],
  'County Government': [
    { key: 'agency', label: 'Agency Involved', placeholder: 'e.g., County Health, Utilities' },
    { key: 'jurisdiction', label: 'Jurisdiction Detail', placeholder: 'e.g., Unincorporated Area' },
    { key: 'riskWindow', label: 'Risk Window', placeholder: 'e.g., storm period, school hours' },
  ],
  'Hospital Network': [
    { key: 'facility', label: 'Facility / Unit', placeholder: 'e.g., ER, ICU, OR-3' },
    { key: 'patientSafetyClass', label: 'Safety Class', placeholder: 'e.g., med error, delay, sterile risk' },
    { key: 'complianceTag', label: 'Compliance Tag', placeholder: 'e.g., protocol deviation' },
  ],
  'School District': [
    { key: 'campus', label: 'Campus', placeholder: 'e.g., North High' },
    { key: 'area', label: 'Area', placeholder: 'e.g., hallway, cafeteria, bus zone' },
    { key: 'studentSafetyTag', label: 'Safety Tag', placeholder: 'e.g., bullying, facilities, supervision' },
  ],
  University: [
    { key: 'faculty', label: 'Faculty / Department', placeholder: 'e.g., Engineering / Student Affairs' },
    { key: 'governanceType', label: 'Governance Type', placeholder: 'e.g., integrity, conduct, policy' },
    { key: 'reviewBoard', label: 'Review Board', placeholder: 'e.g., Academic Integrity Office' },
  ],
  'Transit Agency': [
    { key: 'route', label: 'Route / Line', placeholder: 'e.g., Line A / Route 17' },
    { key: 'station', label: 'Station / Segment', placeholder: 'e.g., Central Station' },
    { key: 'serviceImpact', label: 'Service Impact', placeholder: 'e.g., delay, outage, safety' },
  ],
  'Police Department': [
    { key: 'precinct', label: 'Precinct / Unit', placeholder: 'e.g., Precinct 5' },
    { key: 'incidentClass', label: 'Incident Class', placeholder: 'e.g., evidence, response, conduct' },
    { key: 'priorityLevel', label: 'Priority Level', placeholder: 'e.g., P1 / P2 / P3' },
  ],
  'Fire Department': [
    { key: 'station', label: 'Station', placeholder: 'e.g., Station 12' },
    { key: 'hazardClass', label: 'Hazard Class', placeholder: 'e.g., fire risk, code issue' },
    { key: 'responseNeed', label: 'Response Need', placeholder: 'e.g., dispatch, prevention, inspection' },
  ],
  'Housing Authority': [
    { key: 'property', label: 'Property / Block', placeholder: 'e.g., Building C' },
    { key: 'tenantRisk', label: 'Tenant Risk', placeholder: 'e.g., structural, utility, safety' },
    { key: 'legalExposure', label: 'Legal Exposure', placeholder: 'e.g., low/medium/high' },
  ],
  'Utilities Provider': [
    { key: 'serviceType', label: 'Service Type', placeholder: 'e.g., power/water/gas' },
    { key: 'nodeOrZone', label: 'Grid Node / Zone', placeholder: 'e.g., Node TX-14' },
    { key: 'customerImpactBand', label: 'Customer Impact Band', placeholder: 'e.g., 1-100 / 100-1k / 1k+' },
  ],
  'Retail Chain': [
    { key: 'storeId', label: 'Store ID', placeholder: 'e.g., Store #1142' },
    { key: 'riskType', label: 'Risk Type', placeholder: 'e.g., safety, theft, ops disruption' },
    { key: 'shiftWindow', label: 'Shift Window', placeholder: 'e.g., evening peak' },
  ],
  'Logistics Company': [
    { key: 'hub', label: 'Hub / Depot', placeholder: 'e.g., Memphis Hub' },
    { key: 'routeSegment', label: 'Route Segment', placeholder: 'e.g., last-mile R7' },
    { key: 'throughputImpact', label: 'Throughput Impact', placeholder: 'e.g., low/medium/high' },
  ],
  'Banking Group': [
    { key: 'institution', label: 'Institution / Branch', placeholder: 'e.g., Branch 014' },
    { key: 'productType', label: 'Product Type', placeholder: 'e.g., ACH, card, lending' },
    { key: 'consumerHarmBand', label: 'Consumer Harm Band', placeholder: 'e.g., low/medium/high' },
  ],
  'Insurance Provider': [
    { key: 'claimType', label: 'Claim Type', placeholder: 'e.g., property, auto, health' },
    { key: 'fraudSignal', label: 'Fraud Signal', placeholder: 'e.g., repeat contractor, docs mismatch' },
    { key: 'lossBand', label: 'Loss Band', placeholder: 'e.g., <1k / 1k-10k / 10k+' },
  ],
  'Telecom Provider': [
    { key: 'networkArea', label: 'Network Area', placeholder: 'e.g., Metro Core' },
    { key: 'outageType', label: 'Outage Type', placeholder: 'e.g., tower, fiber, congestion' },
    { key: 'enterpriseRisk', label: 'Enterprise Risk', placeholder: 'e.g., SLA at risk' },
  ],
  'Airport Authority': [
    { key: 'terminal', label: 'Terminal / Zone', placeholder: 'e.g., Terminal B Gate 12' },
    { key: 'opsType', label: 'Ops Type', placeholder: 'e.g., ground safety, crowding' },
    { key: 'aviationImpact', label: 'Aviation Impact', placeholder: 'e.g., delay, compliance, safety' },
  ],
};

function portalTabIcon(tab: string, isActive?: boolean): string {
  if (tab === 'Dashboard') return isActive ? '❓' : '📊';
  if (/Reports?$/i.test(tab) || tab.includes('Case Reports') || tab.includes('Incident')) return '📄';
  if (tab.includes('Complaints') || tab.includes('Violations') || tab.includes('Conduct') || tab.includes('Integrity')) return '👥';
  if (tab.includes('ESG') || tab.includes('Policy') || tab.includes('Compliance')) return '🌿';
  if (tab.includes('Feedback') || tab.includes('Community') || tab.includes('Rider') || tab.includes('Customer') || tab.includes('Parent') || tab.includes('Student') || tab.includes('Resident') || tab.includes('Partner') || tab.includes('Client') || tab.includes('Passenger')) return '💬';
  if (tab.includes('Admin') || tab.includes('Operations') || tab.includes('Field') || tab.includes('Station') || tab.includes('Route') || tab.includes('Hub') || tab.includes('Store') || tab.includes('Terminal') || tab.includes('Network') || tab.includes('Grid') || tab.includes('Outage') || tab.includes('Inspections') || tab.includes('Inter-Agency') || tab.includes('Service Reports') || tab.includes('Clinical') || tab.includes('Campus') || tab.includes('Academic')) return '⚙️';
  return '📋';
}

const PORTAL_TABS_BY_TYPE: Record<EntityType, string[]> = {
  City: ['Dashboard', 'Reports', 'Complaints & Violations', 'ESG & Policy Compliance', 'Community Feedback', 'City Admin'],
  'County Government': ['Dashboard', 'Service Reports', 'Inter-Agency', 'Policy Compliance', 'Public Feedback', 'County Admin'],
  'Hospital Network': ['Dashboard', 'Clinical Incidents', 'Patient Safety', 'Regulatory Compliance', 'Operations Feedback', 'Hospital Admin'],
  'School District': ['Dashboard', 'Campus Reports', 'Safety & Conduct', 'Policy Compliance', 'Parent Feedback', 'District Admin'],
  University: ['Dashboard', 'Academic Reports', 'Integrity Cases', 'Policy Compliance', 'Student Feedback', 'University Admin'],
  'Transit Agency': ['Dashboard', 'Route Reports', 'Operations & Safety', 'Regulatory Compliance', 'Rider Feedback', 'Transit Admin'],
  'Police Department': ['Dashboard', 'Case Reports', 'Field Operations', 'Policy Compliance', 'Community Feedback', 'Police Admin'],
  'Fire Department': ['Dashboard', 'Incident Reports', 'Station Operations', 'Policy Compliance', 'Community Feedback', 'Fire Admin'],
  'Housing Authority': ['Dashboard', 'Tenant Reports', 'Inspections & Safety', 'Policy Compliance', 'Resident Feedback', 'Housing Admin'],
  'Utilities Provider': ['Dashboard', 'Outage Reports', 'Grid Operations', 'Regulatory Compliance', 'Customer Feedback', 'Utility Admin'],
  'Retail Chain': ['Dashboard', 'Store Reports', 'Risk Operations', 'Policy Compliance', 'Customer Feedback', 'Retail Admin'],
  'Logistics Company': ['Dashboard', 'Hub Reports', 'Route Operations', 'Policy Compliance', 'Partner Feedback', 'Logistics Admin'],
  'Banking Group': ['Dashboard', 'Case Reports', 'Complaints & Violations', 'ESG & Policy Compliance', 'Community Feedback', 'Bank Admin'],
  'Insurance Provider': ['Dashboard', 'Claim Reports', 'Fraud Operations', 'Policy Compliance', 'Client Feedback', 'Insurance Admin'],
  'Telecom Provider': ['Dashboard', 'Network Reports', 'Service Operations', 'Regulatory Compliance', 'Customer Feedback', 'Telecom Admin'],
  'Airport Authority': ['Dashboard', 'Terminal Reports', 'Ground Operations', 'Policy Compliance', 'Passenger Feedback', 'Airport Admin'],
};

const CATEGORY_PLAYBOOKS: Record<EntityType, CategoryPlaybook> = {  City: {
    operationalObjective: 'Reduce citizen risk quickly through cross-department dispatch and closure accountability.',
    workflowSteps: ['Intake validated', 'Department assigned', 'Field action logged', 'Citizen update sent', 'Case audited'],
    quickActions: [
      { label: 'Route to Public Works', route: 'Public Works', status: 'Investigating', note: 'Public works dispatch triggered.', openArea: 'dispatch' },
      { label: 'Trigger Safety Alert', route: 'City Communications', status: 'Action Taken', note: 'Public safety alert draft requested.', openArea: 'analytics' },
      { label: 'Close with Verification', route: 'City QA', status: 'Resolved', note: 'Closure verification completed with evidence.' },
    ],
  },
  'County Government': {
    operationalObjective: 'Coordinate county agencies and avoid handoff delays on high-impact cases.',
    workflowSteps: ['Jurisdiction confirmed', 'Agency handoff', 'Joint action update', 'Compliance check', 'Audit close'],
    quickActions: [
      { label: 'Assign County Ops', route: 'County Ops Desk', status: 'Investigating', note: 'County operations assignment created.' },
      { label: 'Escalate Inter-Agency', route: 'Emergency Mgmt', status: 'Action Taken', note: 'Inter-agency escalation initiated.' },
      { label: 'Mark Resolved + Oversight', route: 'County Oversight', status: 'Resolved', note: 'Resolved and sent for oversight review.' },
    ],
  },
  'Hospital Network': {
    operationalObjective: 'Protect patient safety through rapid triage, compliance checks, and clinical follow-through.',
    workflowSteps: ['Clinical triage', 'Compliance review', 'Corrective action', 'Safety signoff', 'Audit archive'],
    quickActions: [
      { label: 'Route to Clinical Risk', route: 'Clinical Risk Team', status: 'Investigating', note: 'Clinical risk review started.', openArea: 'dispatch' },
      { label: 'Open Compliance Action', route: 'Compliance Office', status: 'Action Taken', note: 'Compliance corrective action logged.' },
      { label: 'Finalize Patient Safety Case', route: 'Patient Safety Board', status: 'Resolved', note: 'Case closed after safety verification.' },
    ],
  },
  'School District': {
    operationalObjective: 'Protect students with fast intervention, counselor routing, and documented follow-up.',
    workflowSteps: ['Incident screening', 'Counselor/principal assignment', 'Intervention plan', 'Family communication', 'Follow-up closure'],
    quickActions: [
      { label: 'Assign Counselor Team', route: 'Counselor Team', status: 'Investigating', note: 'Counselor assignment created.' },
      { label: 'Log Intervention Action', route: 'School Admin', status: 'Action Taken', note: 'Intervention action recorded in case.' },
      { label: 'Close with Follow-up', route: 'District Safety Office', status: 'Resolved', note: 'Follow-up complete and case closed.' },
    ],
  },
  University: {
    operationalObjective: 'Ensure governance-quality review for campus incidents with accountable outcomes.',
    workflowSteps: ['Review intake', 'Investigate', 'Governance review', 'Decision recorded', 'Audit completion'],
    quickActions: [
      { label: 'Assign Student Affairs', route: 'Student Affairs', status: 'Investigating', note: 'Student Affairs review opened.' },
      { label: 'Record Governance Action', route: 'Governance Office', status: 'Action Taken', note: 'Governance action note saved.' },
      { label: 'Close with Counsel Signoff', route: 'Legal Counsel', status: 'Resolved', note: 'Legal signoff and closure completed.' },
    ],
  },
  'Transit Agency': {
    operationalObjective: 'Restore service reliability fast and reduce repeat disruptions by corridor.',
    workflowSteps: ['Dispatch route response', 'Mitigate disruption', 'Service recovery', 'Root-cause note', 'Close and monitor'],
    quickActions: [
      { label: 'Route Dispatch Crew', route: 'Route Dispatch', status: 'Investigating', note: 'Dispatch team assigned.' },
      { label: 'Log Service Mitigation', route: 'Infrastructure Team', status: 'Action Taken', note: 'Mitigation action entered.' },
      { label: 'Close Recovery Case', route: 'Safety Command', status: 'Resolved', note: 'Service recovery verified and closed.' },
    ],
  },
  'Police Department': { operationalObjective: 'Prioritize public safety investigations with evidence integrity.', workflowSteps: ['Triage', 'Assign unit', 'Action logged', 'Outcome validated', 'Audit'], quickActions: [{ label: 'Assign Investigations Unit', route: 'Investigations Unit', status: 'Investigating', note: 'Investigation assignment created.' }, { label: 'Log Evidence Action', route: 'Evidence Desk', status: 'Action Taken', note: 'Evidence handling action saved.' }, { label: 'Resolve and Archive', route: 'Patrol Supervisor', status: 'Resolved', note: 'Case resolved and archived.' }] },
  'Fire Department': { operationalObjective: 'Move urgent hazards through dispatch and prevention follow-up.', workflowSteps: ['Dispatch', 'On-site action', 'Prevention check', 'Outcome logged', 'Audit'], quickActions: [{ label: 'Dispatch Station Team', route: 'Station Commander', status: 'Investigating', note: 'Station team dispatched.' }, { label: 'Record Prevention Action', route: 'Fire Prevention Unit', status: 'Action Taken', note: 'Prevention action logged.' }, { label: 'Close Incident', route: 'Emergency Ops', status: 'Resolved', note: 'Incident closure confirmed.' }] },
  'Housing Authority': { operationalObjective: 'Resolve tenant risk quickly and track legal/compliance exposure.', workflowSteps: ['Triage tenant risk', 'Inspect', 'Remediation', 'Compliance check', 'Close'], quickActions: [{ label: 'Assign Inspection Unit', route: 'Inspection Unit', status: 'Investigating', note: 'Inspection assignment created.' }, { label: 'Log Remediation Action', route: 'Tenant Protection Desk', status: 'Action Taken', note: 'Remediation action registered.' }, { label: 'Close with Compliance Note', route: 'Legal Affairs', status: 'Resolved', note: 'Compliance closure note completed.' }] },
  'Utilities Provider': { operationalObjective: 'Minimize outage impact through rapid dispatch and regulatory readiness.', workflowSteps: ['Outage triage', 'Crew dispatch', 'Restoration action', 'Regulatory note', 'Close'], quickActions: [{ label: 'Assign Grid Ops', route: 'Grid Ops Center', status: 'Investigating', note: 'Grid operations team assigned.' }, { label: 'Log Restoration Action', route: 'Field Crew Dispatch', status: 'Action Taken', note: 'Restoration action logged.' }, { label: 'Resolve and Report', route: 'Regulatory Desk', status: 'Resolved', note: 'Case resolved and regulatory note saved.' }] },
  'Retail Chain': { operationalObjective: 'Reduce store risk and loss exposure with fast case handling.', workflowSteps: ['Store triage', 'Risk assignment', 'Mitigation', 'Manager signoff', 'Close'], quickActions: [{ label: 'Assign Store Manager', route: 'Store Manager', status: 'Investigating', note: 'Store manager assigned.' }, { label: 'Log Loss Prevention Action', route: 'Loss Prevention', status: 'Action Taken', note: 'Loss prevention step recorded.' }, { label: 'Resolve Store Case', route: 'Regional Risk Office', status: 'Resolved', note: 'Store case resolved and signed off.' }] },
  'Logistics Company': { operationalObjective: 'Protect network throughput and safety through structured incident routing.', workflowSteps: ['Hub triage', 'Route assignment', 'Mitigation', 'Claims note', 'Close'], quickActions: [{ label: 'Assign Hub Ops Lead', route: 'Hub Ops Lead', status: 'Investigating', note: 'Hub ops lead assigned.' }, { label: 'Log Route Mitigation', route: 'Driver Safety Office', status: 'Action Taken', note: 'Route mitigation captured.' }, { label: 'Close Logistics Case', route: 'Claims Desk', status: 'Resolved', note: 'Case closed with claims review.' }] },
  'Banking Group': { operationalObjective: 'Protect consumers with enforcement-grade triage and resolution tracking.', workflowSteps: ['Complaint triage', 'Risk review', 'Legal/referral action', 'Outcome recorded', 'Audit'], quickActions: [{ label: 'Assign Fraud Unit', route: 'Fraud Unit', status: 'Investigating', note: 'Fraud review initiated.' }, { label: 'Log Enforcement Action', route: 'Compliance Officer', status: 'Action Taken', note: 'Enforcement action documented.' }, { label: 'Close with Restitution Note', route: 'Branch Ops Lead', status: 'Resolved', note: 'Case closed with restitution tracking.' }] },
  'Insurance Provider': { operationalObjective: 'Detect high-risk claim patterns and enforce integrity workflows.', workflowSteps: ['Intake score', 'Investigation', 'Legal referral', 'Outcome', 'Audit'], quickActions: [{ label: 'Assign Claims Supervisor', route: 'Claims Supervisor', status: 'Investigating', note: 'Claims review assigned.' }, { label: 'Log Fraud Signal Action', route: 'Fraud Analyst', status: 'Action Taken', note: 'Fraud signal action logged.' }, { label: 'Resolve Claim Integrity Case', route: 'Legal Review', status: 'Resolved', note: 'Integrity case closed with legal note.' }] },
  'Telecom Provider': { operationalObjective: 'Restore service quality quickly and reduce repeat outage complaints.', workflowSteps: ['NOC triage', 'Field assignment', 'Fix action', 'Customer update', 'Close'], quickActions: [{ label: 'Assign NOC Team', route: 'Network NOC', status: 'Investigating', note: 'NOC assignment created.' }, { label: 'Log Service Restoration', route: 'Field Tech Dispatch', status: 'Action Taken', note: 'Service restoration action saved.' }, { label: 'Close Network Case', route: 'Customer Recovery Desk', status: 'Resolved', note: 'Network case closed and customer update sent.' }] },
  'Airport Authority': { operationalObjective: 'Keep terminal and ground ops safe with rapid incident control.', workflowSteps: ['Ops triage', 'Ground dispatch', 'Safety action', 'Compliance check', 'Close'], quickActions: [{ label: 'Assign Terminal Ops', route: 'Terminal Ops', status: 'Investigating', note: 'Terminal ops assigned.' }, { label: 'Log Ground Safety Action', route: 'Ground Safety Unit', status: 'Action Taken', note: 'Ground safety action logged.' }, { label: 'Close Aviation Incident', route: 'Aviation Compliance', status: 'Resolved', note: 'Aviation case closed with compliance check.' }] },
};

export default function EnhancedNexusPrototype() {
  const [entities, setEntities] = useState<Entity[]>(COMPLETE_ENTITIES);
  const [selectedType, setSelectedType] = useState<EntityType | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState('nyc-city');
  const [view, setView] = useState<DashboardView>('Executive');
  const [activeArea, setActiveArea] = useState<ActionArea>('reports');
  const [reportsByEntity, setReportsByEntity] = useState<Record<string, Report[]>>(Object.fromEntries(COMPLETE_ENTITIES.map((e) => [e.id, e.reports])));
  const [selectedReportId, setSelectedReportId] = useState<string>('NYC-1001');
  const [apiBaseInput, setApiBaseInput] = useState<string>(defaultApiBase);
  const apiBase = apiBaseInput.trim();
  const [syncMessage, setSyncMessage] = useState<string>(apiBase ? 'Connected to DPAL API' : 'Using demo data (set NEXT_PUBLIC_DPAL_API_BASE)');
  const [isSyncing, setIsSyncing] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [auditEntries, setAuditEntries] = useState<string[]>([]);
  const [categoryViewMode, setCategoryViewMode] = useState<'featured' | 'all' | 'single'>('featured');
  const [aiByReportId, setAiByReportId] = useState<Record<string, AiInsight>>({});
  const [aiLoadingFor, setAiLoadingFor] = useState<string>('');
  const [executiveBrief, setExecutiveBrief] = useState('');
  const [executiveBriefLoading, setExecutiveBriefLoading] = useState(false);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSummary, setNewItemSummary] = useState('');
  const [newItemSeverity, setNewItemSeverity] = useState<Severity>('Moderate');
  const [newItemChannel, setNewItemChannel] = useState<Report['channel']>('App');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemFields, setNewItemFields] = useState<Record<string, string>>({});
  const [mockLinkResponse, setMockLinkResponse] = useState('');
  const [interactionMessage, setInteractionMessage] = useState('');
  const [endpointStatus, setEndpointStatus] = useState<Record<string, 'ok' | 'fail' | 'idle'>>({
    health: 'idle',
    reportsFeed: 'idle',
    createItem: 'idle',
    updateStatus: 'idle',
    aiAsk: 'idle',
    aiTriage: 'idle',
    aiSimilar: 'idle',
  });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<'actionNote' | 'newSummary'>('actionNote');
  const [auditWorkTitle, setAuditWorkTitle] = useState('');
  const [auditWorkAssignee, setAuditWorkAssignee] = useState('');
  const [personOfInterest, setPersonOfInterest] = useState('');
  const [auditWorkItems, setAuditWorkItems] = useState<Array<{ id: string; title: string; assignee: string; status: 'Open' | 'In Review' | 'Closed' }>>([]);
  const [poiItems, setPoiItems] = useState<Array<{ id: string; name: string; risk: 'Low' | 'Moderate' | 'High'; note: string }>>([]);
  const [entityEditorName, setEntityEditorName] = useState('');
  const [entityEditorRegion, setEntityEditorRegion] = useState('');
  const [entityEditorStatus, setEntityEditorStatus] = useState<Status>('Active');
  const [activePortalTab, setActivePortalTab] = useState<string>('Dashboard');
  const [previousPortalTab, setPreviousPortalTab] = useState<string>('Dashboard');
  const [activeTool, setActiveTool] = useState<string>('');
  const [entitySearch, setEntitySearch] = useState('');
  const [entitySearchOpen, setEntitySearchOpen] = useState(false);
  const [userEvidenceByReport, setUserEvidenceByReport] = useState<Record<string, Array<{id: string; type: string; label: string; url: string; addedAt: string}>>>({});
  const [newEvidenceLabel, setNewEvidenceLabel] = useState('');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'photo' | 'document' | 'data' | 'video'>('photo');

  const typeOptions = useMemo(() => ['All', ...Array.from(new Set(entities.map((e) => e.type)))] as const, [entities]);
  const featuredCategoryTypes = useMemo(() => ['City', 'School District', 'Hospital Network', 'Banking Group', 'Utilities Provider', 'Housing Authority'], [] as string[]);
  const categoryCards = useMemo(() => {
    const fallbackType = entities.find((e) => e.id === selectedEntityId)?.type || entities[0]?.type || 'City';
    const singleType = (selectedType === 'All' ? fallbackType : selectedType) as EntityType;
    const base =
      categoryViewMode === 'all'
        ? CATEGORY_SHOWCASE
        : categoryViewMode === 'single'
        ? CATEGORY_SHOWCASE.filter((c) => c.type === singleType)
        : (() => {
            const featured = CATEGORY_SHOWCASE.filter((c) => featuredCategoryTypes.includes(c.type));
            return featured.length ? featured : CATEGORY_SHOWCASE.slice(0, 6);
          })();

    return base.map((c) => ({ ...c, image: categoryImageForType(c.type) }));
  }, [categoryViewMode, featuredCategoryTypes, selectedType, selectedEntityId, entities]);
  const filteredEntities = useMemo(() => (selectedType === 'All' ? entities : entities.filter((e) => e.type === selectedType)), [selectedType, entities]);
  const selectedEntity = filteredEntities.find((entity) => entity.id === selectedEntityId) || filteredEntities[0] || entities[0];
  const portalTabs = PORTAL_TABS_BY_TYPE[selectedEntity.type] || PORTAL_TABS_BY_TYPE.City;
  const currentReports = reportsByEntity[selectedEntity.id] || [];
  const selectedReport = currentReports.find((r) => r.id === selectedReportId) || currentReports[0];

  const counts = useMemo(() => {
    const total = currentReports.length;
    const byStatus = {
      New: currentReports.filter((r) => r.status === 'New').length,
      Investigating: currentReports.filter((r) => r.status === 'Investigating').length,
      'Action Taken': currentReports.filter((r) => r.status === 'Action Taken').length,
      Resolved: currentReports.filter((r) => r.status === 'Resolved').length,
    };
    return { total, byStatus };
  }, [currentReports]);

  const logAction = (text: string) => {
    const stamp = new Date().toLocaleTimeString();
    setAuditEntries((prev) => [`${stamp} - ${text}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    setActivePortalTab('Dashboard');
    setActiveTool('');
  }, [selectedEntity.type]);

  const logAgent = (text: string) => {
    const stamp = new Date().toLocaleTimeString();
    setAgentLog((prev) => [`${stamp} - ${text}`, ...prev].slice(0, 12));
  };

  const selectEntityByIndexShift = (shift: number) => {
    if (!filteredEntities.length) return;
    const currentIndex = filteredEntities.findIndex((e) => e.id === selectedEntity.id);
    const nextIndex = (currentIndex + shift + filteredEntities.length) % filteredEntities.length;
    const nextEntity = filteredEntities[nextIndex];
    setSelectedEntityId(nextEntity.id);
    setSelectedReportId((reportsByEntity[nextEntity.id] || nextEntity.reports)[0]?.id || '');
    logAction(`Switched entity to ${nextEntity.name}`);
  };

  const createEntityFromEditor = () => {
    if (!entityEditorName.trim()) return;
    const typeForCreate: EntityType = selectedType === 'All' ? selectedEntity.type : selectedType;
    const idBase = `${entityEditorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'entity'}-${Date.now().toString().slice(-5)}`;
    const created: Entity = {
      id: idBase,
      name: entityEditorName.trim(),
      type: typeForCreate,
      region: entityEditorRegion.trim() || 'US-NA',
      status: entityEditorStatus,
      confidence: 88,
      heroImage: categoryImageForType(typeForCreate),
      kpis: selectedEntity.kpis,
      valueStats: selectedEntity.valueStats,
      modules: selectedEntity.modules,
      reports: [],
    };
    setEntities((prev) => [created, ...prev]);
    setReportsByEntity((prev) => ({ ...prev, [created.id]: [] }));
    setSelectedType(typeForCreate);
    setSelectedEntityId(created.id);
    setSelectedReportId('');
    setInteractionMessage(`Entity created: ${created.name}`);
    logAction(`Created entity ${created.name} (${created.type})`);
  };

  const updateCurrentEntity = () => {
    if (!selectedEntity || !entityEditorName.trim()) return;
    const updated = {
      ...selectedEntity,
      name: entityEditorName.trim(),
      region: entityEditorRegion.trim() || selectedEntity.region,
      status: entityEditorStatus,
    };
    setEntities((prev) => prev.map((e) => (e.id === selectedEntity.id ? updated : e)));
    setInteractionMessage(`Entity updated: ${updated.name}`);
    logAction(`Updated entity ${updated.name}`);
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setInteractionMessage('Voice not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    setVoiceEnabled(true);
    logAction('Voice playback started');
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setInteractionMessage('Voice playback stopped.');
      logAction('Voice playback stopped');
    }
  };

  const startVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setInteractionMessage('Voice input not supported in this browser.');
      return;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceListening(true);
    recognition.onresult = (event: any) => {
      const transcript = String(event?.results?.[0]?.[0]?.transcript || '').trim();
      if (!transcript) return;
      if (voiceTarget === 'actionNote') {
        setActionNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
      } else {
        setNewItemSummary((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
      setInteractionMessage(`Voice captured into ${voiceTarget === 'actionNote' ? 'Action Note' : 'New Item Summary'}.`);
      logAction(`Voice dictation captured for ${voiceTarget}`);
    };
    recognition.onerror = () => {
      setInteractionMessage('Voice input failed. Try again.');
    };
    recognition.onend = () => {
      setVoiceListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    try {
      const rawReports = localStorage.getItem('nexus_reports_state_v1');
      const rawAudit = localStorage.getItem('nexus_audit_state_v1');
      const rawEvidence = localStorage.getItem('nexus_evidence_state_v1');
      if (rawReports) setReportsByEntity(JSON.parse(rawReports));
      if (rawAudit) setAuditEntries(JSON.parse(rawAudit));
      if (rawEvidence) setUserEvidenceByReport(JSON.parse(rawEvidence));
    } catch {
      // ignore hydrate errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_reports_state_v1', JSON.stringify(reportsByEntity));
      localStorage.setItem('nexus_audit_state_v1', JSON.stringify(auditEntries));
      localStorage.setItem('nexus_evidence_state_v1', JSON.stringify(userEvidenceByReport));
    } catch {
      // ignore persistence errors
    }
  }, [reportsByEntity, auditEntries, userEvidenceByReport]);

  useEffect(() => {
    const currentType: EntityType = selectedType === 'All' ? selectedEntity.type : selectedType;
    const base: Record<string, string> = {};
    (CATEGORY_INTAKE_FIELDS[currentType] || []).forEach((f) => {
      base[f.key] = '';
    });
    setNewItemFields(base);
  }, [selectedType, selectedEntity.type]);

  useEffect(() => {
    if (!selectedEntity) return;
    setEntityEditorName(selectedEntity.name);
    setEntityEditorRegion(selectedEntity.region);
    setEntityEditorStatus(selectedEntity.status);
  }, [selectedEntity.id]);

  useEffect(() => {
    if (!apiBase) return;

    const fetchLiveReports = async () => {
      try {
        setIsSyncing(true);
        setSyncMessage('Syncing live reports from DPAL API...');

        const params = new URLSearchParams({
          limit: '60',
          entityType: selectedEntity.type,
          entityName: selectedEntity.name,
        });

        const response = await fetch(`${apiBase}/api/reports/feed?${params.toString()}`);
        if (!response.ok) throw new Error(`feed_http_${response.status}`);

        const json = await response.json();
        const items = Array.isArray(json?.items) ? json.items : [];

        const mapped: Report[] = items.map((item: any) => ({
          id: String(item.reportId || `RPT-${Math.random().toString(36).slice(2, 8)}`),
          title: String(item.title || 'Untitled report'),
          severity: (['Low', 'Moderate', 'High'].includes(String(item.severity)) ? String(item.severity) : 'Moderate') as Severity,
          status: (['New', 'Investigating', 'Action Taken', 'Resolved'].includes(String(item.opsStatus)) ? String(item.opsStatus) : 'New') as ReportStatus,
          location: String(item.location || 'Unknown'),
          eta: String(item.opsStatus === 'Resolved' ? 'Completed' : 'TBD'),
          channel: (['App', 'WhatsApp', 'Web Portal', 'Hotline', 'Field Team'].includes(String(item.channel)) ? String(item.channel) : 'Web Portal') as Report['channel'],
          summary: String(item.description || 'No summary provided.'),
        }));

        if (mapped.length) {
          setReportsByEntity((prev) => ({ ...prev, [selectedEntity.id]: mapped }));
          setSelectedReportId(mapped[0].id);
        }

        setSyncMessage(mapped.length ? `Live sync active: ${mapped.length} reports loaded` : 'Live sync active: no matching reports yet');
      } catch (error) {
        console.error(error);
        setSyncMessage('Live sync failed; showing latest local/demo state');
      } finally {
        setIsSyncing(false);
      }
    };

    void fetchLiveReports();
  }, [selectedEntity.id, selectedEntity.name, selectedEntity.type]);

  const updateReportStatus = async (reportId: string, next: ReportStatus, meta?: { assignedTo?: string; note?: string }) => {
    const note = (meta?.note || actionNote).trim() || `Updated from Nexus console (${selectedEntity.name})`;
    const assignee = (meta?.assignedTo || assignedTo).trim();
    setReportsByEntity((prev) => ({
      ...prev,
      [selectedEntity.id]: (prev[selectedEntity.id] || []).map((report) =>
        report.id === reportId
          ? {
              ...report,
              status: next,
              eta: next === 'Resolved' ? 'Completed' : report.eta,
              assignedTo: assignee || report.assignedTo,
              lastActionNote: note,
            }
          : report
      ),
    }));

    if (apiBase) {
      try {
        const response = await fetch(`${apiBase}/api/reports/${encodeURIComponent(reportId)}/ops-status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next, note }),
        });
        if (!response.ok) throw new Error(`ops_status_http_${response.status}`);
        setSyncMessage(`Status updated in DPAL database: ${reportId} → ${next}`);
      } catch (error) {
        console.error(error);
        setSyncMessage(`Could not persist ${reportId} to API; local UI updated`);
      }
    }

    logAction(`${reportId} changed to ${next}${assignee ? ` (assigned: ${assignee})` : ''}`);
    setActionNote('');
    setActiveArea('audit');
  };

  const createNewItem = async () => {
    if (!newItemTitle.trim()) return;

    const reportId = `NEX-${Date.now().toString().slice(-8)}`;
    const localItem: Report = {
      id: reportId,
      title: newItemTitle.trim(),
      summary: newItemSummary.trim() || 'No summary provided.',
      severity: newItemSeverity,
      status: 'New',
      location: newItemLocation.trim() || selectedEntity.region,
      eta: 'TBD',
      channel: newItemChannel,
    };

    setReportsByEntity((prev) => ({ ...prev, [selectedEntity.id]: [localItem, ...(prev[selectedEntity.id] || [])] }));
    setSelectedReportId(reportId);

    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/reports/anchor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportId,
            title: localItem.title,
            description: localItem.summary,
            category: selectedEntity.type,
            location: localItem.location,
            severity: localItem.severity,
            channel: localItem.channel,
            entityType: selectedEntity.type,
            entityName: selectedEntity.name,
            opsStatus: 'New',
            structuredData: { source: 'nexus_console', intakeFields: newItemFields },
          }),
        });
        if (!res.ok) throw new Error(`anchor_http_${res.status}`);
        setSyncMessage(`New item created and saved to DPAL DB: ${reportId}`);
      } catch (error) {
        console.error(error);
        setSyncMessage(`Item created locally, API save failed for ${reportId}`);
      }
    }

    logAction(`Created new item ${reportId}`);
    setNewItemTitle('');
    setNewItemSummary('');
    setNewItemLocation('');
    setNewItemSeverity('Moderate');
    setNewItemChannel('App');
    setNewItemFields((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, ''])));
  };

  const testIntegration = async () => {
    if (!apiBase) {
      setSyncMessage('Set API base URL first.');
      return;
    }

    const probe = async (key: keyof typeof endpointStatus, run: () => Promise<Response>) => {
      try {
        const res = await run();
        setEndpointStatus((prev) => ({ ...prev, [key]: res.ok ? 'ok' : 'fail' }));
        return res.ok;
      } catch {
        setEndpointStatus((prev) => ({ ...prev, [key]: 'fail' }));
        return false;
      }
    };

    try {
      setIsSyncing(true);
      setEndpointStatus({
        health: 'idle',
        reportsFeed: 'idle',
        createItem: 'idle',
        updateStatus: 'idle',
        aiAsk: 'idle',
        aiTriage: 'idle',
        aiSimilar: 'idle',
      });

      const sample = currentReports[0] || {
        id: 'PING-001',
        title: 'Integration test case',
        summary: 'Integration test summary',
        severity: 'Moderate',
        location: selectedEntity.region,
        channel: 'App',
      };

      const checks = await Promise.all([
        probe('health', () => fetch(`${apiBase}/health`)),
        probe('reportsFeed', () => fetch(`${apiBase}/api/reports/feed?limit=1`)),
        probe('createItem', () =>
          fetch(`${apiBase}/api/reports/anchor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reportId: `PING-${Date.now()}`,
              title: 'Connectivity probe',
              description: 'Endpoint connectivity probe from Nexus',
              category: selectedEntity.type,
              location: selectedEntity.region,
              severity: 'Low',
              channel: 'App',
              entityType: selectedEntity.type,
              entityName: selectedEntity.name,
              opsStatus: 'New',
            }),
          })
        ),
        probe('updateStatus', () =>
          fetch(`${apiBase}/api/reports/${encodeURIComponent(sample.id)}/ops-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Investigating', note: 'Integration status probe' }),
          })
        ),
        probe('aiAsk', () =>
          fetch(`${apiBase}/api/ai/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Return one short sentence: integration ok.' }),
          })
        ),
        probe('aiTriage', () =>
          fetch(`${apiBase}/api/ai/triage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantType: selectedEntity.type, tenantName: selectedEntity.name, category: 'Integration', report: sample }),
          })
        ),
        probe('aiSimilar', () =>
          fetch(`${apiBase}/api/ai/similar-cases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report: sample, candidates: currentReports.slice(0, 3) }),
          })
        ),
      ]);

      const okCount = checks.filter(Boolean).length;
      setSyncMessage(`Integration check complete: ${okCount}/7 endpoints healthy.`);
      logAction(`Integration check completed (${okCount}/7)`);
    } catch (error) {
      console.error(error);
      setSyncMessage('Integration check failed. Verify Railway URL, CORS, and Mongo connectivity.');
      logAction('Integration check failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const openArea = (area: ActionArea) => {
    setActiveArea(area);
    const tabs = PORTAL_TABS_BY_TYPE[selectedEntity.type] || PORTAL_TABS_BY_TYPE.City;
    const nextTab = getTabForArea(area, tabs);
    if (nextTab !== activePortalTab) setPreviousPortalTab(activePortalTab);
    setActivePortalTab(nextTab);
    const areaLabel = ACTION_AREAS.find((a) => a.key === area)?.label || area;
    setInteractionMessage(`${areaLabel} — ${selectedEntity.name}. View updated.`);
    logAction(`Switched section to ${area}`);
  };

  const openTool = (toolName: string) => {
    const lower = toolName.toLowerCase();
    const area: ActionArea =
      lower.includes('legal') || lower.includes('audit') || lower.includes('trail') ? 'audit'
      : lower.includes('analytics') || lower.includes('radar') || lower.includes('packet') || lower.includes('scoring') || lower.includes('board') && lower.includes('risk') ? 'analytics'
      : lower.includes('queue') || lower.includes('intake') || lower.includes('report') || lower.includes('feed') ? 'reports'
      : 'dispatch';

    const noteMap: Partial<Record<string, string>> = {
      'Tenant Protection Workflow': 'Tenant protection protocol initiated. Documenting hazard conditions. Emergency inspection required within 24h.',
      'Inspection Assignment': 'Inspection assigned and scheduled. Inspector dispatched with access confirmation from building manager.',
      'Legal Escalation Matrix': 'Legal escalation initiated. Case flagged for potential code violation and tenant rights review. Legal hold in place.',
      'Clinical Risk Triage': 'Clinical risk triage initiated. Protocol review underway. Safety team and ward supervisor notified.',
      'Compliance Packet Builder': 'Compliance packet assembled. Regulatory documentation package ready for submission.',
      'Patient Safety Escalation': 'Patient safety incident escalated to Patient Safety Board. Root cause analysis initiated.',
      'Citizen Intake Routing': 'Citizen complaint routed through intake queue. Department assignment completed.',
      'Public Works Dispatch': 'Public works crew dispatched. ETA confirmed. Task scope logged in system.',
      'Traffic Risk Radar': 'Traffic risk analysis initiated. Corridor signals and routing data under review.',
      'Campus Escalation Protocol': 'Campus escalation protocol activated. Principal, counselor, and district safety office notified.',
      'Counselor Routing': 'Counselor routing initiated. Case assigned based on severity score and availability.',
      'Parent Communication Composer': 'Parent communication drafted using safe-language template. Awaiting supervisor review before send.',
      'Priority Dispatch Triage': 'Priority dispatch initiated. Unit assigned based on case severity tier and closest available resources.',
      'Evidence Chain Tracker': 'Evidence chain tracking opened. Chain-of-custody documentation started with timestamp.',
      'Precinct Risk Board': 'Precinct risk board updated with latest case data and patrol zone risk index.',
      'Emergency Dispatch Board': 'Emergency dispatch logged. Station response initiated. Response timer started.',
      'Hydrant Readiness Checks': 'Hydrant readiness verification initiated. Field crew assigned to inspection route.',
      'Post-Incident Workflow': 'Post-incident documentation workflow opened. After-action report template loaded.',
      'Outage Response SOP': 'Outage response SOP activated. Field crew dispatched to primary restoration point.',
      'Field Crew Dispatch': 'Field crew assigned and dispatched. ETA and task zone logged.',
      'Regulator Notification Template': 'Regulator notification drafted. Incident data and response timeline included.',
      'Inter-Agency Handoff': 'Inter-agency handoff initiated. Receiving agency notified with case summary and documentation.',
      'Fraud Escalation Queue': 'Fraud escalation case opened. Compliance officer and branch manager notified.',
      'Consumer Harm Scoring': 'Consumer harm score calculated. Risk tier assigned for response prioritization.',
      'Restitution Workflow': 'Restitution tracking workflow initiated. Calculation and approval pipeline started.',
      'Claim Integrity Scoring': 'Claim integrity score generated. Risk flags identified and assigned to investigation team.',
      'Fraud Signal Review': 'Fraud signal review initiated. Pattern analysis running across related claims.',
      'Legal Exposure Tracker': 'Legal exposure tracker opened. Liability surface documented and counsel notified.',
      'Network Outage Triage': 'NOC triage initiated. Affected towers and service zones identified on outage map.',
      'Tower Dispatch Board': 'Tower dispatch board updated. Field tech assigned to affected tower location.',
      'SLA Risk Watch': 'SLA risk watch activated. Aging cases flagged for immediate action to avoid breach.',
      'Terminal Incident Queue': 'Terminal incident logged. Terminal ops team and security management notified.',
      'Ground Ops Safety': 'Ground ops safety review initiated. Incident area secured. Safety officer assigned.',
      'Aviation Compliance Workflow': 'Aviation compliance workflow opened. Incident documentation and regulator notification drafted.',
      'Hub Disruption Board': 'Hub disruption logged. Route mitigation plan initiated. Driver advisory sent.',
      'Driver Safety Queue': 'Driver safety case opened. Fleet manager and HR notified. Incident report filed.',
      'Claims Triage': 'Claims triage initiated. Initial scoring complete. Assigned to claims supervisor.',
      'Store Risk Feed': 'Store risk case opened. Regional loss prevention team alerted. Manager notified.',
      'Loss Prevention Queue': 'Loss prevention case created. Evidence preservation request sent to store.',
      'Regional Incident Dispatch': 'Regional dispatch initiated. On-site team en route with case brief.',
      'Academic Integrity Workflow': 'Academic integrity case opened. Student Affairs and faculty committee notified.',
      'Governance Review Queue': 'Governance review queue entry created. Committee members notified of pending case.',
      'Campus Security Feed': 'Campus security alert logged. Patrol routed to incident area.',
      'Route Disruption Console': 'Route disruption logged. Alternative routing activated. Passenger alerts sent.',
      'Station Safety Queue': 'Station safety case opened. Station supervisor and maintenance team notified.',
      'Recovery SLA Tracker': 'SLA recovery tracker activated. Time-to-restore target set and monitored.',
      'District Heatmap': 'District heatmap view opened. Incident clusters identified for priority response.',
      'Inspection Unit': 'Inspection unit assignment initiated. Unit dispatched to location.',
    };

    const fallbackNote = `${toolName} initiated for ${selectedEntity.name}. Action required within SLA. Document all steps taken.`;
    const note = noteMap[toolName] || fallbackNote;

    const referralBase = referralTargets(currentReports[0] || {
      id: 'TOOL-001', title: toolName, severity: 'Moderate', status: 'New',
      channel: 'App', location: selectedEntity.region, eta: 'TBD', summary: '',
    } as Report);
    const defaultAssignee = referralBase[0] || 'Operations Team';

    openArea(area);
    setAssignedTo(defaultAssignee);
    setActionNote(note);
    setActiveTool(toolName);
    setInteractionMessage(`Tool: ${toolName} — Action Center pre-filled. Review and submit below.`);
    logAction(`Opened tool panel: ${toolName}`);
  };

  const quickRefer = async (report: Report, target: string) => {
    await updateReportStatus(report.id, 'Investigating', {
      assignedTo: target,
      note: `Referred to ${target} from reports queue`,
    });
  };

  const categoryTools = (type: EntityType) => {
    const common = ['Reports Queue', 'Action Center', 'Analytics', 'Audit Trail', 'AI Copilot', 'Voice Controls'];
    const byType: Partial<Record<EntityType, string[]>> = {
      City: ['Citizen Intake Routing', 'Public Works Dispatch', 'Traffic Risk Radar'],
      'Hospital Network': ['Clinical Risk Triage', 'Compliance Packet Builder', 'Patient Safety Escalation'],
      'School District': ['Campus Escalation Protocol', 'Counselor Routing', 'Parent Communication Composer'],
      'County Government': ['Inter-Agency Handoff', 'Storm Readiness Board', 'Constituent Escalation Tracker'],
      University: ['Academic Integrity Workflow', 'Governance Review Queue', 'Campus Security Feed'],
      'Transit Agency': ['Route Disruption Console', 'Station Safety Queue', 'Recovery SLA Tracker'],
      'Police Department': ['Priority Dispatch Triage', 'Evidence Chain Tracker', 'Precinct Risk Board'],
      'Fire Department': ['Emergency Dispatch Board', 'Hydrant Readiness Checks', 'Post-Incident Workflow'],
      'Housing Authority': ['Tenant Protection Workflow', 'Inspection Assignment', 'Legal Escalation Matrix'],
      'Utilities Provider': ['Outage Response SOP', 'Field Crew Dispatch', 'Regulator Notification Template'],
      'Retail Chain': ['Store Risk Feed', 'Loss Prevention Queue', 'Regional Incident Dispatch'],
      'Logistics Company': ['Hub Disruption Board', 'Driver Safety Queue', 'Claims Triage'],
      'Banking Group': ['Fraud Escalation Queue', 'Consumer Harm Scoring', 'Restitution Workflow'],
      'Insurance Provider': ['Claim Integrity Scoring', 'Fraud Signal Review', 'Legal Exposure Tracker'],
      'Telecom Provider': ['Network Outage Triage', 'Tower Dispatch Board', 'SLA Risk Watch'],
      'Airport Authority': ['Terminal Incident Queue', 'Ground Ops Safety', 'Aviation Compliance Workflow'],
    };

    return [...(byType[type] || []), ...common];
  };

  const categoryLinks = (type: EntityType) => {
    const base: Array<{ label: string; action: string }> = [
      { label: 'Open Policy Playbook', action: 'Policy guidance loaded for this category.' },
      { label: 'Open Compliance Checklist', action: 'Compliance checklist generated with required controls.' },
      { label: 'Open Partner Referral Guide', action: 'Referral map prepared for agency/partner handoff.' },
    ];

    const byType: Partial<Record<EntityType, Array<{ label: string; action: string }>>> = {
      City: [
        { label: 'City Department Routing', action: 'Routing matrix loaded for Public Works / Safety / Legal.' },
        { label: 'Citizen Alert Draft', action: 'Public advisory draft prepared for city communications.' },
        { label: 'District Hotspot Summary', action: 'District-level reporting summary generated for active hotspots.' },
      ],
      'County Government': [
        { label: 'Inter-Agency Dispatch Map', action: 'County inter-agency handoff map loaded for report routing.' },
        { label: 'Storm Response Checklist', action: 'Storm preparedness checklist opened with SLA checkpoints.' },
        { label: 'Constituent Escalation Digest', action: 'Escalation digest generated for unresolved county issues.' },
      ],
      'Hospital Network': [
        { label: 'Clinical Incident SOP', action: 'Clinical safety SOP opened for rapid response workflow.' },
        { label: 'Regulatory Packet Builder', action: 'Mock regulatory packet assembled for review.' },
        { label: 'Patient Safety Escalation Log', action: 'Patient safety escalation log prepared for compliance reporting.' },
      ],
      'School District': [
        { label: 'Campus Escalation Protocol', action: 'Campus-level escalation path displayed for admin/counselor.' },
        { label: 'Parent Communication Template', action: 'Parent-safe communication draft generated.' },
        { label: 'Campus Risk Digest', action: 'Campus risk digest exported for district reporting.' },
      ],
      University: [
        { label: 'Academic Integrity Workflow', action: 'Academic integrity workflow opened with referral path.' },
        { label: 'Campus Governance Checklist', action: 'Governance checklist generated for oversight reporting.' },
        { label: 'Student Risk Summary', action: 'Student incident summary prepared for leadership review.' },
      ],
      'Transit Agency': [
        { label: 'Route Disruption Playbook', action: 'Route disruption playbook opened for rapid mitigation.' },
        { label: 'Station Incident Matrix', action: 'Station incident matrix loaded by severity and SLA.' },
        { label: 'Service Recovery Brief', action: 'Service recovery brief generated for operations reporting.' },
      ],
      'Police Department': [
        { label: 'Priority Dispatch Matrix', action: 'Priority dispatch matrix opened with escalation routing.' },
        { label: 'Evidence Chain Checklist', action: 'Evidence chain checklist generated for case integrity.' },
        { label: 'Precinct Risk Brief', action: 'Precinct risk brief generated for command review.' },
      ],
      'Fire Department': [
        { label: 'Emergency Dispatch SOP', action: 'Emergency dispatch SOP loaded for active incidents.' },
        { label: 'Hydrant Readiness Log', action: 'Hydrant readiness log prepared for compliance checks.' },
        { label: 'Post-Incident Report Pack', action: 'Post-incident report pack generated for audit.' },
      ],
      'Housing Authority': [
        { label: 'Tenant Protection Workflow', action: 'Tenant safety and inspection workflow preview loaded.' },
        { label: 'Legal Escalation Matrix', action: 'Legal escalation conditions and SLA shown.' },
        { label: 'Inspection Backlog Report', action: 'Inspection backlog report generated for housing operations.' },
      ],
      'Utilities Provider': [
        { label: 'Outage Risk SOP', action: 'Outage response SOP opened for operations and field teams.' },
        { label: 'Regulator Notification Template', action: 'Regulatory notification draft generated.' },
        { label: 'Grid Reliability Brief', action: 'Grid reliability brief generated for executive reporting.' },
      ],
      'Retail Chain': [
        { label: 'Store Incident Routing', action: 'Store incident routing matrix opened for rapid triage.' },
        { label: 'Loss Prevention Summary', action: 'Loss prevention summary generated for regional review.' },
        { label: 'Safety Compliance Snapshot', action: 'Store safety compliance snapshot exported.' },
      ],
      'Logistics Company': [
        { label: 'Hub Disruption Workflow', action: 'Hub disruption workflow opened with response owners.' },
        { label: 'Driver Safety Digest', action: 'Driver safety digest generated for operations leadership.' },
        { label: 'Claims Risk Report', action: 'Claims risk report prepared for escalation review.' },
      ],
      'Banking Group': [
        { label: 'Consumer Harm Scoring Guide', action: 'Harm scoring rules loaded for fraud/misconduct complaints.' },
        { label: 'Restitution Workflow', action: 'Restitution tracking workflow preview opened.' },
        { label: 'Regulatory Exposure Brief', action: 'Regulatory exposure brief generated for compliance team.' },
      ],
      'Insurance Provider': [
        { label: 'Claim Integrity Workflow', action: 'Claim integrity workflow opened with fraud checkpoints.' },
        { label: 'Fraud Signal Review', action: 'Fraud signal review panel loaded for triage.' },
        { label: 'Liability Exposure Brief', action: 'Liability exposure brief generated for legal review.' },
      ],
      'Telecom Provider': [
        { label: 'Network Outage Triage', action: 'Network outage triage workflow opened for NOC dispatch.' },
        { label: 'SLA Breach Watch', action: 'SLA breach watchlist generated for enterprise links.' },
        { label: 'Service Degradation Report', action: 'Service degradation report prepared for operations.' },
      ],
      'Airport Authority': [
        { label: 'Terminal Incident Matrix', action: 'Terminal incident matrix opened with zone ownership.' },
        { label: 'Ground Ops Safety Checklist', action: 'Ground ops safety checklist generated for shift leads.' },
        { label: 'Compliance Audit Packet', action: 'Compliance audit packet prepared for aviation oversight.' },
      ],
    };

    return [...(byType[type] || []), ...base];
  };

  const openMockCategoryLink = (label: string, action: string) => {
    const msg = `Mock Link: ${label}\n${action}\n(Ready for real route integration)`;
    setMockLinkResponse(msg);
    setInteractionMessage(`Opened ${label}`);

    const lower = `${label} ${action}`.toLowerCase();
    if (lower.includes('checklist') || lower.includes('audit') || lower.includes('compliance')) {
      setActiveArea('audit');
    } else if (lower.includes('summary') || lower.includes('brief') || lower.includes('report')) {
      setActiveArea('analytics');
      setExecutiveBrief(`Category Brief - ${activeCategoryType}\n${label}\n${action}\nQueue: ${counts.total} reports, ${counts.byStatus.New} new, ${counts.byStatus.Investigating} investigating.`);
    } else {
      setActiveArea('dispatch');
      setActionNote(`${label}: ${action}`);
    }

    logAction(`Opened category link: ${label}`);
  };

  const runItemInteraction = async (report: Report, kind: 'request-evidence' | 'escalate-legal' | 'notify-public' | 'duplicate-check') => {
    if (kind === 'request-evidence') {
      await updateReportStatus(report.id, 'Action Taken', {
        note: 'Evidence request issued: photos, timeline, and supporting docs requested.',
      });
      setInteractionMessage(`Evidence request issued for ${report.id}`);
      return;
    }

    if (kind === 'escalate-legal') {
      await updateReportStatus(report.id, 'Investigating', {
        assignedTo: 'Legal/Enforcement',
        note: 'Case escalated to legal review due to risk profile.',
      });
      setInteractionMessage(`Case ${report.id} escalated to legal.`);
      return;
    }

    if (kind === 'notify-public') {
      setInteractionMessage(`Public advisory draft prepared for ${report.id} (mock response).`);
      logAction(`Prepared public advisory draft for ${report.id}`);
      return;
    }

    setInteractionMessage(`Duplicate scan complete for ${report.id}: possible 2 related reports found (mock).`);
    logAction(`Duplicate scan run for ${report.id}`);
  };

  const issueAuditWork = () => {
    if (!auditWorkTitle.trim()) return;
    const item = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      title: auditWorkTitle.trim(),
      assignee: auditWorkAssignee.trim() || 'Audit Team',
      status: 'Open' as const,
    };
    setAuditWorkItems((prev) => [item, ...prev].slice(0, 30));
    setAuditWorkTitle('');
    setAuditWorkAssignee('');
    setInteractionMessage(`Audit work issued: ${item.id} assigned to ${item.assignee}.`);
    logAction(`Issued audit work ${item.id}`);
  };

  const addPersonOfInterest = () => {
    if (!personOfInterest.trim()) return;
    const risk: 'Low' | 'Moderate' | 'High' = selectedReport?.severity === 'High' ? 'High' : 'Moderate';
    const item = {
      id: `POI-${Date.now().toString().slice(-6)}`,
      name: personOfInterest.trim(),
      risk,
      note: `Linked to ${selectedEntity.type} case flow.`,
    };
    setPoiItems((prev) => [item, ...prev].slice(0, 30));
    setPersonOfInterest('');
    setInteractionMessage(`Person of interest added: ${item.name} (${item.risk}).`);
    logAction(`Added person of interest ${item.id}`);
  };

  const setAuditWorkStatus = (id: string, status: 'Open' | 'In Review' | 'Closed') => {
    setAuditWorkItems((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    logAction(`Audit work ${id} moved to ${status}`);
  };

  const activeCategoryType: EntityType = selectedType === 'All' ? selectedEntity.type : selectedType;
  const profile = uniqueByType[activeCategoryType];
  const infoNeeds = CATEGORY_INFO_NEEDS[activeCategoryType] || [];
  const playbook = CATEGORY_PLAYBOOKS[activeCategoryType];
  const intakeFields = CATEGORY_INTAKE_FIELDS[activeCategoryType] || [];
  const activeCategoryImage = categoryImageForType(activeCategoryType);

  const referralTargets = (report: Report): string[] => {
    const baseByType: Record<EntityType, string[]> = {
      City: ['Public Works', 'City Legal', 'Traffic Control'],
      'County Government': ['County Ops Desk', 'Emergency Mgmt', 'County Legal'],
      'Hospital Network': ['Clinical Risk Team', 'Compliance Office', 'Patient Safety Board'],
      'School District': ['Campus Admin', 'Counselor Team', 'District Safety Office'],
      University: ['Student Affairs', 'Campus Security', 'Governance Office'],
      'Transit Agency': ['Route Dispatch', 'Infrastructure Team', 'Safety Command'],
      'Police Department': ['Patrol Supervisor', 'Investigations Unit', 'Evidence Desk'],
      'Fire Department': ['Station Commander', 'Fire Prevention Unit', 'Emergency Ops'],
      'Housing Authority': ['Inspection Unit', 'Tenant Protection Desk', 'Legal Affairs'],
      'Utilities Provider': ['Grid Ops Center', 'Field Crew Dispatch', 'Regulatory Desk'],
      'Retail Chain': ['Store Manager', 'Loss Prevention', 'Regional Risk Office'],
      'Logistics Company': ['Hub Ops Lead', 'Driver Safety Office', 'Claims Desk'],
      'Banking Group': ['Branch Ops Lead', 'Fraud Unit', 'Compliance Officer'],
      'Insurance Provider': ['Claims Supervisor', 'Fraud Analyst', 'Legal Review'],
      'Telecom Provider': ['Network NOC', 'Field Tech Dispatch', 'Customer Recovery Desk'],
      'Airport Authority': ['Terminal Ops', 'Ground Safety Unit', 'Aviation Compliance'],
    };

    const base = baseByType[activeCategoryType] || ['Operations Desk', 'Risk Team', 'Legal Team'];
    if (report.severity === 'High') return [base[1], base[0], base[2]];
    return base;
  };

  const localAiInsight = (report: Report): AiInsight => {
    const high = report.severity === 'High' || /urgent|critical|threat|hazard/i.test(report.title + ' ' + report.summary);
    const routeTo = referralTargets(report)[0] || 'Operations Desk';
    return {
      severitySuggested: high ? 'High' : report.severity,
      routeTo,
      slaHours: high ? 2 : report.severity === 'Moderate' ? 8 : 24,
      rationale: high
        ? 'High-risk language and severity indicators found. Immediate triage and assignment recommended.'
        : 'Moderate operational risk profile based on current report fields.',
      nextActions: [
        { label: `Assign to ${routeTo}`, status: 'Investigating', note: `Route to ${routeTo} and start review.` },
        { label: 'Log mitigation action', status: 'Action Taken', note: 'Capture mitigation step, owner, and evidence references.' },
        { label: 'Close after verification', status: 'Resolved', note: 'Resolve only after SLA checks and closure notes are complete.' },
      ],
      similar: (currentReports || [])
        .filter((r) => r.id !== report.id)
        .slice(0, 3)
        .map((r) => ({ id: r.id, title: r.title, severity: r.severity, score: 0.5 })),
      provider: 'local-heuristic',
    };
  };

  const generateExecutiveBrief = async () => {
    setExecutiveBriefLoading(true);
    try {
      const openCases = currentReports.filter((r) => r.status !== 'Resolved').length;
      const highRisk = currentReports.filter((r) => r.severity === 'High').length;
      const resolved = currentReports.filter((r) => r.status === 'Resolved').length;
      const topChannels = Array.from(new Set(currentReports.map((r) => r.channel))).slice(0, 3).join(', ') || 'Mixed';

      const fallback = [
        `Executive Brief — ${selectedEntity.name} (${selectedEntity.type})`,
        `Period focus: operational snapshot for ${new Date().toLocaleDateString()}.`,
        `Current queue: ${currentReports.length} total cases, ${openCases} open, ${resolved} resolved, ${highRisk} high-severity.`,
        `Primary intake channels: ${topChannels}.`,
        `Key concern: ${currentReports[0]?.title || 'No active critical title available'}.`,
        `Recommended action: prioritize high-severity and repeat-location cases, maintain SLA discipline, and run daily review with assigned owners.`,
      ].join('\n');

      if (!apiBase) {
        setExecutiveBrief(fallback);
        logAction('Executive brief generated (local template)');
        return;
      }

      const prompt = `Create a concise executive operations brief (6-8 lines) for ${selectedEntity.name} (${selectedEntity.type}). Include current risk level, queue snapshot, high-priority issue, recommended actions, and accountability note. Data: ${JSON.stringify({ reports: currentReports.slice(0, 10), kpis: selectedEntity.kpis, valueStats: selectedEntity.valueStats })}`;

      const res = await fetch(`${apiBase}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tier: 'cheap' }),
      });

      if (!res.ok) throw new Error(`brief_http_${res.status}`);
      const json = await res.json();
      const text = String(json?.answer || '').trim();
      setExecutiveBrief(text || fallback);
      logAction('Executive brief generated (AI)');
    } catch (error) {
      console.error(error);
      setExecutiveBrief(`Executive Brief — ${selectedEntity.name}\nAI generation failed, using operational fallback. Review open high-severity cases, enforce SLA on investigating items, and verify closure evidence before resolution.`);
      logAction('Executive brief generation failed; fallback created');
    } finally {
      setExecutiveBriefLoading(false);
    }
  };

  const runAiForReport = async (report: Report) => {
    setAiLoadingFor(report.id);
    try {
      if (!apiBase) {
        setAiByReportId((prev) => ({ ...prev, [report.id]: localAiInsight(report) }));
        return;
      }

      const triageRes = await fetch(`${apiBase}/api/ai/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantType: selectedEntity.type,
          tenantName: selectedEntity.name,
          category: 'Operations Report',
          report,
        }),
      });

      if (!triageRes.ok) throw new Error(`triage_http_${triageRes.status}`);
      const triageJson = await triageRes.json();

      const similarRes = await fetch(`${apiBase}/api/ai/similar-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          candidates: (currentReports || []).filter((r) => r.id !== report.id),
        }),
      });

      let similar: AiInsight['similar'] = [];
      if (similarRes.ok) {
        const similarJson = await similarRes.json();
        similar = Array.isArray(similarJson?.similar) ? similarJson.similar : [];
      }

      const insight: AiInsight = {
        ...localAiInsight(report),
        ...(triageJson?.triage || {}),
        similar,
        provider: triageJson?.provider || 'api',
      };

      setAiByReportId((prev) => ({ ...prev, [report.id]: insight }));
      logAction(`AI analysis completed for ${report.id}`);
    } catch (error) {
      console.error(error);
      setAiByReportId((prev) => ({ ...prev, [report.id]: localAiInsight(report) }));
      logAction(`AI fallback used for ${report.id}`);
    } finally {
      setAiLoadingFor('');
    }
  };

  const agentRouteAllOpenCases = async () => {
    if (!currentReports.length) return;
    setAgentBusy(true);
    try {
      const open = currentReports.filter((r) => r.status !== 'Resolved');
      for (const report of open.slice(0, 8)) {
        const target = referralTargets(report)[0] || 'Operations Desk';
        await updateReportStatus(report.id, 'Investigating', {
          assignedTo: target,
          note: `Agent routed case to ${target} based on ${selectedEntity.type} playbook.`,
        });
      }
      logAgent(`Routed ${Math.min(open.length, 8)} open cases to recommended owners.`);
    } finally {
      setAgentBusy(false);
    }
  };

  const agentRunQuickAudit = () => {
    const open = currentReports.filter((r) => r.status !== 'Resolved').length;
    const high = currentReports.filter((r) => r.severity === 'High').length;
    const unassigned = currentReports.filter((r) => !r.assignedTo).length;
    logAgent(`Quick audit: ${open} open, ${high} high severity, ${unassigned} unassigned.`);
    setActiveArea('audit');
  };

  const agentGenerateActionPlan = () => {
    const actions = playbook.quickActions.slice(0, 3).map((a, i) => `${i + 1}. ${a.label} → ${a.route}`).join('\n');
    setExecutiveBrief([
      `Action Plan — ${selectedEntity.name}`,
      `Objective: ${playbook.operationalObjective}`,
      `Priority Steps:`,
      actions,
      `Current Queue: ${counts.total} cases, ${counts.byStatus.New} new, ${counts.byStatus.Investigating} investigating, ${counts.byStatus['Action Taken']} action taken.`,
    ].join('\n'));
    setActiveArea('analytics');
    logAgent('Generated category action plan for executive briefing.');
  };

  useEffect(() => {
    if (activeArea === 'analytics' && !executiveBriefLoading && !executiveBrief) {
      void generateExecutiveBrief();
    }
  }, [activeArea, selectedEntity.id]);

  const renderDashboard = () => {
    const score = Math.max(60, Math.min(98, Math.round(selectedEntity.confidence * 0.84 + 10)));
    const delta = Math.max(1, Math.round(selectedEntity.confidence / 24));
    const negPct = Math.max(8, Math.round((100 - score) * 0.6));
    const neutPct = Math.max(10, Math.round((100 - score) * 0.4));
    const posPct = 100 - negPct - neutPct;
    const scoreRad = (1 - score / 100) * Math.PI;
    const gCx = 110, gCy = 100, gR = 82;
    const needleX = Math.round(gCx + gR * Math.cos(scoreRad));
    const needleY = Math.round(gCy - gR * Math.sin(scoreRad));

    const ongoingIssues = currentReports.slice(0, 4).map((r) => {
      const badge =
        r.status === 'Investigating' ? { label: 'Under Investigation', color: '#f97316', bg: 'rgba(249,115,22,0.18)', border: 'rgba(249,115,22,0.4)' }
        : r.status === 'New' ? { label: 'Awaiting Review', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.35)' }
        : r.status === 'Action Taken' ? { label: 'Escalated', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.4)' }
        : { label: 'Pending Response', color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.35)' };
      return { ...r, badge };
    });

    const highR = currentReports.filter((r) => r.severity === 'High');
    const openR = currentReports.filter((r) => r.status !== 'Resolved');
    const aiAlerts = [
      { title: highR[0] ? `Rise in ${highR[0].title.split(' ').slice(0, 4).join(' ')}` : `${activeCategoryType} Risk Pattern Detected`, detail: highR[0] ? `${highR[0].location} — Contact internal audit` : 'Review open high-severity cases immediately.', color: '#ef4444', report: highR[0] },
      { title: openR[1] ? `Infrastructure Impact: "${openR[1].title.split(' ').slice(0, 3).join(' ')}"` : 'Infrastructure Structural Hazards', detail: 'Assess and repair promptly. Prevent transparency gaps.', color: '#f97316', report: openR[1] },
      { title: 'Service Issue Highlighted: "Slow Response Time"', detail: 'Improve emergency response SLA. Review gap options.', color: '#eab308', report: currentReports[2] },
    ];

    const kReports = infoNeeds.slice(0, 4).map((need, i) => ({
      label: need.label,
      value: need.value.split(' ')[0],
      status: i === 0 ? 'Open Reports' : i === 1 ? 'Under Investigation' : i === 2 ? 'In Progress' : 'Unresolved',
      color: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : i === 2 ? '#3b82f6' : '#f97316',
      icon: i === 0 ? '📋' : i === 1 ? '🔍' : i === 2 ? '🏗' : '⚠️',
    }));

    const sentKeys = [
      { label: (infoNeeds[0]?.label || 'Housing Issues').split(' ').slice(0, 2).join(' '), pct: 28, color: '#3b82f6' },
      { label: (infoNeeds[1]?.label || 'Public Safety').split(' ').slice(0, 2).join(' '), pct: 17, color: '#22c55e' },
      { label: ((infoNeeds[2]?.label || 'Service Quality').split(' ').slice(0, 2).join(' ')) + ' Complaints', pct: 14, color: '#f97316' },
    ];

    const bottomCards = [
      { label: 'Budget Oversight', icon: '🔎', gradient: 'linear-gradient(135deg,#0f2952,#1a1a2e)', area: 'audit' as ActionArea },
      { label: 'Public Safety Review', icon: '🛡', gradient: 'linear-gradient(135deg,#0a2e1a,#0f3d1e)', area: 'dispatch' as ActionArea },
      { label: 'Infrastructure Projects', icon: '🏙', gradient: 'linear-gradient(135deg,#1a1205,#2d1f06)', area: 'dispatch' as ActionArea },
      { label: 'Policy Explorer', icon: '📜', gradient: 'linear-gradient(135deg,#0a2e20,#0f3020)', area: 'analytics' as ActionArea },
    ];

    const DC = { background: 'rgba(8,14,28,0.97)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 18px' };
    const DT = { fontSize: 13, fontWeight: 800, color: '#e2e8f0', letterSpacing: 0.2, marginBottom: 12 };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* MAIN 3-COLUMN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 12, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Trust & Transparency Score */}
            <div style={DC}>
              <div style={DT}>Trust &amp; Transparency Score</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg viewBox="0 0 220 120" style={{ width: '100%', maxWidth: 240 }}>
                  <defs>
                    <linearGradient id="gaugeGreen" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" /></linearGradient>
                  </defs>
                  <path d="M 28 100 A 82 82 0 0 1 192 100" stroke="#1e293b" strokeWidth="18" fill="none" strokeLinecap="round" />
                  <path d="M 28 100 A 82 82 0 0 1 45 52" stroke="#ef4444" strokeWidth="18" fill="none" strokeLinecap="round" />
                  <path d="M 45 52 A 82 82 0 0 1 155 28" stroke="#eab308" strokeWidth="18" fill="none" strokeLinecap="round" />
                  <path d="M 155 28 A 82 82 0 0 1 192 100" stroke="#22c55e" strokeWidth="18" fill="none" strokeLinecap="round" />
                  <line x1={gCx} y1={gCy} x2={needleX} y2={needleY} stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <circle cx={gCx} cy={gCy} r="6" fill="#ffffff" />
                  <circle cx={gCx} cy={gCy} r="3" fill="#0f172a" />
                  <text x={gCx} y="88" textAnchor="middle" fontSize="32" fontWeight="900" fill="#ffffff">{score}</text>
                  <text x={gCx + 28} y="88" fontSize="14" fill="#64748b">/100</text>
                </svg>
              </div>
              <div style={{ textAlign: 'center', color: '#22c55e', fontWeight: 700, fontSize: 13, marginTop: 4 }}>↑ +{delta} Last 30 Days</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10, fontSize: 11 }}>
                <span style={{ color: '#ef4444' }}>● <span style={{ color: '#94a3b8' }}>Negative</span></span>
                <span style={{ color: '#eab308' }}>● <span style={{ color: '#94a3b8' }}>Neutral</span></span>
                <span style={{ color: '#22c55e' }}>● <span style={{ color: '#94a3b8' }}>Positive</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[{ val: negPct, label: 'Negative', color: '#ef4444' }, { val: neutPct, label: 'Neutral', color: '#eab308' }, { val: posPct, label: 'Positive', color: '#22c55e' }].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.val}%</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaint Map */}
            <div style={DC}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={DT}>{activeCategoryType} Complaint Map</div>
                <span style={{ fontSize: 10, color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 4 }}>{currentReports.length} reports</span>
              </div>
              <ReportHeatMap
                reports={currentReports}
                entityRegion={selectedEntity.region}
                entityName={selectedEntity.name}
                height={200}
                compact
                selectedReportId={selectedReportId}
                onSelectReport={(id) => { setSelectedReportId(id); openArea('reports'); setInteractionMessage(`Report ${id} selected from map.`); }}
              />
            </div>
          </div>

          {/* ── CENTER COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Overview of Key Reports */}
            <div style={DC}>
              <div style={DT}>Overview of Key Reports</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {kReports.map((kr) => (
                  <button
                    key={kr.label}
                    style={{ border: `1px solid ${kr.color}22`, borderRadius: 10, padding: '14px 14px', background: `rgba(8,14,28,0.9)`, textAlign: 'left' as const, cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onClick={() => { openArea('reports'); setInteractionMessage(`Viewing: ${kr.label}`); }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = kr.color + '66'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = kr.color + '22'; }}
                  >
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>{kr.icon}</span>{kr.label}
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: kr.color, lineHeight: 1 }}>{kr.value}</div>
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', background: kr.color + '18', color: kr.color, borderRadius: 5, border: `1px solid ${kr.color}33` }}>{kr.status}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                style={{ width: '100%', marginTop: 14, padding: '12px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, background: 'linear-gradient(90deg,#1d4ed8,#2563eb)', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: 0.3 }}
                onClick={() => { openArea('analytics'); void generateExecutiveBrief(); }}
              >
                {executiveBriefLoading ? '⏳ Generating Summary…' : '📊 Generate Summary Report'}
              </button>
            </div>

            {/* Heat Map */}
            <div style={{ ...DC, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={DT}>{activeCategoryType} Complaint Heat Map</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#475569' }}>≡ {selectedEntity.region}</span>
                  <button style={{ ...styles.smallBtn, fontSize: 10, padding: '3px 9px' }} onClick={() => { openArea('reports'); }}>View Details →</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 10, color: '#64748b', alignItems: 'center' }}>
                <span>Complaints by District:</span>
                {[{ label: 'Low', color: '#22c55e' }, { label: 'Medium', color: '#f97316' }, { label: 'High', color: '#ef4444' }].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />{l.label}
                  </span>
                ))}
              </div>
              <ReportHeatMap
                reports={currentReports}
                entityRegion={selectedEntity.region}
                entityName={selectedEntity.name}
                height={260}
                selectedReportId={selectedReportId}
                onSelectReport={(id) => { setSelectedReportId(id); openArea('reports'); setInteractionMessage(`Report ${id} selected from heat map.`); }}
              />
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Ongoing Issues */}
            <div style={DC}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={DT}>Ongoing Issues</div>
                <button style={{ fontSize: 11, color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }} onClick={() => openArea('reports')}>View All &rsaquo;</button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {ongoingIssues.map((issue) => (
                  <button
                    key={issue.id}
                    style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, textAlign: 'left' as const, cursor: 'pointer', width: '100%' }}
                    onClick={() => { setSelectedReportId(issue.id); openArea('reports'); }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.6)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 800, fontSize: 11, color: '#93c5fd', fontFamily: 'monospace' }}>{issue.id}</span>
                        <span style={{ fontSize: 11, color: '#e2e8f0', marginLeft: 6, fontWeight: 600 }}>{issue.title.slice(0, 20)}{issue.title.length > 20 ? '…' : ''}</span>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 999, background: issue.badge.bg, color: issue.badge.color, border: `1px solid ${issue.badge.border}`, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>
                        {issue.badge.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>📍</span>{issue.location}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Advisor */}
            <div style={DC}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={DT}>AI Advisor</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[profile.color, '#334155', '#334155'].map((c, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: c, display: 'inline-block' }} />)}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#93c5fd', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 10 }}>Risk Alerts</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {aiAlerts.map((alert, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${alert.color}`, paddingLeft: 10, paddingTop: 2, paddingBottom: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9', lineHeight: 1.3 }}>{alert.title}</div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>{alert.detail}</div>
                    <button
                      style={{ marginTop: 6, fontSize: 10, color: alert.color, background: alert.color + '12', border: `1px solid ${alert.color}33`, borderRadius: 5, padding: '3px 9px', cursor: 'pointer', fontWeight: 700 }}
                      onClick={() => { if (alert.report) setSelectedReportId(alert.report.id); openArea('reports'); setInteractionMessage(`AI Alert: "${alert.title}" — investigating.`); }}
                    >
                      Investigate →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Sentiment */}
            <div style={DC}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={DT}>Public Sentiment Analysis</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['#334155', '#334155'].map((c, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: c, display: 'inline-block' }} />)}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {sentKeys.map((kw) => (
                  <div key={kw.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>● {kw.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9' }}>{kw.pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${kw.pct * 3.2}%`, background: kw.color, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ACTION TILES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {bottomCards.map((bc) => (
            <button
              key={bc.label}
              style={{ background: bc.gradient, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '22px 18px', cursor: 'pointer', textAlign: 'left' as const, minHeight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}
              onClick={() => { openArea(bc.area); setInteractionMessage(`${bc.label} — opened.`); }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; }}
            >
              <span style={{ fontSize: 32, position: 'absolute', top: 16, left: 16, opacity: 0.7 }}>{bc.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: 0.2 }}>{bc.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderEntityLayout = () => {
    const openCount = counts.total - counts.byStatus.Resolved;
    const categoryScore = Math.max(68, Math.min(96, 70 + selectedEntity.confidence - Math.floor(openCount / 3)));
    const palette = {
      primary: profile.color,
      warn: '#f59e0b',
      danger: '#ef4444',
      success: '#22c55e',
    };
    const topCases = currentReports.slice(0, 4);

    const tileActions = categoryTools(activeCategoryType).slice(0, 4).map((label) => ({
      label,
      action: `${label} panel opened for ${activeCategoryType}.`,
    }));

    return (
      <div style={styles.bankShell}>
        <div style={styles.bankGridTop}>
          <div style={styles.bankCard}>
            <h3 style={styles.cardTitle}>{activeCategoryType} Score</h3>
            <div style={styles.bankGaugeValue}>{categoryScore}<span style={{ fontSize: 22, color: '#94a3b8' }}>/100</span></div>
            <div style={{ color: '#86efac', fontWeight: 700, marginTop: 6 }}>+{Math.max(1, Math.floor(selectedEntity.confidence / 25))} last 30 days</div>
            <div style={styles.bankScaleRow}>
              <span style={{ color: palette.danger }}>Low</span>
              <span style={{ color: palette.warn }}>Medium</span>
              <span style={{ color: palette.success }}>Strong</span>
            </div>
          </div>

          <div style={styles.bankCard}>
            <h3 style={styles.cardTitle}>Overview of Key Reports</h3>
            <div style={styles.bankListRow}><span>New Cases</span><strong>{counts.byStatus.New}</strong></div>
            <div style={styles.bankListRow}><span>Investigating</span><strong>{counts.byStatus.Investigating}</strong></div>
            <div style={styles.bankListRow}><span>Action Taken</span><strong>{counts.byStatus['Action Taken']}</strong></div>
            <div style={styles.bankListRow}><span>Total Open Cases</span><strong>{openCount}</strong></div>
          </div>

          <div style={styles.bankCard}>
            <h3 style={styles.cardTitle}>Ongoing Issues</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {topCases.map((r) => (
                <div key={`${activeCategoryType}-${r.id}`} style={styles.bankCaseRow}>
                  <span style={{ fontWeight: 700 }}>{r.id}</span>
                  <span style={{ color: '#cbd5e1' }}>{r.title}</span>
                  <span style={{ ...styles.bankStatusBadge, borderColor: palette.primary, color: '#e2e8f0' }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.bankGridBottom}>
          <div style={styles.bankCardLarge}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ ...styles.cardTitle, margin: 0 }}>{activeCategoryType} Heat Map</h3>
              <button style={{ ...styles.smallBtn, fontSize: 10, padding: '2px 8px' }} onClick={() => openArea('reports')}>Reports Queue →</button>
            </div>
            <ReportHeatMap
              reports={topCases}
              entityRegion={selectedEntity.region}
              entityName={selectedEntity.name}
              height={240}
              compact
              selectedReportId={selectedReportId}
              onSelectReport={(id) => {
                setSelectedReportId(id);
                openArea('reports');
                setInteractionMessage(`Report ${id} selected from map — Reports Queue opened.`);
              }}
            />
          </div>
          <div style={styles.bankCard}>
            <h3 style={styles.cardTitle}>AI Advisor</h3>
            <ul style={styles.bankInsightList}>
              <li>Risk focus: prioritize high-severity items first for {activeCategoryType.toLowerCase()}.</li>
              <li>SLA watch: unresolved queue currently at <strong>{openCount}</strong> open cases.</li>
              <li>Suggested action: run {categoryTools(activeCategoryType)[0] || 'operations routing'} now.</li>
            </ul>
          </div>
        </div>

        <div style={styles.cityTileGrid}>
          {tileActions.map((tile) => (
            <button
              key={`${activeCategoryType}-${tile.label}`}
              style={{
                ...styles.cityTileButton,
                borderColor: activeTool === tile.label ? palette.primary : '#334155',
                background: activeTool === tile.label ? `linear-gradient(145deg,${palette.primary}22,${palette.primary}11)` : 'linear-gradient(145deg,#0f172a,#111827)',
                color: activeTool === tile.label ? '#fff' : '#e2e8f0',
                boxShadow: activeTool === tile.label ? `0 0 0 1px ${palette.primary}55 inset` : 'none',
              }}
              onClick={() => {
                if (activeTool === tile.label) {
                  setActiveTool('');
                } else {
                  openTool(tile.label);
                }
              }}
            >
              {tile.label}
              {activeTool === tile.label && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>▼ open</span>}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderToolPanel = () => {
    if (!activeTool) return null;
    const lower = activeTool.toLowerCase();
    const targetReport = selectedReport || currentReports[0];
    const typeReferrals = referralTargets(targetReport || { id: 'T', title: activeTool, severity: 'Moderate', status: 'New', channel: 'App', location: selectedEntity.region, eta: 'TBD', summary: '' } as Report);

    const isLegal = lower.includes('legal') || lower.includes('restitution') || lower.includes('exposure') || lower.includes('compliance packet') || lower.includes('aviation compliance') || lower.includes('governance');
    const isInspection = lower.includes('inspection') || lower.includes('hydrant') || lower.includes('readiness');
    const isSafety = lower.includes('protection') || lower.includes('safety') || lower.includes('patient') || lower.includes('campus') || lower.includes('welfare');
    const isDispatch = lower.includes('dispatch') || lower.includes('routing') || lower.includes('crew') || lower.includes('route') || lower.includes('station') || lower.includes('hub') || lower.includes('terminal') || lower.includes('ground ops');
    const isFraud = lower.includes('fraud') || lower.includes('harm') || lower.includes('integrity') || lower.includes('claim') || lower.includes('loss prevention');
    const isAnalytics = lower.includes('radar') || lower.includes('heatmap') || lower.includes('analytics') || lower.includes('scoring') || lower.includes('sla');

    type ToolAction = { label: string; status: ReportStatus; note: string; assignee: string };
    const toolActions: ToolAction[] = isLegal
      ? [
          { label: 'Issue Legal Notice', status: 'Investigating', note: 'Legal notice issued. Compliance requirements communicated to responsible party.', assignee: typeReferrals[2] || 'Legal Affairs' },
          { label: 'Open Case File', status: 'Action Taken', note: 'Legal case file opened. Documentation package and evidence log assembled.', assignee: typeReferrals[2] || 'Legal Affairs' },
          { label: 'Close with Resolution', status: 'Resolved', note: 'Legal matter resolved. Settlement or compliance outcome documented.', assignee: typeReferrals[2] || 'Legal Affairs' },
        ]
      : isInspection
      ? [
          { label: 'Dispatch Inspector', status: 'Investigating', note: 'Inspector dispatched to location. Access confirmed with site contact.', assignee: typeReferrals[0] || 'Inspection Unit' },
          { label: 'Log Findings', status: 'Action Taken', note: 'Inspection completed. Findings documented, photos uploaded, and violations recorded.', assignee: typeReferrals[0] || 'Inspection Unit' },
          { label: 'Issue Pass / Clear Site', status: 'Resolved', note: 'Inspection passed. Compliance certificate issued. Case closed.', assignee: typeReferrals[0] || 'Inspection Unit' },
        ]
      : isFraud
      ? [
          { label: 'Flag for Investigation', status: 'Investigating', note: 'Fraud signal flagged. Compliance officer and risk analyst assigned.', assignee: typeReferrals[1] || 'Fraud Unit' },
          { label: 'Log Enforcement Action', status: 'Action Taken', note: 'Enforcement action documented. Suspension or restriction applied pending review.', assignee: typeReferrals[1] || 'Fraud Unit' },
          { label: 'Close with Outcome', status: 'Resolved', note: 'Fraud/integrity case closed. Restitution or clearance outcome recorded.', assignee: typeReferrals[1] || 'Fraud Unit' },
        ]
      : isDispatch
      ? [
          { label: 'Dispatch Team', status: 'Investigating', note: 'Team dispatched to location. Estimated arrival and task scope logged.', assignee: typeReferrals[0] || 'Field Team' },
          { label: 'Log On-Site Action', status: 'Action Taken', note: 'On-site action completed. Progress and findings documented.', assignee: typeReferrals[0] || 'Field Team' },
          { label: 'Confirm Restoration', status: 'Resolved', note: 'Restoration or resolution confirmed. Site cleared and case closed.', assignee: typeReferrals[0] || 'Field Team' },
        ]
      : isSafety
      ? [
          { label: 'Activate Safety Protocol', status: 'Investigating', note: 'Safety protocol activated. All relevant contacts notified. Documentation started.', assignee: typeReferrals[0] || 'Safety Team' },
          { label: 'Log Protective Action', status: 'Action Taken', note: 'Protective measures applied. Hazard contained or individual safeguarded.', assignee: typeReferrals[0] || 'Safety Team' },
          { label: 'Close Safety Case', status: 'Resolved', note: 'Safety verification complete. Follow-up review scheduled. Case closed.', assignee: typeReferrals[0] || 'Safety Team' },
        ]
      : isAnalytics
      ? [
          { label: 'Run Risk Analysis', status: 'Investigating', note: 'Risk analysis initiated. Data aggregation and pattern detection running.', assignee: typeReferrals[1] || 'Analytics Team' },
          { label: 'Apply Recommended Action', status: 'Action Taken', note: 'Recommended mitigation action applied based on analysis output.', assignee: typeReferrals[1] || 'Analytics Team' },
          { label: 'Archive Analysis Report', status: 'Resolved', note: 'Analysis report archived. Findings shared with leadership for review.', assignee: typeReferrals[1] || 'Analytics Team' },
        ]
      : [
          { label: 'Assign & Start', status: 'Investigating', note: `${activeTool} initiated. Team assigned and tracking started.`, assignee: typeReferrals[0] || 'Operations Team' },
          { label: 'Log Action', status: 'Action Taken', note: `Action logged via ${activeTool}. Progress documented.`, assignee: typeReferrals[0] || 'Operations Team' },
          { label: 'Mark Complete', status: 'Resolved', note: `${activeTool} completed. Case closed with documented outcome.`, assignee: typeReferrals[0] || 'Operations Team' },
        ];

    return (
      <section style={{ border: `2px solid ${profile.color}44`, borderRadius: 14, padding: 18, background: 'rgba(9,16,32,0.97)', display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: profile.color }} />
              <span style={{ fontSize: 11, color: profile.color, fontWeight: 700, textTransform: 'uppercase' }}>{activeCategoryType} Tool</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#f1f5f9' }}>{activeTool}</div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{selectedEntity.name} · {selectedEntity.region}</div>
          </div>
          <button style={{ ...styles.smallBtn, padding: '6px 12px' }} onClick={() => setActiveTool('')}>✕ Close</button>
        </div>

        {targetReport ? (
          <div style={{ border: `1px solid ${profile.color}33`, borderRadius: 10, padding: '12px 14px', background: 'rgba(15,23,42,0.8)', display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, marginBottom: 4 }}>Active Case</div>
                <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: 14 }}>{targetReport.id} — {targetReport.title}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                  {targetReport.location} · <span style={{ color: targetReport.severity === 'High' ? '#ef4444' : targetReport.severity === 'Moderate' ? '#f97316' : '#22c55e', fontWeight: 700 }}>{targetReport.severity}</span> · {targetReport.status}
                  {targetReport.assignedTo && <span> · Assigned: {targetReport.assignedTo}</span>}
                </div>
              </div>
              <button style={styles.referBtn} onClick={() => { setSelectedReportId(targetReport.id); openArea('reports'); }}>
                View Full Case →
              </button>
            </div>
            {targetReport.summary && (
              <div style={{ fontSize: 12, color: '#cbd5e1', borderTop: '1px solid #1e293b', paddingTop: 8 }}>{targetReport.summary}</div>
            )}
          </div>
        ) : (
          <div style={{ color: '#f97316', fontSize: 13, padding: '10px 14px', background: 'rgba(249,115,22,0.08)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.25)' }}>
            ⚠ No report selected. Go to <button style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: 700, padding: 0 }} onClick={() => openArea('reports')}>Reports Queue →</button> and select a case to use this tool.
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {toolActions.map((action) => (
              <button
                key={action.label}
                style={{
                  border: `1px solid ${profile.color}55`,
                  background: `linear-gradient(145deg, rgba(15,23,42,0.9), rgba(8,12,20,0.85))`,
                  color: '#f1f5f9',
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
                onClick={() => {
                  if (!targetReport) { setInteractionMessage('Select a report from the queue first.'); return; }
                  void updateReportStatus(targetReport.id, action.status, { assignedTo: action.assignee, note: action.note });
                  setInteractionMessage(`${action.label} — ${targetReport.id} → ${action.status}.`);
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 13 }}>{action.label}</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>→ Assigns: {action.assignee}</span>
                <span style={{ fontSize: 10, color: action.status === 'Resolved' ? '#22c55e' : action.status === 'Action Taken' ? '#f97316' : '#60a5fa', fontWeight: 600 }}>{action.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: '1px dashed #334155', borderRadius: 10, padding: 14, background: 'rgba(15,23,42,0.5)' }}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Custom Action</div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Assign to (team or person)"
              style={styles.input}
            />
            <select
              style={styles.input}
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value || !targetReport) return;
                void updateReportStatus(targetReport.id, e.target.value as ReportStatus, { assignedTo, note: actionNote });
                setInteractionMessage(`Status set to ${e.target.value} for ${targetReport.id} via ${activeTool}.`);
                e.target.value = '';
              }}
            >
              <option value="" disabled>Set status instantly…</option>
              <option value="Investigating">→ Investigating</option>
              <option value="Action Taken">→ Action Taken</option>
              <option value="Resolved">→ Resolved</option>
            </select>
          </div>
          <textarea
            value={actionNote}
            onChange={(e) => setActionNote(e.target.value)}
            placeholder="Action note (auto-filled from tool — edit as needed)…"
            rows={3}
            style={{ ...styles.input, width: '100%', marginTop: 8, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              style={{ ...styles.smallBtnPrimary, flex: 1, minWidth: 140 }}
              onClick={() => {
                if (!targetReport) { setInteractionMessage('Select a report first.'); return; }
                if (!actionNote.trim()) { setInteractionMessage('Add an action note before submitting.'); return; }
                void updateReportStatus(targetReport.id, 'Action Taken', { assignedTo, note: actionNote });
                setInteractionMessage(`Action submitted for ${targetReport.id} via ${activeTool}.`);
              }}
            >
              Submit Action to Case
            </button>
            <button
              style={styles.smallBtn}
              onClick={() => {
                if (!targetReport || !actionNote.trim()) return;
                void updateReportStatus(targetReport.id, 'Resolved', { assignedTo, note: `${activeTool} complete. ${actionNote}` });
                setInteractionMessage(`Case ${targetReport.id} resolved via ${activeTool}.`);
                setActiveTool('');
              }}
            >
              Resolve &amp; Close
            </button>
            <button style={styles.smallBtn} onClick={() => { setActionNote(''); setAssignedTo(''); }}>Clear Fields</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>Other tools in this category:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categoryTools(activeCategoryType).slice(0, 6).filter(t => t !== activeTool).map(t => (
              <button key={t} style={{ ...styles.referBtn, fontSize: 10 }} onClick={() => openTool(t)}>{t}</button>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const goHome = () => {
    setPreviousPortalTab(activePortalTab);
    setActivePortalTab('Dashboard');
    openArea('analytics');
    setInteractionMessage(`Home opened for ${selectedEntity.name}.`);
  };

  const goBack = () => {
    if (!previousPortalTab || previousPortalTab === activePortalTab) {
      setInteractionMessage('No previous view yet.');
      return;
    }
    const target = previousPortalTab;
    setPreviousPortalTab(activePortalTab);
    setActivePortalTab(target);
    openArea(getAreaForPortalTab(target));
    setInteractionMessage(`Returned to ${target}.`);
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>DPAL NEXUS • HIGH-VALUE DEMO</div>
            <h1 style={styles.title}>Connected Dashboards with Clickable Flows</h1>
            <p style={styles.subtitle}>Buttons now navigate between sections, reports update status, and each entity type has a unique layout feel.</p>
          </div>
          <button
            style={styles.primaryBtn}
            onClick={() => {
              openArea('analytics');
              void generateExecutiveBrief();
            }}
          >
            {executiveBriefLoading ? 'Generating Brief…' : 'Open Executive Brief'}
          </button>
        </header>

        <section style={styles.portalShell}>
          <div style={styles.portalTopBar}>
            <div style={styles.portalBrandRow}>
              <div style={styles.portalLogo}>D</div>
              <div>
                <div style={styles.portalBrand}>DPAL</div>
                <div style={styles.portalSubtitle}>{selectedEntity.type} Accountability Portal</div>
                <div style={styles.portalEntityMeta}>{selectedEntity.name} · {selectedEntity.region}</div>
              </div>
            </div>
            <div style={styles.portalRightRow}>
              <button style={styles.portalNavBtn} onClick={goBack}>← Return</button>
              <button style={styles.portalNavBtn} onClick={goHome}>⌂ Home</button>
              <div style={{
                ...styles.portalRiskPill,
                backgroundColor: selectedEntity.confidence >= 90 ? 'rgba(34,197,94,0.2)' : selectedEntity.confidence >= 80 ? 'rgba(249,115,22,0.25)' : 'rgba(239,68,68,0.2)',
                borderColor: selectedEntity.confidence >= 90 ? '#22c55e' : selectedEntity.confidence >= 80 ? '#f97316' : '#ef4444',
              }}>
                <span style={{ fontSize: 13 }} aria-hidden>🛡</span>
                <div>
                  <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Risk Level</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: profile.color, letterSpacing: 0.5 }}>{selectedEntity.confidence >= 90 ? 'LOW' : selectedEntity.confidence >= 80 ? 'MODERATE' : 'ELEVATED'}</div>
                </div>
              </div>
              <div style={styles.portalUserRow}>
                <div style={styles.portalAvatar} aria-hidden>{(selectedEntity.name || 'A').charAt(0)}</div>
                <span style={styles.portalUserLabel}>{portalTabs.find((t) => t.toLowerCase().includes('admin')) || 'Admin'}</span>
                <span style={{ color: '#94a3b8', fontSize: 10 }}>▼</span>
              </div>
            </div>
          </div>
          <div style={styles.portalTabs}>
            {portalTabs.map((tab) => {
              const isActive = activePortalTab === tab;
              return (
                <button
                  key={`portal-tab-${tab}`}
                  style={{
                    ...styles.portalTab,
                    ...(isActive ? styles.portalTabActive : {}),
                  }}
                  onClick={() => {
                    if (tab !== activePortalTab) setPreviousPortalTab(activePortalTab);
                    setActivePortalTab(tab);
                    openArea(getAreaForPortalTab(tab));
                    setInteractionMessage(`${tab} — ${selectedEntity.name} (${selectedEntity.type}). Content updated.`);
                  }}
                >
                  <span style={{ fontSize: 15 }} aria-hidden>{portalTabIcon(tab, isActive)}</span>
                  {tab}
                </button>
              );
            })}
          </div>
        </section>

        <section style={styles.selectorPanel}>
          <div style={styles.row}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 14, pointerEvents: 'none', zIndex: 1 }}>🔍</span>
              <input
                value={entitySearch}
                onChange={(e) => { setEntitySearch(e.target.value); setEntitySearchOpen(true); }}
                onFocus={() => setEntitySearchOpen(true)}
                onBlur={() => setTimeout(() => setEntitySearchOpen(false), 180)}
                placeholder={`Search entities… (${entities.length} orgs)`}
                style={{ ...styles.input, width: '100%', paddingLeft: 32, boxSizing: 'border-box' as const }}
              />
              {entitySearchOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, maxHeight: 220, overflowY: 'auto' as const, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  {entities.filter(e => !entitySearch.trim() || e.name.toLowerCase().includes(entitySearch.toLowerCase()) || e.type.toLowerCase().includes(entitySearch.toLowerCase()) || e.region.toLowerCase().includes(entitySearch.toLowerCase())).slice(0, 20).map(entity => (
                    <button
                      key={entity.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: entity.id === selectedEntity.id ? '#1e3a5f' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' as const, color: '#e2e8f0', borderBottom: '1px solid #0f172a' }}
                      onMouseEnter={e => { if (entity.id !== selectedEntity.id) e.currentTarget.style.background = '#1e293b'; }}
                      onMouseLeave={e => { if (entity.id !== selectedEntity.id) e.currentTarget.style.background = 'transparent'; }}
                      onClick={() => {
                        setSelectedEntityId(entity.id);
                        setSelectedReportId((reportsByEntity[entity.id] || entity.reports)[0]?.id || '');
                        setSelectedType(entity.type);
                        setEntitySearch('');
                        setEntitySearchOpen(false);
                        logAction(`Selected entity: ${entity.name}`);
                      }}
                    >
                      <span style={{ fontSize: 9, color: '#93c5fd', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{entity.type}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{entity.name}</div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{entity.region} · {entity.status}</div>
                      </div>
                      {entity.id === selectedEntity.id && <span style={{ color: '#22c55e', fontSize: 12, flexShrink: 0 }}>✓</span>}
                    </button>
                  ))}
                  {entities.filter(e => !entitySearch.trim() || e.name.toLowerCase().includes(entitySearch.toLowerCase()) || e.type.toLowerCase().includes(entitySearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>No entities match "{entitySearch}"</div>
                  )}
                </div>
              )}
            </div>
            <button style={styles.arrowBtn} onClick={() => selectEntityByIndexShift(-1)} aria-label="Previous entity">←</button>
            <button style={styles.arrowBtn} onClick={() => selectEntityByIndexShift(1)} aria-label="Next entity">→</button>
          </div>

          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, marginBottom: 2 }}>
            Active: <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{selectedEntity.name}</span>
            <span style={{ marginLeft: 8, fontSize: 9, background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.25)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{selectedEntity.type}</span>
            <span style={{ marginLeft: 6, fontSize: 9, color: '#475569' }}>{selectedEntity.region}</span>
          </div>

          <div style={styles.row}>
            <div style={styles.chipWrap}>
              {DASHBOARD_VIEWS.map((item) => {
                const viewAreaMap: Record<DashboardView, ActionArea> = {
                  'Executive': 'analytics',
                  'Operations': 'dispatch',
                  'Risk & Liability': 'audit',
                  'Public Portal': 'reports',
                };
                return (
                  <button
                    key={item}
                    onClick={() => {
                      setView(item);
                      openArea(viewAreaMap[item]);
                      if (item === 'Executive') void generateExecutiveBrief();
                      logAction(`Dashboard view set to ${item}`);
                    }}
                    style={{ ...styles.chip, ...(view === item ? styles.chipActive : {}) }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.entityEditorCard}>
            <div style={styles.panelLabel}>Entity GUI Manager</div>
            <div style={styles.formGrid}>
              <input value={entityEditorName} onChange={(e) => setEntityEditorName(e.target.value)} placeholder="Entity name" style={styles.input} />
              <input value={entityEditorRegion} onChange={(e) => setEntityEditorRegion(e.target.value)} placeholder="Region code (e.g., US-NY)" style={styles.input} />
              <select value={entityEditorStatus} onChange={(e) => setEntityEditorStatus(e.target.value as Status)} style={styles.input}>
                <option value="Active">Active</option>
                <option value="Pilot">Pilot</option>
                <option value="Planning">Planning</option>
              </select>
            </div>
            <div style={styles.actionButtons}>
              <button style={styles.smallBtnPrimary} onClick={updateCurrentEntity}>Update Current Entity</button>
              <button style={styles.smallBtn} onClick={createEntityFromEditor}>Create Entity in Current Type</button>
            </div>
          </div>
        </section>

        <section style={styles.showcasePanel}>
          <div style={styles.showcaseHeader}>
            <div style={styles.panelLabel}>Categories</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <button style={{ ...styles.smallBtn, ...(categoryViewMode === 'single' ? styles.sectionBtnActive : {}) }} onClick={() => setCategoryViewMode('single')}>
                Show one category
              </button>
              <button style={{ ...styles.smallBtn, ...(categoryViewMode === 'featured' ? styles.sectionBtnActive : {}) }} onClick={() => setCategoryViewMode('featured')}>
                Featured
              </button>
              <button style={{ ...styles.smallBtn, ...(categoryViewMode === 'all' ? styles.sectionBtnActive : {}) }} onClick={() => setCategoryViewMode('all')}>
                All categories
              </button>
            </div>
          </div>

          <div style={styles.showcaseGrid}>
            {categoryCards.map((category) => {
              const hasEntity = entities.some((entity) => entity.type === category.type);
              return (
                <button
                  key={category.type}
                  className="showcase-card"
                  style={{ ...styles.showcaseCard, opacity: hasEntity ? 1 : 0.7 }}
                  onClick={() => {
                    setSelectedType(category.type);
                    const first = entities.find((entity) => entity.type === category.type);
                    if (first) {
                      setSelectedEntityId(first.id);
                      setSelectedReportId(first.reports[0]?.id || '');
                      logAction(`Opened category card: ${category.type}`);
                    }
                  }}
                  title={hasEntity ? `Open ${category.type}` : `${category.type} demo coming next`}
                >
                  <div style={styles.showcasePhotoWrap}>
                    <img
                      src={category.image}
                      alt={category.type}
                      style={styles.showcasePhoto}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = categoryFallbackImage(category.type);
                      }}
                    />
                    <div style={styles.showcasePhotoOverlay} />
                  </div>
                  <div style={styles.showcaseBody}>
                    <div style={styles.showcaseTag}>{category.type}</div>
                    <div style={styles.showcaseCaption}>{category.caption}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {activePortalTab === 'Dashboard' && renderDashboard()}

        {activePortalTab !== 'Dashboard' && (<>

        <section style={{ border: '1px solid #334155', borderRadius: 12, padding: '12px 16px', background: 'rgba(11,18,32,0.92)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: 22 }} aria-hidden>{portalTabIcon(activePortalTab, true)}</span>
            <div>
              <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: 15 }}>{activePortalTab}</div>
              <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 1 }}>
                {selectedEntity.name} · {selectedEntity.type} · {selectedEntity.region}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ACTION_AREAS.map((a) => (
              <button
                key={a.key}
                style={{ ...styles.smallBtn, ...(activeArea === a.key ? styles.sectionBtnActive : {}), fontSize: 11 }}
                onClick={() => openArea(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tab-specific content panel ── */}
        {(() => {
          const tabArea = getAreaForPortalTab(activePortalTab);
          const isComplaints = /complaint|violation/i.test(activePortalTab);
          const isFeedback = /feedback/i.test(activePortalTab);
          const displayReports = isComplaints
            ? currentReports.filter(r => r.severity === 'High' || r.severity === 'Moderate')
            : isFeedback
            ? currentReports.filter(r => r.channel === 'App' || r.channel === 'WhatsApp' || r.severity === 'Low')
            : currentReports;

          if (tabArea === 'reports') {
            return (
              <section style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {([
                    { label: 'Total', value: displayReports.length, color: '#93c5fd' },
                    { label: 'High Risk', value: displayReports.filter(r => r.severity === 'High').length, color: '#ef4444' },
                    { label: 'Open', value: displayReports.filter(r => r.status === 'New' || r.status === 'Investigating').length, color: '#f97316' },
                    { label: 'Resolved', value: displayReports.filter(r => r.status === 'Resolved').length, color: '#22c55e' },
                  ] as {label:string;value:number;color:string}[]).map(s => (
                    <div key={s.label} style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${s.color}33`, borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const }}>{s.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: s.color, marginTop: 4, lineHeight: 1 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #1e293b', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 10 }}>
                    {isComplaints ? 'Complaints & Violations' : isFeedback ? 'Community Feedback' : 'Reports Queue'} — {selectedEntity.name}
                  </div>
                  <div style={{ display: 'grid', gap: 5, maxHeight: 280, overflowY: 'auto' as const, paddingRight: 4 }}>
                    {displayReports.slice(0, 12).map(r => (
                      <button key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: selectedReportId === r.id ? 'rgba(59,130,246,0.1)' : 'rgba(11,18,32,0.8)', border: `1px solid ${selectedReportId === r.id ? '#3b82f6' : '#1e293b'}`, borderRadius: 8, textAlign: 'left' as const, cursor: 'pointer', width: '100%' }}
                        onClick={() => { setSelectedReportId(r.id); openArea('reports'); setInteractionMessage(`Viewing report ${r.id}: ${r.title}`); }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: r.severity === 'High' ? '#ef4444' : r.severity === 'Moderate' ? '#f97316' : '#22c55e', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.title}</div>
                          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{r.id} · {r.location} · {r.channel}</div>
                        </div>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 999, background: r.severity === 'High' ? '#ef444422' : r.severity === 'Moderate' ? '#f9731622' : '#22c55e22', color: r.severity === 'High' ? '#ef4444' : r.severity === 'Moderate' ? '#f97316' : '#22c55e', fontWeight: 700, flexShrink: 0 }}>{r.severity}</span>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: '#1e293b', color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{r.status}</span>
                      </button>
                    ))}
                    {displayReports.length === 0 && <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>No items in this view.</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' as const }}>
                    <button style={styles.smallBtnPrimary} onClick={() => openArea('reports')}>Open Full Reports Queue →</button>
                    <button style={styles.smallBtn} onClick={() => openArea('dispatch')}>Action Center</button>
                    <button style={styles.smallBtn} onClick={() => openArea('audit')}>Audit Trail</button>
                  </div>
                </div>
              </section>
            );
          }

          if (tabArea === 'analytics') {
            const score = Math.round(selectedEntity.confidence * 0.9);
            const checks = [
              { label: 'Financial Disclosures Filed', done: selectedEntity.confidence > 70 },
              { label: 'ESG Report Published', done: selectedEntity.confidence > 80 },
              { label: 'Audit Committee Verified', done: selectedEntity.confidence > 75 },
              { label: 'Policy Manual Updated (< 12 months)', done: selectedEntity.confidence > 85 },
              { label: 'Community Consultation Logged', done: selectedEntity.confidence > 65 },
              { label: 'Vendor Risk Assessments Completed', done: selectedEntity.confidence > 90 },
            ];
            return (
              <section style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #334155', borderRadius: 12, padding: '20px 16px', textAlign: 'center' as const }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 8 }}>Compliance Score</div>
                    <div style={{ fontSize: 52, fontWeight: 900, color: score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444', lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>out of 100</div>
                    <div style={{ marginTop: 12, height: 6, background: '#1e293b', borderRadius: 999 }}>
                      <div style={{ height: '100%', width: `${score}%`, background: score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444', borderRadius: 999, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <button style={styles.smallBtnPrimary} onClick={() => void generateExecutiveBrief()}>Generate Brief</button>
                      <button style={styles.smallBtn} onClick={() => openArea('analytics')}>Full Analytics →</button>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #334155', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 10 }}>Policy Compliance Checklist</div>
                    <div style={{ display: 'grid', gap: 7 }}>
                      {checks.map(c => (
                        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${c.done ? '#22c55e' : '#334155'}`, background: c.done ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', flexShrink: 0, fontWeight: 900 }}>{c.done ? '✓' : ''}</span>
                          <span style={{ fontSize: 12, color: c.done ? '#e2e8f0' : '#475569', flex: 1 }}>{c.label}</span>
                          {!c.done && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>ACTION NEEDED</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8 }}>
                  {selectedEntity.valueStats.map(s => (
                    <div key={s.label} style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{s.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#93c5fd', marginTop: 3 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (tabArea === 'dispatch') {
            const openCases = currentReports.filter(r => r.status !== 'Resolved');
            return (
              <section style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {([
                    { label: 'Active Cases', value: openCases.length, color: '#f97316', area: 'reports' as ActionArea },
                    { label: 'Assigned', value: openCases.filter(r => r.assignedTo).length, color: '#3b82f6', area: 'dispatch' as ActionArea },
                    { label: 'Unassigned', value: openCases.filter(r => !r.assignedTo).length, color: '#ef4444', area: 'reports' as ActionArea },
                  ] as {label:string;value:number;color:string;area:ActionArea}[]).map(s => (
                    <button key={s.label} style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${s.color}33`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' as const }} onClick={() => openArea(s.area)}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const }}>{s.label}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1, marginTop: 4 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#334155', marginTop: 6 }}>Tap to manage →</div>
                    </button>
                  ))}
                </div>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #1e293b', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 10 }}>Open Case Assignments — {selectedEntity.name}</div>
                  <div style={{ display: 'grid', gap: 5, maxHeight: 260, overflowY: 'auto' as const }}>
                    {openCases.slice(0, 10).map(r => (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(11,18,32,0.8)', border: '1px solid #1e293b', borderRadius: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.severity === 'High' ? '#ef4444' : r.severity === 'Moderate' ? '#f97316' : '#22c55e', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.title}</div>
                          <div style={{ fontSize: 10, color: '#475569' }}>{r.id} · {r.location}</div>
                        </div>
                        <span style={{ fontSize: 11, color: r.assignedTo ? '#22c55e' : '#f97316', flexShrink: 0, fontWeight: 600 }}>{r.assignedTo ? `→ ${r.assignedTo}` : '⚠ Unassigned'}</span>
                        <button style={{ ...styles.referBtn, fontSize: 10 }} onClick={() => { setSelectedReportId(r.id); openArea('dispatch'); setInteractionMessage(`Managing case: ${r.id}`); }}>Manage →</button>
                      </div>
                    ))}
                    {openCases.length === 0 && <p style={{ color: '#22c55e', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>✓ All cases resolved</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button style={styles.smallBtnPrimary} onClick={() => openArea('dispatch')}>Open Action Center →</button>
                    <button style={styles.smallBtn} onClick={() => void agentRouteAllOpenCases()}>Auto-Route All</button>
                  </div>
                </div>
              </section>
            );
          }

          // tabArea === 'audit' — Admin panel
          return (
            <section style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #334155', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 10 }}>Entity Management</div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <input value={entityEditorName} onChange={e => setEntityEditorName(e.target.value)} placeholder="Entity name" style={styles.input} />
                    <input value={entityEditorRegion} onChange={e => setEntityEditorRegion(e.target.value)} placeholder="Region code" style={styles.input} />
                    <select value={entityEditorStatus} onChange={e => setEntityEditorStatus(e.target.value as Status)} style={styles.input}>
                      <option value="Active">Active</option><option value="Pilot">Pilot</option><option value="Planning">Planning</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' as const }}>
                    <button style={styles.smallBtnPrimary} onClick={updateCurrentEntity}>Save Changes</button>
                    <button style={styles.smallBtn} onClick={createEntityFromEditor}>+ Create New Entity</button>
                  </div>
                </div>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid #334155', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' as const }}>Audit Trail</div>
                    <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => openArea('audit')}>Full View →</button>
                  </div>
                  <div style={{ maxHeight: 175, overflowY: 'auto' as const, display: 'grid', gap: 2 }}>
                    {auditEntries.length > 0 ? auditEntries.slice(-10).reverse().map((entry, i) => (
                      <div key={i} style={{ fontSize: 10, color: '#94a3b8', padding: '4px 0', borderBottom: '1px solid #0f172a' }}>{entry}</div>
                    )) : <div style={{ fontSize: 11, color: '#475569' }}>No audit entries yet. Actions are logged here automatically.</div>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                <button style={styles.smallBtn} onClick={() => openArea('audit')}>Audit Work Queue</button>
                <button style={styles.smallBtn} onClick={() => openArea('analytics')}>Analytics & Reports</button>
                <button style={styles.smallBtn} onClick={() => void generateExecutiveBrief()}>Generate Executive Brief</button>
                <button style={styles.smallBtnPrimary} onClick={() => { openArea('audit'); setInteractionMessage('Admin panel opened — full audit and user management.'); }}>Open Full Admin Panel →</button>
              </div>
            </section>
          );
        })()}

        <section style={styles.kpiGrid}>
          {selectedEntity.kpis.map((kpi) => (
            <div key={kpi.label} style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{kpi.label}</div>
              <div style={styles.kpiValue}>{kpi.value}</div>
              <div style={styles.kpiDelta}>{kpi.delta}</div>
            </div>
          ))}
        </section>

        <section style={styles.infoNeedsCard}>
          <h3 style={styles.cardTitle}>Category Intelligence Requirements ({activeCategoryType})</h3>
          <p style={{ ...styles.subtitle, marginBottom: 10 }}>
            These are the key information elements this category should track to operate the full DPAL workflow.
          </p>
          <div style={styles.infoNeedsGrid}>
            {infoNeeds.map((item) => (
              <div key={item.label} style={styles.infoNeedItem}>
                <div style={{ color: '#93c5fd', fontSize: 12, fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{item.value}</div>
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>{item.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.playbookCard}>
          <div style={styles.playbookTop}>
            <div>
              <h3 style={styles.cardTitle}>Category Operations Console ({activeCategoryType})</h3>
              <p style={{ ...styles.subtitle, marginBottom: 10 }}>{playbook.operationalObjective}</p>
            </div>
            <img
              src={activeCategoryImage}
              alt={activeCategoryType}
              style={styles.playbookImage}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = categoryFallbackImage(activeCategoryType);
              }}
            />
          </div>

          <div style={styles.playbookSteps}>
            {playbook.workflowSteps.map((step, idx) => (
              <div key={`${step}-${idx}`} style={styles.playStepItem}>
                <span style={styles.playStepIndex}>{idx + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div style={{ ...styles.referRow, marginTop: 10 }}>
            {playbook.quickActions.map((action) => (
              <button
                key={`${activeCategoryType}-${action.label}`}
                style={styles.referBtnPrimary}
                onClick={() => {
                  if (!selectedReport) return;
                  if (action.openArea) openArea(action.openArea);
                  void updateReportStatus(selectedReport.id, action.status, {
                    assignedTo: action.route,
                    note: action.note,
                  });
                }}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div style={{ ...styles.recommendCard, marginTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Category Toolset ({activeCategoryType})</div>
            <div style={styles.referRow}>
              {categoryTools(activeCategoryType).map((toolName) => {
                const toolAreaMap: Record<string, ActionArea> = {
                  'Reports Queue': 'reports',
                  'Action Center': 'dispatch',
                  'Analytics': 'analytics',
                  'Audit Trail': 'audit',
                  'AI Copilot': 'analytics',
                  'Voice Controls': 'reports',
                };
                const area = toolAreaMap[toolName];
                return (
                  <button
                    key={`${activeCategoryType}-tool-${toolName}`}
                    style={styles.referBtn}
                    onClick={() => {
                      if (area) {
                        openArea(area);
                      } else {
                        openMockCategoryLink(toolName, `${toolName} module activated for ${activeCategoryType} operations. Review the action panel below.`);
                      }
                    }}
                  >
                    {toolName}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.agentConsole}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Agent Mission Controls</div>
            <div style={styles.referRow}>
              <button style={styles.smallBtn} onClick={() => void agentRouteAllOpenCases()} disabled={agentBusy}>
                {agentBusy ? 'Routing…' : 'Auto-Route Open Cases'}
              </button>
              <button style={styles.smallBtn} onClick={agentRunQuickAudit}>Run Quick Audit</button>
              <button style={styles.smallBtnPrimary} onClick={agentGenerateActionPlan}>Generate Action Plan</button>
            </div>
            {agentLog.length > 0 && (
              <ul style={styles.agentLogList}>
                {agentLog.map((line) => <li key={line}>{line}</li>)}
              </ul>
            )}
          </div>
        </section>

        {renderEntityLayout()}

        {activeTool && renderToolPanel()}

        <section style={styles.navCard}>
          {ACTION_AREAS.map((a) => (
            <button key={a.key} onClick={() => openArea(a.key)} style={{ ...styles.sectionBtn, ...(activeArea === a.key ? styles.sectionBtnActive : {}) }}>
              {a.label}
            </button>
          ))}
        </section>

        <section style={styles.voicePanel}>
          <div>
            <div style={styles.panelLabel}>Voice Controls</div>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>
              Speak briefs/reports and dictate directly into action notes or new item summary.
            </div>
          </div>
          <div style={styles.referRow}>
            <select value={voiceTarget} onChange={(e) => setVoiceTarget(e.target.value as 'actionNote' | 'newSummary')} style={styles.input}>
              <option value="actionNote">Dictate to Action Note</option>
              <option value="newSummary">Dictate to New Item Summary</option>
            </select>
            <button style={styles.smallBtn} onClick={startVoiceInput}>{voiceListening ? 'Listening…' : 'Start Voice Input'}</button>
            <button style={styles.smallBtn} onClick={() => speakText(executiveBrief || selectedReport?.summary || 'No text available to read.')}>Speak Current Brief</button>
            <button style={styles.smallBtn} onClick={() => speakText(selectedReport ? `${selectedReport.title}. ${selectedReport.summary}` : 'No report selected.')}>Speak Report Detail</button>
            <button style={styles.smallBtn} onClick={stopSpeaking}>Stop Voice</button>
            <span style={{ color: voiceEnabled ? '#86efac' : '#94a3b8', fontSize: 12 }}>{voiceEnabled ? 'Voice ready' : 'Voice idle'}</span>
          </div>
        </section>

        <section style={styles.railwayCard}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={styles.panelLabel}>Railway + Mongo Integration</div>
            <div style={{ color: '#cbd5e1', marginTop: 4 }}>Set API base, test connection, and persist actions/items to DPAL backend.</div>
            <div style={{ color: '#94a3b8', marginTop: 4, fontSize: 12 }}>
              {isSyncing ? 'Sync in progress...' : syncMessage}
            </div>
            <div style={styles.formGrid}>
              <input value={apiBaseInput} onChange={(e) => setApiBaseInput(e.target.value)} placeholder="https://your-railway-api.up.railway.app" style={styles.input} />
              <button style={styles.smallBtn} onClick={() => void testIntegration()}>Test Integration</button>
            </div>
          </div>
          <div style={styles.channelWrap}>
            <span style={styles.channelChip}>/health</span>
            <span style={styles.channelChip}>/api/reports/feed</span>
            <span style={styles.channelChip}>/api/reports/anchor</span>
            <span style={styles.channelChip}>/api/reports/:id/ops-status</span>
          </div>

          <div style={styles.endpointGrid}>
            {Object.entries(endpointStatus).map(([key, status]) => (
              <div key={key} style={styles.endpointItem}>
                <span>{key}</span>
                <span style={{ color: status === 'ok' ? '#22c55e' : status === 'fail' ? '#ef4444' : '#94a3b8', fontWeight: 700 }}>
                  {status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.twoCol}>
          <div style={styles.card}>
            {activeArea === 'reports' && (
              <>
                <h3 style={styles.cardTitle}>Reports Queue</h3>

                <div style={styles.createCard}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Create New Item</div>
                  <div style={styles.formGrid}>
                    <input value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} placeholder="Report title" style={styles.input} />
                    <input value={newItemLocation} onChange={(e) => setNewItemLocation(e.target.value)} placeholder="Location / zone" style={styles.input} />
                    <select value={newItemSeverity} onChange={(e) => setNewItemSeverity(e.target.value as Severity)} style={styles.input}>
                      <option>Low</option><option>Moderate</option><option>High</option>
                    </select>
                    <select value={newItemChannel} onChange={(e) => setNewItemChannel(e.target.value as Report['channel'])} style={styles.input}>
                      <option>App</option><option>WhatsApp</option><option>Web Portal</option><option>Hotline</option><option>Field Team</option>
                    </select>
                  </div>
                  <input value={newItemSummary} onChange={(e) => setNewItemSummary(e.target.value)} placeholder="Summary / notes" style={{ ...styles.input, width: '100%', marginTop: 8 }} />

                  {intakeFields.length > 0 && (
                    <>
                      <div style={{ ...styles.panelLabel, marginTop: 8 }}>Category-specific intake fields</div>
                      <div style={styles.formGrid}>
                        {intakeFields.map((field) => (
                          <input
                            key={`intake-${field.key}`}
                            value={newItemFields[field.key] || ''}
                            onChange={(e) => setNewItemFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={`${field.label} — ${field.placeholder}`}
                            style={styles.input}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div style={styles.actionButtons}>
                    <button style={styles.smallBtnPrimary} onClick={() => void createNewItem()}>Create & Save</button>
                  </div>
                </div>

                <div style={styles.valueRow}>
                  <span>Total: {counts.total}</span>
                  <span>New: {counts.byStatus.New}</span>
                  <span>Investigating: {counts.byStatus.Investigating}</span>
                  <span>Action Taken: {counts.byStatus['Action Taken']}</span>
                  <span>Resolved: {counts.byStatus.Resolved}</span>
                </div>
                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  {currentReports.map((r) => (
                    <div key={r.id} style={{ ...styles.reportRow, ...(selectedReport?.id === r.id ? styles.reportSelected : {}) }}>
                      <button style={styles.reportSelectBtn} onClick={() => { setSelectedReportId(r.id); logAction(`Selected report ${r.id}`); }}>
                        <div style={{ fontWeight: 700 }}>{r.id} • {r.title}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{r.channel} • {r.location} • {r.severity} • ETA {r.eta}</div>
                        <div style={{ marginTop: 4, fontSize: 12 }}>Status: <strong>{r.status}</strong></div>
                      </button>

                      <div style={styles.referRow}>
                        <span style={styles.referHint}>Refer to:</span>
                        {referralTargets(r).slice(0, 3).map((target) => (
                          <button key={`${r.id}-${target}`} style={styles.referBtn} onClick={() => void quickRefer(r, target)}>
                            {target}
                          </button>
                        ))}
                        <button style={styles.referBtnPrimary} onClick={() => void updateReportStatus(r.id, 'Action Taken', { note: 'Immediate mitigation started from queue' })}>
                          Take Action
                        </button>
                        <button style={styles.referBtn} onClick={() => void runItemInteraction(r, 'request-evidence')}>Request Evidence</button>
                        <button style={styles.referBtn} onClick={() => void runItemInteraction(r, 'escalate-legal')}>Escalate Legal</button>
                        <button style={styles.referBtn} onClick={() => void runItemInteraction(r, 'duplicate-check')}>Check Duplicates</button>
                        <button style={styles.referBtn} onClick={() => void runItemInteraction(r, 'notify-public')}>Draft Public Alert</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeArea === 'dispatch' && (
              <>
                <h3 style={styles.cardTitle}>Action Center</h3>
                <p style={styles.subtitle}>Assign teams, trigger field actions, and track completion from one place.</p>
                <div style={styles.formGrid}>
                  <input
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="Assign to (e.g., Field Team Alpha)"
                    style={styles.input}
                  />
                  <input
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Action note (saved to history)"
                    style={styles.input}
                  />
                </div>
                {!selectedReport && (
                  <div style={{ color: '#f97316', fontSize: 12, marginBottom: 8, padding: '6px 10px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8 }}>
                    ⚠ No report selected — go to Reports Queue and select one first.
                  </div>
                )}
                {selectedReport && (
                  <div style={{ color: '#93c5fd', fontSize: 12, marginBottom: 8, padding: '6px 10px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 8 }}>
                    Acting on: <strong>{selectedReport.id}</strong> — {selectedReport.title.slice(0, 50)}{selectedReport.title.length > 50 ? '…' : ''}
                  </div>
                )}
                <div style={styles.actionButtons}>
                  <button style={styles.smallBtn} onClick={() => openArea('reports')}>← Back to Queue</button>
                  <button
                    style={{ ...styles.smallBtn, ...(selectedReport ? {} : { opacity: 0.4 }) }}
                    onClick={() => {
                      if (!selectedReport) { setInteractionMessage('Select a report from the queue first.'); return; }
                      void updateReportStatus(selectedReport.id, 'Investigating', { assignedTo: assignedTo || 'Field Team' });
                    }}
                  >
                    Assign Team
                  </button>
                  <button
                    style={{ ...styles.smallBtn, ...(selectedReport ? {} : { opacity: 0.4 }) }}
                    onClick={() => {
                      if (!selectedReport) { setInteractionMessage('Select a report from the queue first.'); return; }
                      void updateReportStatus(selectedReport.id, 'Action Taken', { note: actionNote || 'Action logged from Action Center.' });
                    }}
                  >
                    Log Action Taken
                  </button>
                  <button
                    style={{ ...styles.smallBtnPrimary, ...(selectedReport ? {} : { opacity: 0.4 }) }}
                    onClick={() => {
                      if (!selectedReport) { setInteractionMessage('Select a report from the queue first.'); return; }
                      void updateReportStatus(selectedReport.id, 'Resolved', { note: actionNote || 'Resolved from Action Center.' });
                    }}
                  >
                    Mark Resolved
                  </button>
                </div>
              </>
            )}

            {activeArea === 'analytics' && (
              <>
                <h3 style={styles.cardTitle}>Analytics Snapshot</h3>
                <div style={styles.uniqueGrid3}>
                  {selectedEntity.valueStats.map((s) => <MiniTile key={s.label} title={s.label} value={s.value} subtitle="value realized" />)}
                </div>

                <div style={styles.aiCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 800 }}>Executive Brief</div>
                    <div style={styles.actionButtons}>
                      <button style={styles.smallBtn} onClick={() => void generateExecutiveBrief()}>
                        {executiveBriefLoading ? 'Regenerating…' : 'Regenerate'}
                      </button>
                      <button
                        style={styles.smallBtn}
                        onClick={() => {
                          if (!executiveBrief) return;
                          void navigator.clipboard?.writeText(executiveBrief);
                          logAction('Executive brief copied to clipboard');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <pre style={styles.briefText}>{executiveBrief || 'No brief yet. Click Regenerate to create one.'}</pre>
                </div>
              </>
            )}

            {activeArea === 'audit' && (
              <>
                <h3 style={styles.cardTitle}>Audit, Work Issuance & People-of-Interest</h3>

                <div style={styles.auditOpsGrid}>
                  <div style={styles.createCard}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Issue Audit Work</div>
                    <div style={styles.formGrid}>
                      <input value={auditWorkTitle} onChange={(e) => setAuditWorkTitle(e.target.value)} placeholder="Audit task title" style={styles.input} />
                      <input value={auditWorkAssignee} onChange={(e) => setAuditWorkAssignee(e.target.value)} placeholder="Assign to" style={styles.input} />
                    </div>
                    <div style={styles.actionButtons}>
                      <button style={styles.smallBtnPrimary} onClick={issueAuditWork}>Issue Work</button>
                    </div>
                  </div>

                  <div style={styles.createCard}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>People of Interest Analysis</div>
                    <div style={styles.formGrid}>
                      <input value={personOfInterest} onChange={(e) => setPersonOfInterest(e.target.value)} placeholder="Name / entity token" style={styles.input} />
                    </div>
                    <div style={styles.actionButtons}>
                      <button style={styles.smallBtnPrimary} onClick={addPersonOfInterest}>Add POI</button>
                    </div>
                  </div>
                </div>

                <div style={styles.auditOpsGrid}>
                  <div style={styles.createCard}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Audit Work Queue</div>
                    {auditWorkItems.length ? (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {auditWorkItems.map((w) => (
                          <div key={w.id} style={styles.endpointItem}>
                            <span>{w.id} • {w.title} • {w.assignee}</span>
                            <div style={styles.referRow}>
                              <button style={styles.referBtn} onClick={() => setAuditWorkStatus(w.id, 'Open')}>Open</button>
                              <button style={styles.referBtn} onClick={() => setAuditWorkStatus(w.id, 'In Review')}>In Review</button>
                              <button style={styles.referBtnPrimary} onClick={() => setAuditWorkStatus(w.id, 'Closed')}>Closed</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.subtitle}>No audit work issued yet.</p>
                    )}
                  </div>

                  <div style={styles.createCard}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>POI Register (Mock)</div>
                    {poiItems.length ? (
                      <ul style={styles.auditList}>
                        {poiItems.map((p) => <li key={p.id}>{p.id} • {p.name} • Risk: {p.risk} • {p.note}</li>)}
                      </ul>
                    ) : (
                      <p style={styles.subtitle}>No people/entities of interest added yet.</p>
                    )}
                  </div>
                </div>

                <div style={styles.createCard}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Audit Trail</div>
                  {auditEntries.length ? (
                    <ul style={styles.auditList}>
                      {auditEntries.map((entry) => <li key={entry}>{entry}</li>)}
                    </ul>
                  ) : (
                    <p style={styles.subtitle}>No actions yet. Use buttons in Reports/Dispatch and events will appear here.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div style={styles.card}>
            {selectedReport ? (() => {
              let hash = 0;
              for (let i = 0; i < selectedReport.id.length; i++) hash = (hash * 31 + selectedReport.id.charCodeAt(i)) & 0xffff;
              const baseMs = 1739980800000 + (hash % 604800000);
              const baseDt = new Date(baseMs);
              const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const fmtFull = (d: Date) => d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
              const officers = referralTargets(selectedReport);
              const caseRef = `DPAL-${selectedEntity.region}-${selectedReport.id}`;
              const reportUrl = `https://dpal-nexus.io/reports/${selectedReport.id}`;
              const sevColor = selectedReport.severity === 'High' ? '#ef4444' : selectedReport.severity === 'Moderate' ? '#f97316' : '#22c55e';
              const statusColor = selectedReport.status === 'Resolved' ? '#22c55e' : selectedReport.status === 'Action Taken' ? '#f97316' : selectedReport.status === 'Investigating' ? '#3b82f6' : '#94a3b8';
              const autoEvidence = [
                { id: 'ev1', type: 'photo', label: `Photo_Evidence_${selectedReport.id}_001.jpg`, url: `https://picsum.photos/seed/${selectedReport.id}a/800/500`, addedAt: fmtFull(baseDt) },
                { id: 'ev2', type: 'photo', label: `Photo_Evidence_${selectedReport.id}_002.jpg`, url: `https://picsum.photos/seed/${selectedReport.id}b/800/500`, addedAt: fmtFull(new Date(baseMs + 3600000)) },
                { id: 'ev3', type: 'document', label: `Field_Report_${selectedReport.id}.pdf`, url: `#demo-pdf-${selectedReport.id}`, addedAt: fmtFull(new Date(baseMs + 7200000)) },
                { id: 'ev4', type: 'data', label: `Incident_Data_${selectedReport.id}.csv`, url: `#demo-csv-${selectedReport.id}`, addedAt: fmtFull(new Date(baseMs + 10800000)) },
              ].slice(0, 2 + (hash % 3));
              const userEv = userEvidenceByReport[selectedReport.id] || [];
              const allEvidence = [...autoEvidence, ...userEv];
              const tlSteps = [
                { label: `Report submitted via ${selectedReport.channel}`, actor: 'System', note: 'Auto-assigned reference number and timestamp.', done: true, date: fmtFull(baseDt) },
                { label: 'AI triage completed', actor: 'DPAL AI Engine', note: `Severity classified as ${selectedReport.severity}. SLA clock started.`, done: true, date: fmtFull(new Date(baseMs + 900000)) },
                { label: `Case assigned to ${officers[0] || 'Operations Team'}`, actor: 'Case Coordinator', note: 'Assignment notification sent.', done: selectedReport.status !== 'New', date: fmtFull(new Date(baseMs + 3600000)) },
                { label: 'Field investigation underway', actor: officers[0] || 'Field Team', note: 'On-site inspection and documentation in progress.', done: selectedReport.status === 'Action Taken' || selectedReport.status === 'Resolved', date: fmtFull(new Date(baseMs + 18000000)) },
                { label: 'Corrective action implemented', actor: officers[1] || 'Operations Supervisor', note: 'Mitigation measures applied and verified.', done: selectedReport.status === 'Resolved', date: fmtFull(new Date(baseMs + 86400000)) },
                { label: 'Case closed — final report filed', actor: officers[2] || 'Department Head', note: 'Archived in DPAL Nexus and regulatory log.', done: selectedReport.status === 'Resolved', date: fmtFull(new Date(baseMs + 172800000)) },
              ];
              const relatedCases = currentReports.filter(r => r.id !== selectedReport.id && r.severity === selectedReport.severity).slice(0, 3);
              const AI = aiByReportId[selectedReport.id];
              const reportedBy = hash % 3 === 0 ? 'Citizen (Identity Verified)' : hash % 3 === 1 ? 'Field Inspector' : 'Anonymous Citizen';
              return (
                <div>
                  {/* ── Official Report Header ── */}
                  <div style={{ background: `linear-gradient(135deg, ${sevColor}18, rgba(15,23,42,0.98))`, border: `1px solid ${sevColor}44`, borderRadius: '10px 10px 0 0', padding: '14px 16px', marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0 }}>D</div>
                          <div>
                            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>DPAL Nexus Accountability Platform</div>
                            <div style={{ fontSize: 9, color: '#475569' }}>Official Incident Report · {selectedEntity.type}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 15, color: '#f1f5f9', lineHeight: 1.3 }}>{selectedReport.title}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>Case Ref: <span style={{ color: '#93c5fd', fontFamily: 'monospace', fontWeight: 700 }}>{caseRef}</span></div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ background: `${sevColor}22`, color: sevColor, border: `1px solid ${sevColor}55`, padding: '3px 10px', borderRadius: 999, fontWeight: 800, fontSize: 11 }}>⚡ {selectedReport.severity.toUpperCase()} RISK</span>
                        <span style={{ background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`, padding: '2px 8px', borderRadius: 999, fontWeight: 700, fontSize: 10 }}>{selectedReport.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: `1px solid ${sevColor}22`, borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', marginBottom: 12 }}>
                    {/* §1 Overview */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={styles.officialSectionLabel}>§ 1 — Incident Overview</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px', marginTop: 8 }}>
                        {([
                          ['Report ID', selectedReport.id],
                          ['Case Reference', caseRef],
                          ['Entity', selectedEntity.name],
                          ['Jurisdiction', selectedEntity.region],
                          ['Department', officers[0] || 'Operations'],
                          ['Case Officer', selectedReport.assignedTo || officers[0] || 'Pending'],
                          ['Incident Date', fmtDate(new Date(baseMs - 86400000 * (hash % 2)))],
                          ['Filed On', fmtFull(baseDt)],
                          ['Last Updated', fmtFull(new Date(baseMs + 3600000 * ((hash % 8) + 1)))],
                          ['Channel', selectedReport.channel],
                          ['Location', selectedReport.location],
                          ['Reported By', reportedBy],
                          ['ETA / Resolution', selectedReport.eta],
                          ['Classification', `${selectedReport.severity} Risk · ${selectedEntity.type}`],
                        ] as [string, string][]).map(([label, val]) => (
                          <div key={label} style={{ borderBottom: '1px solid #0f172a', paddingBottom: 4 }}>
                            <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
                            <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, marginTop: 1 }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* §2 Description */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={styles.officialSectionLabel}>§ 2 — Incident Description</div>
                      <p style={{ color: '#cbd5e1', fontSize: 12, lineHeight: 1.7, marginTop: 8, marginBottom: 0 }}>{selectedReport.summary}</p>
                      {selectedReport.lastActionNote && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 6, fontSize: 11, color: '#93c5fd' }}>
                          <span style={{ fontWeight: 700, display: 'block', marginBottom: 3 }}>Latest Action Note:</span>
                          {selectedReport.lastActionNote}
                        </div>
                      )}
                    </div>

                    {/* §3 Evidence */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={styles.officialSectionLabel}>§ 3 — Evidence &amp; Attachments ({allEvidence.length})</div>
                      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                        {allEvidence.map((ev) => {
                          const icon = ev.type === 'photo' ? '📷' : ev.type === 'document' ? '📄' : ev.type === 'video' ? '🎥' : '📊';
                          const isReal = ev.url.startsWith('http');
                          return (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'rgba(15,23,42,0.7)', border: '1px solid #1e293b', borderRadius: 6 }}>
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.label}</div>
                                <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>Added: {ev.addedAt}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                                <button style={{ ...styles.referBtn, fontSize: 9, padding: '2px 7px' }} onClick={() => { if (isReal) { window.open(ev.url, '_blank'); } else { setInteractionMessage(`Demo file: ${ev.label} — connect Railway backend to serve actual files.`); } }}>
                                  {ev.type === 'photo' ? 'View' : 'Open'}
                                </button>
                                <button style={{ ...styles.referBtn, fontSize: 9, padding: '2px 7px' }} onClick={() => { void navigator.clipboard?.writeText(isReal ? ev.url : `https://files.dpal-nexus.io/evidence/${selectedReport.id}/${encodeURIComponent(ev.label)}`); setInteractionMessage(`Link copied: ${ev.label}`); }}>
                                  Copy
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Add evidence */}
                      <div style={{ marginTop: 8, border: '1px dashed #334155', borderRadius: 6, padding: '8px 10px', background: 'rgba(15,23,42,0.4)' }}>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>+ Attach Evidence</div>
                        <div style={{ display: 'grid', gap: 5 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 5 }}>
                            <input value={newEvidenceLabel} onChange={e => setNewEvidenceLabel(e.target.value)} placeholder="File label (e.g. Photo_Site_001.jpg)" style={{ ...styles.input, fontSize: 10 }} />
                            <select value={newEvidenceType} onChange={e => setNewEvidenceType(e.target.value as 'photo' | 'document' | 'data' | 'video')} style={{ ...styles.input, fontSize: 10 }}>
                              <option value="photo">📷 Photo</option>
                              <option value="document">📄 Document</option>
                              <option value="data">📊 Data</option>
                              <option value="video">🎥 Video</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: 5 }}>
                            <input value={newEvidenceUrl} onChange={e => setNewEvidenceUrl(e.target.value)} placeholder="URL (optional — leave blank for auto)" style={{ ...styles.input, fontSize: 10, flex: 1 }} />
                            <button style={{ ...styles.smallBtnPrimary, fontSize: 10, whiteSpace: 'nowrap' }} onClick={() => {
                              if (!newEvidenceLabel.trim()) { setInteractionMessage('Enter a file label first.'); return; }
                              const ev = { id: `uev-${Date.now()}`, type: newEvidenceType, label: newEvidenceLabel.trim(), url: newEvidenceUrl.trim() || `https://files.dpal-nexus.io/evidence/${selectedReport.id}/${encodeURIComponent(newEvidenceLabel.trim())}`, addedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) };
                              setUserEvidenceByReport(prev => ({ ...prev, [selectedReport.id]: [...(prev[selectedReport.id] || []), ev] }));
                              setNewEvidenceLabel(''); setNewEvidenceUrl('');
                              logAction(`Evidence attached to ${selectedReport.id}: ${ev.label}`);
                              setInteractionMessage(`Evidence attached: ${ev.label}`);
                            }}>Attach</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* §4 Timeline */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={styles.officialSectionLabel}>§ 4 — Case Timeline</div>
                      <div style={{ display: 'grid', gap: 0, marginTop: 10 }}>
                        {tlSteps.map((step, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i < tlSteps.length - 1 ? 12 : 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${step.done ? '#22c55e' : '#334155'}`, background: step.done ? '#22c55e' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: step.done ? '#fff' : '#334155', fontWeight: 700 }}>
                                {step.done ? '✓' : i + 1}
                              </div>
                              {i < tlSteps.length - 1 && <div style={{ width: 2, flex: 1, background: step.done ? '#22c55e44' : '#1e293b', marginTop: 2 }} />}
                            </div>
                            <div style={{ flex: 1, paddingTop: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: step.done ? '#f1f5f9' : '#475569' }}>{step.label}</div>
                              <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{step.date} · {step.actor}</div>
                              {step.done && step.note && <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>{step.note}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* §5 Related Cases */}
                    {relatedCases.length > 0 && (
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                        <div style={styles.officialSectionLabel}>§ 5 — Related Cases ({relatedCases.length})</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          {relatedCases.map(r => (
                            <button key={r.id} style={{ ...styles.referBtn, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '5px 8px', borderRadius: 6, textAlign: 'left' }} onClick={() => { setSelectedReportId(r.id); setInteractionMessage(`Switched to related case: ${r.id}`); }}>
                              <span style={{ fontWeight: 700, fontSize: 10 }}>{r.id}</span>
                              <span style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{r.title.slice(0, 28)}{r.title.length > 28 ? '…' : ''}</span>
                              <span style={{ fontSize: 9, color: r.severity === 'High' ? '#ef4444' : '#f97316', marginTop: 1 }}>{r.severity}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* §6 AI Risk Analysis */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={styles.officialSectionLabel}>§ 6 — AI Risk Analysis</div>
                        <button style={{ ...styles.smallBtn, fontSize: 9, padding: '2px 7px' }} onClick={() => void runAiForReport(selectedReport)}>{aiLoadingFor === selectedReport.id ? 'Analyzing…' : AI ? 'Re-analyze' : 'Run AI'}</button>
                      </div>
                      {AI ? (
                        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5 }}>
                            {([['Severity', AI.severitySuggested], ['Route To', AI.routeTo], ['SLA', `${AI.slaHours}h`], ['Engine', AI.provider || 'local']] as [string,string][]).map(([l, v]) => (
                              <div key={l} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, padding: '5px 7px' }}>
                                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', fontWeight: 700 }}>{l}</div>
                                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          <p style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.6, margin: 0 }}>{AI.rationale}</p>
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {AI.nextActions.map(a => (
                              <button key={a.label} style={styles.referBtnPrimary} onClick={() => void updateReportStatus(selectedReport.id, a.status, { assignedTo: AI.routeTo, note: a.note })}>{a.label}</button>
                            ))}
                          </div>
                          {!!AI.similar?.length && (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {AI.similar?.map(s => (
                                <button key={s.id} style={{ ...styles.referBtn, fontSize: 10 }} onClick={() => setSelectedReportId(s.id)}>{s.id} · {Math.round((s.score || 0) * 100)}% match</button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: '#475569', fontSize: 11, marginTop: 6 }}>Run AI Analysis to get severity suggestion, routing, and SLA guidance.</p>
                      )}
                    </div>

                    {/* §7 Referrals & Response */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={styles.officialSectionLabel}>§ 7 — Referrals &amp; Response</div>
                      <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 4 }}>REFER TO:</div>
                          <div style={styles.referRow}>
                            {referralTargets(selectedReport).map(target => (
                              <button key={target} style={styles.referBtn} onClick={() => void quickRefer(selectedReport, target)}>{target}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, marginBottom: 4 }}>RESPONSE TEMPLATES:</div>
                          <div style={styles.referRow}>
                            <button style={styles.referBtn} onClick={() => setActionNote('Initial response issued. Responsible team assigned and ETA communicated to all parties.')}>Initial Response</button>
                            <button style={styles.referBtn} onClick={() => setActionNote('Evidence request issued. Photo documentation and supporting materials requested from all parties.')}>Evidence Request</button>
                            <button style={styles.referBtn} onClick={() => setActionNote('Escalation notice issued to legal/compliance. Case elevated due to risk profile and jurisdictional requirements.')}>Escalation Notice</button>
                          </div>
                        </div>
                        <div>
                          <input value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder="Action note — type or select template above…" style={{ ...styles.input, width: '100%' }} />
                          <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                            <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => { if (!actionNote.trim()) return; void updateReportStatus(selectedReport.id, 'Investigating', { assignedTo, note: actionNote }); setInteractionMessage(`Case ${selectedReport.id} set to Investigating.`); }}>Save as Investigating</button>
                            <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => { if (!actionNote.trim()) return; void updateReportStatus(selectedReport.id, 'Action Taken', { assignedTo, note: actionNote }); setInteractionMessage(`Action logged for ${selectedReport.id}.`); }}>Log Action Taken</button>
                            <button style={{ ...styles.smallBtnPrimary, fontSize: 10 }} onClick={() => { if (!actionNote.trim()) return; void updateReportStatus(selectedReport.id, 'Resolved', { assignedTo, note: actionNote }); setInteractionMessage(`Case ${selectedReport.id} resolved.`); }}>Mark Resolved</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* §8 Playbooks */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={styles.officialSectionLabel}>§ 8 — Playbooks &amp; Resources</div>
                        {mockLinkResponse && <button style={{ ...styles.smallBtn, fontSize: 9, padding: '2px 6px' }} onClick={() => setMockLinkResponse('')}>Clear</button>}
                      </div>
                      <div style={{ ...styles.referRow, marginTop: 8 }}>
                        {categoryLinks(activeCategoryType).map((link) => (
                          <button key={`${selectedEntity.type}-${link.label}`} style={styles.referBtn} onClick={() => openMockCategoryLink(link.label, link.action)}>📋 {link.label}</button>
                        ))}
                      </div>
                      {mockLinkResponse && (
                        <div style={{ marginTop: 8, border: '1px solid #22c55e44', borderRadius: 6, padding: '8px 10px', background: 'rgba(34,197,94,0.04)' }}>
                          <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 700, marginBottom: 4 }}>✓ LOADED</div>
                          <pre style={{ ...styles.briefText, border: 'none', background: 'transparent', padding: 0, margin: 0, fontSize: 11 }}>{mockLinkResponse}</pre>
                        </div>
                      )}
                    </div>

                    {/* Report action bar */}
                    <div style={{ padding: '10px 16px', background: 'rgba(15,23,42,0.6)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => {
                        const content = [`DPAL NEXUS — OFFICIAL INCIDENT REPORT`, `Case Ref: ${caseRef}`, `Filed: ${fmtFull(baseDt)}`, ``, `TITLE: ${selectedReport.title}`, `Severity: ${selectedReport.severity} | Status: ${selectedReport.status}`, `Entity: ${selectedEntity.name} (${selectedEntity.type})`, `Location: ${selectedReport.location}`, `Channel: ${selectedReport.channel}`, `Case Officer: ${selectedReport.assignedTo || officers[0] || 'Unassigned'}`, `Reported By: ${reportedBy}`, ``, `DESCRIPTION:`, selectedReport.summary, ``, `LAST ACTION: ${selectedReport.lastActionNote || 'None'}`, ``, `EVIDENCE (${allEvidence.length} items):`, ...allEvidence.map(e => `  - ${e.label}: ${e.url}`), ``, `Generated by DPAL Nexus Accountability Platform`, `Reference: ${reportUrl}`].join('\n');
                        void navigator.clipboard?.writeText(content);
                        setInteractionMessage(`Report ${selectedReport.id} copied as official text.`);
                        logAction(`Exported report ${selectedReport.id}`);
                      }}>📋 Copy Report</button>
                      <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => { void navigator.clipboard?.writeText(reportUrl); setInteractionMessage(`Shareable link copied: ${reportUrl}`); }}>🔗 Share Link</button>
                      <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => window.print()}>🖨 Print</button>
                      <button style={{ ...styles.smallBtn, fontSize: 10 }} onClick={() => void runAiForReport(selectedReport)}>🤖 AI Analysis</button>
                      <button style={{ ...styles.smallBtnPrimary, fontSize: 10, marginLeft: 'auto' }} onClick={() => void updateReportStatus(selectedReport.id, 'Resolved', { note: 'Case resolved and officially closed via DPAL Nexus.' })}>✅ Resolve &amp; Close</button>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 32 }}>📋</div>
                <div style={{ fontWeight: 700, color: '#64748b' }}>No Report Selected</div>
                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>Select a report from the queue to view the full official incident record.</div>
                <button style={styles.smallBtnPrimary} onClick={() => openArea('reports')}>Open Reports Queue →</button>
              </div>
            )}

            {/* BELOW: stub for Submit Response block that was here — now in §7 above */}
          </div>
        </section>

        </>)}

        {interactionMessage && (
          <section style={styles.interactionBanner}>
            <strong>Interaction:</strong> {interactionMessage}
            <button type="button" aria-label="Dismiss" onClick={() => setInteractionMessage('')} style={styles.interactionDismiss}>×</button>
          </section>
        )}

        <section style={styles.setupsPanel}>
          <div style={styles.setupsGrid}>
            {SETUP_CARDS.map((setup) => (
              <button
                key={setup.id}
                className="showcase-card"
                style={styles.setupCard}
                onClick={() => {
                  openArea(setup.area);
                  const tabs = PORTAL_TABS_BY_TYPE[selectedEntity.type] || PORTAL_TABS_BY_TYPE.City;
                  setActivePortalTab(getTabForArea(setup.area, tabs));
                  setInteractionMessage(`${setup.label} — ${selectedEntity.name} (${selectedEntity.type}). View updated.`);
                }}
              >
                <div style={styles.showcaseIconWrap}>
                  <span style={styles.showcaseIcon} aria-hidden>{setup.icon}</span>
                </div>
                <div style={styles.showcaseBody}>
                  <div style={styles.showcaseTag}>{setup.label}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniTile({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div style={styles.miniTile}>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'radial-gradient(circle at 10% 0%, #0f1f3d 0%, #060a13 50%, #04060c 100%)', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 },
  shell: { maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 14 },
  hero: { border: '1px solid #334155', borderRadius: 16, padding: 18, background: 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(8,12,20,0.88))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  eyebrow: { fontSize: 11, color: '#93c5fd', fontWeight: 700, letterSpacing: 1, marginBottom: 8 },
  title: { margin: 0, fontSize: 30, fontWeight: 900 },
  subtitle: { margin: 0, color: '#94a3b8' },
  primaryBtn: { border: '1px solid #2563eb', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: 'pointer' },
  portalShell: { border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px', background: 'linear-gradient(180deg, rgba(7,12,24,0.99) 0%, rgba(5,9,18,0.99) 100%)', display: 'grid', gap: 12, boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset' },
  portalTopBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  portalBrandRow: { display: 'flex', alignItems: 'center', gap: 12 },
  portalLogo: { width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg, #1d6fe8, #1a56c4)', color: '#fff', fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(29,111,232,0.5)' },
  portalBrand: { color: '#ffffff', fontWeight: 900, fontSize: 19, letterSpacing: 0.8 },
  portalSubtitle: { color: '#64748b', fontSize: 12, marginTop: 1 },
  portalEntityMeta: { color: '#475569', fontSize: 10, marginTop: 2 },
  portalRightRow: { display: 'flex', alignItems: 'center', gap: 12 },
  portalNavBtn: { border: '1px solid #334155', background: 'rgba(255,255,255,0.03)', color: '#cbd5e1', borderRadius: 8, padding: '7px 10px', fontWeight: 700, fontSize: 12, cursor: 'pointer' },
  portalRiskPill: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: '1px solid', color: '#e2e8f0', fontSize: 12, fontWeight: 700 },
  portalUserRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, background: 'rgba(255,255,255,0.04)', cursor: 'pointer' },
  portalAvatar: { width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(135deg,#334155,#1e293b)', color: '#94a3b8', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' },
  portalUserLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: 600 },
  portalTabs: { display: 'flex', gap: 4, flexWrap: 'wrap' as const, padding: '0 2px' },
  portalTab: { border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', borderRadius: 8, padding: '9px 15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, transition: 'all 0.15s' },
  portalTabActive: { background: 'rgba(37,99,235,0.18)', borderColor: '#2563eb', color: '#93c5fd', fontWeight: 700 },
  selectorPanel: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)', display: 'grid', gap: 10 },
  panelLabel: { fontSize: 12, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { border: '1px solid #334155', background: '#111827', color: '#cbd5e1', borderRadius: 10, padding: '7px 11px', fontWeight: 600, cursor: 'pointer' },
  chipActive: { borderColor: '#2563eb', background: '#1d4ed8', color: '#fff' },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  entitySwitcher: { display: 'flex', alignItems: 'center', gap: 8 },
  arrowBtn: { border: '1px solid #334155', background: '#111827', color: '#e2e8f0', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontWeight: 800 },
  select: { minWidth: 320, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' },
  entityEditorCard: { border: '1px dashed #334155', borderRadius: 12, padding: 10, background: 'rgba(15,23,42,0.55)' },
  showcasePanel: { border: '1px solid #334155', borderRadius: 12, padding: 16, background: 'rgba(11,18,32,0.86)' },
  showcaseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10 },
  showcaseGrid: { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' },
  showcaseCard: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 14,
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.78)',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.08) inset, 0 4px 20px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  },
  showcaseIconWrap: { padding: '20px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  showcaseIcon: { fontSize: 48, lineHeight: 1, display: 'block' },
  showcasePhotoWrap: { position: 'relative', width: '100%', height: 110, overflow: 'hidden', flexShrink: 0 },
  showcasePhoto: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  showcasePhotoOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)' },
  showcaseBody: { padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' },
  showcaseTag: { color: '#f1f5f9', fontSize: 13, fontWeight: 700, lineHeight: 1.3 },
  showcaseCaption: { color: '#94a3b8', fontSize: 11, lineHeight: 1.35 },
  setupsPanel: { padding: '24px 0', borderTop: '1px solid #334155' },
  setupsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, maxWidth: 1280, margin: '0 auto' },
  setupCard: {
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.78)',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.1) inset, 0 1px 0 0 rgba(148, 163, 184, 0.06), 0 4px 24px rgba(0, 0, 0, 0.35)',
    minHeight: 140,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  },
  heroImageCard: { position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155', minHeight: 220 },
  heroImage: { width: '100%', height: 260, objectFit: 'cover', display: 'block' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,6,23,0.2), rgba(2,6,23,0.75))', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 },
  channelWrap: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  channelChip: { border: '1px solid #334155', borderRadius: 999, padding: '5px 10px', color: '#cbd5e1', fontSize: 12, background: 'rgba(15,23,42,0.7)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 10 },
  kpiCard: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: 'rgba(15,23,42,0.82)' },
  kpiLabel: { color: '#94a3b8', fontSize: 12 },
  kpiValue: { fontSize: 28, fontWeight: 800, marginTop: 6 },
  kpiDelta: { color: '#86efac', fontSize: 12, marginTop: 6 },
  infoNeedsCard: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  infoNeedsGrid: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
  infoNeedItem: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0f172a' },
  playbookCard: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  playbookTop: { display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' },
  playbookImage: { width: 180, height: 96, objectFit: 'cover', borderRadius: 10, border: '1px solid #334155' },
  playbookSteps: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
  agentConsole: { border: '1px dashed #334155', borderRadius: 10, marginTop: 10, padding: 10, background: 'rgba(2,6,23,0.45)' },
  agentLogList: { margin: '8px 0 0 16px', color: '#cbd5e1', fontSize: 12, lineHeight: 1.6 },
  officialSectionLabel: { fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' as const, color: '#475569', paddingBottom: 2, borderBottom: '1px solid #1e293b' },
  playStepItem: { border: '1px solid #334155', borderRadius: 10, background: '#0f172a', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' },
  playStepIndex: { width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1d4ed8', color: '#fff', fontSize: 11, fontWeight: 700 },
  uniqueLayoutCard: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  uniqueGrid3: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' },
  uniqueGrid2: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
  bankShell: { display: 'grid', gap: 12 },
  bankGridTop: { display: 'grid', gap: 10, gridTemplateColumns: '1fr 1.2fr 1fr' },
  bankGridBottom: { display: 'grid', gap: 10, gridTemplateColumns: '1.6fr 1fr' },
  bankCard: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0f172a' },
  bankCardLarge: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0f172a' },
  bankGaugeValue: { fontSize: 56, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.1 },
  bankScaleRow: { display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 },
  bankListRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f2937', color: '#cbd5e1' },
  bankCaseRow: { display: 'grid', gridTemplateColumns: '78px 1fr auto', gap: 8, alignItems: 'center', padding: '6px 8px', border: '1px solid #334155', borderRadius: 8, background: '#111827' },
  bankStatusBadge: { background: '#1d4ed8', border: '1px solid #2563eb', color: '#dbeafe', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 },
  bankMapImage: { width: '100%', height: 240, objectFit: 'cover', borderRadius: 10, border: '1px solid #334155' },
  bankInsightList: { margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8, fontSize: 13 },
  cityTileGrid: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' },
  cityTileButton: { border: '1px solid #334155', background: 'linear-gradient(145deg,#0f172a,#111827)', color: '#e2e8f0', borderRadius: 10, padding: '12px 10px', fontWeight: 700, cursor: 'pointer' },
  miniTile: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0f172a' },
  navCard: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: 'rgba(11,18,32,0.86)', display: 'flex', gap: 8, flexWrap: 'wrap' },
  railwayCard: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: 'rgba(11,18,32,0.86)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  endpointGrid: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', width: '100%' },
  endpointItem: { border: '1px solid #334155', borderRadius: 8, padding: '6px 8px', display: 'flex', justifyContent: 'space-between', background: '#0f172a', fontSize: 12, color: '#cbd5e1' },
  interactionBanner: { border: '1px solid #2563eb', borderRadius: 10, padding: '8px 12px', background: 'rgba(37,99,235,0.12)', color: '#dbeafe', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  interactionDismiss: { background: 'transparent', border: 'none', color: '#93c5fd', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  dashGrid: { display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: 14, alignItems: 'start' },
  dashCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  dashColCenter: { display: 'flex', flexDirection: 'column', gap: 12 },
  dashCard: { border: '1px solid #1e293b', borderRadius: 14, padding: 16, background: 'linear-gradient(145deg, rgba(11,18,32,0.96), rgba(8,12,20,0.92))' },
  gaugeWrap: { display: 'flex', justifyContent: 'center', marginTop: 8 },
  voicePanel: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: 'rgba(11,18,32,0.86)', display: 'grid', gap: 8 },
  sectionBtn: { border: '1px solid #334155', background: '#0f172a', color: '#cbd5e1', borderRadius: 9, padding: '8px 10px', cursor: 'pointer', fontWeight: 700 },
  sectionBtnActive: { borderColor: '#2563eb', background: '#1d4ed8', color: '#fff' },
  twoCol: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 },
  card: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  cardTitle: { marginTop: 0, marginBottom: 10 },
  createCard: { border: '1px dashed #334155', borderRadius: 10, padding: 10, marginBottom: 10, background: 'rgba(15,23,42,0.5)' },
  auditOpsGrid: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' },
  valueRow: { display: 'flex', gap: 12, flexWrap: 'wrap', color: '#cbd5e1', fontSize: 13 },
  reportRow: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: '#0f172a', display: 'grid', gap: 8, textAlign: 'left', color: '#e2e8f0' },
  reportSelectBtn: { border: 'none', background: 'transparent', color: '#e2e8f0', textAlign: 'left', padding: 0, cursor: 'pointer' },
  reportSelected: { borderColor: '#2563eb', boxShadow: '0 0 0 1px #2563eb inset' },
  referRow: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  referHint: { fontSize: 11, color: '#94a3b8', marginRight: 2 },
  referBtn: { border: '1px solid #334155', background: '#111827', color: '#cbd5e1', borderRadius: 999, padding: '4px 9px', fontSize: 11, cursor: 'pointer' },
  referBtnPrimary: { border: '1px solid #2563eb', background: '#1d4ed8', color: '#fff', borderRadius: 999, padding: '4px 9px', fontSize: 11, cursor: 'pointer', fontWeight: 700 },
  recommendCard: { border: '1px dashed #334155', borderRadius: 10, padding: 10, marginTop: 10, background: 'rgba(15,23,42,0.55)' },
  responseCard: { border: '1px dashed #334155', borderRadius: 10, padding: 10, marginTop: 10, background: 'rgba(15,23,42,0.55)' },
  aiCard: { border: '1px solid #334155', borderRadius: 10, padding: 10, marginTop: 10, background: 'rgba(2,6,23,0.45)' },
  aiGrid: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', marginTop: 8 },
  aiItem: { border: '1px solid #334155', borderRadius: 8, padding: '6px 8px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1' },
  briefText: { marginTop: 10, whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: 12, lineHeight: 1.6, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '10px 12px' },
  similarBtn: { border: '1px solid #334155', background: '#0b1220', color: '#cbd5e1', borderRadius: 8, padding: '6px 8px', textAlign: 'left', cursor: 'pointer', fontSize: 12 },
  formGrid: { display: 'grid', gap: 8, marginTop: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
  input: { border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12 },
  actionButtons: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  smallBtn: { border: '1px solid #475569', background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer' },
  smallBtnPrimary: { border: '1px solid #16a34a', background: '#166534', color: '#fff', borderRadius: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 },
  valueStat: { border: '1px solid #334155', borderRadius: 10, padding: '9px 10px', display: 'flex', justifyContent: 'space-between', gap: 10, color: '#cbd5e1', background: '#0f172a', marginBottom: 8 },
  auditList: { margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 },
};

