'use client';

import React, { useEffect, useMemo, useState } from 'react';

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

const uniqueByType: Record<EntityType, { headline: string; color: string; channelFocus: string[]; layout: 'city' | 'hospital' | 'school' | 'default' }> = {
  City: { headline: 'Urban Command Channel', color: '#38bdf8', channelFocus: ['Citizen WhatsApp Intake', 'Field Inspector App', 'Public Portal Reports'], layout: 'city' },
  'County Government': { headline: 'County Operations Channel', color: '#60a5fa', channelFocus: ['Constituent Portal', 'Cross-Agency Workflow', 'Emergency Readiness'], layout: 'default' },
  'Hospital Network': { headline: 'Clinical Safety Channel', color: '#22c55e', channelFocus: ['Ward Supervisor Hotline', 'Compliance Web Form', 'Clinical Team Mobile'], layout: 'hospital' },
  'School District': { headline: 'Campus Safety Channel', color: '#a78bfa', channelFocus: ['Parent App Reporting', 'Anonymous Web Intake', 'Counselor Escalation Queue'], layout: 'school' },
  University: { headline: 'Academic Integrity Channel', color: '#14b8a6', channelFocus: ['Student Portal', 'Faculty Oversight Board', 'Campus Security Feed'], layout: 'default' },
  'Transit Agency': { headline: 'Mobility Reliability Channel', color: '#f59e0b', channelFocus: ['Station Hotline', 'Driver Mobile Alerts', 'Commuter Web Reports'], layout: 'default' },
  'Police Department': { headline: 'Public Safety Response Channel', color: '#0284c7', channelFocus: ['911 Intake Sync', 'Patrol Dispatch', 'Evidence Workflow'], layout: 'default' },
  'Fire Department': { headline: 'Emergency Fire Ops Channel', color: '#f97316', channelFocus: ['Incident Command', 'Station Readiness', 'Response Timeline'], layout: 'default' },
  'Housing Authority': { headline: 'Tenant Protection Channel', color: '#ef4444', channelFocus: ['Tenant WhatsApp Intake', 'Inspector Field Workflow', 'Legal Case Pipeline'], layout: 'default' },
  'Utilities Provider': { headline: 'Service Continuity Channel', color: '#84cc16', channelFocus: ['Outage Mobile Alerts', 'Regulator Portal', 'Crew Dispatch Terminal'], layout: 'default' },
  'Retail Chain': { headline: 'Retail Risk Control Channel', color: '#f43f5e', channelFocus: ['Store Incident Intake', 'Loss Prevention Queue', 'Regional Ops Console'], layout: 'default' },
  'Logistics Company': { headline: 'Logistics Resilience Channel', color: '#0ea5e9', channelFocus: ['Hub Incident Feed', 'Driver Safety Alerts', 'Route Disruption Queue'], layout: 'default' },
  'Banking Group': { headline: 'Financial Operations Channel', color: '#22c55e', channelFocus: ['Branch Incident Intake', 'Fraud Risk Triage', 'Compliance Escalation'], layout: 'default' },
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
  const [selectedType, setSelectedType] = useState<EntityType | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState('nyc-city');
  const [view, setView] = useState<DashboardView>('Executive');
  const [activeArea, setActiveArea] = useState<ActionArea>('reports');
  const [reportsByEntity, setReportsByEntity] = useState<Record<string, Report[]>>(Object.fromEntries(ENTITIES.map((e) => [e.id, e.reports])));
  const [selectedReportId, setSelectedReportId] = useState<string>('NYC-1001');
  const [apiBaseInput, setApiBaseInput] = useState<string>(defaultApiBase);
  const apiBase = apiBaseInput.trim();
  const [syncMessage, setSyncMessage] = useState<string>(apiBase ? 'Connected to DPAL API' : 'Using demo data (set NEXT_PUBLIC_DPAL_API_BASE)');
  const [isSyncing, setIsSyncing] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [auditEntries, setAuditEntries] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
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

  const typeOptions = useMemo(() => ['All', ...Array.from(new Set(ENTITIES.map((e) => e.type)))] as const, []);
  const featuredCategoryTypes = useMemo(() => ['City', 'School District', 'Hospital Network', 'Banking Group', 'Utilities Provider', 'Housing Authority'], [] as string[]);
  const categoryCards = useMemo(() => {
    const base = showAllCategories
      ? CATEGORY_SHOWCASE
      : (() => {
          const featured = CATEGORY_SHOWCASE.filter((c) => featuredCategoryTypes.includes(c.type));
          return featured.length ? featured : CATEGORY_SHOWCASE.slice(0, 6);
        })();

    return base.map((c) => ({ ...c, image: categoryImageForType(c.type) }));
  }, [showAllCategories, featuredCategoryTypes]);
  const filteredEntities = useMemo(() => (selectedType === 'All' ? ENTITIES : ENTITIES.filter((e) => e.type === selectedType)), [selectedType]);
  const selectedEntity = filteredEntities.find((entity) => entity.id === selectedEntityId) || filteredEntities[0] || ENTITIES[0];
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

  const logAgent = (text: string) => {
    const stamp = new Date().toLocaleTimeString();
    setAgentLog((prev) => [`${stamp} - ${text}`, ...prev].slice(0, 12));
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
      if (rawReports) setReportsByEntity(JSON.parse(rawReports));
      if (rawAudit) setAuditEntries(JSON.parse(rawAudit));
    } catch {
      // ignore hydrate errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexus_reports_state_v1', JSON.stringify(reportsByEntity));
      localStorage.setItem('nexus_audit_state_v1', JSON.stringify(auditEntries));
    } catch {
      // ignore persistence errors
    }
  }, [reportsByEntity, auditEntries]);

  useEffect(() => {
    const currentType: EntityType = selectedType === 'All' ? selectedEntity.type : selectedType;
    const base: Record<string, string> = {};
    (CATEGORY_INTAKE_FIELDS[currentType] || []).forEach((f) => {
      base[f.key] = '';
    });
    setNewItemFields(base);
  }, [selectedType, selectedEntity.type]);

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
    logAction(`Switched section to ${area}`);
  };

  const quickRefer = async (report: Report, target: string) => {
    await updateReportStatus(report.id, 'Investigating', {
      assignedTo: target,
      note: `Referred to ${target} from reports queue`,
    });
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
      ],
      'Hospital Network': [
        { label: 'Clinical Incident SOP', action: 'Clinical safety SOP opened for rapid response workflow.' },
        { label: 'Regulatory Packet Builder', action: 'Mock regulatory packet assembled for review.' },
      ],
      'School District': [
        { label: 'Campus Escalation Protocol', action: 'Campus-level escalation path displayed for admin/counselor.' },
        { label: 'Parent Communication Template', action: 'Parent-safe communication draft generated.' },
      ],
      'Banking Group': [
        { label: 'Consumer Harm Scoring Guide', action: 'Harm scoring rules loaded for fraud/misconduct complaints.' },
        { label: 'Restitution Workflow', action: 'Restitution tracking workflow preview opened.' },
      ],
      'Housing Authority': [
        { label: 'Tenant Protection Workflow', action: 'Tenant safety and inspection workflow preview loaded.' },
        { label: 'Legal Escalation Matrix', action: 'Legal escalation conditions and SLA shown.' },
      ],
      'Utilities Provider': [
        { label: 'Outage Risk SOP', action: 'Outage response SOP opened for operations and field teams.' },
        { label: 'Regulator Notification Template', action: 'Regulatory notification draft generated.' },
      ],
    };

    return [...(byType[type] || []), ...base];
  };

  const openMockCategoryLink = (label: string, action: string) => {
    const msg = `Mock Link: ${label}\n${action}\n(Ready for real route integration)`;
    setMockLinkResponse(msg);
    setInteractionMessage(`Opened ${label}`);
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

  const renderEntityLayout = () => {
    if (profile.layout === 'city') {
      return (
        <div style={styles.uniqueLayoutCard}>
          <h3 style={styles.cardTitle}>City Layout: Urban Ops Canvas</h3>
          <div style={styles.uniqueGrid3}>
            <MiniTile title="District Hotspots" value="17" subtitle="3 rising this week" />
            <MiniTile title="Road Hazards" value="29" subtitle="8 urgent" />
            <MiniTile title="Public Works ETA" value="2.1h" subtitle="median" />
          </div>
        </div>
      );
    }

    if (profile.layout === 'hospital') {
      return (
        <div style={styles.uniqueLayoutCard}>
          <h3 style={styles.cardTitle}>Hospital Layout: Clinical Safety Matrix</h3>
          <div style={styles.uniqueGrid2}>
            <MiniTile title="Critical Compliance Cases" value="9" subtitle="requires same-day closure" />
            <MiniTile title="Patient Safety Escalations" value="14" subtitle="4 linked to same workflow" />
          </div>
        </div>
      );
    }

    if (profile.layout === 'school') {
      return (
        <div style={styles.uniqueLayoutCard}>
          <h3 style={styles.cardTitle}>School Layout: Campus Welfare Board</h3>
          <div style={styles.uniqueGrid3}>
            <MiniTile title="Counselor Queue" value="23" subtitle="avg wait 5.4h" />
            <MiniTile title="Parent Outreach" value="96%" subtitle="within SLA" />
            <MiniTile title="High-Risk Campuses" value="3" subtitle="targeted intervention" />
          </div>
        </div>
      );
    }

    return null;
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

        <section style={styles.selectorPanel}>
          <div style={styles.panelLabel}>Entity Type</div>
          <div style={styles.chipWrap}>
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  const next = type === 'All' ? ENTITIES[0] : ENTITIES.find((e) => e.type === type);
                  if (next) {
                    setSelectedEntityId(next.id);
                    setSelectedReportId(next.reports[0]?.id || '');
                    logAction(`Changed category to ${type} (${next.name})`);
                  }
                }}
                style={{ ...styles.chip, ...(selectedType === type ? styles.chipActive : {}) }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={styles.row}>
            <select
              value={selectedEntity.id}
              onChange={(e) => {
                setSelectedEntityId(e.target.value);
                const entity = ENTITIES.find((x) => x.id === e.target.value);
                if (entity?.reports[0]) setSelectedReportId(entity.reports[0].id);
                if (entity) logAction(`Switched entity to ${entity.name}`);
              }}
              style={styles.select}
            >
              {filteredEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
            <div style={styles.chipWrap}>
              {DASHBOARD_VIEWS.map((item) => (
                <button key={item} onClick={() => { setView(item); logAction(`Dashboard view set to ${item}`); }} style={{ ...styles.chip, ...(view === item ? styles.chipActive : {}) }}>{item}</button>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.showcasePanel}>
          <div style={styles.showcaseHeader}>
            <div style={styles.panelLabel}>Categories</div>
            <button style={styles.smallBtn} onClick={() => setShowAllCategories((v) => !v)}>
              {showAllCategories ? 'Show fewer' : 'Show all categories'}
            </button>
          </div>

          <div style={styles.showcaseGrid}>
            {categoryCards.map((category) => {
              const hasEntity = ENTITIES.some((entity) => entity.type === category.type);
              return (
                <button
                  key={category.type}
                  style={{ ...styles.showcaseCard, opacity: hasEntity ? 1 : 0.7 }}
                  onClick={() => {
                    setSelectedType(category.type);
                    const first = ENTITIES.find((entity) => entity.type === category.type);
                    if (first) {
                      setSelectedEntityId(first.id);
                      setSelectedReportId(first.reports[0]?.id || '');
                      logAction(`Opened category card: ${category.type}`);
                    }
                  }}
                  title={hasEntity ? `Open ${category.type}` : `${category.type} demo coming next`}
                >
                  <img
                    src={category.image}
                    alt={category.type}
                    style={styles.showcaseImage}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = categoryFallbackImage(category.type);
                    }}
                  />
                  <div style={styles.showcaseBody}>
                    <div style={styles.showcaseTag}>{category.type}</div>
                    <div style={{ color: '#cbd5e1', fontSize: 13 }}>{category.caption}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section style={styles.heroImageCard}>
          <img
            src={activeCategoryImage}
            alt={selectedEntity.name}
            style={styles.heroImage}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = categoryFallbackImage(activeCategoryType);
            }}
          />
          <div style={styles.heroOverlay}>
            <div style={{ ...styles.panelLabel, color: profile.color }}>{profile.headline}</div>
            <h2 style={{ margin: '4px 0 0 0' }}>{selectedEntity.name}</h2>
            <p style={{ margin: '6px 0 0 0', color: '#cbd5e1' }}>{selectedEntity.region} • {selectedEntity.status} • Confidence {selectedEntity.confidence}%</p>
            <div style={styles.channelWrap}>
              {profile.channelFocus.map((c) => <span key={c} style={{ ...styles.channelChip, borderColor: profile.color }}>{c}</span>)}
            </div>
          </div>
        </section>

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

        <section style={styles.navCard}>
          {ACTION_AREAS.map((a) => (
            <button key={a.key} onClick={() => openArea(a.key)} style={{ ...styles.sectionBtn, ...(activeArea === a.key ? styles.sectionBtnActive : {}) }}>
              {a.label}
            </button>
          ))}
        </section>

        {interactionMessage && (
          <section style={styles.interactionBanner}>
            <strong>Interaction:</strong> {interactionMessage}
          </section>
        )}

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
                <div style={styles.actionButtons}>
                  <button style={styles.smallBtn} onClick={() => openArea('reports')}>Back to Queue</button>
                  <button style={styles.smallBtn} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Investigating')}>Assign Team</button>
                  <button style={styles.smallBtn} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Action Taken')}>Log Action Taken</button>
                  <button style={styles.smallBtnPrimary} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Resolved')}>Mark Resolved</button>
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
            <h3 style={styles.cardTitle}>Selected Report Detail</h3>
            {selectedReport ? (
              <>
                <div style={styles.valueStat}><span>Report ID</span><strong>{selectedReport.id}</strong></div>
                <div style={styles.valueStat}><span>Status</span><strong>{selectedReport.status}</strong></div>
                <div style={styles.valueStat}><span>Channel</span><strong>{selectedReport.channel}</strong></div>
                <div style={styles.valueStat}><span>Severity</span><strong>{selectedReport.severity}</strong></div>
                <div style={styles.valueStat}><span>ETA</span><strong>{selectedReport.eta}</strong></div>
                <div style={styles.valueStat}><span>Assigned To</span><strong>{selectedReport.assignedTo || 'Unassigned'}</strong></div>
                <div style={styles.valueStat}><span>Last Action Note</span><strong>{selectedReport.lastActionNote || '—'}</strong></div>
                <p style={{ color: '#cbd5e1', marginTop: 12 }}>{selectedReport.summary}</p>

                <div style={styles.recommendCard}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Recommended Referrals</div>
                  <div style={styles.referRow}>
                    {referralTargets(selectedReport).map((target) => (
                      <button key={`detail-${selectedReport.id}-${target}`} style={styles.referBtn} onClick={() => void quickRefer(selectedReport, target)}>
                        {target}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.aiCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontWeight: 800 }}>AI Copilot</div>
                    <button style={styles.smallBtn} onClick={() => void runAiForReport(selectedReport)}>
                      {aiLoadingFor === selectedReport.id ? 'Analyzing…' : 'Run AI Analysis'}
                    </button>
                  </div>

                  {aiByReportId[selectedReport.id] && (
                    <>
                      <div style={styles.aiGrid}>
                        <div style={styles.aiItem}><span>Suggested Severity</span><strong>{aiByReportId[selectedReport.id].severitySuggested}</strong></div>
                        <div style={styles.aiItem}><span>Route To</span><strong>{aiByReportId[selectedReport.id].routeTo}</strong></div>
                        <div style={styles.aiItem}><span>SLA Target</span><strong>{aiByReportId[selectedReport.id].slaHours}h</strong></div>
                        <div style={styles.aiItem}><span>Provider</span><strong>{aiByReportId[selectedReport.id].provider || 'ai'}</strong></div>
                      </div>

                      <p style={{ color: '#cbd5e1', marginTop: 8 }}>{aiByReportId[selectedReport.id].rationale}</p>

                      <div style={styles.referRow}>
                        {aiByReportId[selectedReport.id].nextActions.map((a) => (
                          <button
                            key={`${selectedReport.id}-${a.label}`}
                            style={styles.referBtnPrimary}
                            onClick={() => void updateReportStatus(selectedReport.id, a.status, { assignedTo: aiByReportId[selectedReport.id].routeTo, note: a.note })}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>

                      {!!aiByReportId[selectedReport.id].similar?.length && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 12, color: '#93c5fd', marginBottom: 4 }}>Similar Cases</div>
                          <div style={{ display: 'grid', gap: 6 }}>
                            {aiByReportId[selectedReport.id].similar?.map((s) => (
                              <button key={`${selectedReport.id}-sim-${s.id}`} style={styles.similarBtn} onClick={() => setSelectedReportId(s.id)}>
                                {s.id} • {s.title} ({Math.round((s.score || 0) * 100)}%)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ ...styles.recommendCard, marginTop: 10 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Category Links ({activeCategoryType})</div>
                  <div style={styles.referRow}>
                    {categoryLinks(activeCategoryType).map((link) => (
                      <button
                        key={`${selectedEntity.type}-${link.label}`}
                        style={styles.referBtn}
                        onClick={() => openMockCategoryLink(link.label, link.action)}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                  <pre style={styles.briefText}>{mockLinkResponse || 'Select a category link to view mock response and intended behavior.'}</pre>
                </div>

                <div style={styles.responseCard}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>Response Composer</div>
                  <p style={styles.subtitle}>Use quick response templates and voice controls to accelerate action quality.</p>
                  <div style={styles.referRow}>
                    <button style={styles.referBtn} onClick={() => setActionNote('Initial response sent. Team assigned and ETA communicated.')}>Template: Initial Response</button>
                    <button style={styles.referBtn} onClick={() => setActionNote('Evidence request sent. Awaiting documents and photos.')}>Template: Evidence Request</button>
                    <button style={styles.referBtn} onClick={() => setActionNote('Escalation notice sent to legal/compliance due to risk profile.')}>Template: Escalation Notice</button>
                  </div>
                </div>

                <div style={styles.actionButtons}>
                  <button style={styles.smallBtn} onClick={() => openArea('dispatch')}>Go to Action Center</button>
                  <button style={styles.smallBtn} onClick={() => openArea('audit')}>Open Audit Trail</button>
                  <button style={styles.smallBtn} onClick={() => void runItemInteraction(selectedReport, 'request-evidence')}>Request Evidence</button>
                  <button style={styles.smallBtn} onClick={() => void runItemInteraction(selectedReport, 'escalate-legal')}>Escalate Legal</button>
                  <button style={styles.smallBtnPrimary} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Resolved')}>Resolve Now</button>
                </div>
              </>
            ) : (
              <p style={styles.subtitle}>Select a report from the queue.</p>
            )}

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Connected Modules</h4>
            <div style={styles.channelWrap}>{selectedEntity.modules.map((m) => <span key={m} style={styles.channelChip}>{m}</span>)}</div>
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
  selectorPanel: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)', display: 'grid', gap: 10 },
  panelLabel: { fontSize: 12, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { border: '1px solid #334155', background: '#111827', color: '#cbd5e1', borderRadius: 10, padding: '7px 11px', fontWeight: 600, cursor: 'pointer' },
  chipActive: { borderColor: '#2563eb', background: '#1d4ed8', color: '#fff' },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  select: { minWidth: 320, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' },
  showcasePanel: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: 'rgba(11,18,32,0.86)' },
  showcaseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10 },
  showcaseGrid: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' },
  showcaseCard: { border: '1px solid #334155', borderRadius: 14, overflow: 'hidden', background: '#0b1220', cursor: 'pointer', padding: 0, textAlign: 'left' },
  showcaseImage: { width: '100%', height: 84, objectFit: 'cover', display: 'block' },
  showcaseBody: { padding: 10, display: 'grid', gap: 6 },
  showcaseTag: { color: '#93c5fd', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' },
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
  playStepItem: { border: '1px solid #334155', borderRadius: 10, background: '#0f172a', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' },
  playStepIndex: { width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#1d4ed8', color: '#fff', fontSize: 11, fontWeight: 700 },
  uniqueLayoutCard: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  uniqueGrid3: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' },
  uniqueGrid2: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
  miniTile: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0f172a' },
  navCard: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: 'rgba(11,18,32,0.86)', display: 'flex', gap: 8, flexWrap: 'wrap' },
  railwayCard: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: 'rgba(11,18,32,0.86)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  endpointGrid: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', width: '100%' },
  endpointItem: { border: '1px solid #334155', borderRadius: 8, padding: '6px 8px', display: 'flex', justifyContent: 'space-between', background: '#0f172a', fontSize: 12, color: '#cbd5e1' },
  interactionBanner: { border: '1px solid #2563eb', borderRadius: 10, padding: '8px 10px', background: 'rgba(37,99,235,0.12)', color: '#dbeafe', fontSize: 13 },
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

