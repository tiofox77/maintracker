-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- Insert default permissions
INSERT INTO permissions (name, description, module) VALUES
-- Dashboard permissions
('view_dashboard', 'View the main dashboard', 'Dashboard'),
('view_metrics', 'View system metrics and statistics', 'Dashboard'),
('view_alerts', 'View system alerts and notifications', 'Dashboard'),

-- Maintenance permissions
('view_maintenance', 'View maintenance tasks', 'Maintenance'),
('create_maintenance', 'Create new maintenance tasks', 'Maintenance'),
('edit_maintenance', 'Edit existing maintenance tasks', 'Maintenance'),
('delete_maintenance', 'Delete maintenance tasks', 'Maintenance'),
('complete_maintenance', 'Mark maintenance tasks as complete', 'Maintenance'),

-- Equipment permissions
('view_equipment', 'View equipment list', 'Equipment'),
('create_equipment', 'Add new equipment', 'Equipment'),
('edit_equipment', 'Edit existing equipment', 'Equipment'),
('delete_equipment', 'Delete equipment', 'Equipment'),

-- Category & Department permissions
('view_categories', 'View categories and departments', 'Categories'),
('create_category', 'Create new categories', 'Categories'),
('edit_category', 'Edit existing categories', 'Categories'),
('delete_category', 'Delete categories', 'Categories'),
('view_departments', 'View departments', 'Categories'),
('create_department', 'Create new departments', 'Categories'),
('edit_department', 'Edit existing departments', 'Categories'),
('delete_department', 'Delete departments', 'Categories'),

-- Reports permissions
('view_reports', 'View system reports', 'Reports'),
('export_reports', 'Export reports to various formats', 'Reports'),
('create_custom_report', 'Create custom reports', 'Reports'),

-- User Management permissions
('view_users', 'View user list', 'Users'),
('create_user', 'Create new users', 'Users'),
('edit_user', 'Edit existing users', 'Users'),
('delete_user', 'Delete users', 'Users'),

-- Role Permissions management
('view_permissions', 'View role permissions', 'Permissions'),
('edit_permissions', 'Edit role permissions', 'Permissions'),

-- Settings permissions
('view_settings', 'View system settings', 'Settings'),
('edit_settings', 'Edit system settings', 'Settings'),

-- Supply Chain permissions
('view_material_requests', 'View material requests', 'Supply Chain'),
('create_material_request', 'Create new material requests', 'Supply Chain'),
('edit_material_request', 'Edit existing material requests', 'Supply Chain'),
('delete_material_request', 'Delete material requests', 'Supply Chain'),
('approve_material_request', 'Approve material requests', 'Supply Chain'),
('reject_material_request', 'Reject material requests', 'Supply Chain'),
('view_proforma_invoices', 'View proforma invoices', 'Supply Chain'),
('create_proforma_invoice', 'Create new proforma invoices', 'Supply Chain'),
('edit_proforma_invoice', 'Edit existing proforma invoices', 'Supply Chain'),
('delete_proforma_invoice', 'Delete proforma invoices', 'Supply Chain'),
('view_supply_chain_departments', 'View supply chain departments', 'Supply Chain'),
('create_supply_chain_department', 'Create new supply chain departments', 'Supply Chain'),
('edit_supply_chain_department', 'Edit existing supply chain departments', 'Supply Chain'),
('delete_supply_chain_department', 'Delete supply chain departments', 'Supply Chain');

-- Set up default role permissions

-- Admin role (all permissions)
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- Manager role
INSERT INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions WHERE 
    name LIKE 'view_%' OR
    name IN (
        'create_maintenance', 'edit_maintenance', 'complete_maintenance',
        'create_equipment', 'edit_equipment',
        'create_category', 'edit_category',
        'create_department', 'edit_department',
        'export_reports', 'create_custom_report',
        'create_material_request', 'edit_material_request', 'approve_material_request', 'reject_material_request',
        'create_proforma_invoice', 'edit_proforma_invoice'
    );

-- Technician role
INSERT INTO role_permissions (role, permission_id)
SELECT 'technician', id FROM permissions WHERE 
    name IN (
        'view_dashboard', 'view_metrics', 'view_alerts',
        'view_maintenance', 'edit_maintenance', 'complete_maintenance',
        'view_equipment',
        'view_categories', 'view_departments',
        'view_reports',
        'view_material_requests', 'create_material_request', 'edit_material_request'
    );

-- User role (basic view permissions)
INSERT INTO role_permissions (role, permission_id)
SELECT 'user', id FROM permissions WHERE 
    name IN (
        'view_dashboard', 'view_alerts',
        'view_maintenance',
        'view_equipment',
        'view_material_requests', 'create_material_request'
    );
