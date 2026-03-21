// Mock Data for Boxway Architecture Firm Management System

export const MOCK_USERS = [
  { id: 1, name: 'Alex Carter', email: 'admin@boxway.com', password: 'admin123', role: 'Admin', avatar: '' },
  { id: 2, name: 'Sarah Chen', email: 'architect@boxway.com', password: 'arch123', role: 'Architect', avatar: '' },
];

export const MOCK_EMPLOYEES = [
  { id: 'EMP001', name: 'Marcus Johnson', email: 'marcus.j@boxway.com', phone: '+1 555-0101', role: 'Senior Architect', department: 'Design', status: 'Active', salary: 95000, joinDate: '2021-03-15', avatar: '', location: 'New York', skills: ['AutoCAD', 'Revit', 'SketchUp'] },
  { id: 'EMP002', name: 'Priya Nair', email: 'priya.n@boxway.com', phone: '+1 555-0102', role: 'Project Manager', department: 'Management', status: 'Active', salary: 88000, joinDate: '2020-07-22', avatar: '', location: 'San Francisco', skills: ['Project Planning', 'Agile', 'CAD'] },
  { id: 'EMP003', name: 'Tom Walsh', email: 'tom.w@boxway.com', phone: '+1 555-0103', role: 'Junior Architect', department: 'Design', status: 'Active', salary: 62000, joinDate: '2023-01-10', avatar: '', location: 'Chicago', skills: ['Revit', 'Rhino', 'AutoCAD'] },
  { id: 'EMP004', name: 'Elena Rodriguez', email: 'elena.r@boxway.com', phone: '+1 555-0104', role: 'Interior Designer', department: 'Design', status: 'Active', salary: 72000, joinDate: '2022-05-01', avatar: '', location: 'Miami', skills: ['3DS Max', 'V-Ray', 'AutoCAD'] },
  { id: 'EMP005', name: 'James Kim', email: 'james.k@boxway.com', phone: '+1 555-0105', role: 'Structural Engineer', department: 'Engineering', status: 'On Leave', salary: 105000, joinDate: '2019-09-12', avatar: '', location: 'Austin', skills: ['ETABS', 'SAP2000', 'AutoCAD'] },
  { id: 'EMP006', name: 'Lisa Park', email: 'lisa.p@boxway.com', phone: '+1 555-0106', role: 'CAD Technician', department: 'Technical', status: 'Active', salary: 55000, joinDate: '2022-11-08', avatar: '', location: 'Seattle', skills: ['AutoCAD', 'SketchUp', 'BIM'] },
  { id: 'EMP007', name: 'David Torres', email: 'david.t@boxway.com', phone: '+1 555-0107', role: 'Finance Manager', department: 'Finance', status: 'Active', salary: 82000, joinDate: '2021-06-15', avatar: '', location: 'New York', skills: ['Financial Planning', 'Excel', 'QuickBooks'] },
  { id: 'EMP008', name: 'Nina Patel', email: 'nina.p@boxway.com', phone: '+1 555-0108', role: 'Architect', department: 'Design', status: 'Active', salary: 78000, joinDate: '2022-02-28', avatar: '', location: 'Boston', skills: ['Revit', 'AutoCAD', 'Lumion'] },
];

export const MOCK_CLIENTS = [
  { id: 'CLT001', name: 'Meridian Properties', contactPerson: 'Robert Chen', email: 'robert@meridian.com', phone: '+1 555-2001', type: 'Corporate', status: 'Active', totalProjects: 3, totalValue: 450000, city: 'New York', joinDate: '2021-05-15' },
  { id: 'CLT002', name: 'Horizon Developments', contactPerson: 'Amanda Lee', email: 'amanda@horizon.dev', phone: '+1 555-2002', type: 'Developer', status: 'Active', totalProjects: 5, totalValue: 1200000, city: 'Los Angeles', joinDate: '2020-08-20' },
  { id: 'CLT003', name: 'Park & Associates', contactPerson: 'Michael Park', email: 'michael@park-assoc.com', phone: '+1 555-2003', type: 'SMB', status: 'Active', totalProjects: 2, totalValue: 180000, city: 'Chicago', joinDate: '2022-03-11' },
  { id: 'CLT004', name: 'Sunrise Hospitality', contactPerson: 'Jennifer Wu', email: 'jennifer@sunrisehotels.com', phone: '+1 555-2004', type: 'Hospitality', status: 'Inactive', totalProjects: 1, totalValue: 320000, city: 'Miami', joinDate: '2022-09-05' },
  { id: 'CLT005', name: 'Greenway Urban Co.', contactPerson: 'Carlos Mendez', email: 'carlos@greenway.co', phone: '+1 555-2005', type: 'Municipality', status: 'Active', totalProjects: 4, totalValue: 890000, city: 'San Francisco', joinDate: '2021-12-18' },
];

