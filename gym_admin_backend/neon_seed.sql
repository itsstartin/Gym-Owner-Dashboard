-- Neon SQL Editor seed for the CURRENT Django schema (members migration 0025).
--
-- Prerequisite: deploy and run `python manage.py migrate` first.  Migrations
-- create the tables, but they do not create MembershipPlan rows.
--
-- This creates the normal application owner `salim` with password `123` (it
-- is not a Django-admin superuser), three plans, 20 members, 48 payments, 40
-- attendance records, six notifications, and 12 audit-log entries. Each
-- application data table remains under 50 rows. The script is safe to paste
-- again: it updates the seed user/plans/members and does not add another set
-- of payment or attendance records for a member that already has records.
--
-- The password is a Django 6.0.2 PBKDF2-SHA256 hash for the literal password
-- `123`; do not change it to plain text.

BEGIN;

-- Stop with a clear error if the deployed database is older than the models
-- this seed was written for.  In that case, run the latest migrations and
-- paste this file again rather than guessing at missing columns.
DO $$
BEGIN
    IF to_regclass('public.auth_user') IS NULL
       OR to_regclass('public.members_membershipplan') IS NULL
       OR to_regclass('public.members_member') IS NULL
       OR to_regclass('public.members_recentpayment') IS NULL
       OR to_regclass('public.members_attendance') IS NULL
       OR to_regclass('public.members_notification') IS NULL
       OR to_regclass('public.members_gymuserprofile') IS NULL
       OR to_regclass('public.members_auditlog') IS NULL THEN
        RAISE EXCEPTION 'Required Django tables are missing. Run python manage.py migrate on the deployed app first.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM (
            VALUES
                ('auth_user', 'password'),
                ('auth_user', 'username'),
                ('auth_user', 'email'),
                ('auth_user', 'is_active'),
                ('auth_user', 'date_joined'),
                ('members_membershipplan', 'name'),
                ('members_membershipplan', 'plan_price'),
                ('members_member', 'user_id'),
                ('members_member', 'name'),
                ('members_member', 'phone_number'),
                ('members_member', 'email'),
                ('members_member', 'membership_plan_id'),
                ('members_member', 'total_cash_paid'),
                ('members_member', 'membership_start_date'),
                ('members_member', 'access_token'),
                ('members_member', 'access_token_expires_at'),
                ('members_recentpayment', 'user_id'),
                ('members_recentpayment', 'member_id'),
                ('members_recentpayment', 'amount'),
                ('members_recentpayment', 'payment_type'),
                ('members_recentpayment', 'created_at'),
                ('members_attendance', 'user_id'),
                ('members_attendance', 'member_id'),
                ('members_attendance', 'date'),
                ('members_notification', 'user_id'),
                ('members_notification', 'member_id'),
                ('members_notification', 'type'),
                ('members_notification', 'message'),
                ('members_notification', 'is_read'),
                ('members_notification', 'created_at'),
                ('members_gymuserprofile', 'user_id'),
                ('members_gymuserprofile', 'role'),
                ('members_auditlog', 'user_id'),
                ('members_auditlog', 'actor_id'),
                ('members_auditlog', 'actor_label'),
                ('members_auditlog', 'action'),
                ('members_auditlog', 'target_type'),
                ('members_auditlog', 'target_id'),
                ('members_auditlog', 'target_name'),
                ('members_auditlog', 'metadata_summary'),
                ('members_auditlog', 'created_at')
        ) AS required_columns(table_name, column_name)
        LEFT JOIN information_schema.columns AS actual
          ON actual.table_schema = 'public'
         AND actual.table_name = required_columns.table_name
         AND actual.column_name = required_columns.column_name
        WHERE actual.column_name IS NULL
    ) THEN
        RAISE EXCEPTION 'The Neon schema does not match the current project models. Run the latest migrations before seeding.';
    END IF;
END $$;

