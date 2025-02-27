-- Create tables for the maintenance management system

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  department_id UUID REFERENCES departments(id),
  status TEXT CHECK (status IN ('operational', 'maintenance', 'out-of-service')) DEFAULT 'operational',
  purchase_date DATE,
  last_maintenance DATE,
  next_maintenance DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  equipment_id UUID REFERENCES equipment(id),
  category TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  estimated_duration NUMERIC,
  actual_duration NUMERIC,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'partial')) DEFAULT 'scheduled',
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('admin', 'manager', 'technician', 'user')) DEFAULT 'user',
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  company_name TEXT DEFAULT 'Acme Manufacturing',
  system_name TEXT DEFAULT 'Maintenance Management System',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  default_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC-5',
  email_notifications BOOLEAN DEFAULT TRUE,
  maintenance_due_reminders BOOLEAN DEFAULT TRUE,
  equipment_status_changes BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT FALSE,
  daily_digest BOOLEAN DEFAULT TRUE,
  reminder_days INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read departments" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read equipment" ON equipment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read maintenance_tasks" ON maintenance_tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to read their own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for admin users
CREATE POLICY "Allow admin users to manage categories" ON categories
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow admin users to manage departments" ON departments
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow admin users to manage equipment" ON equipment
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow admin users to manage maintenance_tasks" ON maintenance_tasks
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow admin users to manage users" ON users
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow admin users to manage settings" ON settings
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Create policies for manager users
CREATE POLICY "Allow manager users to manage maintenance_tasks" ON maintenance_tasks
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'manager'));

CREATE POLICY "Allow manager users to manage equipment" ON equipment
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'manager'));

-- Create policies for technician users
CREATE POLICY "Allow technicians to update their assigned maintenance_tasks" ON maintenance_tasks
  FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'technician' AND maintenance_tasks.assigned_to = users.id));

-- Create policies for users to manage their own settings
CREATE POLICY "Allow users to manage their own settings" ON settings
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for users to manage their own profile
CREATE POLICY "Allow users to update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