export const MOCK_PROJECTS = [
  { id: 'PRJ001', name: 'Meridian Tower Renovation', client: 'Meridian Properties', clientId: 'CLT001', status: 'In Progress', phase: 3, totalPhases: 8, budget: 450000, spent: 220000, startDate: '2023-06-01', endDate: '2024-03-31', lead: 'Marcus Johnson', teamSize: 4, progress: 45, description: 'Complete renovation of the 25-story Meridian Tower downtown including lobby, floors 3-15 and rooftop garden.', type: 'Commercial' },
  { id: 'PRJ002', name: 'Horizon Residential Complex', client: 'Horizon Developments', clientId: 'CLT002', status: 'In Progress', phase: 5, totalPhases: 8, budget: 1200000, spent: 680000, startDate: '2022-11-01', endDate: '2024-08-30', lead: 'Priya Nair', teamSize: 7, progress: 62, description: 'Design and construction oversight of 120-unit residential complex with communal amenities.', type: 'Residential' },
  { id: 'PRJ003', name: 'Park Office Park', client: 'Park & Associates', clientId: 'CLT003', status: 'Planning', phase: 1, totalPhases: 8, budget: 180000, spent: 15000, startDate: '2024-01-15', endDate: '2024-10-31', lead: 'Nina Patel', teamSize: 3, progress: 8, description: 'Modern office park with sustainable design elements across 4 buildings on 5-acre site.', type: 'Commercial' },
  { id: 'PRJ004', name: 'Sunrise Boutique Hotel', client: 'Sunrise Hospitality', clientId: 'CLT004', status: 'Completed', phase: 8, totalPhases: 8, budget: 320000, spent: 315000, startDate: '2022-03-01', endDate: '2023-11-30', lead: 'Elena Rodriguez', teamSize: 5, progress: 100, description: 'Full design of 80-room boutique hotel with rooftop bar and spa facilities.', type: 'Hospitality' },
  { id: 'PRJ005', name: 'Greenway Community Center', client: 'Greenway Urban Co.', clientId: 'CLT005', status: 'On Hold', phase: 2, totalPhases: 8, budget: 890000, spent: 95000, startDate: '2023-09-01', endDate: '2025-06-30', lead: 'Marcus Johnson', teamSize: 6, progress: 12, description: 'Multi-purpose community center serving 50,000+ residents with sports facilities, amphitheater, and library.', type: 'Municipal' },
];

export const MOCK_PROPOSALS = [
  { id: 'PRP001', title: 'Nexus Tech Campus Proposal', client: 'Nexus Technologies', clientContact: 'Sarah Liu', status: 'Submitted', value: 520000, submittedDate: '2024-01-20', expiryDate: '2024-02-20', version: '1.2', lead: 'Marcus Johnson' },
  { id: 'PRP002', title: 'Urban Loft Conversion Feasibility', client: 'CityDwell LLC', clientContact: 'Brian Foster', status: 'Draft', value: 95000, submittedDate: null, expiryDate: null, version: '0.5', lead: 'Tom Walsh' },
  { id: 'PRP003', title: 'Airport Terminal Expansion Study', client: 'Metro Airport Authority', clientContact: 'Diane Ross', status: 'Won', value: 750000, submittedDate: '2023-11-10', expiryDate: '2023-12-10', version: '2.1', lead: 'Priya Nair' },
  { id: 'PRP004', title: 'Riverside Eco-Homes Development', client: 'GreenBuild Partners', clientContact: 'Evan Hartley', status: 'Lost', value: 280000, submittedDate: '2023-12-05', expiryDate: '2024-01-05', version: '1.0', lead: 'Nina Patel' },
  { id: 'PRP005', title: 'Heritage Building Restoration Plan', client: 'City Heritage Society', clientContact: 'Dr. Clara Walsh', status: 'Under Review', value: 195000, submittedDate: '2024-01-25', expiryDate: '2024-02-25', version: '1.1', lead: 'Elena Rodriguez' },
];