-- A normal user for the app's /login/ JWT endpoint.
-- Existing `salim` accounts retain their staff/superuser flags if they have any.
INSERT INTO auth_user (
    password, last_login, is_superuser, username, first_name, last_name,
    email, is_staff, is_active, date_joined
)
VALUES (
    'pbkdf2_sha256$1200000$6nfEMcUV4VrSSYy7SCbtic$VALYROVEtTywLeVEKolhPK1OdhQWKBnzaE0yCQMhnlg=',
    NULL, FALSE, 'salim', '', '', 'salim@example.com', FALSE, TRUE, CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password,
    email = EXCLUDED.email,
    is_active = TRUE;

-- The profile is normally created during sign-up. A direct SQL seed needs
-- to create it explicitly so the role permissions work immediately.
INSERT INTO members_gymuserprofile (user_id, role)
SELECT id, 'owner'
FROM auth_user
WHERE username = 'salim'
ON CONFLICT (user_id) DO UPDATE
SET role = EXCLUDED.role;

-- Required plan rows.  The project migrations create the table only; these
-- INSERTs create/update the actual plans used by members.
INSERT INTO members_membershipplan (name, plan_price)
VALUES
    ('Basic', 500.00),
    ('Premium', 800.00),
    ('VIP', 1200.00)
ON CONFLICT (name) DO UPDATE
SET plan_price = EXCLUDED.plan_price;

-- Twenty stable member identities. The access tokens are deterministic UUIDs
-- so repeated pastes keep the same rows instead of consuming new ones. Their
-- seven-day expiry matches the current Django default; change the interval
-- below if the deployed MEMBER_ACCESS_LINK_LIFETIME_DAYS setting is custom.
WITH seed_members(name, phone_number, email, plan_name, start_days_ago) AS (
    VALUES
        ('Arjun Nair',       '+919801000001', 'arjun.nair.seed@example.com',       'Basic',   12),
        ('Rahul Das',        '+919801000002', 'rahul.das.seed@example.com',        'Premium', 37),
        ('Vishnu Kumar',     '+919801000003', 'vishnu.kumar.seed@example.com',     'VIP',     67),
        ('Aditya Menon',     '+919801000004', 'aditya.menon.seed@example.com',     'Basic',   96),
        ('Sanjay Pillai',    '+919801000005', 'sanjay.pillai.seed@example.com',    'Premium', 141),
        ('Rohit Sharma',     '+919801000006', 'rohit.sharma.seed@example.com',     'VIP',     21),
        ('Kiran Varma',      '+919801000007', 'kiran.varma.seed@example.com',      'Basic',   53),
        ('Ajay Krishnan',    '+919801000008', 'ajay.krishnan.seed@example.com',    'Premium', 78),
        ('Deepak Mohan',     '+919801000009', 'deepak.mohan.seed@example.com',     'VIP',     109),
        ('Anil Joseph',      '+919801000010', 'anil.joseph.seed@example.com',      'Basic',   162),
        ('Nikhil Raj',       '+919801000011', 'nikhil.raj.seed@example.com',       'Premium', 45),
        ('Akhil S',          '+919801000012', 'akhil.s.seed@example.com',          'VIP',     7),
        ('Manoj Kumar',      '+919801000013', 'manoj.kumar.seed@example.com',      'Basic',   199),
        ('Sreejith P',       '+919801000014', 'sreejith.p.seed@example.com',       'Premium', 238),
        ('Abhishek R',       '+919801000015', 'abhishek.r.seed@example.com',       'VIP',     33),
        ('Gokul Krishna',    '+919801000016', 'gokul.krishna.seed@example.com',    'Basic',   88),
        ('Faisal K',         '+919801000017', 'faisal.k.seed@example.com',         'Premium', 119),
        ('Shyam Lal',        '+919801000018', 'shyam.lal.seed@example.com',        'VIP',     5),
        ('Vivek Anand',      '+919801000019', 'vivek.anand.seed@example.com',      'Basic',   271),
        ('Pranav M',         '+919801000020', 'pranav.m.seed@example.com',         'Premium', 181)
)
INSERT INTO members_member (
    user_id, name, phone_number, email, membership_plan_id, total_cash_paid,
    created_at, membership_start_date, access_token, access_token_expires_at
)
SELECT
    account.id,
    seed.name,
    seed.phone_number,
    seed.email,
    plan.id,
    0.0,
    CURRENT_TIMESTAMP - make_interval(days => seed.start_days_ago),
    CURRENT_DATE - seed.start_days_ago,
    md5('gym-admin-neon-seed:' || seed.phone_number)::uuid,
    CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM seed_members AS seed
CROSS JOIN (SELECT id FROM auth_user WHERE username = 'salim') AS account
JOIN members_membershipplan AS plan ON plan.name = seed.plan_name
-- Email is the stable seed identity. Using it here prevents a phone-number
-- collision from silently taking ownership of a real member on a live DB.
ON CONFLICT (email) DO UPDATE
SET user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    phone_number = EXCLUDED.phone_number,
    email = EXCLUDED.email,
    membership_plan_id = EXCLUDED.membership_plan_id,
    membership_start_date = EXCLUDED.membership_start_date,
    access_token = EXCLUDED.access_token,
    access_token_expires_at = EXCLUDED.access_token_expires_at;

-- 48 payment rows (below the 50-record limit).  Different paid-month counts
-- produce a mix of active, advance, due, and expired member states.  A rerun
-- leaves payment history untouched once a member has any payment row.
WITH payment_setup(phone_number, paid_months, payment_type) AS (
    VALUES
        ('+919801000001', 1, 'upi'),
        ('+919801000002', 1, 'card'),
        ('+919801000003', 2, 'cash'),
        ('+919801000004', 2, 'upi'),
        ('+919801000005', 3, 'card'),
        ('+919801000006', 2, 'upi'),
        ('+919801000007', 1, 'cash'),
        ('+919801000008', 3, 'card'),
        ('+919801000009', 1, 'upi'),
        ('+919801000010', 4, 'cash'),
        ('+919801000011', 1, 'card'),
        ('+919801000012', 1, 'upi'),
        ('+919801000013', 4, 'cash'),
        ('+919801000014', 5, 'card'),
        ('+919801000015', 1, 'upi'),
        ('+919801000016', 3, 'cash'),
        ('+919801000017', 2, 'card'),
        ('+919801000018', 1, 'upi'),
        ('+919801000019', 6, 'cash'),
        ('+919801000020', 4, 'card')
), payment_rows AS (
    SELECT
        member.id AS member_id,
        account.id AS user_id,
        plan.plan_price AS amount,
        setup.payment_type,
        (
            LEAST(
                CURRENT_DATE,
                member.membership_start_date + (series.month_number * 30)
            ) + TIME '10:00' + make_interval(mins => series.month_number)
        ) AT TIME ZONE 'UTC' AS created_at
    FROM payment_setup AS setup
    JOIN members_member AS member ON member.phone_number = setup.phone_number
    JOIN members_membershipplan AS plan ON plan.id = member.membership_plan_id
    CROSS JOIN (SELECT id FROM auth_user WHERE username = 'salim') AS account
    CROSS JOIN LATERAL generate_series(0, setup.paid_months - 1) AS series(month_number)
)
INSERT INTO members_recentpayment (user_id, member_id, amount, payment_type, created_at)
SELECT row.user_id, row.member_id, row.amount, row.payment_type, row.created_at
FROM payment_rows AS row
WHERE NOT EXISTS (
    SELECT 1
    FROM members_recentpayment AS existing
    WHERE existing.member_id = row.member_id
);

-- 40 attendance rows (two per member, also below the 50-record limit).
-- Some older members have a recent visit so dashboard expired/inactive states
-- have useful example data.
WITH attendance_setup(phone_number, first_days_ago, second_days_ago) AS (
    VALUES
        ('+919801000001', 1, 5),   ('+919801000002', 2, 10),
        ('+919801000003', 1, 12),  ('+919801000004', 3, 15),
        ('+919801000005', 1, 8),   ('+919801000006', 2, 7),
        ('+919801000007', 1, 20),  ('+919801000008', 3, 11),
        ('+919801000009', 1, 25),  ('+919801000010', 4, 18),
        ('+919801000011', 2, 19),  ('+919801000012', 1, 4),
        ('+919801000013', 3, 28),  ('+919801000014', 2, 22),
        ('+919801000015', 1, 9),   ('+919801000016', 2, 14),
        ('+919801000017', 1, 24),  ('+919801000018', 1, 3),
        ('+919801000019', 4, 30),  ('+919801000020', 2, 26)
), attendance_rows AS (
    SELECT
        member.id AS member_id,
        account.id AS user_id,
        (GREATEST(member.membership_start_date, CURRENT_DATE - visit.days_ago)
            + CASE visit.visit_number WHEN 1 THEN TIME '06:45' ELSE TIME '18:15' END
        ) AT TIME ZONE 'UTC' AS date
    FROM attendance_setup AS setup
    JOIN members_member AS member ON member.phone_number = setup.phone_number
    CROSS JOIN (SELECT id FROM auth_user WHERE username = 'salim') AS account
    CROSS JOIN LATERAL (
        VALUES (1, setup.first_days_ago), (2, setup.second_days_ago)
    ) AS visit(visit_number, days_ago)
)
INSERT INTO members_attendance (user_id, member_id, date)
SELECT row.user_id, row.member_id, row.date
FROM attendance_rows AS row
WHERE NOT EXISTS (
    SELECT 1
    FROM members_attendance AS existing
    WHERE existing.member_id = row.member_id
);

-- Seed the notification states used by the dashboard. The messages follow the
-- same shapes produced by notification_service.py, while the existence check
-- keeps a rerun from adding duplicates.
WITH notification_seed(phone_number, type, message, is_read, days_ago) AS (
    VALUES
        ('+919801000004', 'inactive', 'Aditya Menon has not attended for 15 days', FALSE, 1),
        ('+919801000007', 'inactive', 'Kiran Varma has not attended for 20 days', FALSE, 2),
        ('+919801000010', 'inactive', 'Anil Joseph has not attended for 18 days', TRUE, 3),
        ('+919801000013', 'expired', 'Manoj Kumar''s membership expired 79 days ago', FALSE, 4),
        ('+919801000014', 'expired', 'Sreejith P''s membership expired 88 days ago', FALSE, 5),
        ('+919801000019', 'expired', 'Vivek Anand''s membership expired 91 days ago', TRUE, 6)
)
INSERT INTO members_notification (user_id, member_id, type, message, is_read, created_at)
SELECT account.id, member.id, seed.type, seed.message, seed.is_read,
       CURRENT_TIMESTAMP - make_interval(days => seed.days_ago)
FROM notification_seed AS seed
JOIN members_member AS member ON member.phone_number = seed.phone_number
CROSS JOIN (SELECT id FROM auth_user WHERE username = 'salim') AS account
WHERE NOT EXISTS (
    SELECT 1
    FROM members_notification AS existing
    WHERE existing.user_id = account.id
      AND existing.member_id = member.id
      AND existing.type = seed.type
      AND existing.message = seed.message
);

-- Representative activity for the Settings audit-history screen. Direct SQL
-- does not invoke Django's audit service, so these rows are created here.
WITH audit_seed(phone_number, action, target_type, target_name, metadata_summary, days_ago) AS (
    VALUES
        ('+919801000001', 'member_created', 'member', 'Arjun Nair', 'Member profile created', 12),
        ('+919801000002', 'member_created', 'member', 'Rahul Das', 'Member profile created', 11),
        ('+919801000003', 'member_created', 'member', 'Vishnu Kumar', 'Member profile created', 10),
        ('+919801000004', 'member_updated', 'member', 'Aditya Menon', 'Updated: membership plan', 8),
        ('+919801000005', 'payment_recorded', 'member', 'Sanjay Pillai', 'Payment recorded via Card', 7),
        ('+919801000006', 'payment_recorded', 'member', 'Rohit Sharma', 'Payment recorded via UPI', 6),
        ('+919801000007', 'attendance_marked', 'member', 'Kiran Varma', 'Attendance marked for today', 5),
        ('+919801000008', 'attendance_marked', 'member', 'Ajay Krishnan', 'Attendance marked for today', 4),
        ('+919801000009', 'payment_recorded', 'member', 'Deepak Mohan', 'Payment recorded via UPI', 3),
        ('+919801000010', 'attendance_marked', 'member', 'Anil Joseph', 'Attendance marked for today', 2),
        ('+919801000011', 'settings_updated', 'member', 'Nikhil Raj', 'Attendance link refreshed', 1),
        ('+919801000012', 'member_created', 'member', 'Akhil S', 'Member profile created', 1)
)
INSERT INTO members_auditlog (
    user_id, actor_id, actor_label, action, target_type, target_id,
    target_name, metadata_summary, created_at
)
SELECT account.id, account.id, '', seed.action, seed.target_type, member.id,
       seed.target_name, seed.metadata_summary,
       CURRENT_TIMESTAMP - make_interval(days => seed.days_ago)
FROM audit_seed AS seed
JOIN members_member AS member ON member.phone_number = seed.phone_number
CROSS JOIN (SELECT id FROM auth_user WHERE username = 'salim') AS account
WHERE NOT EXISTS (
    SELECT 1
    FROM members_auditlog AS existing
    WHERE existing.user_id = account.id
      AND existing.action = seed.action
      AND existing.target_id = member.id
      AND existing.metadata_summary = seed.metadata_summary
);

-- Keep the denormalized total in Member consistent with the inserted history.
UPDATE members_member AS member
SET total_cash_paid = totals.amount
FROM (
    SELECT member_id, COALESCE(SUM(amount), 0.0) AS amount
    FROM members_recentpayment
    GROUP BY member_id
) AS totals
WHERE totals.member_id = member.id
  AND member.user_id = (SELECT id FROM auth_user WHERE username = 'salim');

COMMIT;

-- Expected first-run counts: user 1, profile 1, plans 3, members 20,
-- payments 48, attendance 40, notifications 6, and audit logs 12. This query
-- is also a quick confirmation after pasting.
SELECT 'auth_user (salim)' AS table_name, COUNT(*) AS rows
FROM auth_user WHERE username = 'salim'
UNION ALL
SELECT 'members_membershipplan', COUNT(*)
FROM members_membershipplan WHERE name IN ('Basic', 'Premium', 'VIP')
UNION ALL
SELECT 'members_gymuserprofile', COUNT(*)
FROM members_gymuserprofile WHERE user_id = (SELECT id FROM auth_user WHERE username = 'salim')
UNION ALL
SELECT 'members_member', COUNT(*)
FROM members_member WHERE user_id = (SELECT id FROM auth_user WHERE username = 'salim')
UNION ALL
SELECT 'members_recentpayment', COUNT(*)
FROM members_recentpayment WHERE user_id = (SELECT id FROM auth_user WHERE username = 'salim')
UNION ALL
SELECT 'members_attendance', COUNT(*)
FROM members_attendance WHERE user_id = (SELECT id FROM auth_user WHERE username = 'salim')
UNION ALL
SELECT 'members_notification', COUNT(*)
FROM members_notification WHERE user_id = (SELECT id FROM auth_user WHERE username = 'salim')
UNION ALL
SELECT 'members_auditlog', COUNT(*)
FROM members_auditlog WHERE user_id = (SELECT id FROM auth_user WHERE username = 'salim')
ORDER BY table_name;
