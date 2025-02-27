-- Seed data for the maintenance management system

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Production', 'Equipment used in production processes'),
('Facility', 'Building infrastructure and systems'),
('Transportation', 'Vehicles and material handling equipment'),
('IT', 'Computing and networking equipment'),
('Office', 'Office equipment and furniture');

-- Insert departments
INSERT INTO departments (name, description, location) VALUES
('Manufacturing', 'Main production department', 'Building A, Floor 1'),
('Assembly', 'Final product assembly', 'Building A, Floor 2'),
('Building Services', 'Facility maintenance and operations', 'Building B, Floor 1'),
('Warehouse', 'Storage and logistics', 'Building C'),
('IT Services', 'Information technology support', 'Building B, Floor 2'),
('Administration', 'Administrative offices', 'Building D');

-- Get IDs for categories and departments
DO $$
DECLARE
    production_id UUID;
    facility_id UUID;
    transportation_id UUID;
    it_id UUID;
    office_id UUID;
    
    manufacturing_id UUID;
    assembly_id UUID;
    building_services_id UUID;
    warehouse_id UUID;
    it_services_id UUID;
    admin_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO production_id FROM categories WHERE name = 'Production';
    SELECT id INTO facility_id FROM categories WHERE name = 'Facility';
    SELECT id INTO transportation_id FROM categories WHERE name = 'Transportation';
    SELECT id INTO it_id FROM categories WHERE name = 'IT';
    SELECT id INTO office_id FROM categories WHERE name = 'Office';
    
    -- Get department IDs
    SELECT id INTO manufacturing_id FROM departments WHERE name = 'Manufacturing';
    SELECT id INTO assembly_id FROM departments WHERE name = 'Assembly';
    SELECT id INTO building_services_id FROM departments WHERE name = 'Building Services';
    SELECT id INTO warehouse_id FROM departments WHERE name = 'Warehouse';
    SELECT id INTO it_services_id FROM departments WHERE name = 'IT Services';
    SELECT id INTO admin_id FROM departments WHERE name = 'Administration';
    
    -- Insert equipment
    INSERT INTO equipment (name, serial_number, category_id, department_id, status, purchase_date, last_maintenance, next_maintenance, notes) VALUES
    ('Industrial Mixer', 'MIX-2020-001', production_id, manufacturing_id, 'operational', '2020-05-10', '2023-10-15', '2024-01-15', 'Regular maintenance required every 3 months'),
    ('Conveyor Belt A', 'CONV-2019-A', production_id, assembly_id, 'maintenance', '2019-08-22', '2023-11-05', '2023-12-05', 'Belt tension needs regular adjustment'),
    ('HVAC System', 'HVAC-2021-003', facility_id, building_services_id, 'operational', '2021-01-15', '2023-09-20', '2024-03-20', 'Filters changed during last maintenance'),
    ('Forklift #2', 'FL-2018-002', transportation_id, warehouse_id, 'out-of-service', '2018-11-30', '2023-08-10', '2023-11-10', 'Hydraulic system failure, parts on order'),
    ('CNC Machine #3', 'CNC-2022-003', production_id, manufacturing_id, 'operational', '2022-03-18', '2023-10-25', '2024-01-25', 'Operating within normal parameters'),
    ('Server Rack B', 'SRV-2021-B', it_id, it_services_id, 'operational', '2021-07-12', '2023-11-01', '2024-02-01', 'Cooling system upgraded during last maintenance'),
    ('Office Printer', 'PRT-2022-001', office_id, admin_id, 'operational', '2022-01-05', '2023-10-10', '2024-04-10', 'Toner replaced during last maintenance');
    
    -- Insert maintenance tasks
    INSERT INTO maintenance_tasks (title, description, equipment_id, category, scheduled_date, completed_date, estimated_duration, actual_duration, priority, status, assigned_to, notes) VALUES
    ('Routine Inspection', 'Regular inspection of HVAC system', (SELECT id FROM equipment WHERE name = 'HVAC System'), 'preventive', '2023-06-15', '2023-06-15', 2, 2.5, 'medium', 'completed', 'technician1', 'All systems functioning normally. Replaced air filters.'),
    ('Oil Change', 'Regular oil change for CNC Machine', (SELECT id FROM equipment WHERE name = 'CNC Machine #3'), 'preventive', '2023-06-18', NULL, 1.5, NULL, 'high', 'scheduled', 'technician2', 'Use synthetic oil as recommended by manufacturer.'),
    ('Belt Replacement', 'Replace worn conveyor belt', (SELECT id FROM equipment WHERE name = 'Conveyor Belt A'), 'corrective', '2023-06-20', NULL, 3, NULL, 'high', 'in-progress', 'technician3', 'New belt ordered and received.'),
    ('Cooling System Check', 'Inspect server rack cooling', (SELECT id FROM equipment WHERE name = 'Server Rack B'), 'preventive', '2023-06-14', '2023-06-14', 1, 1, 'medium', 'completed', 'technician4', 'Cooling system operating within normal parameters.'),
    ('Hydraulic Repair', 'Fix hydraulic system on forklift', (SELECT id FROM equipment WHERE name = 'Forklift #2'), 'corrective', '2023-06-12', NULL, 4, NULL, 'critical', 'scheduled', 'technician1', 'Parts have been ordered, waiting for delivery.');
    
END $$;