export const MOCK_DOCUMENTS = [
  { id: 'DOC001', name: 'Meridian Tower - Site Survey', type: 'PDF', size: '4.2 MB', project: 'Meridian Tower Renovation', projectId: 'PRJ001', uploadedBy: 'Marcus Johnson', uploadDate: '2023-06-05', category: 'Survey', tags: ['site', 'survey', 'initial'] },
  { id: 'DOC002', name: 'Horizon Complex - Schematic Design', type: 'DWG', size: '28.5 MB', project: 'Horizon Residential Complex', projectId: 'PRJ002', uploadedBy: 'Priya Nair', uploadDate: '2023-02-10', category: 'Design', tags: ['schematic', 'design', 'approved'] },
  { id: 'DOC003', name: 'Park Office - Client Brief', type: 'DOCX', size: '1.8 MB', project: 'Park Office Park', projectId: 'PRJ003', uploadedBy: 'Nina Patel', uploadDate: '2024-01-20', category: 'Brief', tags: ['brief', 'client', 'requirements'] },
  { id: 'DOC004', name: 'Sunrise Hotel - Final Render Package', type: 'ZIP', size: '145 MB', project: 'Sunrise Boutique Hotel', projectId: 'PRJ004', uploadedBy: 'Elena Rodriguez', uploadDate: '2023-11-28', category: 'Renders', tags: ['renders', 'final', 'delivery'] },
  { id: 'DOC005', name: 'Q4 2023 - Project Status Report', type: 'PDF', size: '2.9 MB', project: null, projectId: null, uploadedBy: 'Alex Carter', uploadDate: '2024-01-02', category: 'Report', tags: ['report', 'quarterly', 'overview'] },
  { id: 'DOC006', name: 'Greenway Center - Structural Calculations', type: 'PDF', size: '8.1 MB', project: 'Greenway Community Center', projectId: 'PRJ005', uploadedBy: 'James Kim', uploadDate: '2023-10-14', category: 'Engineering', tags: ['structural', 'calculations', 'engineering'] },
];

export const MOCK_INVOICES = [
  { id: 'INV-2024-001', client: 'Meridian Properties', clientId: 'CLT001', project: 'Meridian Tower Renovation', projectId: 'PRJ001', amount: 75000, tax: 7500, total: 82500, status: 'Paid', issueDate: '2024-01-05', dueDate: '2024-02-05', paidDate: '2024-01-28', description: 'Phase 2 Design Completion', items: [{desc: 'Architectural Design Services - Phase 2', qty: 1, rate: 75000, total: 75000}] },
  { id: 'INV-2024-002', client: 'Horizon Developments', clientId: 'CLT002', project: 'Horizon Residential Complex', projectId: 'PRJ002', amount: 120000, tax: 12000, total: 132000, status: 'Pending', issueDate: '2024-01-15', dueDate: '2024-02-15', paidDate: null, description: 'Phase 5 Progress Billing', items: [{desc: 'Project Management - Jan 2024', qty: 1, rate: 25000, total: 25000}, {desc: 'Design Development Services', qty: 1, rate: 95000, total: 95000}] },
  { id: 'INV-2024-003', client: 'Park & Associates', clientId: 'CLT003', project: 'Park Office Park', projectId: 'PRJ003', amount: 18000, tax: 1800, total: 19800, status: 'Draft', issueDate: '2024-01-18', dueDate: '2024-02-18', paidDate: null, description: 'Preliminary Design & Feasibility Study', items: [{desc: 'Feasibility Study', qty: 1, rate: 8000, total: 8000},{desc: 'Preliminary Concept Design', qty: 1, rate: 10000, total: 10000}] },
  { id: 'INV-2023-045', client: 'Sunrise Hospitality', clientId: 'CLT004', project: 'Sunrise Boutique Hotel', projectId: 'PRJ004', amount: 55000, tax: 5500, total: 60500, status: 'Overdue', issueDate: '2023-11-15', dueDate: '2023-12-15', paidDate: null, description: 'Final Phase Billing', items: [{desc: 'Construction Administration', qty: 1, rate: 55000, total: 55000}] },
  { id: 'INV-2023-044', client: 'Greenway Urban Co.', clientId: 'CLT005', project: 'Greenway Community Center', projectId: 'PRJ005', amount: 45000, tax: 4500, total: 49500, status: 'Paid', issueDate: '2023-10-01', dueDate: '2023-11-01', paidDate: '2023-10-25', description: 'Phase 1 Milestone Payment', items: [{desc: 'Initial Design Services', qty: 1, rate: 45000, total: 45000}] },
];

