-- ScoreTeam Sample Data
-- This script inserts sample data for testing and demonstration

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, first_name, last_name, role)
VALUES ('admin', '$2a$10$mtMDZBvp7x6KAWd186DPouSeLpuSzlvjugQ3GrwFIl.rWwfzL9AcG', 'admin@scoreteam.com', 'Admin', 'User', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample evaluator user (password: eval123)
INSERT INTO users (username, password, email, first_name, last_name, role)
VALUES ('evaluador', '$2a$10$mtMDZBvp7x6KAWd186DPouSeLpuSzlvjugQ3GrwFIl.rWwfzL9AcG', 'evaluador@scoreteam.com', 'María', 'Evaluadora', 'evaluador')
ON CONFLICT (username) DO NOTHING;

-- Insert sample visualizer user (password: view123)
INSERT INTO users (username, password, email, first_name, last_name, role)
VALUES ('visualizador', '$2a$10$mtMDZBvp7x6KAWd186DPouSeLpuSzlvjugQ3GrwFIl.rWwfzL9AcG', 'visualizador@scoreteam.com', 'Carlos', 'Visualizador', 'visualizador')
ON CONFLICT (username) DO NOTHING;

-- Insert sample agents
INSERT INTO agents (first_name, last_name, area, position, hire_date, email, phone) VALUES
('Juan', 'Pérez', 'Ventas', 'Ejecutivo Senior', '2023-01-15', 'juan.perez@company.com', '+1234567890'),
('MaríaX', 'García', 'Marketing', 'Especialista', '2023-03-20', 'maria.garcia@company.com', '+1234567891'),
('Carlos', 'López', 'Soporte', 'Técnico', '2023-02-10', 'carlos.lopez@company.com', '+1234567892'),
('Ana', 'Martínez', 'Ventas', 'Ejecutivo Junior', '2023-04-05', 'ana.martinez@company.com', '+1234567893'),
('Luis', 'Rodríguez', 'Administración', 'Asistente', '2023-05-12', 'luis.rodriguez@company.com', '+1234567894'),
('Diego', 'Diego', 'Administración', 'Asistente', '2023-05-12', 'diego.diego@company.com', '+1234567894'),
('Carmen', 'Fernández', 'Marketing', 'Coordinadora', '2023-01-08', 'carmen.fernandez@company.com', '+1234567895')
ON CONFLICT DO NOTHING;

-- Insert sample score types
INSERT INTO score_types (name, description, score_value) VALUES
('Puntualidad', 'Evaluación de asistencia y puntualidad', 10),
('Ventas', 'Cumplimiento de objetivos de ventas', 20),
('Calidad', 'Calidad del trabajo realizado', 15),
('Trabajo en Equipo', 'Colaboración y trabajo en equipo', 10),
('Atención al Cliente', 'Calidad en el servicio al cliente', 12),
('Innovación', 'Propuestas creativas e innovadoras', 8),
('Penalización Menor', 'Descuento por incumplimientos menores', -5),
('Penalización Mayor', 'Descuento por incumplimientos graves', -15)
ON CONFLICT DO NOTHING;

-- Insert sample scores for the current and previous months
INSERT INTO scores (agent_id, score_type_id, assigned_by, score_date, comment) VALUES
-- Current month scores
(1, 1, 1, CURRENT_DATE - INTERVAL '5 days', 'Excelente puntualidad durante la semana'),
(1, 2, 1, CURRENT_DATE - INTERVAL '3 days', 'Superó las metas de ventas del mes'),
(2, 3, 1, CURRENT_DATE - INTERVAL '7 days', 'Trabajo de alta calidad en campañas'),
(3, 4, 1, CURRENT_DATE - INTERVAL '2 days', 'Gran colaboración con el equipo'),
(4, 1, 1, CURRENT_DATE - INTERVAL '1 day', 'Buena asistencia y puntualidad'),
(5, 5, 1, CURRENT_DATE - INTERVAL '4 days', 'Excelente atención al cliente'),
(6, 6, 1, CURRENT_DATE - INTERVAL '6 days', 'Propuesta innovadora implementada'),

-- Previous month scores
(1, 1, 1, CURRENT_DATE - INTERVAL '35 days', 'Puntualidad consistente'),
(1, 3, 1, CURRENT_DATE - INTERVAL '32 days', 'Calidad excepcional en reportes'),
(2, 2, 1, CURRENT_DATE - INTERVAL '38 days', 'Cumplió objetivos de marketing'),
(2, 4, 1, CURRENT_DATE - INTERVAL '30 days', 'Liderazgo en proyecto grupal'),
(3, 5, 1, CURRENT_DATE - INTERVAL '36 days', 'Resolución efectiva de tickets'),
(4, 1, 1, CURRENT_DATE - INTERVAL '33 days', 'Mejora en puntualidad'),
(4, 7, 1, CURRENT_DATE - INTERVAL '31 days', 'Llegada tarde en reunión importante'),
(5, 3, 1, CURRENT_DATE - INTERVAL '37 days', 'Documentación bien estructurada'),
(6, 2, 1, CURRENT_DATE - INTERVAL '34 days', 'Contribución a ventas del equipo')
ON CONFLICT DO NOTHING;