CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nim VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'mahasiswa'
        CHECK (role IN ('admin', 'pegawai', 'mahasiswa')),

    status VARCHAR(20) NOT NULL DEFAULT 'aktif'
        CHECK (status IN ('aktif', 'diblokir')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT email_huruf_kecil
        CHECK (email = LOWER(TRIM(email)))
);

CREATE TABLE auth_sessions (
    token_hash CHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auth_sessions_user_idx
    ON auth_sessions(user_id);

CREATE INDEX auth_sessions_expiry_idx
    ON auth_sessions(expires_at);

CREATE TABLE auth_login_attempts (
    identifier_hash CHAR(64) PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


