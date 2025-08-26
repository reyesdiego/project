-- Seed initial data

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, is_admin, is_active) 
VALUES ('admin', 'admin@scoreteam.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', true, true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample score types
INSERT INTO score_types (name, description, score_value, is_active) VALUES
('Excellent Performance', 'Outstanding work and exceptional results', 10, true),
('Good Performance', 'Above average performance and good results', 8, true),
('Average Performance', 'Standard performance meeting expectations', 6, true),
('Below Average', 'Performance below expectations', 4, true),
('Poor Performance', 'Significantly below expectations', 2, true),
('Deduction', 'Points deduction for issues', -5, true)
ON CONFLICT DO NOTHING;

-- Insert sample agents
INSERT INTO agents (first_name, last_name, email, phone, is_active) VALUES
('John', 'Doe', 'john.doe@company.com', '+1234567890', true),
('Jane', 'Smith', 'jane.smith@company.com', '+1234567891', true),
('Mike', 'Johnson', 'mike.johnson@company.com', '+1234567892', true),
('Sarah', 'Williams', 'sarah.williams@company.com', '+1234567893', true),
('David', 'Brown', 'david.brown@company.com', '+1234567894', true)
ON CONFLICT DO NOTHING;