export const MOCK_EXPENSES = [
  { id: 'EXP-2024-001', title: 'AutoCAD License Renewal', category: 'Software', amount: 2850, status: 'Approved', date: '2024-01-10', submittedBy: 'Tom Walsh', project: 'General', receipt: true, notes: 'Annual AutoCAD license for design team' },
  { id: 'EXP-2024-002', title: 'NYC Site Visit - Meridian Tower', category: 'Travel', amount: 1420, status: 'Pending', date: '2024-01-14', submittedBy: 'Marcus Johnson', project: 'Meridian Tower Renovation', receipt: true, notes: 'Return flights, hotel (2 nights), ground transport' },
  { id: 'EXP-2024-003', title: 'Office Supplies & Materials', category: 'Office', amount: 385, status: 'Approved', date: '2024-01-08', submittedBy: 'Lisa Park', project: null, receipt: false, notes: 'Printing, paper, markers for design sessions' },
  { id: 'EXP-2024-004', title: 'Client Entertainment - Horizon Dev', category: 'Entertainment', amount: 980, status: 'Rejected', date: '2024-01-12', submittedBy: 'Priya Nair', project: 'Horizon Residential Complex', receipt: true, notes: 'Team dinner for Q1 project review' },
  { id: 'EXP-2024-005', title: 'Revit Architecture Software', category: 'Software', amount: 3200, status: 'Approved', date: '2024-01-05', submittedBy: 'Nina Patel', project: 'General', receipt: true, notes: 'Revit subscription for Nina Patel' },
];

export const MOCK_PAYROLL_RUNS = [
  { id: 'PAY-2023-010', period: 'October 2023', employees: 8, adHoc: 3, grossAmount: 68750, netAmount: 51562, status: 'Completed', processedDate: '2023-10-28', approvedBy: 'Alex Carter' },
  { id: 'PAY-2023-009', period: 'September 2023', employees: 8, adHoc: 1, grossAmount: 67200, netAmount: 50400, status: 'Completed', processedDate: '2023-09-28', approvedBy: 'Alex Carter' },
  { id: 'PAY-2023-008', period: 'August 2023', employees: 7, adHoc: 2, grossAmount: 59500, netAmount: 44625, status: 'Completed', processedDate: '2023-08-29', approvedBy: 'Alex Carter' },
  { id: 'PAY-2023-011', period: 'November 2023 (Draft)', employees: 8, adHoc: 0, grossAmount: 68750, netAmount: 51562, status: 'Pending Approval', processedDate: null, approvedBy: null },
];

export const MOCK_PAYSLIPS = [
  { id: 'SLP-OCT-001', employeeId: 'EMP001', employeeName: 'Marcus Johnson', period: 'October 2023', grossSalary: 7917, deductions: 1346, net: 6571, status: 'Issued', issuedDate: '2023-10-28' },
  { id: 'SLP-OCT-002', employeeId: 'EMP002', employeeName: 'Priya Nair', period: 'October 2023', grossSalary: 7333, deductions: 1247, net: 6087, status: 'Issued', issuedDate: '2023-10-28' },
  { id: 'SLP-OCT-003', employeeId: 'EMP003', employeeName: 'Tom Walsh', period: 'October 2023', grossSalary: 5167, deductions: 879, net: 4288, status: 'Issued', issuedDate: '2023-10-28' },
  { id: 'SLP-OCT-004', employeeId: 'EMP004', employeeName: 'Elena Rodriguez', period: 'October 2023', grossSalary: 6000, deductions: 1020, net: 4980, status: 'Issued', issuedDate: '2023-10-28' },
  { id: 'SLP-SEP-001', employeeId: 'EMP001', employeeName: 'Marcus Johnson', period: 'September 2023', grossSalary: 7917, deductions: 1346, net: 6571, status: 'Issued', issuedDate: '2023-09-28' },
  { id: 'SLP-SEP-002', employeeId: 'EMP002', employeeName: 'Priya Nair', period: 'September 2023', grossSalary: 7333, deductions: 1247, net: 6087, status: 'Issued', issuedDate: '2023-09-28' },
];

