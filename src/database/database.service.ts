import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import oracledb from 'oracledb';
import 'dotenv/config';

export interface DatabaseStatus {
  connected: boolean;
  engine: 'oracle' | 'in-memory-fallback';
  host: string;
  port: number;
  serviceName: string;
  user: string;
  error?: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private isOracleConnected = false;
  private lastError: string | null = null;
  private pool: oracledb.Pool | null = null;

  private readonly dbConfig = {
    user: process.env.DB_USER || 'usuario',
    password: process.env.DB_PASSWORD || 'MyPass123',
    connectString:
      process.env.DB_CONNECT_STRING ||
      `${process.env.DB_HOST || 'oracle-db'}:${process.env.DB_PORT || '1521'}/${process.env.DB_SERVICE_NAME || 'FREEPDB1'}`,
    host: process.env.DB_HOST || 'oracle-db',
    port: Number(process.env.DB_PORT || 1521),
    serviceName: process.env.DB_SERVICE_NAME || 'FREEPDB1',
  };

  async onModuleInit() {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = true;
    await this.connect();
  }

  async onModuleDestroy() {
    if (this.pool) {
      try {
        await this.pool.close(10);
        this.logger.log('Pool de conexiones a Oracle cerrado exitosamente.');
      } catch (err) {
        this.logger.error('Error al cerrar el pool de conexiones:', err);
      }
    }
  }

  private getConnectOptions(): oracledb.ConnectionAttributes {
    const isSys =
      this.dbConfig.user?.toUpperCase() === 'SYS' ||
      process.env.DB_PRIVILEGE?.toUpperCase() === 'SYSDBA';

    return {
      user: this.dbConfig.user,
      password: this.dbConfig.password,
      connectString: this.dbConfig.connectString,
      ...(isSys ? { privilege: oracledb.SYSDBA } : {}),
    };
  }

  async connect(): Promise<boolean> {
    this.logger.log(
      `Intentando conectar a Oracle Database en: ${this.dbConfig.connectString} (usuario: ${this.dbConfig.user})...`,
    );

    try {
      // Intentar conexión rápida a Oracle
      const conn = await oracledb.getConnection(this.getConnectOptions());

      this.isOracleConnected = true;
      this.lastError = null;
      this.logger.log('✅ Conexión exitosa a Oracle Database.');

      await this.initSchema(conn);
      await conn.close();
      return true;
    } catch (error: any) {
      this.isOracleConnected = false;
      this.lastError = error?.message || 'Error desconocido al conectar con Oracle';
      this.logger.warn(
        `⚠️ No se pudo conectar a Oracle Database (${this.lastError}).`,
      );
      this.logger.warn(
        '🔄 El sistema funcionará en modo fallback (almacenamiento en memoria) hasta que el contenedor Oracle esté disponible.',
      );
      return false;
    }
  }

  private async initSchema(conn: oracledb.Connection) {
    try {
      // Verificar si la tabla PRODUCTOS ya existe
      const checkTable = await conn.execute(
        `SELECT table_name FROM user_tables WHERE table_name = 'PRODUCTOS'`,
      );

      if (!checkTable.rows || checkTable.rows.length === 0) {
        this.logger.log('Creando tabla PRODUCTOS en Oracle Database...');
        await conn.execute(`
          CREATE TABLE PRODUCTOS (
            ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            NOMBRE VARCHAR2(150) NOT NULL,
            DESCRIPCION VARCHAR2(500),
            CATEGORIA VARCHAR2(100) NOT NULL,
            PRECIO NUMBER(10,2) NOT NULL,
            STOCK NUMBER(6) NOT NULL,
            CREADO_EN TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        this.logger.log('Insertando bólidos de Cars en Oracle Database...');
        const initialProducts = [
          {
            nombre: 'Rayo McQueen #95',
            descripcion: '"¡Ka-Chow! La velocidad soy yo. Un ganador, 42 perdedores. Yo desayuno perdedores." Motor V8 de 750 HP.',
            categoria: 'Copa Pistón',
            precio: 322,
            stock: 1,
          },
          {
            nombre: 'Mate (Tow Mater)',
            descripcion: '"¡Soy el mejor conductor marcha atrás del mundo!" Grúa Chevrolet 1951 con corazón de oro de Radiator Springs.',
            categoria: 'Radiator Springs',
            precio: 145,
            stock: 2,
          },
          {
            nombre: 'Doc Hudson #51 (Hudson Hornet)',
            descripcion: '"Gira a la derecha para ir a la izquierda." Leyenda tricampeona de la Copa Pistón (1951, 1952, 1953) con motor Twin H-Power.',
            categoria: 'Leyendas de Carreras',
            precio: 280,
            stock: 1,
          },
          {
            nombre: 'Sally Carrera',
            descripcion: '"Baja la velocidad y disfruta la vista." Porsche 911 Carrera 2002, abogada del pueblo y dueña del Motel Rueda Rueda.',
            categoria: 'Radiator Springs',
            precio: 285,
            stock: 1,
          },
          {
            nombre: 'El Rey #43 (Strip Weathers)',
            descripcion: '"Esto es sólo una copa vacía, muchacho." Plymouth Superbird 1970 con el icónico azul Dinoco y 7 títulos.',
            categoria: 'Copa Pistón',
            precio: 315,
            stock: 1,
          },
          {
            nombre: 'Chick Hicks #86',
            descripcion: '"¡Kachikka, kachikka!" Bólido Buick Regal obsesionado con vencer a McQueen.',
            categoria: 'Copa Pistón',
            precio: 300,
            stock: 2,
          },
        ];

        for (const prod of initialProducts) {
          await conn.execute(
            `INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
             VALUES (:nombre, :descripcion, :categoria, :precio, :stock)`,
            prod,
          );
        }

        this.logger.log('✅ Tabla PRODUCTOS y datos iniciales creados exitosamente en Oracle.');
      }
    } catch (err: any) {
      this.logger.error('Error al inicializar el esquema en Oracle:', err?.message);
    }
  }

  async getConnection(): Promise<oracledb.Connection> {
    if (!this.isOracleConnected) {
      throw new Error('Oracle no está conectado.');
    }
    return await oracledb.getConnection(this.getConnectOptions());
  }

  isConnected(): boolean {
    return this.isOracleConnected;
  }

  getStatus(): DatabaseStatus {
    return {
      connected: this.isOracleConnected,
      engine: this.isOracleConnected ? 'oracle' : 'in-memory-fallback',
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      serviceName: this.dbConfig.serviceName,
      user: this.dbConfig.user,
      error: this.lastError || undefined,
    };
  }

  async tryReconnect(): Promise<DatabaseStatus> {
    await this.connect();
    return this.getStatus();
  }
}
