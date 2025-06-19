-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'challenge')
BEGIN
  CREATE DATABASE challenge;
END
GO

-- Usar la base de datos 'challenge'
USE challenge;
GO

-- Crear la tabla 'Clientes' si no existe.
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Clientes' and xtype='U')
BEGIN
    CREATE TABLE Clientes (
        -- Clave primaria autoincremental
        ID INT IDENTITY(1,1) PRIMARY KEY,
        NombreCompleto NVARCHAR(100) NOT NULL,
        DNI BIGINT NOT NULL,
        Estado VARCHAR(10) NOT NULL,
        FechaIngreso DATE NOT NULL,
        EsPEP BIT NOT NULL,
        EsSujetoObligado BIT NULL,
        -- Valor por defecto
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE() 
    );

    PRINT 'Tabla Clientes y su índice único han sido creados.';
END
ELSE
BEGIN
    PRINT 'Tabla Clientes ya existe.';
END
GO