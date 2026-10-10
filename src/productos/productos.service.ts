import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { Producto } from './entities/producto.entity.js';
import { DatabaseService } from '../database/database.service.js';
import oracledb from 'oracledb';

@Injectable()
export class ProductosService {
  private readonly logger = new Logger(ProductosService.name);

  // Garaje de Radiator Springs & Copa Pistón (Temática Cars - Pixar)
  private memoryProductos: Producto[] = [
    {
      id: 1,
      nombre: 'Rayo McQueen #95',
      descripcion: '"¡Ka-Chow! La velocidad soy yo. Un ganador, 42 perdedores. Yo desayuno perdedores." Motor V8 de 750 HP.',
      categoria: 'Copa Pistón',
      precio: 322, // km/h o valor
      stock: 1,
      creadoEn: new Date().toISOString(),
    },
    {
      id: 2,
      nombre: 'Mate (Tow Mater)',
      descripcion: '"¡Soy el mejor conductor marcha atrás del mundo!" Grúa Chevrolet 1951 oxidada pero con el corazón más noble de Radiator Springs.',
      categoria: 'Radiator Springs',
      precio: 145,
      stock: 2,
      creadoEn: new Date().toISOString(),
    },
    {
      id: 3,
      nombre: 'Doc Hudson #51 (Hudson Hornet)',
      descripcion: '"Gira a la derecha para ir a la izquierda." Leyenda tricampeona de la Copa Pistón (1951, 1952, 1953) con motor Twin H-Power.',
      categoria: 'Leyendas de Carreras',
      precio: 280,
      stock: 1,
      creadoEn: new Date().toISOString(),
    },
    {
      id: 4,
      nombre: 'Sally Carrera',
      descripcion: '"Baja la velocidad y disfruta la vista." Porsche 911 Carrera modelo 2002, abogada del pueblo y dueña del Motel Rueda Rueda.',
      categoria: 'Radiator Springs',
      precio: 285,
      stock: 1,
      creadoEn: new Date().toISOString(),
    },
    {
      id: 5,
      nombre: 'El Rey #43 (Strip Weathers)',
      descripcion: '"Esto es sólo una copa vacía, muchacho." Plymouth Superbird 1970 con el icónico azul Dinoco y 7 títulos de la Copa Pistón.',
      categoria: 'Copa Pistón',
      precio: 315,
      stock: 1,
      creadoEn: new Date().toISOString(),
    },
    {
      id: 6,
      nombre: 'Chick Hicks #86',
      descripcion: '"¡Kachikka, kachikka!" Bólido Buick Regal obsesionado con vencer a McQueen y patrocinado por Hostile Takeover Bank.',
      categoria: 'Copa Pistón',
      precio: 300,
      stock: 2,
      creadoEn: new Date().toISOString(),
    },
  ];

  private nextMemoryId = 7;

  constructor(private readonly dbService: DatabaseService) {}

  private mapOracleRowToProducto(row: any): Producto {
    return {
      id: Number(row.ID),
      nombre: String(row.NOMBRE),
      descripcion: row.DESCRIPCION ? String(row.DESCRIPCION) : '',
      categoria: String(row.CATEGORIA),
      precio: Number(row.PRECIO),
      stock: Number(row.STOCK),
      creadoEn: row.CREADO_EN ? new Date(row.CREADO_EN).toISOString() : new Date().toISOString(),
    };
  }

