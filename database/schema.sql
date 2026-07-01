-- ============================================================
-- Job-Tracker Database Schema (Microsoft SQL Server)
-- ============================================================

IF DB_ID('JobTrackerDB') IS NULL
BEGIN
    CREATE DATABASE JobTrackerDB;
END
GO

USE JobTrackerDB;
GO

-- ---------------------------------------------------------
-- Users
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO
CREATE TABLE dbo.Users (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    full_name     NVARCHAR(150)  NOT NULL,
    email         NVARCHAR(255)  NOT NULL UNIQUE,
    password_hash NVARCHAR(255)  NOT NULL,
    created_at    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ---------------------------------------------------------
-- Jobs / Applications
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.Jobs', 'U') IS NOT NULL DROP TABLE dbo.Jobs;
GO
CREATE TABLE dbo.Jobs (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(id) ON DELETE CASCADE,
    company_name    NVARCHAR(200) NOT NULL,
    job_title       NVARCHAR(200) NOT NULL,
    job_location    NVARCHAR(200) NULL,
    job_url         NVARCHAR(500) NULL,
    salary_min      DECIMAL(12,2) NULL,
    salary_max      DECIMAL(12,2) NULL,
    status          NVARCHAR(30)  NOT NULL DEFAULT 'Applied',
        -- Applied | Interviewing | Offer | Rejected | Withdrawn
    applied_date    DATE          NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
    created_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ---------------------------------------------------------
-- Reminders
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.Reminders', 'U') IS NOT NULL DROP TABLE dbo.Reminders;
GO
CREATE TABLE dbo.Reminders (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(id) ON DELETE CASCADE,
    job_id      INT NULL FOREIGN KEY REFERENCES dbo.Jobs(id) ON DELETE CASCADE,
    title       NVARCHAR(200) NOT NULL,
    remind_at   DATETIME2     NOT NULL,
    is_done     BIT           NOT NULL DEFAULT 0,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ---------------------------------------------------------
-- Notes
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.Notes', 'U') IS NOT NULL DROP TABLE dbo.Notes;
GO
CREATE TABLE dbo.Notes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    job_id      INT NOT NULL FOREIGN KEY REFERENCES dbo.Jobs(id) ON DELETE CASCADE,
    user_id     INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(id) ON DELETE CASCADE,
    content     NVARCHAR(MAX) NOT NULL,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_Jobs_UserId ON dbo.Jobs(user_id);
CREATE INDEX IX_Reminders_UserId ON dbo.Reminders(user_id);
CREATE INDEX IX_Notes_JobId ON dbo.Notes(job_id);
GO