export const MOCK_ANALYTICS = {
  revenueByMonth: [
    { month: 'Jul', revenue: 145000, expenses: 92000 },
    { month: 'Aug', revenue: 128000, expenses: 87000 },
    { month: 'Sep', revenue: 165000, expenses: 101000 },
    { month: 'Oct', revenue: 182000, expenses: 115000 },
    { month: 'Nov', revenue: 156000, expenses: 98000 },
    { month: 'Dec', revenue: 174000, expenses: 108000 },
    { month: 'Jan', revenue: 198000, expenses: 125000 },
  ],
  projectsByStatus: [
    { status: 'In Progress', count: 2, color: '#3b82f6' },
    { status: 'Planning', count: 1, color: '#ec5b13' },
    { status: 'Completed', count: 1, color: '#22c55e' },
    { status: 'On Hold', count: 1, color: '#f59e0b' },
  ],
  topClients: [
    { name: 'Horizon Developments', value: 1200000 },
    { name: 'Greenway Urban Co.', value: 890000 },
    { name: 'Meridian Properties', value: 450000 },
    { name: 'Sunrise Hospitality', value: 320000 },
    { name: 'Park & Associates', value: 180000 },
  ],
  kpis: {
    totalRevenue: 1148000,
    revenueGrowth: 12.4,
    activeProjects: 3,
    proposalWinRate: 68,
    avgProjectValue: 608000,
    outstandingInvoices: 202300,
  }
};

export const MOCK_AI_INSIGHTS = [
  { id: 1, type: 'warning', category: 'Finance', icon: 'warning', title: 'Invoice Payment Risk', description: 'INV-2023-045 from Sunrise Hospitality ($60,500) is 45 days overdue. Historical analysis suggests 78% chance of bad debt if not addressed within 14 days.', action: 'Send Reminder', priority: 'High', generatedAt: '2 hours ago' },
  { id: 2, type: 'opportunity', category: 'Business', icon: 'trending_up', title: 'Proposal Win Pattern Detected', description: 'Projects submitted on Tuesdays with 3D renders in proposals have a 82% higher win rate. Your last 3 submissions lacked render packages.', action: 'View Proposals', priority: 'Medium', generatedAt: '5 hours ago' },
  { id: 3, type: 'alert', category: 'Staffing', icon: 'person_alert', title: 'Resource Bottleneck Alert', description: 'Marcus Johnson is allocated 115% this quarter across 2 projects. Consider reassigning Greenway Community Center to Nina Patel to avoid burnout.', action: 'Reallocate', priority: 'High', generatedAt: '1 day ago' },
  { id: 4, type: 'insight', category: 'Projects', icon: 'lightbulb', title: 'Phase 3 Delay Prediction', description: 'Based on historical data for similar renovation projects, Meridian Tower Phase 3 has a 64% probability of a 2-week delay due to permit approvals.', action: 'View Project', priority: 'Medium', generatedAt: '1 day ago' },
  { id: 5, type: 'positive', category: 'Finance', icon: 'trending_up', title: 'Revenue Forecast', description: 'Based on active project milestones and historical billing patterns, Q1 2024 revenue is projected at $198,000 ± 8%, outperforming Q4 2023 by 14%.', action: 'View Analytics', priority: 'Low', generatedAt: '2 days ago' },
  { id: 6, type: 'insight', category: 'Operations', icon: 'schedule', title: 'Optimal Meeting Times', description: 'Analysis of project completion rates shows teams meeting 3x/week complete milestones 23% faster. 4 of your active projects meet only weekly.', action: 'Schedule Meetings', priority: 'Low', generatedAt: '3 days ago' },
];