  async findAll(search?: string, categoria?: string): Promise<Producto[]> {
    if (this.dbService.isConnected()) {
      let conn: oracledb.Connection | null = null;
      try {
        conn = await this.dbService.getConnection();
        let query = `SELECT ID, NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK, CREADO_EN FROM PRODUCTOS WHERE 1=1`;
        const binds: any = {};

        if (search && search.trim() !== '') {
          query += ` AND (LOWER(NOMBRE) LIKE :search OR LOWER(DESCRIPCION) LIKE :search)`;
          binds.search = `%${search.toLowerCase().trim()}%`;
        }

        if (categoria && categoria.trim() !== '') {
          query += ` AND CATEGORIA = :categoria`;
          binds.categoria = categoria.trim();
        }

        query += ` ORDER BY ID DESC`;

        const result = await conn.execute(query, binds, {
          outFormat: oracledb.OUT_FORMAT_OBJECT,
        });

        const rows = (result.rows || []) as any[];
        return rows.map((r) => this.mapOracleRowToProducto(r));
      } catch (err: any) {
        this.logger.error('Error al consultar bólidos en Oracle, usando memoria:', err?.message);
      } finally {
        if (conn) await conn.close();
      }
    }

    // Modo memoria (fallback)
    let productos = [...this.memoryProductos];

    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      productos = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(s) ||
          p.descripcion.toLowerCase().includes(s) ||
          p.categoria.toLowerCase().includes(s),
      );
    }

    if (categoria && categoria.trim() !== '') {
      productos = productos.filter((p) => p.categoria.toLowerCase() === categoria.toLowerCase().trim());
    }

    return productos.sort((a, b) => b.id - a.id);
  }

  async findOne(id: number): Promise<Producto> {
    if (this.dbService.isConnected()) {
      let conn: oracledb.Connection | null = null;
      try {
        conn = await this.dbService.getConnection();
        const result = await conn.execute(
          `SELECT ID, NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK, CREADO_EN FROM PRODUCTOS WHERE ID = :id`,
          [id],
          { outFormat: oracledb.OUT_FORMAT_OBJECT },
        );

        const rows = (result.rows || []) as any[];
        if (rows.length === 0) {
          throw new NotFoundException(`Bólido con ID ${id} no encontrado en el garaje`);
        }
        return this.mapOracleRowToProducto(rows[0]);
      } catch (err: any) {
        if (err instanceof NotFoundException) throw err;
        this.logger.error('Error al buscar bólido en Oracle, usando memoria:', err?.message);
      } finally {
        if (conn) await conn.close();
      }
    }

    // Modo memoria
    const producto = this.memoryProductos.find((p) => p.id === id);
    if (!producto) {
      throw new NotFoundException(`Bólido con ID ${id} no encontrado en el garaje`);
    }
    return producto;
  }

  async create(createDto: CreateProductoDto): Promise<Producto> {
    if (this.dbService.isConnected()) {
      let conn: oracledb.Connection | null = null;
      try {
        conn = await this.dbService.getConnection();
        const result: any = await conn.execute(
          `INSERT INTO PRODUCTOS (NOMBRE, DESCRIPCION, CATEGORIA, PRECIO, STOCK)
           VALUES (:nombre, :descripcion, :categoria, :precio, :stock)
           RETURNING ID, CREADO_EN INTO :out_id, :out_creado`,
          {
            nombre: createDto.nombre,
            descripcion: createDto.descripcion || '',
            categoria: createDto.categoria,
            precio: createDto.precio,
            stock: createDto.stock,
            out_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_creado: { dir: oracledb.BIND_OUT, type: oracledb.DATE },
          },
          { autoCommit: true },
        );

        const newId = result.outBinds.out_id[0];
        const fecha = result.outBinds.out_creado[0];

        return {
          id: newId,
          nombre: createDto.nombre,
          descripcion: createDto.descripcion || '',
          categoria: createDto.categoria,
          precio: createDto.precio,
          stock: createDto.stock,
          creadoEn: fecha ? new Date(fecha).toISOString() : new Date().toISOString(),
        };
      } catch (err: any) {
        this.logger.error('Error al insertar en Oracle, guardando en memoria:', err?.message);
      } finally {
        if (conn) await conn.close();
      }
    }

    // Modo memoria
    const nuevoProducto: Producto = {
      id: this.nextMemoryId++,
      nombre: createDto.nombre,
      descripcion: createDto.descripcion || '',
      categoria: createDto.categoria,
      precio: createDto.precio,
      stock: createDto.stock,
      creadoEn: new Date().toISOString(),
    };

    this.memoryProductos.push(nuevoProducto);
    return nuevoProducto;
  }

  async update(id: number, updateDto: UpdateProductoDto): Promise<Producto> {
    if (this.dbService.isConnected()) {
      let conn: oracledb.Connection | null = null;
      try {
        const actual = await this.findOne(id);
        const productoActualizado: Producto = {
          ...actual,
          nombre: updateDto.nombre !== undefined ? updateDto.nombre : actual.nombre,
          descripcion: updateDto.descripcion !== undefined ? updateDto.descripcion : actual.descripcion,
          categoria: updateDto.categoria !== undefined ? updateDto.categoria : actual.categoria,
          precio: updateDto.precio !== undefined ? updateDto.precio : actual.precio,
          stock: updateDto.stock !== undefined ? updateDto.stock : actual.stock,
        };

        conn = await this.dbService.getConnection();
        const result: any = await conn.execute(
          `UPDATE PRODUCTOS
           SET NOMBRE = :nombre, DESCRIPCION = :descripcion, CATEGORIA = :categoria, PRECIO = :precio, STOCK = :stock
           WHERE ID = :id`,
          {
            nombre: productoActualizado.nombre,
            descripcion: productoActualizado.descripcion,
            categoria: productoActualizado.categoria,
            precio: productoActualizado.precio,
            stock: productoActualizado.stock,
            id,
          },
          { autoCommit: true },
        );

        if (result.rowsAffected === 0) {
          throw new NotFoundException(`Bólido con ID ${id} no encontrado`);
        }

        return productoActualizado;
      } catch (err: any) {
        if (err instanceof NotFoundException) throw err;
        this.logger.error('Error al actualizar en Oracle, aplicando en memoria:', err?.message);
      } finally {
        if (conn) await conn.close();
      }
    }

    // Modo memoria
    const index = this.memoryProductos.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Bólido con ID ${id} no encontrado`);
    }

    const item = this.memoryProductos[index];
    this.memoryProductos[index] = {
      ...item,
      nombre: updateDto.nombre !== undefined ? updateDto.nombre : item.nombre,
      descripcion: updateDto.descripcion !== undefined ? updateDto.descripcion : item.descripcion,
      categoria: updateDto.categoria !== undefined ? updateDto.categoria : item.categoria,
      precio: updateDto.precio !== undefined ? updateDto.precio : item.precio,
      stock: updateDto.stock !== undefined ? updateDto.stock : item.stock,
    };

    return this.memoryProductos[index];
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    if (this.dbService.isConnected()) {
      let conn: oracledb.Connection | null = null;
      try {
        conn = await this.dbService.getConnection();
        const result: any = await conn.execute(
          `DELETE FROM PRODUCTOS WHERE ID = :id`,
          [id],
          { autoCommit: true },
        );

        if (result.rowsAffected === 0) {
          throw new NotFoundException(`Bólido con ID ${id} no encontrado`);
        }

        return { message: 'Bólido retirado de la parrilla de salida', id };
      } catch (err: any) {
        if (err instanceof NotFoundException) throw err;
        this.logger.error('Error al eliminar en Oracle, eliminando en memoria:', err?.message);
      } finally {
        if (conn) await conn.close();
      }
    }

    // Modo memoria
    const index = this.memoryProductos.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Bólido con ID ${id} no encontrado`);
    }

    this.memoryProductos.splice(index, 1);
    return { message: 'Bólido retirado de la parrilla de salida', id };
  }
}
