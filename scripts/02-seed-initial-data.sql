-- Seed Initial Data for ISP Order Management System

-- Insert default roles
INSERT INTO roles (id, name, description, permissions) VALUES
(uuid_generate_v4(), 'Super Administrator', 'Full system access', '["*"]'),
(uuid_generate_v4(), 'System Administrator', 'System configuration and user management', '["admin:*", "orders:read", "customers:read"]'),
(uuid_generate_v4(), 'Operations Manager', 'Order and escalation management', '["orders:*", "escalations:*", "customers:read", "fno:view_logs"]'),
(uuid_generate_v4(), 'Application Administrator', 'Manual FNO application processing', '["app_admin:*", "orders:read", "orders:update", "fno:submit_manual"]'),
(uuid_generate_v4(), 'Customer Success Manager', 'Customer onboarding and trial management', '["onboarding:*", "customers:read", "customers:update", "orders:read"]'),
(uuid_generate_v4(), 'Sales Representative', 'Order creation and customer management', '["orders:create", "orders:read", "orders:update", "customers:*"]');

-- Insert sample FNOs
INSERT INTO fnos (id, name, code, integration_type, portal_url, coverage_areas, is_active) VALUES
(uuid_generate_v4(), 'Openserve', 'OS', 'api', 'https://portal.openserve.co.za', '["Western Cape", "Gauteng", "KwaZulu-Natal"]', true),
(uuid_generate_v4(), 'Vumatel', 'VUM', 'manual', 'https://portal.vumatel.co.za', '["Western Cape", "Gauteng"]', true),
(uuid_generate_v4(), 'Frogfoot Networks', 'FF', 'manual', 'https://portal.frogfoot.com', '["Western Cape", "Eastern Cape"]', true),
(uuid_generate_v4(), 'MetroFibre', 'MF', 'api', 'https://portal.metrofibre.co.za', '["Western Cape", "Gauteng", "KwaZulu-Natal"]', true);

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('escalation.default_sla_hours', '24', 'Default SLA hours for order processing'),
('escalation.reporting_manager_escalation_hours', '4', 'Hours before escalating to reporting manager'),
('escalation.process_owner_escalation_hours', '8', 'Hours before escalating to process owner'),
('trial.default_duration_days', '30', 'Default trial period in days'),
('trial.reminder_days', '[7, 14, 21, 28]', 'Days to send trial conversion reminders'),
('onboarding.default_steps', '["welcome", "service_setup", "equipment_delivery", "installation", "activation", "follow_up"]', 'Default onboarding workflow steps'),
('fno.api_timeout_seconds', '30', 'API timeout for FNO integrations'),
('notifications.email_templates', '{"order_confirmation": "order-confirmation", "trial_reminder": "trial-reminder", "escalation": "escalation-notification"}', 'Email template mappings');
